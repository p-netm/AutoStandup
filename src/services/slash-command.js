if (process.env.NODE_ENV !== "production") {
  const dotenv = require("dotenv"); //Configure environmental variables
  const result = dotenv.config();

  if (result.error) {
    throw result.error;
  }
}
const express = require("express");
const SlashCommandRouter = express.Router();
const debug = require("debug")("onaautostandup:slash-command-route");
const signature = require("../routes/guards/verify-signature");
const moment = require("moment");
const AutoStandup = require("../routes/slack");
const slackBot = new AutoStandup();

function formatAttachements(content) {
  if (content.length > 0) {

    let attachments = []

    content.forEach(item => {
     let theDate = moment(item.date_posted,"YYYY-MM-DD").format("dddd, MMM Do YYYY")
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
SlashCommandRouter.post("/slashcmd/new", function (req, res) {
  let { text, user_id, trigger_id } = req.body;
  if (signature.isVerified(req)) {
    const dialog = {
      title: "Submit standup update",
      callback_id: "submit-standup",
      submit_label: "Submit",
      state: moment().format("YYYY-MM-DD"),
      elements: [
        {
          label: "Post as",
          type: "select",
          name: "team",
          options: [
            { label: "Individual", value: "None" },
            { label: "OpenSRP", value: "Open SRP" },
            { label: "Canopy", value: "Canopy" },
            { label: "Kaznet", value: "Kaznet" },
            { label: "Zebra", value: "Zebra" },
            { label: "Ona Data", value: "Ona Data" },
            { label: "Gisida", value: "Gisida" },
            { label: "Other", value: "Other" }
          ],
          hint:
            "You can post individual standup or as team. Team standups will be group together"
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

    switch (text.trim()) {
      case "week-history":
        slackBot.getHistory(user_id, 7)
          .then((data) => {
            if (data !== undefined && data.length > 0) {          
              slackBot.postMessageToUser(user_id, "*📅 Showing your standup updates for the past week*",
                formatAttachements(data))
            } else {
              slackBot.postMessageToUser(user_id, `Hi <@${user_id}>, You currently have no standup updates.`, [])
            }
            res.status(200).send("Request received!")
          })
        break
      case "month-history":
        slackBot.getHistory(user_id, 30)
          .then((data) => {
            if (data !== undefined && data.length > 0) {            
              slackBot.postMessageToUser(user_id, "*📅 Showing your standup updates for the past month*",
                formatAttachements(data))
            } else {
              slackBot.postMessageToUser(user_id, `Hi <@${user_id}>, You currently have no standup updates in your history`, [])
            }
            res.status(200).send("Request received!")
          })
        break
      case "unsubscribe":
        slackBot.checkUser(user_id).then((user) => {
          if (user === undefined) {
            res
              .status(200)
              .send({
                text: `Hi,<@${user_id}> you have *successfuly* \`unsubscribed\` from the atostandup notification service`
              })
            slackBot.saveUser(user_id)

          } else {
            res
              .status(200)
              .send({
                text: `Hi,<@${user_id}> you have *already* \`unsubscribed\` from the atostandup notification service`
              });
          }
        });
        break;
      case "subscribe":
        slackBot.checkUser(user_id).then((user) => {
          //if user exist we inform he is already subscribed.
          console.log('user', user)
          if (user !== undefined) {
            res
              .status(200)
              .send({
                text: `Hi,<@${user_id}> you are *subcribed* \`back\` to the atostandup notification service`
              })
            slackBot.deleteUser(user_id)
          } else {
            res
              .status(200)
              .send({
                text: `Hi,<@${user_id}> you are *already* \`subscribed\` to the atostandup notification service`
              })
          }

        });
        break
      case "post":
        slackBot.openDialog(trigger_id, dialog).then(result => {
          if (result.ok === true) {
            res.status(200).send("");
          } else {
            res.status(500).end();
          }
        });
        break;
      case "help":
        attachments = [
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

        ]
        slackBot.postMessageToUser(user_id, `*Hi <@${user_id}>, need some help?*`, attachments)
        res.status(200).send('')
        break;
      default:
        res.status(200).send("😞 Sorry I don't recognize that command. type *`/standup help`*  for help. To submit standup use  *`/standup post`*");
        break
    }
  } else {
    debug("Verification token mismatch");
    res.status(404).end();
  }
});

//Test get request from slack
// SlashCommandRouter.get('/slashcmd', function (req, res) {
//     res.status(200).send("Cool! Everything works for Slash command! Congratulations!!")
// })

module.exports = SlashCommandRouter;
