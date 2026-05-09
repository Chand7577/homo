"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";

interface SelectedRubric {
  rubric: {
    id: number;
    name: string;
    parent_name?: string;
  };
}

interface Medicine {
  id: number;
  name: string;
  coverage_percentage: number;
  details?: {
    rubric_intensities: Array<{
      rubric_name: string;
      intensity: number;
    }>;
  };
}

interface RepertorizationResult {
  top_medicines: Medicine[];
}

export default function ComparativeAnalysisPage() {
  const [selectedRubrics, setSelectedRubrics] = useState<SelectedRubric[]>([]);
  const [result, setResult] = useState<RepertorizationResult | null>(null);

  useEffect(() => {
    // Load data from localStorage
    const storedRubrics = localStorage.getItem("comparative_rubrics");
    const storedResult = localStorage.getItem("comparative_result");

    if (storedRubrics) setSelectedRubrics(JSON.parse(storedRubrics));
    if (storedResult) setResult(JSON.parse(storedResult));
  }, []);

  if (!result || selectedRubrics.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <Activity className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">No Data Available</h2>
        <p className="text-gray-500 mb-6">Please perform repertorization first.</p>
        <Link
          href="/repertorize"
          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
        >
          Go to Repertorize
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/repertorize"
              className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                <span className="p-2 bg-blue-600 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </span>
                Analysis Report
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                Clinical Repertorization Matrix
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
               <div className="px-4 py-1.5 bg-white rounded-lg shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Rubrics</p>
                  <p className="text-sm font-black text-gray-900">{selectedRubrics.length}</p>
               </div>
               <div className="px-4 py-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Medicines</p>
                  <p className="text-sm font-black text-gray-600">{result.top_medicines.length}</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Table Area */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto overflow-hidden flex flex-col">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col flex-1">
          
          <div className="flex-1 overflow-auto custom-scrollbar p-6">
            {/* Legend Section */}
            <div className="mb-6 flex flex-wrap items-center gap-6 px-5 py-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">1</div>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-tight">Rubric Serial Number</span>
              </div>
              <div className="w-px h-4 bg-indigo-200 hidden md:block" />
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-black border border-green-200 uppercase">100% Match</div>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-tight">Total Case Coverage</span>
              </div>
              <p className="text-[10px] text-indigo-500 font-bold ml-auto uppercase tracking-wider hidden lg:block italic">
                * Each medicine card shows which rubrics it covers by its serial number
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row items-start">
              
              {/* LEFT TABLE: Rubrics */}
              <div className="w-full lg:w-[45%] border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-4 border-b border-gray-200 font-bold text-gray-700 text-xs uppercase tracking-wider w-[35%]">
                        Chapter Name
                      </th>
                      <th className="p-4 border-b border-gray-200 font-bold text-gray-700 text-xs uppercase tracking-wider w-[65%]">
                        Rubric Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedRubrics.map((sr, i) => {
                      const isFirstInChapter = i === 0 || selectedRubrics[i - 1].rubric.parent_name !== sr.rubric.parent_name;
                      
                      return (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 align-top">
                            {isFirstInChapter ? (
                              <span className="text-sm font-black text-orange-600 uppercase bg-orange-50 px-2.5 py-1.5 rounded-lg shadow-sm border border-orange-100 inline-block">
                                {sr.rubric.parent_name || "Generalities"}
                              </span>
                            ) : null}
                          </td>
                          <td className="p-4 align-top border-l border-gray-100">
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                                {i + 1}
                              </span>
                              <span className="text-sm font-bold text-blue-600 mt-0.5">
                                {sr.rubric.name}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* RIGHT TABLE: Medicines */}
              <div className="w-full lg:w-[55%] flex flex-col">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-4 border-b border-gray-200 font-bold text-gray-700 text-xs uppercase tracking-wider w-[20%] text-center border-r border-gray-200">
                        Match %
                      </th>
                      <th className="p-4 border-b border-gray-200 font-bold text-gray-700 text-xs uppercase tracking-wider w-[80%]">
                        Medicines
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(() => {
                      const medsWithNumbers = result.top_medicines.map(med => {
                        const matchedNumbers: number[] = [];
                        if (med.details?.rubric_intensities) {
                          med.details.rubric_intensities.forEach(ri => {
                            const matchIdx = selectedRubrics.findIndex(
                              s => s.rubric.name.toLowerCase() === ri.rubric_name.toLowerCase()
                            );
                            if (matchIdx !== -1) matchedNumbers.push(matchIdx + 1);
                          });
                        }
                        matchedNumbers.sort((a, b) => a - b);
                        return { ...med, matchedNumbers };
                      });

                      const groupedMap = new Map<number, typeof medsWithNumbers>();
                      medsWithNumbers.forEach(m => {
                        if (!groupedMap.has(m.coverage_percentage)) groupedMap.set(m.coverage_percentage, []);
                        groupedMap.get(m.coverage_percentage)!.push(m);
                      });
                      
                      const groupedMeds = Array.from(groupedMap.entries())
                        .sort((a, b) => b[0] - a[0])
                        .map(([pct, meds]) => ({ pct, meds }));

                      return groupedMeds.map((group, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 align-top border-r border-gray-100 text-center">
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-black shadow-sm ${
                              group.pct >= 100 ? 'bg-green-100 text-green-700 border border-green-200' :
                              group.pct >= 75 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              group.pct >= 50 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {group.pct}%
                            </span>
                          </td>
                          <td className="p-4 align-top">
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                              {group.meds.map((med) => (
                                <div key={med.id} className="flex flex-col bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group">
                                  <span className="text-sm font-black text-gray-900 truncate mb-2 group-hover:text-indigo-700" title={med.name}>
                                    {med.name}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-50 pt-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mr-1">Covers:</span>
                                    {med.matchedNumbers.length > 0 ? (
                                      med.matchedNumbers.map(num => (
                                        <span key={num} className="w-5 h-5 flex items-center justify-center rounded bg-indigo-600 text-white font-bold text-[10px] shadow-sm">
                                          {num}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-gray-400 italic">None</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
