class UserStandup{
    constructor(dao){
        this.dao = dao
    }
    createTable(){
        const sql =`
        CREATE TABLE IF NOT EXISTS user_standups(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date_posted TEXT  DEFAULT DATETIME('now','localtime'),
            standup TEXT NOT NULL,
            CONSTRAINT us_fk_user_id FOREIGN KEY (user_id) REFERENCES users(id)
            ON UPDATE CASCADE ON DELETE CASCADE
        )
        `
        return this.dao.run(sql)
    }
    add(userStandup) {
        const { user_id, date_posted, standup } = userStandup
        const insertStatement = `INSERT INTO user_standups (user_id,date_posted,standup)
         VALUES (?,?,?)`
        this.dao.run(insertStatement, [user_id,date_posted,standup])
    }

    update(userStandup) {
        const {id, user_id, date_posted, standup } = userStandup
        const updateStatement = `UPDATE user_standups SET user_id = ?, date_posted = ?,
        standup = ? WHERE id = ? 
        `
        return this.dao.run(updateStatement, [user_id, date_posted, standup, id])
    }

    delete(id) {
        const deleteStatement = "DELETE FROM user_standups WHERE id = ?"
        return this.dao.run(deleteStatement, [id])
    }
    getById(id) {
        const statement = "SELECT * FROM user_standups WHERE id = ?"
        return this.dao.get(statement, [id])
    }
    getByUserId(userId){
        const statement = "SELECT * FROM user_standups WHERE user_id = ?"
        return this.dao.get(statement, [userId])
    }
    getAllUserStandups() {
        const statement = "SELECT * FROM users_standups"
        return this.dao.all(statement)
    }
}

module.exports = UserStandup