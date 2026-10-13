
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

import TemporaryPasswordModal from './TemporaryPasswordModal';

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

    tempPasswordModalVisible,
    changingPassword,
    tempPasswordError,
    cancelTemporaryPasswordChange,
    submitTemporaryPassword,

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
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View className="items-center rounded-b-4xl bg-primary px-4 pb-24 pt-16">
            <View className="mb-10 items-center justify-center rounded-full border-4 border-card bg-card p-3 shadow-lg shadow-black/10">
              <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary">
                <Wrench
                  size={32}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <Text className="mb-1 text-center text-3xl font-bold tracking-tight text-primary-foreground">
              AutoCare
            </Text>

            <Text className="px-4 text-center text-lg text-primary-foreground">
              Your trusted automotive repair partner.
            </Text>
          </View>

          {/* LOGIN FORM */}
          <View className="-mt-16 mx-4 mb-8 overflow-hidden rounded-xl bg-card shadow-lg shadow-black/10">
            <View className="p-6">
              <View className="mb-8 items-center">
                <Text className="text-center text-3xl font-bold tracking-tight text-foreground">
                  Login
                </Text>

                <Text className="mt-1 text-center text-base text-muted-foreground">
                  Please login to continue
                </Text>
              </View>

              {/* EMAIL OR PHONE */}
              <Text className="mb-1.5 ml-1 text-xs font-semibold text-foreground">
                Email or Phone Number
              </Text>

              <View
                className={`h-12 flex-row items-center rounded-lg border bg-input px-4 ${
                  errors.emailOrPhone
                    ? 'border-destructive'
                    : 'border-input'
                }`}
              >
                <Phone
                  size={18}
                  color={
                    theme[
                      'muted-foreground'
                    ]
                  }
                  style={{
                    marginRight: 10,
                  }}
                />

                <TextInput
                  className="h-full flex-1 text-base font-medium text-foreground"
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
                        'emailOrPhone',
                        value,
                      )
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              {errors.emailOrPhone ? (
                <Text className="ml-1 mt-1 text-sm font-medium text-destructive">
                  {errors.emailOrPhone}
                </Text>
              ) : null}

              {/* PASSWORD */}
              <Text className="mb-1.5 ml-1 mt-5 text-xs font-semibold text-foreground">
                Password
              </Text>

              <View
                className={`h-12 flex-row items-center rounded-lg border bg-input pl-4 pr-1 ${
                  errors.password
                    ? 'border-destructive'
                    : 'border-input'
                }`}
              >
                <Lock
                  size={18}
                  color={
                    theme[
                      'muted-foreground'
                    ]
                  }
                  style={{
                    marginRight: 10,
                  }}
                />

                <TextInput
                  className="h-full flex-1 text-base font-medium text-foreground"
                  placeholder="Enter your password"
                  placeholderTextColor={
                    theme[
                      'muted-foreground'
                    ]
                  }
                  secureTextEntry={
                    !showPassword
                  }
                  value={password}
                  onChangeText={
                    value =>
                      handleFieldChange(
                        'password',
                        value,
                      )
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setShowPassword(
                      !showPassword,
                    )
                  }
                  className="h-11 w-11 items-center justify-center"
                  accessibilityLabel={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
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
                <Text className="ml-1 mt-1 text-sm font-medium text-destructive">
                  {errors.password}
                </Text>
              ) : null}

              {/* LOGIN ERROR */}
              {loginError ? (
                <View className="mt-4 flex-row items-center rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                  <AlertCircle
                    size={18}
                    color={
                      theme.destructive
                    }
                  />

                  <Text className="ml-2 flex-1 text-sm font-medium text-destructive">
                    {loginError}
                  </Text>
                </View>
              ) : null}

              {/* FORGOT PASSWORD */}
              <TouchableOpacity
                activeOpacity={0.7}
                className="mt-4 min-h-[44px] self-end justify-center"
                onPress={() =>
                  router.push(
                    '/forgot-password',
                  )
                }
              >
                <Text className="text-sm font-semibold text-primary">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* SIGN IN */}
              <TouchableOpacity
                activeOpacity={0.8}
                className={`mt-3 h-12 flex-row items-center justify-center rounded-xl bg-primary shadow shadow-primary/30 ${
                  loading
                    ? 'opacity-70'
                    : ''
                }`}
                onPress={
                  handleLogin
                }
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Text className="mr-2 text-lg font-bold text-primary-foreground">
                      Sign In
                    </Text>

                    <ArrowRight
                      size={20}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* SIGN UP */}
              <View className="mt-10 items-center">
                <View className="mb-6 flex-row items-center">
                  <View className="h-[1px] flex-1 bg-border" />

                  <Text className="mx-4 text-xs font-semibold text-muted-foreground">
                    New to AutoCare?
                  </Text>

                  <View className="h-[1px] flex-1 bg-border" />
                </View>

                <Link
                  href="/signup"
                  asChild
                >
                  <TouchableOpacity className="min-h-[44px] flex-row items-center py-2">
                    <Text className="mr-1 text-base font-medium text-muted-foreground">
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

      {/* ACCOUNT DEACTIVATED MODAL */}
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
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          <Pressable
            className="absolute inset-0"
            onPress={
              closeDeactivatedModal
            }
          />

          <View className="w-full max-w-[420px] overflow-hidden rounded-3xl bg-card shadow-2xl">
            <View className="items-end px-6 pt-4">
              <TouchableOpacity
                onPress={
                  closeDeactivatedModal
                }
                className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
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

            <View className="items-center px-6 pb-6">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert
                  size={40}
                  color={
                    theme.destructive
                  }
                />
              </View>

              <Text className="mt-6 text-center text-2xl font-bold text-foreground">
                Account Deactivated
              </Text>

              <Text className="mt-3 text-center text-base leading-6 text-muted-foreground">
                Your AutoCare account has been deactivated.
                You are unable to sign in while your account is deactivated.
              </Text>

              <View className="mt-5 w-full rounded-2xl bg-secondary p-4">
                <Text className="text-center text-sm font-medium leading-5 text-secondary-foreground">
                  Please contact the AutoCare administrator for assistance with your account.
                </Text>
              </View>
            </View>

            <View className="border-t border-border px-6 py-4">
              <TouchableOpacity
                onPress={
                  closeDeactivatedModal
                }
                className="h-[52px] items-center justify-center rounded-xl bg-primary"
              >
                <Text className="text-base font-bold text-primary-foreground">
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TEMPORARY PASSWORD MODAL */}
      <TemporaryPasswordModal
        visible={
          tempPasswordModalVisible
        }
        loading={
          changingPassword
        }
        serverError={
          tempPasswordError
        }
        onSubmit={
          submitTemporaryPassword
        }
        onCancel={
          cancelTemporaryPasswordChange
        }
      />
    </>
  );
}
