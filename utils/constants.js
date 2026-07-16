export const statusToStage = {
  PENDING: 0,
  CONFIRMED: 1,
  UNDER_INSPECTION: 2,
  WAITING_FOR_APPROVAL: 3,
  IN_PROGRESS: 4,
  COMPLETED: 5,
};

export const stages = [
  { name: 'Pending', description: 'Your appointment request has been received.', icon: 'clock-outline' },
  { name: 'Confirmed', description: 'Appointment confirmed. We are preparing for your arrival.', icon: 'calendar-check' },
  { name: 'Under Inspection', description: 'The mechanics are inspecting your vehicle.', icon: 'magnify-scan' },
  { name: 'Waiting Approval', description: 'Estimate cost generated. Waiting for your approval.', icon: 'file-document-edit-outline' },
  { name: 'In Progress', description: 'Work has begun on your vehicle.', icon: 'wrench-clock' },
  { name: 'Completed', description: 'All services finished. Vehicle is ready.', icon: 'check-decagram' },
];

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