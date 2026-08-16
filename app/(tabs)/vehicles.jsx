import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Plus, Car } from "lucide-react-native";
import { useVehicles } from "../../hooks/useVehicles";
import VehicleCard from "../../components/vehicles/VehicleCard";
import VehicleFormModal from "../../components/vehicles/VehicleFormModal";

export default function VehiclesScreen() {
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

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
    <SafeAreaView className="flex-1 bg-background">
      {/* Large Header */}
      <View className="px-4 pt-4 mb-4">
        <Text className="text-3xl font-bold tracking-tight text-foreground">
          Vehicles
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#C1272D" />
          </View>
        ) : vehicles.length === 0 ? (
          <View className="items-center justify-center py-32 px-4">
            <Car size={56} color="#8E8E93" />
            <Text className="text-lg font-semibold text-foreground mt-4">
              No Vehicles Found
            </Text>
            <Text className="text-base font-normal text-muted-foreground mt-2 text-center">
              Start your journey by adding your first car.
            </Text>
          </View>
        ) : (
          <View className="bg-card rounded-xl mx-4 overflow-hidden mb-6">
            {vehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={() => openEditModal(vehicle)}
                onDelete={() => deleteVehicle(vehicle)}
                isLast={index === vehicles.length - 1}
              />
            ))}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View className="px-4 py-4 bg-background">
        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-primary rounded-xl flex-row justify-center items-center min-h-[44px] py-4"
          onPress={openAddModal}
        >
          <Plus color="#FFFFFF" size={20} className="mr-2" />
          <Text className="text-white font-semibold text-base">
            Add Vehicle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Modal */}
      <VehicleFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        editingVehicle={editingVehicle}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}