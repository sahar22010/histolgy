import React, { useState, useEffect, useMemo } from 'react';
import {
  Keyboard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Languages,
  Layers,
  Maximize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CytologyCard, CATEGORIES } from '../data/cards';
import { playRatingSound } from '../utils/audio';

interface TypePracticeViewProps {
  cards: CytologyCard[];
  initialCardId?: string;
  showArabicNotes: boolean;
}

export const TypePracticeView: React.FC<TypePracticeViewProps> = ({
  cards,
  initialCardId,
  showArabicNotes,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Cards');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [typedInput, setTypedInput] = useState<string>('');
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showFullSlide, setShowFullSlide] = useState<boolean>(false);

  const filteredCards = useMemo(() => {
    return cards.filter((c) =>
      selectedCategory === 'All Cards' ? true : c.category === selectedCategory
    );
  }, [cards, selectedCategory]);

  useEffect(() => {
    if (initialCardId) {
      const idx = filteredCards.findIndex((c) => c.id === initialCardId);
      if (idx !== -1) {
        setCardIndex(idx);
      }
    }
  }, [initialCardId, filteredCards]);

  const currentCard = filteredCards[cardIndex] || filteredCards[0];

  const handleNext = () => {
    if (cardIndex + 1 < filteredCards.length) {
      setCardIndex((prev) => prev + 1);
      setTypedInput('');
      setHasChecked(false);
      setShowSolution(false);
      setShowFullSlide(false);
    }
  };

  const handlePrev = () => {
    if (cardIndex > 0) {
      setCardIndex((prev) => prev - 1);
      setTypedInput('');
      setHasChecked(false);
      setShowSolution(false);
      setShowFullSlide(false);
    }
  };

  const targetAnswer = currentCard ? currentCard.answer.trim() : '';

  const diffResult = useMemo(() => {
    if (!currentCard) return { accuracy: 0, typedLen: 0, targetLen: 0 };
    const target = targetAnswer.toLowerCase();
    const typed = typedInput.trim().toLowerCase();

    let matchCount = 0;
    const minLen = Math.min(target.length, typed.length);
    for (let i = 0; i < minLen; i++) {
      if (target[i] === typed[i]) {
        matchCount++;
      }
    }
    const accuracy = target.length > 0 ? Math.round((matchCount / Math.max(target.length, typed.length)) * 100) : 0;

    return {
      accuracy,
      typedLen: typed.length,
      targetLen: target.length,
    };
  }, [currentCard, targetAnswer, typedInput]);

  const handleCheck = () => {
    setHasChecked(true);
    if (diffResult.accuracy >= 80) {
      playRatingSound('easy');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    } else {
      playRatingSound('again');
    }
  };

  if (!currentCard) return null;

  const activeImage = showFullSlide ? currentCard.fullImage : currentCard.croppedImage;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider bg-teal-950/80 border border-teal-800 px-2 py-0.5 rounded">
              Exact Spelling Mode
            </span>
            <span className="text-xs text-slate-400 font-mono">كتابة الحل حرفاً بحرف</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight">
            Slide #{currentCard.page}: {currentCard.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCardIndex(0);
              setTypedInput('');
              setHasChecked(false);
              setShowFullSlide(false);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFullSlide(!showFullSlide)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 ${
              showFullSlide
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle original slide with labels"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showFullSlide ? 'Full Slide' : 'Cropped Specimen'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Specimen Micrograph (Cropped / Spoiler-Free by default) */}
        <div className="bg-black p-3 flex items-center justify-center min-h-[220px] max-h-[380px] overflow-hidden relative">
          <img
            src={activeImage}
            alt={currentCard.title}
            className="max-h-[360px] w-auto max-w-full object-contain rounded"
          />
          <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300">
            {showFullSlide ? 'Original Slide (Labeled)' : 'Cropped Specimen (Zero Spoilers)'}
          </div>
        </div>

        {/* Question Prompt */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-1.5">
          <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider block">
            Official Exam Question:
          </span>
          <p className="text-sm sm:text-base text-slate-100 font-bold leading-relaxed tracking-tight">
            {currentCard.question}
          </p>
        </div>

        {/* Typing Box */}
        <div className="p-4 sm:p-6 bg-slate-900 space-y-4 border-t border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="answer-type-input" className="font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                <Keyboard className="w-4 h-4 text-teal-400" />
                <span>Type exact answer letter-for-letter:</span>
              </label>
              <span className="text-slate-400 font-mono text-[11px]">
                {typedInput.length} chars typed
              </span>
            </div>

            <textarea
              id="answer-type-input"
              value={typedInput}
              onChange={(e) => {
                setTypedInput(e.target.value);
                setHasChecked(false);
              }}
              placeholder="Type your answer here in exact English..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 font-mono resize-none leading-relaxed shadow-inner"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCheck}
                disabled={typedInput.trim().length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-teal-950 font-mono"
              >
                <CheckCircle2 className="w-4 h-4" />
                Check Accuracy
              </button>

              <button
                onClick={() => setShowSolution(!showSolution)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-slate-700 font-mono"
              >
                {showSolution ? 'Hide Solution' : 'Reveal Exact Solution'}
              </button>

              <button
                onClick={() => {
                  setTypedInput('');
                  setHasChecked(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                title="Clear input"
                aria-label="Clear input"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={cardIndex === 0}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                title="Previous card"
                aria-label="Previous card"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-mono px-2">
                {cardIndex + 1} / {filteredCards.length}
              </span>
              <button
                onClick={handleNext}
                disabled={cardIndex + 1 >= filteredCards.length}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                title="Next card"
                aria-label="Next card"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Checked Results & Diff Display */}
          {hasChecked && (
            <div className="p-4 rounded-xl border space-y-3 animate-in fade-in duration-200 bg-slate-950 border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {diffResult.accuracy >= 80 ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm font-mono">
                      <Sparkles className="w-4 h-4" />
                      Excellent Match ({diffResult.accuracy}%)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold text-sm font-mono">
                      <AlertCircle className="w-4 h-4" />
                      Accuracy: {diffResult.accuracy}% - Check exact spelling below
                    </span>
                  )}
                </div>
              </div>

              {/* Exact Solution Display */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-400">
                  Exact Target Solution (الحل المعتمد حرفياً):
                </span>
                <p className="font-mono text-sm text-emerald-300 select-all leading-relaxed bg-black/50 p-2.5 rounded border border-emerald-950">
                  {currentCard.answer}
                </p>
              </div>

              {/* Key terms checklist */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 uppercase font-mono font-semibold">Keywords check:</span>
                {currentCard.keyTerms.map((term, i) => {
                  const isPresent = typedInput.toLowerCase().includes(term.toLowerCase());
                  return (
                    <span
                      key={i}
                      className={`text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1 border ${
                        isPresent
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-red-950/60 text-red-300 border-red-800'
                      }`}
                    >
                      {isPresent ? '✓' : '✗'} {term}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reveal Solution (if toggled without checking) */}
          {showSolution && !hasChecked && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 animate-in fade-in">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Exact Course Solution:
              </span>
              <p className="font-mono text-sm text-slate-100 bg-black/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>
          )}

          {/* Arabic Notes (if enabled) */}
          {showArabicNotes && currentCard.arabicNotes && (
            <div className="bg-teal-950/20 border border-teal-800/40 rounded-xl p-3 text-right" dir="rtl">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1 mb-1">
                <Languages className="w-3.5 h-3.5 text-teal-400" />
                الملاحظات الطبية بالملف:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentCard.arabicNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-teal-950/80 text-teal-200 border border-teal-800/60 px-2 py-0.5 rounded font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
