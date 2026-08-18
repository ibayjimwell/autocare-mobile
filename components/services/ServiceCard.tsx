import React from "react";
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

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const handleBook = () => router.push(`/booking?serviceId=${service.id}`);
  
  const IconComponent = getServiceIcon(index);

  return (
    /* Half-width container for 2-column grid layout */
    <View className="w-1/2 p-2">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleBook}
        className="bg-card rounded-xl overflow-hidden shadow-sm border border-border/40 flex-1 justify-between"
      >
        {/* Top Visual Hero Header */}
        <View className="h-32 bg-secondary items-center justify-center relative overflow-hidden">
          {/* Subtle background watermark */}
          <View className="absolute -right-6 -bottom-6 opacity-5 transform rotate-12">
            <IconComponent size={120} color="#000000" />
          </View>
          
          {/* Centered Service Icon */}
          <View className="w-11 h-11 rounded-full bg-white/15 border border-white/20 items-center justify-center min-h-[44px] min-w-[44px]">
            <IconComponent size={24} color="#C1272D" />
          </View>
        </View>

        {/* Content Section */}
        <View className="p-3 flex-1 justify-between">
          <View>
            <Text 
              className="text-base font-bold tracking-tight text-foreground mb-1" 
              numberOfLines={1}
            >
              {service.name}
            </Text>
            
            {/* Meta Row */}
            <View className="flex-row items-center mb-2">
              <Clock size={12} color="#8E8E93" />
              <Text className="text-xs font-medium ml-1 text-muted-foreground">
                {formatDuration(service.durationMinutes)}
              </Text>
            </View>

            <Text 
              className="text-xs font-normal text-muted-foreground leading-4 mb-3" 
              numberOfLines={2}
            >
              {service.description}
            </Text>
          </View>

          {/* Price & Action Footer */}
          <View className="pt-2 border-t border-secondary mt-1">
            <Text className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
              Starting at
            </Text>
            <Text className="text-lg font-bold tracking-tight text-foreground mb-3">
              {formatPrice(service.basePrice)}
            </Text>
            
            {/* CTA Button */}
            <View className="bg-primary py-2.5 rounded-lg min-h-[38px] justify-center items-center w-full">
              <Text className="text-xs font-bold text-[#FFFFFF] tracking-wide">
                Book
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}