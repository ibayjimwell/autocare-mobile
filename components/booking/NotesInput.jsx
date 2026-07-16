import { View, Text, TextInput } from 'react-native';

export default function NotesInput({ value, onChange }) {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
          <Text className="text-white font-black text-xs">4</Text>
        </View>
        <Text className="text-lg font-heading font-black text-foreground">
          Describe the issue (optional)
        </Text>
      </View>
      <TextInput
        className="p-5 rounded-[28px] border border-border bg-card text-foreground"
        placeholder="e.g., Engine noise, AC not cooling, etc."
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        value={value}
        onChangeText={onChange}
      />
      <Text className="text-xs mt-2 text-muted-foreground/50">
        Tell us more about your vehicle's condition or special requests.
      </Text>
    </View>
  );
}