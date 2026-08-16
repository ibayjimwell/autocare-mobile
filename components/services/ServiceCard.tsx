import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { formatDuration, formatPrice } from "../../utils/format";
import { 
  Wrench, 
  Droplet, 
  CircleDashed, 
  Octagon, 
  Sparkles, 
  Cpu, 
  Disc, 
  Settings, 
  Gauge, 
  PenTool, 
  Sliders, 
  Clock 
} from "lucide-react-native";

const SERVICE_ICONS = [
  Wrench, Droplet, CircleDashed, Octagon, Sparkles,
  Cpu, Disc, Settings, Gauge, PenTool, Sliders,
];

const getServiceIcon = (index: number) => SERVICE_ICONS[index % SERVICE_ICONS.length];

interface ServiceCardProps {
  service: any;
  index: number;
  isLast?: boolean;
}

export default function ServiceCard({ service, index, isLast }: ServiceCardProps) {
  const handleBook = () => router.push(`/booking?serviceId=${service.id}`);
  
  const IconComponent = getServiceIcon(index);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleBook}
      className="bg-card"
    >
      <View className="flex-row items-start pl-4">
        
        {/* Left Icon */}
        <View className="w-10 h-10 rounded-lg items-center justify-center bg-secondary mr-3 mt-4">
          <IconComponent size={20} color="#000000" />
        </View>

        {/* Content & Inset Divider */}
        <View className={`flex-1 flex-row py-4 pr-4 min-h-[60px] ${!isLast ? "border-b border-border" : ""}`}>
          
          {/* Main Info */}
          <View className="flex-1 pr-3 justify-center">
            <Text className="text-base font-semibold text-foreground mb-1">
              {service.name}
            </Text>
            <Text className="text-sm font-normal text-muted-foreground mb-2 leading-5" numberOfLines={2}>
              {service.description}
            </Text>
            
            <View className="flex-row items-center mt-1">
              <Clock size={14} color="#8E8E93" />
              <Text className="text-sm font-medium ml-1.5 text-muted-foreground">
                {formatDuration(service.durationMinutes)}
              </Text>
            </View>
          </View>

          {/* Right Action (Price & Book) */}
          <View className="items-end justify-between">
            <Text className="text-base font-semibold text-foreground">
              {formatPrice(service.basePrice)}
            </Text>
            
            {/* Visual CTA (Button logic is handled by the parent TouchableOpacity) */}
            <View className="bg-primary/10 px-4 py-1.5 rounded-full mt-3 min-h-[32px] justify-center">
              <Text className="text-sm font-bold text-primary tracking-wide">
                Book
              </Text>
            </View>
          </View>
          
        </View>
      </View>
    </TouchableOpacity>
  );
}