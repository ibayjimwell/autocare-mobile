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
  onChange,
) {
  const uniqueId =
    useRef(
      Math.random()
        .toString(36)
        .substring(2, 9),
    ).current;

  const onChangeRef =
    useRef(onChange);

  /*
   * ================================================================
   * KEEP CALLBACK CURRENT
   * ================================================================
   */

  useEffect(() => {
    onChangeRef.current =
      onChange;
  }, [
    onChange,
  ]);

  /*
   * ================================================================
   * SUBSCRIBE
   * ================================================================
   */

  useEffect(() => {
    if (!table) {
      return undefined;
    }

    const channelName = filter
      ? `${table}-${filter}-${uniqueId}`
      : `${table}-all-${uniqueId}`;

    console.log(
      `📡 [Realtime] Subscribing to ${table}`,
      filter
        ? {
            filter,
          }
        : {
            filter: 'ALL',
          },
    );

    /*
     * Supabase supports:
     *
     * 1. Table-wide subscription
     * 2. Filtered subscription
     *
     * We construct the config separately so we do not send an
     * invalid empty filter to Supabase.
     */

    const postgresChanges =
      filter
        ? {
            event: '*',
            schema: 'public',
            table,
            filter,
          }
        : {
            event: '*',
            schema: 'public',
            table,
          };

    const channel =
      supabase
        .channel(
          channelName,
        )
        .on(
          'postgres_changes',
          postgresChanges,
          payload => {
            console.log(
              `🔄 [Realtime] ${table} change:`,
              payload.eventType,
              filter
                ? {
                    filter,
                  }
                : '',
            );

            onChangeRef.current?.(
              payload,
            );
          },
        )
        .subscribe(
          subscribeStatus => {
            if (
              subscribeStatus ===
              'SUBSCRIBED'
            ) {
              console.log(
                `✅ [Realtime] Subscribed to ${table}`,
                filter
                  ? {
                      filter,
                    }
                  : {
                      filter: 'ALL',
                    },
              );

              return;
            }

            if (
              subscribeStatus ===
              'CHANNEL_ERROR'
            ) {
              console.error(
                `❌ [Realtime] Subscription error on ${table}`,
                filter
                  ? {
                      filter,
                    }
                  : '',
              );

              return;
            }

            if (
              subscribeStatus ===
              'TIMED_OUT'
            ) {
              console.warn(
                `⏱️ [Realtime] Subscription timeout on ${table}`,
                filter
                  ? {
                      filter,
                    }
                  : '',
              );

              return;
            }

            if (
              subscribeStatus ===
              'CLOSED'
            ) {
              console.log(
                `🔒 [Realtime] Channel closed for ${table}`,
              );

              return;
            }

            console.log(
              `ℹ️ [Realtime] ${table} status:`,
              subscribeStatus,
            );
          },
        );

    /*
     * ==============================================================
     * CLEANUP
     * ==============================================================
     */

    return () => {
      console.log(
        `🔌 [Realtime] Unsubscribing from ${table}`,
        filter
          ? {
              filter,
            }
          : {
              filter: 'ALL',
            },
      );

      void supabase.removeChannel(
        channel,
      );
    };
  }, [
    table,
    filter,
    uniqueId,
  ]);
}