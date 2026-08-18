import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router, Link } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { useProfileData } from "../../hooks/useProfileData";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ContactCards from "../../components/profile/ContactCards";
import StatsCards from "../../components/profile/StatsCards";
import MembershipBanner from "../../components/profile/MembershipBanner";
import RecentHistory from "../../components/profile/RecentHistory";
import SettingsList from "../../components/profile/SettingsList";
import LogoutModal from "../../components/profile/LogoutModal";
import pushNotificationApi from "../../services/pushNotificationApi";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { loading, stats } = useProfileData();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    setShowLogoutModal(false);
    try {
      // Unregister push token if you have one
      // await pushNotificationApi.unregisterToken(token);
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#C1272D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }} // Adjusted padding since floating bar is removed
      >
        {/* Header zone — mirrors the image's top bar + large headline */}
        <ProfileHeader />

        {/* Search-bar slot → contact grouped card */}
        <ContactCards />

        {/* "Top Brands" slot → stat tiles */}
        <StatsCards vehicles={stats.vehicles} visits={stats.visits} />

        {/* Promo banner slot → membership banner */}
        <MembershipBanner />

        {/* "Available Near You" slot → Activity section */}
        <View className="flex-row justify-between items-end px-8 mb-2 mt-4">
          <Text className="text-sm font-normal uppercase tracking-wider text-muted-foreground">
            Activity
          </Text>
          <TouchableOpacity onPress={() => router.push("/history")}>
            <Link className="text-sm font-semibold text-primary" href="history">
              View All
            </Link>
          </TouchableOpacity>
        </View>
        <RecentHistory appointments={stats.completedAppointments} />

        {/* Preferences grouped list */}
        <SettingsList />

        {/* Simple inline Logout Button below Preferences */}
        <View className="px-8 mt-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowLogoutModal(true)}
            disabled={loggingOut}
            className="bg-primary rounded-xl min-h-[50px] flex-row items-center justify-center"
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <LogOut size={20} color="#FFFFFF" />
                <Text className="text-base font-semibold text-white ml-2">
                  Sign Out
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-center mt-8 text-xs font-normal text-muted-foreground">
          AutoCare v2.0 • 2026
        </Text>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}