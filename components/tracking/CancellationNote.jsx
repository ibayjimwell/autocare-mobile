import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

export default function CancellationNote({ notes }) {
  return (
    <View className="bg-card rounded-xl border border-primary/20 mb-6 overflow-hidden">
      <View className="px-4 py-5 flex-row items-start">
        <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-3">
          <AlertCircle
            size={22}
            color="#C1272D"
            strokeWidth={2}
          />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-primary">
            Order Cancelled
          </Text>

          <Text className="text-sm leading-5 text-muted-foreground mt-2">
            {notes || 'This appointment was cancelled.'}
          </Text>
        </View>
      </View>
    </View>
  );
}