// components/receipt/ReceiptContent.jsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// Local currency formatter
const formatCurrency = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function ReceiptContent({ receipt }) {
  const { theme } = useTheme();

  if (!receipt) return null;

  const { referenceNumber, createdAt, details } = receipt;
  const { customer, vehicle, appointment, services, inspection, estimate, finalBill, payment } = details || {};

  const paidDate = payment?.paidAt
    ? new Date(payment.paidAt).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(createdAt).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const paidTime = payment?.paidAt
    ? new Date(payment.paidAt).toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View
        style={{
          marginHorizontal: 16,
          marginVertical: 32,
          padding: 24,
          backgroundColor: '#FFFEF9',
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '900', letterSpacing: 4, color: theme.primary }}>
            AUTO<Text style={{ color: theme.text }}>CARE</Text>
          </Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary, marginTop: 4 }}>
            by AutoProTech
          </Text>
          <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
            Official Receipt
          </Text>
        </View>

        {/* Dashed line */}
        <View style={{ borderBottomWidth: 1, borderStyle: 'dashed', borderColor: theme.border, marginBottom: 16 }} />

        {/* Receipt meta */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: theme.textSecondary }}>Receipt #</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.text }}>{referenceNumber}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: theme.textSecondary }}>Date Paid</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.text }}>
              {paidDate} {paidTime}
            </Text>
          </View>
        </View>

        {/* Customer & Vehicle */}
        {customer && (
          <View style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: theme.muted + '30' }}>
            <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: 4 }}>
              Bill To
            </Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.text }}>{customer.fullname}</Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>{customer.email} | {customer.phone}</Text>
            {vehicle && (
              <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>
                {vehicle.make} {vehicle.model} ({vehicle.year}) • Plate: {vehicle.plateNumber}
              </Text>
            )}
            {appointment && (
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                Appointment: {appointment.trackingNumber} – {appointment.appointmentDate} {appointment.appointmentTime}
              </Text>
            )}
          </View>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: 8 }}>
              Services
            </Text>
            {services.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ fontSize: 14, flex: 1, color: theme.text }}>{s.name}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.text }}>₱{formatCurrency(s.basePrice)}</Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>Service Subtotal</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>₱{formatCurrency(finalBill?.serviceSubtotal)}</Text>
            </View>
          </View>
        )}

        {/* Inspection Findings */}
        {inspection?.findings && inspection.findings.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: 8 }}>
              Inspection Findings
            </Text>
            {inspection.findings.map((f, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>• {f.description}</Text>
                {f.parts && f.parts.map((p, j) => (
                  <View key={j} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 16, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                      {p.quantity}x {p.partName} {p.isPms ? '(PMS)' : ''}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>
                      ₱{p.isPms ? '0.00' : formatCurrency(p.totalPrice)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>Findings Subtotal</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>₱{formatCurrency(finalBill?.findingsSubtotal)}</Text>
            </View>
          </View>
        )}

        {/* Work Tasks */}
        {finalBill?.workTasks && finalBill.workTasks.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: 8 }}>
              Completed Work Tasks
            </Text>
            {finalBill.workTasks.map((t, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ fontSize: 14, flex: 1, color: theme.text }}>{t.title}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.text }}>—</Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>Work Tasks Subtotal</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>₱{formatCurrency(finalBill?.workTasksSubtotal)}</Text>
            </View>
          </View>
        )}

        {/* Fees */}
        {finalBill?.fees && finalBill.fees.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: 8 }}>
              Additional Fees
            </Text>
            {finalBill.fees.map((f, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ fontSize: 14, flex: 1, color: theme.text }}>{f.title}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.text }}>₱{formatCurrency(f.amount)}</Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>Fees Total</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>₱{formatCurrency(finalBill?.feesTotal)}</Text>
            </View>
          </View>
        )}

        {/* Discounts */}
        {finalBill?.discounts && finalBill.discounts.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: 8 }}>
              Discounts
            </Text>
            {finalBill.discounts.map((d, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ fontSize: 14, flex: 1, color: theme.text }}>
                  {d.title} ({d.type === 'fixed' ? 'Fixed' : 'Percentage'})
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'red' }}>−₱{formatCurrency(d.amount)}</Text>
              </View>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.text }}>Discount Total</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'red' }}>−₱{formatCurrency(finalBill?.discountTotal)}</Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: theme.border, paddingTop: 16, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text }}>TOTAL</Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: theme.primary }}>₱{formatCurrency(finalBill?.grandTotal)}</Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.textSecondary }}>
            Amount Paid: ₱{formatCurrency(payment?.totalAmount)}
          </Text>
          {payment?.paidAt && (
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>
              Paid on {paidDate} at {paidTime}
            </Text>
          )}
        </View>

        {/* Notes */}
        {appointment?.notes && (
          <View style={{ marginTop: 16, padding: 8, borderRadius: 4, backgroundColor: theme.muted + '30' }}>
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>Notes: {appointment.notes}</Text>
          </View>
        )}

        {/* Zigzag separator (tear line) */}
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <Text style={{ fontSize: 12, color: theme.border, lineHeight: 12, letterSpacing: 2 }}>
            {'▲▼'.repeat(19)}
          </Text>
        </View>

        {/* Thank you */}
        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textSecondary, marginTop: 4 }}>
            Thank you for your business!
          </Text>
          <Text style={{ fontSize: 10, color: theme.textSecondary, marginTop: 4 }}>
            This is an electronic receipt.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}