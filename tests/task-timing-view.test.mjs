import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskTimeView } from '../utils/taskTiming.js';

const start = '2026-11-15T00:00:00.000Z';
const done = { id: '1', title: 'Test', status: 'DONE', baselineMinutes: 100, extensionMinutes: 0,
  startedAt: start, completedAt: '2026-11-15T01:00:00.000Z' };

test('completed before 80 percent is early', () => {
  const v = getTaskTimeView(done);
  assert.equal(v.outcome, 'EARLY');
  assert.equal(v.progressPercent, 60);
});
test('exactly 80 percent is not early', () => {
  const v = getTaskTimeView({ ...done, completedAt: '2026-11-15T01:20:00.000Z' });
  assert.equal(v.outcome, 'COMPLETED');
});
test('extension takes priority over early completion', () => {
  const v = getTaskTimeView({ ...done, extensionMinutes: 15 });
  assert.equal(v.outcome, 'DELAYED');
  assert.equal(v.effectiveMinutes, 115);
});
test('running bar uses effective extended duration', () => {
  const task = { status: 'IN_PROGRESS', baselineMinutes: 10, extensionMinutes: 0, startedAt: start };
  const now = Date.parse('2026-11-15T00:05:00.000Z');
  assert.equal(getTaskTimeView(task, now).progressPercent, 50);
  assert.equal(getTaskTimeView({ ...task, extensionMinutes: 10 }, now).progressPercent, 25);
});
test('timer at 100% remains IN_PROGRESS until staff completes it', () => {
  const v = getTaskTimeView({ status: 'IN_PROGRESS', baselineMinutes: 10, startedAt: start },
    Date.parse('2026-11-15T00:15:00.000Z'));
  assert.equal(v.timeReached, true);
  assert.equal(v.progressPercent, 100);
  assert.equal(v.outcome, 'IN_PROGRESS');
});
test('running bar must not round to 100 percent before estimate expires', () => {
  const v = getTaskTimeView({ status: 'IN_PROGRESS', baselineMinutes: 10, startedAt: start },
    Date.parse('2026-11-15T00:09:59.000Z'));
  assert.equal(v.progressPercent, 99);
  assert.equal(v.timeReached, false);
});
test('unknown historic completion does not pretend to finish early', () => {
  const v = getTaskTimeView({ status: 'DONE', baselineMinutes: 10, startedAt: null, completedAt: null });
  assert.equal(v.outcome, 'UNKNOWN');
  assert.equal(v.isMeasurable, false);
});
test('pending task stays at zero', () => {
  const v = getTaskTimeView({ status: 'PENDING', baselineMinutes: 10, startedAt: start });
  assert.equal(v.progressPercent, 0);
  assert.equal(v.outcome, 'PENDING');
});
