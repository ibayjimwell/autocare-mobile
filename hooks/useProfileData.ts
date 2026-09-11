import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useAuth,
} from '../context/AuthContext';

import customersApi from '../services/customersApi';

import {
  useRealtimeTable,
} from '../connections/useRealtimeTable';

interface ProfileStats {
  vehicles: number;
  visits: number;
  completedAppointments: any[];
}

export function useProfileData() {
  const {
    user,
  } = useAuth();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    stats,
    setStats,
  ] = useState<ProfileStats>({
    vehicles: 0,
    visits: 0,
    completedAppointments: [],
  });

  const fetchData = useCallback(
    async (
      showLoading = false
    ) => {
      if (!user?.id) {
        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      try {
        const res =
          await customersApi.getStats(
            user.id
          );

        const data =
          res?.data?.data ||
          res?.data ||
          {};

        setStats({
          vehicles:
            Number(
              data.vehicleCount
            ) || 0,

          visits:
            Number(
              data.visitCount
            ) || 0,

          completedAppointments:
            Array.isArray(
              data.recentCompleted
            )
              ? data.recentCompleted
              : [],
        });
      } catch (err) {
        console.error(
          'Failed to load profile data',
          err
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchData(true);
  }, [
    user?.id,
    fetchData,
  ]);

  /*
   * Re-fetch from the API on changes instead of trusting the raw
   * realtime payload. This keeps the stats in exactly the same
   * shape as the customer stats endpoint.
   */
  const handleRealtimeUpdate =
    useCallback(() => {
      fetchData(false);
    }, [fetchData]);

  useRealtimeTable(
    'appointments',
    user?.id
      ? `customer_id=eq.${user.id}`
      : null,
    handleRealtimeUpdate
  );

  useRealtimeTable(
    'vehicles',
    user?.id
      ? `customer_id=eq.${user.id}`
      : null,
    handleRealtimeUpdate
  );

  return {
    loading,
    stats,
    refetch: () =>
      fetchData(false),
  };
}