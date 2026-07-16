import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { formatDuration, formatPrice } from "../../utils/format";

const SERVICE_ICONS = [
  "car-wrench", "oil", "tire", "brake-pads", "car-wash",
  "engine", "disc", "car-cog", "speedometer", "wrench", "car-settings",
];

const getServiceIcon = (index: number) => SERVICE_ICONS[index % SERVICE_ICONS.length];

interface ServiceCardProps {
  service: any;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const handleBook = () => router.push(`/booking?serviceId=${service.id}`);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleBook}
      className="mb-5 p-6 rounded-[32px] border border-border bg-card shadow-sm"
    >
      {/* Top Row: Icon & Duration */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="w-14 h-14 rounded-2xl items-center justify-center bg-primary/10">
          <MaterialCommunityIcons name={getServiceIcon(index)} size={30} color="#C1272D" />
        </View>
        <View className="px-3 py-1.5 rounded-full flex-row items-center bg-background">
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text className="text-[11px] font-bold ml-1.5 uppercase text-muted-foreground">
            {formatDuration(service.durationMinutes)}
          </Text>
        </View>
      </View>

      {/* Service Name & Description */}
      <View className="mb-6">
        <Text className="text-xl font-heading font-black mb-2 text-foreground">
          {service.name}
        </Text>
        <Text className="text-sm leading-5 font-medium text-foreground/60">
          {service.description}
        </Text>
      </View>

      {/* Bottom Row: Price & Book Button */}
      <View className="flex-row justify-between items-center pt-4 border-t border-border">
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
            Starting at
          </Text>
          <Text className="text-2xl font-heading font-black text-primary">
            {formatPrice(service.basePrice)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleBook}
          activeOpacity={0.7}
          className="flex-row items-center py-3 px-5 rounded-2xl bg-primary shadow-lg shadow-primary/20"
        >
          <Text className="text-primary-foreground font-bold uppercase tracking-widest text-xs mr-2">
            Book
          </Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}