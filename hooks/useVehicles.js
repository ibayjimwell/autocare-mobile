import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import vehiclesApi from "../services/vehiclesApi";

export function useVehicles() {
  const { user } = useAuth();
  const customerId = user?.id;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load vehicles
  const loadVehicles = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await vehiclesApi.listByCustomer(customerId);
      const data = res.data?.data || res.data || res;
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load vehicles error:", err);
      Alert.alert("Error", "Failed to load vehicles");
    }
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Add vehicle
  const addVehicle = async (payload) => {
    if (!customerId) return false;
    setSubmitting(true);
    try {
      await vehiclesApi.create(customerId, payload);
      Alert.alert("Success", "Vehicle added");
      await loadVehicles();
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to add vehicle";
      Alert.alert("Error", message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Update vehicle
  const updateVehicle = async (vehicleId, payload) => {
    if (!customerId) return false;
    setSubmitting(true);
    try {
      await vehiclesApi.update(customerId, vehicleId, payload);
      Alert.alert("Success", "Vehicle updated");
      await loadVehicles();
      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to update vehicle";
      Alert.alert("Error", message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete vehicle
  const deleteVehicle = (vehicle) => {
    if (!customerId) return;
    Alert.alert(
      "Remove Vehicle",
      `Are you sure you want to remove the ${vehicle.make} ${vehicle.model}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await vehiclesApi.delete(customerId, vehicle.id);
              Alert.alert("Success", "Vehicle deleted");
              await loadVehicles();
            } catch (err) {
              const message = err?.response?.data?.message || err.message || "Delete failed";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  };

  return {
    vehicles,
    loading,
    submitting,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  };
}