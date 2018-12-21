AUTOSTANDUP
===========


This is a simple application to demonstrate how to build a chatbot using Slack API with Nodejs . 
The purpose of the app is to prompt daily standups from team members and post what each member is working on.

The bot will prompt users for standups every working day and remind those who haven't submitted before posting to the standup's channel. 
A person can opt to unsubscribe from the notification service or subscribe back when desired.

Setup
-----

**PREREQUISITES**

------------------------------------------------------------------------

To package and run this application, you'll need to:


* [Install and configure npm globally on your machine](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
* [Install and configure Docker globally on your machine](https://docs.docker.com/compose/install/)
* Clone this repository:

      $ git clone https://github.com/kahummer/AutoStandup.git
      $ cd AutoStandup



**Building the Package**

------------------------------------------------------------------------

Run the following commands from the root directory of the project.

```

docker-compose up

```

The Docker container will then install all the necessary packages required for the project and make the application accessible via `127.0.0.1:7777`
