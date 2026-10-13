
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import { useRouter } from 'expo-router';

export default function ActionItem({
  icon: Icon,
  label,
  color,
  path,
  onPress,
  isLast = false,
}) {
  const router = useRouter();

  const handlePress = () => {
    if (typeof onPress === 'function') {
      onPress();
      return;
    }

    if (path) {
      router.push(path);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={!onPress && !path}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`min-h-[96px] flex-1 items-center justify-center rounded-xl border border-border bg-card py-4 ${
        !isLast ? 'mr-3' : ''
      }`}
    >
      <View
        className="mb-2 h-11 w-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `${color}15`,
        }}
      >
        {Icon ? (
          <Icon
            size={22}
            color={color}
          />
        ) : null}
      </View>

      <Text className="text-sm font-medium text-foreground">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
