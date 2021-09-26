import React, { FunctionComponent } from "react";
import { browser, Tabs } from "webextension-polyfill-ts";
import { TreeView, TreeItem } from '@material-ui/lab';
import { ExpandMore, ChevronRight } from '@material-ui/icons';

import "./styles.scss";
import { Section } from "@src/types"
import { parse } from "@src/parseSection"

export const Popup: FunctionComponent = () => {
    const [title, setTitle] = React.useState<string>()
    const [sections, setSections] = React.useState<Section[]>()
    // Sends the `popupMounted` event
    React.useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
        console.log('listen')
        browser.runtime.onMessage.addListener((message) => {
            console.log('notifed', message)
            if (message.command === "parse_done") {
                const { title, atagInfos } = message
                setTitle(title)
                setSections(parse(atagInfos))
            }
        });
        browser.tabs.executeScript({ file: "js/content_script.js" })
    }, []);

    const executeScript = (href: string): void => {
        // Query for the active tab in the current window
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then((tabs: Tabs.Tab[]) => {
                // Pulls current tab from browser.tabs.query response
                const currentTab: Tabs.Tab | undefined = tabs[0];

                // Short circuits function execution is current tab isn't found
                if (!currentTab) {
                    return;
                }

                // Executes the script in the current tab
                const code = `location.href = "${href}"`
                console.log(code)
                browser.tabs
                    .executeScript(currentTab.id, {
                        code,
                    })
                    .then(() => {
                        console.log("Done Scrolling");
                    });
            });
    }
    const nodeId = (sectoin: Section): string => {
        if (sectoin.parent) {
            return nodeId(sectoin.parent) + '-' + sectoin.part
        } else {
            return sectoin.part
        }
    }
    const sectionToTreeItem = (section: Section) => {
        if (section.children.length) {
            return (
                <TreeItem nodeId={nodeId(section)} label={section.title} key={nodeId(section)}>
                    {section.children.map(child => (sectionToTreeItem(child)))}
                </TreeItem>)
        } else {
            return (<TreeItem nodeId={nodeId(section)} label={section.title} onClick={() => executeScript(section.href)} key={nodeId(section)} />)
        }
    }
    return (
        <div className="popup-container">
            <div className="title">{title}</div>
            <div className="container mx-4 my-4">
                <TreeView
                    aria-label="file system navigator"
                    defaultCollapseIcon={<ExpandMore />}
                    defaultExpandIcon={<ChevronRight />}
                    sx={{ height: 300, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                >
                    {sections && sections.map(section => {
                        return (
                            sectionToTreeItem(section)
                        )
                    })}
                </TreeView>
            </div>
        </div>
    );
};
