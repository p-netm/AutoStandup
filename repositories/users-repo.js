class UserRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            team_id INTEGER NOT NULL,
            CONSTRAINT users_fk_team_id FOREIGN KEY (team_id) REFERENCES teams(id)
            ON UPDATE CASCADE ON DELETE CASCADE
        )
        `
        return this.dao.run(sql)
    }

    add(person) {
        const { username, team_id } = person
        const insertStatement = "INSERT INTO users (username,team_id) VALUES (?,?)"
        this.dao.run(insertStatement, [username, team_id])
    }

    update(person) {
        const { id, username, team_id } = person
        const updateStatement = "UPDATE users SET username = ? SET team_id = ? WHERE id = ?"
        return this.dao.run(updateStatement, [username, team_id, id])
    }

    delete(id) {
        const deleteStatement = "DELETE FROM users WHERE id = ?"
        return this.dao.run(deleteStatement, [id])
    }
    getById(id) {
        const statement = "SELECT * FROM users WHERE id = ?"
        return this.dao.get(statement, [id])
    }
    getAllUsers() {
        const statement = "SELECT * FROM users"
        return this.dao.all(statement)
    }

    getUsersByTeam(team_id){
        const statement = "SELECT * FROM users WHERE team_id = ?"
        return this.dao.all(statement, [team_id])
    }

}

module.exports = UserRepository