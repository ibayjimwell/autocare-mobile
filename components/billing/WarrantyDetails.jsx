import React from 'react';
import { View, Text } from 'react-native';

/** Shared read-only warranty presentation for Estimate, Final Cost and digital receipts. */
export default function WarrantyDetails({ warranties, compact = false }) {
  const items = Array.isArray(warranties) ? warranties : [];
  return (
    <View className="px-4 py-4 border-t border-border">
      <Text className="text-base font-semibold text-foreground mb-2">Service Warranty</Text>
      {!items.length ? (
        <Text className="text-xs text-muted-foreground">No warranty attached.</Text>
      ) : items.map((w, index) => (
        <View key={w.id || index} className="rounded-xl border border-border bg-background p-3 mb-3">
          <Text className="text-sm font-bold text-foreground">{w.title} ({w.coverageType})</Text>
          <Text className="text-xs text-muted-foreground mt-1">Provider: {w.provider}</Text>
          <Text className="text-xs text-muted-foreground">{w.startDate} to {w.endDate}</Text>
          <Text className="text-xs text-foreground mt-2">Coverage: {w.coverage}</Text>
          <Text className="text-xs text-foreground mt-1">Inventory parts: {(w.parts || []).map(p => p.partName).join(', ') || 'None'}</Text>
          <Text className="text-xs text-foreground mt-2">Terms: {w.terms}</Text>
          <Text className="text-xs text-foreground mt-1">Exclusions: {w.exclusions || 'None'}</Text>
          <Text className="text-xs text-foreground mt-1">How to claim: {w.claimInstructions}</Text>
          <Text className="text-xs text-foreground mt-1">Contact: {w.contact || 'Contact AutoCare'}</Text>
        </View>
      ))}
    </View>
  );
}
