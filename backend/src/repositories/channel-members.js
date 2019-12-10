class MemberRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS channel_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            profile TEXT NOT NULL
        )
        `;
        return this.dao.run(sql)
    }

    addMember(person) {
        const insertStatement = "INSERT INTO channel_members (user_id, profile) VALUES (?,?)";
        this.dao.run(insertStatement, [person.user_id, JSON.stringify(person.profile)])
    }

    countMembers() {
        const statement = "SELECT count(*) as value FROM channel_members";
        return this.dao.get(statement);
    }

    flushMembers() {
        const seqStatement = "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'channel_members'";
        const deleteStatement = "DELETE FROM channel_members";
        return this.dao.run(deleteStatement).then(() => this.dao.run(seqStatement));
    }

    getAllChannelMembers() {
        const statement = "SELECT  * FROM channel_members";
        return this.dao.all(statement)
    }

    getMemberProfile(userId) {
        const statement = "SELECT  profile FROM channel_members WHERE user_id = ?";
        return this.dao.get(statement, [userId])
    }

}

module.exports = MemberRepository;
