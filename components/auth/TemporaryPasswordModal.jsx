import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AlertCircle,
  ArrowRight,
  Check,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  X,
} from 'lucide-react-native';

import {
  theme,
} from '../../theme';

const MIN_PASSWORD_LENGTH = 8;

function Requirement({ met, children }) {
  return (
    <View className="mt-2 flex-row items-center">
      <View
        className={`mr-2 h-5 w-5 items-center justify-center rounded-full ${
          met ? 'bg-primary/10' : 'bg-secondary'
        }`}
      >
        {met ? (
          <Check size={13} strokeWidth={3} color={theme.primary} />
        ) : (
          <Circle
            size={11}
            color={theme['muted-foreground']}
          />
        )}
      </View>
      <Text
        className={`flex-1 text-sm ${
          met ? 'font-semibold text-foreground' : 'text-muted-foreground'
        }`}
      >
        {children}
      </Text>
    </View>
  );
}

export default function TemporaryPasswordModal({
  visible,
  loading,
  serverError,
  onSubmit,
  onCancel,
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
    setPasswordTouched(false);
    setConfirmTouched(false);
    setSubmitted(false);
  }, [visible]);

  const meetsLength = password.length >= MIN_PASSWORD_LENGTH;
  const matches =
    confirmPassword.length > 0 && confirmPassword === password;

  const passwordError =
    passwordTouched || submitted
      ? !password
        ? 'Enter a new password.'
        : !meetsLength
          ? 'Password must be at least 8 characters.'
          : ''
      : '';

  const confirmError =
    confirmTouched || submitted
      ? !confirmPassword
        ? 'Confirm your new password.'
        : !matches
          ? 'Passwords do not match.'
          : ''
      : '';

  function submit() {
    if (loading) return;
    setSubmitted(true);

    if (!meetsLength || !matches) {
      return;
    }

    // The parent hook and server additionally reject reusing the
    // temporary password. Never persist the old password in this modal.
    void onSubmit(password, confirmPassword);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!loading) onCancel();
      }}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-center bg-black/60 px-4"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          className="w-full max-w-[440px] self-center overflow-hidden rounded-[28px] bg-card shadow-2xl"
          style={{ maxHeight: '91%' }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <LockKeyhole size={26} color={theme.primary} />
              </View>

              <TouchableOpacity
                className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
                onPress={onCancel}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Cancel password change"
              >
                <X size={20} color={theme['muted-foreground']} />
              </TouchableOpacity>
            </View>

            <Text className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">
              Account security
            </Text>
            <Text className="mt-1 text-[26px] font-bold tracking-tight text-foreground">
              Create a permanent password
            </Text>
            <Text className="mt-2 text-sm leading-6 text-muted-foreground">
              This account was created with a temporary password. Replace it
              now to protect your AutoCare account.
            </Text>

            <View className="mt-5 flex-row items-start rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <ShieldCheck size={20} color={theme.primary} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-foreground">
                  First, secure your account
                </Text>
                <Text className="mt-1 text-xs leading-5 text-muted-foreground">
                  After saving your password, we'll ask you to verify your
                  phone number if it hasn't been verified yet.
                </Text>
              </View>
            </View>

            <Text className="mb-2 mt-6 text-sm font-semibold text-foreground">
              New password
            </Text>
            <View
              className={`h-[52px] flex-row items-center rounded-xl border bg-input px-3 ${
                passwordError ? 'border-destructive' : 'border-input'
              }`}
            >
              <KeyRound
                size={18}
                color={theme['muted-foreground']}
              />
              <TextInput
                className="ml-3 h-full flex-1 text-base text-foreground"
                value={password}
                onChangeText={value => {
                  setPassword(value);
                  setPasswordTouched(true);
                }}
                placeholder="Enter your new password"
                placeholderTextColor={theme['muted-foreground']}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                editable={!loading}
                accessibilityLabel="New password"
              />
              <TouchableOpacity
                className="h-11 w-11 items-center justify-center"
                onPress={() => setShowPassword(value => !value)}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={19} color={theme['muted-foreground']} />
                ) : (
                  <Eye size={19} color={theme['muted-foreground']} />
                )}
              </TouchableOpacity>
            </View>

            {passwordError ? (
              <Text className="ml-1 mt-1 text-sm text-destructive">
                {passwordError}
              </Text>
            ) : null}

            <View className="mt-3 rounded-xl border border-border bg-secondary/40 px-3 py-2">
              <Text className="text-xs font-semibold text-foreground">
                Password requirements
              </Text>
              <Requirement met={meetsLength}>
                At least 8 characters
              </Requirement>
              <Text className="mt-2 text-xs leading-5 text-muted-foreground">
                Use a password different from the temporary password you
                received. You'll be alerted if you reuse it.
              </Text>
            </View>

            <Text className="mb-2 mt-5 text-sm font-semibold text-foreground">
              Confirm new password
            </Text>
            <View
              className={`h-[52px] flex-row items-center rounded-xl border bg-input px-3 ${
                confirmError ? 'border-destructive' : 'border-input'
              }`}
            >
              <KeyRound size={18} color={theme['muted-foreground']} />
              <TextInput
                className="ml-3 h-full flex-1 text-base text-foreground"
                value={confirmPassword}
                onChangeText={value => {
                  setConfirmPassword(value);
                  setConfirmTouched(true);
                }}
                placeholder="Re-enter your new password"
                placeholderTextColor={theme['muted-foreground']}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                editable={!loading}
                accessibilityLabel="Confirm new password"
              />
              <TouchableOpacity
                className="h-11 w-11 items-center justify-center"
                onPress={() => setShowConfirm(value => !value)}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
              >
                {showConfirm ? (
                  <EyeOff size={19} color={theme['muted-foreground']} />
                ) : (
                  <Eye size={19} color={theme['muted-foreground']} />
                )}
              </TouchableOpacity>
            </View>

            {confirmError ? (
              <Text className="ml-1 mt-1 text-sm text-destructive">
                {confirmError}
              </Text>
            ) : null}

            {confirmPassword.length > 0 ? (
              <Requirement met={matches}>
                {matches ? 'Passwords match' : 'Both passwords must match'}
              </Requirement>
            ) : null}

            {serverError ? (
              <View className="mt-4 flex-row items-start rounded-xl border border-destructive/20 bg-destructive/10 p-3">
                <AlertCircle size={18} color={theme.destructive} />
                <Text className="ml-2 flex-1 text-sm leading-5 text-destructive">
                  {serverError}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={submit}
              disabled={loading}
              activeOpacity={0.85}
              className={`mt-6 h-[52px] flex-row items-center justify-center rounded-xl bg-primary ${
                loading ? 'opacity-70' : ''
              }`}
              accessibilityRole="button"
              accessibilityLabel="Save permanent password"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text className="mr-2 text-base font-bold text-white">
                    Save password & continue
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              className="mt-2 h-11 items-center justify-center"
              accessibilityRole="button"
            >
              <Text className="text-sm font-semibold text-muted-foreground">
                Back to login
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
