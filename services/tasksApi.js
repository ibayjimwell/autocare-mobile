import api from './api';

const tasksApi = {
  // Inspection tasks (for UNDER_INSPECTION / WAITING_FOR_APPROVAL)
  getInspectionTasks: (appointmentId) =>
    api.request(`/service-tracking/inspection-tasks?appointmentId=${appointmentId}`, 'GET', null, true),

  // Work tasks (for IN_PROGRESS / COMPLETED)
  getWorkTasks: (appointmentId) =>
    api.request(`/service-tracking/work-tasks?appointmentId=${appointmentId}`, 'GET', null, true),
};

export default tasksApi;