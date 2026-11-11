import { Redirect, useLocalSearchParams } from 'expo-router';

// Retired: customer cash payments are completed at the cashier without QR scanning.
export default function RetiredCashQr() {
  const { billId: rawBillId } = useLocalSearchParams();
  const billId = Array.isArray(rawBillId) ? rawBillId[0] : rawBillId;
  return <Redirect href={billId ? `/invoice/${encodeURIComponent(billId)}` : '/final-bills'} />;
}
