import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('autocare.db');

// Create tables if not exists
db.execSync(`
  CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT);
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    url TEXT,
    read INTEGER DEFAULT 0,
    timestamp TEXT NOT NULL,
    module TEXT,
    event TEXT
  );
`);

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

export const notificationsDB = {
  getAll() {
    return db.getAllSync('SELECT * FROM notifications ORDER BY timestamp DESC');
  },
  insert(notification) {
    db.runSync(
      'INSERT OR REPLACE INTO notifications (id, title, body, url, read, timestamp, module, event) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      notification.id,
      notification.title,
      notification.body,
      notification.url || null,
      notification.read ? 1 : 0,
      notification.timestamp,
      notification.module || null,
      notification.event || null
    );
  },
  markAsRead(id) {
    db.runSync('UPDATE notifications SET read = 1 WHERE id = ?', id);
  },
  markAllAsRead() {
    db.runSync('UPDATE notifications SET read = 1');
  },
  clearAll() {
    db.runSync('DELETE FROM notifications');
  },
  getUnreadCount() {
    const result = db.getFirstSync('SELECT COUNT(*) as count FROM notifications WHERE read = 0');
    return result?.count || 0;
  },
};