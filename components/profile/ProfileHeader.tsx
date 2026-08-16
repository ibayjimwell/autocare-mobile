import { View, Text } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileHeader() {
  const { user } = useAuth();
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "JD";

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2023";

  return (
    <View className="bg-card mx-4 rounded-xl flex-row items-center p-4 mb-6">
      {/* Settings-style Inline Avatar */}
      <View className="w-16 h-16 rounded-full bg-primary justify-center items-center mr-4">
        <Text className="text-xl font-bold text-white tracking-wider">
          {initials}
        </Text>
      </View>

      <View className="flex-1 justify-center">
        <Text className="text-xl font-semibold text-foreground mb-1">
          {user?.fullname || "User"}
        </Text>
        <Text className="text-sm font-normal text-muted-foreground">
          Member since {joinDate}
        </Text>
      </View>
    </View>
  );
}