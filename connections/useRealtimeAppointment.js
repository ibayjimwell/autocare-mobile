// hooks/useRealtimeAppointment.js
import { useCallback } from 'react';
import { useRealtimeTable } from './useRealtimeTable';

/**
 * Subscribe to all appointment changes.
 * @param {() => void} onDataChanged - Called when any appointment row changes.
 */
export function useRealtimeAppointment(onDataChanged) {
  const handleChange = useCallback(
    (payload) => {
      console.log('📅 Appointment change detected, refreshing...');
      onDataChanged();
    },
    [onDataChanged]
  );

  useRealtimeTable('appointments', undefined, handleChange);
}