import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceSelector({ services, selectedService, onSelect }) {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
          <Text className="text-white font-black text-xs">1</Text>
        </View>
        <Text className="text-lg font-heading font-black text-foreground">Select Service</Text>
      </View>
      <View className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          return (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.8}
              className={`p-5 rounded-[28px] border-2 flex-row justify-between items-center ${
                isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border'
              }`}
              onPress={() => onSelect(service)}
            >
              <View className="flex-1">
                <Text className="text-base font-black text-foreground">{service.name}</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text className="text-xs ml-1 font-bold text-muted-foreground">
                    {service.durationMinutes} min
                  </Text>
                </View>
              </View>
              <Text className="text-lg font-black text-primary">₱{service.basePrice}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}