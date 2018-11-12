class TeamStandup{
    constructor(dao){
        this.dao = dao
    }
    createTable(){
        const sql =`
        CREATE TABLE IF NOT EXISTS team_standups(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id INTEGER NOT NULL,
            date_posted TEXT  DEFAULT DATETIME('now','localtime'),
            standup TEXT NOT NULL,
            CONSTRAINT ts_fk_team_id FOREIGN KEY (team_id) REFERENCES teams(id)
            ON UPDATE CASCADE ON DELETE CASCADE
        )
        `
        return this.dao.run(sql)
    }
    add(teamStandup) {
        const { team_id, date_posted, standup } = teamStandup
        const insertStatement = `INSERT INTO team_standups (team_id,date_posted,standup)
         VALUES (?,?,?)`
        this.dao.run(insertStatement, [team_id,date_posted,standup])
    }

    update(teamStandup) {
        const {id, team_id, date_posted, standup } = teamStandup
        const updateStatement = `UPDATE team_standups SET team_id = ?, date_posted = ?,
        standup = ? WHERE id = ? 
        `
        return this.dao.run(updateStatement, [team_id, date_posted, standup, id])
    }

    delete(id) {
        const deleteStatement = "DELETE FROM team_standups WHERE id = ?"
        return this.dao.run(deleteStatement, [id])
    }
    getById(id) {
        const statement = "SELECT * FROM team_standups WHERE id = ?"
        return this.dao.get(statement, [id])
    }
    getByTeamId(teamId){
        const statement = "SELECT * FROM team_standups WHERE team_id = ?"
        return this.dao.get(statement, [teamId])
    }
    getAllTeamStandups() {
        const statement = "SELECT * FROM teams_standups"
        return this.dao.all(statement)
    }
}

module.exports = TeamStandup