class TokenRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS token(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value TEXT NOT NULL
        )
        `;
        return this.dao.run(sql)
    }

    add(payload) {
        const insertStatement = "INSERT INTO token (value) VALUES (?)";
        this.dao.run(insertStatement, [payload])
    }
    flush() {
        const statement = "DELETE  * FROM token";
        return this.dao.all(statement)
    }

}

module.exports = TokenRepository;
