import React, { useState, useEffect } from 'react';
import { Brain, Search, Trash2, Calendar, BookOpen, AlertCircle, Loader2, Eye, Edit2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAnalyses, deleteAnalysis, getAnalysis } from '../services/api';

export default function AnalysisHistoryTab({ lang = 'en', onLoadAnalysis }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const isEn = lang === 'en';
  const t = (en, hi) => isEn ? en : hi;

  // Load analyses on mount
  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAnalyses({ limit: 100 });
      setAnalyses(result.data || []);
    } catch (err) {
      setError(t('Failed to load analysis history', 'विश्लेषण इतिहास लोड करने में विफल'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (analysisId) => {
    const confirmed = window.confirm(
      t(
        'Are you sure you want to delete this analysis? This cannot be undone.',
        'क्या आप इस विश्लेषण को हटाना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता।'
      )
    );
    if (!confirmed) return;

    setDeleting(analysisId);
    try {
      await deleteAnalysis(analysisId);
      setAnalyses(prev => prev.filter(a => a._id !== analysisId));
    } catch (err) {
      alert(t('Failed to delete analysis', 'विश्लेषण हटाने में विफल'));
    } finally {
      setDeleting(null);
    }
  };

  const handleLoadAnalysis = async (analysisId) => {
    try {
      const fullAnalysis = await getAnalysis(analysisId);
      if (onLoadAnalysis) {
        onLoadAnalysis(fullAnalysis);
      }
    } catch (err) {
      alert(t('Failed to load analysis', 'विश्लेषण लोड करने में विफल'));
    }
  };

  // Filter analyses by search query
  const filteredAnalyses = analyses.filter(a =>
    a.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.repertoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.symptoms?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination calculations
  const totalItems = filteredAnalyses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnalyses = filteredAnalyses.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(isEn ? 'en-IN' : 'hi-IN', options);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-2">
          <Brain className="h-7 w-7 text-[#062E6F]" />
          {t('Analysis History', 'विश्लेषण इतिहास')}
        </h2>
        <p className="text-sm text-slate-600">
          {t('View and manage your saved repertory analyses', 'अपने सहेजे गए रेपरटॉरी विश्लेषण देखें और प्रबंधित करें')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('Search by patient name, repertory, or symptoms...', 'रोगी के नाम, रेपरटॉरी या लक्षण से खोजें...')}
          className="w-full pl-12 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
        />
      </div>

      {/* Stats */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {t(`Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${analyses.length} analyses`, `${analyses.length} में से ${startIndex + 1}-${Math.min(endIndex, totalItems)} विश्लेषण दिखाए जा रहे हैं`)}
          </p>
          <button
            onClick={loadAnalyses}
            className="text-sm font-semibold text-[#062E6F] hover:text-[#042050] flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('Refresh', 'रीफ्रेश करें')}
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <button
              onClick={loadAnalyses}
              className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              {t('Try Again', 'पुनः प्रयास करें')}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-3 text-slate-500 py-20">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium">{t('Loading analyses...', 'विश्लेषण लोड हो रहे हैं...')}</span>
        </div>
      )}

      {/* Analysis Cards */}
      {!loading && filteredAnalyses.length === 0 && (
        <div className="text-center py-20">
          <Brain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            {t('No analyses found', 'कोई विश्लेषण नहीं मिला')}
          </h3>
          <p className="text-sm text-slate-500">
            {searchQuery
              ? t('Try a different search term', 'एक अलग खोज शब्द आज़माएं')
              : t('Run a repertory analysis to see it here', 'रेपरटॉरी विश्लेषण चलाएं और यहां देखें')}
          </p>
        </div>
      )}

      {!loading && filteredAnalyses.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {paginatedAnalyses.map(analysis => (
            <div
              key={analysis._id}
              className="group relative bg-white rounded-2xl border border-slate-200/70 p-6 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle top-right gradient accent */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-gradient-to-bl from-blue-100/60 to-transparent blur-2xl group-hover:from-blue-200/60 transition-colors pointer-events-none"></div>

              <div className="relative z-10">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-50 to-blue-50/50 flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm text-[#062E6F]">
                      <span className="text-xl font-bold">
                        {(analysis.patientName || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                        {t('Patient Name', 'रोगी का नाम')}
                      </p>
                      <h4 className="text-lg font-bold text-slate-800 line-clamp-1" title={analysis.patientName}>
                        {analysis.patientName || t('Patient', 'मरीज़')}
                      </h4>
                    </div>
                  </div>
                  {analysis.aiUsed && (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#062E6F] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full shadow-sm">
                      <Brain className="h-3.5 w-3.5" />
                      AI
                    </span>
                  )}
                </div>

                {/* Meta info grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-slate-50/50 border border-slate-100/80">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" />
                      {t('Repertory', 'रेपरटॉरी')}
                    </p>
                    <p className="font-semibold text-slate-700 text-sm line-clamp-1" title={analysis.repertoryName}>
                      {analysis.repertoryName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {t('Date', 'दिनांक')}
                    </p>
                    <p className="font-semibold text-slate-700 text-sm">
                      {formatDate(analysis.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Symptoms Preview */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-800">
                      {t('SYMPTOMS', 'लक्षण')}
                    </p>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {analysis.symptoms?.length || 0}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {analysis.symptoms?.slice(0, 2).map((symptom, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="text-blue-300 font-bold text-xs mt-0.5">•</span>
                        <p className="text-sm text-slate-600 line-clamp-1">{symptom}</p>
                      </div>
                    ))}
                    {analysis.symptoms?.length > 2 && (
                      <p className="text-xs font-semibold text-slate-400 pl-4 mt-1">
                        {t(`+ ${analysis.symptoms.length - 2} more`, `+ ${analysis.symptoms.length - 2} और`)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="relative z-10 mt-auto pt-5 border-t border-slate-100">
                {analysis.medicineDistribution?.[0] ? (
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider mb-1">
                        {t('Top Match', 'शीर्ष मिलान')}
                      </p>
                      <p className="text-base font-bold text-slate-800 line-clamp-1">
                        {analysis.medicineDistribution[0].name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center justify-center text-sm font-bold text-emerald-700 bg-emerald-50 h-8 px-3 rounded-lg border border-emerald-100/60 shadow-sm">
                        {analysis.medicineDistribution[0].totalScore} {t('pts', 'अंक')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[68px]" /> // Spacer if no medicine
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleLoadAnalysis(analysis._id)}
                    className="flex-1 bg-slate-900 hover:bg-[#062E6F] text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-slate-900/10"
                    title={t('Load this analysis', 'इस विश्लेषण को लोड करें')}
                  >
                    <Eye className="h-4 w-4" />
                    {t('View Analysis', 'विश्लेषण देखें')}
                  </button>
                  <button
                    onClick={() => handleDelete(analysis._id)}
                    disabled={deleting === analysis._id}
                    className="w-[52px] bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all shrink-0"
                    title={t('Delete analysis', 'विश्लेषण हटाएं')}
                  >
                    {deleting === analysis._id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mt-6">
            {/* Mobile: Stack vertically */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Page info - shows on top on mobile */}
              <div className="text-xs text-slate-600 text-center sm:text-left order-2 sm:order-2">
                <span className="font-semibold">{t('Page', 'पेज')} {currentPage}</span>
                <span className="mx-1">{t('of', 'में से')}</span>
                <span className="font-semibold">{totalPages}</span>
                <span className="mx-2">•</span>
                <span className="font-semibold">{totalItems}</span>
                <span className="ml-1">{t('total', 'कुल')}</span>
              </div>
              
              {/* Navigation buttons */}
              <div className="flex items-center justify-center gap-2 order-1 sm:order-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[36px]"
                >
                  <ChevronLeft className="h-3 w-3" />
                  <span className="hidden sm:inline">{t('Previous', 'पिछला')}</span>
                </button>
                
                {/* Page numbers - hide on small mobile, show on larger screens */}
                <div className="hidden md:flex items-center gap-1">
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
                        className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
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
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[36px]"
                >
                  <span className="hidden sm:inline">{t('Next', 'अगला')}</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </>
      )}
    </div>
  );
}
