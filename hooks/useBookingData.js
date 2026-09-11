import {
  useCallback,
  useState,
} from 'react';

import {
  useFocusEffect,
} from 'expo-router';

import {
  useAuth,
} from '../context/AuthContext';

import serviceTypesApi from '../services/serviceTypesApi';
import vehiclesApi from '../services/vehiclesApi';
import appointmentsApi from '../services/appointmentsApi';
import api from '../services/api';

function getTodayString() {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      today.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function useBookingData() {
  const {
    user,
  } = useAuth();

  const customerId =
    user?.id;

  const [
    services,
    setServices,
  ] = useState([]);

  const [
    vehicles,
    setVehicles,
  ] = useState([]);

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    disabledDates,
    setDisabledDates,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const loadConfiguration =
    useCallback(
      async () => {
        try {
          const res =
            await api.request(
              '/configurations?module=appointments',
              'GET',
              null,
              false
            );

          const config =
            res?.data?.data
              ?.config ||
            res?.data?.config ||
            {};

          const dateOverrides =
            config?.dateOverrides ||
            {};

          const closedDates =
            Object.entries(
              dateOverrides
            )
              .filter(
                ([
                  ,
                  override,
                ]) =>
                  override
                    ?.isOpen ===
                  false
              )
              .map(
                ([
                  date,
                ]) => date
              );

          setDisabledDates(
            closedDates
          );
        } catch (err) {
          console.error(
            'Booking configuration load error:',
            err
          );

          setDisabledDates([]);
        }
      },
      []
    );

  const loadAll =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const [
            servicesRes,
            vehiclesRes,
            appointmentsRes,
          ] =
            await Promise.all([
              serviceTypesApi.listActive(),

              customerId
                ? vehiclesApi.listByCustomer(
                    customerId
                  )
                : Promise.resolve({
                    data: [],
                  }),

              customerId
                ? appointmentsApi.list(
                    {
                      customerId,
                    }
                  )
                : Promise.resolve({
                    data: [],
                  }),

              loadConfiguration(),
            ]);

          const serviceData =
            servicesRes?.data?.data ||
            servicesRes?.data ||
            servicesRes ||
            [];

          setServices(
            Array.isArray(
              serviceData
            )
              ? serviceData
              : []
          );

          const vehicleData =
            vehiclesRes?.data?.data ||
            vehiclesRes?.data ||
            vehiclesRes ||
            [];

          setVehicles(
            Array.isArray(
              vehicleData
            )
              ? vehicleData
              : []
          );

          const appointmentData =
            appointmentsRes?.data?.data ||
            appointmentsRes?.data ||
            appointmentsRes ||
            [];

          setAppointments(
            Array.isArray(
              appointmentData
            )
              ? appointmentData
              : []
          );
        } catch (err) {
          console.error(
            'Booking data load error:',
            err
          );
        } finally {
          setLoading(false);
        }
      },
      [
        customerId,
        loadConfiguration,
      ]
    );

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  return {
    services,
    vehicles,
    appointments,
    disabledDates,
    today: getTodayString(),
    loading,
    refetch: loadAll,
  };
}