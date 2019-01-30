if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv');//Configure environmental variables
    const result = dotenv.config();

    if (result.error) {
        throw result.error
    }
}
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const AutoStandup = require("./src/routes/slack");
const AppBootstrap = require("./src/main");
const onTime = require("ontime");
const debug = require("debug")("onaautostandup:index");
const api = require('./src/routes/api');
const autoStandUp = new AutoStandup();
const app = express();

const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
};

app.use(cors());
app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

// Error handling middleware
app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500).send({ error: err.message });
    debug("App Error description: " + err)
});

app.use(process.env.APP_API_BASE, api);
app.get('/', (req, res) => {
    res.send('<h2>AutoStandup app is up and running</h2> <p>Login to your' +
        ' slack account and start submitting standups.</p>');
});
AppBootstrap.main();

/**
 * Prompt individuals for standup
 */
onTime({
    log: true,
    cycle: ['weekday 10:00:00'],
}, function (ot) {
    autoStandUp.promptIndividualStandup();
    ot.done();

});
/**
 * Notify individuals before postinf standup
 */
onTime({
    log: true,
    cycle: ['weekday 12:30:00'],
}, function (ot) {
    autoStandUp.notifyBeforePostingStandup();
    ot.done();

});
/**
 * Post team standups
 */
onTime({
    log: true,
    cycle: ['weekday 14:30:00'],
}, function (ot) {
    autoStandUp.postTeamStandupsToChannel();
    ot.done();

});

app.listen(process.env.PORT || 7777, function () {
    console.log("[+] app listening for requests")
});
