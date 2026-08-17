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
        className="mx-4 rounded-xl overflow-hidden bg-primary flex-row min-h-[168px]"
      >
        {/* Decorative background circles */}
        <View className="absolute -top-16 -right-10 w-44 h-44 rounded-full bg-white/10" />
        <View className="absolute -bottom-20 right-24 w-36 h-36 rounded-full bg-black/10" />

        {/* Copy + CTA */}
        <View className="flex-1 p-5 justify-between">
          <View>
            {/* Floating badge — glassmorphism permitted here */}
            <View className="bg-white/20 border border-white/30 self-start px-2.5 py-1 rounded-full mb-3">
              <Text className="text-white text-xs font-semibold tracking-wide">SHOP OPEN</Text>
            </View>
            <Text className="text-white text-xl font-bold">AUTO PRO TECH</Text>
            <Text className="text-white/80 text-sm font-normal mt-1">
              Top-rated care for your vehicle
            </Text>
          </View>

          <View className="bg-white self-start flex-row items-center px-4 py-2 rounded-full mt-4">
            <Text className="text-primary text-sm font-semibold mr-1.5">Book Now</Text>
            <ArrowRight size={14} color="#C1272D" />
          </View>
        </View>

        {/* Car visual on the right, like the inspiration banner */}
        <Image
          source={{ uri: 'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=600' }}
          style={{ width: 140 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
}