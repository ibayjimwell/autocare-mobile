import React from "react";
import { View, Text } from "react-native";
import { format } from "date-fns";

interface HistoryEntry {
  id: string;
  appointmentId: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
  appointment: any;
  staff?: { fullname: string } | null;
}

interface RecentHistoryProps {
  history: HistoryEntry[];
  loading?: boolean;
  error?: string | null;
}

// Helper to get the latest appointment entry
const getLatestAppointment = (history: HistoryEntry[]) => {
  if (!history || history.length === 0) return null;

  const groups: Record<string, HistoryEntry[]> = {};
  for (const entry of history) {
    if (!groups[entry.appointmentId]) groups[entry.appointmentId] = [];
    groups[entry.appointmentId].push(entry);
  }

  let latestApptId = null;
  let latestDate = null;
  for (const [apptId, entries] of Object.entries(groups)) {
    const lastEntry = entries.reduce((a, b) =>
      new Date(a.createdAt) > new Date(b.createdAt) ? a : b
    );
    if (!latestDate || new Date(lastEntry.createdAt) > new Date(latestDate)) {
      latestDate = lastEntry.createdAt;
      latestApptId = apptId;
    }
  }

  if (!latestApptId) return null;
  const entries = groups[latestApptId].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const appointment = entries[0]?.appointment;
  return { appointment, entries };
};

export default function RecentHistory({ history, loading, error }: RecentHistoryProps) {
  if (loading) {
    return (
      <View className="py-6 items-center">
        <Text className="text-sm text-muted-foreground">Loading history...</Text>
      </View>
    );
  }

  if (error || !history || history.length === 0) {
    return (
      <View className="bg-muted/20 rounded-2xl p-6 items-center">
        <Text className="text-sm text-muted-foreground">No recent activity</Text>
      </View>
    );
  }

  const latest = getLatestAppointment(history);
  if (!latest) {
    return (
      <View className="bg-muted/20 rounded-2xl p-6 items-center">
        <Text className="text-sm text-muted-foreground">No recent activity</Text>
      </View>
    );
  }

  const { appointment, entries } = latest;

  return (
    <View className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      {/* Appointment summary */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-bold text-base">
          {appointment?.vehicle?.make} {appointment?.vehicle?.model}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {format(new Date(appointment?.appointmentDate), "MMM d, yyyy")}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground mb-2">
        {appointment?.trackingNumber}
      </Text>

      {/* Timeline */}
      <View className="ml-2 pl-4 border-l-2 border-slate-200">
        {entries.map((entry, idx) => (
          <View key={entry.id} className="flex-row items-start gap-2 py-1">
            <View className="w-2 h-2 rounded-full bg-primary mt-1.5 -ml-1.5" />
            <View className="flex-1">
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="text-xs font-bold uppercase">
                  {entry.toStatus}
                </Text>
                {entry.fromStatus && (
                  <Text className="text-[10px] text-muted-foreground">
                    from {entry.fromStatus}
                  </Text>
                )}
                <Text className="text-[10px] text-muted-foreground">
                  {format(new Date(entry.createdAt), "h:mm a")}
                </Text>
              </View>
              {entry.staff && (
                <Text className="text-[10px] text-muted-foreground">
                  by {entry.staff.fullname}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}