const SlackBot = require('slackbots');
const axios = require('axios');


const bot = new SlackBot({
    token: 'xoxb-475049069953-477590829175-N4HH7PICuYfbPEYri0kKTm9R',
    name: 'auto_standup',
});

// Start Handler
bot.on('start', function () {
    const params = {
        icon: 'autostandup'
    }

    bot.postMessageToChannel(
        'standups', 
        'post what you are working on today',
         params
    );
    bot.on('error', (err) => console.log(err));

    //message handler
    bot.on('message', data => {
        if (data.type !== 'message'){
            return
        }
        console.log(data);
    })

});