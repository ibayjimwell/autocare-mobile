import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { UserPlus, User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Check, AlertCircle } from "lucide-react-native";
import { useSignUpForm } from "../../hooks/useSignUpForm";
import { theme } from "../../theme"; // Assuming theme is exported

export default function SignUpForm() {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    agree,
    setAgree,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    loading,
    errors,
    signupError,
    handleFieldChange,
    handleSignup,
  } = useSignUpForm();

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
              <UserPlus size={32} color="white" />
            </View>
          </View>
          
          <Text className="text-3xl font-bold tracking-tight text-primary-foreground mb-1 text-center">
            Join AutoCare
          </Text>
          <Text className="text-lg font-normal text-primary-foreground text-center px-4">
            Create your account to start managing your vehicle service.
          </Text>
        </View>

        {/* Content Card (Partially overlaps header) */}
        <View className="-mt-16 mx-4 mb-8 bg-card rounded-xl overflow-hidden shadow-lg shadow-black/10">
          <View className="p-6">
            
            {/* Sign Up Title */}
            <View className="mb-8 items-center">
                <Text className="text-3xl font-bold tracking-tight text-foreground text-center">Sign Up</Text>
                <Text className="text-base font-normal text-muted-foreground text-center mt-1">Please fill in the details below</Text>
            </View>

            {/* Form */}
            <View className="space-y-4">

              {/* ---------- API Error Banner ---------- */}
              {signupError ? (
                <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex-row items-center mb-2">
                  <AlertCircle size={18} color={theme['destructive']} style={{ marginRight: 8 }} />
                  <Text className="text-sm text-destructive font-medium flex-1">{signupError}</Text>
                </View>
              ) : null}

              {/* Full Name */}
              <View>
                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                  Full Name
                </Text>
                <View className={`flex-row items-center rounded-lg px-4 h-12 border ${errors.fullName ? 'border-destructive' : 'border-input'} bg-input`}>
                  <User size={18} color={theme['muted-foreground']} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="John Doe"
                    placeholderTextColor={theme['muted-foreground']}
                    value={fullName}
                    onChangeText={(val) => handleFieldChange("fullName", val)}
                  />
                </View>
                {errors.fullName && <Text className="text-sm text-destructive mt-1 ml-1 font-medium">{errors.fullName}</Text>}
              </View>

              {/* Email */}
              <View>
                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                  Email Address
                </Text>
                <View className={`flex-row items-center rounded-lg px-4 h-12 border ${errors.email ? 'border-destructive' : 'border-input'} bg-input`}>
                  <Mail size={18} color={theme['muted-foreground']} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="email@example.com"
                    placeholderTextColor={theme['muted-foreground']}
                    value={email}
                    onChangeText={(val) => handleFieldChange("email", val)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {errors.email && <Text className="text-sm text-destructive mt-1 ml-1 font-medium">{errors.email}</Text>}
              </View>

              {/* Phone */}
              <View>
                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                  Phone Number
                </Text>
                <View className={`flex-row items-center rounded-lg px-4 h-12 border ${errors.phone ? 'border-destructive' : 'border-input'} bg-input`}>
                  <Phone size={18} color={theme['muted-foreground']} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="0912 345 6789"
                    placeholderTextColor={theme['muted-foreground']}
                    value={phone}
                    onChangeText={(val) => handleFieldChange("phone", val)}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone && <Text className="text-sm text-destructive mt-1 ml-1 font-medium">{errors.phone}</Text>}
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
                    placeholder="Create password"
                    placeholderTextColor={theme['muted-foreground']}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(val) => handleFieldChange("password", val)}
                  />
                  <TouchableOpacity 
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

              {/* Confirm Password */}
              <View>
                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                  Confirm Password
                </Text>
                <View className={`flex-row items-center rounded-lg px-4 h-12 border ${errors.confirmPassword ? 'border-destructive' : 'border-input'} bg-input`}>
                  <ShieldCheck size={18} color={theme['muted-foreground']} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="Repeat password"
                    placeholderTextColor={theme['muted-foreground']}
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={(val) => handleFieldChange("confirmPassword", val)}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirm(!showConfirm)} 
                    className="p-1"
                    style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showConfirm ? (
                      <EyeOff size={20} color={theme['muted-foreground']} />
                    ) : (
                      <Eye size={20} color={theme['muted-foreground']} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text className="text-sm text-destructive mt-1 ml-1 font-medium">{errors.confirmPassword}</Text>}
              </View>

              {/* Terms */}
              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center mt-4 mb-2 px-1 min-h-[44px]"
                onPress={() => setAgree(!agree)}
              >
                <View
                  className="w-6 h-6 rounded-md items-center justify-center mr-3 border-2"
                  style={{
                    borderColor: agree ? theme['primary'] : theme['border'],
                    backgroundColor: agree ? theme['primary'] : 'transparent',
                  }}
                >
                  {agree && <Check size={16} color="white" />}
                </View>
                <Text className="flex-1 text-sm text-muted-foreground">
                  I agree to the <Text className="font-semibold text-primary">Terms of Service</Text> and <Text className="font-semibold text-primary">Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                activeOpacity={0.8}
                className={`h-12 rounded-xl items-center justify-center mt-2 shadow shadow-primary/30 ${loading ? "opacity-70" : ""}`}
                style={{ backgroundColor: theme['primary'] }}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-primary-foreground text-lg font-bold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8 items-center">
              <View className="flex-row items-center mb-6 w-full">
                <View className="h-[1px] flex-1 bg-border" style={{ marginLeft: 16 }} />
                <Text className="mx-4 text-xs font-semibold text-muted-foreground">
                  Registered?
                </Text>
                <View className="h-[1px] flex-1 bg-border" style={{ marginRight: 16 }} />
              </View>

              <Link href="/login" asChild>
                <TouchableOpacity className="flex-row items-center py-2 min-h-[44px]">
                  <Text className="text-base font-medium text-muted-foreground mr-1">Have an account?</Text>
                  <Text className="text-base font-bold text-primary">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}