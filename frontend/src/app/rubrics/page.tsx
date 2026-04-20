// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen, Search, Plus, X, Pill, Sparkles, ChevronRight,
  ChevronDown, Tag, Loader2, BarChart3, Trophy, AlertCircle,
  CheckCircle2, ArrowLeft, Zap, Filter, Star, Activity,
  Hash, Info, Table2, FlaskConical, Microscope, Mic, MicOff
} from "lucide-react";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Chapter { id: number; name: string; name_hindi?: string; }

interface RubricEntry {
  id: number; name: string; name_hindi?: string;
  full_path?: string; score: number;
  medicine_count: number;
  medicines: { id: number; name: string; latin_name: string; grade: number; grade_label: string }[];
}

interface SymptomRow {
  symptom: string;
  rubric_count: number;
  rubrics: RubricEntry[];
}

interface TopRubric {
  id: number; name: string; name_hindi?: string; full_path?: string;
  level: number; parent_name?: string; medicine_count: number;
  score: number; matched_symptoms: string[];
  medicines: { id: number; name: string; latin_name: string; grade: number; grade_label: string }[];
}

interface MedicineChartItem {
  id: number; name: string; latin_name: string;
  occurrences: number; total_grade: number; avg_grade: number;
  score: number; rubric_names: string[];
}

interface RepertoResult {
  success: boolean; chapter_id: number; symptoms: string[];
  total_matched: number;
  symptoms_breakdown: SymptomRow[];
  top_rubrics: TopRubric[];
  medicine_chart: MedicineChartItem[];
}

// ─── Grade helpers ─────────────────────────────────────────────────────────────
const GRADE_COLORS = ["", "bg-slate-100 text-slate-600", "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700", "bg-violet-100 text-violet-800", "bg-amber-100 text-amber-700"];

export default function RubricsPage() {
  const [stage, setStage] = useState<"chapter" | "symptoms" | "results">("chapter");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState("");
  const [result, setResult] = useState<RepertoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [chapterLoading, setChapterLoading] = useState(true);
  const [error, setError] = useState("");
  const [chapterSearch, setChapterSearch] = useState("");
  const [expandedRubricCell, setExpandedRubricCell] = useState<string | null>(null); // "rowIdx-rubricIdx"
  const [isListening, setIsListening] = useState(false);
  const [dictationLang, setDictationLang] = useState<"en-IN" | "hi-IN">("en-IN");
  
  // Setup SpeechRecognition hook
  const recognitionRef = useRef<any>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/doctor/rubrics/chapters/`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setChapters(d.chapters || []); })
      .catch(() => setError("Failed to load chapters"))
      .finally(() => setChapterLoading(false));
      
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSymptomInput(prev => prev ? prev + " " + transcript : transcript);
          setIsListening(false);
          // Let the user press 'Enter' explicitly to add, rather than auto-adding.
        };
        
        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Try Chrome.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = dictationLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const addSymptom = () => {
    const v = symptomInput.trim().toLowerCase();
    if (!v || symptoms.includes(v)) { setSymptomInput(""); return; }
    setSymptoms(p => [...p, v]);
    setSymptomInput("");
    inputRef.current?.focus();
  };

  const removeSymptom = (i: number) => setSymptoms(p => p.filter((_, idx) => idx !== i));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSymptom(); }
    else if (e.key === "Backspace" && !symptomInput && symptoms.length) removeSymptom(symptoms.length - 1);
  };

  const runRepertorize = async () => {
    if (!symptoms.length) { setError("Add at least one symptom."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/doctor/rubrics/repertorize/`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter_id: selectedChapter?.id ?? null, symptoms, top_n: 3 }),
      });
      const data: RepertoResult = await res.json();
      if (!res.ok || !data.success) throw new Error((data as any).error || "Failed");
      setResult(data);
      setStage("results");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const filteredChapters = chapters.filter(c =>
    c.name.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    (c.name_hindi || "").toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const maxChartScore = result?.medicine_chart[0]?.score || 1;

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .fade-in { animation: fadeIn .25s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .tag-in { animation: tagIn .18s cubic-bezier(.34,1.56,.64,1); }
        @keyframes tagIn { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
        .pulse-ring { animation: pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        @keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.4); opacity: 0; } }
        .bar-fill { transition: width 1.1s cubic-bezier(.34,1.56,.64,1); }
        /* Table styles */
        .rep-table { width:100%; border-collapse:separate; border-spacing:0; }
        .rep-table th { background:#f8fafc; font-weight:700; font-size:11px;
          text-transform:uppercase; letter-spacing:.06em; color:#64748b;
          padding:10px 14px; border-bottom:2px solid #e2e8f0; text-align:left; }
        .rep-table td { padding:12px 14px; vertical-align:top; border-bottom:1px solid #f1f5f9; }
        .rep-table tr:last-child td { border-bottom:none; }
        .rep-table tr:hover td { background:#fafbff; }
        .rubric-pill { display:inline-flex; align-items:center; gap:4px;
          padding:3px 8px; border-radius:6px; font-size:11px; font-weight:600;
          background:#eff6ff; color:#3b82f6; border:1px solid #bfdbfe;
          cursor:pointer; margin:2px; white-space:nowrap; max-width:220px; }
        .rubric-pill:hover { background:#dbeafe; }
        .med-chip { display:inline-flex; align-items:center; gap:3px;
          padding:2px 7px; border-radius:5px; font-size:10px; font-weight:600;
          margin:2px; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:10px; }
        .chapter-card { transition:all .18s ease; }
        .chapter-card:hover { transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,.1); }
      `}</style>
      
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
                <Table2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-sm leading-none">Rubric Repertorization</h1>
                <p className="text-gray-400 text-[10px] mt-0.5">Chapter → Symptoms → Analysis Table</p>
              </div>
            </div>
          </div>

          {/* Step pills */}
          <div className="hidden sm:flex items-center gap-1">
            {[["chapter","1","Chapter"],["symptoms","2","Symptoms"],["results","3","Results"]].map(([key,num,label],i) => {
              const done = (key==="chapter"&&(stage==="symptoms"||stage==="results"))||(key==="symptoms"&&stage==="results");
              const active = stage===key;
              return (
                <div key={key} className="flex items-center gap-1">
                  {i>0&&<div className="w-6 h-px bg-gray-200"/>}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    done ? "bg-emerald-50 text-emerald-600" : active ? "bg-sky-50 text-sky-600" : "text-gray-400"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                      done ? "bg-emerald-500 text-white" : active ? "bg-sky-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {done?"✓":num}
                    </span>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedChapter && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg max-w-[160px]">
              <BookOpen className="w-3.5 h-3.5 text-sky-500 flex-shrink-0"/>
              <span className="text-xs text-gray-700 font-semibold truncate">{selectedChapter.name}</span>
              <button onClick={() => { setSelectedChapter(null); setStage("chapter"); setResult(null); setSymptoms([]); }}
                className="w-3.5 h-3.5 rounded-full bg-gray-300 hover:bg-red-400 flex items-center justify-center flex-shrink-0 transition-colors">
                <X className="w-2.5 h-2.5 text-white"/>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 1 · Chapter Selection
        ══════════════════════════════════════════════════════════════════ */}
        {stage === "chapter" && (
          <div className="py-8 fade-in">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-2">Step 1 of 3</p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Select a Chapter</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Choose the repertory chapter for the patient's chief complaint region.
              </p>
            </div>

            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input type="text" placeholder="Search chapters…" value={chapterSearch}
                  onChange={e => setChapterSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-white"/>
              </div>
            </div>

            {chapterLoading ? (
              <div className="flex flex-col items-center py-20">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3"/>
                <p className="text-gray-400 text-sm">Loading chapters…</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredChapters.map(ch => (
                  <button key={ch.id} onClick={() => { setSelectedChapter(ch); setStage("symptoms"); setSymptoms([]); setResult(null); setError(""); }}
                    className="chapter-card bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-sky-300 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-100 flex items-center justify-center mb-3 group-hover:from-sky-100 group-hover:to-indigo-100 transition-all">
                      <BookOpen className="w-4.5 h-4.5 text-sky-500"/>
                    </div>
                    <p className="text-gray-900 font-bold text-sm leading-tight">{ch.name}</p>
                    {ch.name_hindi && <p className="text-orange-500 text-xs mt-1">{ch.name_hindi}</p>}
                    <div className="flex items-center gap-1 mt-2 text-sky-400 text-[10px] font-bold uppercase tracking-wide group-hover:text-sky-600 transition-colors">
                      Select <ChevronRight className="w-3 h-3"/>
                    </div>
                  </button>
                ))}
                {!filteredChapters.length && (
                  <div className="col-span-full text-center py-16 text-gray-400 text-sm">No chapters match</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 2 · Symptom Entry
        ══════════════════════════════════════════════════════════════════ */}
        {stage === "symptoms" && (
          <div className="py-8 fade-in">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">
                Step 2 of 3 · {selectedChapter?.name}
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Enter Patient Symptoms</h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                Type or dictate each symptom and press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd>.
                Each symptom becomes a row in the analysis table.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {/* Symptom input box */}
              <div className="bg-white border-2 border-gray-200 focus-within:border-sky-400 rounded-2xl p-4 transition-colors cursor-text min-h-[100px]"
                onClick={() => inputRef.current?.focus()}>
                {/* Existing tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {symptoms.map((sym, idx) => (
                    <span key={idx} className="tag-in inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      <Tag className="w-3 h-3 text-sky-400"/>
                      {sym}
                      <button onClick={e => { e.stopPropagation(); removeSymptom(idx); }}
                        className="w-4 h-4 rounded-full bg-sky-200 hover:bg-red-400 flex items-center justify-center transition-colors">
                        <X className="w-2.5 h-2.5 text-white"/>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input ref={inputRef} type="text"
                    placeholder={symptoms.length ? "Add more symptoms…" : "e.g. headache evening, worse light, better cold…"}
                    value={symptomInput} onChange={e => setSymptomInput(e.target.value)} onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-gray-800 placeholder-gray-300 text-sm focus:outline-none"/>
                  
                  {/* MIC BUTTON & LANG TOGGLE */}
                  <div className="relative flex items-center justify-center gap-1.5 z-10">
                    <button onClick={(e) => { e.stopPropagation(); setDictationLang(p => p === "hi-IN" ? "en-IN" : "hi-IN"); }}
                      className="text-[10px] font-black text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors"
                      title="Toggle dictation language (English/Hindi)">
                      {dictationLang === "hi-IN" ? "HI" : "EN"}
                    </button>
                    
                    <div className="relative flex items-center justify-center">
                      {isListening && <div className="absolute w-8 h-8 rounded-full bg-red-400 pulse-ring pointer-events-none" />}
                      <button onClick={e => {e.stopPropagation(); toggleListening();}}
                        className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-colors z-10 ${
                          isListening ? "bg-red-500 text-white shadow-md hover:bg-red-600" : "bg-gray-100 text-gray-500 hover:bg-sky-100 hover:text-sky-600"
                        }`} title="Voice dictation">
                        {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {symptomInput && (
                    <button onClick={addSymptom}
                      className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-bold hover:bg-sky-600 transition-colors">
                      <Plus className="w-3 h-3"/> Add
                    </button>
                  )}
                </div>
              </div>

              {/* Preview table (builds as symptoms added) */}
              {symptoms.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden fade-in">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-gray-500"/>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Analysis Preview — {symptoms.length} symptom{symptoms.length>1?"s":""}
                    </span>
                  </div>
                  <table className="rep-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Symptom</th>
                        <th>Rubrics</th>
                        <th>Medicines</th>
                      </tr>
                    </thead>
                    <tbody>
                      {symptoms.map((sym, i) => (
                        <tr key={i}>
                          <td className="text-gray-400 text-xs font-bold w-8">{i+1}</td>
                          <td>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold">
                              <Tag className="w-3 h-3"/>{sym}
                            </span>
                          </td>
                          <td className="text-gray-400 text-xs italic">will be filled after analysis</td>
                          <td className="text-gray-400 text-xs italic">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Quick add suggestions */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Quick add</p>
                <div className="flex flex-wrap gap-2">
                  {["evening","morning","afternoon","night","worse heat","better cold",
                    "worse motion","better rest","anxiety","irritable","fasting","eating"].map(s => (
                    <button key={s} onClick={() => { if (!symptoms.includes(s)) setSymptoms(p => [...p,s]); }}
                      disabled={symptoms.includes(s)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-500 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0"/> {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStage("chapter")}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
                  ← Back
                </button>
                <button onClick={runRepertorize} disabled={!symptoms.length || loading}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin"/> Analyzing…</>
                  ) : (
                    <><Zap className="w-4 h-4"/> Run Analysis
                      {symptoms.length>0 && <span className="ml-1 px-2 py-0.5 bg-white/20 rounded text-xs">{symptoms.length}</span>}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STAGE 3 · Results (Tabular)
        ══════════════════════════════════════════════════════════════════ */}
        {stage === "results" && result && (
          <div className="py-6 fade-in space-y-6">

            {/* Results header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500"/>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Analysis Complete</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900">Repertorization Table</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  Chapter: <span className="text-gray-800 font-semibold">{selectedChapter?.name}</span>
                  &nbsp;·&nbsp;
                  <span className="text-gray-800 font-semibold">{result.total_matched}</span> rubrics matched
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { setStage("symptoms"); setResult(null); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <Filter className="w-3.5 h-3.5"/> Edit Symptoms
                </button>
                <button onClick={() => { setStage("chapter"); setSelectedChapter(null); setSymptoms([]); setResult(null); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <BookOpen className="w-3.5 h-3.5"/> New Analysis
                </button>
              </div>
            </div>

            {/* ─── MAIN TABLE: Symptom | Rubrics | Associated Medicines ──── */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                <Table2 className="w-4 h-4 text-gray-500"/>
                <h3 className="text-sm font-bold text-gray-700">Symptom → Rubric → Medicine Mapping</h3>
                <span className="ml-auto text-xs text-gray-400">
                  {result.symptoms_breakdown.length} symptom{result.symptoms_breakdown.length!==1?"s":""}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="rep-table">
                  <thead>
                    <tr>
                      <th style={{width:32}}>#</th>
                      <th style={{width:160}}>Symptom</th>
                      <th style={{width:320}}>Matched Rubrics</th>
                      <th>Associated Medicines</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.symptoms_breakdown.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                          No rubrics matched the provided symptoms.
                        </td>
                      </tr>
                    ) : result.symptoms_breakdown.map((row, rowIdx) => {
                      // Collect all medicines across this symptom's rubrics (deduplicated)
                      const medMap: Record<number,{name:string;latin_name:string;grade:number;rubrics:string[]}> = {};
                      row.rubrics.forEach(rb => {
                        rb.medicines.forEach(m => {
                          if (!medMap[m.id]) medMap[m.id] = { name:m.name, latin_name:m.latin_name, grade:m.grade, rubrics:[] };
                          medMap[m.id].rubrics.push(rb.name);
                          medMap[m.id].grade = Math.max(medMap[m.id].grade, m.grade);
                        });
                      });
                      const allMeds = Object.entries(medMap).map(([id,v]) => ({id:+id,...v}))
                        .sort((a,b) => b.grade - a.grade);

                      return (
                        <tr key={rowIdx}>
                          {/* # */}
                          <td className="text-gray-400 text-xs font-bold">{rowIdx+1}</td>

                          {/* Symptom column */}
                          <td>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
                              <Tag className="w-3 h-3 text-sky-400 flex-shrink-0"/>
                              {row.symptom}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                              {row.rubric_count} rubric{row.rubric_count!==1?"s":""}
                            </p>
                          </td>

                          {/* Rubrics column */}
                          <td>
                            {row.rubrics.length === 0 ? (
                              <span className="text-gray-300 text-xs italic">No rubrics matched</span>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                {row.rubrics.slice(0, 4).map((rb, ri) => {
                                  const cellKey = `${rowIdx}-${ri}`;
                                  const expanded = expandedRubricCell === cellKey;
                                  return (
                                    <div key={rb.id}>
                                      <button
                                        onClick={() => setExpandedRubricCell(expanded ? null : cellKey)}
                                        className="rubric-pill w-full text-left"
                                        title={rb.full_path || rb.name}
                                        style={{ maxWidth: '100%', whiteSpace: 'normal', height: 'auto', display: 'flex', alignItems: 'flex-start' }}
                                      >
                                        <FlaskConical className="w-3 h-3 flex-shrink-0 text-blue-400 mt-0.5"/>
                                        <div className="flex-1 min-w-0">
                                          <span className="text-xs leading-tight">{rb.full_path || rb.name}</span>
                                          {rb.name_hindi && <span className="block text-[10px] text-orange-500 mt-0.5">{rb.name_hindi}</span>}
                                        </div>
                                        <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform mt-0.5 ml-1 ${expanded?"rotate-180":""}`}/>
                                      </button>
                                      {expanded && rb.medicines.length > 0 && (
                                        <div className="mt-1 ml-2 p-2 bg-blue-50 border border-blue-100 rounded-lg fade-in">
                                          <p className="text-[9px] text-blue-500 font-bold uppercase mb-1">Medicines ({rb.medicine_count})</p>
                                          <div className="flex flex-wrap gap-1">
                                            {rb.medicines.map(m => (
                                              <span key={m.id} className={`med-chip ${GRADE_COLORS[m.grade]||"bg-gray-100 text-gray-600"}`}>
                                                {m.name}
                                                <span className="opacity-60 text-[9px]">G{m.grade}</span>
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {row.rubric_count > 4 && (
                                  <span className="text-[10px] text-gray-400 italic">+{row.rubric_count-4} more</span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Medicines column */}
                          <td>
                            {allMeds.length === 0 ? (
                              <span className="text-gray-300 text-xs italic">—</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {allMeds.slice(0, 8).map(m => (
                                  <span key={m.id} title={m.latin_name}
                                    className={`med-chip ${GRADE_COLORS[m.grade]||"bg-gray-100 text-gray-600"}`}>
                                    <Pill className="w-2.5 h-2.5"/>
                                    {m.name}
                                    <span className="opacity-50 text-[9px]">G{m.grade}</span>
                                  </span>
                                ))}
                                {allMeds.length > 8 && (
                                  <span className="text-[10px] text-gray-400 italic self-center">+{allMeds.length-8} more</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ─── BOTTOM SECTION: Top Rubrics + Medicine Chart ─────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Top 3 rubrics summary */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500"/>
                  <h3 className="text-sm font-bold text-gray-700">Top {result.top_rubrics.length} Matched Rubrics</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {result.top_rubrics.length === 0 ? (
                    <p className="text-center py-10 text-gray-400 text-sm">No rubrics matched</p>
                  ) : result.top_rubrics.map((rb, i) => (
                    <div key={rb.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-lg font-black text-gray-400 flex-shrink-0 mt-0.5 w-6 text-center">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-sm text-gray-900 truncate">{rb.full_path || rb.name}</p>
                          </div>
                          {rb.name_hindi && <p className="text-orange-500 text-xs mb-1">{rb.name_hindi}</p>}
                          {/* Matched symptoms for this rubric */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {rb.matched_symptoms.map((sym,si) => (
                              <span key={si} className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                                ✓ {sym}
                              </span>
                            ))}
                          </div>
                          {/* Top medicines for this rubric */}
                          <div className="flex flex-wrap gap-1">
                            {rb.medicines.slice(0,5).map(m => (
                              <span key={m.id} className={`med-chip ${GRADE_COLORS[m.grade]||"bg-gray-100 text-gray-600"}`}>
                                {m.name}<span className="opacity-50 text-[9px]">·G{m.grade}</span>
                              </span>
                            ))}
                            {rb.medicine_count > 5 && (
                              <span className="text-[10px] text-gray-400 italic self-center">+{rb.medicine_count-5}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medicine frequency chart */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-500"/>
                  <h3 className="text-sm font-bold text-gray-700">Medicine Frequency Chart</h3>
                  <span className="ml-auto text-xs text-gray-400">across top rubrics</span>
                </div>

                {/* Top medicine highlight */}
                {result.medicine_chart.length > 0 && (
                  <div className="mx-5 mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Most Indicated</p>
                        <p className="font-black text-gray-900 text-lg leading-tight">{result.medicine_chart[0].name}</p>
                        <p className="text-gray-400 text-xs italic">{result.medicine_chart[0].latin_name}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-2xl font-black text-amber-600">{result.medicine_chart[0].occurrences}</p>
                        <p className="text-[10px] text-gray-400">rubric{result.medicine_chart[0].occurrences!==1?"s":""}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bar chart */}
                <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
                  {result.medicine_chart.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">No medicines found</p>
                  ) : result.medicine_chart.slice(0,12).map((med, i) => {
                    const pct = Math.round((med.score / maxChartScore) * 100);
                    const isTop = i === 0;
                    return (
                      <div key={med.id} className={`p-3 rounded-xl ${isTop?"bg-amber-50 border border-amber-200":"border border-gray-100"}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            {isTop && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0"/>}
                            <p className="font-bold text-sm text-gray-900 truncate">{med.name}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {/* Occurrence dots */}
                            <div className="flex gap-0.5">
                              {Array.from({length:result.top_rubrics.length}).map((_,di) => (
                                <div key={di} className={`w-2 h-2 rounded-full ${di<med.occurrences?"bg-sky-500":"bg-gray-200"}`}/>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-gray-500 tabular-nums">{med.occurrences}/{result.top_rubrics.length}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="bar-fill h-full rounded-full"
                            style={{width:`${pct}%`, background: isTop ? "linear-gradient(90deg,#f59e0b,#ef4444)" : "linear-gradient(90deg,#38bdf8,#818cf8)"}}/>
                        </div>
                        <div className="flex items-center justify-end mt-1.5 text-[10px] text-gray-400">
                          <span className="italic truncate max-w-[160px]" title={med.rubric_names.join(", ")}>
                            found in: {med.rubric_names.slice(0,2).join(", ")}
                            {med.rubric_names.length > 2 && "..."}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-gray-400"/>
                    <span className="text-[10px] text-gray-400">Dots = rubric coverage · Bar = overall score</span>
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {[1,2,3,4,5].map(g => (
                      <span key={g} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${GRADE_COLORS[g]}`}>G{g}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
