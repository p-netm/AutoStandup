const onTime = require("ontime");
const standUpService = require("../services/stand-ups");
/**
 * Prompt individuals for standup
 */
let service = {};
service.runSchedules =runSchedules;
module.exports = service;

function runSchedules() {
    scheduleIndividualPrompt();
    scheduleNotifier();
    schedulePostingTeamStandup();
}

function scheduleIndividualPrompt() {
    onTime({
        log: true,
        cycle: ['weekday 10:30:00'],
    }, function (ot) {
        standUpService.promptIndividualStandup();
        ot.done();

    });
}
/**
 * Notify individuals before postinf standup
 */
function scheduleNotifier() {
    onTime({
        log: true,
        cycle: ['weekday 12:30:00'],
    }, function (ot) {
        standUpService.notifyBeforePostingStandup();
        ot.done();

    });
}
/**
 * Post team standups
 */
function schedulePostingTeamStandup() {
    onTime({
        log: true,
        cycle: ['weekday 14:30:00'],
    }, function (ot) {
        standUpService.postTeamStandupsToChannel();
        ot.done();

    });
}