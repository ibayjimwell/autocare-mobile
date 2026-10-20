import { useEffect, useRef } from 'react';
import { Platform, Linking, AppState } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { storage } from '../utils/storage';
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
  // Android 13+ notification permissions require creating the channel first.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('autocare-general', {
      name: 'AutoCare Updates',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'notification_sound.wav',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C1272D',
    });
    await Notifications.setNotificationChannelAsync('autocare-arrival', {
      name: 'Arrival Questions',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'notification_sound.wav',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C1272D',
    });
  }

  if (!Device.isDevice) {
    console.log('[Push] Use a physical device to register push notifications.');
    return null;
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') {
    console.warn('[Push] Notification permission not granted. Inbox sync still works.');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) throw new Error('Missing EAS projectId for Expo push registration.');
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

/** Parse native push once, with an ID shared by foreground/tap/server sync. */
function normalizeNotification(notification) {
  if (!notification?.request?.content) return null;
  const data = notification.request.content.data || {};
  const nativeId = notification.request.identifier;
  const serverId = typeof data.notificationId === 'string' ? data.notificationId : null;
  const id = serverId || (nativeId ? `expo:${nativeId}` : null);
  if (!id) return null;
  const timestamp = Number.isFinite(notification.date)
    ? new Date(notification.date).toISOString()
    : new Date().toISOString();
  return {
    id,
    notificationId: serverId,
    customerId: typeof data.customerId === 'string' ? data.customerId : null,
    title: notification.request.content.title || 'AutoCare Notification',
    body: notification.request.content.body || '',
    url: typeof data.url === 'string' ? data.url : null,
    module: typeof data.module === 'string' ? data.module : 'app',
    event: typeof data.event === 'string' ? data.event :
      (typeof data.type === 'string' ? data.type : 'push'),
    timestamp,
  };
}

function openNotificationUrl(url) {
  if (typeof url !== 'string' || !url) return;
  if (url.startsWith('/') && !url.startsWith('//')) {
    router.push(url);
  } else if (/^https?:\/\//i.test(url) || /^autocare:\/\//i.test(url)) {
    void Linking.openURL(url).catch((error) => {
      console.warn('[Push] Could not open notification link:', error);
    });
  }
}

export function usePushNotifications() {
  const { user } = useAuth();
  const { addNotification, syncNotifications } = useNotifications();
  const addRef = useRef(addNotification);
  const syncRef = useRef(syncNotifications);
  addRef.current = addNotification;
  syncRef.current = syncNotifications;

  useEffect(() => {
    if (!user?.id) return;
    const customerId = user.id;
    let active = true;
    let retryTimer = null;
    let attempt = 0;
    let registering = false;
    const handledResponses = new Set();

    const persist = (notification) => {
      if (!active) return;
      const parsed = normalizeNotification(notification);
      // Do not import old unscoped pushes from another account that may
      // still be in the Android notification shade after a customer switch.
      // New AutoCare pushes always carry the verified recipient customerId.
      if (!parsed || parsed.customerId !== customerId) return;
      addRef.current(parsed);
    };

    const handleResponse = (response, navigate = true) => {
      const notification = response?.notification;
      if (!notification) return;
      const key = `${notification.request.identifier}:${response.actionIdentifier}`;
      if (handledResponses.has(key)) return;
      handledResponses.add(key);
      persist(notification);
      const data = notification.request.content.data || {};
      // Ask Arrival has a separate action handler and server-verified modal.
      if (navigate && data.type !== 'ARRIVAL_REQUEST') {
        openNotificationUrl(data.url);
      }
      void syncRef.current();
    };

    // Register listeners BEFORE awaiting push token registration or fetching
    // the existing inbox. This avoids missing foreground notifications during
    // slow startup/network registration.
    const received = Notifications.addNotificationReceivedListener(persist);
    const tapped = Notifications.addNotificationResponseReceivedListener(
      (response) => handleResponse(response, true),
    );

    const recoverDelivered = async () => {
      try {
        // Recovers pushes still in the OS notification tray after background
        // delivery. The server inbox also recovers dismissed/missed pushes.
        const presented = await Notifications.getPresentedNotificationsAsync();
        if (active) presented.forEach(persist);
      } catch (error) {
        console.warn('[Push] OS tray recovery unavailable:', error?.message || error);
      }
      try {
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (active && lastResponse) {
          // Keep cold-start history without redirecting from an old tap.
          // ArrivalRequestOverlay still handles ARRIVAL_REQUEST actions.
          handleResponse(lastResponse, false);
        }
      } catch (error) {
        console.warn('[Push] Last push response unavailable:', error?.message || error);
      }
      if (active) void syncRef.current();
    };

    const synchronizeToken = async () => {
      if (!active || registering) return;
      registering = true;
      try {
        const token = await registerForPushNotificationsAsync();
        if (!active || !token) return;
        const result = await api.request('/customers/push-subscriptions', 'POST', {
          customerId,
          expoPushToken: token,
        }, true);
        if (result?.error) throw new Error(result.errorMessage || 'Push registration failed.');
        if (!active) return;
        storage.setItem('expo_push_token', token); // existing logout unregister uses this key
        attempt = 0;
        console.log('[Push] Customer push token synchronized.');
      } catch (error) {
        if (!active) return;
        console.warn('[Push] Token sync failed, will retry:', error?.message || error);
        attempt += 1;
        const delay = Math.min(120000, 2500 * (2 ** Math.min(attempt - 1, 6)));
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(() => {
          retryTimer = null;
          void synchronizeToken();
        }, delay);
      } finally {
        registering = false;
      }
    };

    void recoverDelivered();
    void synchronizeToken();

    const stateSubscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !active) return;
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
      void recoverDelivered();
      void synchronizeToken();
    });

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
      stateSubscription.remove();
      received.remove();
      tapped.remove();
    };
  }, [user?.id]);

  return null;
}
