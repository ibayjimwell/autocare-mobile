import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function VehicleSelector({ vehicles, selectedVehicle, onSelect }) {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
          <Text className="text-white font-black text-xs">2</Text>
        </View>
        <Text className="text-lg font-heading font-black text-foreground">Select Vehicle</Text>
      </View>
      {vehicles.length === 0 ? (
        <View className="p-6 rounded-[28px] border border-dashed border-border items-center">
          <Text className="text-sm font-bold text-foreground/50">No vehicles in your garage</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {vehicles.map((vehicle) => {
            const isSelected = selectedVehicle?.id === vehicle.id;
            return (
              <TouchableOpacity
                key={vehicle.id}
                activeOpacity={0.8}
                className={`p-5 rounded-[28px] border-2 flex-row items-center ${
                  isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                }`}
                onPress={() => onSelect(vehicle)}
              >
                <View className="w-10 h-10 rounded-2xl bg-background items-center justify-center mr-4 shadow-sm">
                  <MaterialCommunityIcons
                    name="car-side"
                    size={24}
                    color={isSelected ? '#C1272D' : '#666'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-black text-foreground">
                    {vehicle.make} {vehicle.model}
                  </Text>
                  <Text className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    {vehicle.plateNumber}
                  </Text>
                </View>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={isSelected ? '#C1272D' : '#D9D9D9'}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}