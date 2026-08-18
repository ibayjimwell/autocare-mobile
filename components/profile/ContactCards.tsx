import { View, Text } from "react-native";
import { Mail, Phone } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

export default function ContactCards() {
  const { user } = useAuth();

  return (
    // Occupies the image's "search bar" slot: first rounded white surface
    // directly under the headline, built as a standard iOS grouped card.
    <View className="bg-card mx-4 rounded-xl overflow-hidden mb-6">
      {/* Email Row */}
      <View className="flex-row items-center pl-4">
        <Mail size={20} color="#8E8E93" />
        <View className="flex-1 flex-row justify-between items-center ml-3 pr-4 py-3 min-h-[44px] border-b border-border">
          <Text className="text-base font-normal text-foreground">Email</Text>
          <Text className="text-base font-normal text-muted-foreground" numberOfLines={1}>
            {user?.email || "No email"}
          </Text>
        </View>
      </View>

      {/* Phone Row (No Bottom Border) */}
      <View className="flex-row items-center pl-4">
        <Phone size={20} color="#8E8E93" />
        <View className="flex-1 flex-row justify-between items-center ml-3 pr-4 py-3 min-h-[44px]">
          <Text className="text-base font-normal text-foreground">Phone</Text>
          <Text className="text-base font-normal text-muted-foreground">
            {user?.phone || "No phone"}
          </Text>
        </View>
      </View>
    </View>
  );
}