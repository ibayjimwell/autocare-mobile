import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';

export default function FloatingActionButton() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push('/booking')}
      className="absolute bottom-6 right-5 w-14 h-14 rounded-full bg-primary items-center justify-center"
      style={{
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <Plus size={25} color="#FFFFFF" strokeWidth={2.2} />
    </TouchableOpacity>
  );
}