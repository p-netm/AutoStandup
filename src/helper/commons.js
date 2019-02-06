const constants = require("../helper/constants");

let commons = {};
commons.pickRandomPromptMsg = pickRandomPromptMsg;
commons.pickRandomReminderMsg = pickRandomReminderMsg;
commons.pickRandomResponse = pickRandomResponse;
module.exports = commons;

function pickRandomPromptMsg() {
    let pos = Math.floor(Math.random() * (constants.promptResponse.length));
    return constants.promptResponse[pos];
}

function pickRandomReminderMsg() {
    let pos = Math.floor(Math.random() * (constants.reminderResponse.length));
    return constants.reminderResponse[pos];
}

function pickRandomResponse() {
    let pos = Math.floor(Math.random() * (constants.botResponse.length));
    return constants.botResponse[pos]
}