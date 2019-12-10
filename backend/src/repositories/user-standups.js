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
            blockers TEXT NULL,
            date_posted TEXT NOT NULL,
            status INTEGER DEFAULT 0,
            deleted INTEGER DEFAULT 0
        )
        `;
        return this.dao.run(sql)
    }

    add(userStandup) {
        const {username, standup_today, team, standup_previous, blockers, date_posted, status} = userStandup;
        const insertStatement = `INSERT INTO user_standups (username,standup_today,team,standup_previous,blockers,date_posted,status)
         VALUES (?,?,?,?,?,?,?)`;
        this.dao.run(insertStatement, [username, standup_today, team, standup_previous, blockers, date_posted, status])
    }

    update(userStandup) {
        const {id, username, standup_today, team, standup_previous, blockers, date_posted, status} = userStandup;
        const updateStatement = `UPDATE user_standups SET username = ?, standup_today = ?,
        team = ?, standup_previous = ?, blockers = ?, date_posted = ?, status = ? WHERE id = ? 
        `;
        return this.dao.run(updateStatement, [username, standup_today, team, standup_previous, blockers, date_posted, status, id])
    }

    updateStatus(date) {
        const updateStatement = `UPDATE user_standups SET  status = 1 WHERE id > 1 AND date_posted ?`;
        return this.dao.run(updateStatement[date])
    }

    delete(id) {
        const deleteStatement = "DELETE FROM user_standups WHERE id = ?";
        return this.dao.run(deleteStatement, [id])
    }

    getById(id) {
        const statement = "SELECT * FROM user_standups WHERE id = ?";
        return this.dao.get(statement, [id])
    }

    getByUsername(username) {
        const statement = "SELECT * FROM user_standups WHERE username = ?";
        return this.dao.all(statement, [username])
    }

    getHistory(username, startDate, endDate) {
        const statement = "SELECT * FROM user_standups WHERE username = ? AND DATE(date_posted) BETWEEN ? AND ? ORDER BY date_posted DESC";
        return this.dao.all(statement, [username, startDate, endDate])
    }

    getByTeam(team, datePosted) {
        const statement = "SELECT * FROM user_standups WHERE team = ? AND date_posted = ? AND status = 0 ORDER BY team ASC";
        return this.dao.all(statement, [team, datePosted])
    }

    getAllTeams() {
        const statement = "SELECT DISTINCT team FROM user_standups WHERE team IS NOT NULL ORDER BY team ASC ";
        return this.dao.all(statement)
    }

    getByDatePosted(datePosted) {
        const statement = "SELECT * FROM user_standups WHERE date_posted = ? AND status = 0 ORDER BY team ASC";
        return this.dao.all(statement, [datePosted])
    }

    getByUserAndDate(username, datePosted) {
        const statement = "SELECT * FROM user_standups WHERE date_posted = ? AND username = ? AND status = 0 ORDER BY" +
            " id DESC LIMIT 1";
        return this.dao.all(statement, [datePosted, username])
    }

    getUsersWhoSubmittedByDate(datePosted) {
        const statement = "SELECT DISTINCT username FROM user_standups WHERE date_posted = ?";
        return this.dao.all(statement, [datePosted])
    }

    getAllUserStandups() {
        const statement = "SELECT * FROM users_standups  WHERE team IS NOT NULL ORDER BY team";
        return this.dao.all(statement)
    }

    getAllDetails() {
        const statement = "SELECT user_id, standup_today, standup_previous, team, profile FROM user_standups JOIN channel_members ON user_standups.username = channel_members.user_id ";
        return this.dao.all(statement);
    }
}

module.exports = UserStandup;
