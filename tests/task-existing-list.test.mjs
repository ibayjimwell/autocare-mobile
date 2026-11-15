import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskTimeView, getCompletedTaskIndicator } from '../utils/taskTiming.js';

const startedAt = '2026-11-15T02:00:00.000Z';
const task = { id: 'abc', status: 'DONE', durationMinutes: 100, extensionMinutes: 0, startedAt, completedAt: '2026-11-15T03:00:00.000Z' };
test('existing task data: completed at 60% shows Finished Early', () => {
  assert.equal(getCompletedTaskIndicator(task), 'EARLY');
  assert.equal(getTaskTimeView(task).progressPercent, 60);
});
test('at exactly 80% task shows no badge', () => {
  assert.equal(getCompletedTaskIndicator({ ...task, completedAt: '2026-11-15T03:20:00.000Z' }), null);
});
test('completed after full estimate without extension shows no badge', () => {
  assert.equal(getCompletedTaskIndicator({ ...task, completedAt: '2026-11-15T03:40:00.000Z' }), null);
});
test('extended completed task shows Delayed regardless of early finish', () => {
  assert.equal(getCompletedTaskIndicator({ ...task, extensionMinutes: 15 }), 'DELAYED');
});
test('historical DONE task without completion timestamp does not claim early', () => {
  assert.equal(getCompletedTaskIndicator({ ...task, completedAt: null }), null);
});
test('in-progress task never has a completed-task outcome badge', () => {
  assert.equal(getCompletedTaskIndicator({ ...task, status: 'IN_PROGRESS' }), null);
});
test('in progress original 30min after 15min = 50%, +30min extension = 25%', () => {
  const now= Date.parse('2026-11-15T02:15:00.000Z');
  const live={...task,status:'IN_PROGRESS',durationMinutes:30,completedAt:null};
  assert.equal(getTaskTimeView(live, now).progressPercent, 50);
  assert.equal(getTaskTimeView({...live,extensionMinutes:30},now).progressPercent,25);
});
test('time bar only reaches 100% at exact expiration and does not mark done', () => {
  const live={...task,status:'IN_PROGRESS',durationMinutes:30,completedAt:null};
  const justBefore= getTaskTimeView(live,Date.parse('2026-11-15T02:29:59.999Z'));
  assert.equal(justBefore.progressPercent,99);
  assert.equal(justBefore.timeReached,false);
  const expired = getTaskTimeView(live,Date.parse('2026-11-15T02:30:00.000Z'));
  assert.equal(expired.progressPercent,100);
  assert.equal(expired.timeReached,true);
  assert.equal(expired.status,'IN_PROGRESS');
});
