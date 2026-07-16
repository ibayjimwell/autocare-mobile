import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HeroCard() {
  const router = useRouter();
  return (
    <View className="px-6">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/booking')}
        className="relative rounded-[32px] overflow-hidden h-48 shadow-xl shadow-black/20"
      >
        <Image
          source={{ uri: 'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=600' }}
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute w-full h-full bg-black/50" />
        <View className="flex-1 p-7 justify-center">
          <View className="bg-white/20 self-start px-3 py-1 rounded-lg mb-2">
            <Text className="text-white text-[10px] font-bold uppercase tracking-tighter">the shop is open</Text>
          </View>
          <Text className="text-white text-2xl font-heading font-black mb-1 leading-7">
            <Text className="text-primary">Auto</Text>Care{"\n"}PMS & Checkup
          </Text>
          <Text className="text-white text-xs mb-4 opacity-80 font-medium">Keep your engine running smooth.</Text>
          <View className="self-start px-6 py-2.5 rounded-xl bg-secondary flex-row items-center">
            <Text className="text-secondary-foreground font-black text-sm mr-2">Book Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#1A1A1A" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}