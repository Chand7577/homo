import React from 'react';
import { Award, ChevronRight, CheckSquare, Square } from 'lucide-react';

const RANK_STYLES = {
  1: { ring: 'border-2 border-amber-300 shadow-amber-100/60', badge: 'bg-amber-400 text-white', bar: 'bg-amber-400' },
  2: { ring: 'border border-slate-300', badge: 'bg-slate-400 text-white', bar: 'bg-slate-400' },
  3: { ring: 'border border-orange-200', badge: 'bg-orange-400 text-white', bar: 'bg-orange-400' },
};
const DEFAULT_STYLE = { ring: 'border border-slate-100', badge: 'bg-slate-200 text-slate-600', bar: 'bg-[#062E6F]' };

const RANK_EMOJI = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function MedicineDistribution({
  distribution = [],
  lang = 'en',
  onSelect,
  stats,
  // Multi-select props
  selectedMedicines = [],
  onToggleSelect,
  onPrescribeSelected,
}) {
  const t = (en, hi) => lang === 'en' ? en : hi;
  const multiSelectMode = typeof onToggleSelect === 'function';

  // Show helpful message when rubrics found but no medicines
  if (!distribution || distribution.length === 0) {
    if (stats && stats.totalMatched > 0 && stats.withoutMedicines > 0) {
      return (
        <section className="space-y-4">
          <div className="pb-1">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#062E6F]" />
              {t('Medicine Distribution & Ranking', 'दवा वितरण और रैंकिंग')}
            </h3>
          </div>
          <div className="surface p-6 text-center space-y-3 border-2 border-dashed border-amber-200 bg-amber-50/30">
            <div className="flex justify-center">
              <Award className="h-10 w-10 text-amber-400" />
            </div>
            <p className="font-semibold text-slate-700">
              {t(
                'Rubrics Found, But No Medicines Listed',
                'रुब्रिक्स मिले, लेकिन दवाएं नहीं'
              )}
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {t(
                `Found ${stats.totalMatched} matching rubric(s), but ${stats.withoutMedicines} of them don't have medicine recommendations. This may happen if the uploaded repertory data is incomplete.`,
                `${stats.totalMatched} रुब्रिक्स मिले, लेकिन ${stats.withoutMedicines} में दवाएं नहीं हैं।`
              )}
            </p>
            {stats.withMedicines > 0 && (
              <p className="text-xs text-emerald-600 font-medium">
                {t(
                  `Note: ${stats.withMedicines} rubric(s) do have medicines and are included in the chart above.`,
                  `नोट: ${stats.withMedicines} रुब्रिक्स में दवाएं हैं और ऊपर चार्ट में शामिल हैं।`
                )}
              </p>
            )}
          </div>
        </section>
      );
    }
    return null;
  }

  const maxScore = distribution[0]?.totalScore || 1;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="pb-1 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-[#062E6F]" />
            {t('Medicine Distribution & Ranking', 'दवा वितरण और रैंकिंग')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {multiSelectMode
              ? t(
                  'Select one or more medicines to add to the prescription.',
                  'प्रिस्क्रिप्शन में जोड़ने के लिए एक या अधिक दवाएं चुनें।'
                )
              : t(
                  'Medicines ranked by total grade score across all matched rubrics. Highest score = best indicated remedy.',
                  'सभी मिलान रुब्रिक्स में कुल ग्रेड स्कोर के आधार पर दवाओं की रैंकिंग।'
                )}
          </p>
        </div>

        {/* "Prescribe Selected" button — shown only in multi-select mode when ≥1 selected */}
        {multiSelectMode && selectedMedicines.length > 0 && (
          <button
            onClick={onPrescribeSelected}
            className="flex items-center gap-2 bg-[#062E6F] hover:bg-[#042050] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all min-h-[44px]"
          >
            <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs font-bold">
              {selectedMedicines.length}
            </span>
            {t('Prescribe Selected', 'चुनी गई दवाएं लिखें')}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Multi-select hint */}
      {multiSelectMode && selectedMedicines.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-[#062E6F] bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <CheckSquare className="h-3.5 w-3.5 shrink-0" />
          {t(
            'Tip: Check medicines below to add multiple to one prescription.',
            'टिप: नीचे दवाएं चेक करके एक प्रिस्क्रिप्शन में कई दवाएं जोड़ें।'
          )}
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3">
        {distribution.map((med) => {
          const style    = RANK_STYLES[med.rank] || DEFAULT_STYLE;
          const pct      = Math.round((med.totalScore / maxScore) * 100);
          const grades   = med.grades || [];
          const g3       = grades.filter(g => g === 3).length;
          const g2       = grades.filter(g => g === 2).length;
          const g1       = grades.filter(g => g === 1).length;
          const isChecked = multiSelectMode && selectedMedicines.includes(med.name);

          return (
            <div
              key={med.name}
              onClick={() => {
                if (multiSelectMode) {
                  onToggleSelect(med.name);
                } else if (onSelect) {
                  onSelect(med);
                }
              }}
              className={`surface p-4 transition-all hover:shadow-md cursor-pointer ${style.ring} ${
                isChecked ? 'bg-blue-50/60 ring-2 ring-[#062E6F]/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">

                {/* Multi-select checkbox — shown when in multi-select mode */}
                {multiSelectMode && (
                  <div className={`shrink-0 mt-0.5 transition-colors ${isChecked ? 'text-[#062E6F]' : 'text-slate-300'}`}>
                    {isChecked
                      ? <CheckSquare className="h-5 w-5" />
                      : <Square className="h-5 w-5" />
                    }
                  </div>
                )}

                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-full ${style.badge} flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}>
                  {med.rank <= 3 ? RANK_EMOJI[med.rank] : `#${med.rank}`}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Name + score row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className={`font-bold text-slate-800 ${med.rank === 1 ? 'text-base' : 'text-sm'}`}>
                      {med.name}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-[#062E6F] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        {t('Score', 'स्कोर')}: {med.totalScore}
                      </span>
                      {!multiSelectMode && onSelect && (
                        <span className="text-[10px] text-[#062E6F] font-semibold flex items-center gap-0.5 hover:underline">
                          {t('Prescribe', 'प्रिस्क्राइब')}
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isChecked ? 'bg-[#062E6F]' : style.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Grade breakdown */}
                  <div className="flex items-center flex-wrap gap-2 text-[10px]">
                    <span className="text-slate-500">
                      {t('Rubrics covered', 'रुब्रिक्स')}:
                      <span className="font-bold text-slate-700 ml-1">{med.rubricsCount}</span>
                    </span>
                    {g3 > 0 && (
                      <span className="bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded font-semibold">
                        3°×{g3}
                      </span>
                    )}
                    {g2 > 0 && (
                      <span className="bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded font-semibold">
                        2°×{g2}
                      </span>
                    )}
                    {g1 > 0 && (
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded font-semibold">
                        1°×{g1}
                      </span>
                    )}
                    <span className="text-slate-400 ml-auto">{pct}% {t('of max', 'अधिकतम का')}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
