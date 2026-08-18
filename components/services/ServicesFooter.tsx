import React from "react";
import { View, Text } from "react-native";

export default function ServicesFooter() {
  return (
    <View className="px-8 mt-2 mb-8">
      <Text className="text-sm font-normal text-muted-foreground text-center leading-5">
        Prices may vary depending on vehicle issue, make and model. All services include a comprehensive free inspection.
      </Text>
    </View>
  );
}