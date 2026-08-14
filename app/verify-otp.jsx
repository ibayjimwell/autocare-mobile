import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import authApi from '../services/authApi';

export default function VerifyOTPScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const phone = params.phone || ''; // safely get phone
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]); // removed generic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOTP(phone, otpString);
      if (res.error) {
        setError(res.errorMessage || 'Invalid OTP.');
      } else {
        // Navigate to reset password with resetToken
        router.push(`/reset-password?token=${encodeURIComponent(res.data.resetToken)}`);
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.requestOTP(phone);
      if (res.error) {
        setError(res.errorMessage || 'Failed to resend OTP.');
      } else {
        setTimer(60);
        setCanResend(false);
        Alert.alert('OTP Sent', 'A new OTP has been sent to your phone.');
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
            <Text className="text-3xl font-heading font-black mb-2 text-foreground">Verify OTP</Text>
            <Text className="text-base text-muted-foreground mb-8">
              We sent a 6‑digit code to {phone}. Enter it below.
            </Text>

            <View className="space-y-6">
              <View className="flex-row justify-center gap-3">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    className="w-12 h-14 text-center text-xl font-black rounded-xl border border-input bg-card text-foreground"
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    autoFocus={index === 0}
                  />
                ))}
              </View>
              {error && <Text className="text-xs text-destructive text-center font-medium">{error}</Text>}

              <TouchableOpacity
                activeOpacity={0.8}
                className={`h-14 rounded-xl items-center justify-center shadow-lg shadow-primary/20 ${loading ? 'opacity-70' : ''}`}
                style={{ backgroundColor: theme.primary }}
                onPress={handleVerify}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-primary-foreground text-lg font-bold">Verify</Text>}
              </TouchableOpacity>

              <View className="flex-row justify-center">
                <Text className="text-sm text-muted-foreground">
                  {canResend ? (
                    <TouchableOpacity onPress={handleResend} disabled={loading}>
                      <Text className="text-primary font-bold">Resend OTP</Text>
                    </TouchableOpacity>
                  ) : (
                    `Resend in ${timer}s`
                  )}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}