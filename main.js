const Promise = require("bluebird")
const AppDao = require("./dao")
const UserRepository = require("./repositories/users-repo")
const TeamRepository = require("./repositories/teams-repo")
const TeamStandupsRepository = require("./repositories/team-standups-repo")
const UserStandupsRepository = require("./repositories/user-standups-repo")

function main() {
  //  initDb()
}

function initDb() {
    let initStatus = false
    const dao = new AppDao("./db.sqlite3")
    const userRepo = new UserRepository(dao)
    const teamRepo = new TeamRepository(dao)
    const teamStandupRepo = new TeamStandupsRepository(dao)
    const userStandupRepo = new UserStandupsRepository(dao)

    //Create tables
    teamRepo.createTable()
        .then(() => { teamStandupRepo.createTable() })
        .then(() => { userRepo.createTable() })
        .then(() => { userStandupRepo.createTable() })
        .catch((err) => {
            console.log('Error: ')
            console.log(JSON.stringify(err))
        })

    //populate teams
    const teams = [
        { name: "OpenSRP", project_lead: "Ephraim Muhia", project_manager: "Carolyn" },
        { name: "Gisida", project_lead: null, project_manager: null },
        { name: "Canopy", project_lead: null, project_manager: null },
        { name: "Kaznet", project_lead: null, project_manager: null },
        { name: "Zebra", project_lead: null, project_manager: null }
    ]

    Promise.all(teams.map((team) => {
        console.log(team)
        return teamRepo.add(team)
    }))

    
}

module.exports = main