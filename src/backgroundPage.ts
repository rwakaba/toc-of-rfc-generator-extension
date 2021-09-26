import { browser } from "webextension-polyfill-ts";

// Listen for messages sent from other parts of the extension
browser.runtime.onMessage.addListener((request: { popupMounted: boolean }) => {
    // Log statement if request.popupMounted is true
    // NOTE: this request is sent in `popup/component.tsx`
    if (request.popupMounted) {
        console.log("backgroundPage notified that Popup.tsx has mounted.");
    }
});

console.log('test')
// https://developer.chrome.com/docs/extensions/reference/declarativeContent/
const rule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'datatracker.ietf.org' }
        }),
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'openid.net' }
        })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
};
console.log({ declarativeContent: chrome.declarativeContent })
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([rule]);
        console.log('test2')
    });
});