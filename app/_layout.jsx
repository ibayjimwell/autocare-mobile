import { Stack, useRouter } from 'expo-router';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import React, { useEffect } from 'react';          // ✅ useEffect imported here
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { usePushNotifications } from '../hooks/usePushNotifications';
import '../global.css';

/**
 * --- Custom Liquid-Glass Header Component ---
 * Designed for functional screens (Tracking, Booking, etc.) outside of main tab navigation.
 * Features: High touch-target back buttons, Material typography, and glass dividers.
 */
function CustomStackHeader({ title, canGoBack }) {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ 
        paddingTop: insets.top,
        backgroundColor: theme.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.border + '40',
      }}
      className="px-5 pb-4 shadow-sm"
    >
      <View className="flex-row items-center h-14">
        {canGoBack && (
          <TouchableOpacity 
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-11 h-11 items-center justify-center rounded-2xl mr-3"
            style={{ backgroundColor: theme.primary + '10' }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text 
            className="text-lg font-black tracking-tight"
            style={{ color: theme.text }}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        <View 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: theme.primary }} 
        />
      </View>
    </View>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const url = Linking.useURL();
  const router = useRouter();

  // ✅ Register push notifications (safe – hook internally guards for user)
  usePushNotifications();

  // Handle deep links (e.g., payment-success)
  useEffect(() => {
    if (url) {
      const { path, queryParams } = Linking.parse(url);
      if (path === 'payment-success') {
        router.replace({ pathname: '/payment-success', params: queryParams });
      }
    }
  }, [url]);

  // Global Loading State
  if (loading) {
    return (
      <View 
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: theme.background }}
      >
        <View 
          className="p-8 rounded-[40px] shadow-2xl"
          style={{ backgroundColor: theme.surface }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: theme.background },
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen 
            name="booking" 
            options={{ 
              headerShown: true,
              title: "Book Appointment",
              header: ({ options, navigation }) => (
                <CustomStackHeader 
                  title={options.title} 
                  canGoBack={navigation.canGoBack()} 
                />
              ),
            }} 
          />
          <Stack.Screen 
            name="appointments" 
            options={{ 
              headerShown: true,
              title: "My Appointments",
              header: ({ options, navigation }) => (
                <CustomStackHeader 
                  title={options.title} 
                  canGoBack={navigation.canGoBack()} 
                />
              ),
            }} 
          />
          <Stack.Screen 
            name="tracking" 
            options={{ 
              headerShown: true,
              title: "Track Repair",
              header: ({ options, navigation }) => (
                <CustomStackHeader 
                  title={options.title} 
                  canGoBack={navigation.canGoBack()} 
                />
              ),
            }} 
          />
          <Stack.Screen 
            name="invoice" 
            options={{ 
              headerShown: true,
              title: "Settlement Invoice",
              header: ({ options, navigation }) => (
                <CustomStackHeader 
                  title={options.title} 
                  canGoBack={navigation.canGoBack()} 
                />
              ),
            }} 
          />
          <Stack.Screen 
            name="billing" 
            options={{ 
              headerShown: true,
              title: "Billing & Payments",
              header: ({ options, navigation }) => (
                <CustomStackHeader 
                  title={options.title} 
                  canGoBack={navigation.canGoBack()} 
                />
              ),
            }} 
          />
          <Stack.Screen 
            name="payment-success" 
            options={{ 
              headerShown: true,
              title: "Payment Successful",
              header: ({ options, navigation }) => (
                <CustomStackHeader 
                  title={options.title} 
                  canGoBack={navigation.canGoBack()} 
                />
              ),
            }} 
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}