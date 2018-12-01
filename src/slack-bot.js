
if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv')//Configure environmental variables 
    const result = dotenv.config()

    if (result.error) {
        throw result.error
    }
}
const AppBootstrap = require("./main")
const channelName = "standups"
const moment = require("moment")
const today = moment().format("Do MMMM YYYY")
const token = process.env.SLACK_ACCESS_TOKEN

const { RTMClient, WebClient, ErrorCode } = require("@slack/client")
const rtm = new RTMClient(token)
const web = new WebClient(token)
rtm.start()

const promptResponse = new Array(
    "Hey, submit your daily standup.\ntype  *`/autostandup`* to get started for help type *`/autostandup help`*",
    "Hi, another day to submit your standup.\ntype  *`/autostandup`* to get started for help type *`/autostandup help`*",
    "Hey, time for standup update.\ntype  *`/autostandup`* to get started for help type *`/autostandup help`*",
    "Greetings!, please submit your daily standup.\ntype  *`/autostandup`* to get started for help type *`/autostandup help`*")

function pickRandomPromptMsg() {
    var pos = Math.floor(Math.random() * (promptResponse.length - 0) + 0)
    return promptResponse[pos]
}

class AutoStandup {

    /***
     *  Get conversation id for user with id [userId]
     *  Post message to the user
     */
    sendMessageToUser(userId, message) {
        web.conversations.list({ exclude_archived: true, types: "im" })
            .then((res) => {
                const foundUser = res.channels.find(u => u.user === userId);
                if (foundUser) {
                    rtm.sendMessage(message, foundUser.id)
                        .then((msg) => console.log(`Message sent to user ${foundUser.user} with ts:${msg.ts}`))
                        .catch(console.error);
                } else {
                    console.log('User doesnt exist or is the bot user!');
                }
            });

    }

    /***
     * Saves standup to db
     */
    saveStandup(standupDetails) {
        AppBootstrap.userStandupRepo.add(standupDetails)
    }


    /**
     * Find channel that the bot belongs to and return the members 
     */
    getChannelMembers() {
        const resp = {}
        return web.channels.list()
            .then((res) => {
                const channel = res.channels.find(c => c.is_member);
                if (channel) {
                    resp.ok = true
                    resp.members = channel.members

                } else {
                    resp.ok = false
                    resp.members = []
                }
                return Promise.resolve(resp)
            })
            .catch((error) => {
                if (error.code === ErrorCode.PlatformError) {
                    console.log(error.message)
                    console.log(error.data)
                } else {
                    console.error
                }
                return Promise.reject(error)
            });
    }

    /**
     * Get users then prompt them for standups 
    */
    promptIndividualStandup() {
        this.getChannelMembers().then((res) => {
            let allChannelUsers = res.members
            allChannelUsers.forEach(user => {
                this.sendMessageToUser(user, pickRandomPromptMsg())
            })
        })

    }

    /**
     * Notify users 30 minutes before posting standup on channel
     */
    notifyBeforePostingStandup() {
        this.getChannelMembers().then((res) => {
            let allChannelUsers = res.members
            allChannelUsers.forEach(user => {
                this.sendMessageToUser(user, ">>>`Notification` *<@" + user + ">* today's team standup  will be posted in *2hrs * time submit  yours if have not done so. 🐵")
            })
        })
    }

    /**
     * Post formatted standups to channel
     */
    postTeamStandupsToChannel() {    
        let standupUpdate = `*📅 Showing Ona Standup Updates On ${today}*\n\n`       
        AppBootstrap.userStandupRepo.getByDatePosted(today)
            .then((data) => {
                let attachments = []

                data.forEach((item, index) => {
                    let attachment =
                    {
                        color: "#cfcfcc",
                        title: `<@${item.username}>`,
                        fallback: "Sorry Could not display standups in this type of device. Check in desktop browser",
                        fields: [
                            {
                                title: "Today",
                                value: `${item.standup_today}`,
                                short: false
                            }

                        ],
                        footer: `Posted as ${item.team}`,
                    }
                    if (item.standup_previous != null) {
                        const previously = {
                            title: "Yesterday/Previously",
                            value: `${item.standup_previous == null ? "Not specified" : item.standup_previous}`,
                            short: false
                        }
                        attachment.fields.push(previously)
                    }
                    if (index === 0) {
                        attachment.pretext = `Team ${item.team} Standups`
                        attachment.color =  "#7DCC34"
                    }
                    if (index > 0) {
                        if (item.team != data[index - 1].team) {
                            attachment.pretext = `Team ${item.team} Standups`
                            attachment.color =  "#7DCC34"
                        }
                    }
                    attachments.push(attachment)

                })
                return Promise.resolve(attachments)

            })
            .then((allAttachments) => {
                console.log("Total attachments  => %d", allAttachments.length)
                web.channels.list()
                    .then((res) => {
                        const channel = res.channels.find(c => c.is_member);
                        if (channel) {
                            web.chat.postMessage({ text: standupUpdate, attachments: allAttachments, channel: channel.id })
                                .then((msg) => console.log(`Message sent to channel ${channel.name} with ts:${msg.ts}`))
                                .catch(console.error);
                        } else {
                            console.log('This bot does not belong to any channel, invite it to at least one and try again');
                        }
                    })
            })


    }

    postIndividualStandupToChannel(item) {

        let standupUpdate = `🔔 \`Update\` *New standup update posted ${today}*\n\n`
        let attachment =
        {
            color: "#2768BB",
            title: `<@${item.username}>`,
            fallback: "Sorry Could not display standups in this type of device. Check in desktop browser",
            fields: [
                {
                    title: "Today",
                    value: `${item.standup_today}`,
                    short: false
                }

            ],
            footer: `Posted as individual`,
        }
        if (item.standup_previous != null) {
            const previously = {
                title: "Yesterday/Previously",
                value: `${item.standup_previous == null ? "Not specified" : item.standup_previous}`,
                short: false
            }
            attachment.fields.push(previously)
        }

        let attachments = []
        attachments.push(attachment)
        web.channels.list()
            .then((res) => {
                const channel = res.channels.find(c => c.is_member);
                if (channel) {
                    web.chat.postMessage({ text: standupUpdate, attachments: attachments, channel: channel.id })
                        .then((msg) => console.log(`Message sent to channel ${channel.name} with ts:${msg.ts}`))
                        .catch(console.error);
                } else {
                    console.log('This bot does not belong to any channel, invite it to at least one and try again');
                }
            })

    }


    /**
     * Interact with users v
     */
    respondToMessages() {

    }

    /**
     * 
     * @param {trigerId used to load form} triggerId 
     * @param {dialog elements} dialog 
     */
    openDialog(triggerId, dialog) {
        return web.dialog.open({ trigger_id: triggerId, dialog: JSON.stringify(dialog) })
            .then((res) => {
                console.log('Open dialog res: %o ', res);
                return Promise.resolve(res)

            })
            .catch((error) => {
                if (error.code === ErrorCode.PlatformError) {
                    console.log(error.message)
                    console.log(error.data)
                } else {
                    console.error
                }
                return Promise.reject(error)
            })
    }

}

module.exports = AutoStandup 