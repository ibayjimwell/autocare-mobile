import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ServicesFooter() {
  return (
    <View className="mt-4 p-6 rounded-3xl items-center bg-primary/5">
      <Ionicons name="information-circle-outline" size={20} color="#666" />
      <Text className="text-[11px] text-center mt-2 font-medium text-foreground/50">
        Prices may vary depending on vehicle issue, make and model.{"\n"}All services include a free inspection.
      </Text>
    </View>
  );
}