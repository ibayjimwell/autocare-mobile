import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ActionItem({ icon: Icon, label, color, path, isLast }) {
  const router = useRouter();
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(path)}
      className="bg-card"
    >
      <View className={`flex-row items-center justify-between py-3 pr-4 ml-4 min-h-[44px] ${!isLast ? 'border-b border-border' : ''}`}>
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: color + '15' }}>
            {/* Safely render the icon component */}
            {Icon && <Icon size={18} color={color} />}
          </View>
          <Text className="ml-3 text-base font-normal text-foreground">{label}</Text>
        </View>
        <ChevronRight size={20} color="#C5C5C7" />
      </View>
    </TouchableOpacity>
  );
}