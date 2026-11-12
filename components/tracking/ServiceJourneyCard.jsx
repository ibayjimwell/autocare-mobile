import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  AppState,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react-native';

import { useRealtimeTable } from '../../connections/useRealtimeTable';
import api from '../../services/api';

const POLL_INTERVAL_MS = 30_000;
const REALTIME_DEBOUNCE_MS = 250;

function isAppActive() {
  return AppState.currentState !== 'background' &&
    AppState.currentState !== 'inactive';
}

function formatPHDate(value, includeTime = false) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const options = {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  };
  return date.toLocaleString('en-PH', options);
}

/**
 * Single authoritative customer journey.
 *
 * Realtime sends only a signal to reload. The authenticated Web API
 * remains the source of truth for status, tasks, queue, delay and warranty.
 * Polling/focus refresh recover events missed during network disconnects.
 */
export default function ServiceJourneyCard({ appointmentId }) {
  const id = Array.isArray(appointmentId) ? appointmentId[0] : appointmentId;
  const isFocused = useIsFocused();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');
  const requestVersionRef = useRef(0);
  const realtimeTimerRef = useRef(null);

  const refresh = useCallback(async ({ showSpinner = false } = {}) => {
    if (!id) return;

    // Only the most recent response can update this screen.
    const requestVersion = ++requestVersionRef.current;
    if (showSpinner) setLoading(true);

    try {
      const response = await api.request(
        `/service-journey/${encodeURIComponent(id)}`,
        'GET',
        null,
        true,
      );

      if (response?.error || !response?.data) {
        throw new Error(response?.errorMessage || 'Unable to load service journey.');
      }
      if (requestVersion !== requestVersionRef.current) return;

      setData(response.data);
      setError('');
    } catch (err) {
      if (requestVersion !== requestVersionRef.current) return;
      // Preserve the most recently loaded journey during a brief outage.
      setError(err?.message || 'Unable to refresh service journey.');
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setLoading(false);
      }
    }
  }, [id]);

  // Discard the previous appointment's data and any late network responses.
  useEffect(() => {
    requestVersionRef.current += 1;
    setData(null);
    setError('');
    setLoading(Boolean(id));

    return () => {
      requestVersionRef.current += 1;
    };
  }, [id]);

  const onRealtimeChange = useCallback(() => {
    if (!id || !isFocused || !isAppActive()) return;

    // A staff action can update several journey tables in one operation.
    // Coalesce related events into one authenticated read.
    if (realtimeTimerRef.current !== null) {
      clearTimeout(realtimeTimerRef.current);
    }
    realtimeTimerRef.current = setTimeout(() => {
      realtimeTimerRef.current = null;
      void refresh();
    }, REALTIME_DEBOUNCE_MS);
  }, [id, isFocused, refresh]);

  // Filter each subscription to this appointment. Do not subscribe to all
  // customer rows. Existing Supabase publication/RLS configuration must
  // authorize these change events; the API is always used to read the data.
  const listen = Boolean(id && isFocused);
  const appointmentFilter = id ? `id=eq.${id}` : undefined;
  const relatedFilter = id ? `appointment_id=eq.${id}` : undefined;

  useRealtimeTable(listen ? 'appointments' : null, appointmentFilter, onRealtimeChange);
  useRealtimeTable(listen ? 'inspection_tasks' : null, relatedFilter, onRealtimeChange);
  useRealtimeTable(listen ? 'work_tasks' : null, relatedFilter, onRealtimeChange);
  useRealtimeTable(listen ? 'service_queue' : null, relatedFilter, onRealtimeChange);
  useRealtimeTable(listen ? 'service_delays' : null, relatedFilter, onRealtimeChange);
  useRealtimeTable(listen ? 'service_warranties' : null, relatedFilter, onRealtimeChange);

  useFocusEffect(useCallback(() => {
    if (!id) return undefined;

    void refresh();
    const interval = setInterval(() => {
      if (isAppActive()) void refresh();
    }, POLL_INTERVAL_MS);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
      if (realtimeTimerRef.current !== null) {
        clearTimeout(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
      requestVersionRef.current += 1;
    };
  }, [id, refresh]));

  if (!id) return null;

  const phases = Array.isArray(data?.phases) ? data.phases : [];
  const progressPercent = Math.max(
    0,
    Math.min(100, Number(data?.progressPercent) || 0),
  );
  const isWork = data?.status === 'IN_PROGRESS';
  const isInspection = data?.status === 'UNDER_INSPECTION';
  const activeTasks = isWork ? data?.work : data?.inspection;
  const expectedReady = formatPHDate(data?.delay?.expectedReadyAt, true);
  const warrantyExpiry = formatPHDate(data?.warranty?.expiresAt);

  return (
    <View className="mb-5 rounded-2xl border border-border bg-card p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="flex-1 text-lg font-bold text-foreground">
          Live Service Journey
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Refresh service journey"
          accessibilityState={{ disabled: loading }}
          disabled={loading}
          onPress={() => void refresh({ showSpinner: true })}
          className="min-h-[44px] min-w-[44px] items-center justify-center rounded-xl"
          activeOpacity={0.75}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#C1272D" />
          ) : (
            <RefreshCw size={19} color="#C1272D" />
          )}
        </TouchableOpacity>
      </View>

      {error ? (
        <Text className="mb-3 text-xs text-amber-700" accessibilityRole="alert">
          {data
            ? 'Could not retrieve the latest update. Showing the last available journey.'
            : error}
        </Text>
      ) : null}

      {!data && loading ? (
        <View className="items-center py-5">
          <ActivityIndicator color="#C1272D" />
          <Text className="mt-3 text-sm text-muted-foreground">
            Loading your service journey…
          </Text>
        </View>
      ) : !data ? (
        <Text className="py-3 text-sm text-muted-foreground">
          Service journey is unavailable. Tap refresh to try again.
        </Text>
      ) : (
        <>
          <Text className="mb-3 text-sm leading-5 text-muted-foreground">
            {data.customerMessage}
          </Text>

          {phases.map((phase, index) => {
            const isUpcoming = phase.state === 'UPCOMING';
            const isCurrent = phase.state === 'CURRENT';

            return (
              <View
                key={phase.key || index}
                className="flex-row items-center border-b border-border/40 py-2"
              >
                <View
                  className={`mr-3 h-8 w-8 items-center justify-center rounded-full ${
                    isUpcoming ? 'bg-background' : 'bg-primary'
                  }`}
                >
                  {phase.state === 'DONE' ? (
                    <CheckCircle2 size={17} color="#FFFFFF" />
                  ) : (
                    <Text
                      className="text-xs font-bold"
                      style={{ color: isUpcoming ? '#8E8E93' : '#FFFFFF' }}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  className={`flex-1 text-sm ${
                    isUpcoming ? 'text-muted-foreground' : 'font-semibold text-foreground'
                  }`}
                >
                  {phase.label}
                </Text>
                {isCurrent ? (
                  <Text className="text-xs font-bold text-primary">CURRENT</Text>
                ) : null}
              </View>
            );
          })}

          {(isWork || isInspection) ? (
            <View className="mt-3">
              <Text className="text-sm font-medium text-foreground">
                Tasks completed: {activeTasks?.done ?? 0}/{activeTasks?.total ?? 0}
              </Text>
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel="Service tasks completed"
                accessibilityValue={{ min: 0, max: 100, now: progressPercent }}
                className="mt-2 h-2 overflow-hidden rounded-full bg-background"
              >
                <View
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    backgroundColor: '#C1272D',
                  }}
                />
              </View>
            </View>
          ) : null}

          <View className="mt-3 flex-row items-center">
            <Clock3 size={16} color={data.delay ? '#B45309' : '#15803D'} />
            <Text className="ml-2 flex-1 text-xs text-muted-foreground">
              {data.delay
                ? 'Delay reported by workshop'
                : 'No delay reported — timing subject to inspection'}
            </Text>
          </View>

          {data.delay ? (
            <View className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <View className="flex-row items-center">
                <AlertTriangle size={17} color="#B45309" />
                <Text className="ml-2 text-sm font-bold text-amber-900">
                  Service delayed
                </Text>
              </View>
              <Text className="mt-1 text-xs text-amber-900">
                {data.delay.reason}
              </Text>
              {expectedReady ? (
                <Text className="mt-1 text-xs text-amber-800">
                  Expected ready: {expectedReady}
                </Text>
              ) : null}
            </View>
          ) : null}

          {data.warranty ? (
            <View className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <View className="flex-row items-center">
                <ShieldCheck size={17} color="#047857" />
                <Text className="ml-2 text-sm font-bold text-emerald-900">
                  Service warranty
                </Text>
              </View>
              <Text className="mt-1 text-xs text-emerald-900">
                {data.warranty.coverage}
              </Text>
              {warrantyExpiry ? (
                <Text className="mt-1 text-xs text-emerald-800">
                  Valid until {warrantyExpiry}
                </Text>
              ) : null}
              <Text className="mt-1 text-xs text-emerald-800">
                {data.warranty.terms}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
