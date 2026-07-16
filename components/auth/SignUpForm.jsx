import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSignUpForm } from "../../hooks/useSignUpForm";

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
    signupError,           // ← destructure
    handleFieldChange,
    handleSignup,
  } = useSignUpForm();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-8 pt-10"
      >
        {/* Header */}
        <View className="mb-10 items-center sm:items-start">
          <View className="w-16 h-16 rounded-2xl items-center justify-center mb-6 shadow-lg shadow-primary/20 bg-primary">
            <MaterialCommunityIcons name="account-plus-outline" size={32} color="white" />
          </View>
          <Text className="text-4xl font-heading font-black tracking-tight mb-2 text-foreground">
            Join AutoCare
          </Text>
          <Text className="text-lg text-muted-foreground">
            Create your account to start managing your vehicle service.
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">

          {/* ---------- API Error Banner ---------- */}
          {signupError ? (
            <View className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 8 }} />
              <Text className="text-xs text-destructive font-semibold flex-1">{signupError}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
              Full Name
            </Text>
            <View className={`flex-row items-center rounded-xl px-4 h-14 border ${errors.fullName ? 'border-destructive' : 'border-input'} bg-card`}>
              <Ionicons name="person-outline" size={18} color="#666" style={{ marginRight: 10 }} />
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder="John Doe"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={(val) => handleFieldChange("fullName", val)}
              />
            </View>
            {errors.fullName && <Text className="text-xs text-destructive mt-1 ml-2">{errors.fullName}</Text>}
          </View>

          {/* Email */}
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
              Email Address
            </Text>
            <View className={`flex-row items-center rounded-xl px-4 h-14 border ${errors.email ? 'border-destructive' : 'border-input'} bg-card`}>
              <Ionicons name="mail-outline" size={18} color="#666" style={{ marginRight: 10 }} />
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder="email@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(val) => handleFieldChange("email", val)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {errors.email && <Text className="text-xs text-destructive mt-1 ml-2">{errors.email}</Text>}
          </View>

          {/* Phone */}
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
              Phone Number
            </Text>
            <View className={`flex-row items-center rounded-xl px-4 h-14 border ${errors.phone ? 'border-destructive' : 'border-input'} bg-card`}>
              <Ionicons name="call-outline" size={18} color="#666" style={{ marginRight: 10 }} />
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder="0912 345 6789"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={(val) => handleFieldChange("phone", val)}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone && <Text className="text-xs text-destructive mt-1 ml-2">{errors.phone}</Text>}
          </View>

          {/* Password */}
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
              Security
            </Text>
            <View className={`flex-row items-center rounded-xl px-4 h-14 border ${errors.password ? 'border-destructive' : 'border-input'} bg-card`}>
              <Ionicons name="lock-closed-outline" size={18} color="#666" style={{ marginRight: 10 }} />
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder="Create password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(val) => handleFieldChange("password", val)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {errors.password && <Text className="text-xs text-destructive mt-1 ml-2">{errors.password}</Text>}
          </View>

          {/* Confirm Password */}
          <View>
            <View className={`flex-row items-center rounded-xl px-4 h-14 border mt-2 ${errors.confirmPassword ? 'border-destructive' : 'border-input'} bg-card`}>
              <Ionicons name="checkmark-shield-outline" size={18} color="#666" style={{ marginRight: 10 }} />
              <TextInput
                className="flex-1 text-base text-foreground"
                placeholder="Repeat password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={(val) => handleFieldChange("confirmPassword", val)}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text className="text-xs text-destructive mt-1 ml-2">{errors.confirmPassword}</Text>}
          </View>

          {/* Terms */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-start mt-6 mb-4 px-1"
            onPress={() => setAgree(!agree)}
          >
            <View
              className="w-6 h-6 rounded-md items-center justify-center mr-3 border-2"
              style={{
                borderColor: agree ? '#C1272D' : '#D9D9D9',
                backgroundColor: agree ? '#C1272D' : 'transparent',
              }}
            >
              {agree && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className="flex-1 text-sm text-muted-foreground">
              I agree to the <Text className="font-bold text-primary">Terms of Service</Text> and <Text className="font-bold text-primary">Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.8}
            className={`h-16 rounded-xl items-center justify-center shadow-lg shadow-primary/20 mt-2 ${loading ? "opacity-70" : ""}`}
            style={{ backgroundColor: '#C1272D' }}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-primary-foreground text-lg font-bold uppercase tracking-widest">
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-12 mb-10 items-center">
          <View className="flex-row items-center mb-6 w-full">
            <View className="h-[1px] flex-1 bg-muted" />
            <Text className="mx-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
              Registered
            </Text>
            <View className="h-[1px] flex-1 bg-muted" />
          </View>

          <Link href="/login" asChild>
            <View className="flex-row items-center">
              <Text className="text-sm font-medium text-muted-foreground mr-1">Have an account?</Text>
              <Text className="text-sm font-black text-primary">Sign In</Text>
            </View>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}