import { test } from 'node:test';
import assert from 'node:assert';
import { buildDay, isValidPark, PARKS } from '../src/data/parkData.js';

// 1. A generated day has a sensible number of events.
test('buildDay returns between 3 and 5 events', () => {
  const day = buildDay('hs', '2026-07-30');
  assert.ok(day.events.length >= 3 && day.events.length <= 5);
});

// 2. The generator is deterministic: same park + date gives the same day.
test('buildDay is deterministic for the same park and date', () => {
  const a = buildDay('mk', '2026-08-15');
  const b = buildDay('mk', '2026-08-15');
  assert.deepStrictEqual(a, b);
});

// 3. Every featured film corresponds to a real event on the schedule.
test('every featured film matches a scheduled event', () => {
  const day = buildDay('ak', '2026-09-01');
  const eventFilms = new Set(day.events.map((e) => e.film).filter(Boolean));
  for (const film of day.films) {
    assert.ok(eventFilms.has(film), `film ${film} should be on the schedule`);
  }
});

// 4. Events come back sorted by time.
test('events are sorted by time', () => {
  const day = buildDay('ep', '2026-10-10');
  const toMinutes = (t) => new Date('1/1/2000 ' + t).getTime();
  for (let i = 1; i < day.events.length; i++) {
    assert.ok(toMinutes(day.events[i].time) >= toMinutes(day.events[i - 1].time));
  }
});

// 5. Park validation accepts known ids and rejects unknown ones.
test('isValidPark accepts known parks and rejects unknown', () => {
  assert.ok(isValidPark('mk'));
  assert.ok(isValidPark('ep'));
  assert.ok(!isValidPark('zz'));
  assert.strictEqual(PARKS.length, 4);
});
