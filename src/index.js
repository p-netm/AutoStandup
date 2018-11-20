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
const ontime = require("ontime")
const debug = require("debug")("onaautostandup:index")

// Initialize app and attach middleware
const app = express()

const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }))
app.use(bodyParser.json({ verify: rawBodyBuffer }))
app.use(cors())

app.use("/api/v1", SlashCommandRouter)
app.use("/api/v1", DialogRouter)
app.get('/', (req, res) => {
    res.send('<h2>AutoStandup app is up and running</h2> <p>Login to your' +
        ' slack account and start submitting standups.</p>');
});

// Error handling middleware
app.use(function (err, req, res, next) {
    res.status(422).send({ error: err.message })
    debug("App Error description: " + err)
})


const autoStandup = new AutoStandup()

ontime({
    log: true,
    cycle: ['11:00:00', '15:10:00'],
}, function (ot) {
    autoStandup.promptStandupOnChannel()
    ot.done()
    return
})

//Start listening to requests
app.listen(process.env.PORT || 7777, function () {
    console.log("[+] app listening for requests")
})
