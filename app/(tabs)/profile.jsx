import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  router,
} from 'expo-router';
import {
  LogOut,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react-native';
import {
  useState,
} from 'react';

import {
  useAuth,
} from '../../context/AuthContext';

import {
  useProfileData,
} from '../../hooks/useProfileData';

import ProfileHeader from '../../components/profile/ProfileHeader';
import ContactCards from '../../components/profile/ContactCards';
import StatsCards from '../../components/profile/StatsCards';
import RecentHistory from '../../components/profile/RecentHistory';
import SettingsList from '../../components/profile/SettingsList';
import LogoutModal from '../../components/profile/LogoutModal';

export default function ProfileScreen() {
  const {
    user,
    logout,
  } = useAuth();

  const {
    loading,
    stats,
  } = useProfileData();

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    showLogoutModal,
    setShowLogoutModal,
  ] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    setShowLogoutModal(false);

    try {
      await logout();
      router.replace('/login');
    } catch (err) {
      console.error(
        'Logout error:',
        err
      );
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator
          size="large"
          color="#C1272D"
        />
      </SafeAreaView>
    );
  }

  const phoneVerified =
    Boolean(user?.isPhoneVerified);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <ProfileHeader />

        {/* Mobile Phone Verification */}
        <View className="mx-4 mb-4 rounded-xl bg-card overflow-hidden">
          <View className="flex-row items-center px-4 py-4">
            <View
              className={`h-11 w-11 items-center justify-center rounded-full ${
                phoneVerified
                  ? 'bg-primary/10'
                  : 'bg-secondary'
              }`}
            >
              {phoneVerified ? (
                <ShieldCheck
                  size={21}
                  color="#C1272D"
                />
              ) : (
                <ShieldAlert
                  size={21}
                  color="#8E8E93"
                />
              )}
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-foreground">
                Mobile Phone
              </Text>

              <Text className="mt-1 text-sm text-muted-foreground">
                {user?.phone ||
                  'No phone number'}
              </Text>
            </View>

            <View
              className={`rounded-full px-3 py-1.5 ${
                phoneVerified
                  ? 'bg-primary/10'
                  : 'bg-secondary'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  phoneVerified
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {phoneVerified
                  ? 'Verified'
                  : 'Not Verified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <ContactCards />

        {/* Overview */}
        <StatsCards
          vehicles={stats.vehicles}
          visits={stats.visits}
        />

        {/* Activity */}
        <View className="mt-4 flex-row items-end justify-between px-8 mb-2">
          <Text className="text-sm font-normal uppercase tracking-wider text-muted-foreground">
            Activity
          </Text>

          <TouchableOpacity
            className="min-h-[44px] justify-center"
            onPress={() =>
              router.push('/history')
            }
          >
            <Text className="text-sm font-semibold text-primary">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <RecentHistory
          appointments={
            stats.completedAppointments
          }
        />

        {/* Preferences */}
        <SettingsList />

        {/* Logout */}
        <View className="mt-6 px-8">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setShowLogoutModal(true)
            }
            disabled={loggingOut}
            className="min-h-[50px] flex-row items-center justify-center rounded-xl bg-primary"
          >
            {loggingOut ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <LogOut
                  size={20}
                  color="#FFFFFF"
                />

                <Text className="ml-2 text-base font-semibold text-white">
                  Sign Out
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text className="mt-8 text-center text-xs font-normal text-muted-foreground">
          AutoCare v2.0 • 2026
        </Text>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() =>
          setShowLogoutModal(false)
        }
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}