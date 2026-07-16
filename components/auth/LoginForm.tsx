import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLoginForm } from "../../hooks/useLoginForm";

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-8 py-10">
          {/* Brand Header */}
          <View className="mb-12 items-center sm:items-start">
            <View className="w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-primary/20 bg-primary">
              <MaterialCommunityIcons name="car-wrench" size={40} color="white" />
            </View>
            <Text className="text-4xl font-heading font-black tracking-tight mb-2 text-foreground text-center sm:text-left">
              AutoCare
            </Text>
            <Text className="text-lg text-muted-foreground text-center sm:text-left">
              Your trusted automotive repair partner.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-5">
            {/* Email/Phone */}
            <View>
              <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                Email or Phone
              </Text>
              <View className={`flex-row items-center rounded-xl px-4 h-16 border ${errors.emailOrPhone ? 'border-destructive' : 'border-input'} bg-card`}>
                <Ionicons name="mail-outline" size={20} color="#666" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-base font-medium text-foreground"
                  placeholder="Enter your credentials"
                  placeholderTextColor="#999"
                  value={emailOrPhone}
                  onChangeText={(val) => handleFieldChange("emailOrPhone", val)}
                  autoCapitalize="none"
                />
              </View>
              {errors.emailOrPhone && <Text className="text-xs text-destructive mt-1 ml-2 font-medium">{errors.emailOrPhone}</Text>}
            </View>

            {/* Password */}
            <View>
              <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                Password
              </Text>
              <View className={`flex-row items-center rounded-xl px-4 h-16 border ${errors.password ? 'border-destructive' : 'border-input'} bg-card`}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-base font-medium text-foreground"
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => handleFieldChange("password", val)}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-xs text-destructive mt-1 ml-2 font-medium">{errors.password}</Text>}
            </View>

            {/* Login Error */}
            {loginError && (
              <View className="bg-destructive/10 p-3 rounded-xl border border-destructive/30 flex-row items-center">
                <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text className="text-xs text-destructive font-semibold">{loginError}</Text>
              </View>
            )}

            {/* Forgot Password */}
            <TouchableOpacity className="self-end py-1">
              <Text className="font-bold text-sm text-primary">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className={`h-16 rounded-xl items-center justify-center shadow-lg shadow-primary/20 ${loading ? "opacity-70" : ""}`}
              style={{ backgroundColor: '#C1272D' }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-primary-foreground text-lg font-bold mr-2">Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-12 items-center">
            <View className="flex-row items-center mb-6">
              <View className="h-[1px] flex-1 bg-muted" />
              <Text className="mx-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                New to the platform?
              </Text>
              <View className="h-[1px] flex-1 bg-muted" />
            </View>

            <Link href="/signup" asChild>
              <TouchableOpacity className="flex-row items-center py-2">
                <Text className="text-base font-medium text-muted-foreground mr-1">Don't have an account?</Text>
                <Text className="text-base font-black text-primary">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}