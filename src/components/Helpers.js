export async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
export const hashFnv32a = (str) => {
    var i, l, hval = 0x811c9dc5;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
}
export const ExtractMessage = (msg) => {
    /*
    try {
        var split = msg.split('-message:', 2);
        if (split.length > 1)
            return split[1];
    } catch (err) {
        console.error(err);
    }*/

    return msg;
}

export const IsConsentRecepit = (data) => {
    try {
        var match = data.match(/(.*).cr.jwt/);
        if (match.length === 2) {
            return true;
        } else {
            console.log("not an Consent receipt");
        }
    } catch (err) {
        console.error(err);
    }
    return false;
}