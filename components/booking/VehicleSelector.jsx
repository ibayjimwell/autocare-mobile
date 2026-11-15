
import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';

import {
  CarFront,
  Check,
  Circle,
} from 'lucide-react-native';

// Maximum height of the independently scrollable vehicle list.
const VEHICLE_LIST_MAX_HEIGHT = 224;

export default function VehicleSelector({
  vehicles = [],
  selectedVehicle,
  onSelect,
}) {
  return (
    <View className="mb-6">
      {/* Section header */}
      <View className="mb-3 flex-row items-center px-1">
        <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <CarFront size={14} color="#C1272D" />
        </View>

        <Text className="flex-1 text-lg font-semibold text-foreground">
          Select Vehicle
        </Text>

        <View className="rounded-full bg-primary/10 px-3 py-1.5">
          <Text className="text-xs font-bold text-primary">
            {vehicles.length} vehicles
          </Text>
        </View>
      </View>

      {vehicles.length === 0 ? (
        <View className="items-center rounded-xl border border-dashed border-border p-6">
          <Text className="text-sm font-normal text-muted-foreground">
            No vehicles in your garage
          </Text>
        </View>
      ) : (
        /* Independent vehicle scroll container */
        <View className="overflow-hidden rounded-xl border border-border bg-card">
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            directionalLockEnabled={true}
            style={{
              maxHeight: VEHICLE_LIST_MAX_HEIGHT,
            }}
          >
            {vehicles.map((vehicle, index) => {
              const isSelected =
                String(selectedVehicle?.id) ===
                String(vehicle.id);

              const isLast =
                index === vehicles.length - 1;

              return (
                <View key={String(vehicle.id)}>
                  <TouchableOpacity
                    accessibilityRole="radio"
                    accessibilityLabel={`${vehicle.make} ${vehicle.model}, ${vehicle.plateNumber}`}
                    accessibilityState={{
                      selected: isSelected,
                    }}
                    activeOpacity={0.6}
                    className={`min-h-[44px] flex-row items-center px-4 py-3.5 ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                    onPress={() => onSelect(vehicle)}
                  >
                    {/* Vehicle image or placeholder */}
                    <View className="mr-3 h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-background">
                      {vehicle.imageUrl ? (
                        <Image
                          source={{
                            uri: vehicle.imageUrl,
                          }}
                          className="h-full w-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <CarFront
                          size={22}
                          color={
                            isSelected
                              ? '#C1272D'
                              : '#8E8E93'
                          }
                        />
                      )}
                    </View>

                    {/* Vehicle details */}
                    <View className="mr-3 flex-1">
                      <Text className="text-base font-normal text-foreground">
                        {vehicle.make} {vehicle.model}
                      </Text>

                      <Text className="text-sm font-normal text-muted-foreground">
                        {vehicle.plateNumber}
                      </Text>
                    </View>

                    {/* Selection indicator */}
                    {isSelected ? (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check
                          size={14}
                          color="#FFFFFF"
                          strokeWidth={3}
                        />
                      </View>
                    ) : (
                      <Circle
                        size={24}
                        color="#D1D1D6"
                      />
                    )}
                  </TouchableOpacity>

                  {!isLast && (
                    <View className="ml-4 h-px bg-border" />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
