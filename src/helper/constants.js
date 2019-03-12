const moment = require("moment");
let constants = {};
module.exports = constants;
constants.botResponse = ["Got it! Thanks", "Awesome!", "Cool. Will get it posted.", "Great!", "Thank you!", "Thanks!", "You are awesome", "Yes!", "Just doing my job", "Okay!", "Alright!", "Nice, thanks"];
constants.promptResponse = ["Hey, submit your daily standup. Use `/standup post` command to submit standup; for help  `/standup help`",
    "Hi, another day to submit your standup. Use `/standup post` command to submit standup; for help  `/standup help`",
    "Hey, time for standup update. Use `/standup post` command to submit standup; for help  `/standup help`",
    "Greetings!, please submit your daily standup. Use `/standup post` command to submit standup; for help  `/standup help`"];
constants.reminderResponse = ["Hey, submit your daily standup, posting time is `2.30PM`. Don't be left out!",
    "Hi, time runs so fast. Submit your standup before `2.30PM`.",
    "Hi, your standup please am posting at `2.30PM`.",
    "Hey, in the next `2hrs` at 2.30PM team standup will be posted. Submit yours today. ",
    "Greetings!, please submit your daily standup. Time for posting is `2.30PM`"];
constants.dialog = {
    title: "Submit standup update",
    callback_id: "submit-standup",
    submit_label: "Submit",
    state: moment().format("YYYY-MM-DD"),
    elements: [
        {
            label: "Post as",
            type: "select",
            name: "team",
            placeholder: "Select team or post yours alone",
            options: [
                {label: "My own", value: "None"},
                {label: "OpenSRP", value: "Open SRP"},
                {label: "Canopy", value: "Canopy"},
                {label: "Kaznet", value: "Kaznet"},
                {label: "Zebra", value: "Zebra"},
                {label: "Ona Data", value: "Ona Data"},
                {label: "Gisida", value: "Gisida"},
                {label: "Other", value: "Other"}
            ]
        },
        {
            label: "Today's update",
            type: "textarea",
            name: "standup_today",
            optional: false,
            placeholder: "e.g - Add unit tests to Kaznet's playbook"
        },
        {
            label: "Previously/Yesterday",
            type: "textarea",
            name: "standup_previous",
            optional: true,
            placeholder: "e.g - Deployed OpenMRS and OpenSRP servers"
        }
    ]
};
constants.invalidToken = "Token mismatch";
constants.weeklyHistory = "week-history";
constants.monthlyHistory = "month-history";
constants.unsubscribe = "unsubscribe";
constants.subscribe = "subscribe";
constants.post = "post";
constants.help = "help";
constants.message = "message";
constants.attachments = [
    {
        fallback: "Post standup /standup post",
        pretext: "You can submit your standup using this",
        text: "`/standup post`",

    },
    {
        fallback: "Unsubscribe from notification standup /standup unsubscribe",
        pretext: "To unsubscribe from standup notification and prompts",
        text: "`/standup unsubscribe`",
    },
    {
        fallback: "Subscribe for notifications /standup subscribe",
        pretext: "You can always subcribe back to get notifications",
        text: "`/standup subscribe`",

    },
    {
        fallback: "Get weekly standups /standup week-history",
        pretext: "To get your standup submission for the past week",
        text: "`/standup week-history`"
    },
    {
        fallback: "Get monthly standups /standup month-history",
        pretext: "To get your standup submission for the past month",
        text: "`/standup month-history`",
    },
    {
        fallback: "Modify standup /standup edit",
        pretext: "To update your standup",
        text: "`/standup edit`"
    },
    {
        fallback: "Delete standup /standup remove",
        pretext: "To delete your standup",
        text: "`/standup remove`",
    },
    {
        fallback: "Display information standup /standup post",
        pretext: "To display your standup details. specify team/individual",
        text: "`/standup show [individual/name_of_team]`",
    },
    {
        fallback: "Show help /standup help",
        pretext: "To show this content again",
        text: "`/standup help`",
    },

];
constants.requestReceived = "Request received!";