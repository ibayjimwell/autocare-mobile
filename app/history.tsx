import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Link } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { format, parseISO } from "date-fns";
import { useAppointmentHistory } from "../hooks/useAppointmentHistory";

const groupHistory = (history: any[]) => {
  const map = new Map<string, Map<string, any[]>>();
  for (const entry of history) {
    const date = format(parseISO(entry.createdAt), "yyyy-MM-dd");
    if (!map.has(date)) map.set(date, new Map());
    const dayMap = map.get(date)!;
    const apptId = entry.appointmentId;
    if (!dayMap.has(apptId)) dayMap.set(apptId, []);
    dayMap.get(apptId)!.push(entry);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
};

export default function HistoryScreen() {
  const { history, loading, error } = useAppointmentHistory();
  const grouped = groupHistory(history);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2 flex-row items-center border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-heading font-bold text-foreground ml-2">
          Appointment History
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#C1272D" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-center text-muted-foreground">{error}</Text>
        </View>
      ) : grouped.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-center text-muted-foreground">No history found.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {grouped.map(([date, appointmentsMap]) => (
            <View key={date} className="mb-8">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="flex-1 h-px bg-slate-200" />
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {format(parseISO(date), "MMMM d, yyyy")}
                </Text>
                <View className="flex-1 h-px bg-slate-200" />
              </View>

              {Array.from(appointmentsMap.entries()).map(([appointmentId, entries]) => {
                const apptData = entries[0]?.appointment;
                if (!apptData) return null;
                const sorted = [...entries].sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                return (
                  <View
                    key={appointmentId}
                    className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-sm"
                  >
                    <View className="mb-2">
                      <Text className="font-bold text-base">
                        {apptData.vehicle?.make} {apptData.vehicle?.model}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {apptData.vehicle?.plateNumber} • {apptData.trackingNumber}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(apptData.appointmentDate), "MMM d, yyyy")} at{" "}
                        {apptData.appointmentTime}
                      </Text>
                    </View>

                    <View className="ml-2 pl-4 border-l-2 border-slate-200 space-y-2">
                      {sorted.map((entry) => (
                        <View key={entry.id} className="flex-row items-start gap-2">
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
                                {format(parseISO(entry.createdAt), "h:mm a")}
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
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}