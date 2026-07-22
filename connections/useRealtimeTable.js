// connections/useRealtimeTable.js
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtimeTable(table, filter, onChange) {
  const uniqueId = useRef(Math.random().toString(36).substr(2, 9)).current;
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // Guard – don't subscribe if table or filter is missing
    if (!table || !filter) return;

    const channelName = `${table}-${filter ?? 'all'}-${uniqueId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          console.log(`🔄 [Realtime] ${table} change:`, payload.eventType);
          onChangeRef.current?.(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log(`✅ Subscribed to ${table}`);
        else if (status === 'CHANNEL_ERROR') console.error(`❌ Subscription error on ${table}`);
        else if (status === 'TIMED_OUT') console.warn(`⏱️ Subscription timeout on ${table}`);
      });

    return () => {
      console.log(`🔌 Unsubscribing from ${table}`);
      supabase.removeChannel(channel);
    };
  }, [table, filter, uniqueId]);
}