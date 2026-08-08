import React, { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';

const GRADE_STYLES = {
  3: 'bg-red-100 text-red-700 font-bold border border-red-200',
  2: 'bg-amber-100 text-amber-700 font-semibold border border-amber-200',
  1: 'bg-blue-50 text-blue-600 border border-blue-100',
};
const GRADE_LABEL = { 3: '3°', 2: '2°', 1: '1°' };

export default function RepertoryChart({ matchedRubrics = [], lang = 'en', onUpdateGrade, selectedRubricId, onRowSelect, aiUsed = true }) {
  const [extraMedicines, setExtraMedicines] = useState([]);

  // Known chapter/section names that should never appear as medicine columns
  const INVALID_MED_NAMES = new Set([
    'mind', 'head', 'eye', 'eyes', 'ear', 'ears', 'nose', 'face', 'mouth', 'throat',
    'stomach', 'abdomen', 'stool', 'urine', 'cough', 'fever', 'chill', 'sleep', 'skin',
    'chest', 'back', 'extremities', 'extremity', 'rectum', 'bladder', 'kidney', 'liver',
    'heart', 'lungs', 'generalities', 'clinical', 'emergency', 'modalities', 'food',
    'vomiting', 'thirst', 'perspiration', 'respiration', 'chapter'
  ]);

  const isValidMedicineName = (name) => {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (/^\d+$/.test(trimmed)) return false;
    if (trimmed.length < 2) return false;
    if (INVALID_MED_NAMES.has(trimmed.toLowerCase())) return false;
    return true;
  };

  const allMedicines = useMemo(() => {
    const set = new Set(extraMedicines);
    matchedRubrics.forEach(r => {
      const meds = r.medicines instanceof Map ? Object.fromEntries(r.medicines) : (r.medicines || {});
      Object.keys(meds).forEach(m => {
        if (meds[m] > 0 && isValidMedicineName(m)) set.add(m);
      });
    });
    return [...set].sort();
  }, [matchedRubrics, extraMedicines]);

  if (matchedRubrics.length === 0) return null;

  return (
    <section className="flex flex-col h-full bg-white">

      {/* ── Section Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 shrink-0 border-b border-slate-200 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            {lang === 'en' ? 'Repertory Chart' : 'रेपरटॉरी चार्ट'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'en'
              ? `${matchedRubrics.length} rubric${matchedRubrics.length > 1 ? 's' : ''} matched across ${allMedicines.length} medicines`
              : `${matchedRubrics.length} रुब्रिक्स और ${allMedicines.length} दवाएं`}
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2 text-[10px] font-semibold">
          <span className={`px-2 py-0.5 rounded ${GRADE_STYLES[3]}`}>3° {lang === 'en' ? 'High' : 'उच्च'}</span>
          <span className={`px-2 py-0.5 rounded ${GRADE_STYLES[2]}`}>2° {lang === 'en' ? 'Med' : 'मध्यम'}</span>
          <span className={`px-2 py-0.5 rounded ${GRADE_STYLES[1]}`}>1° {lang === 'en' ? 'Low' : 'निम्न'}</span>
        </div>
      </div>

      {/* ── MOBILE: Card List (hidden on md+) ── */}
      <div className="flex-1 overflow-y-auto thin-scroll md:hidden divide-y divide-slate-100">
        {matchedRubrics.map((row, idx) => {
          const meds = row.medicines instanceof Map
            ? Object.fromEntries(row.medicines)
            : (row.medicines || {});
          const agg  = (row.modalities?.aggravation  || []).join(', ');
          const amel = (row.modalities?.amelioration || []).join(', ');
          const isSelected = selectedRubricId === (row.rubricId || row._id || idx);
          const gradedMeds = allMedicines.filter(m => (meds[m] || 0) >= 1);
          const topMeds = gradedMeds.slice(0, 6);

          return (
            <div
              key={idx}
              onClick={() => onRowSelect && onRowSelect(row.rubricId || row._id || idx)}
              className={`p-4 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-50 border-l-4 border-l-[#062E6F]'
                  : 'bg-white active:bg-slate-50'
              }`}
            >
              {/* Symptom + Chapter badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-slate-800 text-sm leading-snug flex-1">
                  {row.symptom}
                </p>
                <span className="inline-block shrink-0 bg-[#062E6F]/10 text-[#062E6F] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                  {lang === 'en' ? row.chapter?.en : (row.chapter?.hi || row.chapter?.en)}
                </span>
              </div>

              {/* Rubric */}
              {row.rubric?.en && (
                <p className="text-xs font-medium text-slate-600 mb-1">
                  <span className="text-slate-400">{lang === 'en' ? 'Rubric: ' : 'रुब्रिक: '}</span>
                  {lang === 'en' ? row.rubric.en : (row.rubric.hi || row.rubric.en)}
                </p>
              )}

              {/* SubRubric */}
              {(row.subrubric?.en || row.subrubric?.hi) && (
                <p className="text-xs italic text-slate-400 mb-2">
                  {lang === 'en' ? row.subrubric.en : (row.subrubric.hi || row.subrubric.en)}
                </p>
              )}

              {/* Modalities + Confidence */}
              <div className="flex flex-wrap items-center gap-3 mb-2 text-xs">
                {agg && <span className="text-amber-700">▲ {agg}</span>}
                {amel && <span className="text-emerald-700">▼ {amel}</span>}
                {row.confidence != null && (
                  <span className={`flex items-center gap-1 font-semibold ${
                    row.confidence >= 80 ? 'text-emerald-600' :
                    row.confidence >= 50 ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    <span className="text-slate-400 font-normal">{aiUsed ? 'AI' : 'Match'}</span>
                    {row.confidence}%
                  </span>
                )}
              </div>

              {/* Top medicine badges */}
              {topMeds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {topMeds.map(med => {
                    const grade = meds[med] || 0;
                    return (
                      <span key={med} className={`text-[10px] font-bold px-2 py-0.5 rounded ${GRADE_STYLES[grade] || ''}`}>
                        {med} {GRADE_LABEL[grade]}
                      </span>
                    );
                  })}
                  {gradedMeds.length > 6 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{gradedMeds.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: Scrollable Table (hidden below md) ── */}
      <div className="flex-1 overflow-hidden bg-white hidden md:block">
        <div className="overflow-auto h-full thin-scroll">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-5 font-semibold whitespace-nowrap sticky left-0 bg-slate-900 z-20 border-r border-slate-700">
                  {lang === 'en' ? 'Patient Symptom' : 'मरीज़ का लक्षण'}
                </th>
                <th className="px-5 py-5 font-semibold whitespace-nowrap">
                  {lang === 'en' ? 'Chapter' : 'अध्याय'}
                </th>
                <th className="px-5 py-5 font-semibold whitespace-nowrap">
                  {lang === 'en' ? 'Rubric' : 'रुब्रिक'}
                </th>
                <th className="px-5 py-5 font-semibold whitespace-nowrap">
                  {lang === 'en' ? 'SubRubric' : 'उपरुब्रिक'}
                </th>
                <th className="px-5 py-5 font-semibold whitespace-nowrap text-amber-300">
                  {lang === 'en' ? 'Agg ▲' : 'वृद्धि ▲'}
                </th>
                <th className="px-5 py-5 font-semibold whitespace-nowrap text-emerald-300">
                  {lang === 'en' ? 'Amel ▼' : 'शमन ▼'}
                </th>
                <th className="px-5 py-5 font-semibold whitespace-nowrap text-slate-300">
                  {aiUsed 
                    ? (lang === 'en' ? 'AI Confidence' : 'AI विश्वास')
                    : (lang === 'en' ? 'Match Confidence' : 'मिलान विश्वसनीयता')}
                </th>
                {allMedicines.map(med => (
                  <th key={med} className="px-4 py-5 font-semibold whitespace-nowrap text-center border-l border-slate-700">
                    <span title={med}>
                      {med.length > 12 ? med.slice(0, 10) + '…' : med}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matchedRubrics.map((row, idx) => {
                const meds = row.medicines instanceof Map
                  ? Object.fromEntries(row.medicines)
                  : (row.medicines || {});
                const agg  = (row.modalities?.aggravation  || []).join(', ');
                const amel = (row.modalities?.amelioration || []).join(', ');
                const isSelected = selectedRubricId === (row.rubricId || row._id || idx);

                return (
                  <tr
                    key={idx}
                    onClick={() => onRowSelect && onRowSelect(row.rubricId || row._id || idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-l-4 border-l-[#062E6F]'
                        : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {/* Symptom — sticky */}
                    <td className={`px-6 py-5 sticky left-0 z-20 border-r border-slate-100 ${
                      isSelected ? 'bg-blue-50' : 'bg-inherit'
                    }`}>
                      <div className="font-semibold text-slate-800 max-w-[180px]" title={row.symptom}>
                        {row.symptom}
                      </div>
                      {row.reasoning && (
                        <div className="text-xs text-slate-400 mt-1 italic max-w-[180px] truncate" title={row.reasoning}>
                          {row.reasoning}
                        </div>
                      )}
                    </td>

                    {/* Chapter */}
                    <td className="px-5 py-5">
                      <span className="inline-block bg-[#062E6F]/10 text-[#062E6F] text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide whitespace-nowrap">
                        {lang === 'en' ? row.chapter?.en : (row.chapter?.hi || row.chapter?.en)}
                      </span>
                    </td>

                    {/* Rubric */}
                    <td className="px-5 py-5 font-semibold text-slate-700 max-w-[200px]">
                      <span title={lang === 'en' ? row.rubric?.en : row.rubric?.hi}>
                        {lang === 'en' ? row.rubric?.en : (row.rubric?.hi || row.rubric?.en)}
                      </span>
                    </td>

                    {/* SubRubric */}
                    <td className="px-5 py-5 text-slate-500 italic max-w-[150px]">
                      {lang === 'en' ? row.subrubric?.en : (row.subrubric?.hi || row.subrubric?.en) || '—'}
                    </td>

                    {/* Aggravation */}
                    <td className="px-5 py-5 text-amber-700 max-w-[140px]">
                      {agg || <span className="text-slate-300">—</span>}
                    </td>

                    {/* Amelioration */}
                    <td className="px-5 py-5 text-emerald-700 max-w-[140px]">
                      {amel || <span className="text-slate-300">—</span>}
                    </td>

                    {/* AI Confidence */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.confidence >= 80 ? 'bg-emerald-500' :
                              row.confidence >= 50 ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${row.confidence}%` }}
                          />
                        </div>
                        <span className={`font-semibold text-[10px] ${
                          row.confidence >= 80 ? 'text-emerald-600' :
                          row.confidence >= 50 ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {row.confidence}%
                        </span>
                      </div>
                    </td>

                    {/* Medicine grade cells */}
                    {allMedicines.map(med => {
                      const grade = meds[med] || 0;
                      return (
                        <td key={med} className="px-3 py-3 text-center border-l border-slate-100 min-w-[50px]">
                          <select
                            value={grade}
                            onChange={(e) => onUpdateGrade && onUpdateGrade(row.rubricId, med, parseInt(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                            className={`text-center font-bold text-xs rounded px-2 py-1.5 border-0 focus:ring-1 focus:ring-[#062E6F]/50 cursor-pointer ${
                              grade ? GRADE_STYLES[grade] : 'text-slate-300 hover:text-slate-400 bg-transparent'
                            }`}
                          >
                            <option value="0" className="text-slate-400 bg-white">·</option>
                            <option value="1" className="text-blue-600 bg-white">1°</option>
                            <option value="2" className="text-amber-700 bg-white">2°</option>
                            <option value="3" className="text-red-700 bg-white font-bold">3°</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}
