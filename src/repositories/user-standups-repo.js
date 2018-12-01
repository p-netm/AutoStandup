class UserStandup {
    constructor(dao) {
        this.dao = dao
    }
    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS user_standups(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            standup_today TEXT  NOT NULL, 
            team TEXT NULL,                      
            standup_previous TEXT NULL,
            date_posted TEXT NOT NULL,
            status INTEGER DEFAULT 0

        )
        `
        return this.dao.run(sql)
    }
    add(userStandup) {
        const { username, standup_today, team, standup_previous, date_posted, status} = userStandup
        const insertStatement = `INSERT INTO user_standups (username,standup_today,team,standup_previous,date_posted,status)
         VALUES (?,?,?,?,?,?)`
        this.dao.run(insertStatement, [username, standup_today, team, standup_previous, date_posted,status])
    }

    update(userStandup) {
        const { id, username, standup_today, team, standup_previous, date_posted, status } = userStandup
        const updateStatement = `UPDATE user_standups SET username = ?, standup_today = ?,
        team = ?, standup_previous = ?, date_posted = ?, status = ? WHERE id = ? 
        `
        return this.dao.run(updateStatement, [username, standup_today, team, standup_previous, date_posted, status, id])
    }
    updateStatus(id) {
        const updateStatement = `UPDATE user_standups SET  status = 1 WHERE id = ?`
        return this.dao.run(updateStatement[id])
    }

    delete(id) {
        const deleteStatement = "DELETE FROM user_standups WHERE id = ?"
        return this.dao.run(deleteStatement, [id])
    }
    getById(id) {
        const statement = "SELECT * FROM user_standups WHERE id = ?"
        return this.dao.get(statement, [id])
    }
    getByUsername(username) {
        const statement = "SELECT * FROM user_standups WHERE username = ?"
        return this.dao.all(statement, [username])
    }
    getByTeam(team,datePosted) {
        const statement = "SELECT * FROM user_standups WHERE team = ? AND date_posted = ? AND status = 0 ORDER BY team ASC"
        return this.dao.all(statement, [team,datePosted])
    }
    getAllTeams() {
        const statement = "SELECT DISTINCT team FROM user_standups WHERE team IS NOT NULL ORDER BY team ASC "
        return this.dao.all(statement)
    }
    getByDatePosted(datePosted) {
        const statement = "SELECT * FROM user_standups WHERE date_posted = ? AND status = 0 ORDER BY team ASC"
        return this.dao.all(statement, [datePosted])
    }    
    getAllUserStandups() {
        const statement = "SELECT * FROM users_standups  WHERE team IS NOT NULL ORDER BY team"
        return this.dao.all(statement)
    }

}

module.exports = UserStandup