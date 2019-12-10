const Q = require('q');
if (process.env.NODE_ENV !== "production") {
    const dotEnv = require("dotenv"); //Configure environmental variables
    const result = dotEnv.config();

    if (result.error) {
        throw result.error;
    }
}
const repos = require("../services/repos");
const commons = require("../helper/commons");
const usersService = require("../services/users");
const membersService = require("../services/members");
const moment = require("moment");

let rtm = null;
let web = null;
let rtmDeferred = Q.defer();

const {RTMClient, WebClient, ErrorCode} = require("@slack/client");

getAccessToken(process.env.WORKSPACE).then(token => {
    if (token === "") {
        rtm = new RTMClient(process.env.SLACK_ACCESS_TOKEN);
        web = new WebClient(process.env.SLACK_ACCESS_TOKEN);
    } else {
        rtm = new RTMClient(token);
        web = new WebClient(token);
    }
    startRtm();
});

function startRtm() {
    rtm.start().then(success => {
        console.log("Connection successful!");
        rtmDeferred.resolve(success)
    }).catch(error => {
        if (error.code === ErrorCode.PlatformError) {
            console.log(error.message);
            console.log(error.data);
        }
        rtmDeferred.reject(error);
    });
}

let today = moment().format("YYYY-MM-DD");

module.exports = {
    sendMessageToUser: sendMessageToUser,
    postMessageToUser: postMessageToUser,
    saveStandUp: saveStandUp,
    promptIndividualStandup: promptIndividualStandup,
    notifyBeforePostingStandup: notifyBeforePostingStandup,
    postTeamStandupsToChannel: postTeamStandUpsToChannel,
    postIndividualStandupToChannel: postIndividualStandUpToChannel,
    refreshChannelMembers: refreshChannelMembers,
    openDialog: openDialog,
    getDialog: getDialog,
    updateStandUp: updateStandUp
};

async function getAccessToken(teamName) {
    let token = "";
    return await repos.tokenRepo.getTokenByTeam(teamName)
        .then(result => {
            if (result !== undefined) {
                let {bot} = JSON.parse(result.value);
                token = bot.bot_access_token;
            }
            return Promise.resolve(token);
        });

}

/**
 * @desc Gets the dialog
 */
function getDialog() {
    let deferred = Q.defer();
    deferred.resolve("Cool! Everything works for dialog! Congratulations!!");
    return deferred.promise;
}


/***
 * Sends message to user with the specified Id
 * @param userId slack user id
 * @param message message to be sent
 * @returns {Q.Promise<any>}
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

/***
 * Posts message to user with the specified id
 * @param userId users slack id
 * @param message message to be posted
 * @param attachments formatted text to improve visual appearance on slack
 * @returns {Q.Promise<any>}
 */
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
    repos.userStandupRepo.add(standUpDetails);
}

/**
 * @desc Update the latest stand up
 * @param standUpDetails
 */
function updateStandUp(standUpDetails) {
    repos.userStandupRepo.update(standUpDetails);
}


/***
 * prompt for standup from those who have not submitted
 * @param promptMessage random message sent to users
 */
function promptStandup(promptMessage) {
    usersService.getLateSubmitters().then(lateSubmitters => {
        if (lateSubmitters.length > 0) {
            console.log("Behold late submitters members = > " + lateSubmitters);
            lateSubmitters.forEach(user => {
                sendMessageToUser(user, promptMessage);
            });
        }
    });
}

function promptIndividualStandup() {
    promptStandup(commons.pickRandomPromptMsg());
}

/**
 * Notify users 180 minutes before posting standup on channel
 */
function notifyBeforePostingStandup() {
    promptStandup(commons.pickRandomReminderMsg());
}

/**
 * Method that posts message to standup channel
 * @param message
 * @param allAttachments
 */
function postMessageToChannel(message, allAttachments) {
    web.channels.list().then(res => {
        const channel = res.channels.find(c => c.is_member);
        if (channel) {
            web.chat
                .postMessage({
                    text: message,
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
}

/**
 * Formats the message by applying slack formatting for better visuals
 * @param item  current posted standup
 * @param index current index or position of standup update
 * @param data all posted standups
 * @returns {{color: string, footer: string, title: string, fields: {short: boolean, title: string, value: string}[], fallback: string}}
 */
function formatTeamsMessageAttachment(item, index, data) {
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
    if (item.blockers != null) {
        const blockers = {
            title: "Blockers",
            value: `${item.blockers == null ? "Not specified" : item.blockers}`,
            short: false
        };
        attachment.fields.push(blockers);
    }

    if (index === 0) {
        attachment.pretext = `Team ${item.team} Standups`;
        attachment.color = "#7DCC34";
    }
    if (index > 0) {
        if (item.team !== data[index - 1].team) {
            attachment.pretext = `Team ${item.team} Standups`;
            attachment.color = "#7DCC34";
        }
    }
    return attachment;
}

/***
 *  Post formatted standups to channel
 */
function postTeamStandUpsToChannel() {
    today = moment().format("YYYY-MM-DD");
    let todayFormatted = moment(today, "YYYY-MM-DD").format("MMM Do YYYY");
    let standupUpdate = `*📅 Showing Ona Team Standup Updates On ${todayFormatted}*\n\n`;
    repos.userStandupRepo.getByDatePosted(today)
        .then(data => {
            let attachments = [];
            data.forEach((item, index) => {
                let attachment = formatTeamsMessageAttachment(item, index, data);
                attachments.push(attachment);
            });
            return Promise.resolve(attachments);
        })
        .then(allAttachments => {
            if (allAttachments.length > 0) {
                postMessageToChannel(standupUpdate, allAttachments);
            } else {
                standupUpdate = `*📅 Nothing to show. No team standup updates for ${todayFormatted}*`;
                postMessageToChannel(standupUpdate, [])
            }
        });
}

/**
 * Formats the message for a single standup posted by user
 * @param item standup to be posted
 * @returns {{color: string, footer: string, title: string, fields: {short: boolean, title: string, value: string}[], fallback: string}}
 */
function formatSingleMessageAttachment(item) {
    //Get user profile then use the information in the attachment
    return membersService.getUserProfile(item.username).then(d => {
        let profile = JSON.parse(d.profile);
        let profileName = profile.display_name !== undefined && profile.display_name !== "" ? profile.display_name : profile.real_name;
        let attachment = {
            author_name: profileName,
            color: "#4BBEDF",
            fallback:
                "Sorry Could not display standups in this type of device. Check in desktop browser",
            fields: [
                {
                    title: "Today",
                    value: `${item.standup_today}`,
                    short: false
                }
            ],
            thumb_url: profile.image_512, //Gets profile thumbnail from profile
            footer: `Posted as individual`
        };
        if (item.standup_previous !== null) {
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
        if (item.blockers != null) {
            const blockers = {
                title: "Blockers",
                value: `${item.blockers === null ? "Not specified" : item.blockers}`,
                short: false
            };
            attachment.fields.push(blockers);
        }
        return Promise.resolve(attachment)
    });

}

/**
 * Posts individual standup to channel
 * @param item standup to be posted
 * @returns {Q.Promise<any>}
 */
function postIndividualStandUpToChannel(item) {
    let deferred = Q.defer();
    let standupUpdate = `*🔔New standup update from <@${item.username}>*\n\n`;
    formatSingleMessageAttachment(item).then(result => {
        let attachments = [];
        attachments.push(result);
        postMessageToChannel(standupUpdate, attachments);
    });

    return deferred.promise;
}

/**
 * Interact with users v
 */
function respondToMessages(message) {
    console.log("New message: " + JSON.stringify(message));

}

/***
 *
 * @param triggerId trigger_id sent by invoking slash command
 * @param dialog content of dialog to be opened
 * @returns {Q.Promise<any>}
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
 * Find channel that the bot belongs to, get the members and save to local db
 */
function refreshChannelMembers(isFirstTime) {
    membersService.flushMembers();
    let deferred = Q.defer();
    const resp = {};
    web.users.list().then(success => {
            const usersList = success;
            if (usersList !== undefined) {
                resp.ok = true;
                resp.members = usersList.members;
            } else {
                resp.ok = false;
                resp.members = [];
            }

            let persons = resp.members.map(person => ({user_id: person.id, profile: person.profile}));

            //Only save users who are not bots So we filter the array to only contain non bot users
            let reduced = persons.reduce(function (filtered, person) {
                if (person.profile.bot_id === undefined && person.user_id !== "USLACKBOT") {
                    let someNewValue = {user_id: person.user_id, profile: person.profile};
                    filtered.push(someNewValue);
                }
                return filtered;
            }, []);

            reduced.map(newPerson => {
                membersService.saveMember(newPerson);
                if (isFirstTime === true) {
                    usersService.checkUser(newPerson.user_id).then((user) => {
                        if (user === undefined) {
                            usersService.saveUser(newPerson.user_id);
                        }
                    });
                }
            });
            deferred.resolve(persons);
        }
    ).catch(error => {
        if (error.code === ErrorCode.PlatformError) {
            console.log(error.message);
            console.log(error.data);
        }
        deferred.reject(error);
    });

    return deferred.promise
}
