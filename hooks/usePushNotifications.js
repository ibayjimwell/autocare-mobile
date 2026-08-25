import { useEffect, useRef } from 'react';
import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    sound: 'notification_sound.wav',
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;
  } else {
    console.log('Must use physical device for push notifications');
  }
  return token;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!user?.id) return;

    // Register token
    registerForPushNotificationsAsync().then(token => {
      if (!token) return;
      api.request(
        '/customers/push-subscriptions',
        'POST',
        { customerId: user.id, expoPushToken: token },
        true
      ).catch(err => console.error('Failed to save push token:', err));
    });

    // Listener for incoming notifications while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data || {};
      const title = notification.request.content.title || 'AutoCare Notification';
      const body = notification.request.content.body || '';
      console.log('📱 Notification received:', title, body);
      // Save to local DB
      addNotification({
        title,
        body,
        url: data.url || null,
        module: data.module || 'app',
        event: data.event || 'push',
      });
    });

    // Listener for user tapping a notification (opens app)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data || {};
      const url = data.url || null;
      const title = response.notification.request.content.title || 'AutoCare Notification';
      const body = response.notification.request.content.body || '';
      // Save to local DB (it may not have been saved if app was in background)
      addNotification({
        title,
        body,
        url,
        module: data.module || 'app',
        event: data.event || 'push',
      });
      // Navigate using Linking if url is present
      if (url) {
        Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user?.id]);

  return null;
}