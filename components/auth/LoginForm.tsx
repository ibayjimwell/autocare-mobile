import React from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Link,
  useRouter,
} from 'expo-router';

import {
  Wrench,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  X,
} from 'lucide-react-native';

import {
  useLoginForm,
} from '../../hooks/useLoginForm';

import {
  theme,
} from '../../theme';

export default function LoginForm() {
  const {
    emailOrPhone,

    password,

    showPassword,

    setShowPassword,

    loading,

    errors,

    loginError,

    deactivatedModalVisible,

    closeDeactivatedModal,

    handleFieldChange,

    handleLogin,
  } = useLoginForm();

  const router =
    useRouter();

  return (
    <>
      <SafeAreaView
        edges={[
          'top',
          'bottom',
        ]}
        className="flex-1 bg-background"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={
            false
          }
          className="flex-1"
        >
          {/* ====================================================== */}
          {/* HEADER */}
          {/* ====================================================== */}

          <View className="bg-primary pt-16 pb-24 px-4 items-center rounded-b-4xl">

            <View className="mb-10 items-center justify-center p-3 rounded-full border-4 border-card bg-card shadow-lg shadow-black/10">

              <View className="w-16 h-16 rounded-3xl items-center justify-center bg-primary">

                <Wrench
                  size={32}
                  color="white"
                />

              </View>

            </View>

            <Text className="text-3xl font-bold tracking-tight text-primary-foreground mb-1 text-center">
              AutoCare
            </Text>

            <Text className="text-lg font-normal text-primary-foreground text-center px-4">
              Your trusted automotive repair partner.
            </Text>

          </View>

          {/* ====================================================== */}
          {/* CONTENT */}
          {/* ====================================================== */}

          <View className="-mt-16 mx-4 mb-8 bg-card rounded-xl overflow-hidden shadow-lg shadow-black/10">

            <View className="p-6">

              {/* ================================================== */}
              {/* TITLE */}
              {/* ================================================== */}

              <View className="mb-8 items-center">

                <Text className="text-3xl font-bold tracking-tight text-foreground text-center">
                  Login
                </Text>

                <Text className="text-base font-normal text-muted-foreground text-center mt-1">
                  Please login to continue
                </Text>

              </View>

              <View className="space-y-5">

                {/* ================================================ */}
                {/* EMAIL OR PHONE */}
                {/* ================================================ */}

                <View>

                  <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                    Email or Phone Number
                  </Text>

                  <View
                    className={`flex-row items-center rounded-lg px-4 h-12 border ${
                      errors.emailOrPhone
                        ? 'border-destructive'
                        : 'border-input'
                    } bg-input`}
                  >

                    <Phone
                      size={18}
                      color={
                        theme[
                          'muted-foreground'
                        ]
                      }
                      style={{
                        marginRight:
                          10,
                      }}
                    />

                    <TextInput
                      className="flex-1 text-base font-medium text-foreground h-full"
                      placeholder="Enter your phone or email"
                      placeholderTextColor={
                        theme[
                          'muted-foreground'
                        ]
                      }
                      value={
                        emailOrPhone
                      }
                      onChangeText={
                        value =>
                          handleFieldChange(
                            "emailOrPhone",
                            value
                          )
                      }
                      autoCapitalize="none"
                      autoCorrect={
                        false
                      }
                      keyboardType="email-address"
                    />

                  </View>

                  {errors.emailOrPhone ? (
                    <Text className="text-sm text-destructive mt-1 ml-1 font-medium">
                      {
                        errors.emailOrPhone
                      }
                    </Text>
                  ) : null}

                </View>

                {/* ================================================ */}
                {/* PASSWORD */}
                {/* ================================================ */}

                <View>

                  <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                    Password
                  </Text>

                  <View
                    className={`flex-row items-center rounded-lg px-4 h-12 border ${
                      errors.password
                        ? 'border-destructive'
                        : 'border-input'
                    } bg-input`}
                  >

                    <Lock
                      size={18}
                      color={
                        theme[
                          'muted-foreground'
                        ]
                      }
                      style={{
                        marginRight:
                          10,
                      }}
                    />

                    <TextInput
                      className="flex-1 text-base font-medium text-foreground h-full"
                      placeholder="Enter your password"
                      placeholderTextColor={
                        theme[
                          'muted-foreground'
                        ]
                      }
                      secureTextEntry={
                        !showPassword
                      }
                      value={
                        password
                      }
                      onChangeText={
                        value =>
                          handleFieldChange(
                            "password",
                            value
                          )
                      }
                    />

                    <TouchableOpacity
                      activeOpacity={
                        0.7
                      }
                      onPress={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="p-1"
                      style={{
                        minHeight:
                          44,
                        minWidth:
                          44,
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                      }}
                    >

                      {showPassword ? (
                        <EyeOff
                          size={20}
                          color={
                            theme[
                              'muted-foreground'
                            ]
                          }
                        />
                      ) : (
                        <Eye
                          size={20}
                          color={
                            theme[
                              'muted-foreground'
                            ]
                          }
                        />
                      )}

                    </TouchableOpacity>

                  </View>

                  {errors.password ? (
                    <Text className="text-sm text-destructive mt-1 ml-1 font-medium">
                      {
                        errors.password
                      }
                    </Text>
                  ) : null}

                </View>

                {/* ================================================ */}
                {/* NORMAL LOGIN ERROR */}
                {/* ================================================ */}

                {loginError ? (
                  <View className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex-row items-center mt-3">

                    <AlertCircle
                      size={18}
                      color={
                        theme[
                          'destructive'
                        ]
                      }
                      style={{
                        marginRight:
                          8,
                      }}
                    />

                    <Text className="text-sm text-destructive font-medium flex-1">
                      {
                        loginError
                      }
                    </Text>

                  </View>
                ) : null}

                {/* ================================================ */}
                {/* FORGOT PASSWORD */}
                {/* ================================================ */}

                <TouchableOpacity
                  activeOpacity={
                    0.7
                  }
                  className="self-end py-1"
                  onPress={() =>
                    router.push(
                      '/forgot-password'
                    )
                  }
                >
                  <Text className="font-semibold text-sm text-primary">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* ================================================ */}
                {/* SUBMIT */}
                {/* ================================================ */}

                <TouchableOpacity
                  activeOpacity={
                    0.8
                  }
                  className={`h-12 rounded-xl items-center justify-center mt-3 shadow shadow-primary/30 ${
                    loading
                      ? 'opacity-70'
                      : ''
                  }`}
                  style={{
                    backgroundColor:
                      theme[
                        'primary'
                      ],
                  }}
                  onPress={
                    handleLogin
                  }
                  disabled={
                    loading
                  }
                >

                  {loading ? (
                    <ActivityIndicator
                      color="white"
                    />
                  ) : (
                    <View className="flex-row items-center justify-center">

                      <Text className="text-primary-foreground text-lg font-bold mr-2">
                        Sign In
                      </Text>

                      <ArrowRight
                        size={20}
                        color="white"
                      />

                    </View>
                  )}

                </TouchableOpacity>

              </View>

              {/* ================================================== */}
              {/* FOOTER */}
              {/* ================================================== */}

              <View className="mt-10 items-center">

                <View className="flex-row items-center mb-6">

                  <View
                    className="h-[1px] flex-1 bg-border"
                    style={{
                      marginLeft:
                        16,
                    }}
                  />

                  <Text className="mx-4 text-xs font-semibold text-muted-foreground">
                    New to AutoCare?
                  </Text>

                  <View
                    className="h-[1px] flex-1 bg-border"
                    style={{
                      marginRight:
                        16,
                    }}
                  />

                </View>

                <Link
                  href="/signup"
                  asChild
                >
                  <TouchableOpacity className="flex-row items-center py-2 min-h-[44px]">

                    <Text className="text-base font-medium text-muted-foreground mr-1">
                      Don't have an account?
                    </Text>

                    <Text className="text-base font-bold text-primary">
                      Sign Up
                    </Text>

                  </TouchableOpacity>
                </Link>

              </View>

            </View>

          </View>

        </ScrollView>
      </SafeAreaView>

      {/* ========================================================== */}
      {/* ACCOUNT DEACTIVATED MODAL */}
      {/* ========================================================== */}

      <Modal
        visible={
          deactivatedModalVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          closeDeactivatedModal
        }
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-5">

          {/* ------------------------------------------------------ */}
          {/* BACKDROP */}
          {/* ------------------------------------------------------ */}

          <Pressable
            className="absolute inset-0"
            onPress={
              closeDeactivatedModal
            }
          />

          {/* ------------------------------------------------------ */}
          {/* MODAL CARD */}
          {/* ------------------------------------------------------ */}

          <View className="w-full max-w-[420px] bg-card rounded-3xl overflow-hidden shadow-2xl">

            {/* ---------------------------------------------------- */}
            {/* HEADER */}
            {/* ---------------------------------------------------- */}

            <View className="pt-7 px-6">

              <View className="flex-row items-center justify-end">

                <TouchableOpacity
                  activeOpacity={
                    0.7
                  }
                  onPress={
                    closeDeactivatedModal
                  }
                  className="w-11 h-11 rounded-full items-center justify-center bg-secondary"
                >
                  <X
                    size={20}
                    color={
                      theme[
                        'muted-foreground'
                      ]
                    }
                  />
                </TouchableOpacity>

              </View>

            </View>

            {/* ---------------------------------------------------- */}
            {/* ICON */}
            {/* ---------------------------------------------------- */}

            <View className="items-center px-6 pt-2">

              <View className="w-20 h-20 rounded-full bg-destructive/10 items-center justify-center">

                <ShieldAlert
                  size={40}
                  color={
                    theme[
                      'destructive'
                    ]
                  }
                />

              </View>

            </View>

            {/* ---------------------------------------------------- */}
            {/* TITLE */}
            {/* ---------------------------------------------------- */}

            <View className="px-6 pt-6">

              <Text className="text-2xl font-bold tracking-tight text-foreground text-center">
                Account Deactivated
              </Text>

            </View>

            {/* ---------------------------------------------------- */}
            {/* DESCRIPTION */}
            {/* ---------------------------------------------------- */}

            <View className="px-6 pt-3 pb-6">

              <Text className="text-base font-normal text-muted-foreground text-center leading-6">
                Your AutoCare account has been deactivated.
              </Text>

              <Text className="text-base font-normal text-muted-foreground text-center leading-6 mt-1">
                You are unable to sign in while your account is deactivated.
              </Text>

              {/* -------------------------------------------------- */}
              {/* CONTACT INFORMATION */}
              {/* -------------------------------------------------- */}

              <View className="mt-5 bg-secondary rounded-2xl p-4">

                <Text className="text-sm font-medium text-secondary-foreground text-center leading-5">
                  Please contact the AutoCare administrator for assistance with your account.
                </Text>

              </View>

            </View>

            {/* ---------------------------------------------------- */}
            {/* ACTION */}
            {/* ---------------------------------------------------- */}

            <View className="border-t border-border px-6 py-4">

              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                onPress={
                  closeDeactivatedModal
                }
                className="w-full min-h-[52px] bg-primary rounded-xl items-center justify-center"
              >
                <Text className="text-base font-bold text-primary-foreground">
                  OK
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </View>
      </Modal>
    </>
  );
}