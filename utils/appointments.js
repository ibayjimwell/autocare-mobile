export const STATUS_CONFIG = {
  PENDING: {
    icon: 'clock-outline',
    color: '#ef4444',
    label: 'Pending',
  },
  CONFIRMED: {
    icon: 'check-circle-outline',
    color: '#dc2626',
    label: 'Confirmed',
  },
  UNDER_INSPECTION: {
    icon: 'car-wrench',
    color: '#3b82f6',
    label: 'Under Inspection',
  },
  WAITING_FOR_APPROVAL: {
    icon: 'clipboard-text-clock',
    color: '#eab308',
    label: 'Awaiting Approval',
  },
  IN_PROGRESS: {
    icon: 'progress-wrench',
    color: '#f97316',
    label: 'In Progress',
  },
  COMPLETED: {
    icon: 'check-circle',
    color: '#22c55e',
    label: 'Completed',
  },
  CANCELLED: {
    icon: 'close-circle',
    color: '#6b7280',
    label: 'Cancelled',
  },
};

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
}