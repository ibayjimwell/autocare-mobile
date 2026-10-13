import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Modal, Pressable, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { BellRing, CarFront, CheckCircle2, XCircle, Clock3 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import arrivalRequestsApi from '../services/arrivalRequestsApi';

/**
 * Mounted once, above the entire Expo Router Stack.
 * Real-time events and push are hints; the protected server endpoint is the
 * sole source of truth about which customer has an outstanding question.
 */
export default function ArrivalRequestOverlay() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState([]);
  const mounted = useRef(true);
  const generation = useRef(0);
  const inFlight = useRef(null);
  const rerun = useRef(null);
  const handledActions = useRef(new Set());

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    if (inFlight.current === user.id) { rerun.current = user.id; return; }
    inFlight.current = user.id;
    const runGeneration = generation.current;
    try {
      const result = await arrivalRequestsApi.pending();
      if (mounted.current && generation.current === runGeneration) setPending(Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
      // Connectivity can fail while offline; current modal must remain usable.
      console.warn('[ArrivalRequest] Unable to refresh:', err?.message);
    } finally {
      if (inFlight.current === user.id) {
        inFlight.current = null;
        if (rerun.current === user.id) { rerun.current = null; void refresh(); }
      }
    }
  }, [user?.id]);

  useEffect(() => {
    mounted.current = true;
    generation.current += 1;
    setPending([]);
    setDismissed([]);
    handledActions.current.clear();
    setError('');
    if (!user?.id) return () => { mounted.current = false; };

    // Android/iOS notification actions allow a reply after the user taps a
    // push even when they were using another app. App state is required by OS.
    void Notifications.setNotificationCategoryAsync('autocare-arrival', [
      { identifier: 'ARRIVE_YES', buttonTitle: 'Yes, I will arrive', options: { opensAppToForeground: true } },
      { identifier: 'ARRIVE_NO', buttonTitle: 'No, I cannot arrive', options: { opensAppToForeground: true } },
    ]).catch(err => console.warn('[ArrivalRequest] Notification category:', err));

    let debounce;
    const scheduleRefresh = () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { void refresh(); }, 350);
    };
    void refresh();

    // Subscription is an invalidation signal only; no other customer's data
    // is placed in this component state.
    const channel = supabase.channel(`arrival-requests-${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'service_queue',
      }, scheduleRefresh)
      .subscribe();

    const received = Notifications.addNotificationReceivedListener(event => {
      if (event.request.content.data?.type === 'ARRIVAL_REQUEST') scheduleRefresh();
    });
    const processNotificationResponse = async event => {
      const payload = event?.notification?.request?.content?.data;
      if (payload?.type !== 'ARRIVAL_REQUEST') return;
      const response = event.actionIdentifier === 'ARRIVE_YES' ? 'YES' :
        event.actionIdentifier === 'ARRIVE_NO' ? 'NO' : null;
      if (response && payload.appointmentId && payload.requestAt) {
        const actionKey = `${payload.appointmentId}:${payload.requestAt}:${response}`;
        if (handledActions.current.has(actionKey)) return;
        handledActions.current.add(actionKey);
        try {
          await arrivalRequestsApi.respond(payload.appointmentId, payload.requestAt, response);
        } catch (err) {
          console.warn('[ArrivalRequest] Notification reply failed:', err?.message);
        }
      }
      setDismissed([]);
      scheduleRefresh();
    };
    const tapped = Notifications.addNotificationResponseReceivedListener(event => {
      void processNotificationResponse(event);
    });
    // A cold-start notification tap may have occurred before listeners mounted.
    void Notifications.getLastNotificationResponseAsync().then(event => {
      if (event?.notification?.request?.content?.data?.type === 'ARRIVAL_REQUEST')
        void processNotificationResponse(event);
    }).catch(() => {});

    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') { setDismissed([]); scheduleRefresh(); }
    });
    // Recovery if push delivery or realtime is unavailable. Foreground only.
    const recovery = setInterval(() => {
      if (AppState.currentState === 'active') void refresh();
    }, 30000);

    return () => {
      mounted.current = false;
      generation.current += 1;
      clearTimeout(debounce);
      clearInterval(recovery);
      appState.remove();
      received.remove();
      tapped.remove();
      void supabase.removeChannel(channel);
    };
  }, [user?.id, refresh]);

  const active = pending.find(item =>
    !dismissed.includes(`${item.appointmentId}:${item.requestAt}`));

  const answer = async response => {
    if (!active || busy) return;
    setBusy(true);
    setError('');
    try {
      await arrivalRequestsApi.respond(active.appointmentId, active.requestAt, response);
      setPending(previous => previous.filter(item =>
        !(item.appointmentId === active.appointmentId && item.requestAt === active.requestAt)));
      void refresh();
    } catch (err) {
      if (err?.status === 409 || err?.status === 422) {
        // The request may have been answered on another device or cancelled.
        setDismissed(previous => [...previous, `${active.appointmentId}:${active.requestAt}`]);
        void refresh();
      } else {
        setError(err?.message || 'Unable to send your response. Please try again.');
      }
    } finally { setBusy(false); }
  };

  if (!user?.id || !active) return null;
  const vehicle = [active.vehicleMake, active.vehicleModel, active.vehicleYear]
    .filter(value => value !== undefined && value !== null && value !== '').join(' ') || 'Your vehicle';
  const foreground = theme?.text || '#111827';
  const primary = theme?.primary || '#C1272D';

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent
      onRequestClose={() => { if (!busy) setDismissed(previous => [...previous, `${active.appointmentId}:${active.requestAt}`]); }}>
      <View className="flex-1 items-center justify-center bg-black/60 px-5">
        <View className="w-full max-w-md rounded-[28px] bg-white p-6" style={{ elevation: 12 }}>
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${primary}12` }}>
            <BellRing size={27} color={primary} />
          </View>
          <Text className="text-2xl font-bold" style={{ color: foreground }}>Are you arriving today?</Text>
          <Text className="mt-2 text-sm leading-6 text-gray-600">
            AutoCare is checking if you will arrive for your confirmed service appointment today.
          </Text>
          <View className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <View className="flex-row items-center gap-2"><CarFront size={20} color={primary} />
              <Text className="flex-1 text-base font-bold text-gray-900">{vehicle}</Text></View>
            <Text className="mt-2 text-sm text-gray-700">Plate Number: {active.plateNumber || 'Not provided'}</Text>
            <Text className="mt-1 text-xs text-gray-500">Tracking #{active.trackingNumber || 'N/A'}</Text>
          </View>
          {error ? <Text className="mt-3 text-sm font-medium text-red-600">{error}</Text> : null}
          <Pressable disabled={busy} onPress={() => answer('YES')}
            className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-xl px-4"
            style={{ backgroundColor: primary, opacity: busy ? .6 : 1 }}>
            {busy ? <ActivityIndicator color="white" /> : <CheckCircle2 size={20} color="white" />}
            <Text className="font-semibold text-white">Yes, I will arrive today</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => answer('NO')}
            className="mt-3 min-h-12 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4">
            <XCircle size={20} color="#4B5563" />
            <Text className="font-semibold text-gray-800">No, I cannot arrive today</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => setDismissed(previous => [...previous, `${active.appointmentId}:${active.requestAt}`])}
            className="mt-3 min-h-11 flex-row items-center justify-center gap-2">
            <Clock3 size={16} color="#6B7280" />
            <Text className="font-medium text-gray-500">Respond later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
