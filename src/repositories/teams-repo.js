class TeamRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS teams(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project_lead TEXT NULL,
            project_manager TEXT NULL
        )
        `
        return this.dao.run(sql)
    }

    add(team) {
        const { name, project_lead, project_manager } = team
        const insertStatement = `INSERT INTO teams (name,project_lead,project_manager)
         VALUES (?,?,?)`
        this.dao.run(insertStatement, [name, project_lead, project_manager])
    }

    update(team) {
        const { id, name, project_lead, project_manager } = team
        const updateStatement = `UPDATE teams SET name = ?, project_lead = ?,
        project_manager = ? WHERE id = ? 
        `
        return this.dao.run(updateStatement, [name, project_lead, project_manager, id])
    }

    delete(id) {
        const deleteStatement = "DELETE FROM teams WHERE id = ?"
        return this.dao.run(deleteStatement, [id])
    }
    getById(id) {
        const statement = "SELECT * FROM teams WHERE id = ?"
        return this.dao.get(statement, [id])
    }
    getAllTeams() {
        const statement = "SELECT * FROM teams"
        return this.dao.all(statement)
    }

}
module.exports = TeamRepository