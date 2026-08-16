import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import authApi from '../services/authApi';

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const token = params.token || ''; 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.resetPassword(token, newPassword);
      if (res.error) {
        setError(res.errorMessage || 'Failed to reset password.');
      } else {
        Alert.alert('Success', 'Your password has been reset. Please log in with your new password.');
        router.replace('/login');
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
              Set New Password
            </Text>
            <Text className="text-base font-normal text-muted-foreground leading-6">
              Enter your new password below. Ensure it is at least 6 characters long.
            </Text>
          </View>

          {/* Grouped Form Card */}
          <View className="bg-card rounded-xl mx-4 mb-2 overflow-hidden shadow-sm border border-border/40">
            
            {/* New Password Row */}
            <View className="flex-row items-center px-4 py-3 min-h-[50px]">
              <Lock size={20} color="#8E8E93" />
              <TextInput
                className="flex-1 ml-3 text-base text-foreground py-2"
                placeholder="New Password"
                placeholderTextColor="#8E8E93"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                className="p-2 min-h-[44px] items-center justify-center -mr-2"
              >
                {showPassword ? (
                  <EyeOff size={22} color="#8E8E93" />
                ) : (
                  <Eye size={22} color="#8E8E93" />
                )}
              </TouchableOpacity>
            </View>

            {/* Inset Divider */}
            <View className="border-b border-border ml-12" />

            {/* Confirm Password Row */}
            <View className="flex-row items-center px-4 py-3 min-h-[50px]">
              <Lock size={20} color="#8E8E93" />
              <TextInput
                className="flex-1 ml-3 text-base text-foreground py-2"
                placeholder="Confirm Password"
                placeholderTextColor="#8E8E93"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-lg font-semibold text-primary-foreground text-white">Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}