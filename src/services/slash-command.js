if (process.env.NODE_ENV !== "production") {
    const dotEnv = require("dotenv");
    const result = dotEnv.config();

    if (result.error) {
        throw result.error;
    }
}

const Q = require("q");
const constants = require("../helper/constants");
const usersService = require("../services/users");
const standUpService = require("../services/stand-ups");
const moment = require("moment");

let service = {};
service.runSlashCommand = runSlashCommand;
module.exports = service;

function formatAttachments(content) {
    if (content.length > 0) {
        let attachments = [];

        content.forEach(item => {
            let theDate = moment(item.date_posted, "YYYY-MM-DD").format("dddd, MMM Do YYYY");
            let attachment = {
                color: "#E1B983",
                text: `*\`${theDate}\`*`,
                fallback:
                    "Sorry Could not display standups in this type of device. Check in desktop browser",
                fields: [
                    {
                        title: "What you did on this day",
                        value: `${item.standup_today}`,
                        short: false
                    }
                ],
                footer: `You posted as ${item.team === "None" ? "Individual" : item.team}`
            };
            attachments.push(attachment);
        });
        return attachments

    }
}

/**
 * Express route to handle post request when the slash command is invoked by the
 * users of the app
 */
function runSlashCommand(request, response) {
    let deferred = Q.defer();
    let {text, user_id, trigger_id} = request.body;

    switch (text.trim()) {
        case constants.weeklyHistory:
            usersService.getHistory(user_id, 7)
                .then((success) => {
                    if (success !== undefined && success.length > 0) {
                        standUpService.postMessageToUser(user_id, "*📅 Showing your standup updates for the past week*", formatAttachments(success))
                    } else {
                        standUpService.postMessageToUser(user_id, `Hi <@${user_id}>, You currently have no standup updates.`, [])
                    }
                    deferred.resolve(constants.requestReceived)
                });
            break;
        case constants.monthlyHistory:
            usersService.getHistory(user_id, 30)
                .then((success) => {
                    if (success !== undefined && success.length > 0) {
                        standUpService.postMessageToUser(user_id, "*📅 Showing your standup updates for the past month*", formatAttachments(success))
                    } else {
                        standUpService.postMessageToUser(user_id, `Hi <@${user_id}>, You currently have no standup updates in your history`, [])
                    }
                    deferred.resolve(constants.requestReceived)
                });
            break;
        case constants.unsubscribe:
            usersService.checkUser(user_id).then((user) => {
                if (user === undefined) {
                    deferred.resolve({text: `Hi,<@${user_id}> you have *successfuly* \`unsubscribed\` from the atostandup notification service`});
                    usersService.saveUser(user_id)

                } else {
                    deferred.resolve({text: `Hi,<@${user_id}> you have *already* \`unsubscribed\` from the atostandup notification service`})
                }
            });
            break;
        case constants.subscribe:
            usersService.checkUser(user_id).then((user) => {
                if (user !== undefined) {
                    deferred.resolve({text: `Hi,<@${user_id}> you are *subcribed* \`back\` to the atostandup notification service`});
                    usersService.deleteUser(user_id)
                } else {
                    deferred.resolve({text: `Hi,<@${user_id}> you are *already* \`subscribed\` to the atostandup notification service`})
                }

            });
            break;
        case constants.post:
            standUpService.openDialog(trigger_id, constants.dialog)
                .then(result => {
                    if (result.ok === true) {
                        deferred.resolve("");
                    } else {
                        deferred.reject();
                    }
                });
            break;
        case constants.help:
            standUpService.postMessageToUser(user_id, `*Hi <@${user_id}>, need some help?*`, constants.attachments);
            deferred.resolve("");
            break;
        default:
            deferred.resolve("😞 Sorry I don't recognize that command. type *`/standup help`*  for help. To submit standup use  *`/standup post`*");
            break
    }

    return deferred.promise;
}
