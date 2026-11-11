import { Redirect, useLocalSearchParams } from 'expo-router';

// Retired: scanning a cashier QR must not be part of the cash flow.
// Keep this route as a safe redirect for previously installed app links.
export default function RetiredCounterScan() {
  const { billId: rawBillId } = useLocalSearchParams();
  const billId = Array.isArray(rawBillId) ? rawBillId[0] : rawBillId;
  return <Redirect href={billId ? `/invoice/${encodeURIComponent(billId)}` : '/final-bills'} />;
}
