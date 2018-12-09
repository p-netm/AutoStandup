if (process.env.NODE_ENV !== "production") {
    const dotenv = require("dotenv"); //Configure environmental variables
    const result = dotenv.config();

    if (result.error) {
        throw result.error;
    }
}
const AppBootstrap = require("./main");
const moment = require("moment");
const today = moment().format("YYYY-MM-DD");
const token = process.env.SLACK_ACCESS_TOKEN;

const { RTMClient, WebClient, ErrorCode } = require("@slack/client");
const rtm = new RTMClient(token);
const web = new WebClient(token);
rtm.start();

const promptResponse = new Array(
    "Hey, submit your daily standup. Use `/standup post` command to submit standup; for help  `/standup help`",
    "Hi, another day to submit your standup. Use `/standup post` command to submit standup; for help  `/standup help`",
    "Hey, time for standup update. Use `/standup post` command to submit standup; for help  `/standup help`",
    "Greetings!, please submit your daily standup. Use `/standup post` command to submit standup; for help  `/standup help`"
);
const reminderResponse = new Array(
    "Hey, submit your daily standup, posting time is `2.30PM`. Don't be left out!",
    "Hi, time runs so fast. Submit your standup before `2.30PM`.",
    "Hey, in the next `2hrs` at 2.30PM team standup will be posted. Submit yours today. ",
    "Greetings!, please submit your daily standup. Time for posting is `2.30PM`"
);

function pickRandomPromptMsg() {
    var pos = Math.floor(Math.random() * (promptResponse.length - 0) + 0);
    return promptResponse[pos];
}
function pickRandomReminderMsg() {
    var pos = Math.floor(Math.random() * (reminderResponse.length - 0) + 0);
    return reminderResponse[pos];
}

class AutoStandup {
    /***
     *  Get conversation id for user with id [userId]
     *  Post message to the user
     */
    sendMessageToUser(userId, message) {
        web.conversations
            .list({ exclude_archived: true, types: "im" })
            .then(res => {
                const foundUser = res.channels.find(u => u.user === userId);
                if (foundUser) {
                    rtm
                        .sendMessage(message, foundUser.id)
                        .then(msg =>
                            console.log(
                                `Message sent to user ${foundUser.user} with ts:${msg.ts}`
                            )
                        )
                        .catch(console.error);
                } else {
                    console.log("User doesnt exist or is the bot user!");
                }
            });
    }

    postMessageToUser(userId, message, attachments) {
        web.conversations
            .list({ exclude_archived: true, types: "im" })
            .then(res => {
                const foundUser = res.channels.find(u => u.user === userId)
                if (foundUser) {
                    web.chat
                        .postMessage({
                            text: message,
                            attachments: attachments,
                            channel: foundUser.id
                        })
                        .then(msg =>
                            console.log(
                                `Message sent user channel ${userId} with ts:${msg.ts}`
                            )
                        ).catch(error => {
                            if (error.code === ErrorCode.PlatformError) {
                                console.log(error.message);
                                console.log(error.data);
                            } else {
                                console.error;
                            }
                            return Promise.reject(error);
                        });

                } else {
                    console.log(
                        "This bot does not belong to any channel, invite it to at least one and try again"
                    );
                }
            })
    }

    /***
     * Saves standup to db
     */
    saveStandup(standupDetails) {
        AppBootstrap.userStandupRepo.add(standupDetails);
    }
    /**
     * get all users who unsubscribed
     */
    getUsers() {
        return AppBootstrap.userRepo
            .getAllUsers()
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                if (error.code === ErrorCode.PlatformError) {
                    console.log("error message", error.message);
                    console.log("error message", error.data);
                } else {
                    console.error;
                }
                return Promise.reject(error);
            });
    }

    checkUser(username) {
        return AppBootstrap.userRepo
            .getByUsername(username)
            .then(res => {
                return Promise.resolve(res);
            })
            .catch(error => {
                if (error.code === ErrorCode.PlatformError) {
                    console.log(error.message);
                    console.log(error.data);
                } else {
                    console.error;
                }
                return Promise.reject(error);
            });
    }

    saveUser(username) {
        AppBootstrap.userRepo.add(username);
    }
    deleteUser(username) {
        AppBootstrap.userRepo.deleteByUsername(username);
    }
    /**
     * Find channel that the bot belongs to and return the members
     */
    getChannelMembers() {
        const resp = {};
        return web.channels
            .list()
            .then(res => {
                const channel = res.channels.find(c => c.is_member);
                if (channel) {
                    resp.ok = true;
                    resp.members = channel.members;
                } else {
                    resp.ok = false;
                    resp.members = [];
                }
                return Promise.resolve(resp);
            })
            .catch(error => {
                if (error.code === ErrorCode.PlatformError) {
                    console.log(error.message);
                    console.log(error.data);
                } else {
                    console.error;
                }
                return Promise.reject(error);
            });
    }

    /**
     * Get users then prompt them for standups
     */
    promptIndividualStandup() {
        let rmUserArr = [];
        this.getUsers().then(res => {
            res.forEach(res => {
                rmUserArr.push(res.username);
            });
        });
        this.getChannelMembers().then(res => {
            let allChannelUsers = res.members;
            allChannelUsers = allChannelUsers.filter(
                item => !rmUserArr.includes(item)
            );

            allChannelUsers.forEach(user => {
                this.sendMessageToUser(user, pickRandomPromptMsg());
            });
        });
    }


    /**
     * Get those who have submitted. If someone is not in this list then
     * they have not submitted. Proceed to send the notification to these late submitters.
     * Only if they are subscribed to notification service otherwise ignore them
     */
    getLateSubmitters() {
        return AppBootstrap.userStandupRepo
            .getUsersWhoSubmitedByDate(today)
            .then(res => {
                let earlySubmitters = []
                if (res.length > 0) {
                    res.forEach((user) => {
                        earlySubmitters.push(user.username)
                    })
                }
                return Promise.resolve(earlySubmitters);
            })
            .then(submitters => {
                return this.getChannelMembers()
                    .then(res => {
                        let allChannelUsers = res.members;
                        allChannelUsers = allChannelUsers.filter(
                            item => !submitters.includes(item)
                        );
                        return Promise.resolve(allChannelUsers);
                    })
            })
            .catch(error => {
                if (error.code === ErrorCode.PlatformError) {
                    console.log("error message", error.message);
                    console.log("error message", error.data);
                } else {
                    console.error;
                }
                return Promise.reject(error);
            })
    }

    /**
     * Notify users 180 minutes before posting standup on channel
     */
    notifyBeforePostingStandup() {
        let rmUserArr = [];
        this.getUsers().then(res => {
            if (res.length > 0) {
                res.forEach(res => {
                    rmUserArr.push(res.username);
                });
                console.log("Unsubscribed users = " + rmUserArr)
            }
        });
        this.getLateSubmitters().then(res => {
            let lateSubmitters
            if (res.length > 0) {
                lateSubmitters = res
                console.log("Late submitters before filter = " + lateSubmitters)
                lateSubmitters = lateSubmitters.filter(
                    item => !rmUserArr.includes(item)
                );
            }
            if (lateSubmitters.length > 0) {
                res.forEach(user => {
                    this.sendMessageToUser(user, pickRandomReminderMsg());
                });
            }
            console.log("Late submitters after filter = " + lateSubmitters)

        });
    }

    /**
     * Post formatted standups to channel
     */
    postTeamStandupsToChannel() {
        let todayFormatted = moment(today, "YYYY-MM-DD").format("MMM Do YYYY")
        let standupUpdate = `*📅 Showing Ona Standup Updates On ${todayFormatted}*\n\n`;
        AppBootstrap.userStandupRepo
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
                        let todayFormatted = moment(today, "YYYY-MM-DD").format("MMM Do YYYY")
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

    postIndividualStandupToChannel(item) {
        let todayFormatted = moment(today, "YYYY-MM-DD").format("MMM Do YYYY")
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

    getHistory(username, daysToSubtract) {
        let momentStartDate = moment().subtract(daysToSubtract, 'days').calendar();
        let startDate = moment(momentStartDate, "L").format("YYYY-MM-DD")
        console.log("Fetching history between " + startDate + " and " + today)
        return AppBootstrap.userStandupRepo.getHistory(username, startDate, today)
            .then((res) => {
                return Promise.resolve(res)
            })
            .catch(error => {
                if (error.code === ErrorCode.PlatformError) {
                    console.log("error message", error.message);
                    console.log("error message", error.data);
                } else {
                    console.error;
                }
                return Promise.reject(error);
            })
    }

    /**
     * Interact with users v
     */
    respondToMessages() { }

    /**
     *
     * @param {trigerId used to load form} triggerId
     * @param {dialog elements} dialog
     */
    openDialog(triggerId, dialog) {
        return web.dialog
            .open({ trigger_id: triggerId, dialog: JSON.stringify(dialog) })
            .then(res => {
                console.log("Open dialog res: %o ", res);
                return Promise.resolve(res);
            })
            .catch(error => {
                if (error.code === ErrorCode.PlatformError) {
                    console.log(error.message);
                    console.log(error.data);
                } else {
                    console.error;
                }
                return Promise.reject(error);
            });
    }
}

module.exports = AutoStandup;
