import { View, Text, TextInput } from 'react-native';
import { FileText } from 'lucide-react-native';

export default function NotesInput({ value, onChange }) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-1 mb-3">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-2">
            <FileText size={14} color="#C1272D" />
          </View>
          <Text className="text-lg font-semibold text-foreground">Describe the Issue</Text>
        </View>
        <Text className="text-sm font-normal text-muted-foreground">Optional</Text>
      </View>

      <TextInput
        className="px-4 py-3.5 rounded-lg border border-border bg-card text-base font-normal text-foreground min-h-[96px]"
        placeholder="e.g., Engine noise, AC not cooling, etc."
        placeholderTextColor="#8E8E93"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        value={value}
        onChangeText={onChange}
      />
      <Text className="text-sm font-normal text-muted-foreground mt-2 px-1">
        Tell us more about your vehicle's condition or special requests.
      </Text>
    </View>
  );
}