import React from "react";
import { View, Text } from "react-native";

export default function ServicesHeader() {
  return (
    <View className="px-4 mb-8">
      <Text className="text-3xl font-bold tracking-tight text-foreground mb-2">
        Explore Services
      </Text>
      <Text className="text-base font-normal leading-6 text-muted-foreground">
        Choose from our premium maintenance packages designed to keep your vehicle in peak condition.
      </Text>
    </View>
  );
}