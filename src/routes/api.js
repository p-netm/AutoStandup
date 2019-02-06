const express = require('express');
const empty = require('is-empty');
const router = express.Router();

const apiGuard = require('./guards/verify-signature');
const standUpService = require('../services/stand-ups');
const slashCommandService = require('../services/slash-command');
const commons = require('../helper/commons');
const constants = require('../helper/constants');

router.post('/slash-cmd', doSlashCommand);
router.post('/dialog', openDialog);
router.get('/dialog', getDialog);

function openDialog(request, response) {
    if (apiGuard.isVerified(request)) {
        const body = JSON.parse(request.body.payload);
        const team = body.submission.team;
        let standUpDetails = {
            username: body.user.id,
            standup_today: body.submission.standup_today,
            team: team,
            standup_previous: body.submission.standup_previous,
            date_posted: body.state
        };

        if (team === "None") {
            standUpDetails.status = 1;
            standUpService.postIndividualStandupToChannel(body)
                .then((success) => {
                    response.status(200).json({"Success worked well": success});
                })
                .catch((error) => {
                    response.status(400).send({"Error Occurred": error});
                });
            standUpService.saveStandUp(standUpDetails);
        } else {
            standUpDetails.status = 0;
            standUpService.saveStandUp(standUpDetails);
        }

        standUpService.sendMessageToUser(body.user.id, commons.pickRandomResponse())
            .then((success) => {
                response.status(200).json({"Success worked well": success});
            })
            .catch((error) => {
                response.status(400).send({"Error Occurred": error});
            });

    } else {
        response.status(400).send({"Error Occurred": constants.invalidToken});
    }
}

function getDialog(request, response) {
    if (apiGuard.isVerified(request)) {
        standUpService.getDialog().then(success => {
            response.status(200).json({"Success worked well": success});
        });
    } else {
        response.status(400).send({"Error Occurred": constants.invalidToken});
    }
}

function doSlashCommand(request, response) {
    if (apiGuard.isVerified(request)) {
        slashCommandService.runSlashCommand(request, response)
            .then(success => {
                response.status(200).json({"Success worked well": success});
            })
            .catch(error => {
                response.status(400).send({"Error Occurred": error});
            });
    } else {
        response.status(400).send({"Error Occurred": constants.invalidToken});
    }
}

module.exports = router;
