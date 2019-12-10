const sqlite3 = require("sqlite3");
const Promise = require("bluebird");

class AppDao {
    constructor(dbFilePath) {
        this.db = new sqlite3.Database(dbFilePath, (err) => {
            if (err) {
                console.log("Database connection failed!");
                console.error(err.stack)
            } else {
                console.log("Database connection successful!")
            }
        })
    }
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    console.log("[!DDL operation] Error running sql => [" + sql + "]");
                    console.log(err);
                    reject(err)
                } else {
                    resolve({ id: this.lastID })
                }
            })
        })
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    console.log("[!Select One]Error running the sql => [" + sql + "] ");
                    console.log(err);
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.log("[!Select All]Error running the sql => [" + sql + "] ");
                    console.log(err);
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }
}

module.exports = AppDao;