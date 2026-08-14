import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
        // Navigate to OTP verification
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          <View className="px-8 py-10">
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
              <Ionicons name="arrow-back" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text className="text-3xl font-heading font-black mb-2 text-foreground">Forgot Password</Text>
            <Text className="text-base text-muted-foreground mb-8">
              Enter your registered phone number. We'll send you a 6‑digit OTP to reset your password.
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                  Phone Number
                </Text>
                <View className="flex-row items-center rounded-xl px-4 h-16 border border-input bg-card">
                  <Ionicons name="call-outline" size={20} color="#666" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 text-base font-medium text-foreground"
                    placeholder="e.g., 09123456789"
                    placeholderTextColor="#999"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
                {error && <Text className="text-xs text-destructive mt-1 ml-2 font-medium">{error}</Text>}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                className={`h-16 rounded-xl items-center justify-center shadow-lg shadow-primary/20 ${loading ? 'opacity-70' : ''}`}
                style={{ backgroundColor: theme.primary }}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-primary-foreground text-lg font-bold">Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}