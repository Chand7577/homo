import React, { useState, useEffect } from 'react';
import { 
  Bookmark, Plus, Edit2, Save, X, Trash2, Search, 
  AlertCircle, CheckCircle, Loader2, ChevronDown, ChevronRight,
  RefreshCw
} from 'lucide-react';
import { getRubrics, updateRubric, createRubric, deleteRubric, getRepertories, getChapters } from '../services/api';

export default function RubricManagement({ lang = 'en' }) {
  const [rubrics, setRubrics] = useState([]);
  const [repertories, setRepertories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepertories, setLoadingRepertories] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepertory, setSelectedRepertory] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [editingRubric, setEditingRubric] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedRubrics, setExpandedRubrics] = useState({});
  
  // Chapters state
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  
  // New rubric form
  const [newRubric, setNewRubric] = useState({
    repertoryId: '',
    chapter: { en: '', hi: '' },
    rubric: { en: '', hi: '' },
    subrubric: { en: '', hi: '' },
    modalities: { aggravation: [], amelioration: [] },
    synonyms: { en: [], hi: [] },
    medicines: {}
  });
  
  // Edit form
  const [editForm, setEditForm] = useState({
    chapter: { en: '', hi: '' },
    rubric: { en: '', hi: '' },
    subrubric: { en: '', hi: '' },
    modalities: { aggravation: [], amelioration: [] },
    synonyms: { en: [], hi: [] },
    medicines: {}
  });

  // Medicine input for forms
  const [newMedicineInput, setNewMedicineInput] = useState({ name: '', grade: 3 });
  const [editMedicineInput, setEditMedicineInput] = useState({ name: '', grade: 3 });

  // Remedy addition inline state: { [rubricId]: { name: '', grade: 3 } }
  const [addingRemedy, setAddingRemedy] = useState({});

  // Debounced search query state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const t = (en, hi) => lang === 'en' ? en : hi;

  const handleAddRemedyToRubric = async (rubric) => {
    const currentInput = addingRemedy[rubric._id] || {};
    const remedyName = (currentInput.name || '').trim();
    const remedyGrade = Number(currentInput.grade || 3);

    if (!remedyName) return;

    const medicinesObj = rubric.medicines instanceof Map 
      ? Object.fromEntries(rubric.medicines) 
      : { ...(rubric.medicines || {}) };

    medicinesObj[remedyName] = remedyGrade;

    try {
      await updateRubric(rubric._id, { medicines: medicinesObj });
      setRubrics(prev => prev.map(r => r._id === rubric._id ? { ...r, medicines: medicinesObj } : r));
      setAddingRemedy(prev => ({ ...prev, [rubric._id]: { name: '', grade: 3 } }));
    } catch (err) {
      console.error('Error adding remedy:', err);
      setError(t('Failed to add remedy.', 'दवा जोड़ने में विफल।'));
    }
  };

  const handleRemoveRemedyFromRubric = async (rubric, remedyName) => {
    const medicinesObj = rubric.medicines instanceof Map 
      ? Object.fromEntries(rubric.medicines) 
      : { ...(rubric.medicines || {}) };

    delete medicinesObj[remedyName];

    try {
      await updateRubric(rubric._id, { medicines: medicinesObj });
      setRubrics(prev => prev.map(r => r._id === rubric._id ? { ...r, medicines: medicinesObj } : r));
    } catch (err) {
      console.error('Error removing remedy:', err);
    }
  };

  const handleCycleRemedyGrade = async (rubric, remedyName, currentGrade) => {
    const nextGrade = currentGrade >= 3 ? 1 : currentGrade + 1;
    const medicinesObj = rubric.medicines instanceof Map 
      ? Object.fromEntries(rubric.medicines) 
      : { ...(rubric.medicines || {}) };

    medicinesObj[remedyName] = nextGrade;

    try {
      await updateRubric(rubric._id, { medicines: medicinesObj });
      setRubrics(prev => prev.map(r => r._id === rubric._id ? { ...r, medicines: medicinesObj } : r));
    } catch (err) {
      console.error('Error updating remedy grade:', err);
    }
  };

  // Debounce search query by 350ms to prevent per-keystroke API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchRepertories();
  }, []);

  useEffect(() => {
    fetchRubrics();
  }, [page, debouncedSearchQuery, selectedRepertory, selectedChapter]);

  useEffect(() => {
    // Fetch chapters when repertory changes
    if (selectedRepertory && selectedRepertory !== 'all') {
      fetchChaptersForRepertory();
    } else {
      setChapters([]);
    }
  }, [selectedRepertory]);

  const fetchRepertories = async () => {
    try {
      setLoadingRepertories(true);
      // Request only actual Repertories (type='Repertory') from backend
      const data = await getRepertories({ type: 'Repertory' });
      setRepertories(data || []);
    } catch (err) {
      console.error('Error fetching repertories:', err);
      setError(t('Failed to load repertories.', 'रेपर्टरीज लोड करने में विफल।'));
    } finally {
      setLoadingRepertories(false);
    }
  };

  const fetchChaptersForRepertory = async () => {
    if (!selectedRepertory || selectedRepertory === 'all') {
      setChapters([]);
      return;
    }
    
    try {
      setLoadingChapters(true);
      console.log('Fetching chapters for repertory:', selectedRepertory);
      const data = await getChapters(selectedRepertory);
      console.log('Chapters received:', data);
      setChapters(data || []);
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setError(t('Failed to load chapters for this repertory.', 'इस रेपर्टरी के लिए अध्याय लोड करने में विफल।'));
      setChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  };

  const fetchRubrics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit,
        search: debouncedSearchQuery || undefined,
        repertoryId: selectedRepertory !== 'all' ? selectedRepertory : undefined,
        chapter: selectedChapter !== 'all' ? selectedChapter : undefined
      };
      
      const response = await getRubrics(params);
      setRubrics(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(t('Failed to load rubrics.', 'रुब्रिक्स लोड करने में विफल।'));
      console.error('Error fetching rubrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRubric = async () => {
    if (!newRubric.repertoryId) {
      setError(t('Please select a target Repertory.', 'कृपया एक रेपर्टरी चुनें।'));
      return;
    }

    if (!newRubric.chapter.en || !newRubric.rubric.en) {
      setError(t('Chapter and Rubric name are required.', 'अध्याय और रुब्रिक नाम आवश्यक हैं।'));
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await createRubric(newRubric);
      await fetchRubrics();
      
      setSuccess(t('Rubric added successfully!', 'रुब्रिक सफलतापूर्वक जोड़ी गई!'));
      setNewRubric({
        repertoryId: selectedRepertory !== 'all' ? selectedRepertory : (repertories[0]?._id || ''),
        chapter: { en: selectedChapter !== 'all' ? selectedChapter : '', hi: '' },
        rubric: { en: '', hi: '' },
        subrubric: { en: '', hi: '' },
        modalities: { aggravation: [], amelioration: [] },
        synonyms: { en: [], hi: [] },
        medicines: {}
      });
      setNewMedicineInput({ name: '', grade: 3 });
      setIsAddingNew(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to add rubric.', 'रुब्रिक जोड़ने में विफल।'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditRubric = async (rubricId) => {
    if (!editForm.chapter.en || !editForm.rubric.en) {
      setError(t('Chapter and Rubric name are required.', 'अध्याय और रुब्रिक नाम आवश्यक हैं।'));
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await updateRubric(rubricId, editForm);
      await fetchRubrics();
      
      setSuccess(t('Rubric updated successfully!', 'रुब्रिक सफलतापूर्वक अपडेट की गई!'));
      setEditingRubric(null);
      setEditForm({
        chapter: { en: '', hi: '' },
        rubric: { en: '', hi: '' },
        subrubric: { en: '', hi: '' },
        modalities: { aggravation: [], amelioration: [] },
        synonyms: { en: [], hi: [] },
        medicines: {}
      });
      setEditMedicineInput({ name: '', grade: 3 });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to update rubric.', 'रुब्रिक अपडेट करने में विफल।'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRubric = async (rubricId) => {
    if (!confirm(t('Are you sure you want to delete this rubric?', 'क्या आप वाकई इस रुब्रिक को हटाना चाहते हैं?'))) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await deleteRubric(rubricId);
      await fetchRubrics();
      
      setSuccess(t('Rubric deleted successfully!', 'रुब्रिक सफलतापूर्वक हटाई गई!'));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to delete rubric.', 'रुब्रिक हटाने में विफल।'));
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (rubric) => {
    setEditingRubric(rubric._id);
    const medicinesObj = rubric.medicines instanceof Map 
      ? Object.fromEntries(rubric.medicines) 
      : { ...(rubric.medicines || {}) };
    
    setEditForm({
      chapter: { en: rubric.chapter?.en || '', hi: rubric.chapter?.hi || '' },
      rubric: { en: rubric.rubric?.en || '', hi: rubric.rubric?.hi || '' },
      subrubric: { en: rubric.subrubric?.en || '', hi: rubric.subrubric?.hi || '' },
      modalities: {
        aggravation: rubric.modalities?.aggravation || [],
        amelioration: rubric.modalities?.amelioration || []
      },
      synonyms: {
        en: rubric.synonyms?.en || [],
        hi: rubric.synonyms?.hi || []
      },
      medicines: medicinesObj
    });
    setEditMedicineInput({ name: '', grade: 3 });
    setIsAddingNew(false);
  };

  const toggleExpand = (rubricId) => {
    setExpandedRubrics(prev => ({
      ...prev,
      [rubricId]: !prev[rubricId]
    }));
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && rubrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-[#062E6F] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">
          {t('Loading Rubrics...', 'रुब्रिक्स लोड हो रहे हैं...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-[#062E6F]" />
            {t("Rubrics Management", "रुब्रिक्स प्रबंधन")}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t("Manage homeopathic rubrics, subrubrics, synonyms, and modalities.", "होम्योपैथिक रुब्रिक्स, सबरुब्रिक्स, समानार्थी और मोडालिटीज़ का प्रबंधन करें।")}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchRubrics}
            className="flex items-center gap-1.5 text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg font-bold shadow-sm transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('Refresh', 'रीफ्रेश')}
          </button>
          
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingRubric(null);
              const foundCh = selectedChapter !== 'all' ? chapters.find(c => c.chapterEn === selectedChapter) : null;
              setNewRubric({
                repertoryId: selectedRepertory !== 'all' ? selectedRepertory : (repertories[0]?._id || ''),
                chapter: { 
                  en: selectedChapter !== 'all' ? selectedChapter : '', 
                  hi: foundCh?.chapterHi || '' 
                },
                rubric: { en: '', hi: '' },
                subrubric: { en: '', hi: '' },
                modalities: { aggravation: [], amelioration: [] },
                synonyms: { en: [], hi: [] },
                medicines: {}
              });
              setNewMedicineInput({ name: '', grade: 3 });
            }}
            className="flex items-center gap-1.5 text-xs bg-[#062E6F] hover:bg-[#042050] text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('Add Rubric', 'रुब्रिक जोड़ें')}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Add New Rubric Modal with Blurred Backdrop */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop with Blur */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
            onClick={() => setIsAddingNew(false)} 
          />

          {/* Modal Container Card */}
          <div className="relative bg-white border border-slate-200/80 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] z-10 overflow-hidden ring-1 ring-slate-900/5">
            
            {/* Pinned Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#062E6F]/10 flex items-center justify-center text-[#062E6F] shrink-0">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">
                    {t('Add New Rubric', 'नई रुब्रिक जोड़ें')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('Create a new rubric in your repertory database', 'अपनी रेपर्टरी डेटाबेस में नई रुब्रिक दर्ज करें')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddingNew(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 thin-scroll bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Target Repertory', 'लक्ष्य रेपर्टरी')}</label>
                  <select
                    value={newRubric.repertoryId}
                    onChange={(e) => setNewRubric(prev => ({...prev, repertoryId: e.target.value}))}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#062E6F] focus:ring-2 focus:ring-[#062E6F]/20 transition-all outline-none"
                  >
                    <option value="">{t('Select Repertory', 'रेपर्टरी चुनें')}</option>
                    {repertories.map(rep => (
                      <option key={rep._id} value={rep._id}>
                        {rep.name?.en || rep.name || 'Unnamed'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Chapter (English)', 'अध्याय (अंग्रेज़ी)')}</label>
                  <input
                    type="text"
                    value={newRubric.chapter.en}
                    onChange={(e) => {
                      const val = e.target.value;
                      const match = chapters.find(c => c.chapterEn?.toLowerCase() === val.trim().toLowerCase());
                      setNewRubric(prev => ({
                        ...prev,
                        chapter: {
                          en: val,
                          hi: match ? match.chapterHi : prev.chapter.hi
                        }
                      }));
                    }}
                    placeholder={t('e.g., Mind, Head, Stomach', 'उदा., मन, सिर, पेट')}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#062E6F] focus:ring-2 focus:ring-[#062E6F]/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Chapter (Hindi)', 'अध्याय (हिंदी)')}</label>
                  <input
                    type="text"
                    value={newRubric.chapter.hi}
                    onChange={(e) => setNewRubric(prev => ({...prev, chapter: {...prev.chapter, hi: e.target.value}}))}
                    placeholder={t('e.g., मन, सिर, पेट', 'उदा., मन, सिर, पेट')}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#062E6F] focus:ring-2 focus:ring-[#062E6F]/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Rubric Name (English)', 'रुब्रिक नाम (अंग्रेज़ी)')}</label>
                  <input
                    type="text"
                    value={newRubric.rubric.en}
                    onChange={(e) => setNewRubric(prev => ({...prev, rubric: {...prev.rubric, en: e.target.value}}))}
                    placeholder={t('e.g., Anger, easily provoked', 'उदा., क्रोध, आसानी से भड़कना')}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#062E6F] focus:ring-2 focus:ring-[#062E6F]/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Rubric Name (Hindi)', 'रुब्रिक नाम (हिंदी)')}</label>
                  <input
                    type="text"
                    value={newRubric.rubric.hi}
                    onChange={(e) => setNewRubric(prev => ({...prev, rubric: {...prev.rubric, hi: e.target.value}}))}
                    placeholder={t('e.g., क्रोध, आसानी से भड़कना', 'उदा., क्रोध, आसानी से भड़कना')}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#062E6F] focus:ring-2 focus:ring-[#062E6F]/20 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('Subrubric/Details (English)', 'सबरुब्रिक/विवरण (अंग्रेज़ी)')}</label>
                  <input
                    type="text"
                    value={newRubric.subrubric.en}
                    onChange={(e) => setNewRubric(prev => ({...prev, subrubric: {...prev.subrubric, en: e.target.value}}))}
                    placeholder={t('e.g., morning; from contradiction', 'उदा., सुबह; विरोध से')}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#062E6F] focus:ring-2 focus:ring-[#062E6F]/20 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Aggravation Factors (↓ worse)', 'एग्रावेशन कारक (↓ बदतर)')}
                    <span className="text-slate-400 font-normal ml-1">({t('comma-separated', 'अल्पविराम से अलग करें')})</span>
                  </label>
                  <input
                    type="text"
                    value={newRubric.modalities.aggravation.join(', ')}
                    onChange={(e) => setNewRubric(prev => ({...prev, modalities: {...prev.modalities, aggravation: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}}))}
                    placeholder={t('e.g., morning, noise, cold, stress', 'उदा., सुबह, शोर, ठंड, तनाव')}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#062E6F] focus:ring-2 focus:ring-[#062E6F]/20 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Amelioration Factors (↑ better)', 'एमेलियोरेशन कारक (↑ बेहतर)')}
                    <span className="text-slate-400 font-normal ml-1">({t('comma-separated', 'अल्पविराम से अलग करें')})</span>
                  </label>
                  <input
                    type="text"
                    value={newRubric.modalities.amelioration.join(', ')}
                    onChange={(e) => setNewRubric(prev => ({...prev, modalities: {...prev.modalities, amelioration: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}}))}
                    placeholder={t('e.g., open air, warmth, rest', 'उदा., खुली हवा, गर्मी, आराम')}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#062E6F] focus:ring-2 focus:ring-[#062E6F]/20 transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Synonyms/Related Terms', 'समानार्थी/संबंधित शब्द')}
                    <span className="text-slate-400 font-normal ml-1">({t('comma-separated', 'अल्पविराम से अलग करें')})</span>
                  </label>
                  <input
                    type="text"
                    value={newRubric.synonyms.en.join(', ')}
                    onChange={(e) => setNewRubric(prev => ({...prev, synonyms: {...prev.synonyms, en: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}}))}
                    placeholder={t('e.g., irritable, wrathful, furious', 'उदा., चिड़चिड़ा, क्रूर, क्रोधित')}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#062E6F] focus:ring-2 focus:ring-[#062E6F]/20 transition-all outline-none"
                  />
                </div>

                {/* Medicines Section */}
                <div className="md:col-span-2 pt-4 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    {t('Associated Medicines (Remedies)', 'संबंधित दवाएं (रेमेडीज़)')}
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-semibold">
                      {Object.keys(newRubric.medicines || {}).length}
                    </span>
                  </label>
                  
                  {/* Medicine Pills */}
                  {Object.keys(newRubric.medicines || {}).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {Object.entries(newRubric.medicines || {}).map(([medName, grade]) => {
                        const gradeStyles = grade === 3 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : grade === 2 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200';
                        
                        return (
                          <div 
                            key={medName} 
                            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-semibold ${gradeStyles}`}
                          >
                            <span 
                              onClick={() => {
                                const nextGrade = grade >= 3 ? 1 : grade + 1;
                                setNewRubric(prev => ({
                                  ...prev,
                                  medicines: { ...prev.medicines, [medName]: nextGrade }
                                }));
                              }}
                              className="cursor-pointer flex items-center gap-1 hover:opacity-75"
                              title={t('Click to cycle grade', 'ग्रेड बदलने के लिए क्लिक करें')}
                            >
                              <span>{medName}</span>
                              <span className="text-[10px] opacity-80 bg-white/70 px-1 rounded font-bold">{grade}°</span>
                            </span>
                            <button 
                              onClick={() => {
                                const updated = { ...newRubric.medicines };
                                delete updated[medName];
                                setNewRubric(prev => ({ ...prev, medicines: updated }));
                              }}
                              className="opacity-60 hover:opacity-100 ml-0.5 p-0.5"
                              title={t('Remove', 'हटाएं')}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Medicine Input */}
                  <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-200">
                    <input 
                      type="text"
                      value={newMedicineInput.name}
                      onChange={(e) => setNewMedicineInput(prev => ({ ...prev, name: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newMedicineInput.name.trim()) {
                          setNewRubric(prev => ({
                            ...prev,
                            medicines: { ...prev.medicines, [newMedicineInput.name.trim()]: newMedicineInput.grade }
                          }));
                          setNewMedicineInput({ name: '', grade: 3 });
                        }
                      }}
                      placeholder={t('Medicine name (e.g., Acon., Nux-v)...', 'दवा का नाम (उदा. Acon., Nux-v)...')}
                      className="flex-1 text-xs px-3 py-2 outline-none bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#062E6F]"
                    />
                    <select 
                      value={newMedicineInput.grade}
                      onChange={(e) => setNewMedicineInput(prev => ({ ...prev, grade: Number(e.target.value) }))}
                      className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none text-slate-700 focus:border-[#062E6F]"
                    >
                      <option value={3}>3° ({t('High', 'उच्च')})</option>
                      <option value={2}>2° ({t('Medium', 'मध्यम')})</option>
                      <option value={1}>1° ({t('Low', 'निम्न')})</option>
                    </select>
                    <button
                      onClick={() => {
                        if (newMedicineInput.name.trim()) {
                          setNewRubric(prev => ({
                            ...prev,
                            medicines: { ...prev.medicines, [newMedicineInput.name.trim()]: newMedicineInput.grade }
                          }));
                          setNewMedicineInput({ name: '', grade: 3 });
                        }
                      }}
                      className="px-3 py-2 bg-[#062E6F] hover:bg-[#042050] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {t('Add', 'जोड़ें')}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 italic">
                    {t('Press Enter or click Add to include medicines in this rubric', 'इस रुब्रिक में दवाएं शामिल करने के लिए Enter दबाएं या Add क्लिक करें')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Pinned Modal Footer Actions */}
            <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsAddingNew(false)} 
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                {t('Cancel', 'रद्द करें')}
              </button>
              <button
                onClick={handleAddRubric}
                disabled={saving}
                className="px-5 py-2.5 bg-[#062E6F] hover:bg-[#042050] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('Add Rubric', 'रुब्रिक जोड़ें')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="surface p-4 space-y-4">
        {/* Repertory Filter - Full Width */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">
            {t('Filter by Repertory', 'रेपर्टरी के अनुसार फ़िल्टर')}
          </label>
          <select
            value={selectedRepertory}
            onChange={(e) => {
              setSelectedRepertory(e.target.value);
              setSelectedChapter('all'); // Reset chapter when repertory changes
              setPage(1);
            }}
            disabled={loadingRepertories}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none disabled:opacity-50"
          >
            <option value="all">{t('All Repertories', 'सभी रेपर्टरीज')}</option>
            {repertories.map(rep => (
              <option key={rep._id} value={rep._id}>
                {rep.name?.en || rep.name || 'Unnamed'}
              </option>
            ))}
          </select>
        </div>

        {/* Search and Chapter Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">{t('Search Rubrics', 'रुब्रिक्स खोजें')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {setSearchQuery(e.target.value); setPage(1);}}
                placeholder={t('Type rubric or keyword...', 'रुब्रिक या कीवर्ड टाइप करें...')}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">{t('Filter by Chapter', 'अध्याय के अनुसार फ़िल्टर')}</label>
            <select
              value={selectedChapter}
              onChange={(e) => {setSelectedChapter(e.target.value); setPage(1);}}
              disabled={loadingChapters || selectedRepertory === 'all'}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingChapters ? (
                <option value="all">{t('Loading chapters...', 'अध्याय लोड हो रहे हैं...')}</option>
              ) : selectedRepertory === 'all' ? (
                <option value="all">{t('Select a repertory first', 'पहले एक रेपर्टरी चुनें')}</option>
              ) : chapters.length === 0 ? (
                <option value="all">{t('No chapters found', 'कोई अध्याय नहीं मिला')}</option>
              ) : (
                <>
                  <option value="all">{t('All Chapters', 'सभी अध्याय')}</option>
                  {chapters.sort((a, b) => (a.chapterEn || '').localeCompare(b.chapterEn || '')).map(ch => (
                    <option key={ch.chapterEn} value={ch.chapterEn}>
                      {ch.chapterEn} ({ch.rubricCount || 0} {t('rubrics', 'रुब्रिक्स')})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Rubrics List */}
      <div className="space-y-2">
        {rubrics.length === 0 ? (
          <div className="surface p-12 text-center">
            <Bookmark className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-600">
              {searchQuery 
                ? t('No rubrics found.', 'कोई रुब्रिक नहीं मिली।')
                : t('No rubrics available.', 'कोई रुब्रिक उपलब्ध नहीं है।')
              }
            </h3>
          </div>
        ) : (
          rubrics.map((rubric) => (
            <div key={rubric._id} className="surface border border-slate-200 rounded-xl overflow-hidden">
              {editingRubric === rubric._id ? (
                <div className="p-6 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Edit2 className="h-4 w-4 text-[#062E6F]" />
                    {t('Edit Rubric', 'रुब्रिक संपादित करें')}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{t('Chapter (English)', 'अध्याय (अंग्रेज़ी)')}</label>
                      <input
                        type="text"
                        value={editForm.chapter.en}
                        onChange={(e) => setEditForm(prev => ({...prev, chapter: {...prev.chapter, en: e.target.value}}))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{t('Chapter (Hindi)', 'अध्याय (हिंदी)')}</label>
                      <input
                        type="text"
                        value={editForm.chapter.hi}
                        onChange={(e) => setEditForm(prev => ({...prev, chapter: {...prev.chapter, hi: e.target.value}}))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{t('Rubric Name (English)', 'रुब्रिक नाम (अंग्रेज़ी)')}</label>
                      <input
                        type="text"
                        value={editForm.rubric.en}
                        onChange={(e) => setEditForm(prev => ({...prev, rubric: {...prev.rubric, en: e.target.value}}))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{t('Rubric Name (Hindi)', 'रुब्रिक नाम (हिंदी)')}</label>
                      <input
                        type="text"
                        value={editForm.rubric.hi}
                        onChange={(e) => setEditForm(prev => ({...prev, rubric: {...prev.rubric, hi: e.target.value}}))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">{t('Subrubric/Details (English)', 'सबरुब्रिक/विवरण (अंग्रेज़ी)')}</label>
                      <input
                        type="text"
                        value={editForm.subrubric.en}
                        onChange={(e) => setEditForm(prev => ({...prev, subrubric: {...prev.subrubric, en: e.target.value}}))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">{t('Aggravation Factors (↓ worse)', 'एग्रावेशन कारक (↓ बदतर)')} — {t('comma-separated', 'अल्पविराम से अलग करें')}</label>
                      <input
                        type="text"
                        value={editForm.modalities.aggravation.join(', ')}
                        onChange={(e) => setEditForm(prev => ({...prev, modalities: {...prev.modalities, aggravation: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}}))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
                        placeholder={t('e.g., morning, noise, cold, stress', 'उदा., सुबह, शोर, ठंड, तनाव')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">{t('Amelioration Factors (↑ better)', 'एमेलियोरेशन कारक (↑ बेहतर)')} — {t('comma-separated', 'अल्पविराम से अलग करें')}</label>
                      <input
                        type="text"
                        value={editForm.modalities.amelioration.join(', ')}
                        onChange={(e) => setEditForm(prev => ({...prev, modalities: {...prev.modalities, amelioration: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}}))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
                        placeholder={t('e.g., open air, warmth, rest', 'उदा., खुली हवा, गर्मी, आराम')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1">{t('Synonyms/Related Terms (English)', 'समानार्थी/संबंधित शब्द (अंग्रेज़ी)')} — {t('comma-separated', 'अल्पविराम से अलग करें')}</label>
                      <input
                        type="text"
                        value={editForm.synonyms.en.join(', ')}
                        onChange={(e) => setEditForm(prev => ({...prev, synonyms: {...prev.synonyms, en: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}}))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
                        placeholder={t('e.g., irritable, wrathful, furious', 'उदा., चिड़चिड़ा, क्रूर, क्रोधित')}
                      />
                    </div>

                    {/* Medicines Section in Edit Form */}
                    <div className="md:col-span-2 pt-4 border-t border-slate-200">
                      <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        {t('Associated Medicines (Remedies)', 'संबंधित दवाएं (रेमेडीज़)')}
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-semibold">
                          {Object.keys(editForm.medicines || {}).length}
                        </span>
                      </label>
                      
                      {/* Medicine Pills */}
                      {Object.keys(editForm.medicines || {}).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Object.entries(editForm.medicines || {}).map(([medName, grade]) => {
                            const gradeStyles = grade === 3 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : grade === 2 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200';
                            
                            return (
                              <div 
                                key={medName} 
                                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-semibold ${gradeStyles}`}
                              >
                                <span 
                                  onClick={() => {
                                    const nextGrade = grade >= 3 ? 1 : grade + 1;
                                    setEditForm(prev => ({
                                      ...prev,
                                      medicines: { ...prev.medicines, [medName]: nextGrade }
                                    }));
                                  }}
                                  className="cursor-pointer flex items-center gap-1 hover:opacity-75"
                                  title={t('Click to cycle grade', 'ग्रेड बदलने के लिए क्लिक करें')}
                                >
                                  <span>{medName}</span>
                                  <span className="text-[10px] opacity-80 bg-white/70 px-1 rounded font-bold">{grade}°</span>
                                </span>
                                <button 
                                  onClick={() => {
                                    const updated = { ...editForm.medicines };
                                    delete updated[medName];
                                    setEditForm(prev => ({ ...prev, medicines: updated }));
                                  }}
                                  className="opacity-60 hover:opacity-100 ml-0.5 p-0.5"
                                  title={t('Remove', 'हटाएं')}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Medicine Input */}
                      <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl border border-slate-200">
                        <input 
                          type="text"
                          value={editMedicineInput.name}
                          onChange={(e) => setEditMedicineInput(prev => ({ ...prev, name: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && editMedicineInput.name.trim()) {
                              setEditForm(prev => ({
                                ...prev,
                                medicines: { ...prev.medicines, [editMedicineInput.name.trim()]: editMedicineInput.grade }
                              }));
                              setEditMedicineInput({ name: '', grade: 3 });
                            }
                          }}
                          placeholder={t('Medicine name (e.g., Acon., Nux-v)...', 'दवा का नाम (उदा. Acon., Nux-v)...')}
                          className="flex-1 text-xs px-3 py-2 outline-none bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#062E6F]"
                        />
                        <select 
                          value={editMedicineInput.grade}
                          onChange={(e) => setEditMedicineInput(prev => ({ ...prev, grade: Number(e.target.value) }))}
                          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none text-slate-700 focus:border-[#062E6F]"
                        >
                          <option value={3}>3° ({t('High', 'उच्च')})</option>
                          <option value={2}>2° ({t('Medium', 'मध्यम')})</option>
                          <option value={1}>1° ({t('Low', 'निम्न')})</option>
                        </select>
                        <button
                          onClick={() => {
                            if (editMedicineInput.name.trim()) {
                              setEditForm(prev => ({
                                ...prev,
                                medicines: { ...prev.medicines, [editMedicineInput.name.trim()]: editMedicineInput.grade }
                              }));
                              setEditMedicineInput({ name: '', grade: 3 });
                            }
                          }}
                          className="px-3 py-2 bg-[#062E6F] hover:bg-[#042050] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          {t('Add', 'जोड़ें')}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 italic">
                        {t('Press Enter or click Add to include medicines in this rubric', 'इस रुब्रिक में दवाएं शामिल करने के लिए Enter दबाएं या Add क्लिक करें')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleEditRubric(rubric._id)}
                      disabled={saving}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      {t('Save Changes', 'परिवर्तन सहेजें')}
                    </button>
                    <button onClick={() => setEditingRubric(null)} className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                      {t('Cancel', 'रद्द करें')}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="p-4 hover:bg-slate-50/50 cursor-pointer flex items-start justify-between" onClick={() => toggleExpand(rubric._id)}>
                    <div className="flex items-start gap-3 flex-1">
                      <button className="mt-0.5 text-slate-400">
                        {expandedRubrics[rubric._id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      <div className="flex-1">
                        <span className="text-xs font-bold text-[#062E6F]">{rubric.chapter?.en}</span>
                        <h4 className="text-sm font-bold text-slate-800 mt-0.5">{rubric.rubric?.en}</h4>
                        {rubric.subrubric?.en && <p className="text-xs text-slate-600 mt-1 italic">{rubric.subrubric.en}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={(e) => {e.stopPropagation(); startEditing(rubric);}} className="p-2 text-slate-600 hover:text-[#062E6F] hover:bg-slate-100 rounded-lg">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => {e.stopPropagation(); handleDeleteRubric(rubric._id);}} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {expandedRubrics[rubric._id] && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      {rubric.modalities && (rubric.modalities.aggravation?.length > 0 || rubric.modalities.amelioration?.length > 0) && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 mb-1.5">{t('Modalities', 'मोडालिटीज़')}</p>
                          <div className="flex flex-wrap gap-2">
                            {rubric.modalities.aggravation?.map((agg, i) => <span key={`agg-${i}`} className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded font-medium">↓ {agg}</span>)}
                            {rubric.modalities.amelioration?.map((amel, i) => <span key={`amel-${i}`} className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded font-medium">↑ {amel}</span>)}
                          </div>
                        </div>
                      )}
                      
                      {rubric.synonyms && (rubric.synonyms.en?.length > 0 || rubric.synonyms.hi?.length > 0) && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 mb-1.5">{t('Synonyms', 'समानार्थी')}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {rubric.synonyms.en?.map((syn, i) => <span key={i} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded">{syn}</span>)}
                          </div>
                        </div>
                      )}

                      {/* Associated Remedies Section */}
                      <div className="pt-2 border-t border-slate-200/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <span>{t('Associated Remedies (Medicines)', 'संबंधित दवाएं (रेमेडीज़)')}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-semibold">
                              {Object.keys(rubric.medicines instanceof Map ? Object.fromEntries(rubric.medicines) : (rubric.medicines || {})).length}
                            </span>
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> 3° {t('High', 'उच्च')}</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 2° {t('Medium', 'मध्यम')}</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 1° {t('Low', 'निम्न')}</span>
                          </div>
                        </div>

                        {/* Remedies Pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(rubric.medicines instanceof Map ? Object.fromEntries(rubric.medicines) : (rubric.medicines || {})).map(([medName, grade]) => {
                            const gradeStyles = grade === 3 
                              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                              : grade === 2 
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
                            
                            return (
                              <div 
                                key={medName} 
                                className={`group flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${gradeStyles}`}
                                title={t('Click to cycle grade (1° -> 2° -> 3°)', 'ग्रेड बदलने के लिए क्लिक करें (1° -> 2° -> 3°)')}
                              >
                                <span onClick={() => handleCycleRemedyGrade(rubric, medName, grade)} className="flex items-center gap-1">
                                  <span>{medName}</span>
                                  <span className="text-[10px] opacity-80 bg-white/70 px-1 rounded font-bold">{grade}°</span>
                                </span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRemoveRemedyFromRubric(rubric, medName); }}
                                  className="opacity-60 hover:opacity-100 hover:text-red-800 ml-0.5 p-0.5"
                                  title={t('Remove remedy', 'दवा हटाएं')}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                          {Object.keys(rubric.medicines instanceof Map ? Object.fromEntries(rubric.medicines) : (rubric.medicines || {})).length === 0 && (
                            <span className="text-xs text-slate-400 italic">{t('No medicines added to this rubric yet.', 'इस रुब्रिक में अभी कोई दवा नहीं जोड़ी गई है।')}</span>
                          )}
                        </div>

                        {/* Add New Remedy Bar */}
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm mt-2">
                          <input 
                            type="text"
                            value={addingRemedy[rubric._id]?.name || ''}
                            onChange={(e) => setAddingRemedy(prev => ({
                              ...prev,
                              [rubric._id]: { ...(prev[rubric._id] || {}), name: e.target.value }
                            }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddRemedyToRubric(rubric); }}
                            placeholder={t('Add remedy name (e.g. Acon., Nux-v)...', 'दवा का नाम जोड़ें (उदा. Acon., Nux-v)...')}
                            className="flex-1 text-xs px-2 py-1 outline-none bg-transparent text-slate-800"
                          />
                          <select 
                            value={addingRemedy[rubric._id]?.grade || 3}
                            onChange={(e) => setAddingRemedy(prev => ({
                              ...prev,
                              [rubric._id]: { ...(prev[rubric._id] || {}), grade: Number(e.target.value) }
                            }))}
                            className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-700"
                          >
                            <option value={3}>3° ({t('High', 'उच्च')})</option>
                            <option value={2}>2° ({t('Medium', 'मध्यम')})</option>
                            <option value={1}>1° ({t('Low', 'निम्न')})</option>
                          </select>
                          <button
                            onClick={() => handleAddRemedyToRubric(rubric)}
                            className="px-3 py-1 bg-[#062E6F] hover:bg-[#042050] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shrink-0"
                          >
                            <Plus className="h-3 w-3" />
                            {t('Add Remedy', 'दवा जोड़ें')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">
            {t('Previous', 'पिछला')}
          </button>
          <span className="text-xs text-slate-600">{t('Page', 'पृष्ठ')} {page} {t('of', 'कुल')} {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">
            {t('Next', 'अगला')}
          </button>
        </div>
      )}
    </div>
  );
}