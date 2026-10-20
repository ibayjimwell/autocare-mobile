import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('autocare.db');

// Retain the existing KV table, authentication storage, and SQLite filename.
// Existing notification rows remain untouched. Older rows without an owner
// are deliberately not shown to a newly signed-in customer: their ownership
// cannot be established safely after the fact.
db.execSync(`
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT
  );
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

const columns = db.getAllSync('PRAGMA table_info(notifications)');
const columnNames = new Set(columns.map((column) => column.name));
if (!columnNames.has('customer_id')) {
  db.execSync('ALTER TABLE notifications ADD COLUMN customer_id TEXT');
}
if (!columnNames.has('remote_id')) {
  db.execSync('ALTER TABLE notifications ADD COLUMN remote_id TEXT');
}

db.execSync(`
  CREATE INDEX IF NOT EXISTS autocare_notifications_customer_time_idx
    ON notifications(customer_id, timestamp DESC);
  CREATE TABLE IF NOT EXISTS notification_dismissals (
    customer_id TEXT NOT NULL,
    notification_id TEXT NOT NULL,
    PRIMARY KEY (customer_id, notification_id)
  );
  CREATE TABLE IF NOT EXISTS notification_sync_actions (
    id TEXT PRIMARY KEY NOT NULL,
    customer_id TEXT NOT NULL,
    action TEXT NOT NULL,
    notification_id TEXT,
    before_timestamp TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS autocare_notification_actions_customer_idx
    ON notification_sync_actions(customer_id, created_at);
`);

function stableLocalId(customerId, notificationId) {
  return `${customerId}:${notificationId}`;
}

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
  getAll(customerId) {
    if (!customerId) return [];
    return db.getAllSync(
      'SELECT * FROM notifications WHERE customer_id = ? ORDER BY timestamp DESC, id DESC',
      customerId,
    );
  },

  getUnreadCount(customerId) {
    if (!customerId) return 0;
    const result = db.getFirstSync(
      'SELECT COUNT(*) AS count FROM notifications WHERE customer_id = ? AND read = 0',
      customerId,
    );
    return Number(result?.count || 0);
  },

  // Upsert is idempotent. A foreground push, background-tap, and server sync
  // share the same ID. An already-read notification never turns unread again.
  insert(notification, customerId) {
    if (!customerId || !notification?.id) return;
    const rawId = String(notification.id);
    const dismissed = db.getFirstSync(
      'SELECT 1 AS hidden FROM notification_dismissals WHERE customer_id = ? AND notification_id = ?',
      customerId, rawId,
    );
    if (dismissed) return;
    const id = stableLocalId(customerId, rawId);
    const remoteId = typeof notification.remoteId === 'string'
      ? notification.remoteId : null;
    db.runSync(`
      INSERT INTO notifications
        (id, title, body, url, read, timestamp, module, event, customer_id, remote_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        body = excluded.body,
        url = COALESCE(excluded.url, notifications.url),
        read = CASE WHEN notifications.read = 1 OR excluded.read = 1 THEN 1 ELSE 0 END,
        timestamp = excluded.timestamp,
        module = excluded.module,
        event = excluded.event,
        remote_id = COALESCE(excluded.remote_id, notifications.remote_id)
    `,
    id,
    String(notification.title || 'AutoCare Notification'),
    String(notification.body || ''),
    typeof notification.url === 'string' ? notification.url : null,
    notification.read ? 1 : 0,
    notification.timestamp || new Date().toISOString(),
    notification.module || 'app',
    notification.event || 'push',
    customerId,
    remoteId,
    );
  },

  markAsRead(id, customerId) {
    if (!customerId) return null;
    const record = db.getFirstSync(
      'SELECT remote_id FROM notifications WHERE id = ? AND customer_id = ?',
      id, customerId,
    );
    if (!record) return null;
    db.runSync(
      'UPDATE notifications SET read = 1 WHERE id = ? AND customer_id = ?',
      id, customerId,
    );
    return record.remote_id;
  },

  markAllAsRead(customerId, before) {
    if (!customerId) return;
    db.runSync(
      'UPDATE notifications SET read = 1 WHERE customer_id = ? AND timestamp <= ?',
      customerId, before,
    );
  },

  clearAll(customerId) {
    if (!customerId) return;
    // Keep local tombstones to prevent a delayed OS notification response
    // from repopulating items the customer explicitly cleared.
    const existing = db.getAllSync(
      'SELECT id FROM notifications WHERE customer_id = ?', customerId,
    );
    const prefix = `${customerId}:`;
    for (const row of existing) {
      const rawId = row.id.startsWith(prefix) ? row.id.slice(prefix.length) : row.id;
      db.runSync(
        'INSERT OR IGNORE INTO notification_dismissals (customer_id, notification_id) VALUES (?, ?)',
        customerId, rawId,
      );
    }
    db.runSync('DELETE FROM notifications WHERE customer_id = ?', customerId);
  },

  // Durable action queue: read/clear decisions made offline are retried on
  // next synchronization instead of silently being lost.
  enqueueAction(customerId, action, notificationId = null, before = null) {
    if (!customerId) return;
    const createdAt = new Date().toISOString();
    const id = `${createdAt}-${Math.random().toString(36).slice(2)}`;
    db.runSync(
      `INSERT INTO notification_sync_actions
         (id, customer_id, action, notification_id, before_timestamp, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id, customerId, action, notificationId, before, createdAt,
    );
  },

  getPendingActions(customerId) {
    if (!customerId) return [];
    return db.getAllSync(
      'SELECT * FROM notification_sync_actions WHERE customer_id = ? ORDER BY created_at ASC, id ASC',
      customerId,
    );
  },

  removePendingAction(id, customerId) {
    db.runSync(
      'DELETE FROM notification_sync_actions WHERE id = ? AND customer_id = ?',
      id, customerId,
    );
  },

  // Run only after an exhaustive successful server sync. Remove local copies
  // of server records deleted from another device, not native-only pushes.
  reconcileServerRecords(customerId, remoteIds) {
    if (!customerId) return;
    const rows = db.getAllSync(
      'SELECT id, remote_id FROM notifications WHERE customer_id = ? AND remote_id IS NOT NULL',
      customerId,
    );
    for (const row of rows) {
      if (!remoteIds.has(row.remote_id)) {
        db.runSync('DELETE FROM notifications WHERE id = ? AND customer_id = ?', row.id, customerId);
      }
    }
  },
};
