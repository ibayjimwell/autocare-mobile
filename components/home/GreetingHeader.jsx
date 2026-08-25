import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Wrench } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function GreetingHeader() {
  const { user } = useAuth();
  const platformName = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';

  return (
    <View className="z-50 px-4 pt-4 pb-6 bg-primary rounded-b-[32px] shadow-md">
      {/* Location row */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-full bg-white/15 border border-white/20 items-center justify-center mr-3">
            <Wrench size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-sm font-normal text-white/70">{platformName}</Text>
            <View className="flex-row items-center">
              <Text className="text-base font-semibold text-white mr-1">AutoCare System</Text>
            </View>
          </View>
        </View>

        <NotificationBell />
      </View>

      {/* Large Title headline */}
      <Text className="text-3xl font-bold tracking-tight text-white">
        Hello, {user?.fullname || 'Customer'}
      </Text>
      <Text className="text-base font-normal text-white/80 mt-1">
        Find your chosen service today.
      </Text>
    </View>
  );
}