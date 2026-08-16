import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import authApi from '../services/authApi';
import { useAuth } from '../context/AuthContext';

export default function VerifyPhoneScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const { setSession } = useAuth();
  const customerId = params.customerId;
  const initialPhone = params.phone;

  const [phone, setPhone] = useState(initialPhone || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [step, setStep] = useState('phone'); 

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.sendPhoneVerificationOTP(customerId, phone.trim());
      if (res.error) {
        setError(res.errorMessage || 'Failed to send OTP.');
      } else {
        setStep('otp');
        setTimer(60);
        setCanResend(false);
        Alert.alert('OTP Sent', 'Check your phone for the verification code.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
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
      const res = await authApi.verifyPhoneOTP(customerId, otpString, phone.trim());
      if (res.error) {
        setError(res.errorMessage || 'Invalid OTP.');
      } else {
        const { customer, token } = res.data;
        setSession(customer, token);
        Alert.alert('Success', 'Phone verified successfully!');
        router.replace('/(tabs)');
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
      const res = await authApi.sendPhoneVerificationOTP(customerId, phone.trim());
      if (res.error) {
        setError(res.errorMessage || 'Failed to resend OTP.');
      } else {
        setTimer(60);
        setCanResend(false);
        Alert.alert('OTP Sent', 'A new OTP has been sent.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

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
              Verify Phone
            </Text>
            <Text className="text-base font-normal text-muted-foreground leading-6">
              {step === 'phone'
                ? 'We need to verify your phone number. Please enter it below to continue.'
                : `We sent a 6‑digit code to ${phone}. Enter it below.`}
            </Text>
          </View>

          {/* Conditional Layouts based on Step */}
          {step === 'phone' ? (
            <>
              {/* Phone Input Card */}
              <View className="bg-card rounded-xl mx-4 overflow-hidden mb-2 shadow-sm border border-border/40">
                <View className="flex-row items-center px-4 py-3 min-h-[50px]">
                  <Phone size={20} color="#8E8E93" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-foreground"
                    placeholder="Phone Number (e.g., 09123456789)"
                    placeholderTextColor="#8E8E93"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              {error ? <Text className="text-sm font-normal text-destructive mx-8 mt-1">{error}</Text> : null}
            </>
          ) : (
            <>
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
            </>
          )}

        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View className="px-4 pb-6 pt-4 bg-background">
          <TouchableOpacity
            activeOpacity={0.8}
            className={`w-full bg-primary py-4 rounded-xl items-center justify-center flex-row min-h-[56px] ${loading ? 'opacity-70' : ''}`}
            onPress={step === 'phone' ? handleSendOTP : handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-lg font-semibold text-primary-foreground text-white">
                {step === 'phone' ? 'Send OTP' : 'Verify'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}