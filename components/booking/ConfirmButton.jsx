import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function ConfirmButton({ onPress, disabled, loading }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className={`min-h-[44px] py-4 rounded-xl bg-primary items-center justify-center shadow-lg shadow-primary/25 ${
        disabled ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-primary-foreground text-base font-semibold">
          Confirm Booking
        </Text>
      )}
    </TouchableOpacity>
  );
}