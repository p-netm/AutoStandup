const onTime = require("ontime");
const standUpService = require("../services/stand-ups");
/**
 * Prompt individuals for standup
 */
onTime({
    log: true,
    cycle: ['weekday 10:00:00'],
}, function (ot) {
    standUpService.promptIndividualStandup();
    ot.done();

});
/**
 * Notify individuals before postinf standup
 */
onTime({
    log: true,
    cycle: ['weekday 12:30:00'],
}, function (ot) {
    standUpService.notifyBeforePostingStandup();
    ot.done();

});
/**
 * Post team standups
 */
onTime({
    log: true,
    cycle: ['weekday 14:30:00'],
}, function (ot) {
    standUpService.postTeamStandupsToChannel();
    ot.done();

});