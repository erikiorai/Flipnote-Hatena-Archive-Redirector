// background.js (Service Worker)

function encode_base32_custom(data_bytes) {
    const alphabet = "cwmfjordvegbalksnthpyxquiz012345"
    let bits = Array.from(data_bytes).map(byte => byte.toString(2).padStart(8, '0')).join('');
    while (bits.length % 5 !== 0) {
        bits += '0';
    }
    let result = '';
    for (let i = 0; i < bits.length; i += 5) {
        result += alphabet[parseInt(bits.slice(i, i + 5), 2)];
    }
    return result;
}

function convert2kwz(flipnotename, fsid) {
    const prefix_byte = 0x14
    // Convert fsid from hex string to byte array
    const fsid_bytes = [];
    // Read the first character of fsid
    const firstChar = fsid.charAt(0);
    // This encoding works for European FSID
    if (firstChar === '9') {
        for (let i = 0; i < fsid.length; i += 2) {
            fsid_bytes.push(parseInt(fsid.substr(i, 2), 16));
        }
    }
    // Reverse the byte array
    const reversed_fsid = fsid_bytes.slice().reverse();

    // Wrap with prefix + trailing zero byte
    const full_fsid = [prefix_byte, ...reversed_fsid];

    const encoded_fsid = encode_base32_custom(full_fsid).slice(0, 14);

    console.debug(`Encoded FSID: ${encoded_fsid}`);
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
        const kwzname = convert2kwz(flipnotename, fsid)
        const newFlipnoteUrl = `https://archive.sudomemo.net/${kwzname}`
        // redirect to user profile temporeraly
        const newProfileUrl = `https://archive.sudomemo.net/user/${fsid}@DSi`
        return { redirectUrl: newProfileUrl }
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
