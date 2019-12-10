class TokenRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS token(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            team_id TEXT NOT NULL,
            team_name TEXT NOT NULL,
            value TEXT NOT NULL
        )
        `;
        return this.dao.run(sql)
    }

    add(userId, teamId, teamName, payload) {
        const insertStatement = "INSERT INTO token (user_id, team_id, team_name, value) VALUES (?,?,?,?)";
        this.dao.run(insertStatement, [userId, teamId, teamName, payload])
    }

    getTokenByTeam(teamName) {
        const statement = "SELECT value FROM token WHERE team_name = ?";
        return this.dao.get(statement, [teamName])
    }

    getTokenByTeamId(teamId) {
        const statement = "SELECT value FROM token WHERE team_id = ?";
        return this.dao.get(statement, [teamId])
    }

    getTokenByUserId(userId) {
        const statement = "SELECT value FROM token WHERE user_id = ?";
        return this.dao.get(statement, [userId])
    }

    deleteByTeamId(teamId) {
        const statement = "DELETE FROM token WHERE team_id = ? ";
        return this.dao.run(statement, [teamId])
    }

    flush() {
        const statement = "DELETE FROM token";
        return this.dao.all(statement)
    }

}

module.exports = TokenRepository;
