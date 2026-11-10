import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialProgress,
  calculateNextReview,
  calculateCardPriority,
  getIntervalPreview,
  MIN_EASE_FACTOR,
} from './sm2';

test('createInitialProgress sets defaults correctly', () => {
  const p = createInitialProgress('card-1');
  assert.equal(p.cardId, 'card-1');
  assert.equal(p.repetitions, 0);
  assert.equal(p.interval, 0);
  assert.equal(p.easeFactor, 2.5);
  assert.equal(p.lapses, 0);
  assert.equal(p.state, 'new');
});

test('first review with Good rating advances to review state with 1 day interval', () => {
  const p = createInitialProgress('card-1');
  const now = 10000000;
  const updated = calculateNextReview(p, 'good', now);
  assert.equal(updated.repetitions, 1);
  assert.equal(updated.interval, 1);
  assert.equal(updated.state, 'review');
  assert.equal(updated.lastReviewedAt, now);
  assert.equal(updated.dueDate, now + 86400 * 1000);
});

test('first review with Again rating sets learning state and increments lapses', () => {
  const p = createInitialProgress('card-1');
  const now = 10000000;
  const updated = calculateNextReview(p, 'again', now);
  assert.equal(updated.repetitions, 0);
  assert.equal(updated.lapses, 1);
  assert.equal(updated.state, 'learning');
  assert.equal(updated.easeFactor, 2.3);
  assert.equal(updated.dueDate, now + 60 * 1000);
});

test('easeFactor never drops below MIN_EASE_FACTOR (1.3)', () => {
  let p = createInitialProgress('card-1');
  p.easeFactor = 1.35;
  p = calculateNextReview(p, 'again');
  assert.equal(p.easeFactor, MIN_EASE_FACTOR);
});

test('subsequent Good reviews multiply interval by easeFactor', () => {
  const p = {
    ...createInitialProgress('card-1'),
    repetitions: 2,
    interval: 6,
    easeFactor: 2.5,
    state: 'review' as const,
  };
  const updated = calculateNextReview(p, 'good');
  assert.equal(updated.repetitions, 3);
  assert.equal(updated.interval, 15); // Math.round(6 * 2.5) = 15
});

test('Easy rating awards bonus interval and increases ease factor', () => {
  const p = {
    ...createInitialProgress('card-1'),
    repetitions: 1,
    interval: 6,
    easeFactor: 2.5,
    state: 'review' as const,
  };
  const updated = calculateNextReview(p, 'easy');
  assert.equal(updated.easeFactor, 2.65);
  assert.equal(updated.interval, Math.round(6 * 2.5 * 1.3));
});

test('interval preview strings return expected format', () => {
  const p = createInitialProgress('card-1');
  assert.equal(getIntervalPreview(p, 'again'), '< 1 min');
  assert.equal(getIntervalPreview(p, 'hard'), '6 min');
  assert.equal(getIntervalPreview(p, 'good'), '1 d');
  assert.equal(getIntervalPreview(p, 'easy'), '4 d');
});

test('calculateCardPriority ranks learning and overdue higher than distant cards', () => {
  const now = Date.now();
  const learningCard = {
    ...createInitialProgress('c1'),
    state: 'learning' as const,
    dueDate: now - 10000,
  };
  const overdueCard = {
    ...createInitialProgress('c2'),
    state: 'review' as const,
    dueDate: now - 86400000,
  };
  const futureCard = {
    ...createInitialProgress('c3'),
    state: 'review' as const,
    dueDate: now + 86400000 * 5,
  };

  const pLearn = calculateCardPriority(learningCard, now);
  const pOverdue = calculateCardPriority(overdueCard, now);
  const pFuture = calculateCardPriority(futureCard, now);

  assert.ok(pLearn > pOverdue, 'Learning card should have higher priority than standard overdue');
  assert.ok(pOverdue > pFuture, 'Overdue card should have higher priority than future card');
});
