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
const SLACK_API_URL = 'https://slack.com/api'
const signature = require("../verifySignature")
const moment = require("moment")

/**
 * Express route to handle post request when the slash command is invoked by the 
 * users of the app
 */
SlashCommandRouter.post('/slashcmd/new', function (req, res) {

    const { text, trigger_id } = req.body   
    if (signature.isVerified(req)) {
        const dialog = {
            token: process.env.SLACK_ACCESS_TOKEN,
            trigger_id,
            dialog: JSON.stringify({
                title: 'Submit standup update',
                callback_id: 'submit-standup',
                submit_label: 'Submit',
                state: moment().format("Do MMMM YYYY"),
                elements: [
                    {
                        label: 'Posting standup for',
                        type: 'text',
                        name: 'date',
                        value: text,
                        hint: ' Default value is today. You can also type yesterday or date in the format (yyyy-mm-dd).',
                    },
                    {
                        label: 'My team',
                        type: 'select',
                        name: 'team',
                        options: [
                            { label: 'No Team', value: "None" },
                            { label: 'OpenSRP', value: 'Open SRP' },
                            { label: 'Canopy', value: 'Canopy' },
                            { label: 'Kaznet', value: 'Kaznet' },
                            { label: 'Zebra', value: 'Zebra' },
                            { label: 'Ona Data', value: 'Ona Data' },
                            { label: 'Gisida', value: 'Gisida' },
                        ],
                    },
                    {
                        label: 'My updates',
                        type: 'textarea',
                        name: 'standups',
                        optional: false,
                        hint: "Provide updates in separate lines with - prefix. e.g - Added tests to Kaznet's playbook"
                    },
                ],
            }),
        }

        // open the dialog by calling dialogs.open method and sending the payload
        axios.post(`${SLACK_API_URL}/dialog.open`, qs.stringify(dialog))
            .then((result) => {
                console.log('dialog.open: %o', result.data)              
                res.status(200).send('')
            }).catch((err) => {
                console.error('dialog.open call failed: %o', err)
                res.sendStatus(500)
            })
    } else {
        debug('Verification token mismatch')
        res.status(404).end()
    }

})

//Test get request from slack
SlashCommandRouter.get('/slashcmd', function (req, res) {
    res.status(200).send("Cool! Everything works for Slash command! Congratulations!!")
})

module.exports = SlashCommandRouter