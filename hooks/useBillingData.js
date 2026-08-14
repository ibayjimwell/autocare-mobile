import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import estimatesApi from '../services/estimateApi';
import finalBillsApi from '../services/finalBillsApi';
import { useRealtimeTable } from '../connections/useRealtimeTable';

export function useBillingData() {
  const { user } = useAuth();
  const [estimates, setEstimates] = useState([]);
  const [finalBills, setFinalBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [estRes, billRes] = await Promise.all([
        estimatesApi.listByCustomer(user.id),
        finalBillsApi.listByCustomer(user.id),
      ]);
      setEstimates(estRes.data || []);
      setFinalBills(billRes.data || []);
    } catch (err) {
      console.error('Error fetching billing data:', err);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Real-time subscription for final_bills changes
  useRealtimeTable(
    'final_bills',
    undefined, // no filter, we'll filter client-side by customer
    useCallback(() => {
      console.log('🔄 Final bills changed, refreshing billing data...');
      fetchData();
    }, [fetchData])
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
    }, [fetchData])
  );

  return {
    estimates,
    finalBills,
    loading,
    refreshing,
    onRefresh,
  };
}