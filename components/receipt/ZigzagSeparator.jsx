// components/receipt/ZigzagSeparator.jsx
import React from 'react';
import { View, Text } from 'react-native';

export default function ZigzagSeparator({ color = '#000000' }) {
  // Repeat a zigzag pattern enough times to fill width
  const zigzag = '▲▼'.repeat(20); // Simple zigzag
  return (
    <View className="items-center my-2">
      <Text className="text-xs tracking-widest" style={{ color, lineHeight: 12 }}>{zigzag}</Text>
    </View>
  );
}