if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv')//Configure environmental variables 
    const result = dotenv.config()

    if (result.error) {
        throw result.error
    }
}
const Slackbot = require('slackbots');
const AppBootstrap = require("./main")
const channelName = "standups"
const moment = require("moment")
const today = moment().format("Do MMMM YYYY")

const params = {
    icon: process.env.APP_NAME
}


const bot = new Slackbot({
    token: process.env.SLACK_ACCESS_TOKEN,
    name: process.env.APP_NAME,
});

class AutoStandup {

    constructor() {
        if (bot === undefined) {
            this.initBot()
        }
    }

    initBot() {
        bot.on('start', function () {
            console.log("[+] Interaction with Bot initiated")          
        })       
    }

    sendMessageToUser(user, msg) {
        bot.postMessageToUser(user, msg, params)
            .fail(function (data) {
                console.error("[!Post to User] Error occured")
                console.error(data.error)
                return
            })
        console.log("[+] Posted message to @" + user)
    }

    promptStandupOnChannel() {
        bot.postMessageToChannel(channelName, "<@here> Please submit your standups", params)
            .fail(function (data) {
                console.error("[!Post to Channel] Error occured")
                console.error(data.error)
                return
            })
        console.log("[+] Prompted channel for standup")
    }

    postStandupsToChannel() {
        this.getStandups()
    }
    saveStandup(standupDetails) {
        AppBootstrap.userStandupRepo.add(standupDetails)
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
                    bot.postMessageToChannel(channelName, standupUpdate, params)
                        .fail(function (data) {
                            console.error("[!Post to Channel] Error occured")
                            console.error(data.error)
                            return
                        })
                    console.log("[+] Prompted channel for standup")
                }
            })
    }
    respondToMessages(){
        
    }

}

module.exports = AutoStandup 