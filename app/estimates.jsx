import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  X,
  FileText,
  SlidersHorizontal,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useBillingData } from '../hooks/useBillingData';
import EstimateCard from '../components/billing/EstimateCard';

const statusTabs = ['ALL', 'WAITING_FOR_APPROVAL', 'APPROVED', 'DECLINED'];

const statusLabels = {
  ALL: 'All',
  WAITING_FOR_APPROVAL: 'Waiting Approval',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
};

export default function AllEstimatesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { estimates, loading, onRefresh } = useBillingData();

  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let data = estimates;

    if (activeTab !== 'ALL') {
      data = data.filter(e => e.status === activeTab);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();

      data = data.filter(
        e =>
          e.appointment?.vehicle?.make?.toLowerCase().includes(term) ||
          e.appointment?.vehicle?.model?.toLowerCase().includes(term) ||
          e.appointment?.vehicle?.plateNumber?.toLowerCase().includes(term) ||
          e.appointment?.trackingNumber?.toLowerCase().includes(term)
      );
    }

    return data.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [estimates, activeTab, search]);

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-background items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ backgroundColor: theme.background }}
      edges={['top']}
    >
      <View className="px-4 pt-3 pb-3 bg-card border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full items-center justify-center"
            activeOpacity={0.75}
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>

          <View className="flex-1 ml-2">
            <Text
              className="text-xl font-bold"
              style={{ color: theme.text }}
            >
              All Estimates
            </Text>

            <Text
              className="text-sm mt-0.5"
              style={{ color: theme.textSecondary }}
            >
              Review and track every estimate.
            </Text>
          </View>

          <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center">
            <SlidersHorizontal size={19} color={theme.primary} />
          </View>
        </View>

        <View className="mt-3 h-[48px] rounded-xl bg-background border border-border flex-row items-center px-3">
          <Search size={18} color={theme.textSecondary} />

          <TextInput
            placeholder="Search by vehicle or appointment..."
            placeholderTextColor={`${theme.textSecondary}99`}
            value={search}
            onChangeText={setSearch}
            className="flex-1 px-2 text-sm"
            style={{ color: theme.text }}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              className="w-9 h-9 items-center justify-center"
              activeOpacity={0.75}
            >
              <X size={17} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="bg-card border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          {statusTabs.map(tab => {
            const isActive = activeTab === tab;
            const count =
              tab === 'ALL'
                ? estimates.length
                : estimates.filter(e => e.status === tab).length;

            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`min-h-[36px] px-4 rounded-full items-center justify-center mr-2 ${
                  isActive ? 'bg-primary' : 'bg-secondary'
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: isActive
                      ? '#FFFFFF'
                      : theme.text,
                  }}
                >
                  {statusLabels[tab]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 28,
        }}
      >
        {filtered.length === 0 ? (
          <View className="bg-card rounded-2xl p-7 border border-border items-center mt-2">
            <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
              <FileText size={25} color={theme.primary} />
            </View>

            <Text
              className="text-base font-semibold mt-4"
              style={{ color: theme.text }}
            >
              No estimates found
            </Text>

            <Text
              className="text-sm text-center mt-1 leading-5"
              style={{ color: theme.textSecondary }}
            >
              Try a different search term or status filter.
            </Text>
          </View>
        ) : (
          filtered.map(item => (
            <EstimateCard
              key={item.id}
              item={item}
              onPress={() =>
                router.push(`/tracking?appointmentId=${item.appointmentId}`)
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}