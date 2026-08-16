import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HeroCard() {
  const router = useRouter();
  return (
    <View className="mb-8">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/booking')}
        className="mx-4 relative rounded-xl overflow-hidden"
      >
        <Image
          source={{ uri: 'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=600' }}
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute w-full h-full bg-black/40" />
        
        <View className="flex-1 p-6 justify-end">
          <View className="bg-white/20 self-start px-2 py-1 rounded mb-2">
            <Text className="text-white text-xs font-semibold">SHOP OPEN</Text>
          </View>
          <Text className="text-white text-2xl font-bold tracking-tight mb-1">
            AutoCare PMS & Checkup
          </Text>
          <View className="flex-row items-center mt-2 justify-end">
            <Text className="text-white text-sm font-medium mr-2">Book Now</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}