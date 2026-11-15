import React from 'react';
import { Text, View } from 'react-native';

import { getServiceStatusCard } from '../../utils/serviceStatusCard';

/**
 * Shown as its own card BELOW Live Service Journey while inspection/repair is
 * active. This is informational, not an alert and not a duplicate task list.
 * No additional API requests or subscriptions are created by this component.
 */
export default function ServiceStatusCard({ appointmentStatus, delayIndicator }) {
  const result = getServiceStatusCard(appointmentStatus, delayIndicator);
  if (!result) return null;

  return (
    <View
      className="mt-3 rounded-2xl border border-border bg-card p-4"
      accessible
      accessibilityLabel={`Service status. ${result.message}`}
      accessibilityLiveRegion="polite"
    >
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Service Status
      </Text>
      <Text className="text-base font-semibold leading-6 text-foreground">
        {result.message}
      </Text>
    </View>
  );
}
