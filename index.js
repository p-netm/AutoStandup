const express = require("express")
const bodyParser = require('body-parser')
const cors = require("cors")
const SlashCommandRouter = require("./api_routes/slash-command-route.js")

// Initialize app and attach middleware
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/autostandup/api', SlashCommandRouter)

// Error handling middleware
app.use(function (err, req, res, next) {
    res.status(422).send({ error: err.message })
    console.log("Error description: " + err)
})



// Listen to port
let port_used = process.env.port != undefined ? process.env.port : 4000
app.listen(port_used, function () {
    console.log('[+] app listening to requests on port ' + port_used)
})

