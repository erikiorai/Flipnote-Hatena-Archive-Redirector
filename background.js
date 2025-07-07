// background.js (Service Worker)

// Dummy conversion function
function convert2kwz(flipnotename) {
    // idk how this conversion works so return the old name for now
    return flipnotename
}
function redirectToFlipnoteArchive(details) {
    const url = new URL(details.url)
    const path = url.pathname
    // TODO for future version 
    // Match /<fsid>@DSi/movie/<flipnotename>
    const movie = path.match(/^\/([^\/@]+)@DSi\/movie\/([^\/\?]+)(?:\/)?$/)
    if (movie) {
        const fsid = movie[1]
        const flipnotename = movie[2]
        const kwzname = convert2kwz(flipnotename)
        const newFlipnoteUrl = `https://archive.sudomemo.net/${kwzname}`
        // redirect to user profile temporeraly
        const newProfileUrl = `https://archive.sudomemo.net/user/${fsid}@DSi`
        return { redirectUrl: newFlipnoteUrl }
    }

    // Match /<fsid>@DSi
    const flipnoteProfile = path.match(/^\/([^\/@]+)@DSi$/)
    if (flipnoteProfile) {
        const fsid = flipnoteProfile[1]
        const newProfileUrl = `https://archive.sudomemo.net/user/${fsid}@DSi`
        return { redirectUrl: newProfileUrl };
    }

    // No redirect
    return {};
}

// Register the listener for both Chrome and Firefox
const webRequest = (typeof browser !== "undefined" && browser.webRequest) ? browser.webRequest : (typeof chrome !== "undefined" && chrome.webRequest) ? chrome.webRequest : null;

if (webRequest) {
    webRequest.onBeforeRequest.addListener(
        redirectToFlipnoteArchive,
        {
            urls: [
                "http://flipnote.hatena.com/*",
                "http://ugomemo.hatena.ne.jp/*"
            ],
            types: ["main_frame"]
        },
        ["blocking"]
    );
}