import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
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

  useFocusEffect(useCallback(() => {
    void loadVehicles();
  }, [loadVehicles]));

  const persistPhoto = async (vehicleId, photoAsset, removePhoto) => {
    if (photoAsset) {
      await vehiclesApi.uploadPhoto(customerId, vehicleId, photoAsset);
    } else if (removePhoto) {
      await vehiclesApi.removePhoto(customerId, vehicleId);
    }
  };

  // A vehicle is saved first so photos can be attached to a real, owned record.
  const addVehicle = async ({ photoAsset, removePhoto: _removePhoto, ...payload }) => {
    if (!customerId) return false;
    setSubmitting(true);
    try {
      const response = await vehiclesApi.create(customerId, payload);
      const created = response?.data;
      if (photoAsset && created?.id) {
        try {
          await persistPhoto(created.id, photoAsset, false);
        } catch (photoError) {
          Alert.alert('Vehicle saved', `Your vehicle was added, but the photo could not be uploaded: ${photoError.message}`);
          await loadVehicles();
          return true;
        }
      }
      Alert.alert('Success', 'Vehicle added to your garage.');
      await loadVehicles();
      return true;
    } catch (err) {
      Alert.alert('Unable to save vehicle', err?.message || 'Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateVehicle = async (vehicleId, { photoAsset, removePhoto, ...payload }) => {
    if (!customerId) return false;
    setSubmitting(true);
    try {
      await vehiclesApi.update(customerId, vehicleId, payload);
      try {
        await persistPhoto(vehicleId, photoAsset, removePhoto);
      } catch (photoError) {
        Alert.alert('Vehicle updated', `Vehicle details were saved, but the photo could not be updated: ${photoError.message}`);
        await loadVehicles();
        return true;
      }
      Alert.alert('Success', 'Vehicle updated.');
      await loadVehicles();
      return true;
    } catch (err) {
      Alert.alert('Unable to update vehicle', err?.message || 'Please try again.');
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