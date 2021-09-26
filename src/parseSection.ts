import { ATagInfo, Section } from "@src/types"


const getChild = (section: Section, path: string[]): Section | undefined => {
    if (path.length === 1) {
        return section.children.find(child => child.part === path[0])
    } else {
        const child = section.children.find(child => child.part === path[0])
        return getChild(child!, path.slice(1)) // 1.1.2.1 -> 1.2.1 -> 2.1 -> 1
    }
}
const pushNode = (ownPart: string, title: string, href: string, sectionMap: Map<string, Section>, parentPath?: string[]) => {
    if (!parentPath) {
        sectionMap.set(ownPart, {
            part: ownPart,
            title,
            href,
            children: []
        })
    } else {
        const top = sectionMap.get(parentPath[0])
        const parent = 1 < parentPath.length ? getChild(top!, parentPath.slice(1)) : top
        const own = {
                part: ownPart,
                title: title,
                href,
                parent,
                children: []
        }
        const children = parent?.children
        if (children?.length) {
            children[children.length - 1].next = own
        }
        parent?.children.push(own)
    }
    return
}

export const parse = (nodes: ATagInfo[]) => {
    const sectionMap = new Map<string, Section>()
    nodes.forEach((v: ATagInfo) => {
        const {id, parentTitle, href} = v
        const idValue = id.split('-')
        const value = idValue[1]
        if (value.includes('.')) {
            let parentPart = ''
            const parentPath: string[] = []
            const parts = value.split('.')
            parts.forEach((p, idx) => {
                if (idx === parts.length - 1) {
                    pushNode(p, parentTitle!, href!, sectionMap, parentPath)
                }
                parentPart = p
                parentPath.push(p)
            })
        } else {
            pushNode(value, parentTitle!, href!, sectionMap)
        }
    })
    const keys: string[] = []
    const sections: Section[] = []
    sectionMap?.forEach((value: Section, key: string) => {
        keys.push(key)
    })
    // keys.sort()
    keys?.forEach((key: string) => {
        sections.push(sectionMap.get(key)!)
    })
    return sections
}