import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight, Bell, Shield, CircleHelp } from "lucide-react-native";

export default function SettingsList() {
  // The Sign Out row now lives in the screen's floating glass CTA bar,
  // mirroring the prominent center action in the inspiration image's
  // bottom bar. Handler and loading state are unchanged there.
  return (
    <View className="mt-4">
      {/* Settings Group Header */}
      <View className="px-8 mb-2">
        <Text className="text-sm font-normal uppercase tracking-wider text-muted-foreground">
          Preferences
        </Text>
      </View>

      {/* Main Settings Grouped List */}
      <View className="bg-card mx-4 rounded-xl overflow-hidden mb-6">
        {/* Notifications Item */}
        <TouchableOpacity activeOpacity={0.7} className="pl-4">
          <View className="flex-row items-center py-3 pr-4 border-b border-border min-h-[44px]">
            <Bell size={22} color="#8E8E93" />
            <Text className="flex-1 text-base font-normal text-foreground ml-3">
              Notifications
            </Text>
            <ChevronRight size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>

        {/* Privacy Item */}
        <TouchableOpacity activeOpacity={0.7} className="pl-4">
          <View className="flex-row items-center py-3 pr-4 border-b border-border min-h-[44px]">
            <Shield size={22} color="#8E8E93" />
            <Text className="flex-1 text-base font-normal text-foreground ml-3">
              Privacy & Security
            </Text>
            <ChevronRight size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>

        {/* Help & Support Item (No bottom border for last item) */}
        <TouchableOpacity activeOpacity={0.7} className="pl-4">
          <View className="flex-row items-center py-3 pr-4 min-h-[44px]">
            <CircleHelp size={22} color="#8E8E93" />
            <Text className="flex-1 text-base font-normal text-foreground ml-3">
              Help & Support
            </Text>
            <ChevronRight size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}