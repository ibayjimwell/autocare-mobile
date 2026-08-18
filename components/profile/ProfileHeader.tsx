import { View, Text } from "react-native";
import { User, ChevronDown } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileHeader() {
  const { user } = useAuth();
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "JD";

  return (
    <View className="px-4 pt-2">
      {/* Top bar — mirrors "Your location / Lombok mataram ▾" + avatar */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1 mr-4">
          {/* Bordered icon circle (location-pin analog) */}
          <View className="w-11 h-11 rounded-full border border-border items-center justify-center mr-3">
            <User size={18} color="#8E8E93" />
          </View>

          <View className="flex-1">
            <Text className="text-xs font-normal text-muted-foreground">
              Your Account
            </Text>
            <View className="flex-row items-center">
              <Text
                className="text-base font-semibold text-foreground mr-1"
                numberOfLines={1}
              >
                {user?.fullname || "User"}
              </Text>
            </View>
          </View>
        </View>

        
      </View>

      {/* iOS Large Title — the image's headline zone */}
      <Text className="text-3xl font-bold tracking-tight text-foreground mb-4">
        Profile
      </Text>
    </View>
  );
}