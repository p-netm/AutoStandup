if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv')//Configure environmental variables 
    const result = dotenv.config()

    if (result.error) {
        throw result.error
    }
}
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const SlashCommandRouter = require("./api_routes/slash-command-route.js")
const DialogRouter = require("./api_routes/dialog-route.js")
const AutoStandup = require("./slack-bot")
const AppBootstrap = require("./main")
const ontime = require("ontime")
const debug = require("debug")("onaautostandup:index")

// Initialize app and attach middleware
const app = express()

const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
};

app.use(cors())
app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }))
app.use(bodyParser.json({ verify: rawBodyBuffer }))

// Error handling middleware
app.use(function (err, req, res, next) {
    console.log(err.stack)
    res.status(500).send({ error: err.message })
    debug("App Error description: " + err)
})

app.use("/api/v1", SlashCommandRouter)
app.use("/api/v1", DialogRouter)
app.get('/', (req, res) => {
    res.send('<h2>AutoStandup app is up and running</h2> <p>Login to your' +
        ' slack account and start submitting standups.</p>');
});

AppBootstrap.main()

const autoStandup = new AutoStandup()
/**
 * Prompt individuals for standup
 */
ontime({
    log: true,
    cycle: ['weekday 10:00:00'],
}, function (ot) {
    autoStandup.promptIndividualStandup()
    ot.done()
    return
})
/**
 * Notify individuals before postinf standup
 */
ontime({
    log: true,
    cycle: ['weekday 13:00:00'],
}, function (ot) {
    autoStandup.notifyBeforePostingStandup()
    ot.done()
    return
})
/**
 * Post team standups
 */
ontime({
    log: true,
    cycle: ['weekday 14:30:00'],
}, function (ot) {
    autoStandup.postTeamStandupsToChannel()
    ot.done()
    return
})
app.listen(process.env.PORT || 7777, function () {
    console.log("[+] app listening for requests")
})
