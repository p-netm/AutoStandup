const express = require("express")
const SlashCommandRouter = express.Router()

//Handle post request from slack
SlashCommandRouter.post('/slashcmd/new', function (req, res, next) {
        var sejson = "{elly:{age:23,sex:'male',profession:'Sofware engineer'}}"
        res.send(sejson)
        console.log(req.body)
})

//Test get request from slack
SlashCommandRouter.get('/slashcmd', function (req, res, next) {
    res.send("Cool! Everything works! Congratulations!!")
})

module.exports = SlashCommandRouter