const express = require("express")
const DialogRouter = express.Router()

//Handle post request from slack
DialogRouter.post('/dialog/new', function (req, res, next) {
    
    res.statusCode = 200
    res.json({})
})

//Test get request from slack
DialogRouter.get('/dialog', function (req, res, next) {
    res.send("Cool! Everything works for dialog! Congratulations!!")
})

module.exports = DialogRouter