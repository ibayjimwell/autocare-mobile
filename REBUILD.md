You are an expert React Native developer and a master UI/UX designer specializing in Tailwind CSS / NativeWind and iOS Human Interface Guidelines (HIG).

Your task is to RECONSTRUCT the UI of the attached React Native screen or component, using the provided inspiration image as the **primary source for layout, structure, and component composition**, while applying the strict rules of the AutoCare HIG Design System to every element to produce a polished, premium native iOS UI.

DO NOT simply copy the old structure. Rethink the component tree based on the *inspiration image*. The resulting UI must mirror the spatial arrangement and general design of the image but must be composed *entirely* of standardized AutoCare HIG components and styles.

---

### STRICT RULES & CONSTRAINTS

1.  **LAYOUT & COMPOSITION PRIORITIZATION (INSPIRATION IMAGE):**
    *   **Rule:** Replicate the general spatial arrangement, section hierarchy, and positioning of all interactive and display components (buttons, text inputs, cards, headers, sections) as seen in the provided inspiration image.
    *   **Standardization:** Once the layout is defined by the image, each component used in that layout (e.g., a specific card style, a button type, a form field) must be standardized *exactly* according to the AutoCare HIG Design System specs below. For example, if the image shows a form, implement it using standard iOS text inputs and spacing, not a direct clone of the image's perhaps less native controls.

2.  **STRUCTURAL REDESIGN MANDATE (APPLE HIG LAYOUTS):**
    *   **Rule:** While following the *image's composition*, interpret and implement elements using standard iOS structural paradigms defined below. For example, if the image shows a table or sectioned data, implement it using the *Grouped List* structure.
        *   **Grouped Lists:** Instead of floating loose items, group related information into distinct blocks. Wrap them in a card (`bg-card rounded-xl mx-4 overflow-hidden mb-6`) and stack rows inside.
        *   **List Rows:** Items inside a grouped card should be flex rows with a title on the left, value on the right, separated by an inset divider (`border-b border-border ml-4`). The last item in a card must NOT have a bottom border.
        *   **Large Headers:** Replace standard centered headers with an iOS-style left-aligned Large Title (`text-3xl font-bold tracking-tight text-foreground px-4 mb-4`), if present in the overall screen structure suggested by the image or logic.

3.  **SELECTIVE APPLE GLASSMORPHISM & MATERIALS:**
    *   **Rule:** Use Glassmorphism ONLY on floating or overlapping UI elements suggested by the inspiration image (e.g., a sticky navigation bar, a floating action button, a popover modal).
        *   **Sticky/Floating Header Bars:** Translucent blur (`bg-white/80` or `BlurView` from `expo-blur`) with a subtle bottom border (`border-b border-white/20`).
        *   **Fixed Floating Bottom CTA Bars:** Floating above content with translucent background (`bg-white/85` or `BlurView`), subtle top border (`border-t border-border/40`), and light drop shadow.
        *   **Floating Modals / Action Sheets / Floating Badges:** Semi-transparent floating surfaces with subtle light borders (`border border-white/30 shadow-lg`).
    *   **Constraint:** DO NOT apply glassmorphism to standard body text, input fields, or standard scrollable grouped list cards.

4.  **DO NOT TOUCH BUSINESS LOGIC:**
    *   **Rule:** Do NOT alter, remove, or modify any functions, state management (`useState`, `useReducer`), hooks (`useEffect`), API calls, or event handlers (`onPress`, etc.).
    *   **Constraint:** You must maintain all existing data bindings, conditional rendering logic, and functional callbacks, applying them to the newly structured HIG UI components.

5.  **SAFE AREA VIEW MANDATE:**
    *   **Rule:** Ensure the root screen component is wrapped in a `SafeAreaView` from `react-native-safe-area-context` with `flex-1 bg-background`. Proper margins/padding must prevent content from bleeding under the notch or home indicator.

6.  **ICONS:**
    *   **Rule:** Use `lucide-react-native` for all icons. Replace existing icon libraries (Ionicons, FontAwesome, etc.) with the closest equivalent Lucide icon. Standard icon color should be the foreground or muted-foreground color, unless it is a primary action color `#C1272D`.

7.  **AUTOCARE DESIGN SYSTEM (APPLE HIG) SPECIFICATIONS:**
    *   **Screen Backgrounds:** `bg-background` (`#F2F2F7` - iOS Grouped Background).
    *   **Cards / Surface Containers:** `bg-card` (`#FFFFFF` - Pure White).
    *   **Primary Interactivity / CTA:** `bg-primary` / `text-primary` (`#C1272D` - AutoCare Red). Color indicates tapability.
    *   **Secondary Actions:** `bg-secondary` (`#E5E5EA`) with `text-secondary-foreground` (`#000000`).
    *   **Text Hierarchy:**
        *   Primary / Body: `text-foreground` (`#000000`).
        *   Secondary / Captions / Placeholders: `text-muted-foreground` (`#8E8E93`).
        *   Large Titles: `text-3xl font-bold tracking-tight text-foreground`.
        *   Headlines: `text-lg font-semibold text-foreground`.
        *   Body: `text-base font-normal text-foreground`.
        *   Footnotes/Captions: `text-sm font-normal text-muted-foreground`.
    *   **Touch Targets & Spacing:**
        *   All interactive buttons MUST be at least 44x44pt (e.g., `min-h-[44px]` or `py-4`).
        *   Horizontal margins from screen edges: 16px (`px-4` or `mx-4`).
    *   **Border Radius (Squarcles):**
        *   Text inputs: `rounded-lg` (10px).
        *   Cards / primary buttons: `rounded-xl` (14px).
        *   Modals / Bottom sheets / Floating Bars: `rounded-2xl` (20px) or `rounded-3xl` (24px).

---

### EXPECTED OUTPUT
Return the COMPLETE, fully redesigned component code. Do not use placeholders like `// ... rest of the code remains the same`. Keep all imports, logic, and state intact while delivering a stunning, newly architected iOS-native layout that mirrors the composition of the inspiration image while strictly adhering to the AutoCare HIG specifications and tasteful Glassmorphism.

---

### COMPONENT CODE TO REDESIGN:
import { 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Text,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router, Link } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useProfileData } from "../../hooks/useProfileData";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ContactCards from "../../components/profile/ContactCards";
import StatsCards from "../../components/profile/StatsCards";
import RecentHistory from "../../components/profile/RecentHistory";
import SettingsList from "../../components/profile/SettingsList";
import LogoutModal from "../../components/profile/LogoutModal";
import pushNotificationApi from "../../services/pushNotificationApi";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { loading, stats } = useProfileData();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    setShowLogoutModal(false);
    try {
      // Unregister push token if you have one
      // await pushNotificationApi.unregisterToken(token);
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#C1272D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* iOS Large Title */}
        <View className="px-4 pt-4 mb-4">
          <Text className="text-3xl font-bold tracking-tight text-foreground">
            Profile
          </Text>
        </View>

        <ProfileHeader />
        <ContactCards />
        <StatsCards vehicles={stats.vehicles} visits={stats.visits} />

        {/* Recent History Section Header */}
        <View className="flex-row justify-between items-end px-8 mb-2 mt-4">
          <Text className="text-sm font-normal uppercase tracking-wider text-muted-foreground">
            Activity
          </Text>
          <TouchableOpacity onPress={() => router.push("/history")}>
            <Link className="text-sm font-semibold text-primary" href="history">
              View All
            </Link>
          </TouchableOpacity>
        </View>
        <RecentHistory appointments={stats.completedAppointments} />

        {/* Assuming SettingsList is pre-styled as an iOS Grouped List inside */}
        <SettingsList
          loggingOut={loggingOut}
          onLogoutPress={() => setShowLogoutModal(true)}
        />

        <Text className="text-center mt-6 mb-10 text-xs font-normal text-muted-foreground">
          AutoCare v2.0 • 2026
        </Text>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

import { View, Text } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileHeader() {
  const { user } = useAuth();
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "JD";

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2023";

  return (
    <View className="bg-card mx-4 rounded-xl flex-row items-center p-4 mb-6">
      {/* Settings-style Inline Avatar */}
      <View className="w-16 h-16 rounded-full bg-primary justify-center items-center mr-4">
        <Text className="text-xl font-bold text-white tracking-wider">
          {initials}
        </Text>
      </View>

      <View className="flex-1 justify-center">
        <Text className="text-xl font-semibold text-foreground mb-1">
          {user?.fullname || "User"}
        </Text>
        <Text className="text-sm font-normal text-muted-foreground">
          Member since {joinDate}
        </Text>
      </View>
    </View>
  );
}

import { View, Text } from "react-native";
import { Mail, Phone } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";

export default function ContactCards() {
  const { user } = useAuth();
  
  return (
    <View className="bg-card mx-4 rounded-xl overflow-hidden mb-6">
      {/* Email Row */}
      <View className="flex-row items-center pl-4">
        <Mail size={20} color="#8E8E93" />
        <View className="flex-1 flex-row justify-between items-center ml-3 pr-4 py-3 min-h-[44px] border-b border-border">
          <Text className="text-base font-normal text-foreground">Email</Text>
          <Text className="text-base font-normal text-muted-foreground" numberOfLines={1}>
            {user?.email || "No email"}
          </Text>
        </View>
      </View>
      
      {/* Phone Row (No Bottom Border) */}
      <View className="flex-row items-center pl-4">
        <Phone size={20} color="#8E8E93" />
        <View className="flex-1 flex-row justify-between items-center ml-3 pr-4 py-3 min-h-[44px]">
          <Text className="text-base font-normal text-foreground">Phone</Text>
          <Text className="text-base font-normal text-muted-foreground">
            {user?.phone || "No phone"}
          </Text>
        </View>
      </View>
    </View>
  );
}

import { View, Text } from "react-native";
import { Car, CalendarCheck } from "lucide-react-native";

export default function StatsCards({ vehicles, visits }) {
  return (
    <View className="flex-row mx-4 gap-4 mb-6">
      {/* Widget-style Stacked Cards */}
      <View className="flex-1 bg-card rounded-xl p-4 items-start shadow-sm">
        <Car size={24} color="#C1272D" className="mb-2" />
        <Text className="text-2xl font-bold tracking-tight text-foreground">
          {vehicles}
        </Text>
        <Text className="text-sm font-normal text-muted-foreground mt-0.5">
          Vehicles
        </Text>
      </View>

      <View className="flex-1 bg-card rounded-xl p-4 items-start shadow-sm">
        <CalendarCheck size={24} color="#C1272D" className="mb-2" />
        <Text className="text-2xl font-bold tracking-tight text-foreground">
          {visits}
        </Text>
        <Text className="text-sm font-normal text-muted-foreground mt-0.5">
          Service Visits
        </Text>
      </View>
    </View>
  );
}

import { View, Text, TouchableOpacity } from "react-native";
import { Clock, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { formatDate, formatPrice } from "../../utils/format";

interface AppointmentItem {
  id: string;
  serviceType?: { name: string; basePrice: number };
  appointmentDate?: string;
  vehicle?: { make: string; model: string };
}

export default function RecentHistory({ appointments }: { appointments: AppointmentItem[] }) {
  if (appointments.length === 0) {
    return (
      <View className="bg-card mx-4 rounded-xl p-6 items-center justify-center mb-6 min-h-[100px]">
        <Clock size={32} color="#8E8E93" />
        <Text className="mt-3 text-sm font-normal text-muted-foreground">
          No completed services yet
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-card mx-4 rounded-xl overflow-hidden mb-6">
      {appointments.map((apt, index) => (
        <TouchableOpacity
          key={apt.id}
          activeOpacity={0.7}
          onPress={() => router.push(`/tracking?appointmentId=${apt.id}`)}
          className="pl-4 bg-card"
        >
          {/* Apply bottom border to all except the last item */}
          <View className={`flex-row justify-between items-center py-3 pr-4 min-h-[60px] ${index !== appointments.length - 1 ? "border-b border-border" : ""}`}>
            
            {/* Title & Meta Info */}
            <View className="flex-1 justify-center pr-3">
              <Text className="text-base font-semibold text-foreground mb-1">
                {apt.serviceType?.name || 'Service'}
              </Text>
              <Text className="text-sm font-normal text-muted-foreground" numberOfLines={1}>
                {formatDate(apt.appointmentDate)} • {apt.vehicle?.make} {apt.vehicle?.model}
              </Text>
            </View>

            {/* Price & Status */}
            <View className="items-end justify-center ml-2">
              <Text className="text-base font-semibold text-foreground mb-1">
                {formatPrice(apt.serviceType?.basePrice)}
              </Text>
              <Text className="text-xs font-medium text-[#34C759]">
                Completed
              </Text>
            </View>

            {/* Navigation Chevron */}
            <ChevronRight size={20} color="#C7C7CC" className="ml-2" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ChevronRight, Bell, Shield, CircleHelp } from "lucide-react-native";

export default function SettingsList({ loggingOut, onLogoutPress }) {
  return (
    <View className="mt-4">
      {/* Settings Group Header */}
      <View className="px-8 mb-2">
        <Text className="text-sm font-normal uppercase tracking-wider text-muted-foreground">
          Preferences
        </Text>
      </View>
 
      {/* Main Settings Grouped List */}
      <View className="bg-card mx-4 rounded-xl overflow-hidden mb-6">
        {/* Notifications Item */}
        <TouchableOpacity activeOpacity={0.7} className="pl-4">
          <View className="flex-row items-center py-3 pr-4 border-b border-border min-h-[44px]">
            <Bell size={22} color="#8E8E93" />
            <Text className="flex-1 text-base font-normal text-foreground ml-3">
              Notifications
            </Text>
            <ChevronRight size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>

        {/* Privacy Item */}
        <TouchableOpacity activeOpacity={0.7} className="pl-4">
          <View className="flex-row items-center py-3 pr-4 border-b border-border min-h-[44px]">
            <Shield size={22} color="#8E8E93" />
            <Text className="flex-1 text-base font-normal text-foreground ml-3">
              Privacy & Security
            </Text>
            <ChevronRight size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>

        {/* Help & Support Item (No bottom border for last item) */}
        <TouchableOpacity activeOpacity={0.7} className="pl-4">
          <View className="flex-row items-center py-3 pr-4 min-h-[44px]">
            <CircleHelp size={22} color="#8E8E93" />
            <Text className="flex-1 text-base font-normal text-foreground ml-3">
              Help & Support
            </Text>
            <ChevronRight size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Destructive Action Group (Isolated Logout Button) */}
      <View className="bg-card mx-4 rounded-xl overflow-hidden mb-2">
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={onLogoutPress}
          disabled={loggingOut}
          className="items-center justify-center py-3 min-h-[50px]"
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#C1272D" />
          ) : (
            <Text className="text-lg font-normal text-primary"> {/* text-primary assumes your primary color is red #C1272D */}
              Sign Out
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

export default function LogoutModal({ visible, onClose, onConfirm }) {
  // Completely re-architected to look like a native iOS Action Sheet
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
      useNativeDriver
    >
      <View className="pb-8 px-4">
        
        {/* Destructive Actions Group */}
        <View className="bg-card rounded-2xl mb-2 overflow-hidden">
          {/* Header Message */}
          <View className="py-4 px-4 items-center border-b border-border">
            <Text className="text-sm font-normal text-muted-foreground text-center leading-5">
              Are you sure you want to end your session? You'll need to sign back in to book services.
            </Text>
          </View>
          
          {/* Logout Button */}
          <TouchableOpacity 
            activeOpacity={0.7}
            className="py-4 items-center min-h-[56px] justify-center" 
            onPress={onConfirm}
          >
            <Text className="text-xl font-normal text-primary">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <View className="bg-card rounded-2xl overflow-hidden">
          <TouchableOpacity 
            activeOpacity={0.7}
            className="py-4 items-center min-h-[56px] justify-center" 
            onPress={onClose}
          >
            <Text className="text-xl font-semibold text-[#007AFF]">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}