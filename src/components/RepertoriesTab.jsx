import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, Plus, Trash2, CheckCircle, AlertCircle, Loader2, Activity, X, Eye, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getRepertories, createRepertory, uploadRepertoryExcel, deleteRepertory, getRepertoryChapters, getRubrics } from '../services/api';

export default function RepertoriesTab({ lang = 'en', navigateToTab }) {
  const [repertories, setRepertories] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Create form
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState('');
  const [newAuthor, setNewAuthor]     = useState('');
  const [creating, setCreating]       = useState(false);

  // Deletion state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId]           = useState(null);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Per-repertory upload state: { [repId]: { file, uploading, result, replaceMode } }
  const [uploadStates, setUploadStates] = useState({});

  // Viewer states
  const [selectedRepForView, setSelectedRepForView] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chaptersError, setChaptersError] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterSearch, setChapterSearch] = useState('');

  // Rubrics table states
  const [rubrics, setRubrics] = useState([]);
  const [rubricsLoading, setRubricsLoading] = useState(false);
  const [rubricsTotal, setRubricsTotal] = useState(0);
  const [rubricsPage, setRubricsPage] = useState(1);
  const [rubricsLimit] = useState(5);  // Changed from 15 to 5
  const [rubricsSearch, setRubricsSearch] = useState('');

  const t = (en, hi) => lang === 'en' ? en : hi;

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

  // Load chapters when a repertory is selected for viewing
  useEffect(() => {
    if (!selectedRepForView) {
      setChapters([]);
      setSelectedChapter(null);
      return;
    }

    const fetchChapters = async () => {
      setChaptersLoading(true);
      setChaptersError('');
      try {
        const data = await getRepertoryChapters(selectedRepForView._id);
        setChapters(data || []);
        if (data && data.length > 0) {
          setSelectedChapter(data[0]);
        }
      } catch (err) {
        setChaptersError(t('Failed to load chapters.', 'अध्याय लोड करने में विफल।'));
      } finally {
        setChaptersLoading(false);
      }
    };

    fetchChapters();
  }, [selectedRepForView]);

  // Load rubrics when chapter, page, or search query changes
  useEffect(() => {
    if (!selectedRepForView || !selectedChapter) {
      setRubrics([]);
      setRubricsTotal(0);
      return;
    }

    const fetchRubrics = async () => {
      setRubricsLoading(true);
      try {
        const res = await getRubrics({
          repertoryId: selectedRepForView._id,
          chapter: selectedChapter.chapterEn,
          search: rubricsSearch,
          page: rubricsPage,
          limit: rubricsLimit
        });
        setRubrics(res.data || []);
        setRubricsTotal(res.total || 0);
      } catch (err) {
        console.error('Failed to load rubrics:', err);
      } finally {
        setRubricsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRubrics();
    }, rubricsSearch ? 300 : 0);

    return () => clearTimeout(timer);
  }, [selectedRepForView, selectedChapter, rubricsPage, rubricsSearch, rubricsLimit]);

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter);
    setRubricsPage(1);
    setRubricsSearch('');
  };

  const handleSearchChange = (e) => {
    setRubricsSearch(e.target.value);
    setRubricsPage(1);
  };

  const renderMedicineNames = (meds) => {
    const medsObj = meds instanceof Map ? Object.fromEntries(meds) : (meds || {});
    if (!medsObj || Object.keys(medsObj).length === 0) return <span className="text-slate-350">—</span>;
    
    const medicineNames = Object.keys(medsObj);
    return (
      <div className="flex flex-col gap-0.5">
        {medicineNames.map((name) => (
          <span key={name} className="text-slate-700 text-xs">
            {name}
          </span>
        ))}
      </div>
    );
  };

  const renderMedicineGrades = (meds) => {
    const medsObj = meds instanceof Map ? Object.fromEntries(meds) : (meds || {});
    if (!medsObj || Object.keys(medsObj).length === 0) return <span className="text-slate-350">—</span>;
    
    return (
      <div className="flex flex-col gap-0.5">
        {Object.entries(medsObj).map(([name, grade]) => {
          let badgeClass = "bg-slate-50 text-slate-600 border-slate-200";
          if (grade === 3) badgeClass = "bg-red-50 text-red-700 border-red-200 font-bold";
          else if (grade === 2) badgeClass = "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
          return (
            <span key={name} className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] border ${badgeClass}`}>
              {grade}°
            </span>
          );
        })}
      </div>
    );
  };

  const renderMedicines = (meds) => {
    const medsObj = meds instanceof Map ? Object.fromEntries(meds) : (meds || {});
    if (!medsObj || Object.keys(medsObj).length === 0) return <span className="text-slate-350">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(medsObj).map(([name, grade]) => {
          let badgeClass = "bg-slate-50 text-slate-600 border-slate-200";
          if (grade === 3) badgeClass = "bg-red-50 text-red-700 border-red-200 font-bold";
          else if (grade === 2) badgeClass = "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
          return (
            <span key={name} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border ${badgeClass}`}>
              {name} ({grade})
            </span>
          );
        })}
      </div>
    );
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
    }, 4000);
  };

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await getRepertories({ type: 'Repertory' });
      const filtered = (data || []).filter(r => r.type !== 'Reference' && !r.name.toLowerCase().includes('materia medica') && !r.name.toLowerCase().includes('reference'));
      setRepertories(filtered);
    } catch {
      setError(t('Could not connect to server. Is the backend running on port 5000?',
                 'सर्वर से कनेक्ट नहीं हो सका। क्या बैकएंड पोर्ट 5000 पर चल रहा है?'));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const rep = await createRepertory({ name: newName.trim(), author: newAuthor.trim(), type: 'Repertory' });
      setRepertories(prev => [rep, ...prev]);
      setNewName(''); setNewAuthor(''); setShowCreate(false);
      showToast(t('Repertory created successfully!', 'रेपरटॉरी सफलतापूर्वक बनाई गई!'), 'success');
    } catch {
      showToast(t('Failed to create repertory.', 'रेपरटॉरी बनाने में विफल।'), 'error');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteRepertory(id);
      setRepertories(prev => prev.filter(rep => rep._id !== id));
      setConfirmDeleteId(null);
      showToast(t('Repertory and all associated rubrics deleted successfully.', 'रेपरटॉरी और सभी संबंधित रुब्रिक्स सफलतापूर्वक हटाए गए।'), 'success');
    } catch (err) {
      showToast(t('Failed to delete repertory.', 'रेपरटॉरी हटाने में विफल।'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const setUpState = (id, patch) =>
    setUploadStates(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));

  const handleUpload = async (rep) => {
    const st = uploadStates[rep._id] || {};
    if (!st.file) return;
    setUpState(rep._id, { uploading: true, result: null });

    // Save scroll position to restore after re-render
    const scrollEl = document.getElementById('main-content');
    const savedScroll = scrollEl ? scrollEl.scrollTop : 0;

    try {
      const replaceMode = st.replaceMode !== false; // default to replace for first upload
      const res = await uploadRepertoryExcel(rep._id, st.file, replaceMode);
      setUpState(rep._id, { uploading: false, result: res, file: null });
      
      if (res.rubricCount) {
        showToast(t(`Successfully imported ${res.rubricCount} rubrics!`, `सफलतापूर्वक ${res.rubricCount} रुब्रिक्स आयात हुए!`), 'success');
      } else {
        showToast(res.message || t('Excel uploaded, but no rubrics were found.', 'एक्सेल अपलोड हुआ, पर कोई रुब्रिक्स नहीं मिले।'), 'error');
      }

      // Refresh list to show updated rubric count
      const data = await getRepertories({ type: 'Repertory' });
      const filtered = (data || []).filter(r => r.type !== 'Reference' && !r.name.toLowerCase().includes('materia medica') && !r.name.toLowerCase().includes('reference'));
      setRepertories(filtered);

      // Restore scroll position after list refresh
      requestAnimationFrame(() => {
        if (scrollEl) scrollEl.scrollTop = savedScroll;
      });
    } catch (err) {
      const errMsg = err?.response?.data?.message || t('Upload failed. Please check the Excel format.', 'अपलोड विफल। एक्सेल प्रारूप की जांच करें।');
      setUpState(rep._id, {
        uploading: false,
        result: { message: errMsg }
      });
      showToast(errMsg, 'error');
    }
  };

  const inp = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-all";

  return (
    <div className="space-y-6 relative">
      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 p-3.5 rounded-xl shadow-lg border pointer-events-auto transition-all duration-300 transform translate-y-0 scale-100 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-semibold leading-normal">{toast.message}</div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {selectedRepForView ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Back Button */}
          <button
            onClick={() => setSelectedRepForView(null)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold mb-2 transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('Back to Repertories List', 'रेपरटॉरी सूची पर वापस जाएं')}
          </button>

          {/* Repertory Header Card */}
          <div className="surface p-5 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#062E6F] shrink-0">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedRepForView.name}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedRepForView.author ? `${selectedRepForView.author} • ` : ''}
                  {selectedRepForView.rubricCount.toLocaleString()} {t('total rubrics', 'कुल रुब्रिक्स')}
                </p>
              </div>
            </div>
          </div>

          {/* Split Pane Layout */}
          <div className="space-y-4">
            
            {/* MOBILE ONLY: Tabbed Layout */}
            <div className="lg:hidden">
              {/* Mobile tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 mb-4 overflow-x-auto">
                <button
                  onClick={() => setSelectedChapter(null)}
                  className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 ${
                    !selectedChapter
                      ? 'text-[#062E6F] border-[#062E6F]'
                      : 'text-slate-500 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {t('Chapters', 'अध्याय')}
                    {chapters.length > 0 && (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                        {chapters.length}
                      </span>
                    )}
                  </div>
                </button>
                
                {selectedChapter && (
                  <button
                    className="px-3 py-2.5 text-xs font-semibold border-b-2 text-[#062E6F] border-[#062E6F] transition-all flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-1.5 justify-center truncate">
                      <Activity className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {selectedChapter.chapterEn === '""' || selectedChapter.chapterEn === '' 
                          ? t('[Uncategorized]', '[अवर्गीकृत]')
                          : formatChapterDisplay(selectedChapter.chapterEn)}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                        {rubricsTotal}
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {/* Mobile content */}
              {!selectedChapter ? (
                /* Show chapter list on mobile */
                <div className="surface p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700">
                      {t('Select a Chapter', 'एक अध्याय चुनें')}
                    </span>
                  </div>

                  {/* Mobile Chapter Search */}
                  {chapters.length > 5 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={chapterSearch}
                        onChange={e => setChapterSearch(e.target.value)}
                        placeholder={t('Search chapters…', 'अध्याय खोजें…')}
                        className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-all"
                      />
                    </div>
                  )}

                  {chaptersLoading ? (
                    <div className="flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#062E6F]" />
                      {t('Loading…', 'लोड हो रहा है…')}
                    </div>
                  ) : chaptersError ? (
                    <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      {chaptersError}
                    </div>
                  ) : chapters.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-8">
                      {t('No chapters found.', 'कोई अध्याय नहीं मिला।')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chapters
                        .filter(ch => {
                          if (!chapterSearch.trim()) return true;
                          const q = chapterSearch.toLowerCase();
                          return (
                            (ch.chapterEn || '').toLowerCase().includes(q) ||
                            (ch.chapterHi || '').toLowerCase().includes(q)
                          );
                        })
                        .map((ch) => (
                          <button
                            key={ch._id}
                            onClick={() => handleChapterClick(ch)}
                            className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-left text-xs transition-all bg-white border border-slate-200 hover:border-[#062E6F] hover:bg-blue-50 active:scale-[0.98]"
                          >
                            <div className="truncate flex-1 pr-2 min-w-0">
                              <span className="font-semibold text-slate-800 block truncate">
                                {ch.chapterEn === '""' || ch.chapterEn === '' 
                                  ? t('[Uncategorized]', '[अवर्गीकृत]') 
                                  : formatChapterDisplay(ch.chapterEn)}
                              </span>
                              {ch.chapterHi && (
                                <span className="block text-[10px] font-normal text-slate-400 truncate mt-0.5">
                                  {ch.chapterHi}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-1 rounded-full font-mono shrink-0 bg-slate-100 text-slate-600">
                              {ch.rubricCount.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      {chapterSearch.trim() && chapters.filter(ch => {
                        const q = chapterSearch.toLowerCase();
                        return (ch.chapterEn || '').toLowerCase().includes(q) || (ch.chapterHi || '').toLowerCase().includes(q);
                      }).length === 0 && (
                        <div className="text-xs text-slate-400 text-center py-6">
                          {t('No chapters match your search.', 'कोई अध्याय नहीं मिला।')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Show rubrics when chapter is selected on mobile */
                <div className="space-y-4">
                  {/* Already has mobile rubrics card view below */}
                </div>
              )}
            </div>

            {/* DESKTOP ONLY: Side by side grid */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
            {/* Chapters Sidebar */}
            <div className="lg:col-span-4 surface p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-700">
                  {t('Chapters List', 'अध्याय सूची')} ({chapters.length})
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {t('Click to view rubrics', 'रुब्रिक्स देखने के लिए क्लिक करें')}
                </span>
              </div>

              {/* Chapter Search */}
              {chapters.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={chapterSearch}
                    onChange={e => setChapterSearch(e.target.value)}
                    placeholder={t('Search chapters…', 'अध्याय खोजें…')}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-all"
                  />
                </div>
              )}

              {chaptersLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#062E6F]" />
                  {t('Loading chapters…', 'अध्याय लोड हो रहे हैं…')}
                </div>
              ) : chaptersError ? (
                <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {chaptersError}
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">
                  {t('No chapters found in database.', 'डेटाबेस में कोई अध्याय नहीं मिला।')}
                </div>
              ) : (
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                  {chapters
                    .filter(ch => {
                      if (!chapterSearch.trim()) return true;
                      const q = chapterSearch.toLowerCase();
                      return (
                        (ch.chapterEn || '').toLowerCase().includes(q) ||
                        (ch.chapterHi || '').toLowerCase().includes(q)
                      );
                    })
                    .map((ch) => {
                      const isSelected = selectedChapter && selectedChapter._id === ch._id;
                      return (
                        <button
                          key={ch._id}
                          onClick={() => handleChapterClick(ch)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#062E6F] text-white font-bold shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                          }`}
                        >
                          <div className="truncate flex-1 pr-2">
                            <span>
                              {ch.chapterEn === '""' || ch.chapterEn === '' 
                                ? t('[No Chapter / Uncategorized]', '[कोई अध्याय नहीं / अवर्गीकृत]') 
                                : formatChapterDisplay(ch.chapterEn)}
                            </span>
                            {ch.chapterHi && (
                              <span className={`block text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                {ch.chapterHi}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {ch.rubricCount.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  {chapterSearch.trim() && chapters.filter(ch => {
                    const q = chapterSearch.toLowerCase();
                    return (ch.chapterEn || '').toLowerCase().includes(q) || (ch.chapterHi || '').toLowerCase().includes(q);
                  }).length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-6">
                      {t('No chapters match your search.', 'कोई अध्याय नहीं मिला।')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rubrics Table Column - Desktop only */}
            <div className="hidden lg:block lg:col-span-8 space-y-4">
              {selectedChapter ? (
                <div className="surface p-5 border border-slate-100 space-y-4">
                  {/* Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="text-[#062E6F]">
                          {selectedChapter.chapterEn === '""' || selectedChapter.chapterEn === '' 
                            ? t('[No Chapter / Uncategorized]', '[कोई अध्याय नहीं / अवर्गीकृत]') 
                            : formatChapterDisplay(selectedChapter.chapterEn)}
                        </span>
                        {selectedChapter.chapterHi && (
                          <span className="text-xs font-normal text-slate-400">({selectedChapter.chapterHi})</span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {rubricsTotal.toLocaleString()} {t('rubrics found', 'रुब्रिक्स मिले')}
                      </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:max-w-xs shrink-0">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={rubricsSearch}
                        onChange={handleSearchChange}
                        placeholder={t('Search within chapter…', 'अध्याय में खोजें…')}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-all"
                      />
                    </div>
                  </div>

                  {/* Desktop Rubrics Table View */}
                  <div className="hidden md:block overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left border-collapse min-w-[1300px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          <th className="py-3 px-4 w-[16%]">
                            {t('Rubric (English – Verb + Action)', 'रुब्रिक (अंग्रेज़ी)')}
                          </th>
                          <th className="py-3 px-4 w-[16%]">
                            {t('Rubric (Hindi – क्रिया आधारित)', 'रुब्रिक (हिंदी)')}
                          </th>
                          <th className="py-3 px-4 w-[10%]">
                            {t('Sub-Rubric (EN + HI)', 'उप-रुब्रिक')}
                          </th>
                          <th className="py-3 px-4 w-[12%]">
                            {t('Synonyms (EN + HI)', 'समानार्थी शब्द')}
                          </th>
                          <th className="py-3 px-4 w-[12%]">
                            {t('Aggravation (EN + HI)', 'बढ़ना')}
                          </th>
                          <th className="py-3 px-4 w-[10%]">
                            {t('Amelioration (EN + HI)', 'घटना')}
                          </th>
                          <th className="py-3 px-4 w-[14%]">
                            {t('Medicine Names', 'दवा के नाम')}
                          </th>
                          <th className="py-3 px-4 w-[10%]">
                            {t('Grades', 'ग्रेड')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {rubricsLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <tr key={index} className="animate-pulse">
                              <td className="py-4 px-4"><div className="h-3.5 bg-slate-100 rounded w-4/5"></div></td>
                              <td className="py-4 px-4"><div className="h-3.5 bg-slate-100 rounded w-4/5"></div></td>
                              <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-3/4"></div></td>
                              <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-2/3"></div></td>
                              <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-2/3"></div></td>
                              <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-1/2"></div></td>
                              <td className="py-4 px-4"><div className="h-3 bg-slate-100 rounded w-full"></div></td>
                              <td className="py-4 px-4"><div className="h-5 bg-slate-100 rounded w-full"></div></td>
                            </tr>
                          ))
                        ) : rubrics.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="py-12 text-center text-slate-400">
                              {t('No rubrics found matching filters.', 'कोई रुब्रिक्स नहीं मिले।')}
                            </td>
                          </tr>
                        ) : (
                          rubrics.map((r) => (
                            <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                              {/* Rubric (English – Verb + Action) */}
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-800">{r.rubric?.en || '—'}</div>
                              </td>
                              
                              {/* Rubric (Hindi – क्रिया आधारित) */}
                              <td className="py-3.5 px-4 text-slate-600">
                                {r.rubric?.hi ? (
                                  <div className="font-medium">{r.rubric.hi}</div>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                              
                              {/* Sub-Rubric (EN + HI) */}
                              <td className="py-3.5 px-4 text-slate-600">
                                {r.subrubric?.en ? (
                                  <>
                                    <div>{r.subrubric.en}</div>
                                    {r.subrubric.hi && (
                                      <div className="text-[10px] text-slate-400 mt-0.5">{r.subrubric.hi}</div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                              
                              {/* Synonyms (EN + HI) */}
                              <td className="py-3.5 px-4 text-slate-600">
                                {r.synonyms?.en?.length > 0 ? (
                                  <>
                                    <div className="text-[11px]">{r.synonyms.en.join('; ')}</div>
                                    {r.synonyms.hi?.length > 0 && (
                                      <div className="text-[10px] text-slate-400 mt-0.5">{r.synonyms.hi.join('; ')}</div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                              
                              {/* Aggravation (EN + HI) */}
                              <td className="py-3.5 px-4">
                                {r.modalities?.aggravation?.length > 0 ? (
                                  <div className="text-slate-600 text-[11px] leading-relaxed">
                                    {r.modalities.aggravation.join(' – ')}
                                  </div>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                              
                              {/* Amelioration (EN + HI) */}
                              <td className="py-3.5 px-4">
                                {r.modalities?.amelioration?.length > 0 ? (
                                  <div className="text-slate-600 text-[11px] leading-relaxed">
                                    {r.modalities.amelioration.join(' – ')}
                                  </div>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                              
                              {/* Medicine Names */}
                              <td className="py-3.5 px-4">
                                {renderMedicineNames(r.medicines)}
                              </td>
                              
                              {/* Grades */}
                              <td className="py-3.5 px-4">
                                {renderMedicineGrades(r.medicines)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Rubrics Card View - Hidden on mobile, shown on tablet */}
                  <div className="md:block lg:hidden space-y-3">
                    {rubricsLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-slate-100 space-y-3 animate-pulse">
                          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                          <div className="h-3 bg-slate-100 rounded w-full"></div>
                          <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                        </div>
                      ))
                    ) : rubrics.length === 0 ? (
                      <div className="bg-white rounded-lg p-8 border border-slate-100 text-center text-slate-400">
                        {t('No rubrics found matching filters.', 'कोई रुब्रिक्स नहीं मिले।')}
                      </div>
                    ) : (
                      rubrics.map((r) => {
                        const medsObj = r.medicines instanceof Map ? Object.fromEntries(r.medicines) : (r.medicines || {});
                        const hasMedicines = medsObj && Object.keys(medsObj).length > 0;
                        
                        return (
                          <div key={r._id} className="bg-white rounded-lg p-4 border border-slate-100 space-y-3 shadow-sm">
                            {/* Rubric English */}
                            {r.rubric?.en && (
                              <div>
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                  {t('Rubric', 'रुब्रिक')}
                                </span>
                                <div className="font-semibold text-slate-800 text-sm">{r.rubric.en}</div>
                              </div>
                            )}

                            {/* Rubric Hindi */}
                            {r.rubric?.hi && (
                              <div className="border-t border-slate-100 pt-2">
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                  {t('Rubric (Hindi)', 'रुब्रिक (हिंदी)')}
                                </span>
                                <div className="font-medium text-slate-600 text-xs">{r.rubric.hi}</div>
                              </div>
                            )}

                            {/* Sub-Rubric */}
                            {r.subrubric?.en && (
                              <div className="border-t border-slate-100 pt-2">
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                  {t('Sub-Rubric', 'उप-रुब्रिक')}
                                </span>
                                <div className="text-xs text-slate-600">{r.subrubric.en}</div>
                                {r.subrubric.hi && (
                                  <div className="text-[10px] text-slate-500 mt-0.5">{r.subrubric.hi}</div>
                                )}
                              </div>
                            )}

                            {/* Synonyms */}
                            {r.synonyms?.en?.length > 0 && (
                              <div className="border-t border-slate-100 pt-2">
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                  {t('Synonyms', 'समानार्थी')}
                                </span>
                                <div className="text-[11px] text-slate-600">{r.synonyms.en.join('; ')}</div>
                                {r.synonyms.hi?.length > 0 && (
                                  <div className="text-[10px] text-slate-500 mt-0.5">{r.synonyms.hi.join('; ')}</div>
                                )}
                              </div>
                            )}

                            {/* Aggravation */}
                            {r.modalities?.aggravation?.length > 0 && (
                              <div className="border-t border-slate-100 pt-2">
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                  {t('Aggravation', 'बढ़ना')}
                                </span>
                                <div className="text-[11px] text-slate-600 leading-relaxed">
                                  {r.modalities.aggravation.join(' – ')}
                                </div>
                              </div>
                            )}

                            {/* Amelioration */}
                            {r.modalities?.amelioration?.length > 0 && (
                              <div className="border-t border-slate-100 pt-2">
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                  {t('Amelioration', 'घटना')}
                                </span>
                                <div className="text-[11px] text-slate-600 leading-relaxed">
                                  {r.modalities.amelioration.join(' – ')}
                                </div>
                              </div>
                            )}

                            {/* Medicines with Grades */}
                            {hasMedicines && (
                              <div className="border-t border-slate-100 pt-2">
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                                  {t('Medicines & Grades', 'दवाएं और ग्रेड')}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.entries(medsObj).map(([name, grade]) => {
                                    let badgeClass = "bg-slate-50 text-slate-600 border-slate-200";
                                    if (grade === 3) badgeClass = "bg-red-50 text-red-700 border-red-200 font-bold";
                                    else if (grade === 2) badgeClass = "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
                                    return (
                                      <span key={name} className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] border ${badgeClass}`}>
                                        {name} <span className="ml-1 opacity-75">({grade}°)</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination */}
                  {!rubricsLoading && rubricsTotal > rubricsLimit && (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                      <span className="text-slate-500">
                        {t('Showing', 'दिखा रहा है')}{' '}
                        <span className="font-semibold text-slate-700">
                          {((rubricsPage - 1) * rubricsLimit) + 1}
                        </span>{' '}
                        {t('to', 'से')}{' '}
                        <span className="font-semibold text-slate-700">
                          {Math.min(rubricsPage * rubricsLimit, rubricsTotal)}
                        </span>{' '}
                        {t('of', 'कुल')}{' '}
                        <span className="font-semibold text-slate-700">{rubricsTotal}</span>{' '}
                        {t('rubrics', 'रुब्रिक्स')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={rubricsPage <= 1}
                          onClick={() => setRubricsPage(p => Math.max(p - 1, 1))}
                          className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-500 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-slate-600 px-2">
                          {t('Page', 'पृष्ठ')} <span className="font-semibold">{rubricsPage}</span> / {Math.ceil(rubricsTotal / rubricsLimit)}
                        </span>
                        <button
                          disabled={rubricsPage >= Math.ceil(rubricsTotal / rubricsLimit)}
                          onClick={() => setRubricsPage(p => p + 1)}
                          className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-500 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="surface p-12 text-center text-slate-400 space-y-2 border border-slate-100">
                  <BookOpen className="h-8 w-8 mx-auto text-slate-350" />
                  <p className="font-medium text-sm text-slate-500">
                    {t('Select a chapter to view its rubrics table', 'इसके रुब्रिक्स देखने के लिए एक अध्याय का चयन करें')}
                  </p>
                </div>
              )}
            </div>
            </div>
            {/* End Desktop Grid */}

            {/* MOBILE ONLY: Show rubrics when chapter is selected */}
            {selectedChapter && (
              <div className="lg:hidden surface p-4 border border-slate-100 space-y-4">
                {/* Section Header */}
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 truncate">
                      <span className="text-[#062E6F]">
                        {selectedChapter.chapterEn === '""' || selectedChapter.chapterEn === '' 
                          ? t('[Uncategorized]', '[अवर्गीकृत]') 
                          : formatChapterDisplay(selectedChapter.chapterEn)}
                      </span>
                    </h3>
                    {selectedChapter.chapterHi && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">({selectedChapter.chapterHi})</p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      {rubricsTotal.toLocaleString()} {t('rubrics found', 'रुब्रिक्स मिले')}
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={rubricsSearch}
                      onChange={handleSearchChange}
                      placeholder={t('Search rubrics…', 'रुब्रिक्स खोजें…')}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-all"
                    />
                  </div>
                </div>

                {/* Mobile Rubrics Cards */}
                <div className="space-y-3">
                  {rubricsLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-slate-100 space-y-2 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-100 rounded w-full"></div>
                        <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                      </div>
                    ))
                  ) : rubrics.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 border border-slate-100 text-center text-slate-400 text-xs">
                      {t('No rubrics found matching filters.', 'कोई रुब्रिक्स नहीं मिले।')}
                    </div>
                  ) : (
                    rubrics.map((r) => {
                      const medsObj = r.medicines instanceof Map ? Object.fromEntries(r.medicines) : (r.medicines || {});
                      const hasMedicines = medsObj && Object.keys(medsObj).length > 0;
                      
                      return (
                        <div key={r._id} className="bg-white rounded-lg p-3 border border-slate-100 space-y-2.5 shadow-sm">
                          {/* Rubric English */}
                          {r.rubric?.en && (
                            <div>
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                {t('Rubric', 'रुब्रिक')}
                              </span>
                              <div className="font-semibold text-slate-800 text-xs leading-snug">{r.rubric.en}</div>
                            </div>
                          )}

                          {/* Rubric Hindi */}
                          {r.rubric?.hi && (
                            <div className="border-t border-slate-100 pt-2">
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                {t('Hindi', 'हिंदी')}
                              </span>
                              <div className="font-medium text-slate-600 text-[11px]">{r.rubric.hi}</div>
                            </div>
                          )}

                          {/* Sub-Rubric */}
                          {r.subrubric?.en && (
                            <div className="border-t border-slate-100 pt-2">
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                {t('Sub-Rubric', 'उप-रुब्रिक')}
                              </span>
                              <div className="text-[11px] text-slate-600">{r.subrubric.en}</div>
                              {r.subrubric.hi && (
                                <div className="text-[10px] text-slate-500 mt-0.5">{r.subrubric.hi}</div>
                              )}
                            </div>
                          )}

                          {/* Synonyms */}
                          {r.synonyms?.en?.length > 0 && (
                            <div className="border-t border-slate-100 pt-2">
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                {t('Synonyms', 'समानार्थी')}
                              </span>
                              <div className="text-[10px] text-slate-600">{r.synonyms.en.join('; ')}</div>
                              {r.synonyms.hi?.length > 0 && (
                                <div className="text-[10px] text-slate-500 mt-0.5">{r.synonyms.hi.join('; ')}</div>
                              )}
                            </div>
                          )}

                          {/* Modalities in compact layout */}
                          {(r.modalities?.aggravation?.length > 0 || r.modalities?.amelioration?.length > 0) && (
                            <div className="border-t border-slate-100 pt-2 grid grid-cols-2 gap-2">
                              {r.modalities?.aggravation?.length > 0 && (
                                <div>
                                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                    {t('Aggr.', 'बढ़ना')}
                                  </span>
                                  <div className="text-[10px] text-slate-600 leading-snug">
                                    {r.modalities.aggravation.join(', ')}
                                  </div>
                                </div>
                              )}
                              {r.modalities?.amelioration?.length > 0 && (
                                <div>
                                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                    {t('Amel.', 'घटना')}
                                  </span>
                                  <div className="text-[10px] text-slate-600 leading-snug">
                                    {r.modalities.amelioration.join(', ')}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Medicines with Grades */}
                          {hasMedicines && (
                            <div className="border-t border-slate-100 pt-2">
                              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                                {t('Medicines & Grades', 'दवाएं और ग्रेड')}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(medsObj).map(([name, grade]) => {
                                  let badgeClass = "bg-slate-50 text-slate-600 border-slate-200";
                                  if (grade === 3) badgeClass = "bg-red-50 text-red-700 border-red-200 font-bold";
                                  else if (grade === 2) badgeClass = "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
                                  return (
                                    <span key={name} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] border ${badgeClass}`}>
                                      {name} <span className="ml-1 opacity-75">({grade}°)</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination */}
                {!rubricsLoading && rubricsTotal > rubricsLimit && (
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px]">
                        {((rubricsPage - 1) * rubricsLimit) + 1} - {Math.min(rubricsPage * rubricsLimit, rubricsTotal)} {t('of', '/')} {rubricsTotal}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {t('Page', 'पृष्ठ')} {rubricsPage} / {Math.ceil(rubricsTotal / rubricsLimit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={rubricsPage <= 1}
                        onClick={() => setRubricsPage(p => Math.max(p - 1, 1))}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 transition-colors min-h-[44px] font-semibold text-xs"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        {t('Previous', 'पिछला')}
                      </button>
                      <button
                        disabled={rubricsPage >= Math.ceil(rubricsTotal / rubricsLimit)}
                        onClick={() => setRubricsPage(p => p + 1)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 transition-colors min-h-[44px] font-semibold text-xs"
                      >
                        {t('Next', 'अगला')}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-[#062E6F]" />
                {t('Repertories & Mastersheet Ingestion', 'रेपरटॉरी और मास्टरशीट अपलोड')}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {t('Manage repertories, upload Excel mastersheets, and configure data points for symptom analysis.',
                   'रेपरटॉरी प्रबंधित करें, Excel मास्टरशीट अपलोड करें और लक्षण विश्लेषण के लिए डेटा बिंदु कॉन्फ़िगर करें।')}
              </p>
            </div>
            <button
              onClick={() => setShowCreate(v => !v)}
              className="secondary-btn self-start sm:self-center"
            >
              <Plus className="h-4 w-4" />
              {t('New Repertory', 'नई रेपरटॉरी')}
            </button>
          </div>

          {/* Create Form */}
          {showCreate && (
            <div className="surface p-5 border border-[#062E6F]/20 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">
                {t('Create New Repertory', 'नई रेपरटॉरी बनाएं')}
              </h3>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t('Repertory Name *', 'रेपरटॉरी का नाम *')}
                  </label>
                  <input required value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder={t("e.g. Kent's Repertory, Mastersheet 2024", "जैसे केंट की रेपरटॉरी")}
                    className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t('Author / Source', 'लेखक / स्रोत')}
                  </label>
                  <input value={newAuthor} onChange={e => setNewAuthor(e.target.value)}
                    placeholder={t('e.g. Dr. J.T. Kent', 'वैकल्पिक')}
                    className={inp} />
                </div>
                <div className="flex items-end gap-2">
                  <button type="submit" disabled={creating} className="secondary-btn w-full justify-center">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {t('Create', 'बनाएं')}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)}
                    className="ghost-btn border border-slate-200 whitespace-nowrap">
                    {t('Cancel', 'रद्द करें')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Format Guide */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide">
              📋 {t('Accepted Excel Formats (Auto-detected)', 'स्वीकृत Excel प्रारूप (स्वचालित पहचान)')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-blue-700">
              <div className="space-y-1">
                <p className="font-semibold">{t('Standard Named Columns:', 'मानक नामित कॉलम:')}</p>
                <code className="block bg-blue-100/50 p-2 rounded text-[10px] leading-relaxed">
                  chapter_en | chapter_hi | rubric_en | rubric_hi<br/>
                  subrubric_en | aggravation | amelioration | synonyms_en<br/>
                  {t('Then one column per medicine (header = name, value = 1/2/3)', 'फिर प्रत्येक दवा के लिए एक कॉलम')}
                </code>
              </div>
              <div className="space-y-1">
                <p className="font-semibold">{t('Mastersheet Single Column Medicines:', 'मास्टरशीट सिंगल कॉलम दवाएं:')}</p>
                <code className="block bg-blue-100/50 p-2 rounded text-[10px] leading-relaxed">
                  Chapter | Rubric (English) | Rubric (Hindi)<br/>
                  Sub-Rubric | Synonyms | Aggravation | Amelioration<br/>
                  Medicines (Full Name – 3) <span className="text-slate-500">({t('separated by semicolon', 'अर्धविराम द्वारा विभाजित')})</span>
                </code>
              </div>
            </div>
            <p className="text-[10px] text-blue-600 font-medium">
              ✦ {t('Blank chapter cells inherit the chapter from the row above (continuation rows supported).',
                    'खाली chapter सेल ऊपर की पंक्ति से chapter लेती है।')}
            </p>
          </div>

          {/* Error / Loading */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#062E6F]" />
              {t('Loading from server…', 'सर्वर से लोड हो रहा है…')}
            </div>
          )}

          {/* Repertory Cards */}
          {!loading && repertories.length === 0 && !error && (
            <div className="surface p-12 text-center space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-slate-500 font-medium text-sm">
                {t('No repertories yet. Create one and upload your mastersheet.',
                   'अभी कोई रेपरटॉरी नहीं है। एक बनाएं और मास्टरशीट अपलोड करें।')}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {repertories.map(rep => {
              const st = uploadStates[rep._id] || {};
              const hasResult = st.result;
              const isSuccess = hasResult && st.result.rubricCount;

              return (
                <div key={rep._id} className="surface p-4 sm:p-5 space-y-4 border border-slate-100 hover:border-[#062E6F]/20 transition-all">
                  {/* Repertory header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#062E6F] shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{rep.name}</h3>
                        {rep.author && <p className="text-xs text-slate-400 mt-0.5 truncate">{rep.author}</p>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            rep.rubricCount > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {rep.rubricCount > 0
                              ? `✓ ${rep.rubricCount.toLocaleString()} ${t('rubrics loaded', 'रुब्रिक्स लोड')}`
                              : t('No data yet — upload Excel', 'Excel अपलोड करें')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons - responsive layout */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {rep.rubricCount > 0 && (
                        <>
                          <button
                            onClick={() => setSelectedRepForView(rep)}
                            className="ghost-btn border border-[#062E6F] text-[#062E6F] hover:bg-[#062E6F]/10 text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('View Data', 'डेटा देखें')}</span>
                            <span className="sm:hidden">{t('View', 'देखें')}</span>
                          </button>
                          <button
                            onClick={() => navigateToTab('Rubric Analyzer')}
                            className="terracotta-btn text-xs px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <Activity className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('Analyze', 'विश्लेषण')}</span>
                            <span className="sm:hidden">{t('Analyze', 'विश्लेषण')}</span>
                          </button>
                        </>
                      )}

                      {/* Delete / confirmation actions */}
                      {confirmDeleteId === rep._id ? (
                        <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 p-1.5 rounded-lg">
                          <span className="text-[10px] text-red-700 font-bold whitespace-nowrap">
                            {t('Delete?', 'हटाएं?')}
                          </span>
                          <button
                            disabled={deletingId === rep._id}
                            onClick={() => handleDelete(rep._id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded min-h-[32px]"
                          >
                            {deletingId === rep._id ? <Loader2 className="h-3 w-3 animate-spin" /> : t('Confirm', 'पुष्टि')}
                          </button>
                          <button
                            disabled={deletingId === rep._id}
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded min-h-[32px]"
                          >
                            {t('Cancel', 'रद्द')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(rep._id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title={t('Delete Repertory', 'रेपरटॉरी हटाएं')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload section */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5 text-[#062E6F]" />
                      {t('Upload Excel chapter file:', 'Excel अध्याय फ़ाइल अपलोड करें:')}
                    </p>

                    {/* Replace vs Append toggle */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
                      <button
                        onClick={() => setUpState(rep._id, { replaceMode: true })}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                          st.replaceMode !== false
                            ? 'bg-white shadow text-[#062E6F]'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {t('🔄 Replace all', '🔄 सब बदलें')}
                      </button>
                      <button
                        onClick={() => setUpState(rep._id, { replaceMode: false })}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                          st.replaceMode === false
                            ? 'bg-white shadow text-emerald-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {t('➕ Add to existing', '➕ मौजूदा में जोड़ें')}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {st.replaceMode === false
                        ? t('New chapter will be added on top of existing rubrics.', 'नया अध्याय मौजूदा रुब्रिक्स के साथ जुड़ेगा।')
                        : t('All existing rubrics will be deleted before import.', 'आयात से पहले सभी मौजूदा रुब्रिक्स हटा दिए जाएंगे।')}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* File chooser */}
                      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        {st.file ? st.file.name : t('Choose .xlsx / .xls', 'Excel फ़ाइल चुनें')}
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          className="hidden"
                          onChange={e => {
                            setUpState(rep._id, { file: e.target.files[0], result: null });
                          }}
                        />
                      </label>

                      {st.file && (
                        <>
                          <span className="text-xs text-slate-400">
                            {(st.file.size / 1024).toFixed(0)} KB
                          </span>
                          <button
                            onClick={() => handleUpload(rep)}
                            disabled={st.uploading}
                            className="terracotta-btn text-xs px-4 py-2"
                          >
                            {st.uploading
                              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('Importing…', 'आयात हो रहा है…')}</>
                              : <><Upload className="h-3.5 w-3.5" /> {t('Import Data', 'डेटा आयात करें')}</>}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Upload result */}
                    {hasResult && (
                      <div className={`text-xs p-3 rounded-lg border space-y-1 ${
                        isSuccess
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {isSuccess
                          ? <p className="font-semibold flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {st.result.rubricCount.toLocaleString()} {t('rubrics imported successfully!', 'रुब्रिक्स सफलतापूर्वक आयात हुए!')}
                            </p>
                          : <p className="font-semibold flex items-center gap-1.5">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {st.result.message}
                            </p>
                        }
                        {isSuccess && st.result.skippedRows > 0 && (
                          <p>{st.result.skippedRows} {t('rows skipped.', 'पंक्तियाँ छोड़ी गईं।')}</p>
                        )}
                        {isSuccess && st.result.medicinesDetected?.length > 0 && (
                          <p>
                            {t('Medicines detected', 'दवाएं')}: <span className="font-semibold">{st.result.medicinesDetected.slice(0, 8).join(', ')}{st.result.medicinesDetected.length > 8 ? ` +${st.result.medicinesDetected.length - 8} more` : ''}</span>
                          </p>
                        )}
                        {isSuccess && st.result.errors?.length > 0 && (
                          <details className="mt-1">
                            <summary className="cursor-pointer font-medium">{t('Show row errors', 'पंक्ति त्रुटियाँ देखें')} ({st.result.errors.length})</summary>
                            <ul className="mt-1 space-y-0.5 max-h-24 overflow-y-auto">
                              {st.result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                            </ul>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
