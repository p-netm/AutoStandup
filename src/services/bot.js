const kueConstant = require("../helper/kue-constants");
const kueService = require("./queue");
const standupService = require("./stand-ups");
const queue = kueService.queue();

module.exports = {
    handleSlackMessageEvent: handleSlackMessageEvent,
    processChatJob: processChatJob,
};

/**
 * Creates a new job  to be saved in redis
 * Attempts retries 5 times time spacing increases exponentially before backing off
 * @param payload request received from the endpoint
 */
function createMessageJob(payload) {
    queue.create(kueConstant.chatJobType, payload)
        .removeOnComplete(true)
        .attempts(5)
        .backoff({delay: 60 * 1000, type: kueConstant.exponential})
        .save();

}

function handleSlackMessageEvent(request) {
    let body = request.body;
    body.title = kueConstant.jobTitle;
    createMessageJob(body);
}

function processChatJob() {
    queue.process(kueConstant.chatJobType, kueConstant.numberOfConcurrentJobs, (job, done) => {
        interactWithUser(job, done);
    })
}

function interactWithUser(jobContent, done) {
    let {event} = jobContent.data;
    if (event.text.includes("bot")) {
        standupService.sendMessageToUser(event.user, `Hey <@${event.user}> Wassup!`);
    } else if (event.text.includes("hello")) {
        standupService.sendMessageToUser(event.user, `Hey boss! How is it going?`);
    }
    done();
}
