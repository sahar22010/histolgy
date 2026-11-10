import React, { useState } from 'react';
import {
  BarChart2,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  RotateCcw,
  Zap,
  TrendingUp,
  Brain,
  ShieldAlert,
} from 'lucide-react';
import { CytologyCard, CATEGORIES } from '../data/cards';
import { CardProgress, calculateRetentionRate } from '../utils/sm2';
import { StudyStats } from '../utils/useAnkiState';

interface StatsViewProps {
  cards: CytologyCard[];
  progressMap: Record<string, CardProgress>;
  stats: StudyStats;
  onResetProgress: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  cards,
  progressMap,
  stats,
  onResetProgress,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const now = Date.now();
  const totalCards = cards.length;

  let masteredCount = 0;
  let reviewCount = 0;
  let learningCount = 0;
  let newCount = 0;
  let totalRetention = 0;
  let totalEase = 0;
  let totalLapses = 0;

  cards.forEach((c) => {
    const p = progressMap[c.id];
    if (!p || p.state === 'new') {
      newCount++;
    } else if (p.state === 'mastered') {
      masteredCount++;
    } else if (p.state === 'review') {
      reviewCount++;
    } else if (p.state === 'learning') {
      learningCount++;
    }

    if (p) {
      totalRetention += calculateRetentionRate(p, now);
      totalEase += p.easeFactor;
      totalLapses += p.lapses;
    }
  });

  const avgRetention = totalCards > 0 ? Math.round(totalRetention / totalCards) : 0;
  const avgEase = totalCards > 0 ? (totalEase / totalCards).toFixed(2) : '2.50';
  const masteryPercentage = Math.round((masteredCount / totalCards) * 100);

  // Category breakdown
  const categoryStats = CATEGORIES.filter((c) => c !== 'All Cards').map((cat) => {
    const catCards = cards.filter((c) => c.category === cat);
    const catMastered = catCards.filter((c) => progressMap[c.id]?.state === 'mastered').length;
    const catReview = catCards.filter((c) => progressMap[c.id]?.state === 'review').length;
    const catLearning = catCards.filter((c) => progressMap[c.id]?.state === 'learning').length;
    return {
      category: cat,
      total: catCards.length,
      mastered: catMastered,
      review: catReview,
      learning: catLearning,
      percent: catCards.length > 0 ? Math.round(((catMastered + catReview * 0.5) / catCards.length) * 100) : 0,
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
            Analytics & Mastery
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Cytology Examination Readiness
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Based on the SM-2 algorithm spacing curve and retrieval probability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-800/70 px-3.5 py-2 rounded-xl text-amber-300 font-bold text-sm">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>{stats.streak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Mastery</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {masteryPercentage}%
          </div>
          <div className="text-[11px] text-emerald-400">
            {masteredCount} of {totalCards} cards mastered
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Reviews</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.reviewsToday}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.totalReviews} all-time reviews
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Retention</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {avgRetention}%
          </div>
          <div className="text-[11px] text-teal-400">
            Estimated recall probability
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Ease Factor</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {avgEase}
          </div>
          <div className="text-[11px] text-purple-400">
            {totalLapses} total lapses recorded
          </div>
        </div>
      </div>

      {/* Spaced Repetition Distribution Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Deck State Breakdown
        </h3>

        {/* Stacked Bar */}
        <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div
            className="bg-emerald-500 h-full rounded-l-full transition-all duration-300"
            style={{ width: `${(masteredCount / totalCards) * 100}%` }}
            title={`Mastered: ${masteredCount}`}
          />
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${(reviewCount / totalCards) * 100}%` }}
            title={`Review: ${reviewCount}`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${(learningCount / totalCards) * 100}%` }}
            title={`Learning: ${learningCount}`}
          />
          <div
            className="bg-slate-700 h-full rounded-r-full transition-all duration-300"
            style={{ width: `${(newCount / totalCards) * 100}%` }}
            title={`New: ${newCount}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-300 font-medium">Mastered ({masteredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <span className="text-slate-300 font-medium">Review ({reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-300 font-medium">Learning ({learningCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700 shrink-0" />
            <span className="text-slate-300 font-medium">New ({newCount})</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Module Mastery Breakdown
        </h3>
        <div className="space-y-3">
          {categoryStats.map((item) => (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-semibold">{item.category}</span>
                <span className="text-slate-400 font-mono">
                  {item.mastered + item.review}/{item.total} ready ({item.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Progress Section */}
      <div className="bg-slate-900/60 border border-red-900/40 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-xs font-bold text-red-300 uppercase">Reset Spaced Repetition History</h4>
          <p className="text-xs text-slate-400">
            Clear all ratings, intervals, and ease factors to start studying from slide 1 again.
          </p>
        </div>
        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-lg text-xs font-semibold transition-colors"
          >
            Reset Progress
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-300">Are you sure?</span>
            <button
              onClick={() => {
                onResetProgress();
                setShowConfirmReset(false);
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
