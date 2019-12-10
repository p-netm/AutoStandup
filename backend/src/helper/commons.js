const constants = require("../helper/constants");

module.exports = {
    pickRandomPromptMsg: pickRandomPromptMsg,
    pickRandomReminderMsg: pickRandomReminderMsg,
    pickRandomResponse: pickRandomResponse
};

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