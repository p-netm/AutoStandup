const kue = require("kue");
const kueConstant = require("../helper/kue-constants");
let queue = function () {
    return kue.createQueue({
        redis: {
            host: kueConstant.localhost,
            port: kueConstant.port
        }
    });
};
module.exports = {queue: queue};