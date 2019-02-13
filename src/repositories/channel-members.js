class MemberRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS channel_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL
        )
        `;
        return this.dao.run(sql)
    }

    addMember(username) {
        const insertStatement = "INSERT INTO channel_members (username) VALUES (?)";
        this.dao.run(insertStatement, [username])
    }

    updateMember(person) {
        const { id, username } = person;
        const updateStatement = "UPDATE channel_members SET username = ? WHERE id = ?";
        return this.dao.run(updateStatement, [username, id])
    }

    deleteMember(id) {
        const deleteStatement = "DELETE FROM channel_members WHERE id = ?";
        return this.dao.run(deleteStatement, [id])
    }
    countMembers(){
        const statement = "SELECT count(*) as value FROM channel_members";
        return this.dao.get(statement);
    }
    flushMembers() {
        const deleteStatement = "DELETE FROM channel_members";
        return this.dao.run(deleteStatement);
    }
    deleteMemberByUsername(username) {
        const deleteByUsernameStatement = "DELETE FROM channel_members WHERE username = ?";
        return this.dao.get(deleteByUsernameStatement, [username])
    }
    getMemberById(id) {
        const statement = "SELECT * FROM channel_members WHERE id = ?";
        return this.dao.get(statement, [id])
    }
    getMemberByUsername(username) {
        const statement = "SELECT * FROM channel_members WHERE username = ?";
        return this.dao.get(statement, [username])
    }
    getAllChannelMembers() {
        const statement = "SELECT  * FROM channel_members";
        return this.dao.all(statement)
    }

}

module.exports = MemberRepository;