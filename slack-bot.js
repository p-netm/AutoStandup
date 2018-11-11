const SlackBot = require('slackbots');
const axios = require('axios');


const bot = new SlackBot({
    token: 'xoxb-475049069953-477590829175-N4HH7PICuYfbPEYri0kKTm9R',
    name: 'autostandup',
});


module.exports = bot