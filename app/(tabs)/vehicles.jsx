import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useVehicles } from "../../hooks/useVehicles";
import VehicleCard from "../../components/vehicles/VehicleCard";
import VehicleFormModal from "../../components/vehicles/VehicleFormModal";

export default function VehiclesScreen() {
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);   // ← removed <any>

  const openAddModal = () => {
    setEditingVehicle(null);
    setModalVisible(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setModalVisible(true);
  };

  const handleSave = async (payload) => {
    if (editingVehicle) {
      return await updateVehicle(editingVehicle.id, payload);
    } else {
      return await addVehicle(payload);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 flex-row justify-between items-end">
        <View>
          <Text className="text-sm font-bold uppercase tracking-[2px] text-foreground/50">
            Garage
          </Text>
          <Text className="text-3xl font-heading font-black text-foreground">
            Vehicles<Text className="text-primary">.</Text>
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-12 h-12 rounded-2xl justify-center items-center bg-primary shadow-lg shadow-primary/20"
          onPress={openAddModal}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#C1272D" />
          </View>
        ) : vehicles.length === 0 ? (
          <View className="items-center justify-center py-24 opacity-50">
            <View className="w-24 h-24 rounded-full bg-muted items-center justify-center mb-6">
              <MaterialCommunityIcons name="car-off" size={48} color="#666" />
            </View>
            <Text className="text-lg font-bold text-foreground">No vehicles found</Text>
            <Text className="text-sm font-medium text-muted-foreground mt-2">
              Start your journey by adding{"\n"}your first car.
            </Text>
          </View>
        ) : (
          vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={() => openEditModal(vehicle)}
              onDelete={() => deleteVehicle(vehicle)}
            />
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Add/Edit Modal */}
      <VehicleFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        editingVehicle={editingVehicle}
        onSave={handleSave}
      />
    </View>
  );
}