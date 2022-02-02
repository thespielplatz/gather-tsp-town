const axios = require('axios')
const cron = require('node-cron');
const urlLastBlocks = "https://blockstream.info/api/blocks/tip/height";

const REPLY_MENU = `Hello #name# 👋

you can whisper me the following commands:

/blocktime
/givemeyourprivatekey
/telegramfil {message}
/fireworks
`

// Register for ring before meetings
//                     gather.game.ring(data.playerChats.senderId)

class Bot {
    constructor(gather, db) {
        const self = this

        this.gather = gather
        this.db = db

        gather.game.subscribeToEvent("playerChats", (data, context) => {
            if (data.playerChats.senderId == process.env.BOT_ID) return
            console.log(data)

            // Answer nearby players
            if (data.playerChats.recipient == 'LOCAL_CHAT') {
                gather.game.chat(data.playerChats.senderId, [], "", REPLY_MENU.replace('#name#', data.playerChats.senderName));
                return
            }

            if (data.playerChats.messageType !== "DM") return

            if (data.playerChats.contents.startsWith('/telegramfil ')) {
                const text = data.playerChats.contents.substr(13)
                const config = {
                    method: 'post',
                    url: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data : JSON.stringify({"chat_id": process.env.TELEGRAM_CHAT_ID,"text": `[TSP Bar Bot] ${text}`})
                }
                axios(config)
                return
            }

            switch (data.playerChats.contents) {
                case '/fireworks':
                    gather.game.shootConfetti(process.env.BOT_ID)
                    break

                case '/givemeyourprivatekey':
                    gather.game.chat("GLOBAL_CHAT", [], "", `Help me! ${data.playerChats.senderName} wants my private key`)
                    gather.game.setEmote(3, process.env.BOT_ID)
                    setTimeout(() => { gather.game.setEmote(0, process.env.BOT_ID) }, 2000)
                    break

                case '/blocktime':
                    axios.get(urlLastBlocks).then(result => {
                        const blocktime = result.data
                        gather.game.chat(data.playerChats.senderId, [], "", `Current Block: ${blocktime}`)
                    })
                    break

                default:
                    gather.game.chat(data.playerChats.senderId, [], "", REPLY_MENU.replace('#name#', data.playerChats.senderName));
                    break
            }

            // Times
            cron.schedule('40 11 * * 2-4', () => {
                gather.game.chat("GLOBAL_CHAT", [], "", `ℹ️ Daily starts in 5 min`)
            },{ scheduled: true, timezone: "Europe/Vienna" });

            cron.schedule('55 09 * * 1', () => {
                gather.game.chat("GLOBAL_CHAT", [], "", `ℹ️ Allg. Koordination starts in 5 min`)
            },{ scheduled: true, timezone: "Europe/Vienna" });

            cron.schedule('55 09 * * 1', () => {
                gather.game.chat("GLOBAL_CHAT", [], "", `ℹ️ Sprint Review starts in 5 min`)
            },{ scheduled: true, timezone: "Europe/Vienna" });

            cron.schedule('00 16 * * 1', () => {
                gather.game.chat("GLOBAL_CHAT", [], "", `🎉 FEIERABEND 🎉 `)
                gather.game.chat("GLOBAL_CHAT", [], "", `Free satoshis for everyone!`)
            },{ scheduled: true, timezone: "Europe/Vienna" });
        });
    }

    start() {
        this.gather.game.enter(process.env.GATHER_SPACE_ID)
    }
}

module.exports = Bot
