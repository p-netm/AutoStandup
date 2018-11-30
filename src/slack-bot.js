const axios = require('axios');

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
    "*Hey*, submit your daily standup.\ntype  *`/autostandup today`* to get started for help type *`/autostandup help`*",
    "*Hi*, another day to submit your standup.\ntype  *`/autostandup today`* to get started for help type *`/autostandup help`*",
    "*Hey*, time for standup update.\ntype  *`/autostandup today`* to get started for help type *`/autostandup help`*",
    "*Greetings!*, please submit your daily standup.\ntype  *`/autostandup today`* to get started for help type *`/autostandup help`*")

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

    notifyBeforePostingStandup() {
        this.getChannelMembers().then((res) => {
            let allChannelUsers = res.members
            allChannelUsers.forEach(user => {
                this.sendMessageToUser(user, ">>>`Notification` *<@" + user + ">* today's standup  will be posted in *30 minutes* time. 🐵")
            })
        })
    }

    postStandupsToChannel() {
        this.getTeams().then((res) => {
            let teams = res
            teams.forEach((t) => {
                if (t !== null) {
                    console.log(t.team)
                }
            })
        })
    }

    saveStandup(standupDetails) {
        AppBootstrap.userStandupRepo.add(standupDetails)
    }
    getTeams() {
        return AppBootstrap.userStandupRepo.getAllTeams()
            .then((res) => {
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

    getStandups() {
        var standupUpdate = `*📅 Showing Ona Standup Updates On ${today}*\n\n\n\n`
        AppBootstrap.userStandupRepo.getByDatePosted(today)
            .then((standups) => {
                if (standups.length > 0) {
                    Promise.all(standups.map((standup) => {
                        var teamName = standup.team
                        if (teamName != null)
                            teamName = teamName.charAt(0).toUpperCase() + teamName.slice(1)
                        var standupFor = standup.standup_for
                        standupFor = standupFor.charAt(0).toUpperCase() + standupFor.slice(1)
                        standupUpdate += `*<@${standup.username}> ${teamName !== null ? teamName : ""} - ${standupFor}:*\n\n`
                        standupUpdate += `\`\`\`${standup.standup}\`\`\`\n\n\n`

                    }))
                    web.conversations.list({ exclude_archived: true, types: "public_channel" })
                        .then((res) => {
                            const channels = res.channels
                            channels.forEach(channel => {
                                if (channel.name === channelName) {
                                    web.chat.postMessage({ text: standupUpdate, channel: channel.id })
                                }
                            });
                        })

                }
            })
    }

    respondToMessages() {

    }

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