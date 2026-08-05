import React, { useState, useEffect } from 'react';
import { 
  Pill, Plus, Edit2, Save, X, Trash2, Search, 
  AlertCircle, CheckCircle, Loader2,
  ChevronUp, ChevronDown, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../services/api';

export default function MedicineManagement({ lang = 'en' }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // New medicine form
  const [newMedicine, setNewMedicine] = useState({ name: '', grade: 1 });
  
  // Filters and sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // Edit form
  const [editForm, setEditForm] = useState({ name: '', grade: 1 });

  const t = (en, hi) => lang === 'en' ? en : hi;

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching medicines...');
      const response = await getMedicines();
      console.log('Medicine API response:', response);
      setMedicines(response.data || []);
      console.log('Medicines set to:', response.data || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError(t('Failed to load medicines.', 'दवाएं लोड करने में विफल।'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async () => {
    if (!newMedicine.name.trim()) {
      setError(t('Medicine name is required.', 'दवा का नाम आवश्यक है।'));
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const medicineData = {
        name: newMedicine.name.trim(),
        defaultGrade: newMedicine.grade,
        description: `Homeopathic medicine added manually.`,
        descriptionHindi: `मैन्युअल रूप से जोड़ी गई होम्योपैथिक दवा।`,
        createdBy: 'user'
      };
      
      await createMedicine(medicineData);
      await fetchMedicines(); // Refresh the list
      
      setSuccess(t('Medicine added successfully!', 'दवा सफलतापूर्वक जोड़ी गई!'));
      setNewMedicine({ name: '', grade: 1 });
      setIsAddingNew(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to add medicine.', 'दवा जोड़ने में विफल।'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditMedicine = async (medicineId) => {
    if (!editForm.name.trim()) {
      setError(t('Medicine name is required.', 'दवा का नाम आवश्यक है।'));
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const updateData = {
        name: editForm.name.trim(),
        defaultGrade: editForm.grade
      };
      
      await updateMedicine(medicineId, updateData);
      await fetchMedicines(); // Refresh the list
      
      setSuccess(t('Medicine updated successfully!', 'दवा सफलतापूर्वक अपडेट की गई!'));
      setEditingMedicine(null);
      setEditForm({ name: '', grade: 1 });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to update medicine.', 'दवा अपडेट करने में विफल।'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (!confirm(t('Are you sure you want to delete this medicine?', 'क्या आप वाकई इस दवा को हटाना चाहते हैं?'))) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await deleteMedicine(medicineId);
      await fetchMedicines(); // Refresh the list
      
      setSuccess(t('Medicine deleted successfully!', 'दवा सफलतापूर्वक हटाई गई!'));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('Failed to delete medicine.', 'दवा हटाने में विफल।'));
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (medicine) => {
    setEditingMedicine(medicine._id);
    setEditForm({ name: medicine.name, grade: medicine.defaultGrade });
    setIsAddingNew(false);
  };

  const cancelEditing = () => {
    setEditingMedicine(null);
    setEditForm({ name: '', grade: 1 });
  };

  // Filter and sort medicines
  const filteredMedicines = medicines
    .filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * modifier;
        case 'grade':
          return (a.defaultGrade - b.defaultGrade) * modifier;
        case 'rubricsCount':
          return (a.rubricsCount - b.rubricsCount) * modifier;
        default:
          return 0;
      }
    });

  // Pagination calculations
  const totalItems = filteredMedicines.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMedicines = filteredMedicines.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortOrder]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 3: return 'text-red-600 bg-red-50 border-red-200';
      case 2: return 'text-amber-600 bg-amber-50 border-amber-200';
      case 1: return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getGradeLabel = (grade) => {
    const labels = {
      3: t('High Grade', 'उच्च श्रेणी'),
      2: t('Medium Grade', 'मध्यम श्रेणी'),
      1: t('Low Grade', 'निम्न श्रेणी')
    };
    return labels[grade] || '';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-[#062E6F] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">
          {t('Loading Medicine Database...', 'दवा डेटाबेस लोड हो रहा है...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header - Desktop only */}
      <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Pill className="h-6 w-6 text-[#062E6F]" />
            {t("Medicine Database Management", "दवा डेटाबेस प्रबंधन")}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t("Add, edit, or remove homeopathic medicines and manage their grading system.", "होम्योपैथिक दवाएं जोड़ें, संपादित करें या हटाएं और उनकी ग्रेडिंग प्रणाली का प्रबंधन करें।")}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchMedicines}
            className="flex items-center gap-1.5 text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg font-bold shadow-sm transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('Refresh', 'रीफ्रेश')}
          </button>
          
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingMedicine(null);
            }}
            className="flex items-center gap-1.5 text-xs bg-[#062E6F] hover:bg-[#042050] text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('Add Medicine', 'दवा जोड़ें')}
          </button>
        </div>
      </div>

      {/* Mobile Header - Compact */}
      <div className="lg:hidden flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Pill className="h-5 w-5 text-[#062E6F]" />
            {t("Medicines", "दवाएं")}
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {totalItems} {t('total', 'कुल')}
          </p>
        </div>
        <button
          onClick={fetchMedicines}
          className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
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

      {/* Add New Medicine Form - Full width modal on mobile */}
      {isAddingNew && (
        <>
          {/* Mobile: Full screen overlay */}
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsAddingNew(false)} />
          
          <div className="lg:relative lg:animate-none fixed lg:static inset-x-0 bottom-0 lg:inset-auto z-50 lg:z-auto animate-slide-up">
            <div className="surface p-4 lg:p-6 space-y-4 border-2 border-[#062E6F]/20 rounded-t-2xl lg:rounded-xl max-h-[85vh] lg:max-h-none overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#062E6F]" />
                  {t('Add New Medicine', 'नई दवा जोड़ें')}
                </h3>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {t('Medicine Name', 'दवा का नाम')} *
                  </label>
                  <input
                    type="text"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('e.g. Arsenicum Album', 'जैसे आर्सेनिकम एल्बम')}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {t('Default Grade', 'डिफ़ॉल्ट ग्रेड')}
                  </label>
                  <select
                    value={newMedicine.grade}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, grade: parseInt(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
                  >
                    <option value={1}>1° - {t('Low Grade', 'निम्न श्रेणी')}</option>
                    <option value={2}>2° - {t('Medium Grade', 'मध्यम श्रेणी')}</option>
                    <option value={3}>3° - {t('High Grade', 'उच्च श्रेणी')}</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={handleAddMedicine}
                  disabled={saving}
                  className="flex-1 lg:flex-none px-4 py-2.5 lg:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  {t('Add Medicine', 'दवा जोड़ें')}
                </button>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-2.5 lg:py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sticky Search Bar - Mobile */}
      <div className="lg:hidden bg-[#F8F6F0] pt-2 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search medicines...', 'दवाएं खोजें...')}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none shadow-sm"
          />
        </div>
        
        {/* Collapsible Filters Button */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className="w-full mt-2 flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('Filters & Sort', 'फ़िल्टर और क्रमबद्ध')}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Collapsible Filters Panel - Mobile */}
      {showFilters && (
        <div className="lg:hidden surface p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                {t('Sort By', 'क्रमबद्ध')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
              >
                <option value="name">{t('Name', 'नाम')}</option>
                <option value="grade">{t('Grade', 'ग्रेड')}</option>
                <option value="rubricsCount">{t('Usage', 'उपयोग')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                {t('Per Page', 'प्रति पृष्ठ')}
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500 text-center pt-2 border-t border-slate-100">
            {t('Showing', 'दिखाया जा रहा है')} {startIndex + 1}-{Math.min(endIndex, totalItems)} {t('of', 'में से')} {totalItems}
          </div>
        </div>
      )}

      {/* Desktop Filters and Search */}
      <div className="hidden lg:block surface p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              {t('Search Medicines', 'दवाएं खोजें')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Type medicine name...', 'दवा का नाम टाइप करें...')}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
              />
            </div>
          </div>
          
          {/* Sort */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              {t('Sort By', 'क्रमबद्ध करें')}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
            >
              <option value="name">{t('Name', 'नाम')}</option>
              <option value="grade">{t('Grade', 'ग्रेड')}</option>
              <option value="rubricsCount">{t('Usage', 'उपयोग')}</option>
            </select>
          </div>

          {/* Items per Page */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              {t('Per Page', 'प्रति पृष्ठ')}
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
            >
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>{t('Total medicines:', 'कुल दवाएं:')} <strong>{totalItems}</strong></span>
            {searchQuery && <span>{t('Filtered results:', 'फ़िल्टर किए गए परिणाम:')} <strong>{totalItems}</strong></span>}
          </div>
          <span>
            {t('Showing', 'दिखाया जा रहा है')} {startIndex + 1}-{Math.min(endIndex, totalItems)} {t('of', 'में से')} {totalItems}
          </span>
        </div>
      </div>

      {/* Medicine List */}
      <div className="space-y-2">
        {totalItems === 0 ? (
          <div className="surface p-12 text-center">
            <Pill className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-600 mb-2">
              {searchQuery 
                ? t('No medicines found matching your search.', 'आपकी खोज से मेल खाने वाली कोई दवा नहीं मिली।')
                : t('No medicines available.', 'कोई दवा उपलब्ध नहीं है।')
              }
            </h3>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#062E6F] hover:underline"
              >
                {t('Clear search', 'खोज साफ़ करें')}
              </button>
            )}
          </div>
        ) : (
          <>
            {paginatedMedicines.map((medicine) => (
              <div key={medicine._id} className="surface p-3 lg:p-4 hover:shadow-md transition-shadow">
                {editingMedicine === medicine._id ? (
                  // Edit Form
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {t('Medicine Name', 'दवा का नाम')}
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {t('Grade', 'ग्रेड')}
                        </label>
                        <select
                          value={editForm.grade}
                          onChange={(e) => setEditForm(prev => ({ ...prev, grade: parseInt(e.target.value) }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
                        >
                          <option value={1}>1° - {t('Low Grade', 'निम्न श्रेणी')}</option>
                          <option value={2}>2° - {t('Medium Grade', 'मध्यम श्रेणी')}</option>
                          <option value={3}>3° - {t('High Grade', 'उच्च श्रेणी')}</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleEditMedicine(medicine._id)}
                        disabled={saving}
                        className="flex-1 lg:flex-none px-4 py-2.5 lg:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        {t('Save', 'सहेजें')}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-2.5 lg:py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors min-h-[44px]"
                      >
                        {t('Cancel', 'रद्द करें')}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode - Compact for mobile
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                      <span className={`w-7 h-7 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getGradeColor(medicine.defaultGrade)} border`}>
                        {medicine.defaultGrade}°
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{medicine.name}</h4>
                        <p className="text-[10px] lg:text-xs text-slate-500 truncate">
                          {medicine.rubricsCount} {t('rubrics', 'रुब्रिक्स')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEditing(medicine)}
                        className="p-2 lg:p-2 text-slate-600 hover:text-[#062E6F] hover:bg-slate-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title={t('Edit medicine', 'दवा संपादित करें')}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(medicine._id)}
                        className="p-2 lg:p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title={t('Delete medicine', 'दवा हटाएं')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="surface p-4">
                {/* Mobile Pagination - Simplified */}
                <div className="lg:hidden flex items-center justify-between gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] flex-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    {t('Prev', 'पिछला')}
                  </button>
                  
                  <div className="text-xs font-bold text-slate-600 px-3">
                    {currentPage} / {totalPages}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] flex-1"
                  >
                    {t('Next', 'अगला')}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Desktop Pagination - Full */}
                <div className="hidden lg:flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 px-3.5 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    {t('Previous', 'पिछला')}
                  </button>
                  
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {[...Array(Math.min(7, totalPages))].map((_, index) => {
                      let pageNumber;
                      
                      if (totalPages <= 7) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 4) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNumber = totalPages - 6 + index;
                      } else {
                        pageNumber = currentPage - 3 + index;
                      }
                      
                      const isActive = pageNumber === currentPage;
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`w-11 h-11 md:w-8 md:h-8 text-xs font-bold rounded-lg transition-colors flex items-center justify-center shrink-0 ${
                            isActive 
                              ? 'bg-[#062E6F] text-white' 
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 px-3.5 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                  >
                    {t('Next', 'अगला')}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="text-xs text-slate-500">
                  {t('Page', 'पेज')} {currentPage} {t('of', 'में से')} {totalPages} • {totalItems} {t('total medicines', 'कुल दवाएं')}
                </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Add Button - Mobile Only */}
      <button
        onClick={() => {
          setIsAddingNew(true);
          setEditingMedicine(null);
        }}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#062E6F] hover:bg-[#042050] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 active:scale-95"
        aria-label={t('Add Medicine', 'दवा जोड़ें')}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}