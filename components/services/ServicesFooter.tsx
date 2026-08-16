import { View, Text } from "react-native";

export default function ServicesFooter() {
  return (
    <View className="px-8 mt-2 mb-6">
      <Text className="text-sm font-normal text-muted-foreground text-center">
        Prices may vary depending on vehicle issue, make and model. All services include a free inspection.
      </Text>
    </View>
  );
}