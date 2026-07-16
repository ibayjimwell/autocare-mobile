import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function GreetingHeader() {
  const { user } = useAuth();
  return (
    <View className="px-6 pt-14 pb-6 flex-row justify-between items-center">
      <View>
        <Text className="text-sm font-bold uppercase tracking-widest text-foreground/60">
          Welcome back
        </Text>
        <Text className="text-3xl font-heading font-black text-foreground">
          {user?.fullname?.split(' ')[0] || 'Customer'}
          <Text className="text-primary">.</Text>
        </Text>
      </View>
      <TouchableOpacity
        className="w-12 h-12 rounded-2xl items-center justify-center border border-border bg-card"
        onPress={() => { /* navigate to notifications */ }}
      >
        <Ionicons name="notifications-outline" size={22} color="#C1272D" />
      </TouchableOpacity>
    </View>
  );
}