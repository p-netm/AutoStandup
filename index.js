const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const SlashCommandRouter = require("./api_routes/slash-command-route.js")
const AutoStandup = require("./slack-bot")
const listeningPort = "port"
const ontime = require("ontime")

// Initialize app and attach middleware
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use("/api/v1", SlashCommandRouter)

// Error handling middleware
app.use(function (err, req, res, next) {
    res.status(422).send({ error: err.message })
    console.log("Error description: " + err)
})


const autoStandup = new AutoStandup()
2
ontime({
    log:true,
    cycle: ['11:00:00', '15:10:00'],
}, function (ot) {
    autoStandup.promptStandupOnChannel()
    ot.done()
    return
})

//Start listening to requests
app.set(listeningPort, (process.env.PORT || 7777));
app.listen(app.get(listeningPort), function () {
    console.log("[+] app listening to requests on port " + app.get(listeningPort))
})
