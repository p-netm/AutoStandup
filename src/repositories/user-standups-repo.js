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
            date_posted TEXT NOT NULL         
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
        const { id, username, standup_for, team, standup, date_posted } = userStandup
        const updateStatement = `UPDATE user_standups SET username = ?, standup_for = ?,
        team = ?, standup = ?, date_posted = ?  WHERE id = ? 
        `
        return this.dao.run(updateStatement, [username, standup_for, team, standup,date_posted, id])
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
        return this.dao.get(statement, [username])
    }
    getByTeam(team) {
        const statement = "SELECT * FROM user_standups WHERE team = ?"
        return this.dao.get(statement, [team])
    } 
    getByDatePosted(datePosted) {
        const statement = "SELECT * FROM user_standups WHERE date_posted = ?"
        return this.dao.get(statement, [datePosted])
    }    
    getAllUserStandups() {
        const statement = "SELECT * FROM users_standups"
        return this.dao.all(statement)
    }

}

module.exports = UserStandup