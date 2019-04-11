const onTimeService = require("./services/on-time");
const repos = require("./services/repos");

function main() {
    initDb();
    onTimeService.runSchedules();
}

function initDb() {
    //Create tables
   repos.teamRepo.createTable()
       .then(() => {
           return repos.tokenRepo.createTable()
       })
        .then(() => {
            return repos.userRepo.createTable()
        })
        .then(() => {
            return repos.memberRepository.createTable()
        })
        .then(() => {
            return repos.userStandupRepo.createTable()
        })
        .catch((err) => {
            console.log('Error: ');
            console.log(JSON.stringify(err))
        })

}

module.exports = {
    main: main,
};
