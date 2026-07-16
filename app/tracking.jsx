// app/tracking.jsx
import { View, ScrollView, RefreshControl, Alert, ActivityIndicator, Text } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrackingData } from '../hooks/useTrackingData';
import { statusToStage } from '../utils/constants';
import TrackingHeader from '../components/tracking/TrackingHeader';
import VehicleInfoCard from '../components/tracking/VehicleInfoCard';
import TaskList from '../components/tracking/TaskList';
import CostingSummary from '../components/tracking/CostingSummary';
import ProgressTimeline from '../components/tracking/ProgressTimeline';
import CancellationNote from '../components/tracking/CancellationNote';
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

  const [excludedFindingIds, setExcludedFindingIds] = useState([]);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const currentStage = statusToStage[appointment?.status] ?? 0;
  const isWaitingForApproval = appointment?.status === 'WAITING_FOR_APPROVAL';
  const isInProgress = appointment?.status === 'IN_PROGRESS';
  const isCancelled = appointment?.status === 'CANCELLED';

  // Compute costing from tasks and estimate (only relevant for UNDER_INSPECTION / WAITING_FOR_APPROVAL)
  const servicePrice = parseFloat(estimate?.serviceSubtotal) || 0;
  const partsTotal = tasks
    .filter(t => t.status === 'DONE' && t.findings)
    .reduce((sum, task) => {
      return sum + (task.findings || []).reduce((s, f) => {
        return s + (f.products || []).reduce((ps, p) => ps + (p.quantity || 1) * (parseFloat(p.priceAtTime) || 0), 0);
      }, 0);
    }, 0);
  const laborTotal = parseFloat(estimate?.feesTotal) || 0;
  const discountTotal = parseFloat(estimate?.discountTotal) || 0;
  const grandTotal = (servicePrice + partsTotal + laborTotal) - discountTotal;

  const finalBillGrandTotal = finalBill ? parseFloat(finalBill.grandTotal) : null;

  const toggleExclude = (id) => {
    setExcludedFindingIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to approve');
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
      Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
      setRejectReason('');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#C1272D" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Ionicons name="alert-circle-outline" size={60} color="#666" />
        <Text className="mt-4 text-muted-foreground">Appointment not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#C1272D']} />}
    >
      <View className="px-6 pt-10 pb-20">
        <TrackingHeader appointment={appointment} />
        <VehicleInfoCard appointment={appointment} />

        {/* Tasks always visible */}
        {['UNDER_INSPECTION', 'WAITING_FOR_APPROVAL', 'IN_PROGRESS', 'COMPLETED'].includes(appointment.status) && (
          <TaskList
            tasks={tasks}
            excludedFindingIds={excludedFindingIds}
            onToggleExclude={toggleExclude}
            isWaitingForApproval={isWaitingForApproval}
          />
        )}

        {/* Estimate costing – only for UNDER_INSPECTION / WAITING_FOR_APPROVAL */}
        {['UNDER_INSPECTION', 'WAITING_FOR_APPROVAL'].includes(appointment.status) && (
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
          />
        )}

        {/* Final bill for IN_PROGRESS (if available) */}
       {isInProgress && finalBill && (
          <TouchableOpacity
            onPress={() => router.push(`/invoice/${finalBill.id}`)}
            className="p-8 rounded-[32px] mb-10 border border-border bg-card"
          >
            <Text className="text-xl font-heading font-black mb-6 text-foreground">Final Bill</Text>
            <View className="flex-row justify-between mb-4">
              <Text className="text-sm font-medium text-foreground/60">Total</Text>
              <Text className="text-sm font-black text-foreground">₱{finalBillGrandTotal.toFixed(2)}</Text>
            </View>
            <View className="mt-2 flex-row justify-end">
              <Text className="text-xs font-bold text-primary">View Invoice →</Text>
            </View>
          </TouchableOpacity>
        )}

        {isCancelled && <CancellationNote notes={appointment.notes} />}

        <ProgressTimeline currentStage={currentStage} />
      </View>

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
        onClose={() => { setRejectModalVisible(false); setRejectReason(''); }}
        onSubmit={submitRejection}
        reason={rejectReason}
        setReason={setRejectReason}
        actionLoading={actionLoading}
      />
    </ScrollView>
  );
}