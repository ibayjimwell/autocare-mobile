import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This screen doesn't exist.</Text>
      <Link href="/">Go to home</Link>
    </SafeAreaView>
  );
}