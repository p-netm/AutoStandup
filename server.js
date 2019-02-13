const standUpService = require("./src/services/stand-ups");

if (process.env.NODE_ENV !== 'production') {
    const dotEnv = require('dotenv');//Configure environmental variables
    const result = dotEnv.config();

    if (result.error) {
        throw result.error
    }
}
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const appBootstrap = require("./src/main");
const onTimeService = require("./src/services/on-time");
const debug = require("debug")("onaautostandup:index");
const api = require('./src/routes/api');
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

appBootstrap.main();
//onTimeService.runSchedules();
standUpService.notifyBeforePostingStandup();

app.listen(process.env.PORT || 7777, function () {
    console.log("[+] app listening for requests")
});
