import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  CheckCircle,
  Play,
  Keyboard,
  Languages,
} from 'lucide-react';
import { CytologyCard, CATEGORIES } from '../data/cards';
import { CardProgress } from '../utils/sm2';

interface DeckBrowserViewProps {
  cards: CytologyCard[];
  progressMap: Record<string, CardProgress>;
  showArabicNotes: boolean;
  onSelectCardToStudy: (cardId: string) => void;
  onSelectCardToType: (cardId: string) => void;
}

export const DeckBrowserView: React.FC<DeckBrowserViewProps> = ({
  cards,
  progressMap,
  showArabicNotes,
  onSelectCardToStudy,
  onSelectCardToType,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Cards');
  const [activeModalCard, setActiveModalCard] = useState<CytologyCard | null>(null);
  const [modalShowFullSlide, setModalShowFullSlide] = useState<boolean>(false);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (selectedCategory !== 'All Cards' && card.category !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = card.title.toLowerCase().includes(q);
        const matchQ = card.question.toLowerCase().includes(q);
        const matchA = card.answer.toLowerCase().includes(q);
        const matchSlide = `slide ${card.page}`.includes(q) || `${card.page}` === q;
        return matchTitle || matchQ || matchA || matchSlide;
      }
      return true;
    });
  }, [cards, selectedCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
              Cytology Slide Deck Explorer
            </span>
            <span className="text-xs text-slate-400">{cards.length} Total Laboratory Slides</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            Browse All Taif University Laboratory Micrographs & Solutions
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap flex-1 max-w-md justify-end">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by slide #, organelle..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 max-w-full"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.map((card) => {
          const progress = progressMap[card.id];
          return (
            <div
              key={card.id}
              onClick={() => {
                setActiveModalCard(card);
                setModalShowFullSlide(false);
              }}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 flex flex-col cursor-pointer group"
            >
              {/* Slide Thumbnail */}
              <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-slate-950/90 border border-slate-800 backdrop-blur px-2 py-0.5 rounded text-[11px] font-bold text-emerald-400">
                  Slide #{card.page}
                </div>
                {progress && (
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border backdrop-blur ${
                      progress.state === 'mastered'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                        : progress.state === 'review'
                        ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                        : progress.state === 'learning'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                        : 'bg-slate-900/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    {progress.state}
                  </div>
                )}
              </div>

              {/* Card Meta & Snippet */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {card.category}
                  </span>
                  <h3 className="font-bold text-white text-sm mt-0.5 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {card.question}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[11px]">Click to inspect</span>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    View Solution →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Detail Modal */}
      {activeModalCard && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setActiveModalCard(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                  Slide #{activeModalCard.page}
                </span>
                <span className="text-white font-bold text-sm sm:text-base">
                  {activeModalCard.title}
                </span>
              </div>
              <button
                onClick={() => setActiveModalCard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              {/* Micrograph Box with Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    {modalShowFullSlide ? 'Original Course Slide (with post-it & notes)' : 'Cropped Specimen Micrograph (spoiler-free)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalShowFullSlide(!modalShowFullSlide)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 ${
                      modalShowFullSlide
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                    }`}
                  >
                    <span>{modalShowFullSlide ? 'Show Cropped Micrograph' : 'Show Full Labeled Slide'}</span>
                  </button>
                </div>
                <div className="bg-black rounded-xl p-2 flex items-center justify-center max-h-[420px] overflow-hidden border border-slate-800">
                  <img
                    src={modalShowFullSlide ? activeModalCard.fullImage : activeModalCard.croppedImage}
                    alt={activeModalCard.title}
                    className="max-h-[400px] w-auto max-w-full object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Question */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Examination Question:
                </span>
                <p className="text-white font-semibold text-sm sm:text-base">
                  {activeModalCard.question}
                </p>
              </div>

              {/* Verbatim Answer */}
              <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Exact Solution (Verbatim Letter-For-Letter):
                </div>
                <ul className="space-y-1.5 pl-2">
                  {activeModalCard.answerBullets.map((bullet, idx) => (
                    <li key={idx} className="text-slate-100 text-sm flex items-start gap-2">
                      <span className="text-emerald-400 font-bold mt-0.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arabic Handwritten Annotations */}
              {activeModalCard.arabicNotes && activeModalCard.arabicNotes.length > 0 && (
                <div className="bg-teal-950/20 border border-teal-800/40 rounded-xl p-3.5 text-right" dir="rtl">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5 mb-2">
                    <Languages className="w-4 h-4 text-teal-400" />
                    الشروحات والملاحظات المكتوبة بخط اليد بالملف:
                  </span>
                  <div className="flex flex-wrap gap-2 justify-start">
                    {activeModalCard.arabicNotes.map((note, idx) => (
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
            </div>

            {/* Modal Footer with Action Buttons */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Category: <strong className="text-slate-200">{activeModalCard.category}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = activeModalCard.id;
                    setActiveModalCard(null);
                    onSelectCardToType(id);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <Keyboard className="w-4 h-4 text-teal-400" />
                  <span>Practice Spelling</span>
                </button>

                <button
                  onClick={() => {
                    const id = activeModalCard.id;
                    setActiveModalCard(null);
                    onSelectCardToStudy(id);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Study in Anki</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
