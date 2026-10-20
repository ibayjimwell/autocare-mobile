import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import { notificationsDB } from '../utils/storage';
import api from '../services/api';

const NotificationContext = createContext(null);
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

/** All history is scoped to the authenticated customer, not just this device. */
export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const customerId = user?.id || null;
  const customerIdRef = useRef(customerId);
  customerIdRef.current = customerId;
  const syncingRef = useRef(false);
  const syncAgainRef = useRef(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(() => {
    const current = customerIdRef.current;
    try {
      setNotifications(notificationsDB.getAll(current));
    } catch (error) {
      console.error('[Notifications] Unable to read local history:', error);
    }
  }, []);

  const addNotification = useCallback((notification) => {
    const current = customerIdRef.current;
    if (!current || !notification) return;
    if (notification.customerId && notification.customerId !== current) return;
    const rawId = notification.notificationId || notification.id;
    if (!rawId) {
      console.warn('[Notifications] Skipped notification without stable identifier.');
      return;
    }
    try {
      notificationsDB.insert({
        id: String(rawId),
        remoteId: notification.notificationId || notification.remoteId || null,
        title: notification.title,
        body: notification.body,
        url: notification.url || null,
        timestamp: notification.timestamp || new Date().toISOString(),
        module: notification.module || 'app',
        event: notification.event || 'push',
        read: notification.read === true,
      }, current);
      loadNotifications();
    } catch (error) {
      console.error('[Notifications] Failed to persist push locally:', error);
    }
  }, [loadNotifications]);

  const flushActions = useCallback(async (forCustomer) => {
    const actions = notificationsDB.getPendingActions(forCustomer);
    for (const action of actions) {
      if (customerIdRef.current !== forCustomer) return false;
      try {
        let response;
        if (action.action === 'clear_all') {
          response = await api.request('/customers/notifications', 'DELETE', {
            before: action.before_timestamp,
          }, true);
        } else {
          response = await api.request('/customers/notifications', 'PATCH', {
            action: action.action,
            id: action.notification_id || undefined,
            before: action.before_timestamp || undefined,
          }, true);
        }
        if (response?.error) throw new Error(response.errorMessage || 'Notification sync failed.');
        notificationsDB.removePendingAction(action.id, forCustomer);
      } catch (error) {
        console.warn('[Notifications] Pending action will retry:', error?.message || error);
        return false; // Keep this and all later actions in order.
      }
    }
    return true;
  }, []);

  const syncNotifications = useCallback(async () => {
    const forCustomer = customerIdRef.current;
    if (!forCustomer) return;
    if (syncingRef.current === forCustomer) {
      syncAgainRef.current = true;
      return;
    }
    syncingRef.current = forCustomer;
    try {
      const actionsDone = await flushActions(forCustomer);
      if (!actionsDone || customerIdRef.current !== forCustomer) return;

      const remoteIds = new Set();
      let fullyFetched = false;
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await api.request(
          `/customers/notifications?page=${page}&limit=${PAGE_SIZE}`,
          'GET', null, true,
        );
        if (result?.error || !Array.isArray(result?.data)) {
          throw new Error(result?.errorMessage || 'Invalid notification inbox response.');
        }
        if (customerIdRef.current !== forCustomer) return;
        // Local read/clear actions may have been added while GET was
        // in flight. Do not reintroduce records before those actions sync.
        if (notificationsDB.getPendingActions(forCustomer).length) return;
        for (const record of result.data) {
          remoteIds.add(record.id);
          notificationsDB.insert({
            id: record.id,
            remoteId: record.id,
            title: record.title,
            body: record.body,
            url: record.url,
            timestamp: record.createdAt,
            read: Boolean(record.readAt),
            module: record.module,
            event: record.event,
          }, forCustomer);
        }
        if (result.data.length < PAGE_SIZE || result.pagination?.hasMore === false) {
          fullyFetched = true;
          break;
        }
      }
      if (customerIdRef.current !== forCustomer) return;
      if (notificationsDB.getPendingActions(forCustomer).length) return;
      // Do not prune if only a partial server page set was downloaded.
      if (fullyFetched) notificationsDB.reconcileServerRecords(forCustomer, remoteIds);
      loadNotifications();
    } catch (error) {
      // SQLite still serves previously cached history without internet.
      console.warn('[Notifications] Inbox sync will retry:', error?.message || error);
      if (customerIdRef.current === forCustomer) loadNotifications();
    } finally {
      if (syncingRef.current === forCustomer) {
        syncingRef.current = false;
        if (syncAgainRef.current) {
          syncAgainRef.current = false;
          // Schedule a follow-up after the current asynchronous run ends.
          setTimeout(() => { void syncNotifications(); }, 0);
        }
      }
    }
  }, [flushActions, loadNotifications]);

  useEffect(() => {
    // Clear the previous account immediately and load only this customer's data.
    customerIdRef.current = customerId;
    loadNotifications();
    if (!customerId) return;
    void syncNotifications();
    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncNotifications();
    });
    const poll = setInterval(() => {
      if (AppState.currentState === 'active') void syncNotifications();
    }, 60000);
    return () => {
      foreground.remove();
      clearInterval(poll);
    };
  }, [customerId, loadNotifications, syncNotifications]);

  const markAsRead = useCallback((id) => {
    const current = customerIdRef.current;
    if (!current) return;
    try {
      const remoteId = notificationsDB.markAsRead(id, current);
      if (remoteId) notificationsDB.enqueueAction(current, 'read_one', remoteId);
      loadNotifications();
      if (remoteId) void syncNotifications();
    } catch (error) {
      console.error('[Notifications] Failed to mark read:', error);
    }
  }, [loadNotifications, syncNotifications]);

  const markAllAsRead = useCallback(() => {
    const current = customerIdRef.current;
    if (!current) return;
    const before = new Date().toISOString();
    try {
      notificationsDB.markAllAsRead(current, before);
      notificationsDB.enqueueAction(current, 'read_all', null, before);
      loadNotifications();
      void syncNotifications();
    } catch (error) {
      console.error('[Notifications] Failed to mark all read:', error);
    }
  }, [loadNotifications, syncNotifications]);

  const clearAll = useCallback(() => {
    const current = customerIdRef.current;
    if (!current) return;
    const before = new Date().toISOString();
    try {
      notificationsDB.clearAll(current);
      // Remove already displayed OS notifications so a subsequent launch
      // cannot re-import those same cleared native notifications.
      void Notifications.dismissAllNotificationsAsync().catch(() => {});
      notificationsDB.enqueueAction(current, 'clear_all', null, before);
      loadNotifications();
      void syncNotifications();
    } catch (error) {
      console.error('[Notifications] Failed to clear history:', error);
    }
  }, [loadNotifications, syncNotifications]);

  // Never expose previous-account state while an account switch effect is
  // still pending, even for a single React render.
  const visibleNotifications = customerId
    ? notifications.filter((item) => item.customer_id === customerId)
    : [];
  const visibleUnreadCount = visibleNotifications.reduce(
    (count, item) => count + (item.read ? 0 : 1), 0,
  );

  return (
    <NotificationContext.Provider value={{
      notifications: visibleNotifications,
      unreadCount: visibleUnreadCount,
      addNotification,
      markAsRead, markAllAsRead, clearAll,
      loadNotifications, syncNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}
