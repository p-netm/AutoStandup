const Q = require('q');
if (process.env.NODE_ENV !== "production") {
    const dotEnv = require("dotenv"); //Configure environmental variables
    const result = dotEnv.config();

    if (result.error) {
        throw result.error;
    }
}
const appBootstrap = require("../main");
const commons = require("../helper/commons");
const usersService = require("../services/users");
const membersService = require("../services/members");
const moment = require("moment");

const token = process.env.SLACK_ACCESS_TOKEN;

const {RTMClient, WebClient, ErrorCode} = require("@slack/client");
const rtm = new RTMClient(token);
const web = new WebClient(token);

rtm.start();

let today = moment().format("YYYY-MM-DD");

let service = {};
service.sendMessageToUser = sendMessageToUser;
service.postMessageToUser = postMessageToUser;
service.saveStandUp = saveStandUp;
service.promptIndividualStandup = promptIndividualStandup;
service.notifyBeforePostingStandup = notifyBeforePostingStandup;
service.postTeamStandupsToChannel = postTeamStandUpsToChannel;
service.postIndividualStandupToChannel = postIndividualStandUpToChannel;
service.refreshChannelMembers = refreshChannelMembers;
service.respondToMessages = respondToMessages;
service.openDialog = openDialog;
service.getDialog = getDialog;
module.exports = service;

/**
 * @desc Gets the dialog
 */
function getDialog() {
    let deferred = Q.defer();
    deferred.resolve("Cool! Everything works for dialog! Congratulations!!");
    return deferred.promise;
}


/***
 *  Get conversation id for user with id [userId]
 *  Post message to the user
 */
function sendMessageToUser(userId, message) {
    let deferred = Q.defer();
    web.conversations
        .list({exclude_archived: true, types: "im"})
        .then(response => {
            const foundUser = response.channels.find(u => u.user === userId);
            if (foundUser) {
                rtm.sendMessage(message, foundUser.id)
                    .then(success => {
                        deferred.resolve(`Message sent to user ${foundUser.user} with ts:${success.ts}`);
                    }).catch(error => {
                    deferred.reject(error);
                });
            } else {
                deferred.reject("User doesnt exist or is the bot user!");
            }
        });

    return deferred.promise;
}

function postMessageToUser(userId, message, attachments) {
    let deferred = Q.defer();
    web.conversations
        .list({exclude_archived: true, types: "im"})
        .then(response => {
            const foundUser = response.channels.find(u => u.user === userId);
            if (foundUser) {
                web.chat
                    .postMessage({
                        text: message,
                        attachments: attachments,
                        channel: foundUser.id
                    })
                    .then(success => {
                        deferred.resolve(`Message sent user channel ${userId} with ts:${success.ts}`);
                    })
                    .catch(error => {
                        if (error.code === ErrorCode.PlatformError) {
                            console.log(error.message);
                            console.log(error.data);
                        }
                        deferred.reject(error)
                    });

            } else {
                deferred.reject("This bot does not belong to any channel, invite it to at least one and try again");
            }
        });

    return deferred.promise;
}

/***
 * Saves stand-ups to db
 */
function saveStandUp(standUpDetails) {
    appBootstrap.userStandupRepo.add(standUpDetails);
}


/**
 * Get users then prompt them for standups
 */
function promptIndividualStandup() {
    usersService.getLateSubmitters().then(lateSubmitters => {
        if (lateSubmitters.length > 0) {
            console.log("Behold late submitters members = > " + lateSubmitters);
            lateSubmitters.forEach(user => {
                sendMessageToUser(user, commons.pickRandomReminderMsg());
            });
        }
    });
}

/**
 * Notify users 180 minutes before posting standup on channel
 */
function notifyBeforePostingStandup() {
    promptIndividualStandup();
}

/**
 * Post formatted standups to channel
 */
function postTeamStandUpsToChannel() {
    today = moment().format("YYYY-MM-DD");
    let todayFormatted = moment(today, "YYYY-MM-DD").format("MMM Do YYYY");
    let standupUpdate = `*📅 Showing Ona Standup Updates On ${todayFormatted}*\n\n`;
    appBootstrap.userStandupRepo
        .getByDatePosted(today)
        .then(data => {
            let attachments = [];

            data.forEach((item, index) => {
                let attachment = {
                    color: "#dfdfdf",
                    title: `<@${item.username}>`,
                    fallback:
                        "Sorry Could not display standups in this type of device. Check in desktop browser",
                    fields: [
                        {
                            title: "Today",
                            value: `${item.standup_today}`,
                            short: false
                        }
                    ],
                    footer: `Posted as ${item.team}`
                };
                if (item.standup_previous != null) {
                    const previously = {
                        title: "Yesterday/Previously",
                        value: `${
                            item.standup_previous == null
                                ? "Not specified"
                                : item.standup_previous
                            }`,
                        short: false
                    };
                    attachment.fields.push(previously);
                }
                if (index === 0) {
                    attachment.pretext = `Team ${item.team} Standups`;
                    attachment.color = "#7DCC34";
                }
                if (index > 0) {
                    if (item.team != data[index - 1].team) {
                        attachment.pretext = `Team ${item.team} Standups`;
                        attachment.color = "#7DCC34";
                    }
                }
                attachments.push(attachment);
            });
            return Promise.resolve(attachments);
        })
        .then(allAttachments => {
            if (allAttachments.length > 0) {
                web.channels.list().then(res => {
                    const channel = res.channels.find(c => c.is_member);
                    if (channel) {
                        web.chat
                            .postMessage({
                                text: standupUpdate,
                                attachments: allAttachments,
                                channel: channel.id
                            })
                            .then(msg =>
                                console.log(
                                    `Message sent to channel ${channel.name} with ts:${msg.ts}`
                                )
                            )
                            .catch(console.error);
                    } else {
                        console.log(
                            "This bot does not belong to any channel, invite it to at least one and try again"
                        );
                    }
                });
            } else {
                web.channels.list().then(res => {
                    today = moment().format("YYYY-MM-DD");
                    let todayFormatted = moment(today, "YYYY-MM-DD").format("MMM Do YYYY");
                    const channel = res.channels.find(c => c.is_member);
                    if (channel) {
                        web.chat
                            .postMessage({
                                text: `*📅 Nothing to show. No standup updates for ${todayFormatted}*`,
                                channel: channel.id
                            })
                            .then(msg =>
                                console.log(
                                    `Message sent to channel ${channel.name} with ts:${msg.ts}`
                                )
                            )
                            .catch(console.error);
                    } else {
                        console.log(
                            "This bot does not belong to any channel, invite it to at least one and try again"
                        );
                    }
                });
            }
        });
}

function postIndividualStandUpToChannel(item) {
    let deferred = Q.defer();

    let todayFormatted = moment(item.date_posted, "YYYY-MM-DD").format("MMM Do YYYY");
    let standupUpdate = `🔔 \`Update\` *New standup update posted ${todayFormatted}*\n\n`;
    let attachment = {
        color: "#FFA300",
        title: `<@${item.username}>`,
        fallback:
            "Sorry Could not display standups in this type of device. Check in desktop browser",
        fields: [
            {
                title: "Today",
                value: `${item.standup_today}`,
                short: false
            }
        ],
        footer: `Posted as individual`
    };
    if (item.standup_previous != null) {
        const previously = {
            title: "Yesterday/Previously",
            value: `${
                item.standup_previous == null
                    ? "Not specified"
                    : item.standup_previous
                }`,
            short: false
        };
        attachment.fields.push(previously);
    }

    let attachments = [];
    attachments.push(attachment);
    web.channels.list().then(res => {
        const channel = res.channels.find(c => c.is_member);
        if (channel) {
            web.chat
                .postMessage({
                    text: standupUpdate,
                    attachments: attachments,
                    channel: channel.id
                })
                .then(msg => {
                    deferred.resolve(`Message sent to channel ${channel.name} with ts:${msg.ts}`)
                }).catch(error => {
                deferred.reject(error);
            });
        } else {
            deferred.reject("This bot does not belong to any channel, invite it to at least one and try again");
        }
    });

    return deferred.promise;
}

/**
 * Interact with users v
 */
function respondToMessages() {
}

/**
 *
 * @param {trigerId used to load form} triggerId
 * @param {dialog elements} dialog
 */
function openDialog(triggerId, dialog) {
    let deferred = Q.defer();
    web.dialog.open({trigger_id: triggerId, dialog: JSON.stringify(dialog)})
        .then(success => {
            console.log("Open dialog res: %o ", success);
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

/**
 * Flush channel members table
 * Find channel that the bot belongs to get the members and save to local db
 */
function refreshChannelMembers() {
    membersService.flushMembers();
    let deferred = Q.defer();
    const resp = {};
    console.log("getting  channel members");
    web.channels.list().then(success => {
        const channel = success.channels.find(c => c.is_member);
        if (channel) {
            resp.ok = true;
            resp.members = channel.members;
        } else {
            resp.ok = false;
            resp.members = [];
        }
        console.log("channel members " + resp.members);
        resp.members.map(it => {
            membersService.saveMember(it)
        });
        deferred.resolve(resp.members);
    }).catch(error => {
        if (error.code === ErrorCode.PlatformError) {
            console.log(error.message);
            console.log(error.data);
        }
        deferred.reject(error);
    });

    return deferred.promise
}
