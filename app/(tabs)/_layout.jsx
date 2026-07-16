import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TAB_BAR_HEIGHT = 60; 

function CustomTabBar({ state, descriptors, navigation, theme, bottomInset }) {
  const totalHeight = TAB_BAR_HEIGHT + bottomInset;

  return (
    <View
      className="absolute self-center flex-row items-center justify-around rounded-[32px] px-3"
      style={{
        backgroundColor: theme.surface + 'B3',
        width: '90%',
        height: TAB_BAR_HEIGHT, // keep the glass bar itself normal height
        bottom: bottomInset + 8, // 8‑point margin from the safe area
        left: '5%',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 15,
          },
          android: { elevation: 10 },
        }),
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconMap = {
          index: isFocused ? 'grid' : 'grid-outline',
          vehicles: isFocused ? 'car-sport' : 'car-sport-outline',
          profile: isFocused ? 'person' : 'person-outline',
          booking: isFocused ? 'calendar' : 'calendar-outline',
          services: isFocused ? 'construct' : 'construct-outline',
        };
        const iconName = iconMap[route.name] || 'help-circle-outline';

        const pillStyle = useAnimatedStyle(() => ({
          backgroundColor: withTiming(isFocused ? theme.primary + '25' : 'transparent', { duration: 200 }),
          transform: [{ scale: withSpring(isFocused ? 1.1 : 0.8, { damping: 15, stiffness: 150 }) }],
          opacity: withTiming(isFocused ? 1 : 0, { duration: 150 }),
        }));

        const iconAnim = useAnimatedStyle(() => ({
          transform: [
            { scale: withSpring(isFocused ? 1.15 : 1, { damping: 12 }) },
            { translateY: withTiming(isFocused ? -2 : 0, { duration: 200 }) },
          ],
        }));

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.6}
            className="items-center justify-center flex-1 h-full"
          >
            <View className="items-center justify-center w-full h-full">
              <Animated.View
                className="absolute w-14 h-10 rounded-2xl"
                style={[pillStyle, { shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10 }]}
              />
              <Animated.View style={iconAnim}>
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? theme.primary : theme.textSecondary}
                />
              </Animated.View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarVisualHeight = TAB_BAR_HEIGHT + insets.bottom + 8; 

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} theme={theme} bottomInset={insets.bottom} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        animation: 'fade',
        contentStyle: {
          paddingBottom: tabBarVisualHeight,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="vehicles" options={{ title: 'Vehicles' }} />
      <Tabs.Screen name="services" options={{ title: 'Services' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}