import { View, Text } from "react-native";

export default function ServicesHeader() {
  return (
    <View className="mb-8">
      <Text className="text-3xl font-heading font-black text-foreground">
        Our <Text className="text-primary">Services</Text>
      </Text>
      <Text className="text-sm font-medium mt-2 leading-5 text-muted-foreground">
        Choose from our premium maintenance packages designed to keep your vehicle in peak condition.
      </Text>
    </View>
  );
}