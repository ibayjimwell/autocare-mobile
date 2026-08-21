import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  AlertCircle,
  ChevronRight,
  FileText,
  ReceiptText,
} from 'lucide-react-native';

import { useTrackingData } from '../hooks/useTrackingData';
import { useQueue } from '../hooks/useQueue';
import { statusToStage } from '../utils/constants';
import TrackingHeader from '../components/tracking/TrackingHeader';
import VehicleInfoCard from '../components/tracking/VehicleInfoCard';
import TaskList from '../components/tracking/TaskList';
import CostingSummary from '../components/tracking/CostingSummary';
import ProgressTimeline from '../components/tracking/ProgressTimeline';
import CancellationNote from '../components/tracking/CancellationNote';
import QueueSection from '../components/tracking/QueueSection';
import { ApproveModal, RejectModal } from '../components/tracking/EstimateModals';
import estimateApi from '../services/estimateApi';

export default function TrackingScreen() {
  const { appointmentId } = useLocalSearchParams();
  const {
    appointment,
    tasks,
    estimate,
    finalBill,
    loading,
    refreshing,
    onRefresh,
    refreshAll,
  } = useTrackingData(appointmentId);

  // Queue data – only fetch if appointment is CONFIRMED and has appointmentDate
  const appointmentDate = appointment?.appointmentDate;
  const isConfirmed = appointment?.status === 'CONFIRMED';
  const { queue, loading: queueLoading, error: queueError } = useQueue(
    isConfirmed ? appointmentDate : null,
    appointmentId
  );

  const [excludedFindingIds, setExcludedFindingIds] = useState([]);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const currentStage = statusToStage[appointment?.status] ?? 0;
  const isWaitingForApproval = appointment?.status === 'WAITING_FOR_APPROVAL';
  const isInProgress = appointment?.status === 'IN_PROGRESS';
  const isCancelled = appointment?.status === 'CANCELLED';

  // --- GRAND TOTAL: use estimate.grandTotal as source of truth ---
  // Only fallback to computed if estimate is null or missing grandTotal
  let grandTotal = 0;
  if (estimate?.grandTotal !== undefined && estimate?.grandTotal !== null) {
    grandTotal = parseFloat(estimate.grandTotal) || 0;
  } else {
    // Fallback: compute from components (tasks and estimate fields)
    const servicePrice = parseFloat(estimate?.serviceSubtotal) || 0;
    const partsTotal = tasks
      .filter(t => t.status === 'DONE' && t.findings)
      .reduce((sum, task) => {
        return sum + (task.findings || []).reduce((s, f) => {
          return s + (f.products || []).reduce(
            (ps, p) => ps + (p.quantity || 1) * (parseFloat(p.priceAtTime) || 0),
            0
          );
        }, 0);
      }, 0);
    const laborTotal = parseFloat(estimate?.feesTotal) || 0;
    const discountTotal = parseFloat(estimate?.discountTotal) || 0;
    grandTotal = (servicePrice + partsTotal + laborTotal) - discountTotal;
  }

  // Keep these for display in CostingSummary fallback (if estimate missing)
  const servicePrice = parseFloat(estimate?.serviceSubtotal) || 0;
  const partsTotal = tasks
    .filter(t => t.status === 'DONE' && t.findings)
    .reduce((sum, task) => {
      return sum + (task.findings || []).reduce((s, f) => {
        return s + (f.products || []).reduce(
          (ps, p) => ps + (p.quantity || 1) * (parseFloat(p.priceAtTime) || 0),
          0
        );
      }, 0);
    }, 0);
  const laborTotal = parseFloat(estimate?.feesTotal) || 0;
  const discountTotal = parseFloat(estimate?.discountTotal) || 0;

  const finalBillGrandTotal = finalBill
    ? parseFloat(finalBill.grandTotal)
    : null;

  const toggleExclude = (id) => {
    setExcludedFindingIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const confirmApprove = async () => {
    if (!estimate) return;
    setApproveModalVisible(false);
    setActionLoading(true);

    try {
      await estimateApi.approve(estimate.id);
      Alert.alert('Approved!', 'Work is now in progress.');
      await refreshAll();
    } catch (err) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || err.message || 'Failed to approve'
      );
      await refreshAll();
    } finally {
      setActionLoading(false);
    }
  };

  const submitRejection = async () => {
    if (!rejectReason.trim() || !estimate) return;
    setRejectModalVisible(false);
    setActionLoading(true);

    try {
      await estimateApi.decline(estimate.id, rejectReason.trim());
      Alert.alert('Rejected', 'Appointment cancelled.');
      await refreshAll();
    } catch (err) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || err.message || 'Failed to reject'
      );
    } finally {
      setActionLoading(false);
      setRejectReason('');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <View className="w-16 h-16 rounded-2xl bg-card items-center justify-center shadow-sm">
          <ActivityIndicator size="small" color="#C1272D" />
        </View>
        <Text className="mt-4 text-sm text-muted-foreground">
          Loading appointment…
        </Text>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-4">
        <View className="w-20 h-20 rounded-3xl bg-card items-center justify-center">
          <AlertCircle size={34} color="#C1272D" strokeWidth={1.8} />
        </View>

        <Text className="mt-5 text-xl font-bold text-foreground">
          Appointment not found
        </Text>

        <Text className="mt-2 text-sm text-muted-foreground text-center">
          We could not load the appointment details.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C1272D"
            colors={['#C1272D']}
          />
        }
      >
        <View className="px-4 pt-2">
          <TrackingHeader appointment={appointment} />
          <VehicleInfoCard appointment={appointment} />

          {/* Queue Section – only for CONFIRMED appointments */}
          {isConfirmed && (
            <QueueSection
              queue={queue}
              loading={queueLoading}
              error={queueError}
              appointmentId={appointmentId}
            />
          )}

          {/* Tasks always visible for relevant statuses */}
          {[
            'UNDER_INSPECTION',
            'WAITING_FOR_APPROVAL',
            'IN_PROGRESS',
            'COMPLETED',
          ].includes(appointment.status) && (
            <TaskList
              tasks={tasks}
              excludedFindingIds={excludedFindingIds}
              onToggleExclude={toggleExclude}
              isWaitingForApproval={isWaitingForApproval}
            />
          )}

          {/* Estimate costing – only for UNDER_INSPECTION / WAITING_FOR_APPROVAL */}
          {['WAITING_FOR_APPROVAL'].includes(appointment.status) && (
            <CostingSummary
              servicePrice={servicePrice}
              partsTotal={partsTotal}
              laborTotal={laborTotal}
              discountTotal={discountTotal}
              grandTotal={grandTotal}
              isWaitingForApproval={isWaitingForApproval}
              actionLoading={actionLoading}
              onApprove={() => setApproveModalVisible(true)}
              onReject={() => setRejectModalVisible(true)}
              estimate={estimate}
            />
          )}

          {/* Final bill for IN_PROGRESS */}
          {isInProgress && finalBill && (
            <TouchableOpacity
              onPress={() => router.push(`/invoice/${finalBill.id}`)}
              activeOpacity={0.8}
              className="bg-card rounded-xl overflow-hidden mb-6 border border-border"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}
            >
              <View className="px-4 py-4 flex-row items-center">
                <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <ReceiptText size={21} color="#C1272D" strokeWidth={2} />
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    Final Bill
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    View your completed service invoice
                  </Text>
                </View>

                <ChevronRight size={20} color="#8E8E93" />
              </View>

              <View className="ml-4 border-t border-border px-4 py-4 flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">
                  Total
                </Text>
                <Text className="text-base font-semibold text-primary">
                  ₱{finalBillGrandTotal.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {isCancelled && (
            <CancellationNote notes={appointment.notes} />
          )}

          <ProgressTimeline currentStage={currentStage} />
        </View>
      </ScrollView>

      <ApproveModal
        visible={approveModalVisible}
        onClose={() => setApproveModalVisible(false)}
        onConfirm={confirmApprove}
        grandTotal={grandTotal}
        excludedCount={excludedFindingIds.length}
        actionLoading={actionLoading}
      />

      <RejectModal
        visible={rejectModalVisible}
        onClose={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        onSubmit={submitRejection}
        reason={rejectReason}
        setReason={setRejectReason}
        actionLoading={actionLoading}
      />
    </SafeAreaView>
  );
}