// context/NotificationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { notificationsDB } from '../utils/storage';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    const all = notificationsDB.getAll();
    setNotifications(all);
    setUnreadCount(notificationsDB.getUnreadCount());
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 6),
      title: notification.title,
      body: notification.body,
      url: notification.url || null,
      read: false,
      timestamp: new Date().toISOString(),
      module: notification.module || 'app',
      event: notification.event || 'push',
    };
    notificationsDB.insert(newNotif);
    loadNotifications();
  };

  const markAsRead = (id) => {
    notificationsDB.markAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = () => {
    notificationsDB.markAllAsRead();
    loadNotifications();
  };

  const clearAll = () => {
    notificationsDB.clearAll();
    loadNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}