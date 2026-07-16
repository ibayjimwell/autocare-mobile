import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import serviceTypesApi from '../services/serviceTypesApi';
import vehiclesApi from '../services/vehiclesApi';
import appointmentsApi from '../services/appointmentsApi';

export function useBookingData() {
  const { user } = useAuth();
  const customerId = user?.id;

  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesRes, vehiclesRes, appointmentsRes] = await Promise.all([
        serviceTypesApi.listActive(),
        customerId ? vehiclesApi.listByCustomer(customerId) : Promise.resolve({ data: [] }),
        customerId ? appointmentsApi.list({ customerId }) : Promise.resolve({ data: [] }),
      ]);

      const serviceData = servicesRes.data?.data || servicesRes.data || servicesRes;
      setServices(Array.isArray(serviceData) ? serviceData : []);

      const vehicleData = vehiclesRes.data?.data || vehiclesRes.data || vehiclesRes;
      setVehicles(Array.isArray(vehicleData) ? vehicleData : []);

      const appointmentData = appointmentsRes.data?.data || appointmentsRes.data || [];
      setAppointments(appointmentData);
    } catch (err) {
      console.error('Booking data load error:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  return { services, vehicles, appointments, loading, refetch: loadAll };
}