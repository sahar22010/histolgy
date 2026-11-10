/**
 * SM-2 Spaced Repetition Algorithm & Review Queue Ordering
 * Specially tailored for Anki-style memorization of Medical Biology slides.
 */

export type Rating = 'again' | 'hard' | 'good' | 'easy';
export type CardState = 'new' | 'learning' | 'review' | 'mastered';

export interface CardProgress {
  cardId: string;
  repetitions: number;
  interval: number; // in days (can be fractional for learning steps)
  easeFactor: number; // default 2.5, min 1.3
  lapses: number;
  state: CardState;
  lastReviewedAt: number | null;
  dueDate: number;
}

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;

export function createInitialProgress(cardId: string): CardProgress {
  return {
    cardId,
    repetitions: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    lapses: 0,
    state: 'new',
    lastReviewedAt: null,
    dueDate: Date.now(), // available immediately
  };
}

/**
 * Calculates the next review parameters based on SM-2 algorithm.
 */
export function calculateNextReview(
  current: CardProgress,
  rating: Rating,
  now: number = Date.now()
): CardProgress {
  let { repetitions, interval, easeFactor, lapses } = current;
  let nextState: CardState = current.state;
  let nextDueDate: number;

  switch (rating) {
    case 'again': {
      repetitions = 0;
      lapses += 1;
      interval = 1 / 1440; // 1 minute
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
      nextState = 'learning';
      nextDueDate = now + 60 * 1000;
      break;
    }
    case 'hard': {
      if (repetitions === 0) {
        interval = 6 / 1440; // 6 minutes
        repetitions = 0;
        nextState = 'learning';
      } else {
        interval = Math.max(1, +(interval * 1.2).toFixed(2));
        nextState = interval >= 21 ? 'mastered' : 'review';
      }
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
      nextDueDate = now + Math.round(interval * 86400 * 1000);
      break;
    }
    case 'good': {
      if (repetitions === 0) {
        interval = 1; // 1 day
        repetitions = 1;
      } else if (repetitions === 1) {
        interval = 6; // 6 days
        repetitions = 2;
      } else {
        interval = Math.round(interval * easeFactor);
        repetitions += 1;
      }
      nextState = interval >= 21 ? 'mastered' : 'review';
      nextDueDate = now + Math.round(interval * 86400 * 1000);
      break;
    }
    case 'easy': {
      if (repetitions === 0) {
        interval = 4; // 4 days
        repetitions = 1;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
        repetitions += 1;
      }
      easeFactor = +(easeFactor + 0.15).toFixed(2);
      nextState = interval >= 21 ? 'mastered' : 'review';
      nextDueDate = now + Math.round(interval * 86400 * 1000);
      break;
    }
  }

  return {
    ...current,
    repetitions,
    interval,
    easeFactor,
    lapses,
    state: nextState,
    lastReviewedAt: now,
    dueDate: nextDueDate,
  };
}

/**
 * Helper to display interval preview on Anki rating buttons.
 */
export function getIntervalPreview(current: CardProgress, rating: Rating): string {
  switch (rating) {
    case 'again':
      return '< 1 min';
    case 'hard':
      if (current.repetitions === 0) return '6 min';
      return `${Math.max(1, Math.round(current.interval * 1.2))} d`;
    case 'good':
      if (current.repetitions === 0) return '1 d';
      if (current.repetitions === 1) return '6 d';
      return `${Math.round(current.interval * current.easeFactor)} d`;
    case 'easy':
      if (current.repetitions === 0) return '4 d';
      return `${Math.round(current.interval * current.easeFactor * 1.3)} d`;
  }
}

/**
 * Calculates priority score for the Rank-Order Review Queue.
 * Higher score = higher priority to review right now.
 */
export function calculateCardPriority(progress: CardProgress, now: number = Date.now()): number {
  const isDue = progress.dueDate <= now;
  if (progress.state === 'learning') {
    // Learning cards due immediately take highest priority
    return 1000 + (now - progress.dueDate) / 1000;
  }
  if (progress.state === 'new') {
    return 500;
  }
  if (isDue) {
    const overdueDays = (now - progress.dueDate) / (86400 * 1000);
    const difficultyFactor = (3.0 - progress.easeFactor) * 20;
    const lapseFactor = progress.lapses * 15;
    return 100 + overdueDays * 10 + difficultyFactor + lapseFactor;
  }
  // Not due yet - lower priority based on how far in the future
  const daysUntilDue = (progress.dueDate - now) / (86400 * 1000);
  return Math.max(0, 50 - daysUntilDue);
}

/**
 * Estimated retention probability based on spacing interval.
 */
export function calculateRetentionRate(progress: CardProgress, now: number = Date.now()): number {
  if (progress.state === 'new') return 0;
  if (progress.interval <= 0) return 50;
  const elapsedDays = progress.lastReviewedAt ? (now - progress.lastReviewedAt) / (86400 * 1000) : 0;
  const retention = Math.exp(-elapsedDays / (progress.interval * 1.5)) * 100;
  return Math.max(10, Math.min(100, Math.round(retention)));
}
