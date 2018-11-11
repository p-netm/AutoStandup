const express = require("express")
const SlashCommandRouter = express.Router()

//Handle post request from slack
SlashCommandRouter.post('/slashcmd/new', function (req, res, next) {
      
})

//Test get request from slack
SlashCommandRouter.get('/slashcmd', function (req, res, next) {
    res.send("Cool! Everything works! Congratulations!!")
})

module.exports = SlashCommandRouter