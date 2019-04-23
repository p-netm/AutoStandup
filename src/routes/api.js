const express = require('express');
const moment = require('moment');
const axios = require("axios");
const qs = require("querystring");
const Q = require('q');

const router = express.Router();

const apiGuard = require('./guards/verify-signature');
const standUpService = require('../services/stand-ups');
const slashCommandService = require('../services/slash-command');
const commons = require('../helper/commons');
const constants = require('../helper/constants');
const repos = require("../services/repos");

router.get('/authorized', getAccessToken);
router.post('/slash-cmd', doSlashCommand);
router.post('/dialog', openDialog);
router.post('/events', actOnMessageEvents);
router.get('/dialog', getDialog);
router.get('/members', getChannelMembers);
router.get('/oauth', getAuthorization);

if (!process.env.SLACK_REDIRECT_URL && !process.env.SLACK_CLIENT_ID) {
    console.log('Error: Client ID and Slack REDIRECT URLS missing in the environment variables');
    process.exit(1);
}

function getAccessToken(request, response) {
    let deferred = Q.defer();
    let code = request.query.code;
    let redirectUri = request.protocol + '://' + request.get('host') + process.env.APP_API_BASE + "authorized";
    let arguments = {
        code: code,
        redirect_uri: redirectUri
    };
    console.log("Retrieved code: " + code);

    axios.default.post(constants.slackAuthUrl, qs.stringify(arguments), {
        auth: {
            username: process.env.SLACK_CLIENT_ID,
            password: process.env.SLACK_CLIENT_SECRET
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }).then((result) => {
        if (result.data !== undefined) {
            let {user_id, team_name, team_id} = result.data;
            if(user_id !== undefined){
                let domain = request.protocol + '://' + request.get('host');
                repos.tokenRepo.add(user_id, team_id, team_name, JSON.stringify(result.data));
                response.redirect(domain)
            }else {
                response.status(200).json({});
            }

        }

        deferred.resolve(result.data);
    }).catch(error => {
        console.log(error);
        deferred.reject(error)
    });
    deferred.promise
}

function getAuthorization(request, response) {
    let scopeParam = "bot commands chat:write:bot";
    let domain = request.protocol + '://' + request.get('host') + process.env.APP_API_BASE;
    let redirectUri = domain + "authorized";
    let params = `?client_id=${process.env.SLACK_CLIENT_ID}&scope=${scopeParam}&redirect_uri=${redirectUri}`;
    response.redirect(process.env.SLACK_REDIRECT_URL + params);
}

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

        let standUpId;
        if (body.state !== null && body.state !== undefined) {
            standUpId = body.state;
        }

        if (team === "None") {
            standUpDetails.status = 1;
            standUpService.postIndividualStandupToChannel(standUpDetails)
                .then(() => {
                    response.status(200).json({});
                })
                .catch((error) => {
                    response.status(400).send({"Error Occurred": error});
                });
            if (standUpId === "") {
                standUpService.saveStandUp(standUpDetails);
            } else {
                standUpDetails.id = standUpId;
                standUpService.updateStandUp(standUpDetails);
            }
        } else {
            standUpDetails.status = 0;
            if (standUpId === "") {
                standUpService.saveStandUp(standUpDetails);
            } else {
                standUpDetails.id = standUpId;
                standUpService.updateStandUp(standUpDetails);
            }
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

function actOnMessageEvents(request, response) {
    if (apiGuard.isVerified(request)) {
        response.status(200).send(request.body.challenge);
    } else {
        console.log("An error occurred sorry");
    }
}

module.exports = router;
