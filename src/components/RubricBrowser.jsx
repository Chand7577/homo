import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Plus, Book, Trash2, CheckCircle, Circle, Brain, ChevronLeft, FlaskConical, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import ResizableSplitPane from './ResizableSplitPane';

// Chapter metadata: icon + gradient colour pair
const CHAPTER_META = {
  'Mind':          { icon: '🧠', from: '#6366f1', to: '#8b5cf6' },
  'Head':          { icon: '👤', from: '#0ea5e9', to: '#3b82f6' },
  'Eyes':          { icon: '👁️', from: '#14b8a6', to: '#06b6d4' },
  'Ears':          { icon: '👂', from: '#f59e0b', to: '#f97316' },
  'Nose':          { icon: '👃', from: '#ec4899', to: '#f43f5e' },
  'Face':          { icon: '😊', from: '#a78bfa', to: '#c084fc' },
  'Mouth':         { icon: '👄', from: '#ef4444', to: '#f97316' },
  'Throat':        { icon: '🗣️', from: '#10b981', to: '#059669' },
  'Stomach':       { icon: '🍽️', from: '#f59e0b', to: '#d97706' },
  'Abdomen':       { icon: '🫃', from: '#84cc16', to: '#22c55e' },
  'Rectum':        { icon: '🔴', from: '#dc2626', to: '#b91c1c' },
  'Stool':         { icon: '🚽', from: '#78716c', to: '#57534e' },
  'Urinary':       { icon: '🚰', from: '#38bdf8', to: '#0284c7' },
  'Male':          { icon: '♂️', from: '#3b82f6', to: '#1d4ed8' },
  'Female':        { icon: '♀️', from: '#ec4899', to: '#be185d' },
  'Respiratory':   { icon: '🫁', from: '#06b6d4', to: '#0891b2' },
  'Chest':         { icon: '🫀', from: '#f43f5e', to: '#be123c' },
  'Back':          { icon: '🦴', from: '#a16207', to: '#78350f' },
  'Extremities':   { icon: '🦵', from: '#0d9488', to: '#065f46' },
  'Sleep':         { icon: '😴', from: '#818cf8', to: '#4f46e5' },
  'Chill':         { icon: '🥶', from: '#93c5fd', to: '#3b82f6' },
  'Fever':         { icon: '🤒', from: '#fb923c', to: '#dc2626' },
  'Perspiration':  { icon: '💧', from: '#22d3ee', to: '#0284c7' },
  'Skin':          { icon: '🖐️', from: '#fbbf24', to: '#b45309' },
  'Generalities':  { icon: '⭐', from: '#fde68a', to: '#f59e0b' },
};
const DEFAULT_META = { icon: '📖', from: '#64748b', to: '#475569' };

// ── Helpers to read nested Rubric doc fields ──────────────────────────────
// Rubric schema: { chapter: {en, hi}, rubric: {en, hi}, subrubric: {en, hi}, medicines: Map<name,grade> }
const rubricChapter = (r) => r?.chapter?.en || r?.chapter || '';
const rubricSymptom = (r) => {
  const main = r?.rubric?.en || r?.symptom || '';
  const sub  = r?.subrubric?.en || '';
  return sub ? `${main} — ${sub}` : main;
};
const rubricMedicineCount = (r) => {
  if (!r?.medicines) return 0;
  if (r.medicines instanceof Map) return r.medicines.size;
  if (typeof r.medicines === 'object') return Object.keys(r.medicines).length;
  if (Array.isArray(r.medicines)) return r.medicines.length;
  return 0;
};
// Convert medicines map/object to array of {name, grade} for calculation
export const rubricMedicinesArray = (r) => {
  if (!r?.medicines) return [];
  if (r.medicines instanceof Map) return Array.from(r.medicines.entries()).map(([name, grade]) => ({ name, grade }));
  if (typeof r.medicines === 'object' && !Array.isArray(r.medicines)) {
    return Object.entries(r.medicines).map(([name, grade]) => ({ name, grade }));
  }
  return Array.isArray(r.medicines) ? r.medicines : [];
};

const KENT_CHAPTER_INDEX = {
  '1': 'Mind', '2': 'Vertigo', '3': 'Head', '4': 'Eye', '5': 'Vision',
  '6': 'Ear', '7': 'Hearing', '8': 'Nose', '9': 'Face', '10': 'Mouth',
  '11': 'Teeth', '12': 'Throat', '13': 'External Throat', '14': 'Stomach', '15': 'Abdomen',
  '16': 'Rectum', '17': 'Stool', '18': 'Bladder', '19': 'Kidney', '20': 'Prostate Gland',
  '21': 'Urethra', '22': 'Urine', '23': 'Male Genitalia', '24': 'Female Genitalia', '25': 'Larynx & Trachea',
  '26': 'Respiration', '27': 'Cough', '28': 'Expectoration', '29': 'Chest', '30': 'Back',
  '31': 'Extremities', '32': 'Sleep', '33': 'Chill', '34': 'Fever', '35': 'Perspiration',
  '36': 'Skin', '37': 'Generalities'
};

// Helper to clean leading numbers (e.g. "01. Mind" -> "Mind", "18" -> "Bladder")
const formatChapterDisplay = (rawName) => {
  if (!rawName) return '';
  const str = String(rawName).trim();
  const pureDigits = str.replace(/[^\d]/g, '');
  let cleaned = str.replace(/^[\d\s\.\-_:\)\(#]+/g, '').trim();

  if (cleaned) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }
  if (pureDigits && KENT_CHAPTER_INDEX[pureDigits]) {
    return KENT_CHAPTER_INDEX[pureDigits];
  }
  return 'General';
};

export default function RubricBrowser({
  selectedRubrics = [],
  onAddRubric,
  onRemoveRubric,
  onCalculate,
  repertory = null,
  lang = 'en',
  calculating = false,
}) {
  const [search, setSearch] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Chapters list (from /repertories/:id/chapters)
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [chaptersError, setChaptersError] = useState('');

  // Rubrics for selected chapter
  const [chapterRubrics, setChapterRubrics] = useState([]);
  const [loadingRubrics, setLoadingRubrics] = useState(false);
  const [rubricsError, setRubricsError] = useState('');

  // Search results
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const t = (en, hi) => (lang === 'en' ? en : hi);

  // ── Load chapters via /repertories/:id/chapters ───────────────────────
  useEffect(() => {
    const repId = repertory?._id || repertory?.id;
    if (!repId) return;

    setSelectedChapter(null);
    setChapters([]);
    setChapterRubrics([]);
    setSearch('');
    setChaptersError('');

    const fetch = async () => {
      setLoadingChapters(true);
      try {
        // Uses /api/repertories/:id/chapters which aggregates by chapter.en
        const res = await api.get(`/repertories/${repId}/chapters`);
        const data = res.data?.data || [];
        // Each item: { _id, chapterEn, chapterHi, rubricCount }
        setChapters(data.filter(c => c.chapterEn)); // drop null chapters
      } catch (err) {
        console.error('Failed to load chapters:', err);
        setChaptersError(t('Could not load chapters.', 'अध्याय लोड नहीं हो सके।'));
      } finally {
        setLoadingChapters(false);
      }
    };
    fetch();
  }, [repertory]);

  // ── Load rubrics for selected chapter (/rubrics?chapter=Mind) ─────────
  useEffect(() => {
    const repId = repertory?._id || repertory?.id;
    if (!selectedChapter || !repId) return;

    setChapterRubrics([]);
    setRubricsError('');

    const fetch = async () => {
      setLoadingRubrics(true);
      try {
        const res = await api.get('/rubrics', {
          params: { repertoryId: repId, chapter: selectedChapter, limit: 500 }
        });
        setChapterRubrics(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load rubrics:', err);
        setRubricsError(t('Could not load rubrics.', 'रुब्रिक्स लोड नहीं हो सके।'));
      } finally {
        setLoadingRubrics(false);
      }
    };
    fetch();
  }, [selectedChapter, repertory]);

  // ── Debounced search ──────────────────────────────────────────────────
  useEffect(() => {
    const repId = repertory?._id || repertory?.id;
    if (!search.trim() || !repId) { setSearchResults([]); return; }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/rubrics', {
          params: { repertoryId: repId, search: search.trim(), limit: 100 }
        });
        setSearchResults(res.data?.data || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, repertory]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const isSelected = (r) => {
    const id = r._id || r.id;
    return selectedRubrics.some(s => (s._id || s.id) === id);
  };

  const selectedByChapter = useMemo(() => {
    const map = {};
    selectedRubrics.forEach(r => {
      const ch = rubricChapter(r);
      if (ch) map[ch] = (map[ch] || 0) + 1;
    });
    return map;
  }, [selectedRubrics]);

  // ── Sub-components ────────────────────────────────────────────────────
  const RubricRow = ({ rubric }) => {
    const selected = isSelected(rubric);
    const chName = rubricChapter(rubric);
    const cleanChName = formatChapterDisplay(chName);
    const symptom = rubricSymptom(rubric);
    const medCount = rubricMedicineCount(rubric);
    const meta = CHAPTER_META[cleanChName] || CHAPTER_META[chName] || DEFAULT_META;

    return (
      <div className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50 border-b border-slate-100 last:border-0 ${selected ? 'bg-blue-50/60' : ''}`}>
        <div className="flex-1 min-w-0 pr-3">
          {search.trim() && chName && (
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1 mr-1"
              style={{ background: `${meta.from}22`, color: meta.from }}
            >
              {cleanChName}
            </span>
          )}
          <p className="text-sm font-medium text-slate-800 leading-snug">{symptom}</p>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <FlaskConical className="h-3 w-3" />{medCount} {t('remedies', 'दवाएं')}
          </p>
        </div>
        {selected ? (
          <button onClick={() => onRemoveRubric(rubric)}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
            <X className="h-3 w-3" />{t('Remove', 'हटाएं')}
          </button>
        ) : (
          <button onClick={() => onAddRubric(rubric)}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#062E6F] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Plus className="h-3 w-3" />{t('Add', 'जोड़ें')}
          </button>
        )}
      </div>
    );
  };

  const ChapterGrid = () => {
    if (loadingChapters) return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
        <Loader2 className="h-8 w-8 text-[#062E6F] animate-spin" />
        <p className="text-sm text-slate-500">{t('Loading chapters…', 'अध्याय लोड हो रहे हैं…')}</p>
      </div>
    );
    if (chaptersError) return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-red-600">{chaptersError}</p>
      </div>
    );
    if (chapters.length === 0) return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
        <Book className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-500 font-medium">{t('No chapters found.', 'कोई अध्याय नहीं मिला।')}</p>
        <p className="text-xs text-slate-400">{t('Make sure rubrics are uploaded for this repertory.', 'सुनिश्चित करें कि रुब्रिक्स अपलोड हैं।')}</p>
      </div>
    );

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
        {chapters.map((ch) => {
          const rawName = ch.chapterEn;
          const cleanName = formatChapterDisplay(rawName);
          const count = ch.rubricCount;
          const meta = CHAPTER_META[cleanName] || CHAPTER_META[rawName] || DEFAULT_META;
          const selCount = selectedByChapter[rawName] || selectedByChapter[cleanName] || 0;

          return (
            <button
              key={rawName}
              onClick={() => setSelectedChapter(rawName)}
              className="relative group flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-white font-semibold shadow-md hover:shadow-xl hover:scale-[1.04] active:scale-100 transition-all duration-200 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white rounded-2xl transition-opacity" />
              {selCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-white text-[11px] font-bold rounded-full flex items-center justify-center shadow"
                  style={{ color: meta.from }}>{selCount}</span>
              )}
              <span className="text-3xl leading-none drop-shadow">{meta.icon}</span>
              <span className="text-[13px] font-bold leading-tight text-center drop-shadow">{cleanName}</span>
              <span className="text-[10px] font-medium opacity-80">{count} rubrics</span>
            </button>
          );
        })}
      </div>
    );
  };

  const ChapterRubrics = () => {
    const cleanName = formatChapterDisplay(selectedChapter);
    const meta = CHAPTER_META[cleanName] || CHAPTER_META[selectedChapter] || DEFAULT_META;
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 shrink-0">
          <button onClick={() => setSelectedChapter(null)}
            className="flex items-center gap-1 text-sm font-semibold text-[#062E6F] hover:underline shrink-0">
            <ChevronLeft className="h-4 w-4" />{t('Chapters', 'अध्याय')}
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-xl">{meta.icon}</span>
          <span className="text-sm font-bold text-slate-800 flex-1 truncate">{cleanName}</span>
          {!loadingRubrics && (
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
              {chapterRubrics.length} {t('rubrics', 'रुब्रिक्स')}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingRubrics ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
              <Loader2 className="h-7 w-7 text-[#062E6F] animate-spin" />
              <p className="text-sm text-slate-500">{t('Loading rubrics…', 'रुब्रिक्स लोड हो रहे हैं…')}</p>
            </div>
          ) : rubricsError ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
              <AlertCircle className="h-7 w-7 text-red-400" /><p className="text-sm text-red-600">{rubricsError}</p>
            </div>
          ) : chapterRubrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
              <Search className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">{t('No rubrics in this chapter.', 'इस अध्याय में कोई रुब्रिक नहीं।')}</p>
            </div>
          ) : (
            chapterRubrics.map(r => <RubricRow key={r._id || r.id} rubric={r} />)
          )}
        </div>
      </div>
    );
  };

  const SearchResults = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        {searching
          ? <span className="text-sm text-slate-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{t('Searching…', 'खोज रहे हैं…')}</span>
          : <span className="text-sm text-slate-600"><span className="font-bold text-slate-800">{searchResults.length}</span> {t('results for', 'परिणाम:')} "<i>{search}</i>"</span>
        }
      </div>
      <div className="flex-1 overflow-y-auto">
        {!searching && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
            <Search className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">{t('No rubrics found.', 'कोई रुब्रिक नहीं मिला।')}</p>
          </div>
        )}
        {searchResults.map(r => <RubricRow key={r._id || r.id} rubric={r} />)}
      </div>
    </div>
  );

  // ── ROOT LAYOUT ───────────────────────────────────────────────────────────
  return (
    <ResizableSplitPane
      initialLeftWidth={33}
      minLeftWidth={20}
      maxLeftWidth={70}
      leftContent={
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full max-h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                {t('Selected Rubrics', 'चयनित रुब्रिक्स')}
              </h3>
              <span className="text-sm font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                {selectedRubrics.length}
              </span>
            </div>
            <p className="text-xs text-slate-400">{t('Your repertorization case', 'आपका रेपरटोराइज़ेशन केस')}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {selectedRubrics.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <Circle className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 font-medium">{t('No rubrics selected yet', 'अभी तक कोई रुब्रिक नहीं')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('Pick a chapter →', 'दाएं से चैप्टर चुनें →')}</p>
              </div>
            ) : (
              selectedRubrics.map((rubric, i) => {
                const chName = rubricChapter(rubric);
                const cleanChName = formatChapterDisplay(chName);
                const meta = CHAPTER_META[cleanChName] || CHAPTER_META[chName] || DEFAULT_META;
                return (
                  <div key={rubric._id || rubric.id || i}
                    className="relative group rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: meta.from }}>
                            #{i + 1}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wide truncate" style={{ color: meta.from }}>
                            {cleanChName || 'General'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{rubricSymptom(rubric)}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <FlaskConical className="h-3 w-3" />{rubricMedicineCount(rubric)} {t('remedies', 'दवाएं')}
                        </p>
                      </div>
                      <button onClick={() => onRemoveRubric(rubric)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-slate-200 space-y-2 shrink-0">
            {selectedRubrics.length > 0 && (
              <button onClick={() => selectedRubrics.forEach(r => onRemoveRubric(r))}
                className="w-full py-2 px-4 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" />{t('Clear All', 'सभी साफ़ करें')}
              </button>
            )}
            <button onClick={onCalculate}
              disabled={selectedRubrics.length === 0 || calculating}
              className="w-full py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-[#062E6F] to-blue-600 hover:from-[#042050] hover:to-blue-700 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2">
              {calculating ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />{t('Calculating…', 'गणना हो रही है…')}</>
              ) : (
                <><Brain className="h-4 w-4" />{t('Calculate Analysis', 'विश्लेषण करें')} →</>
              )}
            </button>
          </div>
        </div>
      }
      rightContent={
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full max-h-[calc(100vh-200px)]">
          <div className="px-4 py-3 border-b border-slate-200 shrink-0 flex items-center gap-3">
            <Book className="h-5 w-5 text-[#062E6F] shrink-0" />
            <h3 className="text-base font-bold text-slate-800 flex-1">{t('Browse Repertory', 'रेपरटॉरी ब्राउज़ करें')}</h3>
            {repertory && (
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full shrink-0 truncate max-w-[150px]">
                {repertory.name}
              </span>
            )}
          </div>

          <div className="px-4 py-2.5 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('Search rubrics across all chapters…', 'सभी अध्यायों में रुब्रिक्स खोजें…')}
                className="w-full pl-10 pr-9 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/20 focus:border-[#062E6F] transition-all" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {!repertory ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Book className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 font-medium">{t('No repertory selected', 'कोई रेपरटॉरी नहीं चुनी गई')}</p>
              </div>
            ) : search.trim() ? (
              <SearchResults />
            ) : selectedChapter ? (
              <ChapterRubrics />
            ) : (
              <ChapterGrid />
            )}
          </div>
        </div>
      }
    />
  );
}
