const express = require('express');
const router = express.Router();

const apiGuard = require('./guards/verify-signature');
const dialogService = require('../services/dialog');
const slashCommandService = require('../services/slash-command');

router.post('/slash-cmd', doSlashCommand);
router.post('/dialog', doDialog);
router.get('/dialog', getDialog);

function doDialog(request, response) {
    if (apiGuard.isVerified(request)) {
        const body = JSON.parse(request.body.payload);
        dialogService.newDialog(body)
            .then((data) => {
                response.status(200).json("Success worked well" + data);
            })
            .catch((error) => {
                response.status(400).send("Error Occurred" + error);
            })
    } else {
        response.status(400).send("Token mismatch");
    }
}

function getDialog() {

}

function doSlashCommand(request, response) {
    if (apiGuard.isVerified(request)) {

    } else {
        response.status(400).send("Token mismatch");
    }
}

module.exports = router;
