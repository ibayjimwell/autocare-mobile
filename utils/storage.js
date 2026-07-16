import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('autocare.db');

// Create table if not exists (run once)
db.execSync(
  `CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT);`
);

export const storage = {
  getItem(key) {
    const result = db.getFirstSync('SELECT value FROM kv WHERE key = ?', key);
    return result?.value ?? null;
  },
  setItem(key, value) {
    db.runSync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', key, value);
  },
  removeItem(key) {
    db.runSync('DELETE FROM kv WHERE key = ?', key);
  },
};