import { View, Text, TouchableOpacity } from 'react-native';
import { Wrench, Clock, Check } from 'lucide-react-native';

export default function ServiceSelector({ services, selectedService, onSelect }) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center px-1 mb-3">
        <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-2">
          <Wrench size={14} color="#C1272D" />
        </View>
        <Text className="text-lg font-semibold text-foreground">Select Service</Text>
      </View>

      <View className="bg-card rounded-xl overflow-hidden">
        {services.map((service, index) => {
          const isSelected = selectedService?.id === service.id;
          const isLast = index === services.length - 1;
          return (
            <View key={service.id}>
              <TouchableOpacity
                activeOpacity={0.6}
                className={`flex-row items-center px-4 py-4 min-h-[44px] ${
                  isSelected ? 'bg-primary/5' : ''
                }`}
                onPress={() => onSelect(service)}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-base font-normal text-foreground">
                    {service.name}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Clock size={12} color="#8E8E93" />
                    <Text className="text-sm font-normal text-muted-foreground ml-1">
                      {service.durationMinutes} min
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-semibold text-primary mr-2">
                  ₱{service.basePrice}
                </Text>
                {isSelected && (
                  <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
              {!isLast && <View className="h-px bg-border ml-4" />}
            </View>
          );
        })}
      </View>
    </View>
  );
}