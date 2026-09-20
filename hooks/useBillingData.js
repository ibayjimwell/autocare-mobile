import {
  useState,
  useCallback,
} from 'react';

import {
  useFocusEffect,
} from 'expo-router';

import {
  useAuth,
} from '../context/AuthContext';

import estimatesApi from '../services/estimateApi';
import finalBillsApi from '../services/finalBillsApi';

import {
  useRealtimeTable,
} from '../connections/useRealtimeTable';

export function useBillingData() {
  const { user } =
    useAuth();

  const [
    estimates,
    setEstimates,
  ] = useState([]);

  const [
    finalBills,
    setFinalBills,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const fetchData =
    useCallback(
      async () => {
        /*
         * Do not attempt an API request when there is no
         * authenticated customer yet.
         */
        if (!user?.id) {
          setEstimates([]);
          setFinalBills([]);
          return;
        }

        try {
          const [
            estRes,
            billRes,
          ] = await Promise.all([
            estimatesApi.listByCustomer(
              user.id,
            ),

            finalBillsApi.listByCustomer(
              user.id,
            ),
          ]);

          /*
           * API shape:
           *
           * {
           *   error: false,
           *   data: [...]
           * }
           */
          setEstimates(
            Array.isArray(
              estRes?.data,
            )
              ? estRes.data
              : [],
          );

          setFinalBills(
            Array.isArray(
              billRes?.data,
            )
              ? billRes.data
              : [],
          );
        } catch (err) {
          console.error(
            'Error fetching billing data:',
            err,
          );

          /*
           * Keep existing displayed data rather than replacing
           * already-loaded records with undefined.
           */
        }
      },
      [user?.id],
    );

  const onRefresh =
    useCallback(
      async () => {
        setRefreshing(
          true,
        );

        try {
          await fetchData();
        } finally {
          setRefreshing(
            false,
          );
        }
      },
      [fetchData],
    );

  /*
   * ================================================================
   * REAL-TIME Final Cost UPDATES
   * ================================================================
   *
   * This keeps the billing screen synchronized when a Final Cost
   * changes from OFFICIAL -> PAID, or when another final-bill change
   * happens.
   */
  useRealtimeTable(
    'final_bills',
    undefined,
    useCallback(() => {
      console.log(
        '🔄 Final Costs changed, refreshing billing data...',
      );

      fetchData();
    }, [fetchData]),
  );

  /*
   * ================================================================
   * SCREEN FOCUS
   * ================================================================
   *
   * Reload the billing data whenever the screen becomes active.
   */
  useFocusEffect(
    useCallback(() => {
      let active =
        true;

      const load =
        async () => {
          if (active) {
            setLoading(
              true,
            );
          }

          try {
            await fetchData();
          } finally {
            if (active) {
              setLoading(
                false,
              );
            }
          }
        };

      load();

      return () => {
        active = false;
      };
    }, [fetchData]),
  );

  return {
    estimates,
    finalBills,
    loading,
    refreshing,
    onRefresh,
  };
}