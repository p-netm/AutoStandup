if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv')//Configure environmental variables 
    const result = dotenv.config()

    if (result.error) {
        throw result.error
    }
}
const express = require("express")
const axios = require("axios")
const qs = require("querystring")
const SlashCommandRouter = express.Router()
const debug = require("debug")("onaautostandup:slash-command-route")
const SLACK_API_URL = 'https://slack.com/api';
const signature = require("../verifySignature")

/**
 * Express route to handle post request when the slash command is invoked by the 
 * users of the app
 */
SlashCommandRouter.post('/slashcmd/new', function (req, res) {

    const { text, trigger_id } = req.body;

    if (signature.isVerified(req)) {

        const dialog = {
            token: process.env.SLACK_ACCESS_TOKEN,
            trigger_id,
            dialog: JSON.stringify({
                title: 'Submit a helpdesk ticket',
                callback_id: 'submit-ticket',
                submit_label: 'Submit',
                elements: [
                  {
                    label: 'Title',
                    type: 'text',
                    name: 'title',
                    value: text,
                    hint: '30 second summary of the problem',
                  },
                  {
                    label: 'Description',
                    type: 'textarea',
                    name: 'description',
                    optional: true,
                  },
                  {
                    label: 'Urgency',
                    type: 'select',
                    name: 'urgency',
                    options: [
                      { label: 'Low', value: 'Low' },
                      { label: 'Medium', value: 'Medium' },
                      { label: 'High', value: 'High' },
                    ],
                  },
                ],
              }),
        };

        // open the dialog by calling dialogs.open method and sending the payload
        axios.post(`${SLACK_API_URL}/dialog.open`, qs.stringify(dialog))
            .then((result) => {
                debug('dialog.open: %o', result.data);
                res.send('')
            }).catch((err) => {
                debug('dialog.open call failed: %o', err);
                res.sendStatus(500);
            });
    } else {
        debug('Verification token mismatch');
        res.status(404).end();
    }

})

//Test get request from slack
SlashCommandRouter.get('/slashcmd', function (req, res) {
    res.status(200).send("Cool! Everything works for Slash command! Congratulations!!")
})

module.exports = SlashCommandRouter