import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface SettingsListProps {
  onLogoutPress: () => void;
  loggingOut: boolean;
}

export default function SettingsList({ onLogoutPress, loggingOut }: SettingsListProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View className="rounded-[32px] overflow-hidden border border-border bg-card">
      {/* Account Settings */}
      <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-border">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-2xl items-center justify-center mr-4 bg-background">
            <Ionicons name="settings-outline" size={20} color="#1A1A1A" />
          </View>
          <Text className="text-sm font-bold text-foreground">Account Settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>

      {/* Theme Toggle */}
      <TouchableOpacity
        className="flex-row items-center justify-between p-5 border-b border-border"
        onPress={toggleTheme}
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-2xl items-center justify-center mr-4 bg-background">
            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={20} color="#1A1A1A" />
          </View>
          <Text className="text-sm font-bold text-foreground">
            {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </Text>
        </View>
        <View className={`w-10 h-5 rounded-full px-1 justify-center ${isDarkMode ? 'bg-primary' : 'bg-muted'}`}>
          <View className={`w-3 h-3 rounded-full bg-white ${isDarkMode ? 'self-end' : 'self-start'}`} />
        </View>
      </TouchableOpacity>

      {/* Sign Out */}
      <TouchableOpacity
        className="flex-row items-center p-5"
        onPress={onLogoutPress}
        disabled={loggingOut}
      >
        <View className="w-10 h-10 rounded-2xl items-center justify-center mr-4 bg-destructive/10">
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </View>
        <Text className="text-sm font-bold text-destructive">
          {loggingOut ? "Logging out..." : "Sign Out"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}