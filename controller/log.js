let prefix = ""

console.log = (() => {

    const orig = console.log
    return function() {
        const time = new Date().toLocaleString("en-AT", { timeZone: "Europe/Vienna" })

        let tmp
        try {
            tmp = process.stdout
            process.stdout = process.stderr

            if (typeof arguments[0] === "object") arguments[0] = JSON.stringify(arguments[0], null, 2)

            arguments[0] = `[${prefix}${time}] ${arguments[0]}`
            orig.apply(console, arguments);
        } finally {
            process.stdout = tmp;
        }
    };
})();

module.exports = {
    init : (thePrefix, useInstanced) => {
        let prefixes = []
        if (thePrefix) prefixes.push(thePrefix)

        if (useInstanced) {
            const instanceId = require("crypto").randomBytes(64).toString('hex')
            const instanceIdShortend = instanceId.substring(0, 4)

            console.log(`InstanceId:${instanceIdShortend} Full:${instanceId}`)

            prefixes.push(instanceIdShortend)
        }

        if (prefixes.length > 0) {
            prefix = prefixes.join('|') + '|'
        }
    }
}
