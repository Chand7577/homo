import React, { useState, useEffect } from 'react';
import { 
  Plus, HeartPulse, AlertCircle, CheckCircle, 
  Activity, Search, ChevronLeft, ChevronRight, Trash2, Users 
} from 'lucide-react';
import { formatDateTime } from '../utils/dateFormatter';

// Helper function to extract individual symptom lines from arrays or multi-line strings
const parseSymptomLines = (symptomsData, fullTextData) => {
  let list = [];
  
  if (Array.isArray(symptomsData) && symptomsData.length > 0) {
    symptomsData.forEach(item => {
      if (typeof item === 'string' && item.trim()) {
        const splitLines = item.split('\n').map(s => s.trim()).filter(Boolean);
        list.push(...splitLines);
      }
    });
  }
  
  if (list.length === 0 && typeof fullTextData === 'string' && fullTextData.trim()) {
    list = fullTextData.split('\n').map(s => s.trim()).filter(Boolean);
  } else if (list.length === 0 && typeof symptomsData === 'string' && symptomsData.trim()) {
    list = symptomsData.split('\n').map(s => s.trim()).filter(Boolean);
  }

  return list;
};

export default function PatientsDatabase({ 
  lang, 
  t,
  patientSymptomQueue,
  setPatientSymptomQueue,
  filteredPatients,
  patientsLoading = false,
  globalSearch,
  setGlobalSearch,
  setShowAddPatientModal,
  handleAnalyzePatient,
  navigateToTab,
  patientCaseTab,
  setPatientCaseTab
}) {
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  
  // Expanded symptoms state - track which cards show all symptoms
  const [expandedSymptoms, setExpandedSymptoms] = useState(new Set());
  
  // Toggle symptom expansion for a specific entry
  const toggleSymptomExpansion = (entryId) => {
    setExpandedSymptoms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };
  
  // Reset to page 1 when switching tabs or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [patientCaseTab, globalSearch]);

  // Helper function to paginate any array
  const paginateData = (dataArray) => {
    const totalItems = dataArray.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = dataArray.slice(startIndex, endIndex);
    
    return { paginatedData, totalItems, totalPages, startIndex, endIndex };
  };

  const goToPage = (page, totalPages) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Render pagination controls
  const PaginationControls = ({ totalPages, totalItems }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => goToPage(currentPage - 1, totalPages)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3.5 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            <ChevronLeft className="h-3 w-3" />
            {lang === 'en' ? 'Previous' : 'पिछला'}
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
                  onClick={() => goToPage(pageNumber, totalPages)}
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
            onClick={() => goToPage(currentPage + 1, totalPages)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3.5 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {lang === 'en' ? 'Next' : 'अगला'}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="text-xs text-slate-500">
          {lang === 'en' ? 'Page' : 'पेज'} {currentPage} {lang === 'en' ? 'of' : 'में से'} {totalPages} • {totalItems} {lang === 'en' ? 'total' : 'कुल'}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#062E6F]" />
            {lang === 'en' ? "Patients Database" : "मरीजों का डेटाबेस"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'en' ? "Manage patient cases with priority-based workflow" : "प्राथमिकता-आधारित वर्कफ़्लो के साथ मरीज़ के मामलों का प्रबंधन करें"}
          </p>
        </div>
        <button
          onClick={() => setShowAddPatientModal(true)}
          className="terracotta-btn self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          {t.addPatient}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-lg transition-shadow">
          <div className="p-3 bg-amber-50 rounded-xl shadow-sm">
            <HeartPulse className="h-7 w-7 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              {lang === 'en' ? 'Pending Cases' : 'लंबित मामले'}
            </p>
            <p className="text-3xl font-black text-amber-900 mt-1">
              {patientSymptomQueue.filter(q => q.status === 'Pending' || q.status === 'In Analysis').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-lg transition-shadow">
          <div className="p-3 bg-red-50 rounded-xl shadow-sm">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              {lang === 'en' ? 'Urgent Today' : 'आज जरूरी'}
            </p>
            <p className="text-3xl font-black text-red-900 mt-1">
              {patientSymptomQueue.filter(q => {
                const submittedDate = new Date(q.submittedAt);
                const today = new Date();
                return (q.status === 'Pending' || q.status === 'In Analysis') && submittedDate.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-lg transition-shadow">
          <div className="p-3 bg-emerald-50 rounded-xl shadow-sm">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              {lang === 'en' ? 'Completed' : 'पूर्ण'}
            </p>
            <p className="text-3xl font-black text-emerald-900 mt-1">
              {patientSymptomQueue.filter(q => q.status === 'Analyzed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setPatientCaseTab('pending')}
          className={`px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
            patientCaseTab === 'pending'
              ? 'text-[#062E6F] border-[#062E6F]'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Pending Cases' : 'लंबित मामले'}</span>
            <span className="sm:hidden">{lang === 'en' ? 'Pending' : 'लंबित'}</span>
            {patientSymptomQueue.filter(q => q.status === 'Pending' || q.status === 'In Analysis').length > 0 && (
              <span className="text-[10px] bg-amber-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                {patientSymptomQueue.filter(q => q.status === 'Pending' || q.status === 'In Analysis').length}
              </span>
            )}
          </div>
        </button>
        
        <button
          onClick={() => setPatientCaseTab('completed')}
          className={`px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
            patientCaseTab === 'completed'
              ? 'text-[#062E6F] border-[#062E6F]'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Completed Cases' : 'पूर्ण मामले'}</span>
            <span className="sm:hidden">{lang === 'en' ? 'Complete' : 'पूर्ण'}</span>
            {patientSymptomQueue.filter(q => q.status === 'Analyzed').length > 0 && (
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                {patientSymptomQueue.filter(q => q.status === 'Analyzed').length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="sticky top-0 bg-[#F8F6F0] z-10 py-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={lang === 'en' ? "Search by patient name, symptom..." : "मरीज के नाम, लक्षण द्वारा खोजें..."}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 shadow-sm"
          />
        </div>
      </div>

      {/* Pending Cases Content */}
      {patientCaseTab === 'pending' && (() => {
        const pendingCases = patientSymptomQueue
          .filter(q => q.status === 'Pending' || q.status === 'In Analysis')
          .filter(q => {
            if (!globalSearch) return true;
            const searchLower = globalSearch.toLowerCase();
            const patientName = (q.patientName || '').toLowerCase();
            const symptoms = Array.isArray(q.symptoms) 
              ? q.symptoms.join(' ').toLowerCase()
              : (q.fullSymptomText || '').toLowerCase();
            return patientName.includes(searchLower) || symptoms.includes(searchLower);
          })
          .sort((a, b) => {
            const aDate = new Date(a.submittedAt);
            const bDate = new Date(b.submittedAt);
            const today = new Date();
            const aIsToday = aDate.toDateString() === today.toDateString();
            const bIsToday = bDate.toDateString() === today.toDateString();
            if (aIsToday && !bIsToday) return -1;
            if (!aIsToday && bIsToday) return 1;
            return bDate - aDate;
          });

        const { paginatedData, totalItems, totalPages, startIndex, endIndex } = paginateData(pendingCases);

        return (
          <>
            <div className="space-y-3">
              {paginatedData.map((entry) => {
              const submittedDate = new Date(entry.submittedAt);
              const today = new Date();
              const isUrgent = submittedDate.toDateString() === today.toDateString();
              
              return (
                <div 
                  key={entry.id} 
                  className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className={`p-3 rounded-xl shadow-sm shrink-0 ${
                    isUrgent ? 'bg-red-50' : 'bg-blue-50'
                  }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {entry.patientName.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                  </div>
                    
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <p className="text-base font-bold text-slate-800">{entry.patientName}</p>
                      <span className="text-xs text-slate-500">• Age {entry.age}</span>
                      {entry.status === 'In Analysis' && (
                        <span className="text-[10px] font-bold bg-blue-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                          🔍 {lang === 'en' ? 'In Analysis' : 'विश्लेषण में'}
                        </span>
                      )}
                      {isUrgent && (
                        <span className="text-[10px] font-bold bg-red-500 text-white px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
                          🔥 {lang === 'en' ? 'URGENT' : 'जरूरी'}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{formatDateTime(entry.submittedAt, true, lang)}</span>
                    </div>
                    
                    <div className="space-y-1.5 mb-3">
                      {(() => {
                        const allSymptoms = parseSymptomLines(entry.symptoms, entry.fullSymptomText);
                        const isExpanded = expandedSymptoms.has(entry.id);
                        const displaySymptoms = isExpanded ? allSymptoms : allSymptoms.slice(0, 3);
                        const hasMore = allSymptoms.length > 3;
                        
                        return (
                          <>
                            {displaySymptoms.map((symptomLine, i) => (
                              <div key={i} className="text-xs bg-slate-50 border border-slate-200/80 text-slate-800 px-3 py-2 rounded-lg font-medium flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#062E6F] shrink-0 mt-1.5" />
                                <span className="leading-relaxed break-words">{symptomLine}</span>
                              </div>
                            ))}
                            
                            {hasMore && (
                              <button
                                onClick={() => toggleSymptomExpansion(entry.id)}
                                className="text-xs font-bold text-[#062E6F] hover:text-[#042050] px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 min-h-[36px]"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>{lang === 'en' ? 'Show Less' : 'कम दिखाएं'}</span>
                                    <span className="text-[10px]">▲</span>
                                  </>
                                ) : (
                                  <>
                                    <span>{lang === 'en' ? `View ${allSymptoms.length - 3} More` : `${allSymptoms.length - 3} और देखें`}</span>
                                    <span className="text-[10px]">▼</span>
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAnalyzePatient(entry)}
                        className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg bg-[#062E6F] text-white hover:bg-[#042050] shadow-sm hover:shadow-md transition-all"
                      >
                        <Activity className="h-4 w-4" />
                        {lang === 'en' ? 'Analyze Now' : 'अभी विश्लेषण करें'}
                      </button>
                      <button
                        onClick={() => {
                          setPatientSymptomQueue(prev =>
                            prev.map(q => q.id === entry.id ? { ...q, status: 'Analyzed' } : q)
                          );
                        }}
                        className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {lang === 'en' ? 'Mark Done' : 'पूर्ण'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          
            {pendingCases.length === 0 && !globalSearch && (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <CheckCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">
                  {lang === 'en' ? '🎉 All caught up!' : '🎉 सब पूरा हो गया!'}
                </h3>
                <p className="text-sm text-slate-400">
                  {lang === 'en' ? 'No pending cases at the moment.' : 'अभी कोई लंबित मामले नहीं हैं।'}
                </p>
              </div>
            )}
            
            {pendingCases.length === 0 && globalSearch && (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">
                  {lang === 'en' ? 'No results found' : 'कोई परिणाम नहीं मिला'}
                </h3>
                <p className="text-sm text-slate-400">
                  {lang === 'en' 
                    ? `No pending cases match "${globalSearch}"`
                    : `"${globalSearch}" से मेल खाने वाले कोई लंबित मामले नहीं`}
                </p>
              </div>
            )}
          </div>
          
          {pendingCases.length > 0 && (
            <div className="text-xs text-slate-500 bg-white rounded-lg p-3 shadow-sm">
              {lang === 'en' ? 'Showing' : 'दिखाया जा रहा है'} {startIndex + 1}-{Math.min(endIndex, totalItems)} {lang === 'en' ? 'of' : 'में से'} {totalItems} {lang === 'en' ? 'pending cases' : 'लंबित मामले'}
            </div>
          )}
          
          <PaginationControls totalPages={totalPages} totalItems={totalItems} />
        </>
        );
      })()}

      {/* Completed Cases Content */}
      {patientCaseTab === 'completed' && (() => {
        const completedCases = patientSymptomQueue
          .filter(q => q.status === 'Analyzed')
          .filter(q => {
            if (!globalSearch) return true;
            const searchLower = globalSearch.toLowerCase();
            const patientName = (q.patientName || '').toLowerCase();
            const symptoms = Array.isArray(q.symptoms) 
              ? q.symptoms.join(' ').toLowerCase()
              : (q.fullSymptomText || '').toLowerCase();
            return patientName.includes(searchLower) || symptoms.includes(searchLower);
          });
        const { paginatedData, totalItems, totalPages, startIndex, endIndex } = paginateData(completedCases);

        return (
          <>
            <div className="space-y-3">
              {paginatedData.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-lg transition-all">
              <div className="p-3 bg-emerald-50 rounded-xl shadow-sm shrink-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold bg-emerald-100 text-emerald-700">
                  {entry.patientName.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <p className="text-base font-bold text-slate-800">{entry.patientName}</p>
                  <span className="text-xs text-slate-500">• Age {entry.age}</span>
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                    ✓ {lang === 'en' ? 'Completed' : 'पूर्ण'}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDateTime(entry.submittedAt, true, lang)}</span>
                </div>
                <div className="space-y-1.5 mt-2">
                  {(() => {
                    const allSymptoms = parseSymptomLines(entry.symptoms, entry.fullSymptomText);
                    const isExpanded = expandedSymptoms.has(entry.id);
                    const displaySymptoms = isExpanded ? allSymptoms : allSymptoms.slice(0, 3);
                    const hasMore = allSymptoms.length > 3;
                    
                    return (
                      <>
                        {displaySymptoms.map((symptomLine, i) => (
                          <div key={i} className="text-xs bg-slate-50 border border-slate-200/80 text-slate-800 px-3 py-1.5 rounded-lg font-medium flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            <span className="leading-relaxed break-words">{symptomLine}</span>
                          </div>
                        ))}
                        
                        {hasMore && (
                          <button
                            onClick={() => toggleSymptomExpansion(entry.id)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1.5 min-h-[36px]"
                          >
                            {isExpanded ? (
                              <>
                                <span>{lang === 'en' ? 'Show Less' : 'कम दिखाएं'}</span>
                                <span className="text-[10px]">▲</span>
                              </>
                            ) : (
                              <>
                                <span>{lang === 'en' ? `View ${allSymptoms.length - 3} More` : `${allSymptoms.length - 3} और देखें`}</span>
                                <span className="text-[10px]">▼</span>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm(lang === 'en' 
                    ? `Delete completed case for ${entry.patientName}?` 
                    : `${entry.patientName} के पूर्ण मामले को हटाएं?`)) {
                    try {
                      const { deleteConsultation } = await import('../services/api');
                      // Call backend API to delete from database
                      await deleteConsultation(entry.id);
                      // Remove from frontend state after successful deletion
                      setPatientSymptomQueue(prev => prev.filter(q => q.id !== entry.id));
                    } catch (error) {
                      console.error('Failed to delete consultation:', error);
                      alert(lang === 'en' 
                        ? 'Failed to delete case. Please try again.' 
                        : 'मामला हटाने में विफल। कृपया पुनः प्रयास करें।');
                    }
                  }
                }}
                className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                aria-label={lang === 'en' ? 'Delete case' : 'मामला हटाएं'}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          {completedCases.length === 0 && !globalSearch && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-2">
                {lang === 'en' ? 'No completed cases yet' : 'अभी तक कोई पूर्ण मामले नहीं'}
              </h3>
            </div>
          )}
          
          {completedCases.length === 0 && globalSearch && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                {lang === 'en' ? 'No results found' : 'कोई परिणाम नहीं मिला'}
              </h3>
              <p className="text-sm text-slate-400">
                {lang === 'en' 
                  ? `No completed cases match "${globalSearch}"`
                  : `"${globalSearch}" से मेल खाने वाले कोई पूर्ण मामले नहीं`}
              </p>
            </div>
          )}
        </div>
        
        {completedCases.length > 0 && (
          <div className="text-xs text-slate-500 bg-white rounded-lg p-3 shadow-sm">
            {lang === 'en' ? 'Showing' : 'दिखाया जा रहा है'} {startIndex + 1}-{Math.min(endIndex, totalItems)} {lang === 'en' ? 'of' : 'में से'} {totalItems} {lang === 'en' ? 'completed cases' : 'पूर्ण मामले'}
          </div>
        )}
        
        <PaginationControls totalPages={totalPages} totalItems={totalItems} />
      </>
      );
    })()}

    </div>
  );
}
