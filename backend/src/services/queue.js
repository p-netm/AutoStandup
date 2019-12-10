const kue = require("kue");
const kueConstant = require("../helper/kue-constants");
const queue = function () {
    return kue.createQueue({
        redis: {
            host: kueConstant.localhost,
            port: kueConstant.port
        }
    });
};
module.exports = {
    queue: queue
};