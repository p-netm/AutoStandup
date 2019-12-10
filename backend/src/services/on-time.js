const onTime = require("ontime");
const standUpService = require("../services/stand-ups");

module.exports = {
    runSchedules: runSchedules
};

function runSchedules() {
    scheduleIndividualPrompt();
    scheduleNotifier();
    schedulePostingTeamStandup();
    scheduleRefreshChannelMembers();
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
 * Notify individuals before posting standup
 */
function scheduleNotifier() {
    //first notification for late submitters at 1230hrs
    onTime({
        log: true,
        cycle: ['weekday 12:30:00'],
    }, function (ot) {
        standUpService.notifyBeforePostingStandup();
        ot.done();

    });

    //second notification for later submitters at 1430hrs
    onTime({
        log: true,
        cycle: ['weekday 14:30:00'],
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
        cycle: ['weekday 17:00:00'],
    }, function (ot) {
        standUpService.postTeamStandupsToChannel();
        ot.done();

    });
}

/**
 * Refresh  channel members monthly
 * The channel members table will be flushed on first of every month
 */
function scheduleRefreshChannelMembers() {
    onTime({
        log: true,
        cycle: ['1T12:00:00'],
    }, function (ot) {
        standUpService.refreshChannelMembers(false);
        ot.done();

    });
}
