import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import serviceTypesApi from "../services/serviceTypesApi";

export function useServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await serviceTypesApi.listActive();
      const data = res.data?.data || res.data || res;
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadServices();
    }, [loadServices])
  );

  return { services, loading };
}