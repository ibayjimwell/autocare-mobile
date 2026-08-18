import { Fragment } from 'react';
import { Tabs, Link } from 'expo-router';
import { Home, Car, Wrench, User, Calendar, HelpCircle, Plus } from 'lucide-react-native';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const TAB_BAR_HEIGHT = 64;

const ICON_MAP = {
  index: Home,
  vehicles: Car,
  services: Wrench,
  profile: User,
  booking: Calendar,
};

const LABEL_MAP = {
  index: 'Home',
  vehicles: 'Vehicles',
  services: 'Services',
  profile: 'Profile',
  booking: 'Booking',
};

function CenterActionButton() {
  return (
    <Link href="/booking" asChild>
      <TouchableOpacity
        activeOpacity={0.85}
        className="items-center justify-center"
        style={{ width: 64, height: '100%' }}
      >
        <View
          className="w-20 h-20 rounded-full bg-primary items-center justify-center"
          style={{
            transform: [{ translateY: -2 }],
            borderWidth: 4,
            borderColor: '#F2F2F7',
            ...Platform.select({
              ios: {
                shadowColor: '#C1272D',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
              },
              android: { elevation: 8 },
            }),
          }}
        >
          <Plus size={26} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function CustomTabBar({ state, descriptors, navigation, theme, bottomInset }) {
  return (
    <View
      className="absolute self-center flex-row items-center justify-around rounded-full px-2"
      style={{
        backgroundColor: theme.surface + 'B3',
        width: '92%',
        height: TAB_BAR_HEIGHT,
        bottom: bottomInset + 8,
        left: '4%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
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

        const IconComponent = ICON_MAP[route.name] || HelpCircle;
        const label = LABEL_MAP[route.name] || route.name;

        // Icon: subtle lift, no scale
        const iconAnim = useAnimatedStyle(() => ({
          transform: [{ translateY: withTiming(isFocused ? -2 : 0, { duration: 200 }) }],
        }));

        return (
          <Fragment key={route.key}>
            {/* Center action button (index 2 is the middle tab, but we replace it with the action button) */}
            {index === 2 && <CenterActionButton />}

            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.6}
              className="items-center justify-center flex-1 h-full"
            >
              <View className="items-center justify-center w-full h-full">
                <Animated.View
                  className="absolute w-16 h-12 rounded-2xl"
                  style={[{ shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10 }]}
                />
                <Animated.View style={iconAnim} className="items-center">
                  <IconComponent
                    size={22}
                    color={isFocused ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    className="text-[10px] font-medium mt-0.5"
                    style={{ color: isFocused ? theme.primary : theme.textSecondary }}
                  >
                    {label}
                  </Text>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </Fragment>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarVisualHeight = TAB_BAR_HEIGHT + insets.bottom + 22;

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