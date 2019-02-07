const crypto = require('crypto');
const timingSafeCompare = require('tsscmp');

let guard = {};
guard.isVerified = isVerified;
module.exports = guard;

function isVerified(request) {
    const signature = request.headers['x-slack-signature'];
    const timestamp = request.headers['x-slack-request-timestamp'];
    const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
    const [version, hash] = signature.split('=');

    // Check if the timestamp is too old
    const fiveMinutesAgo = ~~(Date.now() / 1000) - (60 * 5);
    if (timestamp < fiveMinutesAgo) return false;

    hmac.update(`${version}:${timestamp}:${request.rawBody}`);

    // check that the request signature matches expected value
    return timingSafeCompare(hmac.digest('hex'), hash);
}
