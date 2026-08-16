import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import authApi from '../services/authApi';

export default function VerifyOTPScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const phone = params.phone || ''; 
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]); 
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
        
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {/* Header Navigation */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="px-4 mt-2 mb-4 min-h-[44px] justify-center items-start w-16"
          >
            <ArrowLeft size={28} color={theme?.foreground || "#000000"} />
          </TouchableOpacity>
          
          {/* Large Title Header */}
          <View className="px-4 mb-8">
            <Text className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Verify OTP
            </Text>
            <Text className="text-base font-normal text-muted-foreground leading-6">
              We sent a 6‑digit code to {phone}. Enter it below.
            </Text>
          </View>

          {/* OTP Input Boxes */}
          <View className="flex-row justify-between mx-4 mb-4">
            {otp.map((digit, index) => (
              <View key={index} className="w-[14%] aspect-square bg-card rounded-xl shadow-sm border border-border/40 justify-center items-center">
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  className="w-full h-full text-center text-2xl font-bold text-foreground"
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              </View>
            ))}
          </View>

          {error ? <Text className="text-sm font-normal text-destructive text-center mt-2 mx-4">{error}</Text> : null}

          {/* Resend Action */}
          <View className="flex-row justify-center items-center mt-8">
            {canResend ? (
              <TouchableOpacity 
                onPress={handleResend} 
                disabled={loading}
                className="min-h-[44px] justify-center items-center px-4"
              >
                <Text className="text-primary font-semibold text-base">Resend Code</Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-sm font-normal text-muted-foreground min-h-[44px] flex items-center justify-center pt-3">
                Resend code in {timer}s
              </Text>
            )}
          </View>

        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View className="px-4 pb-6 pt-4 bg-background">
          <TouchableOpacity
            activeOpacity={0.8}
            className={`w-full bg-primary py-4 rounded-xl items-center justify-center flex-row min-h-[56px] ${loading ? 'opacity-70' : ''}`}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-lg font-semibold text-primary-foreground text-white">Verify</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}