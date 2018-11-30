class UserStandup {
    constructor(dao) {
        this.dao = dao
    }
    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS user_standups(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            standup_for TEXT  NOT NULL,
            team TEXT NULL,
            standup TEXT NOT NULL,
            date_posted TEXT NOT NULL,
            status INTEGER DEFAULT 0

        )
        `
        return this.dao.run(sql)
    }
    add(userStandup) {
        const { username, standup_for, team, standup, date_posted } = userStandup
        const insertStatement = `INSERT INTO user_standups (username,standup_for,team,standup,date_posted)
         VALUES (?,?,?,?,?)`
        this.dao.run(insertStatement, [username, standup_for, team, standup, date_posted])
    }

    update(userStandup) {
        const { id, username, standup_for, team, standup, date_posted, status } = userStandup
        const updateStatement = `UPDATE user_standups SET username = ?, standup_for = ?,
        team = ?, standup = ?, date_posted = ?, status = ? WHERE id = ? 
        `
        return this.dao.run(updateStatement, [username, standup_for, team, standup, date_posted, status, id])
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
    getByTeam(team) {
        const statement = "SELECT * FROM user_standups WHERE team = ?  AND team IS NOT NULL ORDER BY team ASC"
        return this.dao.all(statement, [team])
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
        const statement = "SELECT * FROM users_standups ORDER BY team"
        return this.dao.all(statement)
    }

}

module.exports = UserStandup