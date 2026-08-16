import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Wrench, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react-native';
import { useLoginForm } from "../../hooks/useLoginForm";
import { theme } from "../../theme"; // Assuming theme is exported

export default function LoginForm() {
  const {
    emailOrPhone,
    password,
    showPassword,
    setShowPassword,
    loading,
    errors,
    loginError,
    handleFieldChange,
    handleLogin,
  } = useLoginForm();

  const router = useRouter();

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Header Section (Primary Background) */}
        <View className="bg-primary pt-16 pb-24 px-4 items-center rounded-b-4xl">
          {/* Logo Shield */}
          <View className="mb-10 items-center justify-center p-3 rounded-full border-4 border-card bg-card shadow-lg shadow-black/10">
            <View className="w-16 h-16 rounded-3xl items-center justify-center bg-primary">
              <Wrench size={32} color="white" />
            </View>
          </View>
          
          <Text className="text-3xl font-bold tracking-tight text-primary-foreground mb-1 text-center">
            AutoCare
          </Text>
          <Text className="text-lg font-normal text-primary-foreground text-center px-4">
            Your trusted automotive repair partner.
          </Text>
        </View>

        {/* Content Card (Partially overlaps header) */}
        <View className="-mt-16 mx-4 mb-8 bg-card rounded-xl overflow-hidden shadow-lg shadow-black/10">
          <View className="p-6">
            
            {/* Login Title */}
            <View className="mb-8 items-center">
                <Text className="text-3xl font-bold tracking-tight text-foreground text-center">Login</Text>
                <Text className="text-base font-normal text-muted-foreground text-center mt-1">Please login to continue</Text>
            </View>

            {/* Form */}
            <View className="space-y-5">
              {/* Email/Phone */}
              <View>
                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                  Email Address
                </Text>
                <View className={`flex-row items-center rounded-lg px-4 h-12 border ${errors.emailOrPhone ? 'border-destructive' : 'border-input'} bg-input`}>
                  <Mail size={18} color={theme['muted-foreground']} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="example@email.com"
                    placeholderTextColor={theme['muted-foreground']}
                    value={emailOrPhone}
                    onChangeText={(val) => handleFieldChange("emailOrPhone", val)}
                    autoCapitalize="none"
                  />
                </View>
                {errors.emailOrPhone && <Text className="text-sm text-destructive mt-1 ml-1 font-medium">{errors.emailOrPhone}</Text>}
              </View>

              {/* Password */}
              <View>
                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                  Password
                </Text>
                <View className={`flex-row items-center rounded-lg px-4 h-12 border ${errors.password ? 'border-destructive' : 'border-input'} bg-input`}>
                  <Lock size={18} color={theme['muted-foreground']} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="Enter your password"
                    placeholderTextColor={theme['muted-foreground']}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(val) => handleFieldChange("password", val)}
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowPassword(!showPassword)}
                    className="p-1"
                    style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={theme['muted-foreground']} />
                    ) : (
                      <Eye size={20} color={theme['muted-foreground']} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && <Text className="text-sm text-destructive mt-1 ml-1 font-medium">{errors.password}</Text>}
              </View>

              {/* Login Error */}
              {loginError && (
                <View className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex-row items-center mt-3">
                  <AlertCircle size={18} color={theme['destructive']} style={{ marginRight: 8 }} />
                  <Text className="text-sm text-destructive font-medium flex-1">{loginError}</Text>
                </View>
              )}

              {/* Forgot Password */}
              <TouchableOpacity className="self-end py-1" onPress={() => router.push('/forgot-password')}>
                <Text className="font-semibold text-sm text-primary">Forgot Password?</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                className={`h-12 rounded-xl items-center justify-center mt-3 shadow shadow-primary/30 ${loading ? "opacity-70" : ""}`}
                style={{ backgroundColor: theme['primary'] }}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Text className="text-primary-foreground text-lg font-bold mr-2">Sign In</Text>
                    <ArrowRight size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-10 items-center">
              <View className="flex-row items-center mb-6">
                <View className="h-[1px] flex-1 bg-border" style={{ marginLeft: 16 }} />
                <Text className="mx-4 text-xs font-semibold text-muted-foreground">
                  New to AutoCare?
                </Text>
                <View className="h-[1px] flex-1 bg-border" style={{ marginRight: 16 }} />
              </View>

              <Link href="/signup" asChild>
                <TouchableOpacity className="flex-row items-center py-2 min-h-[44px]">
                  <Text className="text-base font-medium text-muted-foreground mr-1">Don't have an account?</Text>
                  <Text className="text-base font-bold text-primary">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}