const Slackbot = require('slackbots');
const AppBootstrap = require("./main")
const channelName = "standups"

const params = {
    icon: 'autostandup'
}
const bot = new Slackbot({
    token: 'xoxb-475049069953-477590829175-N4HH7PICuYfbPEYri0kKTm9R',
    name: 'autostandup',
});

class AutoStandup {

    constructor() {
        this.initBot()
    }

    initBot() {
        bot.on('start', function () {
            console.log("[+] Interaction with Bot initiated")
        })
    }
    /**
     * First check users in local repository if not get users from slack 
     * Send message to users at the specified time and post to standup channel as well
    */
    getUsers() {
        AppBootstrap.userRepo.getAllUsers()
    }

    promptUserStandup(user) {
        bot.postMessageToUser(user, "Hey, kindly submit your standups", params)
            .fail(function (data) {
                console.error("[!Post to User] Error occured")
                console.error(data.error)
                return
            })
        console.log("[+] Prompted user " + user + " for standup")
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
}

module.exports = AutoStandup