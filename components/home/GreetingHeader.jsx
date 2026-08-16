import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function GreetingHeader() {
  const { user } = useAuth();
  return (
    <View className="px-4 pt-14 pb-4 flex-row justify-between items-end">
      <View>
        <Text className="text-3xl font-bold tracking-tight text-foreground">
          {user?.fullname || 'Customer'}
        </Text>
      </View>
      <TouchableOpacity
        className="w-10 h-10 rounded-full bg-secondary items-center justify-center min-h-[44px] min-w-[44px]"
        onPress={() => { /* navigate to notifications */ }}
      >
        <Bell size={20} color="#000000" />
      </TouchableOpacity>
    </View>
  );
}