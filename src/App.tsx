import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { AnkiStudyView } from './components/AnkiStudyView';
import { TypePracticeView } from './components/TypePracticeView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { DeckBrowserView } from './components/DeckBrowserView';
import { StatsView } from './components/StatsView';
import { CYTOLOGY_CARDS } from './data/cards';
import { useAnkiState } from './utils/useAnkiState';
import { isSoundEnabled, setSoundEnabled } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('study');
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [showArabicNotes, setShowArabicNotes] = useState<boolean>(true);
  const [targetCardId, setTargetCardId] = useState<string | undefined>(undefined);

  const {
    progressMap,
    stats,
    historyStack,
    recordReview,
    undoLastReview,
    resetAllProgress,
    learningCount,
    reviewCount,
    newCount,
  } = useAnkiState();

  const handleToggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  }, [soundOn]);

  const handleToggleArabic = useCallback(() => {
    setShowArabicNotes((prev) => !prev);
  }, []);

  // Global keyboard shortcuts (e.g. 'z' for Undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'z' || e.key === 'Z') {
        if (historyStack.length > 0) {
          e.preventDefault();
          undoLastReview();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStack.length, undoLastReview]);

  const handleSelectCardToStudy = (cardId: string) => {
    setTargetCardId(cardId);
    setCurrentTab('study');
  };

  const handleSelectCardToType = (cardId: string) => {
    setTargetCardId(cardId);
    setCurrentTab('spelling');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Navbar with University Title and Controls */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setTargetCardId(undefined);
        }}
        stats={stats}
        dueCount={reviewCount}
        learningCount={learningCount}
        newCount={newCount}
        soundEnabled={soundOn}
        onToggleSound={handleToggleSound}
        showArabicNotes={showArabicNotes}
        onToggleArabicNotes={handleToggleArabic}
        canUndo={historyStack.length > 0}
        onUndo={undoLastReview}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'study' && (
          <AnkiStudyView
            cards={CYTOLOGY_CARDS}
            progressMap={progressMap}
            initialCardId={targetCardId}
            onRateCard={recordReview}
            showArabicNotes={showArabicNotes}
            onOpenBrowser={() => setCurrentTab('browser')}
            onOpenSpelling={(id) => {
              setTargetCardId(id);
              setCurrentTab('spelling');
            }}
          />
        )}

        {currentTab === 'spelling' && (
          <TypePracticeView
            cards={CYTOLOGY_CARDS}
            initialCardId={targetCardId}
            showArabicNotes={showArabicNotes}
          />
        )}

        {currentTab === 'queue' && (
          <ReviewQueueView
            cards={CYTOLOGY_CARDS}
            progressMap={progressMap}
            onSelectCardToStudy={handleSelectCardToStudy}
            onSelectCardToType={handleSelectCardToType}
          />
        )}

        {currentTab === 'browser' && (
          <DeckBrowserView
            cards={CYTOLOGY_CARDS}
            progressMap={progressMap}
            showArabicNotes={showArabicNotes}
            onSelectCardToStudy={handleSelectCardToStudy}
            onSelectCardToType={handleSelectCardToType}
          />
        )}

        {currentTab === 'stats' && (
          <StatsView
            cards={CYTOLOGY_CARDS}
            progressMap={progressMap}
            stats={stats}
            onResetProgress={resetAllProgress}
          />
        )}
      </main>

      {/* Sticky Bottom Quick Info Footer */}
      <footer className="fixed bottom-0 inset-x-0 bg-slate-950/90 border-t border-slate-800/80 py-2 px-4 backdrop-blur-sm z-30 text-center text-xs text-slate-500 flex items-center justify-between">
        <span className="hidden sm:inline">
          Taif University • College of Medicine • Medical Biology 1 Cytology Revision
        </span>
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <span className="font-mono text-[11px] text-emerald-400">
            SM-2 Spaced Repetition Active
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-[11px] text-slate-400">
            {CYTOLOGY_CARDS.length} Total Laboratory Specimens
          </span>
        </div>
      </footer>
    </div>
  );
}
