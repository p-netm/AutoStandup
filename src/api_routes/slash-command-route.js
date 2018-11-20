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
                title: 'Submit standup update',
                callback_id: 'submit-standup',
                submit_label: 'Submit',
                elements: [
                    {
                        label: 'Date',
                        type: 'text',
                        name: 'date',
                        value: text,
                        hint: 'Date of submission.(Format dd/mm/yyyy) Defaults to today',
                    },
                    {
                        label: 'Team',
                        type: 'select',
                        name: 'team',
                        options: [
                            { label: 'OpenSRP', value: 'Open SRP' },
                            { label: 'Canopy', value: 'Canopy' },
                            { label: 'Kaznet', value: 'Kaznet' },
                            { label: 'Zebra', value: 'Zebra' },
                            { label: 'Ona Data', value: 'Ona Data' },
                            { label: 'Gisida', value: 'Gisida' },
                        ],
                    },
                    {
                        label: 'Standup updates',
                        type: 'textarea',
                        name: 'standups',
                        optional: false,
                        hint: "Provide updates in separate lines with - prefix. e.g - Added tests to Kaznet's playbook"
                    },
                ],
            }),
        };

        // open the dialog by calling dialogs.open method and sending the payload
        axios.post(`${SLACK_API_URL}/dialog.open`, qs.stringify(dialog))
            .then((result) => {
                debug('dialog.open: %o', result.data);
                console.log(req.body)
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