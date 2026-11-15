/**
 * Customer task display derived from the SAME task timestamps and effective
 * duration persisted by the AutoCare Web API. No client-side status changes.
 *
 * Task timing represents elapsed ESTIMATED time, not physical work completion.
 * A task remains IN_PROGRESS at 100% until staff explicitly Finish or Extend it.
 */
const MINUTE = 60_000;

function asMinutes(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function asExtension(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function timestamp(value) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/** This is independent of the service's overall completed-task percentage. */
export function getTaskTimeView(row, nowMs = Date.now()) {
  const status = String(row?.status ?? 'PENDING').toUpperCase();
  const baselineMinutes = asMinutes(row?.baselineMinutes ?? row?.durationMinutes);
  const extensionMinutes = asExtension(row?.extensionMinutes);
  const effectiveMinutes = baselineMinutes + extensionMinutes;
  const startedMs = timestamp(row?.startedAt);
  const finishedMs = timestamp(row?.completedAt);
  const complete = status === 'DONE';
  const running = status === 'IN_PROGRESS';
  const measured = complete && baselineMinutes > 0 && startedMs !== null &&
    finishedMs !== null && finishedMs >= startedMs;
  const live = running && effectiveMinutes > 0 && startedMs !== null &&
    Number.isFinite(nowMs) && nowMs >= startedMs;

  const elapsedMinutes = measured ? (finishedMs - startedMs) / MINUTE
    : live ? (nowMs - startedMs) / MINUTE : null;
  const originalPercent = measured ? (elapsedMinutes / baselineMinutes) * 100 : null;
  const effectivePercent = measured ? originalPercent
    : live ? (elapsedMinutes / effectiveMinutes) * 100 : null;
  const progressPercent = effectivePercent === null ? 0
    : Math.min(100, Math.max(0, complete
      ? Math.round(effectivePercent) : Math.floor(effectivePercent)));
  const finishEarly = measured && elapsedMinutes < baselineMinutes * 0.8;
  const outcome = complete
    ? extensionMinutes > 0 ? 'DELAYED'
      : !measured ? 'UNKNOWN'
        : finishEarly ? 'EARLY' : 'COMPLETED'
    : running ? 'IN_PROGRESS' : 'PENDING';

  return {
    status,
    outcome,
    progressPercent,
    originalPercent,
    elapsedMinutes,
    baselineMinutes,
    extensionMinutes,
    effectiveMinutes,
    timeReached: running && live && elapsedMinutes >= effectiveMinutes,
    isMeasurable: measured,
  };
}

/**
 * Result displayed only on the existing task card after staff mark it DONE.
 * No badge for a completed task that was neither early nor extended.
 * Old tasks without reliable timestamps never receive a false Early badge.
 */
export function getCompletedTaskIndicator(task) {
  const result = getTaskTimeView(task);
  if (result.status !== 'DONE') return null;
  if (result.outcome === 'DELAYED') return 'DELAYED';
  if (result.outcome === 'EARLY') return 'EARLY';
  return null;
}
