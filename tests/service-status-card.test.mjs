import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { getServiceStatusCard } from '../utils/serviceStatusCard.js';

const here = dirname(fileURLToPath(import.meta.url));

test('inspection: any extension yields customer delay message', () => {
  assert.deepEqual(getServiceStatusCard('UNDER_INSPECTION', 'DELAYED'), {
    kind: 'DELAYED', message: 'Sorry the service may delay',
  });
});

test('repair: any extension yields customer delay message', () => {
  assert.equal(getServiceStatusCard('IN_PROGRESS', 'DELAYED')?.kind, 'DELAYED');
});

test('inspection: early completion message', () => {
  assert.equal(getServiceStatusCard('UNDER_INSPECTION', 'EARLY')?.message,
    'The service may finished early');
});

test('repair: early completion message', () => {
  assert.equal(getServiceStatusCard('IN_PROGRESS', 'EARLY')?.kind, 'EARLY');
});

test('neutral if no early or extended tasks, including empty indicator', () => {
  for (const phase of ['UNDER_INSPECTION', 'IN_PROGRESS']) {
    for (const value of [null, undefined, 'NONE', 'ON_TIME', 'NEUTRAL', '']) {
      assert.deepEqual(getServiceStatusCard(phase, value), {
        kind: 'NEUTRAL', message: 'Please wait for all tasks to finish',
      });
    }
  }
});

test('does not show status card outside inspection and repair', () => {
  for (const phase of ['PENDING', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'CANCELLED', null]) {
    assert.equal(getServiceStatusCard(phase, 'DELAYED'), null);
  }
});

test('presentation: status card is separate and prior inline alert is removed', () => {
  const journey = readFileSync(resolve(here, '../components/tracking/ServiceJourneyCard.jsx'), 'utf8');
  const card = readFileSync(resolve(here, '../components/tracking/ServiceStatusCard.jsx'), 'utf8');
  assert.match(journey, /<ServiceStatusCard[\s\S]*?delayIndicator=\{data\.delayIndicator\}/);
  assert.doesNotMatch(journey, /Service delay indicated|Service may finish early|<AlertTriangle/);
  assert.match(card, /mt-3 rounded-2xl border border-border bg-card p-4/);
  assert.match(card, /getServiceStatusCard\(appointmentStatus, delayIndicator\)/);
});
