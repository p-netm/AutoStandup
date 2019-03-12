const kueConstant = require("../helper/kue-constants");
const kueService = require("./queue");
const queue = kueService.queue();
let service = {};
service.handleSlackMessageEvent = handleSlackMessageEvent;
service.createMessageJob = createMessageJob;
module.exports = service;

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