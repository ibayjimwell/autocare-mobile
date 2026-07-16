import { 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Text,
  TouchableOpacity
 } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useProfileData } from "../../hooks/useProfileData";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ContactCards from "../../components/profile/ContactCards";
import StatsCards from "../../components/profile/StatsCards";
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
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#C1272D" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 pb-10 bg-background"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 pt-16 pb-12">
        <ProfileHeader />
        <ContactCards />
        <StatsCards vehicles={stats.vehicles} visits={stats.visits} />

        {/* Recent History */}
        <View className="flex-row justify-between items-end mb-5 px-1">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-[2px] text-foreground/40 mb-1">
              Activity
            </Text>
            <Text className="text-xl font-heading font-black text-foreground">
              Recent History
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/history")}>
            <Text className="text-sm font-bold text-primary">View All</Text>
          </TouchableOpacity>
        </View>
        <RecentHistory appointments={stats.completedAppointments} />

        <SettingsList
          loggingOut={loggingOut}
          onLogoutPress={() => setShowLogoutModal(true)}
        />

        <Text className="text-center mt-10 text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
          AutoCare v2.0 • 2026
        </Text>
      </View>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </ScrollView>
  );
}
