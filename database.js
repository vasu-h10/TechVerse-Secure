const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(
  path.join(__dirname, "techverse.db")
);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log("TechVerse SQLite database connected!");

module.exports = db;
