import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function ContactCards() {
  const { user } = useAuth();
  return (
    <View className="flex-row gap-3 mb-8">
      <View className="flex-1 p-4 rounded-3xl border border-border bg-card">
        <Ionicons name="mail-unread-outline" size={20} color="#C1272D" />
        <Text className="text-[10px] font-bold uppercase text-foreground/40 mt-2 mb-0.5">Email</Text>
        <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
          {user?.email || "No email"}
        </Text>
      </View>
      <View className="flex-1 p-4 rounded-3xl border border-border bg-card">
        <Ionicons name="phone-portrait-outline" size={20} color="#C1272D" />
        <Text className="text-[10px] font-bold uppercase text-foreground/40 mt-2 mb-0.5">Phone</Text>
        <Text className="text-xs font-bold text-foreground">{user?.phone || "No phone"}</Text>
      </View>
    </View>
  );
}