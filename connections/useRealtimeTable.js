import {
  useEffect,
  useRef,
} from 'react';

import {
  supabase,
} from '../lib/supabaseClient';

export function useRealtimeTable(
  table,
  filter,
  onChange
) {
  const uniqueId =
    useRef(
      Math.random()
        .toString(36)
        .substring(2, 9)
    ).current;

  const onChangeRef =
    useRef(
      onChange
    );

  // ---------------------------------------------------------------
  // Keep callback reference current
  // ---------------------------------------------------------------

  useEffect(() => {
    onChangeRef.current =
      onChange;
  }, [
    onChange,
  ]);

  // ---------------------------------------------------------------
  // Realtime subscription
  // ---------------------------------------------------------------

  useEffect(() => {
    // -------------------------------------------------------------
    // Do not subscribe without a valid table/filter
    // -------------------------------------------------------------

    if (
      !table ||
      !filter
    ) {
      return undefined;
    }

    const channelName =
      `${table}-${filter}-${uniqueId}`;

    console.log(
      `📡 [Realtime] Subscribing to ${table}`,
      {
        filter,
      }
    );

    const channel =
      supabase
        .channel(
          channelName
        )
        .on(
          'postgres_changes',
          {
            event: '*',

            schema:
              'public',

            table,

            filter,
          },
          payload => {
            console.log(
              `🔄 [Realtime] ${table} change:`,
              payload.eventType
            );

            onChangeRef.current?.(
              payload
            );
          }
        )
        .subscribe(
          status => {
            if (
              status ===
              'SUBSCRIBED'
            ) {
              console.log(
                `✅ [Realtime] Subscribed to ${table}`,
                {
                  filter,
                }
              );

              return;
            }

            if (
              status ===
              'CHANNEL_ERROR'
            ) {
              console.error(
                `❌ [Realtime] Subscription error on ${table}`
              );

              return;
            }

            if (
              status ===
              'TIMED_OUT'
            ) {
              console.warn(
                `⏱️ [Realtime] Subscription timeout on ${table}`
              );

              return;
            }

            console.log(
              `ℹ️ [Realtime] ${table} status:`,
              status
            );
          }
        );

    // -------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------

    return () => {
      console.log(
        `🔌 [Realtime] Unsubscribing from ${table}`,
        {
          filter,
        }
      );

      void supabase.removeChannel(
        channel
      );
    };
  }, [
    table,
    filter,
    uniqueId,
  ]);
}