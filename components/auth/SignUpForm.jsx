import React from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Link,
} from 'expo-router';

import {
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react-native';

import {
  useSignUpForm,
} from '../../hooks/useSignUpForm';

import {
  theme,
} from '../../theme';

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

  // ---------------------------------------------------------------
  // Determine whether a field has a value and currently has no
  // validation error.
  // ---------------------------------------------------------------

  const isValidField = (
    value,
    error
  ) => {
    return (
      typeof value === 'string' &&
      value.trim().length > 0 &&
      !error
    );
  };

  return (
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
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <View className="bg-primary pt-16 pb-24 px-4 items-center rounded-b-4xl">

          <View className="mb-10 items-center justify-center p-3 rounded-full border-4 border-card bg-card shadow-lg shadow-black/10">

            <View className="w-16 h-16 rounded-3xl items-center justify-center bg-primary">

              <UserPlus
                size={32}
                color="white"
              />

            </View>

          </View>

          <Text className="text-3xl font-bold tracking-tight text-primary-foreground mb-1 text-center">
            Join AutoCare
          </Text>

          <Text className="text-lg font-normal text-primary-foreground text-center px-4">
            Create your account to start managing your vehicle service.
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
                Sign Up
              </Text>

              <Text className="text-base font-normal text-muted-foreground text-center mt-1">
                Please fill in the details below
              </Text>

            </View>

            <View className="space-y-4">

              {/* ================================================= */}
              {/* GENERAL SIGNUP ERROR */}
              {/* ================================================= */}

              {signupError ? (
                <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex-row items-center mb-2">

                  <AlertCircle
                    size={18}
                    color={
                      theme[
                        'destructive'
                      ]
                    }
                    style={{
                      marginRight: 8,
                    }}
                  />

                  <Text className="text-sm text-destructive font-medium flex-1">
                    {signupError}
                  </Text>

                </View>
              ) : null}

              {/* ================================================= */}
              {/* FULL NAME */}
              {/* ================================================= */}

              <View>

                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                  Full Name
                </Text>

                <View
                  className={`flex-row items-center rounded-lg px-4 h-12 border ${
                    errors.fullName
                      ? 'border-destructive'
                      : isValidField(
                          fullName,
                          errors.fullName
                        )
                      ? 'border-primary'
                      : 'border-input'
                  } bg-input`}
                >

                  <User
                    size={18}
                    color={
                      errors.fullName
                        ? theme[
                            'destructive'
                          ]
                        : isValidField(
                            fullName,
                            errors.fullName
                          )
                        ? theme[
                            'primary'
                          ]
                        : theme[
                            'muted-foreground'
                          ]
                    }
                    style={{
                      marginRight: 10,
                    }}
                  />

                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="John Doe"
                    placeholderTextColor={
                      theme[
                        'muted-foreground'
                      ]
                    }
                    value={
                      fullName
                    }
                    onChangeText={
                      value =>
                        handleFieldChange(
                          'fullName',
                          value
                        )
                    }
                    autoCapitalize="words"
                    autoCorrect={
                      false
                    }
                  />

                  {isValidField(
                    fullName,
                    errors.fullName
                  ) ? (
                    <CheckCircle2
                      size={18}
                      color={
                        theme[
                          'primary'
                        ]
                      }
                    />
                  ) : null}

                </View>

                {errors.fullName ? (
                  <Text className="text-sm text-destructive mt-1 ml-1 font-medium">
                    {
                      errors.fullName
                    }
                  </Text>
                ) : null}

              </View>

              {/* ================================================= */}
              {/* EMAIL */}
              {/* ================================================= */}

              <View>

                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">

                  Email Address

                  <Text className="text-xs font-normal text-muted-foreground">
                    {' '}
                    (Optional)
                  </Text>

                </Text>

                <View
                  className={`flex-row items-center rounded-lg px-4 h-12 border ${
                    errors.email
                      ? 'border-destructive'
                      : isValidField(
                          email,
                          errors.email
                        )
                      ? 'border-primary'
                      : 'border-input'
                  } bg-input`}
                >

                  <Mail
                    size={18}
                    color={
                      errors.email
                        ? theme[
                            'destructive'
                          ]
                        : isValidField(
                            email,
                            errors.email
                          )
                        ? theme[
                            'primary'
                          ]
                        : theme[
                            'muted-foreground'
                          ]
                    }
                    style={{
                      marginRight: 10,
                    }}
                  />

                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="email@example.com"
                    placeholderTextColor={
                      theme[
                        'muted-foreground'
                      ]
                    }
                    value={
                      email
                    }
                    autoCapitalize="none"
                    autoCorrect={
                      false
                    }
                    keyboardType="email-address"
                    onChangeText={
                      value =>
                        handleFieldChange(
                          'email',
                          value
                        )
                    }
                  />

                  {isValidField(
                    email,
                    errors.email
                  ) ? (
                    <CheckCircle2
                      size={18}
                      color={
                        theme[
                          'primary'
                        ]
                      }
                    />
                  ) : null}

                </View>

                <Text className="text-xs text-muted-foreground mt-1 ml-1">
                  Optional. You can use your phone number to log in.
                </Text>

                {errors.email ? (
                  <Text className="text-sm text-destructive mt-1 ml-1 font-medium">
                    {
                      errors.email
                    }
                  </Text>
                ) : null}

              </View>

              {/* ================================================= */}
              {/* PHONE */}
              {/* ================================================= */}

              <View>

                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">

                  Phone Number

                  <Text className="text-destructive">
                    {' '}
                    *
                  </Text>

                </Text>

                <View
                  className={`flex-row items-center rounded-lg px-4 h-12 border ${
                    errors.phone
                      ? 'border-destructive'
                      : isValidField(
                          phone,
                          errors.phone
                        )
                      ? 'border-primary'
                      : 'border-input'
                  } bg-input`}
                >

                  <Phone
                    size={18}
                    color={
                      errors.phone
                        ? theme[
                            'destructive'
                          ]
                        : isValidField(
                            phone,
                            errors.phone
                          )
                        ? theme[
                            'primary'
                          ]
                        : theme[
                            'muted-foreground'
                          ]
                    }
                    style={{
                      marginRight: 10,
                    }}
                  />

                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="0912 345 6789"
                    placeholderTextColor={
                      theme[
                        'muted-foreground'
                      ]
                    }
                    value={
                      phone
                    }
                    keyboardType="phone-pad"
                    onChangeText={
                      value =>
                        handleFieldChange(
                          'phone',
                          value
                        )
                    }
                  />

                  {isValidField(
                    phone,
                    errors.phone
                  ) ? (
                    <CheckCircle2
                      size={18}
                      color={
                        theme[
                          'primary'
                        ]
                      }
                    />
                  ) : null}

                </View>

                <Text className="text-xs text-muted-foreground mt-1 ml-1">
                  Required. We'll convert it to +63 automatically.
                </Text>

                {errors.phone ? (
                  <Text className="text-sm text-destructive mt-1 ml-1 font-medium">
                    {
                      errors.phone
                    }
                  </Text>
                ) : null}

              </View>

              {/* ================================================= */}
              {/* PASSWORD */}
              {/* ================================================= */}

              <View>

                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                  Password
                </Text>

                <View
                  className={`flex-row items-center rounded-lg px-4 h-12 border ${
                    errors.password
                      ? 'border-destructive'
                      : isValidField(
                          password,
                          errors.password
                        )
                      ? 'border-primary'
                      : 'border-input'
                  } bg-input`}
                >

                  <Lock
                    size={18}
                    color={
                      errors.password
                        ? theme[
                            'destructive'
                          ]
                        : isValidField(
                            password,
                            errors.password
                          )
                        ? theme[
                            'primary'
                          ]
                        : theme[
                            'muted-foreground'
                          ]
                    }
                    style={{
                      marginRight: 10,
                    }}
                  />

                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="Create password"
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
                          'password',
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
                        previous =>
                          !previous
                      )
                    }
                    className="p-1"
                    style={{
                      minHeight: 44,
                      minWidth: 44,
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

              {/* ================================================= */}
              {/* CONFIRM PASSWORD */}
              {/* ================================================= */}

              <View>

                <Text className="text-xs font-semibold text-foreground mb-1.5 ml-1">
                  Confirm Password
                </Text>

                <View
                  className={`flex-row items-center rounded-lg px-4 h-12 border ${
                    errors.confirmPassword
                      ? 'border-destructive'
                      : isValidField(
                          confirmPassword,
                          errors.confirmPassword
                        )
                      ? 'border-primary'
                      : 'border-input'
                  } bg-input`}
                >

                  <ShieldCheck
                    size={18}
                    color={
                      errors.confirmPassword
                        ? theme[
                            'destructive'
                          ]
                        : isValidField(
                            confirmPassword,
                            errors.confirmPassword
                          )
                        ? theme[
                            'primary'
                          ]
                        : theme[
                            'muted-foreground'
                          ]
                    }
                    style={{
                      marginRight: 10,
                    }}
                  />

                  <TextInput
                    className="flex-1 text-base font-medium text-foreground h-full"
                    placeholder="Repeat password"
                    placeholderTextColor={
                      theme[
                        'muted-foreground'
                      ]
                    }
                    secureTextEntry={
                      !showConfirm
                    }
                    value={
                      confirmPassword
                    }
                    onChangeText={
                      value =>
                        handleFieldChange(
                          'confirmPassword',
                          value
                        )
                    }
                  />

                  <TouchableOpacity
                    activeOpacity={
                      0.7
                    }
                    onPress={() =>
                      setShowConfirm(
                        previous =>
                          !previous
                      )
                    }
                    className="p-1"
                    style={{
                      minHeight: 44,
                      minWidth: 44,
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                    }}
                  >
                    {showConfirm ? (
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

                {errors.confirmPassword ? (
                  <Text className="text-sm text-destructive mt-1 ml-1 font-medium">
                    {
                      errors.confirmPassword
                    }
                  </Text>
                ) : null}

              </View>

              {/* ================================================= */}
              {/* TERMS */}
              {/* ================================================= */}

              <TouchableOpacity
                activeOpacity={
                  0.7
                }
                className="flex-row items-center mt-4 mb-2 px-1 min-h-[44px]"
                onPress={() =>
                  setAgree(
                    previous =>
                      !previous
                  )
                }
              >

                <View
                  className="w-6 h-6 rounded-md items-center justify-center mr-3 border-2"
                  style={{
                    borderColor:
                      agree
                        ? theme[
                            'primary'
                          ]
                        : theme[
                            'border'
                          ],

                    backgroundColor:
                      agree
                        ? theme[
                            'primary'
                          ]
                        : 'transparent',
                  }}
                >
                  {agree ? (
                    <Check
                      size={16}
                      color="white"
                    />
                  ) : null}
                </View>

                <Text className="flex-1 text-sm text-muted-foreground">

                  I agree to the{' '}

                  <Text className="font-semibold text-primary">
                    Terms of Service
                  </Text>{' '}

                  and{' '}

                  <Text className="font-semibold text-primary">
                    Privacy Policy
                  </Text>

                </Text>

              </TouchableOpacity>

              {/* ================================================= */}
              {/* SUBMIT */}
              {/* ================================================= */}

              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                className={`h-12 rounded-xl items-center justify-center mt-2 shadow shadow-primary/30 ${
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
                  handleSignup
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
                  <Text className="text-primary-foreground text-lg font-bold">
                    Create Account
                  </Text>
                )}

              </TouchableOpacity>

            </View>

            {/* ================================================== */}
            {/* FOOTER */}
            {/* ================================================== */}

            <View className="mt-8 items-center">

              <View className="flex-row items-center mb-6 w-full">

                <View
                  className="h-[1px] flex-1 bg-border"
                  style={{
                    marginLeft: 16,
                  }}
                />

                <Text className="mx-4 text-xs font-semibold text-muted-foreground">
                  Registered?
                </Text>

                <View
                  className="h-[1px] flex-1 bg-border"
                  style={{
                    marginRight: 16,
                  }}
                />

              </View>

              <Link
                href="/login"
                asChild
              >
                <TouchableOpacity className="flex-row items-center py-2 min-h-[44px]">

                  <Text className="text-base font-medium text-muted-foreground mr-1">
                    Have an account?
                  </Text>

                  <Text className="text-base font-bold text-primary">
                    Sign In
                  </Text>

                </TouchableOpacity>
              </Link>

            </View>

          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}