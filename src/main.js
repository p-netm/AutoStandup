const AppDao = require("./dao")
const UserRepository = require("./repositories/users-repo")
const TeamRepository = require("./repositories/teams-repo")
const TeamStandupsRepository = require("./repositories/team-standups-repo")
const UserStandupsRepository = require("./repositories/user-standups-repo")

const dao = new AppDao("../db.sqlite3")
const userRepo = new UserRepository(dao)
const teamRepo = new TeamRepository(dao)
const teamStandupRepo = new TeamStandupsRepository(dao)
const userStandupRepo = new UserStandupsRepository(dao)

function main() {
    initDb()
}

function initDb() {
    //Create tables
    teamRepo.createTable()
        .then(() => { teamStandupRepo.createTable() })
        .then(() => { userRepo.createTable() })
        .then(() => { userStandupRepo.createTable() })
        .catch((err) => {
            console.log('Error: ')
            console.log(JSON.stringify(err))
        })

}

module.exports = { main, userRepo, teamRepo, teamStandupRepo, userStandupRepo }