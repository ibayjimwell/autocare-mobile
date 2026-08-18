import React from "react";
import { View, Text } from "react-native";

export default function ServicesHeader() {
  return (
    <View className="px-4 pt-2 mb-4">
      <Text className="text-3xl font-bold tracking-tight text-foreground">
        Browse <Text className="text-primary">Services</Text>
      </Text>
      <Text className="text-sm font-normal text-muted-foreground mt-2">
        Choose from our premium maintenance packages designed to keep your vehicle in peak condition.
      </Text>
    </View>
  );
}