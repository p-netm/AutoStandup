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
        bot.postMessageToChannel(channelName, "@here Please submit your standups", params)
            .fail(function (data) {
                console.error("[!Post to Channel] Error occured")
                console.error(data.error)
                return
            })
        console.log("[+] Prompted channel for standup")
    }
    saveStandup(standupDetails) {
        AppBootstrap.userStandupRepo.add(standupDetails)
    }
}

module.exports = AutoStandup 