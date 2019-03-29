const express = require('express');
const moment = require('moment');
const router = express.Router();

const apiGuard = require('./guards/verify-signature');
const standUpService = require('../services/stand-ups');
const slashCommandService = require('../services/slash-command');
const commons = require('../helper/commons');
const constants = require('../helper/constants');

router.post('/slash-cmd', doSlashCommand);
router.post('/dialog', openDialog);
router.get('/dialog', getDialog);
router.get('/members', getChannelMembers);

function openDialog(request, response) {
    if (apiGuard.isVerified(request)) {
        const body = JSON.parse(request.body.payload);
        const team = body.submission.team;
        const today = moment().format("YYYY-MM-DD");
        let standUpDetails = {
            username: body.user.id,
            standup_today: body.submission.standup_today,
            team: team,
            standup_previous: body.submission.standup_previous,
            blockers: body.submission.blockers,
            date_posted: today
        };

        if (team === "None") {
            standUpDetails.status = 1;
            standUpService.postIndividualStandupToChannel(standUpDetails)
                .then(() => {
                    response.status(200).json({});
                })
                .catch((error) => {
                    response.status(400).send({"Error Occurred": error});
                });
            standUpService.saveStandUp(standUpDetails);
        } else {
            standUpDetails.status = 0;
            standUpService.saveStandUp(standUpDetails);
            response.status(200).json({});
        }

        standUpService.sendMessageToUser(body.user.id, commons.pickRandomResponse())
            .then(() => {
                response.status(200).json({});
            })
            .catch((error) => {
                response.status(400).send({"Error Occurred": error});
            });

    } else {
        response.status(400).send({"Error Occurred": constants.invalidToken});
    }
}

function getDialog(request, response) {
    standUpService.getDialog().then(success => {
        response.status(200).json({"Success dialog worked well": success});
    }).catch(error => {
        response.status(400).send({"Error Occurred": constants.invalidToken + error});
    });
}

function getChannelMembers(request, response) {
    standUpService.refreshChannelMembers().then(success => {
        response.status(200).json({"Success channel members retrieved": success});
    }).catch(error => {
        response.status(400).send({"Error Occurred": constants.invalidToken + error});
    });
}

function doSlashCommand(request, response) {
    if (apiGuard.isVerified(request)) {
        slashCommandService.runSlashCommand(request, response)
            .then(() => {
                response.status(200).send("")
            })
            .catch(error => {
                response.status(400).send({"Error Occurred": error});
            });
    } else {
        response.status(400).send({"Error Occurred": constants.invalidToken});
    }
}

module.exports = router;
