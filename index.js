const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const SlashCommandRouter = require("./api_routes/slash-command-route.js")
const listeningPort = "port"
const Bot = require("./slack-bot")

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

// Start Bot Handler
Bot.on('start', function () {
    const params = {
        icon: 'autostandup'
    }

    Bot.on('error', (err) => console.log(err));

    //message handler
    Bot.on('message', data => {
        if (data.type !== 'message') {
            return
        }
        console.log(data);
    })

});


//Start listening to requests
app.set(listeningPort, (process.env.PORT || 7777));
app.listen(app.get(listeningPort), function () {
    console.log("[+] app listening to requests on port " + app.get(listeningPort))
})

