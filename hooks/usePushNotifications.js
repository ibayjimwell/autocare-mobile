
import { useEffect, useRef } from 'react';
import { Platform, Linking, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    // General AutoCare notifications.
    await Notifications.setNotificationChannelAsync('autocare-general', {
      name: 'AutoCare Updates',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'notification_sound.wav',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C1272D',
    });

    // Ask Arrival notifications.
    await Notifications.setNotificationChannelAsync('autocare-arrival', {
      name: 'Arrival Questions',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'notification_sound.wav',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C1272D',
    });
  }

  if (!Device.isDevice) {
    console.log('[Push] A physical device is required for push notifications.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Notification permission not granted.');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  if (!projectId) throw new Error('Missing EAS projectId. Cannot register standalone push token.');
  const result = await Notifications.getExpoPushTokenAsync({ projectId });
  return result.data;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Keep the current callback without restarting the listener registration
  // whenever NotificationContext rerenders.
  const addNotificationRef = useRef(addNotification);
  addNotificationRef.current = addNotification;

  useEffect(() => {
    if (!user?.id) return;

    const customerId = user.id;
    let active = true;

    // Push token sync is required for standalone Android builds too.
    // A token can rotate, the network may be unavailable on launch, and
    // notification permissions may change while the application is closed.
    // Retry with bounded backoff and re-check whenever the app is foregrounded.
    let retryTimer = null;
    let attempt = 0;
    let running = false;
    let lastRegisteredToken = null;
    const synchronizeToken = async () => {
      if (!active || running) return;
      running = true;
      try {
        const token = await registerForPushNotificationsAsync();
        if (!active || !token) return;
        // Always sync after app foreground to recover an expired backend record.
        const result = await api.request('/customers/push-subscriptions', 'POST', {
          customerId,
          expoPushToken: token,
        }, true);
        if (result?.error) throw new Error(result.errorMessage || 'Unable to register push token.');
        if (!active) return;
        lastRegisteredToken = token;
        attempt = 0;
        console.log('[Push] Device subscription synchronized for standalone build.');
      } catch (error) {
        if (!active) return;
        console.warn('[Push] Token sync failed; will retry:', error?.message || error);
        attempt += 1;
        const delay = Math.min(120000, 2500 * Math.pow(2, Math.min(attempt - 1, 6)));
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(() => { retryTimer = null; void synchronizeToken(); }, delay);
      } finally {
        running = false;
      }
    };
    void synchronizeToken();
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && active) {
        if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
        void synchronizeToken();
      }
    });

    // Listen for notifications received while the app is in the foreground.
    const notificationSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data || {};
        const title =
          notification.request.content.title || 'AutoCare Notification';
        const body = notification.request.content.body || '';

        console.log('[Push] Notification received:', title);

        addNotificationRef.current({
          title,
          body,
          url: data.url || null,
          module: data.module || 'app',
          event: data.event || 'push',
        });
      });

    // Listen for user interactions with push notifications.
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data || {};
        const url = data.url || null;
        const title =
          response.notification.request.content.title ||
          'AutoCare Notification';
        const body = response.notification.request.content.body || '';

        addNotificationRef.current({
          title,
          body,
          url,
          module: data.module || 'app',
          event: data.event || 'push',
        });

        // Arrival requests are handled by the existing Ask Arrival overlay.
        if (typeof url === 'string' && url && data.type !== 'ARRIVAL_REQUEST') {
          Linking.openURL(url).catch((error) => {
            console.error('[Push] Failed to open notification URL:', error);
          });
        }
      });

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
      appStateSubscription.remove();

      // Modern expo-notifications listeners return EventSubscription objects.
      // Each subscription removes itself; removeNotificationSubscription is
      // not available in the installed Expo version.
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, [user?.id]);

  return null;
}
