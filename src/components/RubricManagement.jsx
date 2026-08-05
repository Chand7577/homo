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
    chapter: { en: '', hi: '' },
    rubric: { en: '', hi: '' },
    subrubric: { en: '', hi: '' },
    modalities: { aggravation: [], amelioration: [] },
    synonyms: { en: [], hi: [] }
  });
  
  // Edit form
  const [editForm, setEditForm] = useState({
    chapter: { en: '', hi: '' },
    rubric: { en: '', hi: '' },
    subrubric: { en: '', hi: '' },
    modalities: { aggravation: [], amelioration: [] },
    synonyms: { en: [], hi: [] }
  });

  const t = (en, hi) => lang === 'en' ? en : hi;

  useEffect(() => {
    fetchRepertories();
  }, []);

  useEffect(() => {
    fetchRubrics();
  }, [page, searchQuery, selectedRepertory, selectedChapter]);

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
        search: searchQuery || undefined,
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
        chapter: { en: '', hi: '' },
        rubric: { en: '', hi: '' },
        subrubric: { en: '', hi: '' },
        modalities: { aggravation: [], amelioration: [] },
        synonyms: { en: [], hi: [] }
      });
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
        synonyms: { en: [], hi: [] }
      });
      
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
      }
    });
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

      {/* Add New Rubric Form */}
      {isAddingNew && (
        <div className="surface p-6 space-y-4 border-2 border-[#062E6F]/20 rounded-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#062E6F]" />
              {t('Add New Rubric', 'नई रुब्रिक जोड़ें')}
            </h3>
            <button onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('Chapter (English)', 'अध्याय (अंग्रेज़ी)')}</label>
              <input
                type="text"
                value={newRubric.chapter.en}
                onChange={(e) => setNewRubric(prev => ({...prev, chapter: {...prev.chapter, en: e.target.value}}))}
                placeholder={t('e.g., Mind, Head, Stomach', 'उदा., मन, सिर, पेट')}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('Chapter (Hindi)', 'अध्याय (हिंदी)')}</label>
              <input
                type="text"
                value={newRubric.chapter.hi}
                onChange={(e) => setNewRubric(prev => ({...prev, chapter: {...prev.chapter, hi: e.target.value}}))}
                placeholder={t('e.g., मन, सिर, पेट', 'उदा., मन, सिर, पेट')}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('Rubric Name (English)', 'रुब्रिक नाम (अंग्रेज़ी)')}</label>
              <input
                type="text"
                value={newRubric.rubric.en}
                onChange={(e) => setNewRubric(prev => ({...prev, rubric: {...prev.rubric, en: e.target.value}}))}
                placeholder={t('e.g., Anger, easily provoked', 'उदा., क्रोध, आसानी से भड़कना')}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('Rubric Name (Hindi)', 'रुब्रिक नाम (हिंदी)')}</label>
              <input
                type="text"
                value={newRubric.rubric.hi}
                onChange={(e) => setNewRubric(prev => ({...prev, rubric: {...prev.rubric, hi: e.target.value}}))}
                placeholder={t('e.g., क्रोध, आसानी से भड़कना', 'उदा., क्रोध, आसानी से भड़कना')}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('Subrubric/Details (English)', 'सबरुब्रिक/विवरण (अंग्रेज़ी)')}</label>
              <input
                type="text"
                value={newRubric.subrubric.en}
                onChange={(e) => setNewRubric(prev => ({...prev, subrubric: {...prev.subrubric, en: e.target.value}}))}
                placeholder={t('e.g., morning; from contradiction', 'उदा., सुबह; विरोध से')}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('Aggravation Factors (↓ worse)', 'एग्रावेशन कारक (↓ बदतर)')} — {t('comma-separated', 'अल्पविराम से अलग करें')}</label>
              <input
                type="text"
                value={newRubric.modalities.aggravation.join(', ')}
                onChange={(e) => setNewRubric(prev => ({...prev, modalities: {...prev.modalities, aggravation: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}}))}
                placeholder={t('e.g., morning, noise, cold, stress', 'उदा., सुबह, शोर, ठंड, तनाव')}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('Amelioration Factors (↑ better)', 'एमेलियोरेशन कारक (↑ बेहतर)')} — {t('comma-separated', 'अल्पविराम से अलग करें')}</label>
              <input
                type="text"
                value={newRubric.modalities.amelioration.join(', ')}
                onChange={(e) => setNewRubric(prev => ({...prev, modalities: {...prev.modalities, amelioration: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}}))}
                placeholder={t('e.g., open air, warmth, rest', 'उदा., खुली हवा, गर्मी, आराम')}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('Synonyms/Related Terms (English)', 'समानार्थी/संबंधित शब्द (अंग्रेज़ी)')} — {t('comma-separated', 'अल्पविराम से अलग करें')}</label>
              <input
                type="text"
                value={newRubric.synonyms.en.join(', ')}
                onChange={(e) => setNewRubric(prev => ({...prev, synonyms: {...prev.synonyms, en: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}}))}
                placeholder={t('e.g., irritable, wrathful, furious', 'उदा., चिड़चिड़ा, क्रूर, क्रोधित')}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 outline-none"
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleAddRubric}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {t('Add Rubric', 'रुब्रिक जोड़ें')}
            </button>
            <button onClick={() => setIsAddingNew(false)} className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
              {t('Cancel', 'रद्द करें')}
            </button>
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