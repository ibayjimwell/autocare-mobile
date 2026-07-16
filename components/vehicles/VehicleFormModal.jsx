import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function VehicleFormModal({
  visible,
  onClose,
  onSave,
  editingVehicle,
}) {
  const [form, setForm] = useState({
    make: "",
    model: "",
    plateNumber: "",
    year: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingVehicle) {
      setForm({
        make: editingVehicle.make,
        model: editingVehicle.model,
        plateNumber: editingVehicle.plateNumber,
        year: editingVehicle.year?.toString() || "",
      });
    } else {
      setForm({ make: "", model: "", plateNumber: "", year: "" });
    }
  }, [editingVehicle, visible]);

  const handleSave = async () => {
    if (!form.make || !form.model || !form.plateNumber) {
      Alert.alert("Required fields", "Make, model and plate number are required.");
      return;
    }
    setSubmitting(true);
    const success = await onSave({
      make: form.make,
      model: form.model,
      plateNumber: form.plateNumber,
      year: form.year ? parseInt(form.year) : null,
    });
    setSubmitting(false);
    if (success) onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="p-8 rounded-t-[40px] bg-card shadow-2xl">
            {/* Handle */}
            <View className="w-12 h-1.5 rounded-full self-center mb-6 bg-foreground/10" />

            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-heading font-black text-foreground">
                {editingVehicle ? "Update Car" : "New Vehicle"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full items-center justify-center bg-muted"
              >
                <Ionicons name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-widest ml-1 mb-2 text-foreground/50">
                  Brand / Make
                </Text>
                <TextInput
                  className="p-4 rounded-2xl text-base font-bold border border-border bg-background text-foreground"
                  placeholder="e.g., Toyota"
                  placeholderTextColor="#999"
                  value={form.make}
                  onChangeText={(text) => setForm({ ...form, make: text })}
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold uppercase tracking-widest ml-1 mb-2 text-foreground/50">
                  Model Name
                </Text>
                <TextInput
                  className="p-4 rounded-2xl text-base font-bold border border-border bg-background text-foreground"
                  placeholder="e.g., Vios"
                  placeholderTextColor="#999"
                  value={form.model}
                  onChangeText={(text) => setForm({ ...form, model: text })}
                />
              </View>

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase tracking-widest ml-1 mb-2 text-foreground/50">
                    Plate Number
                  </Text>
                  <TextInput
                    className="p-4 rounded-2xl text-base font-bold border border-border bg-background text-foreground uppercase"
                    placeholder="ABC 123"
                    placeholderTextColor="#999"
                    value={form.plateNumber}
                    onChangeText={(text) => setForm({ ...form, plateNumber: text })}
                  />
                </View>
                <View className="w-[100px]">
                  <Text className="text-[10px] font-bold uppercase tracking-widest ml-1 mb-2 text-foreground/50">
                    Year
                  </Text>
                  <TextInput
                    className="p-4 rounded-2xl text-base font-bold border border-border bg-background text-foreground"
                    placeholder="2024"
                    placeholderTextColor="#999"
                    value={form.year}
                    onChangeText={(text) => setForm({ ...form, year: text })}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              className={`mt-10 py-5 rounded-2xl bg-primary shadow-lg shadow-primary/20 ${submitting ? "opacity-70" : ""}`}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-primary-foreground text-center font-bold text-base uppercase tracking-widest">
                  {editingVehicle ? "Confirm Changes" : "Save to Garage"}
                </Text>
              )}
            </TouchableOpacity>
            <View className="h-4" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}