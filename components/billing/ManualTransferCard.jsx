import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Landmark, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import manualTransferApi from '../../services/manualTransferApi';
import { useTheme } from '../../context/ThemeContext';

const money = amount => `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Payments are not confirmed until a cashier verifies actual funds. */
export default function ManualTransferCard({ billId }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [expanded, setExpanded] = useState(false);

  const refresh = useCallback(async () => {
    if (!billId) return;
    try {
      const payload = await manualTransferApi.get(billId);
      setInfo(payload.data);
      setError('');
    } catch (e) { setError(e.message || 'Unable to load transfer details.'); }
    finally { setLoading(false); }
  }, [billId]);
  useEffect(() => { void refresh(); }, [refresh]);
  const latest = info?.submissions?.[0];
  const isWaiting = latest?.status === 'PENDING_REVIEW' || latest?.status === 'VERIFYING';
  useEffect(() => {
    if (!isWaiting) return;
    const timer = setInterval(() => { void refresh(); }, 15000);
    return () => clearInterval(timer);
  }, [isWaiting, refresh]);

  const destinations = info?.destinations || [];
  const chosen = destinations.find(d => d.method === method) || destinations[0];
  const submit = async () => {
    if (!chosen || saving) return;
    if (!/^[A-Za-z0-9][A-Za-z0-9\- ]{5,79}$/.test(referenceNumber.trim())) {
      Alert.alert('Transaction reference required', 'Enter the real transaction/reference number after sending the exact payment.'); return;
    }
    Alert.alert('Confirm transfer was sent',
      `Did you already send ${money(info.amount)} to ${chosen.name} (${chosen.account}) using ${chosen.method}? Submitting this form does NOT pay the bill.`, [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Yes, submit reference', onPress: async () => {
        setSaving(true);
        try {
          await manualTransferApi.submit(billId, { method: chosen.method, referenceNumber: referenceNumber.trim(), senderName: senderName.trim() });
          setExpanded(false); setReferenceNumber(''); setSenderName('');
          await refresh();
          Alert.alert('Submitted for verification', 'A cashier must see the funds in AutoCare’s receiving account before your bill is marked paid.');
        } catch (e) { Alert.alert('Submission not accepted', e.message || 'Please contact the cashier.'); }
        finally { setSaving(false); }
      } },
    ]);
  };

  return <View className="bg-card rounded-2xl border border-border p-4 mb-3">
    <View className="flex-row items-center">
      <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3"><Landmark size={21} color={theme.primary} /></View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">GCash / Maya / bank transfer</Text>
        <Text className="text-xs text-muted-foreground mt-1">Transfer in your banking app, then submit the reference for cashier verification.</Text>
      </View>
      <TouchableOpacity onPress={() => void refresh()} className="p-2 min-w-[44px] min-h-[44px] items-center justify-center" accessibilityLabel="Refresh transfer status"><RefreshCw size={18} color={theme.textSecondary} /></TouchableOpacity>
    </View>
    {loading ? <ActivityIndicator color={theme.primary} className="mt-3" /> : null}
    {error ? <Text className="mt-3 text-xs text-red-600">{error}</Text> : null}
    {info?.billStatus === 'PAID' ? <View className="mt-3 p-3 bg-green-50 rounded-xl">
      <View className="flex-row items-center"><CheckCircle2 color="#15803d" size={18} /><Text className="text-green-800 font-semibold ml-2">Payment confirmed</Text></View>
      <TouchableOpacity className="mt-2 min-h-[44px] justify-center" onPress={() => router.push(`/receipt/${billId}`)}><Text className="text-green-800 font-semibold">View Receipt</Text></TouchableOpacity>
    </View> : null}
    {isWaiting ? <View className="mt-3 p-3 bg-amber-50 rounded-xl">
      <Text className="text-amber-900 font-semibold">Awaiting cashier verification</Text>
      <Text className="text-amber-800 text-xs mt-1">{latest.method} • Ref: {latest.referenceNumber}</Text>
      <Text className="text-amber-800 text-xs mt-1">Do not pay again until staff check the receiving account.</Text>
    </View> : null}
    {latest?.status === 'REJECTED' ? <View className="mt-3 rounded-xl bg-red-50 p-3">
      <Text className="text-red-800 font-semibold">Transfer not verified</Text>
      <Text className="text-red-700 text-xs mt-1">{latest.reviewMessage || 'Contact the cashier before retrying.'}</Text>
    </View> : null}
    {!isWaiting && info?.billStatus === 'OFFICIAL' && destinations.length > 0 ? <>
      {!expanded ? <TouchableOpacity onPress={() => setExpanded(true)} className="mt-3 bg-primary rounded-xl min-h-[48px] items-center justify-center">
        <Text className="text-white font-semibold">View transfer instructions</Text>
      </TouchableOpacity> : <View className="mt-3">
        <Text className="text-xs text-muted-foreground mb-2">Choose an AutoCare receiving account</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">{destinations.map(d => <TouchableOpacity key={d.method} onPress={() => setMethod(d.method)}
          className={`border rounded-xl px-4 py-3 min-h-[44px] ${chosen?.method === d.method ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
          <Text className="text-foreground font-semibold">{d.method === 'BANK' ? (d.bankName || 'Bank') : d.method}</Text>
        </TouchableOpacity>)}</View>
        {chosen ? <View className="rounded-xl bg-secondary p-4 mb-3">
          <Text className="text-muted-foreground text-xs">Send exactly</Text>
          <Text className="text-foreground font-bold text-2xl mt-1">{money(info.amount)}</Text>
          <Text className="text-foreground font-semibold mt-3">{chosen.name}</Text>
          <Text className="text-foreground mt-1">{chosen.bankName ? `${chosen.bankName} • ` : ''}{chosen.account}</Text>
          <Text className="text-xs text-muted-foreground mt-2">Open your GCash, Maya or bank app and send the money there. Fees, if any, are charged separately by your provider.</Text>
        </View> : null}
        <Text className="text-sm font-medium text-foreground mb-1">Transaction/reference number *</Text>
        <TextInput className="border border-border rounded-xl bg-background px-3 h-12 text-foreground mb-3" placeholder="From your completed transfer" placeholderTextColor={theme.textSecondary}
          autoCapitalize="characters" value={referenceNumber} onChangeText={setReferenceNumber} maxLength={80} />
        <Text className="text-sm font-medium text-foreground mb-1">Sender account name (optional)</Text>
        <TextInput className="border border-border rounded-xl bg-background px-3 h-12 text-foreground mb-3" placeholder="For matching the transfer"
          placeholderTextColor={theme.textSecondary} value={senderName} onChangeText={setSenderName} maxLength={120} />
        <View className="flex-row items-start mb-3"><ShieldCheck size={16} color={theme.textSecondary} />
          <Text className="text-xs text-muted-foreground ml-2 flex-1">The screenshot/reference is not proof of cleared funds. Your bill stays unpaid until cashier confirmation. Keep your original transaction receipt.</Text>
        </View>
        <TouchableOpacity onPress={() => void submit()} disabled={saving} className="bg-primary rounded-xl min-h-[50px] items-center justify-center">
          {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">I already transferred — submit reference</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setExpanded(false)} className="min-h-[44px] items-center justify-center"><Text className="text-muted-foreground">Cancel</Text></TouchableOpacity>
      </View>}
    </> : null}
    {!loading && info?.billStatus === 'OFFICIAL' && destinations.length === 0 ?
      <Text className="text-xs text-muted-foreground mt-3">Electronic transfer destinations are not configured yet. Pay at the counter for now.</Text> : null}
  </View>;
}
