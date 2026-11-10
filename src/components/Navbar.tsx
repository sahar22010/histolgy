import React, { useState } from 'react';
import {
  GraduationCap,
  Flame,
  Volume2,
  VolumeX,
  Languages,
  RotateCcw,
  BookOpen,
  Keyboard,
  ListOrdered,
  Layers,
  BarChart2,
  Share2,
  Check,
} from 'lucide-react';
import { StudyStats } from '../utils/useAnkiState';

export type AppTab = 'study' | 'spelling' | 'queue' | 'browser' | 'stats';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  stats: StudyStats;
  dueCount: number;
  learningCount: number;
  newCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showArabicNotes: boolean;
  onToggleArabicNotes: () => void;
  canUndo: boolean;
  onUndo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  dueCount,
  learningCount,
  newCount,
  soundEnabled,
  onToggleSound,
  showArabicNotes,
  onToggleArabicNotes,
  canUndo,
  onUndo,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Taif University Cytology Lab Anki Revision',
          text: 'Cytology Lab Revision Anki SM-2 Flashcards for 1st Year Medicine, Taif University.',
          url,
        });
        return;
      } catch {
        // Fallback to clipboard if dismissed or unsupported
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Top Banner with University & Session Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                Taif University • Med 1
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">2024/2025</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
              Cytology Lab Revision <span className="text-emerald-400 font-mono text-sm">(Anki SM-2)</span>
            </h1>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Anki Card Counters */}
          <div
            className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono font-medium"
            title="Anki Queue: New / Learning / Due"
          >
            <span className="text-blue-400" title="New cards">{newCount} new</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400" title="In Learning">{learningCount} learn</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400" title="Due for review">{dueCount} due</span>
          </div>

          {/* Daily Streak */}
          <div
            className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/50 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-300"
            title="Daily Study Streak"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{stats.streak} day streak</span>
          </div>

          {/* Undo Action */}
          {canUndo && (
            <button
              onClick={onUndo}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-slate-700"
              title="Undo last rating (Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          {/* Arabic Notes Toggle */}
          <button
            onClick={onToggleArabicNotes}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showArabicNotes
                ? 'bg-teal-950/80 text-teal-300 border-teal-700'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Arabic slide annotations"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Arabic Notes</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Share App Button */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              copied
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600 scale-105 shadow-md shadow-emerald-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-950'
            }`}
            title="Copy app link to share with classmates"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Copied! تم النسخ</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share مشاركة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/80 text-xs sm:text-sm font-medium">
          <button
            onClick={() => onSelectTab('study')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
              currentTab === 'study'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Anki Study</span>
            {dueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px]">
                {dueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('spelling')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
              currentTab === 'spelling'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Type & Spelling Mode</span>
            <span className="hidden md:inline text-[10px] text-teal-400 bg-teal-950/60 px-1.5 py-0.5 rounded">
              حرف بحرف
            </span>
          </button>

          <button
            onClick={() => onSelectTab('queue')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
              currentTab === 'queue'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Review Queue</span>
            <span className="hidden md:inline text-[10px] text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded">
              جدول الترتيب
            </span>
          </button>

          <button
            onClick={() => onSelectTab('browser')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
              currentTab === 'browser'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Deck Browser (50+ Slides)</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
              currentTab === 'stats'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Progress & Stats</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
