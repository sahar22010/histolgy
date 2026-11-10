import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  Maximize2,
  Minimize2,
  CheckCircle,
  HelpCircle,
  Sparkles,
  RotateCw,
  Flame,
  ArrowRight,
  ShieldCheck,
  Languages,
  BookOpen,
  SplitSquareVertical,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CytologyCard, CATEGORIES } from '../data/cards';
import { CardProgress, Rating, getIntervalPreview } from '../utils/sm2';
import { playFlipSound, playCelebrationSound } from '../utils/audio';

interface AnkiStudyViewProps {
  cards: CytologyCard[];
  progressMap: Record<string, CardProgress>;
  initialCardId?: string;
  onRateCard: (cardId: string, rating: Rating) => void;
  showArabicNotes: boolean;
  onOpenBrowser: () => void;
  onOpenSpelling: (cardId?: string) => void;
}

export const AnkiStudyView: React.FC<AnkiStudyViewProps> = ({
  cards,
  progressMap,
  initialCardId,
  onRateCard,
  showArabicNotes,
  onOpenBrowser,
  onOpenSpelling,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Cards');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [showFullSlide, setShowFullSlide] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Filter cards by category
  const filteredCards = cards.filter((c) =>
    selectedCategory === 'All Cards' ? true : c.category === selectedCategory
  );

  const currentCard: CytologyCard | undefined = filteredCards[currentIndex];
  const currentProgress: CardProgress | undefined = currentCard ? progressMap[currentCard.id] : undefined;

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setShowFullSlide(false);
    setSessionCompleted(false);
  }, [selectedCategory]);

  // Jump to specific card if requested from review queue or deck browser
  useEffect(() => {
    if (initialCardId) {
      const idx = filteredCards.findIndex((c) => c.id === initialCardId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setIsRevealed(false);
        setShowFullSlide(false);
        setSessionCompleted(false);
      } else {
        const found = cards.find((c) => c.id === initialCardId);
        if (found) {
          setSelectedCategory(found.category);
        }
      }
    }
  }, [initialCardId, cards]);

  const handleReveal = useCallback(() => {
    playFlipSound();
    setIsRevealed(true);
    // On reveal, student can still choose to see full slide or clean crop
  }, []);

  const handleRate = useCallback(
    (rating: Rating) => {
      if (!currentCard) return;
      onRateCard(currentCard.id, rating);
      setIsRevealed(false);
      setShowFullSlide(false);

      if (currentIndex + 1 < filteredCards.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
        playCelebrationSound();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    },
    [currentCard, currentIndex, filteredCards.length, onRateCard]
  );

  // Keyboard navigation like real Anki
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!isRevealed) {
          handleReveal();
        } else {
          handleRate('good');
        }
      } else if (isRevealed) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('good');
        if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, handleReveal, handleRate]);

  if (sessionCompleted || !currentCard) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-950">
          <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Session Completed! ممتاز
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          You have reviewed all {filteredCards.length} cards in this category. The SM-2 spaced repetition algorithm has updated your review queue.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsRevealed(false);
              setShowFullSlide(false);
              setSessionCompleted(false);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-emerald-950"
          >
            <RotateCw className="w-4 h-4" />
            Review Deck Again
          </button>
          <button
            onClick={() => onOpenSpelling()}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-800/60 hover:bg-teal-700/60 text-teal-200 border border-teal-700/60 rounded-xl font-semibold text-sm transition-colors"
          >
            Practice Spelling Mode (حرف بحرف)
          </button>
          <button
            onClick={onOpenBrowser}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition-colors border border-slate-700"
          >
            <BookOpen className="w-4 h-4" />
            Deck Browser
          </button>
        </div>
      </div>
    );
  }

  // Active image source:
  // Before reveal: always show cropped specimen unless user explicitly clicked to see full slide
  // After reveal: can toggle or view full annotated slide
  const activeImageSrc = showFullSlide ? currentCard.fullImage : currentCard.croppedImage;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Category selector & Progress header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <label htmlFor="category-select" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Category:
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 max-w-full font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({cards.filter((c) => (cat === 'All Cards' ? true : c.category === cat)).length})
              </option>
            ))}
          </select>
        </div>

        {/* Card counter & image toggle */}
        <div className="flex items-center gap-2.5">
          <div className="text-xs font-mono text-slate-400">
            Card <span className="text-white font-bold">{currentIndex + 1}</span> of{' '}
            <span className="text-slate-300">{filteredCards.length}</span>
          </div>

          {currentProgress && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border ${
                currentProgress.state === 'mastered'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : currentProgress.state === 'review'
                  ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                  : currentProgress.state === 'learning'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {currentProgress.state}
            </span>
          )}

          {/* Toggle between cropped pure micrograph and full original slide */}
          <button
            onClick={() => setShowFullSlide(!showFullSlide)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 ${
              showFullSlide
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
            }`}
            title={showFullSlide ? 'Switch to cropped pure specimen' : 'View full original slide with labels'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showFullSlide ? 'Full Slide Shown' : 'Cropped Specimen (No Spoilers)'}</span>
          </button>
        </div>
      </div>

      {/* Sharp Progress Bar */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
        />
      </div>

      {/* Main Flashcard Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        {/* Card Header Bar */}
        <div className="bg-slate-950 px-4 sm:px-5 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
              Slide #{currentCard.page}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">•</span>
            <span className="text-xs text-slate-300 font-semibold tracking-wide uppercase">
              {currentCard.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZoomed(true)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              title="Zoom high-resolution micrograph"
              aria-label="Zoom high-resolution micrograph"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenSpelling(currentCard.id)}
              className="text-xs text-teal-400 hover:text-teal-300 bg-teal-950/70 hover:bg-teal-900/70 border border-teal-800/80 px-2.5 py-1 rounded-lg transition-colors font-mono font-semibold flex items-center gap-1"
              title="Practice typing this exact answer letter-for-letter"
            >
              <span>Type Mode</span>
            </button>
          </div>
        </div>

        {/* Specimen Micrograph Box */}
        <div className="relative bg-black flex items-center justify-center p-2 sm:p-4 min-h-[250px] max-h-[440px] overflow-hidden group">
          <img
            src={activeImageSrc}
            alt={`Cytology slide ${currentCard.page} - ${currentCard.title}`}
            className="max-h-[420px] w-auto max-w-full object-contain rounded border border-slate-900 shadow-lg cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
          />

          {/* Badge indicating whether cropped or full */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 pointer-events-none">
            {showFullSlide ? 'Original Slide (Labeled)' : 'Cropped Specimen (Spoiler-Free)'}
          </div>

          <button
            onClick={() => setIsZoomed(true)}
            className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white p-2 rounded-lg opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur text-xs flex items-center gap-1.5 border border-slate-700 font-semibold"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect High-Res</span>
          </button>
        </div>

        {/* Examination Question Prompt */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-950/80 border border-emerald-800/80 rounded-lg text-emerald-400 shrink-0 mt-0.5">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Examination Prompt
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed tracking-tight">
                {currentCard.question}
              </h3>
            </div>
          </div>
        </div>

        {/* Answer Section (Revealed State) */}
        {isRevealed ? (
          <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
            {/* Official English Answer (Verbatim) */}
            <div className="bg-emerald-950/20 border border-emerald-800/70 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Exact Solution (Verbatim Letter-For-Letter)
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  Slide #{currentCard.page}
                </span>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-2">
                {currentCard.answerBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-slate-100 text-sm sm:text-base font-semibold leading-relaxed">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">■</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* Key Terms Chips */}
              {currentCard.keyTerms.length > 0 && (
                <div className="pt-2 border-t border-emerald-900/40 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold">Key Terms:</span>
                  {currentCard.keyTerms.map((term, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Toggle to see Full Slide with Original Handwritten Notes */}
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-3.5 py-2.5 rounded-lg text-xs">
              <span className="text-slate-300">
                Want to cross-check with the instructor's original handwritten slide?
              </span>
              <button
                onClick={() => setShowFullSlide(!showFullSlide)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded border border-slate-700 font-semibold transition-colors flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showFullSlide ? 'Hide Full Slide' : 'Show Full Annotated Slide'}</span>
              </button>
            </div>

            {/* Concise Medical Arabic Notes (if enabled) */}
            {showArabicNotes && currentCard.arabicNotes && currentCard.arabicNotes.length > 0 && (
              <div className="bg-teal-950/20 border border-teal-800/40 rounded-xl p-3.5 text-right" dir="rtl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-teal-400" />
                    الملاحظات الطبية المعتمدة بالملف:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-start">
                  {currentCard.arabicNotes.map((note, idx) => (
                    <span
                      key={idx}
                      className="text-xs sm:text-sm bg-teal-950/80 text-teal-200 border border-teal-800/60 px-2.5 py-1 rounded-lg font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SM-2 Anki Rating Buttons */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold">Rate your recall (SM-2 Spaced Repetition):</span>
                <span className="hidden sm:inline font-mono text-[11px]">Hotkeys: [1] Again [2] Hard [3] Good [4] Easy</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Again Button */}
                <button
                  onClick={() => handleRate('again')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-white transition-all transform active:scale-95 group shadow-sm"
                >
                  <span className="text-xs text-red-400 font-mono font-bold mb-0.5">
                    {currentProgress ? getIntervalPreview(currentProgress, 'again') : '< 1 min'}
                  </span>
                  <span className="font-bold text-sm sm:text-base">Again (إعادة)</span>
                  <span className="text-[10px] text-red-400/70 font-mono mt-0.5">[1]</span>
                </button>

                {/* Hard Button */}
                <button
                  onClick={() => handleRate('hard')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 hover:text-white transition-all transform active:scale-95 group shadow-sm"
                >
                  <span className="text-xs text-amber-400 font-mono font-bold mb-0.5">
                    {currentProgress ? getIntervalPreview(currentProgress, 'hard') : '6 min'}
                  </span>
                  <span className="font-bold text-sm sm:text-base">Hard (صعب)</span>
                  <span className="text-[10px] text-amber-400/70 font-mono mt-0.5">[2]</span>
                </button>

                {/* Good Button */}
                <button
                  onClick={() => handleRate('good')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/80 text-emerald-300 hover:text-white transition-all transform active:scale-95 group shadow-sm ring-1 ring-emerald-500/40"
                >
                  <span className="text-xs text-emerald-400 font-mono font-bold mb-0.5">
                    {currentProgress ? getIntervalPreview(currentProgress, 'good') : '1 d'}
                  </span>
                  <span className="font-bold text-sm sm:text-base">Good (جيد)</span>
                  <span className="text-[10px] text-emerald-400/70 font-mono mt-0.5">[3 / Space]</span>
                </button>

                {/* Easy Button */}
                <button
                  onClick={() => handleRate('easy')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/60 text-sky-300 hover:text-white transition-all transform active:scale-95 group shadow-sm"
                >
                  <span className="text-xs text-sky-400 font-mono font-bold mb-0.5">
                    {currentProgress ? getIntervalPreview(currentProgress, 'easy') : '4 d'}
                  </span>
                  <span className="font-bold text-sm sm:text-base">Easy (سهل)</span>
                  <span className="text-[10px] text-sky-400/70 font-mono mt-0.5">[4]</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Unrevealed State: Show Answer Button */
          <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-col items-center justify-center space-y-3">
            <button
              onClick={handleReveal}
              className="w-full sm:w-auto min-w-[300px] flex items-center justify-center gap-2.5 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-950 transition-all transform active:scale-98 tracking-wide"
            >
              <Eye className="w-5 h-5" />
              <span>Show Answer (إظهار الحل)</span>
              <kbd className="hidden sm:inline-block ml-2 text-xs bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 font-mono border border-emerald-700">
                Space
              </kbd>
            </button>
            <p className="text-xs text-slate-400 font-medium">
              Look closely at the micrograph and recall the diagnosis before clicking or pressing <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded border border-slate-700">Space</kbd>.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox High-Resolution Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 text-white">
              <span className="font-bold text-sm sm:text-base font-mono">
                Slide #{currentCard.page}: {currentCard.title} ({showFullSlide ? 'Full Annotated Slide' : 'Pure Cropped Specimen'})
              </span>
              <button
                onClick={() => setIsZoomed(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                Close (Esc)
              </button>
            </div>
            <img
              src={activeImageSrc}
              alt={currentCard.title}
              className="max-h-[84vh] w-auto max-w-full object-contain rounded-lg border border-slate-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
