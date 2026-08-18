import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { Plus, Car } from "lucide-react-native";
import { useVehicles } from "../../hooks/useVehicles";
import VehicleCard from "../../components/vehicles/VehicleCard";
import VehicleFormModal from "../../components/vehicles/VehicleFormModal";

export default function VehiclesScreen() {
  const { vehicles, loading, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const insets = useSafeAreaInsets();

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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Large Header — mirrors the image's welcome header block */}
      <View className="px-4 pt-2 mb-4">
        <Text className="text-sm font-normal text-muted-foreground mb-1">
          AutoCare Garage
        </Text>
        <Text className="text-3xl font-bold tracking-tight text-foreground">
          Vehicles
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#C1272D" />
          </View>
        ) : vehicles.length === 0 ? (
          <View className="items-center justify-center py-32 px-4">
            <View className="w-20 h-20 rounded-full bg-card items-center justify-center shadow-sm">
              <Car size={36} color="#8E8E93" />
            </View>
            <Text className="text-lg font-semibold text-foreground mt-4">
              No Vehicles Found
            </Text>
            <Text className="text-base font-normal text-muted-foreground mt-2 text-center">
              Start your journey by adding your first car.
            </Text>
          </View>
        ) : (
          <View>
            {/* Section header — mirrors "Popular Car / View All" */}
            <View className="flex-row items-center justify-between px-4 mb-3">
              <Text className="text-lg font-semibold text-foreground">My Vehicles</Text>
              <Text className="text-sm font-normal text-muted-foreground">
                {vehicles.length} in garage
              </Text>
            </View>

            {/* 2-column card grid — mirrors the image's Popular Car grid */}
            <View className="flex-row flex-wrap justify-between px-4">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onEdit={() => openEditModal(vehicle)}
                  onDelete={() => deleteVehicle(vehicle)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom CTA Bar — translucent glass, mirrors the image's floating bar */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 pt-3 bg-white/85 border-t border-border/40 shadow-lg"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          className="bg-primary rounded-xl flex-row justify-center items-center min-h-[44px] py-4 mb-16"
          onPress={openAddModal}
        >
          <Plus color="#FFFFFF" size={20} />
          <Text className="text-white font-semibold text-base ml-2">
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