class UserRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL
        )
        `;
        return this.dao.run(sql)
    }

    add(username) {
        const insertStatement = "INSERT INTO users (username) VALUES (?)";
        this.dao.run(insertStatement, [username])
    }

    update(person) {
        const { id, username } = person;
        const updateStatement = "UPDATE users SET username = ? WHERE id = ?";
        return this.dao.run(updateStatement, [username, id])
    }

    delete(id) {
        const deleteStatement = "DELETE FROM users WHERE id = ?";
        return this.dao.run(deleteStatement, [id])
    }
    deleteByUsername(username) {
        const deleteByUsernameStatement = "DELETE FROM users WHERE username = ?";
        return this.dao.get(deleteByUsernameStatement, [username])
    }
    getById(id) {
        const statement = "SELECT * FROM users WHERE id = ?";
        return this.dao.get(statement, [id])
    }
    getByUsername(username) {
        const statement = "SELECT * FROM users WHERE username = ?";
        return this.dao.get(statement, [username])
    }
    getAllUsers() {
        const statement = "SELECT  * FROM users";
        return this.dao.all(statement)
    }

}

module.exports = UserRepository;