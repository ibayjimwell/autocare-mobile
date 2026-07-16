import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ActionItem({ icon, label, color, path }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(path)}
      className="items-center w-[30%]"
    >
      <View
        className="w-16 h-16 rounded-3xl items-center justify-center mb-2 bg-card shadow-sm"
        style={{ borderBottomWidth: 3, borderBottomColor: color + '40' }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-[11px] font-black uppercase tracking-tighter text-foreground">{label}</Text>
    </TouchableOpacity>
  );
}