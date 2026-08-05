import React from 'react';
import { Brain, BookOpen, Calendar, Eye, Clock } from 'lucide-react';

export default function RecentPatients({ 
  patients = [], 
  lang = 'en', 
  onNavigateToTab,
  onAnalyzePatient,
  limit = 5,
}) {
  const t = (en, hi) => lang === 'en' ? en : hi;

  // patients here are actually analysis records — sorted newest first
  const recent = [...patients]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) return t(`${diffMins}m ago`, `${diffMins} मिनट पहले`);
    if (diffHrs < 24) return t(`${diffHrs}h ago`, `${diffHrs} घंटे पहले`);
    if (diffDays === 1) return t('Yesterday', 'कल');
    if (diffDays < 7) return t(`${diffDays}d ago`, `${diffDays} दिन पहले`);
    return d.toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'short' });
  };

  const isToday = (dateStr) => {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  };

  return (
    <div className="surface p-5">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#062E6F]" />
          {t('Recent Analyses', 'हाल के विश्लेषण')}
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {recent.length}
          </span>
        </h3>
        {onNavigateToTab && (
          <button 
            onClick={() => onNavigateToTab('Analysis History')} 
            className="text-xs text-[#062E6F] hover:underline font-medium"
          >
            {t('View All', 'सभी देखें')}
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">
            {t('No analyses yet', 'अभी कोई विश्लेषण नहीं')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {t('Run a repertory analysis to see it here', 'रेपरटॉरी विश्लेषण चलाएं')}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1 thin-scroll">
          {recent.map((analysis) => {
            const today = isToday(analysis.createdAt);
            const topMed = analysis.medicineDistribution?.[0];

            return (
              <div
                key={analysis._id}
                className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                  today
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Patient name + badge */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="text-sm font-bold text-slate-800 truncate">
                        {analysis.patientName || t('Patient', 'मरीज़')}
                      </h4>
                      {today && (
                        <span className="shrink-0 text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                          {t('TODAY', 'आज')}
                        </span>
                      )}
                      {analysis.aiUsed && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold text-[#062E6F] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
                          <Brain className="h-2.5 w-2.5" /> AI
                        </span>
                      )}
                    </div>

                    {/* Repertory + time */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span className="truncate">{analysis.repertoryName}</span>
                      <span>•</span>
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="shrink-0">{formatDate(analysis.createdAt)}</span>
                    </div>

                    {/* Symptoms preview */}
                    {analysis.symptoms?.length > 0 && (
                      <p className="text-xs text-slate-600 italic line-clamp-1">
                        "{analysis.symptoms[0]}"
                        {analysis.symptoms.length > 1 && ` +${analysis.symptoms.length - 1} more`}
                      </p>
                    )}
                  </div>

                  {/* Top medicine + action */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {topMed && (
                      <div className="text-right">
                        <p className="text-[9px] text-emerald-700 font-bold uppercase">{t('Top', 'शीर्ष')}</p>
                        <p className="text-xs font-bold text-emerald-700 leading-tight">{topMed.name}</p>
                      </div>
                    )}
                    <button
                      onClick={() => onAnalyzePatient && onAnalyzePatient(analysis)}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-[#062E6F] transition-colors shadow-sm min-h-[44px]"
                    >
                      <Eye className="h-3 w-3" />
                      {t('View', 'देखें')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}