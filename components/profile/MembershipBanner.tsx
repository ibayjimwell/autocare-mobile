import { View, Text } from "react-native";
import { BadgeCheck, ChevronRight } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

export default function MembershipBanner() {
  const { user } = useAuth();
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2023";

  return (
    // Mirrors the "Identify the closest vehicle" banner:
    // thumbnail left, two-line text center, circular arrow button right.
    <View className="bg-card mx-4 rounded-xl p-4 mb-6 flex-row items-center shadow-sm">
      {/* Thumbnail (map-tile analog) */}
      <View className="w-14 h-14 rounded-lg bg-secondary items-center justify-center mr-3">
        <BadgeCheck size={26} color="#C1272D" />
      </View>

      <View className="flex-1 justify-center pr-3">
        <Text className="text-base font-semibold text-foreground mb-0.5">
          AutoCare Member
        </Text>
        <Text className="text-sm font-normal text-muted-foreground">
          Member since {joinDate}
        </Text>
      </View>

      {/* Circular arrow button — display-only, mirrors the image */}
      <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
        <ChevronRight size={18} color="#FFFFFF" />
      </View>
    </View>
  );
}