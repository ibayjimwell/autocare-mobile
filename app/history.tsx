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
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CarFront,
  UserRound,
  CircleDot,
  CheckCircle2,
  Wrench,
  ClipboardCheck,
  FileCheck2,
  SearchCheck,
  CircleX,
  ChevronRight,
  History,
} from "lucide-react-native";
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

  return Array.from(map.entries()).sort((a, b) =>
    b[0].localeCompare(a[0])
  );
};

const statusIconMap: Record<string, any> = {
  PENDING: Clock3,
  CONFIRMED: CalendarDays,
  UNDER_INSPECTION: SearchCheck,
  WAITING_FOR_APPROVAL: FileCheck2,
  IN_PROGRESS: Wrench,
  COMPLETED: CheckCircle2,
  CANCELLED: CircleX,
};

const getStatusIcon = (status: string) => {
  return statusIconMap[status] || ClipboardCheck;
};

export default function HistoryScreen() {
  const { history, loading, error } = useAppointmentHistory();
  const grouped = groupHistory(history);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* iOS Header */}
      <View className="px-4 pt-3 pb-3 bg-card border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full items-center justify-center"
            activeOpacity={0.75}
          >
            <ArrowLeft size={21} color="#000000" />
          </TouchableOpacity>

          <View className="flex-1 ml-2">
            <Text className="text-xl font-bold tracking-tight text-foreground">
              Appointment History
            </Text>

            <Text className="text-sm mt-0.5 text-muted-foreground">
              Follow every change made to your appointments.
            </Text>
          </View>

          <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center">
            <History size={19} color="#C1272D" strokeWidth={2.1} />
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#C1272D" />

          <Text className="text-sm font-medium text-muted-foreground mt-3">
            Loading appointment history...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
            <History size={28} color="#C1272D" />
          </View>

          <Text className="text-lg font-semibold text-foreground mt-4 text-center">
            Unable to load history
          </Text>

          <Text className="text-sm text-muted-foreground text-center mt-1 leading-5">
            {error}
          </Text>
        </View>
      ) : grouped.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-card rounded-2xl border border-border p-7 items-center w-full">
            <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
              <CalendarDays size={25} color="#C1272D" />
            </View>

            <Text className="text-lg font-semibold text-foreground mt-4">
              No history found
            </Text>

            <Text className="text-sm text-muted-foreground text-center mt-1 leading-5">
              Appointment status changes will appear here as your service
              progresses.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 18,
            paddingBottom: 32,
          }}
        >
          {/* Timeline */}
          <View className="relative">
            {grouped.map(([date, appointmentsMap], dateIndex) => (
              <View
                key={date}
                className={dateIndex === grouped.length - 1 ? "" : "mb-8"}
              >
                {/* Date heading */}
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                    <CalendarDays size={16} color="#C1272D" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-lg font-bold tracking-tight text-foreground">
                      {format(parseISO(date), "MMMM d, yyyy")}
                    </Text>

                    <Text className="text-xs text-muted-foreground mt-0.5">
                      Appointment activity
                    </Text>
                  </View>
                </View>

                {Array.from(appointmentsMap.entries()).map(
                  ([appointmentId, entries], appointmentIndex) => {
                    const apptData = entries[0]?.appointment;

                    if (!apptData) return null;

                    const sorted = [...entries].sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    );

                    return (
                      <View
                        key={appointmentId}
                        className={
                          appointmentIndex === appointmentsMap.size - 1
                            ? ""
                            : "mb-5"
                        }
                      >
                        {/* Timeline marker + appointment card */}
                        <View className="flex-row">
                          {/* Timeline rail */}
                          <View className="w-10 items-center">
                            <View className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 items-center justify-center z-10">
                              <CarFront
                                size={17}
                                color="#C1272D"
                                strokeWidth={2}
                              />
                            </View>

                            {appointmentIndex <
                              appointmentsMap.size - 1 && (
                              <View className="absolute top-9 bottom-[-20px] w-px bg-primary/20" />
                            )}
                          </View>

                          {/* Appointment card */}
                          <View className="flex-1 ml-2">
                            <View className="bg-card rounded-xl border border-border overflow-hidden">
                              {/* Card header */}
                              <View className="p-4">
                                <View className="flex-row items-start justify-between">
                                  <View className="flex-1 pr-3">
                                    <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-primary">
                                      Appointment
                                    </Text>

                                    <Text
                                      className="text-base font-semibold text-foreground mt-1"
                                      numberOfLines={2}
                                    >
                                      {apptData.vehicle?.make}{" "}
                                      {apptData.vehicle?.model}
                                    </Text>

                                    <Text className="text-xs text-muted-foreground mt-1">
                                      {apptData.vehicle?.plateNumber || "No plate"}{" "}
                                      • #{apptData.trackingNumber || "N/A"}
                                    </Text>
                                  </View>

                                  <View className="w-9 h-9 rounded-full bg-background items-center justify-center">
                                    <ChevronRight
                                      size={18}
                                      color="#8E8E93"
                                    />
                                  </View>
                                </View>

                                {/* Appointment metadata */}
                                <View className="mt-4 rounded-xl bg-background overflow-hidden">
                                  <View className="flex-row items-center min-h-[48px] px-3 border-b border-border">
                                    <CalendarDays
                                      size={16}
                                      color="#8E8E93"
                                    />

                                    <View className="flex-1 ml-3">
                                      <Text className="text-xs text-muted-foreground">
                                        Scheduled
                                      </Text>

                                      <Text className="text-sm font-medium text-foreground mt-0.5">
                                        {format(
                                          parseISO(
                                            apptData.appointmentDate
                                          ),
                                          "MMM d, yyyy"
                                        )}
                                      </Text>
                                    </View>
                                  </View>

                                  <View className="flex-row items-center min-h-[48px] px-3">
                                    <Clock3
                                      size={16}
                                      color="#8E8E93"
                                    />

                                    <View className="flex-1 ml-3">
                                      <Text className="text-xs text-muted-foreground">
                                        Time
                                      </Text>

                                      <Text className="text-sm font-medium text-foreground mt-0.5">
                                        {apptData.appointmentTime}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>

                              {/* Status history */}
                              <View className="border-t border-border">
                                <View className="px-4 py-3">
                                  <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                                    Status Timeline
                                  </Text>
                                </View>

                                <View className="px-4 pb-4">
                                  {sorted.map((entry, entryIndex) => {
                                    const StatusIcon = getStatusIcon(
                                      entry.toStatus
                                    );

                                    const isLast =
                                      entryIndex === sorted.length - 1;

                                    return (
                                      <View
                                        key={entry.id}
                                        className="flex-row"
                                      >
                                        {/* Timeline */}
                                        <View className="w-8 items-center">
                                          <View
                                            className={`w-8 h-8 rounded-full items-center justify-center ${
                                              isLast
                                                ? "bg-primary"
                                                : "bg-background border border-border"
                                            }`}
                                          >
                                            <StatusIcon
                                              size={15}
                                              color={
                                                isLast
                                                  ? "#FFFFFF"
                                                  : "#8E8E93"
                                              }
                                              strokeWidth={2}
                                            />
                                          </View>

                                          {!isLast && (
                                            <View className="w-px flex-1 bg-border my-1" />
                                          )}
                                        </View>

                                        {/* Timeline event */}
                                        <View className="flex-1 ml-3 pb-3">
                                          <View className="flex-row items-center justify-between">
                                            <View className="flex-1 pr-2">
                                              <Text className="text-sm font-semibold text-foreground">
                                                {entry.toStatus}
                                              </Text>

                                              {entry.fromStatus && (
                                                <Text className="text-xs text-muted-foreground mt-0.5">
                                                  From {entry.fromStatus}
                                                </Text>
                                              )}
                                            </View>

                                            <View className="flex-row items-center">
                                              <Clock3
                                                size={12}
                                                color="#8E8E93"
                                              />

                                              <Text className="text-[11px] text-muted-foreground ml-1">
                                                {format(
                                                  parseISO(entry.createdAt),
                                                  "h:mm a"
                                                )}
                                              </Text>
                                            </View>
                                          </View>

                                          {entry.staff && (
                                            <View className="flex-row items-center mt-2">
                                              <UserRound
                                                size={12}
                                                color="#8E8E93"
                                              />

                                              <Text className="text-[11px] text-muted-foreground ml-1">
                                                Updated by{" "}
                                                {entry.staff.fullname}
                                              </Text>
                                            </View>
                                          )}
                                        </View>
                                      </View>
                                    );
                                  })}
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  }
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}