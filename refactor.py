import re

f = 'frontend/src/app/doctorinbox/page.tsx'
with open(f, encoding='utf-8') as file:
    content = file.read()

content = content.replace('const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);', 'const [showAnalysisModal, setShowAnalysisModal] = useState(false);')

start_marker = '{/* CLINICAL ANALYSIS AREA */}'
end_marker = '{/* Message Thread Area */}'
start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    old_block = content[start_idx:end_idx]
    
    new_thread_button = """{/* CLINICAL ANALYSIS AREA BUTTON */}
                  {selectedMessage && (
                    <div className="flex-shrink-0 border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Intelligent Clinical Analysis</h3>
                          <p className="text-[10px] text-slate-500 font-medium">{repertoryResult ? `${repertoryResult.total_matched} rubrics identified` : 'Ready to analyze patient symptoms'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowAnalysisModal(true)}
                        className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95"
                      >
                        {repertoryResult ? 'View Results' : 'Start Analysis'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  """
    
    content = content[:start_idx] + new_thread_button + content[end_idx:]

    modal_code = """
      {/* ANALYSIS MODAL */}
      {showAnalysisModal && selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up relative">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Clinical Analysis</h2>
                  <p className="text-[10px] font-bold text-slate-500">Patient: {selectedMessage.patient_name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAnalysisModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${repertoryResult ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-teal-600 shadow-teal-600/20'}`}>
                    {repertoryResult ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                      {repertoryResult ? 'Analysis Active' : 'Step 1: Configuration'}
                    </span>
                    <span className={`text-[11px] font-bold ${repertoryResult ? 'text-emerald-600' : 'text-teal-600'}`}>
                      {repertoryResult ? `${repertoryResult.total_matched} rubrics identified` : 'Select chapter to begin'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end w-full sm:w-auto">
                  <div className="relative flex-1 max-w-[200px]">
                    <select 
                      value={selectedChapterId || ""} 
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedChapterId(newId);
                        if (repertoryResult) handleAnalyzeSymptoms(newId);
                      }}
                      className="w-full pl-3 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500/30 appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="">All Chapters (Full Search)</option>
                      {chapters.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                  
                  {!repertoryResult && (
                    <button
                      onClick={() => handleAnalyzeSymptoms(selectedChapterId)}
                      disabled={analyzing}
                      className="px-4 py-1.5 bg-[#3F856C] text-white rounded-lg text-[10px] font-black hover:bg-[#35735E] shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ANALYZE'}
                    </button>
                  )}
                </div>
              </div>

              {repertoryResult ? (
                <div className="space-y-6 animate-fade-in">

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                      <Table2 className="w-3.5 h-3.5 text-slate-500" />
                      <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Symptom Mapping Table</h3>
                    </div>
                    <div className="overflow-auto max-h-[350px] custom-scrollbar border-b border-slate-100">
                      <table className="w-full text-left border-collapse relative">
                        <thead className="sticky top-0 z-10 bg-slate-50">
                          <tr className="bg-slate-50/50">
                            <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Symptom</th>
                            <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Clinical Rubrics</th>
                            <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Top Remedies</th>
                          </tr>
                        </thead>
                        <tbody>
                          {repertoryResult.symptoms_breakdown?.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-4 py-3 align-top">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-bold rounded-md">
                                  <Tag className="w-3 h-3" />
                                  {row.symptom}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex flex-col gap-1.5">
                                  {row.rubrics?.map(rb => (
                                    <div key={rb.id} className="group relative">
                                      <div className="flex items-start gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-md">
                                        <FlaskConical className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-700 leading-tight">{rb.name}</p>
                                          <p className="text-[8px] text-slate-400 mt-0.5 truncate max-w-[150px]">{rb.full_path}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex flex-wrap gap-1">
                                  {Array.from(new Set(row.rubrics?.flatMap(r => r.medicines?.map(m => JSON.stringify(m)) || [])))
                                    .map(mStr => JSON.parse(mStr))
                                    .sort((a,b) => b.grade - a.grade)
                                    .slice(0, 6)
                                    .map((med, mi) => (
                                      <span key={mi} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${GRADE_COLORS[med.grade] || "bg-slate-100"}`}>
                                        {med.name}
                                        <span className="opacity-60">G{med.grade}</span>
                                      </span>
                                    ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Top Matched Rubrics</h3>
                      </div>
                      <div className="p-3 space-y-3">
                        {repertoryResult.top_rubrics?.map((rb, i) => (
                          <div key={rb.id} className="flex items-start gap-3 p-2 bg-slate-50/50 rounded-lg">
                            <span className="text-xs font-black text-slate-300">#{i+1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-800 leading-tight">{rb.name}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5 truncate">{rb.full_path}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-violet-500" />
                        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Remedy Indicator Chart</h3>
                      </div>
                      <div className="p-3 space-y-2">
                        {repertoryResult.medicine_chart?.slice(0, 5).map((med, i) => {
                          const maxScore = repertoryResult.medicine_chart[0].score;
                          const pct = (med.score / maxScore) * 100;
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold">
                                <span className="text-slate-700">{med.name}</span>
                                <span className="text-slate-400">{med.occurrences}</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                    <Sparkles className="w-8 h-8 text-teal-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Ready for Repertorization</h4>
                    <p className="text-xs text-slate-500 max-w-[200px]">Select a chapter or search all to identify patient rubrics</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowAnalysisModal(false)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorInbox;
"""

    content = content.replace("    </div>\n  );\n};\n\nexport default DoctorInbox;", modal_code)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print("Done refactoring to Modal!")
else:
    print("Could not find start/end markers!")
