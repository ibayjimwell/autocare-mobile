import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useBillingData } from '../hooks/useBillingData';
import FinalBillCard from '../components/billing/FinalBillCard';

const statusTabs = ['ALL', 'OFFICIAL', 'PAID', 'PENDING', 'HOLD'];
const statusLabels = {
  ALL: 'All',
  OFFICIAL: 'Official',
  PAID: 'Paid',
  PENDING: 'Pending',
  HOLD: 'On Hold',
};

export default function AllFinalBillsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { finalBills, loading, onRefresh } = useBillingData();
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let data = finalBills;
    if (activeTab !== 'ALL') {
      data = data.filter(b => b.status === activeTab);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      data = data.filter(b =>
        b.appointment?.vehicle?.make?.toLowerCase().includes(term) ||
        b.appointment?.vehicle?.model?.toLowerCase().includes(term) ||
        b.appointment?.vehicle?.plateNumber?.toLowerCase().includes(term) ||
        b.appointment?.trackingNumber?.toLowerCase().includes(term) ||
        b.id?.toLowerCase().includes(term)
      );
    }
    return data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [finalBills, activeTab, search]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View className="px-6 pt-12 pb-4" style={{ backgroundColor: theme.surface }}>
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text className="text-xl font-black" style={{ color: theme.text }}>All Final Bills</Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center rounded-2xl px-3 border" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            placeholder="Search by vehicle or invoice..."
            placeholderTextColor={theme.textSecondary + '80'}
            value={search}
            onChangeText={setSearch}
            className="flex-1 py-3 px-2 text-sm"
            style={{ color: theme.text }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={{ backgroundColor: theme.surface, height: 48 }} className="px-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, alignItems: 'center' }}
          className="flex-1"
        >
          {statusTabs.map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === 'ALL' ? finalBills.length : finalBills.filter(b => b.status === tab).length;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full ${isActive ? 'bg-primary' : 'bg-muted/30'}`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {statusLabels[tab]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-6 pt-2 pb-20" showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View className="items-center mt-12">
            <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
            <Text className="mt-3 text-base font-bold" style={{ color: theme.textSecondary }}>
              No final bills found.
            </Text>
          </View>
        ) : (
          filtered.map(item => (
            <FinalBillCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/invoice/${item.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}