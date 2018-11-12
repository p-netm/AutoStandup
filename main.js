const Promise = require("bluebird")
const AppDao = require("./dao")
const UserRepository = require("./repositories/users-repo")
const TeamRepository = require("./repositories/teams-repo")
const TeamStandupsRepository = require("./repositories/team-standups-repo")
const UserStandupsRepository = require("./repositories/user-standups-repo")

function main() {

    const dao = new AppDao("./db.sqlite3")
    const userRepo = new UserRepository(dao)
   
}

module.exports = main