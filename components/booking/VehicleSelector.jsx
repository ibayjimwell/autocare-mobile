import { View, Text, TouchableOpacity } from 'react-native';
import { CarFront, Check, Circle } from 'lucide-react-native';

export default function VehicleSelector({ vehicles, selectedVehicle, onSelect }) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center px-1 mb-3">
        <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-2">
          <CarFront size={14} color="#C1272D" />
        </View>
        <Text className="text-lg font-semibold text-foreground">Select Vehicle</Text>
      </View>

      {vehicles.length === 0 ? (
        <View className="p-6 rounded-xl border border-dashed border-border items-center">
          <Text className="text-sm font-normal text-muted-foreground">
            No vehicles in your garage
          </Text>
        </View>
      ) : (
        <View className="bg-card rounded-xl overflow-hidden">
          {vehicles.map((vehicle, index) => {
            const isSelected = selectedVehicle?.id === vehicle.id;
            const isLast = index === vehicles.length - 1;
            return (
              <View key={vehicle.id}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  className={`flex-row items-center px-4 py-3.5 min-h-[44px] ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                  onPress={() => onSelect(vehicle)}
                >
                  <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-3">
                    <CarFront size={22} color={isSelected ? '#C1272D' : '#8E8E93'} />
                  </View>
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-normal text-foreground">
                      {vehicle.make} {vehicle.model}
                    </Text>
                    <Text className="text-sm font-normal text-muted-foreground">
                      {vehicle.plateNumber}
                    </Text>
                  </View>
                  {isSelected ? (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : (
                    <Circle size={24} color="#D1D1D6" />
                  )}
                </TouchableOpacity>
                {!isLast && <View className="h-px bg-border ml-4" />}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}