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
  SafeAreaView
} from "react-native";
import { X } from "lucide-react-native";

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
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-background"
      >
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 pt-6 pb-4">
            <Text className="text-3xl font-bold tracking-tight text-foreground">
              {editingVehicle ? "Update Car" : "New Vehicle"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-secondary rounded-full w-8 h-8 items-center justify-center ml-4"
            >
              <X size={18} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Form Area - Apple HIG Grouped Form */}
          <View className="flex-1 pt-2">
            <View className="bg-card rounded-xl mx-4 overflow-hidden mb-6">
              
              {/* Make Input Row */}
              <View className="pl-4">
                <View className="flex-row items-center border-b border-border pr-4 min-h-[44px]">
                  <Text className="text-base font-normal text-foreground w-[100px]">Make</Text>
                  <TextInput
                    className="flex-1 text-base text-foreground py-3"
                    placeholder="e.g., Toyota"
                    placeholderTextColor="#8E8E93"
                    value={form.make}
                    onChangeText={(text) => setForm({ ...form, make: text })}
                  />
                </View>
              </View>

              {/* Model Input Row */}
              <View className="pl-4">
                <View className="flex-row items-center border-b border-border pr-4 min-h-[44px]">
                  <Text className="text-base font-normal text-foreground w-[100px]">Model</Text>
                  <TextInput
                    className="flex-1 text-base text-foreground py-3"
                    placeholder="e.g., Vios"
                    placeholderTextColor="#8E8E93"
                    value={form.model}
                    onChangeText={(text) => setForm({ ...form, model: text })}
                  />
                </View>
              </View>

              {/* Plate Input Row */}
              <View className="pl-4">
                <View className="flex-row items-center border-b border-border pr-4 min-h-[44px]">
                  <Text className="text-base font-normal text-foreground w-[100px]">Plate</Text>
                  <TextInput
                    className="flex-1 text-base text-foreground py-3 uppercase"
                    placeholder="ABC 123"
                    placeholderTextColor="#8E8E93"
                    value={form.plateNumber}
                    onChangeText={(text) => setForm({ ...form, plateNumber: text })}
                  />
                </View>
              </View>

              {/* Year Input Row - No Bottom Border */}
              <View className="pl-4">
                <View className="flex-row items-center pr-4 min-h-[44px]">
                  <Text className="text-base font-normal text-foreground w-[100px]">Year</Text>
                  <TextInput
                    className="flex-1 text-base text-foreground py-3"
                    placeholder="2024"
                    placeholderTextColor="#8E8E93"
                    value={form.year}
                    onChangeText={(text) => setForm({ ...form, year: text })}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
              
            </View>
          </View>

          {/* Fixed Bottom Action Bar */}
          <View className="px-4 py-4 bg-background">
            <TouchableOpacity
              activeOpacity={0.8}
              className={`bg-primary rounded-xl flex-row justify-center items-center min-h-[44px] py-4 ${submitting ? "opacity-70" : ""}`}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {editingVehicle ? "Confirm Changes" : "Save to Garage"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}