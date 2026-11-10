import { useState, useEffect, useCallback } from 'react';
import { CYTOLOGY_CARDS, CytologyCard } from '../data/cards';
import {
  CardProgress,
  Rating,
  createInitialProgress,
  calculateNextReview,
  calculateCardPriority,
} from './sm2';
import { playRatingSound, playCelebrationSound } from './audio';

const STORAGE_KEY = 'taif_cytology_anki_progress_v1';
const STREAK_KEY = 'taif_cytology_anki_streak_v1';

export interface StudyStats {
  streak: number;
  lastStudyDate: string;
  reviewsToday: number;
  totalReviews: number;
}

export function useAnkiState() {
  const [progressMap, setProgressMap] = useState<Record<string, CardProgress>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    const initial: Record<string, CardProgress> = {};
    CYTOLOGY_CARDS.forEach((c) => {
      initial[c.id] = createInitialProgress(c.id);
    });
    return initial;
  });

  const [stats, setStats] = useState<StudyStats>(() => {
    if (typeof window === 'undefined') {
      return { streak: 1, lastStudyDate: '', reviewsToday: 0, totalReviews: 0 };
    }
    try {
      const saved = localStorage.getItem(STREAK_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().slice(0, 10);
        if (parsed.lastStudyDate !== today) {
          // Check streak continuation
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const streak = parsed.lastStudyDate === yesterday ? parsed.streak : (parsed.lastStudyDate === today ? parsed.streak : 1);
          return {
            streak,
            lastStudyDate: today,
            reviewsToday: 0,
            totalReviews: parsed.totalReviews || 0,
          };
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return {
      streak: 1,
      lastStudyDate: new Date().toISOString().slice(0, 10),
      reviewsToday: 0,
      totalReviews: 0,
    };
  });

  // Undo stack
  const [historyStack, setHistoryStack] = useState<Array<{ cardId: string; prevProgress: CardProgress }>>([]);

  // Save progress
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
    }
  }, [progressMap]);

  // Save stats
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STREAK_KEY, JSON.stringify(stats));
    }
  }, [stats]);

  const recordReview = useCallback(
    (cardId: string, rating: Rating) => {
      playRatingSound(rating);
      const current = progressMap[cardId] || createInitialProgress(cardId);
      const updated = calculateNextReview(current, rating);

      setHistoryStack((prev) => [...prev.slice(-10), { cardId, prevProgress: current }]);

      setProgressMap((prev) => ({
        ...prev,
        [cardId]: updated,
      }));

      setStats((prev) => ({
        ...prev,
        reviewsToday: prev.reviewsToday + 1,
        totalReviews: prev.totalReviews + 1,
      }));
    },
    [progressMap]
  );

  const undoLastReview = useCallback(() => {
    if (historyStack.length === 0) return null;
    const last = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));

    setProgressMap((prev) => ({
      ...prev,
      [last.cardId]: last.prevProgress,
    }));

    setStats((prev) => ({
      ...prev,
      reviewsToday: Math.max(0, prev.reviewsToday - 1),
      totalReviews: Math.max(0, prev.totalReviews - 1),
    }));

    return last.cardId;
  }, [historyStack]);

  const resetAllProgress = useCallback(() => {
    const fresh: Record<string, CardProgress> = {};
    CYTOLOGY_CARDS.forEach((c) => {
      fresh[c.id] = createInitialProgress(c.id);
    });
    setProgressMap(fresh);
    setHistoryStack([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Compute counts
  const now = Date.now();
  const cardList = CYTOLOGY_CARDS.map((c) => {
    const progress = progressMap[c.id] || createInitialProgress(c.id);
    const priority = calculateCardPriority(progress, now);
    const isDue = progress.dueDate <= now;
    return {
      card: c,
      progress,
      priority,
      isDue,
    };
  });

  const dueCards = cardList
    .filter((item) => item.progress.state !== 'mastered' && item.isDue)
    .sort((a, b) => b.priority - a.priority);

  const learningCount = cardList.filter((item) => item.progress.state === 'learning').length;
  const reviewCount = cardList.filter((item) => item.progress.state === 'review' && item.isDue).length;
  const newCount = cardList.filter((item) => item.progress.state === 'new').length;
  const masteredCount = cardList.filter((item) => item.progress.state === 'mastered').length;

  return {
    progressMap,
    stats,
    historyStack,
    recordReview,
    undoLastReview,
    resetAllProgress,
    cardList,
    dueCards,
    learningCount,
    reviewCount,
    newCount,
    masteredCount,
  };
}
