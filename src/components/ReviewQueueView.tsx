import React, { useState, useMemo } from 'react';
import {
  ListOrdered,
  Search,
  Filter,
  Play,
  Clock,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { CytologyCard, CATEGORIES } from '../data/cards';
import { CardProgress, calculateCardPriority, calculateRetentionRate } from '../utils/sm2';

interface ReviewQueueViewProps {
  cards: CytologyCard[];
  progressMap: Record<string, CardProgress>;
  onSelectCardToStudy: (cardId: string) => void;
  onSelectCardToType: (cardId: string) => void;
}

type SortOption = 'priority' | 'slide' | 'ease' | 'retention' | 'lapses';

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  cards,
  progressMap,
  onSelectCardToStudy,
  onSelectCardToType,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Cards');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'learning' | 'review' | 'mastered' | 'new'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  const now = Date.now();

  const enrichedCards = useMemo(() => {
    return cards.map((card) => {
      const progress = progressMap[card.id] || {
        cardId: card.id,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        lapses: 0,
        state: 'new' as const,
        lastReviewedAt: null,
        dueDate: now,
      };

      const priority = calculateCardPriority(progress, now);
      const retention = calculateRetentionRate(progress, now);
      const isDue = progress.dueDate <= now;

      return {
        card,
        progress,
        priority,
        retention,
        isDue,
      };
    });
  }, [cards, progressMap, now]);

  // Filter & Sort
  const processedCards = useMemo(() => {
    return enrichedCards
      .filter((item) => {
        // Category filter
        if (categoryFilter !== 'All Cards' && item.card.category !== categoryFilter) {
          return false;
        }
        // Status filter
        if (statusFilter === 'due' && !item.isDue) return false;
        if (statusFilter === 'learning' && item.progress.state !== 'learning') return false;
        if (statusFilter === 'review' && item.progress.state !== 'review') return false;
        if (statusFilter === 'mastered' && item.progress.state !== 'mastered') return false;
        if (statusFilter === 'new' && item.progress.state !== 'new') return false;

        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = item.card.title.toLowerCase().includes(q);
          const matchQuestion = item.card.question.toLowerCase().includes(q);
          const matchAnswer = item.card.answer.toLowerCase().includes(q);
          const matchPage = `slide ${item.card.page}`.includes(q) || `${item.card.page}` === q;
          return matchTitle || matchQuestion || matchAnswer || matchPage;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            return b.priority - a.priority;
          case 'slide':
            return a.card.page - b.card.page;
          case 'ease':
            return a.progress.easeFactor - b.progress.easeFactor; // lowest ease first (hardest)
          case 'retention':
            return a.retention - b.retention;
          case 'lapses':
            return b.progress.lapses - a.progress.lapses;
          default:
            return 0;
        }
      });
  }, [enrichedCards, categoryFilter, statusFilter, searchTerm, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Title & Introduction Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
              Rank-Order Review Queue
            </span>
            <span className="text-xs text-slate-400">جدول الترتيب والجدولة</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            Spaced Repetition Prioritization Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Cards are ranked dynamically by SM-2 urgency, difficulty, lapse history, and retention decay.
          </p>
        </div>

        {/* Quick summary counts */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            Showing <strong className="text-emerald-400">{processedCards.length}</strong> of {cards.length} cards
          </span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search slides, organelles, or concepts..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as unknown as typeof statusFilter)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All States</option>
            <option value="due">Due Now (مستحق)</option>
            <option value="learning">Learning</option>
            <option value="review">Review</option>
            <option value="mastered">Mastered</option>
            <option value="new">New</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 max-w-[180px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="priority">Sort: SM-2 Priority (Highest)</option>
            <option value="ease">Sort: Hardest First (Lowest Ease)</option>
            <option value="lapses">Sort: Most Lapses</option>
            <option value="retention">Sort: Lowest Retention</option>
            <option value="slide">Sort: Slide Number</option>
          </select>
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 sm:px-4">Rank / Slide</th>
                <th className="py-3 px-3 sm:px-4">Micrograph</th>
                <th className="py-3 px-3 sm:px-4">Specimen & Key Question</th>
                <th className="py-3 px-3 sm:px-4">State</th>
                <th className="py-3 px-3 sm:px-4">Interval / Ease</th>
                <th className="py-3 px-3 sm:px-4">Retention</th>
                <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {processedCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                    No cards match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                processedCards.map((item, index) => {
                  const { card, progress, retention, isDue } = item;
                  return (
                    <tr
                      key={card.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Rank & Slide # */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500 w-6">
                            #{index + 1}
                          </span>
                          <span className="font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded text-xs">
                            p.{card.page}
                          </span>
                        </div>
                      </td>

                      {/* Thumbnail */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="w-14 h-10 bg-black rounded-lg overflow-hidden border border-slate-800 shrink-0">
                          <img
                            src={card.croppedImage || card.image}
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      </td>

                      {/* Specimen title & question snippet */}
                      <td className="py-3 px-3 sm:px-4 min-w-[200px]">
                        <div>
                          <span className="text-white font-bold block leading-tight">
                            {card.title}
                          </span>
                          <span className="text-slate-400 text-xs line-clamp-1 mt-0.5">
                            {card.question}
                          </span>
                        </div>
                      </td>

                      {/* State */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                            progress.state === 'mastered'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                              : progress.state === 'review'
                              ? isDue
                                ? 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse'
                                : 'bg-blue-950/80 text-blue-300 border-blue-700'
                              : progress.state === 'learning'
                              ? 'bg-red-950/80 text-red-300 border-red-700'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isDue && progress.state !== 'new' ? 'Due Now' : progress.state}
                        </span>
                      </td>

                      {/* Interval & Ease Factor */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap font-mono text-xs">
                        <div className="text-slate-200">
                          {progress.interval > 0
                            ? progress.interval >= 1
                              ? `${Math.round(progress.interval)}d`
                              : `${Math.round(progress.interval * 1440)}m`
                            : '0d'}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          EF: {progress.easeFactor.toFixed(2)}
                          {progress.lapses > 0 && (
                            <span className="ml-1 text-red-400 font-semibold" title="Number of lapses">
                              ({progress.lapses}L)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Retention Gauge */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                retention >= 80
                                  ? 'bg-emerald-500'
                                  : retention >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${retention}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-slate-300">{retention}%</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectCardToStudy(card.id)}
                            className="px-2.5 py-1 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            title="Study card in Anki mode"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Study</span>
                          </button>
                          <button
                            onClick={() => onSelectCardToType(card.id)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors border border-slate-700"
                            title="Practice typing answer letter-for-letter"
                          >
                            Type
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
