if (process.env.NODE_ENV !== "production") {
    const dotEnv = require("dotenv"); //Configure environmental variables
    const result = dotEnv.config();

    if (result.error) {
        throw result.error;
    }
}

const Slapp = require("slapp");
const ConvoStore = require('slapp/src/conversation_store/memory');

let slapp = new Slapp({
    client_id: process.env.SLACK_CLIENT_ID,
    signing_secret: process.env.SLACK_SIGNING_SECRET,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    convo_store: new ConvoStore(),
    log: true
});

module.exports = (app) => {
    slapp.attachToExpress(app, {event: true});
};
