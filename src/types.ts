export type Section = {
    part: string;
    title: string;
    href: string;
    parent?: Section;
    next?: Section;
    children: Section[];
}

export type ATagInfo = {
    id: string;
    parentTitle: string | null | undefined;
    href: string;
}