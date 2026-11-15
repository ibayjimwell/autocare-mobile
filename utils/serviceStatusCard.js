/**
 * AutoCare's customer-facing SERVICE indicator (not an individual task badge).
 * The backend is authoritative: DELAYED = any extended task; EARLY = an early
 * finished task with no extension; otherwise the service is neutral.
 * This helper only formats the backend result. It does not infer task timing.
 */
export function getServiceStatusCard(appointmentStatus, delayIndicator) {
  const status = String(appointmentStatus ?? '').toUpperCase();
  if (status !== 'UNDER_INSPECTION' && status !== 'IN_PROGRESS') {
    return null;
  }

  const indicator = String(delayIndicator ?? '').toUpperCase();
  if (indicator === 'DELAYED') {
    return { kind: 'DELAYED', message: 'Sorry the service may delay' };
  }
  if (indicator === 'EARLY') {
    return { kind: 'EARLY', message: 'The service may finished early' };
  }
  return { kind: 'NEUTRAL', message: 'Please wait for all tasks to finish' };
}
