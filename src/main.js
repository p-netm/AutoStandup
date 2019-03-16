const AppDao = require("./dao");
const UserRepository = require("./repositories/users");
const MemberRepository = require("./repositories/channel-members");
const TeamRepository = require("./repositories/teams");
const UserStandupsRepository = require("./repositories/user-standups");
const onTimeService = require("./services/on-time");
const standUpService = require("./services/stand-ups");
const chatbotService = require("./services/bot");

const dao = new AppDao(process.env.DB_PATH);
const userRepo = new UserRepository(dao);
const teamRepo = new TeamRepository(dao);
const userStandupRepo = new UserStandupsRepository(dao);
const memberRepository = new MemberRepository(dao);

function main() {
    initDb();
    onTimeService.runSchedules();
    standUpService.handleMessages();
    chatbotService.processChatJob();
}

function initDb() {
    //Create tables
    teamRepo.createTable()
        .then(() => {
            return userRepo.createTable()
        })
        .then(() => {
            return memberRepository.createTable()
        })
        .then(() => {
            return userStandupRepo.createTable()
        })
        .catch((err) => {
            console.log('Error: ');
            console.log(JSON.stringify(err))
        })

}

module.exports = {
    main: main,
    userRepo,
    teamRepo,
    userStandupRepo,
    memberRepository
};