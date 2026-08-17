import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ActionItem({ icon: Icon, label, color, path, isLast }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(path)}
      className={`flex-1 bg-card rounded-xl border border-border items-center justify-center py-4 min-h-[96px] ${!isLast ? 'mr-3' : ''}`}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: color + '15' }}
      >
        {/* Safely render the icon component */}
        {Icon && <Icon size={22} color={color} />}
      </View>
      <Text className="text-sm font-medium text-foreground">{label}</Text>
    </TouchableOpacity>
  );
}