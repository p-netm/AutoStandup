const Q = require('q');
if (process.env.NODE_ENV !== "production") {
    const dotEnv = require("dotenv"); //Configure environmental variables
    const result = dotEnv.config();

    if (result.error) {
        throw result.error;
    }
}

const appBootstrap = require("../main");
const moment = require("moment");
const today = moment().format("YYYY-MM-DD");
const token = process.env.SLACK_ACCESS_TOKEN;

const {RTMClient, WebClient, ErrorCode} = require("@slack/client");
const rtm = new RTMClient(token);
const web = new WebClient(token);
rtm.start();

let service = {};
service.getUsers = getUsers;
service.checkUser = checkUser;
service.saveUser = saveUser;
service.deleteUser = deleteUser;
service.getLateSubmitters = getLateSubmitters;
service.getChannelMembers = getChannelMembers;
service.getHistory = getHistory;
module.exports = service;

/**
 * get all users who unsubscribed
 */
function getUsers() {
    let deferred = Q.defer();
    appBootstrap.userRepo.getAllUsers()
        .then(response => {
            deferred.resolve(response);
        })
        .catch(error => {
            if (error.code === ErrorCode.PlatformError) {
                console.log("error message", error.message);
                console.log("error message", error.data);
            }
            deferred.reject(error);
        });

    return deferred.promise
}

function checkUser(username) {
    let deferred = Q.defer();
    appBootstrap.userRepo.getByUsername(username)
        .then(success => {
            deferred.resolve(success);
        })
        .catch(error => {
            if (error.code === ErrorCode.PlatformError) {
                console.log(error.message);
                console.log(error.data);
            }
            deferred.reject(error);
        });

    return deferred.promise;
}

function saveUser(username) {
    appBootstrap.userRepo.add(username);
}

function deleteUser(username) {
    appBootstrap.userRepo.deleteByUsername(username);
}

/**
 * Find channel that the bot belongs to and return the members
 */
function getChannelMembers() {
    let deferred = Q.defer();
    const resp = {};
    web.channels.list().then(success => {
        const channel = success.channels.find(c => c.is_member);
        if (channel) {
            resp.ok = true;
            resp.members = channel.members;
        } else {
            resp.ok = false;
            resp.members = [];
        }
        deferred.resolve(resp);
    }).catch(error => {
        if (error.code === ErrorCode.PlatformError) {
            console.log(error.message);
            console.log(error.data);
        }
        deferred.reject(error);
    });

    return deferred.promise
}

/**
 * Get those who have submitted. If someone is not in this list then
 * they have not submitted. Proceed to send the notification to these late submitters.
 * Only if they are subscribed to notification service otherwise ignore them
 */
function getLateSubmitters() {
    let deferred = Q.defer();
    appBootstrap.userStandupRepo.getUsersWhoSubmitedByDate(today)
        .then(success => {
            let earlySubmitters = [];
            if (success.length > 0) {
                success.forEach((user) => {
                    earlySubmitters.push(user.username)
                })
            }
            deferred.resolve(earlySubmitters);
        })
        .then(submitters => {
            return getChannelMembers().then(success => {
                let allChannelUsers = success.members;
                allChannelUsers = allChannelUsers.filter(
                    item => !submitters.includes(item)
                );
                deferred.resolve(allChannelUsers);
            })
        })
        .catch(error => {
            if (error.code === ErrorCode.PlatformError) {
                console.log("error message", error.message);
                console.log("error message", error.data);
            }
            deferred.reject(error);
        });

    return deferred.promise;
}

function getHistory(username, daysToSubtract) {
    let deferred = Q.defer();
    let momentStartDate = moment().subtract(daysToSubtract, 'days').calendar();
    let startDate = moment(momentStartDate, "L").format("YYYY-MM-DD");
    console.log("Fetching history between " + startDate + " and " + today);
    appBootstrap.userStandupRepo.getHistory(username, startDate, today)
        .then((success) => {
            deferred.resolve(success);
        })
        .catch(error => {
            deferred.reject(error);
        });

    return deferred.promise;
}