import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, X, ReceiptText, ChevronDown, ChevronUp, CheckCircle2, Wallet, Clock3 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useBillingData } from '../hooks/useBillingData';
import FinalBillCard from '../components/billing/FinalBillCard';

const statusTabs = ['ALL', 'OFFICIAL', 'PENDING', 'PARKED', 'HOLD'];
const statusLabels = { ALL: 'All unpaid', OFFICIAL: 'Official', PENDING: 'Pending', PARKED: 'Parked', HOLD: 'On Hold' };
const priority = { OFFICIAL: 0, PENDING: 1, PARKED: 2, HOLD: 2, PAID: 3 };

export default function AllFinalBillsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { finalBills, loading, refreshing, onRefresh } = useBillingData();
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showPaid, setShowPaid] = useState(false);

  const { unpaid, paid } = useMemo(() => {
    const text = search.trim().toLowerCase();
    const matches = [...finalBills].filter(bill => {
      if (!text) return true;
      return [bill.id, bill.appointment?.trackingNumber,
        bill.appointment?.vehicle?.make, bill.appointment?.vehicle?.model,
        bill.appointment?.vehicle?.plateNumber, bill.appointment?.customer?.fullname,
      ].some(value => String(value ?? '').toLowerCase().includes(text));
    }).sort((a, b) => {
      const left = priority[String(a.status).toUpperCase()] ?? 99;
      const right = priority[String(b.status).toUpperCase()] ?? 99;
      if (left !== right) return left - right;
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
    return {
      unpaid: matches.filter(b => b.status !== 'PAID' && (activeTab === 'ALL' || b.status === activeTab)),
      paid: matches.filter(b => b.status === 'PAID'),
    };
  }, [finalBills, activeTab, search]);

  if (loading) return <SafeAreaView className="flex-1 bg-background items-center justify-center" style={{ backgroundColor: theme.background }}>
    <ActivityIndicator size="large" color={theme.primary} />
    <Text className="text-sm mt-3 text-muted-foreground">Loading Final Costs…</Text>
  </SafeAreaView>;

  const renderBill = item => <FinalBillCard key={item.id} item={item} onPress={() => router.push(`/invoice/${item.id}`)} />;

  return <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: theme.background }} edges={['top']}>
    <View className="px-4 pt-3 pb-3 bg-card border-b border-border">
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full items-center justify-center" accessibilityLabel="Back">
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-xl font-bold" style={{ color: theme.text }}>Final Costs</Text>
          <Text className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>Official bills first. Paid bills are archived below.</Text>
        </View>
        <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center"><Wallet size={19} color={theme.primary}/></View>
      </View>
      <View className="mt-3 h-[48px] rounded-xl bg-background border border-border flex-row items-center px-3">
        <Search size={18} color={theme.textSecondary} />
        <TextInput placeholder="Search vehicle or tracking number…" placeholderTextColor={`${theme.textSecondary}99`}
          value={search} onChangeText={setSearch} className="flex-1 px-2 text-sm" style={{ color: theme.text }} returnKeyType="search" />
        {search ? <TouchableOpacity onPress={() => setSearch('')} className="w-9 h-9 items-center justify-center"><X size={17} color={theme.textSecondary}/></TouchableOpacity> : null}
      </View>
    </View>

    <View className="bg-card border-b border-border">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        {statusTabs.map(tab => {
          const selected = activeTab === tab;
          const count = finalBills.filter(b => (tab === 'ALL' ? b.status !== 'PAID' : b.status === tab)).length;
          return <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            className={`min-h-[38px] px-4 rounded-full items-center justify-center mr-2 ${selected ? 'bg-primary' : 'bg-secondary'}`}>
            <Text className="text-xs font-semibold" style={{ color: selected ? '#FFFFFF' : theme.text }}>
              {statusLabels[tab]} ({count})
            </Text>
          </TouchableOpacity>;
        })}
      </ScrollView>
    </View>

    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 36 }}>
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center"><Clock3 size={17} color={theme.primary}/><Text className="ml-2 text-base font-bold" style={{ color: theme.text }}>Active Final Costs</Text></View>
        <Text className="text-xs font-bold text-primary">{unpaid.length} showing</Text>
      </View>
      {unpaid.length > 0 ? unpaid.map(renderBill) : <View className="bg-card rounded-2xl border border-border p-7 items-center mb-4">
        <ReceiptText size={28} color={theme.primary}/><Text className="font-semibold mt-4" style={{ color: theme.text }}>No active Final Costs</Text>
        <Text className="text-xs text-center mt-2" style={{ color: theme.textSecondary }}>Change the filter or refresh to see your latest bill.</Text>
      </View>}

      {activeTab === 'ALL' ? <View className="mt-5 mb-2 rounded-2xl overflow-hidden border border-border bg-card">
        <TouchableOpacity onPress={() => setShowPaid(p => !p)} activeOpacity={0.8} className="flex-row items-center px-4 py-4">
          <View className="w-11 h-11 rounded-xl bg-emerald-50 items-center justify-center"><CheckCircle2 size={22} color="#15803d"/></View>
          <View className="flex-1 ml-3"><Text className="font-bold" style={{ color: theme.text }}>Paid Final Costs</Text>
            <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>{paid.length} completed payment{paid.length === 1 ? '' : 's'} · Tap to {showPaid ? 'hide' : 'view'}</Text></View>
          {showPaid ? <ChevronUp size={20} color={theme.textSecondary}/> : <ChevronDown size={20} color={theme.textSecondary}/>}
        </TouchableOpacity>
        {showPaid ? <View className="border-t border-border p-3">
          {paid.length ? paid.map(renderBill) : <Text className="text-sm text-center p-5" style={{ color: theme.textSecondary }}>No paid bills match your search.</Text>}
        </View> : null}
      </View> : null}
    </ScrollView>
  </SafeAreaView>;
}
