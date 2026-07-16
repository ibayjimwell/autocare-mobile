import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FloatingActionButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/booking')}
      className="absolute bottom-10 right-6 w-16 h-16 rounded-full bg-primary items-center justify-center shadow-xl shadow-primary/40"
    >
      <Ionicons name="add" size={32} color="white" />
    </TouchableOpacity>
  );
}