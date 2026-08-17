import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Wrench, Bell } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function GreetingHeader() {
  const { user } = useAuth();
  
  // Determine current platform name dynamically
  const platformName = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';
  
  return (
    // Removed 'absolute top-0 left-0 right-0' so it naturally occupies space without overlapping
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

        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-white/15 border border-white/20 items-center justify-center min-h-[44px] min-w-[44px]"
          onPress={() => { /* navigate to notifications */ }}
        >
          <Bell size={20} color="#FFFFFF" />
        </TouchableOpacity>
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