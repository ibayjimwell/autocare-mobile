import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function ProfileHeader() {
  const { user } = useAuth();
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "JD";

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2023";

  return (
    <View className="items-center mb-10">
      <View className="w-28 h-28 rounded-[40px] justify-center items-center mb-5 shadow-xl shadow-primary/30 bg-primary rotate-[-4deg]">
        <View className="rotate-[4deg]">
          <Text className="text-4xl font-heading font-black text-white italic tracking-tighter">
            {initials}
          </Text>
        </View>
        <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary items-center justify-center border-4 border-background">
          <Ionicons name="checkmark" size={14} color="#1A1A1A" />
        </View>
      </View>

      <Text className="text-3xl font-heading font-black tracking-tight text-foreground">
        {user?.fullname || "User"}
      </Text>

      <View className="flex-row items-center mt-1">
        <Ionicons name="calendar-outline" size={12} color="#666" />
        <Text className="text-xs font-bold ml-1 text-muted-foreground/50 uppercase tracking-widest">
          Member since {joinDate}
        </Text>
      </View>
    </View>
  );
}