import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import authApi from '../services/authApi';

export default function ResetPasswordScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const token = params.token || ''; // safely get token
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          <View className="px-8 py-10">
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
              <Ionicons name="arrow-back" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text className="text-3xl font-heading font-black mb-2 text-foreground">Set New Password</Text>
            <Text className="text-base text-muted-foreground mb-8">
              Enter your new password below.
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                  New Password
                </Text>
                <View className="flex-row items-center rounded-xl px-4 h-16 border border-input bg-card">
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 text-base font-medium text-foreground"
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                  Confirm Password
                </Text>
                <View className="flex-row items-center rounded-xl px-4 h-16 border border-input bg-card">
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={{ marginRight: 12 }} />
                  <TextInput
                    className="flex-1 text-base font-medium text-foreground"
                    placeholder="Confirm new password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>

              {error && <Text className="text-xs text-destructive text-center font-medium">{error}</Text>}

              <TouchableOpacity
                activeOpacity={0.8}
                className={`h-16 rounded-xl items-center justify-center shadow-lg shadow-primary/20 ${loading ? 'opacity-70' : ''}`}
                style={{ backgroundColor: theme.primary }}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-primary-foreground text-lg font-bold">Reset Password</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}