const Q = require('q');
const AutoStandUp = require("../routes/slack");
const slackBot = new AutoStandUp();
const botResponse = ["Got it! Thanks", "Awesome!",
    "Cool. Will get it posted.", "Great!", "Thank you!", "Thanks!", "You are awesome", "Yes!",
    "Just doing my job", "Okay!", "Alright!", "Nice, thanks"];

let service = {};
service.newDialog = newDialog;
service.getDialog = getDialog;
module.exports = service;

function pickRandomResponse() {
    let pos = Math.floor(Math.random() * (botResponse.length));
    return botResponse[pos]
}

function sendConfirmation(userId) {
    slackBot.sendMessageToUser(userId, pickRandomResponse())
}

/**
 * @desc Create a new stand-up dialog
 * @param body
 */
function newDialog(body) {
    let deferred = Q.defer();
    let standupDetails = {
        username: body.user.id,
        standup_today: body.submission.standup_today,
        team: body.submission.team,
        standup_previous: body.submission.standup_previous,
        date_posted: body.state
    };
    deferred.resolve();

    if (standupDetails.team === "None") {
        slackBot.postIndividualStandupToChannel(standupDetails);
        standupDetails.status = 1;
        slackBot.saveStandup(standupDetails)
    } else {
        standupDetails.status = 0;
        slackBot.saveStandup(standupDetails)
    }

    sendConfirmation(body.user.id)
}

/**
 * @desc Gets the dialog
 */
function getDialog() {
    let deferred = Q.defer();
    deferred.resolve("Cool! Everything works for dialog! Congratulations!!")
}