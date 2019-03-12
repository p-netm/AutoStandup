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
const debug = require("debug")("onaautostandup:index");
const api = require('./src/routes/api');
const kue = require("kue");
const kueUiExpress = require('kue-ui-express');

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

app.listen(process.env.PORT || 8008, function () {
    console.log("[+] app listening for requests")
});

/**
 * Configure and mount kue express dashboard {@link https://github.com/stonecircle/kue-ui-express }
 */
kueUiExpress(app, '/kue/', '/kue-api/');

app.use('/kue-api/', kue.app);

kue.app.listen(8007);
