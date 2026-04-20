const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const DB_TYPE = process.env.DB_TYPE || (process.env.POSTGRES_URL ? 'postgres' : 'sqlite');

let sqliteDb;
let pgPool;

if (DB_TYPE === 'postgres') {
    console.log('--- Initializing Cloud Postgres Interface ---');
    pgPool = new Pool({
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
} else {
    console.log(`--- Initializing ${IS_PRODUCTION ? 'Production' : 'Local'} SQLite Interface ---`);
    // On Render, mount your disk to /opt/render/project/src/db
    const defaultPath = path.join(__dirname, '../db/marrakech_luxe.db');
    const dbPath = process.env.SQLITE_PATH || defaultPath;
    sqliteDb = new sqlite3.Database(dbPath);
}

const dbAdapter = {
    async all(query, params = []) {
        if (IS_PRODUCTION) {
            const res = await pgPool.query(query.replace(/\?/g, (match, index) => `$${params.indexOf(params[index]) + 1}`), params);
            // Translate: Postgres uses $1, $2. Our current code uses ?.
            // Simple mapping for positional arguments:
            let pgQuery = query;
            let pCount = 1;
            while(pgQuery.includes('?')) {
                pgQuery = pgQuery.replace('?', '$' + pCount++);
            }
            const resReal = await pgPool.query(pgQuery, params);
            return resReal.rows;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        }
    },

    async get(query, params = []) {
        if (IS_PRODUCTION) {
            let pgQuery = query;
            let pCount = 1;
            while(pgQuery.includes('?')) {
                pgQuery = pgQuery.replace('?', '$' + pCount++);
            }
            const res = await pgPool.query(pgQuery, params);
            return res.rows[0];
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.get(query, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }
    },

    async run(query, params = []) {
        if (IS_PRODUCTION) {
            let pgQuery = query;
            let pCount = 1;
            while(pgQuery.includes('?')) {
                pgQuery = pgQuery.replace('?', '$' + pCount++);
            }
            const res = await pgPool.query(pgQuery, params);
            return { lastID: null, changes: res.rowCount };
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.run(query, params, function(err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            });
        }
    },

    async exec(query) {
        if (IS_PRODUCTION) {
            return pgPool.query(query);
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.exec(query, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    }
};

module.exports = dbAdapter;
