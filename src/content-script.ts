import { browser } from "webextension-polyfill-ts";

import { ATagInfo, Section } from "@src/types"

const currentPage: string = location.href.split('#')[0]
if (currentPage.includes('datatracker.ietf.org/doc/html')) {
    const atagInfos: ATagInfo[] = []
    var h1: NodeListOf<Element> = document.querySelectorAll("span.h1");
    var nodes: NodeListOf<Element> = document.querySelectorAll("a.selflink");
    const title = h1[0].textContent
    nodes.forEach((v: Element) => {
        const id = v.id.split('-')
        const parentNode = v.parentNode
        const href = currentPage + v.getAttribute('href')
        atagInfos.push({ id: v.id, parentTitle: parentNode?.textContent, href})
    })

    // console.log(location.href)
    browser.runtime.sendMessage({ command: "parse_done", title, atagInfos })
} else if (currentPage.includes('openid.net/specs/')) {
    const atagInfos: ATagInfo[] = []
    var h1: NodeListOf<Element> = document.querySelectorAll("h1");
    var nodes: NodeListOf<Element> = document.querySelectorAll("a[name^='rfc.section']");
    const title = h1[0].textContent
    nodes.forEach(node => {
        const name = node.getAttribute('name')
        const next = node.nextElementSibling
        const text = next?.textContent
        const href = `${currentPage}#${name}`
        const id = name?.replace('rfc.section.', 'section-')!

        atagInfos.push({ id, parentTitle: text, href})
    })
    browser.runtime.sendMessage({ command: "parse_done", title, atagInfos })
}
