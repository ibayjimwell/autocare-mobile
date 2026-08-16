import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import authApi from '../services/authApi';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.requestOTP(phone.trim());
      if (res.error) {
        setError(res.errorMessage || 'Failed to send OTP.');
      } else {
        router.push(`/verify-otp?phone=${encodeURIComponent(phone.trim())}`);
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {/* Header Navigation */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="px-4 mt-2 mb-4 min-h-[44px] justify-center items-start w-16"
          >
            <ArrowLeft size={28} color={theme?.foreground || "#000000"} />
          </TouchableOpacity>

          {/* Large Title Header */}
          <View className="px-4 mb-6">
            <Text className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Forgot Password
            </Text>
            <Text className="text-base font-normal text-muted-foreground leading-6">
              Enter your registered phone number. We'll send you a 6‑digit OTP to reset your password.
            </Text>
          </View>

          {/* Grouped Form Card */}
          <View className="bg-card rounded-xl mx-4 overflow-hidden mb-2 shadow-sm border border-border/40">
            <View className="flex-row items-center px-4 py-3 min-h-[50px]">
              <Phone size={20} color="#8E8E93" />
              <TextInput
                className="flex-1 ml-3 text-base font-normal text-foreground"
                placeholder="Phone Number (e.g., 09123456789)"
                placeholderTextColor="#8E8E93"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          </View>

          {error ? (
            <Text className="text-sm font-normal text-destructive mx-8 mt-1">{error}</Text>
          ) : null}
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View className="px-4 pb-6 pt-4 bg-background">
          <TouchableOpacity
            activeOpacity={0.8}
            className={`w-full bg-primary py-4 rounded-xl items-center justify-center flex-row min-h-[56px] ${loading ? 'opacity-70' : ''}`}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-lg font-semibold text-primary-foreground text-white">Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}