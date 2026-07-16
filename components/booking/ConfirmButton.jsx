import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function ConfirmButton({ onPress, disabled, loading }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className={`mt-6 py-5 rounded-[30px] bg-primary shadow-xl shadow-primary/20 ${
        disabled ? 'opacity-60' : ''
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-primary-foreground text-center font-black uppercase tracking-[2px]">
          Confirm Booking
        </Text>
      )}
    </TouchableOpacity>
  );
}