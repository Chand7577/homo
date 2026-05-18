"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Activity, Zap, BookOpen } from "lucide-react";
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

            <div className="flex flex-col lg:flex-row items-start gap-4 min-h-0 w-full">
              
              {/* Box 1: Clinical Chapters */}
              <div className="lg:w-[12%] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                    Chapters
                  </h3>
                </div>
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-4">
                  {(() => {
                    const uniqueChapters = Array.from(new Set(selectedRubrics.map(sr => sr.rubric.parent_name || "Generalities")));
                    
                    return uniqueChapters.map((chName, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ea580c' }} className="p-4 rounded-xl text-center shadow-lg transform transition-all hover:scale-105 active:scale-95 border border-[#c2410c]">
                        <p className="text-[11px] font-black text-white uppercase leading-tight tracking-wider">
                          {chName}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Box 2: Symptom Rubrics */}
              <div className="lg:w-[35%] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Rubrics
                  </h3>
                </div>
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-3">
                  {selectedRubrics.map((sr, i) => (
                    <div key={i} className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl flex items-start gap-3 hover:bg-blue-50/60 transition-all group">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                          {sr.rubric.parent_name || "Generalities"}
                        </p>
                        <p className="text-[13px] font-bold text-blue-700 leading-snug break-words">
                          {sr.rubric.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Remedy Analysis */}
              <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    Medicine Analysis
                  </h3>
                </div>
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border bg-green-100 text-green-700 border-green-200">
                        100%
                      </span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
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
                        
                        return medsWithNumbers.map((med) => (
                          <div key={med.id} className="relative flex flex-col bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group overflow-hidden">
                            <span className="text-sm font-black text-gray-900 truncate mb-2 group-hover:text-indigo-600" title={med.name}>
                              {med.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-50">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mr-1">Covers:</span>
                              {med.matchedNumbers.map(num => (
                                <span key={num} className="w-5 h-5 flex items-center justify-center rounded bg-indigo-600 text-white font-bold text-[10px] shadow-sm group-hover:bg-indigo-700 transition-colors">
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Medicine Occurrence Chart */}
            {(() => {
              // Build occurrence data: count how many selected rubrics each medicine covers
              const occurrenceData = result.top_medicines
                .map((med) => {
                  let count = 0;
                  if (med.details?.rubric_intensities) {
                    med.details.rubric_intensities.forEach((ri) => {
                      const matched = selectedRubrics.some(
                        (s) =>
                          s.rubric.name.toLowerCase() ===
                          ri.rubric_name.toLowerCase()
                      );
                      if (matched) count++;
                    });
                  }
                  return { name: med.name, occurrence: count };
                })
                .filter((m) => m.occurrence > 0)
                .sort((a, b) => b.occurrence - a.occurrence);

              const maxOccurrence = Math.max(
                ...occurrenceData.map((m) => m.occurrence),
                1
              );

              if (occurrenceData.length === 0) return null;

              return (
                <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                  {/* Chart Header */}
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        Medicine Occurrence Chart
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Repetition count across {selectedRubrics.length} selected rubrics
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {occurrenceData.length} Medicines
                      </span>
                    </div>
                  </div>

                  {/* Table Format */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[400px]">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">
                            Medicine
                          </th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center whitespace-nowrap w-32">
                            Occurrence
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {occurrenceData.map((med, idx) => {
                          const barPct = Math.round(
                            (med.occurrence / maxOccurrence) * 100
                          );
                          const isTop = idx === 0;
                          const isSecond = idx === 1;
                          const isThird = idx === 2;

                          const rankStyle = isTop
                            ? "bg-amber-500 text-white"
                            : isSecond
                            ? "bg-gray-300 text-gray-900"
                            : isThird
                            ? "bg-orange-500 text-white"
                            : "bg-indigo-100 text-indigo-700";

                          const barColor = isTop
                            ? "bg-amber-400"
                            : isSecond
                            ? "bg-slate-400"
                            : isThird
                            ? "bg-orange-400"
                            : "bg-indigo-300";

                          const badgeStyle = isTop
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : isSecond
                            ? "bg-gray-100 text-gray-800 border-gray-200"
                            : isThird
                            ? "bg-orange-100 text-orange-800 border-orange-200"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100";

                          return (
                            <tr
                              key={med.name}
                              className={`hover:bg-indigo-50/40 transition-all group ${
                                isTop ? "bg-amber-50/40" : isSecond ? "bg-gray-50/80" : ""
                              }`}
                            >
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-[10px] font-black shadow-sm ${rankStyle}`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 truncate transition-colors">
                                      {med.name}
                                    </p>
                                    <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden max-w-xs">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                        style={{ width: `${barPct}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <div className="flex justify-center">
                                  <div
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-black text-sm shadow-sm border ${badgeStyle}`}
                                  >
                                    <span>{med.occurrence}</span>
                                    <span className="text-[10px] font-bold opacity-60">
                                      / {selectedRubrics.length}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}
