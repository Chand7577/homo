// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen, Search, Plus, X, Pill, Sparkles, ChevronRight,
  ChevronDown, Tag, Loader2, BarChart3, Trophy, AlertCircle,
  CheckCircle2, ArrowLeft, Zap, Filter, Star, Activity,
  Hash, Info, Table2, FlaskConical, Microscope, Mic, MicOff,
  PlusCircle, Layers, TrendingUp
} from "lucide-react";
import RubricModal from "../../components/RubricModal";

import { API_BASE } from "@/config";

// ─── Inverted Index: keyword → candidate chapter names ───────────────────────
// Resolves symptoms to chapters entirely client-side for known terms.
// This eliminates probe API calls for the vast majority of symptoms.
const KEYWORD_INDEX: Record<string, string> = {
  // ── Mind ─────────────────────────────────────────────────────────────────
  anger:"Mind", anxiety:"Mind", fear:"Mind", grief:"Mind", sad:"Mind", sadness:"Mind", depressed:"Mind", depression:"Mind",
  irritab:"Mind", mental:"Mind", worry:"Mind",
  confusion:"Mind", memory:"Mind", delusion:"Mind", insanity:"Mind",
  weeping:"Mind", jealous:"Mind", indifference:"Mind", restless:"Mind",
  contradiction:"Mind", forgetful:"Mind", aversion:"Mind", mania:"Mind",
  morose:"Mind", sensitive:"Mind", timid:"Mind", suspicious:"Mind",
  "मन":"Mind", "डर":"Mind", "गुस्सा":"Mind", "दुख":"Mind", "चिंता":"Mind",
  "भय":"Mind", "क्रोध":"Mind", "उदासी":"Mind", "निराशा":"Mind",
  "दुखी":"Mind", "निराश":"Mind", "रोना":"Mind", "रोता":"Mind", "रोती":"Mind",
  "अकेलापन":"Mind", "उदास":"Mind", "हताश":"Mind", "विषाद":"Mind",
  "बेचैनी":"Mind", "भ्रम":"Mind", "याददाश्त":"Mind", "एकाग्रता":"Mind", "ध्यान":"Mind", "पढ़ते":"Mind",
  "संदेह":"Mind", "शक":"Mind", "संकोच":"Mind",

  // ── Head ─────────────────────────────────────────────────────────────────
  headache:"Head", head:"Head", migraine:"Head", scalp:"Head",
  forehead:"Head", temple:"Head", occiput:"Head", vertex:"Head",
  "सिर":"Head", "माथा":"Head", "सिरदर्द":"Head", "आधाशीशी":"Head",
  "शिर":"Head", "सिर में":"Head",

  // ── Eyes ─────────────────────────────────────────────────────────────────
  eye:"Eyes", eyes:"Eyes", cornea:"Eyes", conjunctiv:"Eyes",
  lachrymation:"Eyes", photophobia:"Eyes", lids:"Eyes", lid:"Eyes",
  eyelid:"Eyes", pupil:"Eyes", retina:"Eyes", optic:"Eyes",
  "आँख":"Eyes", "आंख":"Eyes", "आँखों":"Eyes", "आंखों":"Eyes",
  "पलक":"Eyes", "आँसू":"Eyes",

  // ── Ears ─────────────────────────────────────────────────────────────────
  ear:"Ears", ears:"Ears", tinnitus:"Ears", deafness:"Ears",
  otitis:"Ears", discharge:"Ears", cerumen:"Ears", wax:"Ears",
  "कान":"Ears", "कानों":"Ears", "कान में":"Ears",
} as Record<string, string>;

// Exact phrase index to override single-word tokens
const PHRASE_INDEX: Record<string, string> = {
  "सिर में दर्द": "Head",
  "सिर दर्द":    "Head",
  "आँख में":     "Eyes",
  "कान में":     "Ears",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Chapter { id: number; name: string; name_hindi?: string; }

interface RubricEntry {
  id: number; name: string; name_hindi?: string;
  full_path?: string; score: number;
  medicine_count: number;
  modality?: string;
  synonyms?: (string | { synonym: string; synonym_hindi?: string; name?: string })[];
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
  const [stage, setStage] = useState<"selection" | "analysis">("selection");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>([]);
  const [chapterSearch, setChapterSearch] = useState("");
  
  // Per-chapter symptoms: Map<chapterId, string[]>
  const [chapterSymptoms, setChapterSymptoms] = useState<Record<number, string[]>>({});
  // Per-chapter inputs: Map<chapterId, string>
  const [chapterInputs, setChapterInputs] = useState<Record<number, string>>({});
  
  // Results: Map<chapterId, RepertoResult>
  const [analysisResults, setAnalysisResults] = useState<Record<number, RepertoResult>>({});
  
  const [globalSymptoms, setGlobalSymptoms] = useState<string[]>([]);
  const [globalInput, setGlobalInput] = useState("");
  const [identifiedChapters, setIdentifiedChapters] = useState<Chapter[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [chapterLoading, setChapterLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isListening, setIsListening] = useState(false);
  const [listeningChapterId, setListeningChapterId] = useState<number | null>(null);
  const [dictationLang, setDictationLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [isGlobalListening, setIsGlobalListening] = useState(false);
  
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  const recognitionRef = useRef<any>(null);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  // Probe cache: symptom string → identified root chapter name
  // Persists across analyses in the same session — avoids repeat API probes.
  const probeCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    fetch(`${API_BASE}/doctor/rubrics/chapters/`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { 
        if (d.success) {
          const allowed = ["Mind", "Head", "Eyes", "Ears"];
          const filtered = (d.chapters || []).filter((c: any) => 
            allowed.some(a => c.name.toLowerCase().includes(a.toLowerCase()))
          );
          setChapters(filtered); 
        }
      })
      .catch(() => setError("Failed to load chapters"))
      .finally(() => setChapterLoading(false));
      
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (listeningChapterId !== null) {
            // Chapter-specific dictation
            setChapterInputs(prev => ({
              ...prev,
              [listeningChapterId]: (prev[listeningChapterId] || "") + " " + transcript
            }));
          } else {
            // Global dictation — append to global input
            setGlobalInput(prev => (prev ? prev + " " + transcript : transcript).trim());
          }
          setIsListening(false);
          setIsGlobalListening(false);
          setListeningChapterId(null);
        };
        
        recognitionRef.current.onerror = () => { setIsListening(false); setIsGlobalListening(false); setListeningChapterId(null); };
        recognitionRef.current.onend   = () => { setIsListening(false); setIsGlobalListening(false); setListeningChapterId(null); };
      }
    }
  }, [listeningChapterId]);

  const toggleGlobalListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    if (isGlobalListening) {
      recognitionRef.current.stop();
      setIsGlobalListening(false);
    } else {
      try {
        recognitionRef.current.lang = dictationLang;
        recognitionRef.current.start();
        setIsGlobalListening(true);
        setListeningChapterId(null); // Ensure global mode
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleListening = (chapterId: number) => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Try Chrome.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setListeningChapterId(null);
    } else {
      try {
        recognitionRef.current.lang = dictationLang;
        recognitionRef.current.start();
        setIsListening(true);
        setListeningChapterId(chapterId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleChapterSelection = (chapter: Chapter) => {
    setSelectedChapters(prev => {
      const exists = prev.find(c => c.id === chapter.id);
      if (exists) {
        const next = prev.filter(c => c.id !== chapter.id);
        // Clean up symptoms/inputs
        const newSymptoms = { ...chapterSymptoms };
        const newInputs = { ...chapterInputs };
        delete newSymptoms[chapter.id];
        delete newInputs[chapter.id];
        setChapterSymptoms(newSymptoms);
        setChapterInputs(newInputs);
        return next;
      }
      return [...prev, chapter];
    });
    // Auto-close sidebar after selection/deselection
    setIsSidebarExpanded(false);
  };

  const addSymptom = (chapterId: number) => {
    const v = (chapterInputs[chapterId] || "").trim().toLowerCase();
    if (!v) return;
    
    setChapterSymptoms(prev => {
      const current = prev[chapterId] || [];
      if (current.includes(v)) return prev;
      return { ...prev, [chapterId]: [...current, v] };
    });
    setChapterInputs(prev => ({ ...prev, [chapterId]: "" }));
    inputRefs.current[chapterId]?.focus();
  };

  const removeSymptom = (chapterId: number, index: number) => {
    setChapterSymptoms(prev => ({
      ...prev,
      [chapterId]: (prev[chapterId] || []).filter((_, i) => i !== index)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, chapterId: number) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSymptom(chapterId);
    } else if (e.key === "Backspace" && !(chapterInputs[chapterId]) && (chapterSymptoms[chapterId]?.length)) {
      removeSymptom(chapterId, (chapterSymptoms[chapterId]?.length || 0) - 1);
    }
  };

  const runAnalysis = async () => {
    const hasManualSelection = selectedChapters.length > 0;
    const symsToAnalyze = hasManualSelection
      ? selectedChapters.flatMap(c => chapterSymptoms[c.id] || [])
      : globalSymptoms;

    if (symsToAnalyze.length === 0) {
      setError("Add at least one symptom to analyze.");
      return;
    }

    setError("");
    setLoading(true);
    const newResults: Record<number, RepertoResult> = {};

    try {
      if (hasManualSelection) {
        // ── Manual mode: query each selected chapter directly ───────────────
        await Promise.all(
          selectedChapters
            .filter(c => (chapterSymptoms[c.id]?.length || 0) > 0)
            .map(async (chapter) => {
              const res = await fetch(`${API_BASE}/doctor/rubrics/repertorize/`, {
                method: "POST", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chapter_id: chapter.id, symptoms: chapterSymptoms[chapter.id], top_n: 7 }),
              });
              const data = await res.json();
              if (res.ok && data.success) newResults[chapter.id] = data;
            })
        );
      } else {
        // ── Global mode: fast chapter identification ──────────────────────────
        //
        // STEP 1: Score chapters using the local KEYWORD_INDEX (O(words) per symptom).
        //         For any symptom whose words are ALL unknown to the index,
        //         fall back to an API probe — and cache that result.
        const chapterSymMap: Record<number, { chapter: Chapter; syms: string[] }> = {};

        const resolveChapterName = async (sym: string): Promise<string[]> => {
          // Check probe cache first
          if (probeCache.current.has(sym)) return [probeCache.current.get(sym)!];

          const lowerSym = sym.toLowerCase();

          // Check exact phrase matches first
          for (const [phrase, chName] of Object.entries(PHRASE_INDEX)) {
            if (lowerSym.includes(phrase.toLowerCase())) {
              probeCache.current.set(sym, chName);
              return [chName];
            }
          }

          // Tokenize symptom: split on spaces, commas, pipe, Hindi danda, periods, etc.
          const stopWords = new Set(["में", "का", "की", "से", "को", "पर", "और", "है", "हैं", "था", "थी", "थे", "वाला", "वाली", "वाले", "के", "लिए", "करता", "करती", "करते"]);
          const tokens = lowerSym.split(/[\s,।|.:;!\-?–—]+/).filter(t => t.length >= 2 && !stopWords.has(t));
          
          // Score each token against the keyword index
          const scores: Record<string, number> = {};
          for (const token of tokens) {
            // Exact match — GENERALITIES gets lower base score
            if (KEYWORD_INDEX[token]) {
              const weight = (KEYWORD_INDEX[token] === "GENERALITIES") ? 5 : 10;
              scores[KEYWORD_INDEX[token]] = (scores[KEYWORD_INDEX[token]] || 0) + weight;
              continue;
            }
            // Prefix / substring match (handles plural, conjugations safely)
            for (const [kw, chName] of Object.entries(KEYWORD_INDEX)) {
              if (token === kw || (token.length >= 4 && kw.length >= 4 && (token.startsWith(kw) || kw.startsWith(token)))) {
                // Anatomy chapters get 10 points (highly specific)
                // Condition chapters (Skin, Fever, Sleep) get 5 points
                // Generalities get 3 points
                let weight = 10;
                if (chName === "GENERALITIES") weight = 3;
                else if (["Skin", "Fever", "Sleep", "Nervous"].includes(chName as string)) weight = 5;
                
                scores[chName as string] = (scores[chName as string] || 0) + weight;
              }
            }
          }

          if (Object.keys(scores).length > 0) {
            // Return all chapters that are tied or very close to the top score
            const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
            const topScore = sorted[0][1];
            const bestChapters = sorted.filter(s => topScore - s[1] <= 4).map(s => s[0]);
            probeCache.current.set(sym, bestChapters[0]); // Cache the primary one
            return bestChapters;
          }

          // Fallback: single API probe (only for completely unknown terms)
          try {
            const res = await fetch(`${API_BASE}/doctor/rubrics/repertorize/`, {
              method: "POST", credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ symptoms: [sym], top_n: 1 }),
            });
            if (!res.ok) return [];
            const data = await res.json();
            if (!data.success || !data.top_rubrics?.length) return [];
            const rootName = (data.top_rubrics[0].full_path || "").split(">")[0].trim();
            probeCache.current.set(sym, rootName); // Cache for next time
            return [rootName];
          } catch {
            return [];
          }
        };

        // Resolve all symptoms in parallel
        const resolved = await Promise.all(
          globalSymptoms.map(async sym => ({ sym, rootNames: await resolveChapterName(sym) }))
        );

        // Group symptoms by matched chapter
        for (const { sym, rootNames } of resolved) {
          if (!rootNames || rootNames.length === 0) continue;
          
          for (const rootName of rootNames) {
            const matched = chapters.find(ch =>
              ch.name.toLowerCase() === rootName.toLowerCase() ||
              ch.name.toLowerCase().includes(rootName.toLowerCase()) ||
              rootName.toLowerCase().includes(ch.name.toLowerCase())
            );
            if (!matched) continue;
            if (!chapterSymMap[matched.id]) chapterSymMap[matched.id] = { chapter: matched, syms: [] };
            if (!chapterSymMap[matched.id].syms.includes(sym)) {
              chapterSymMap[matched.id].syms.push(sym);
            }
          }
        }

        const chaptersToQuery = Object.values(chapterSymMap);
        if (chaptersToQuery.length === 0) {
          setError("Could not identify relevant chapters. Try more specific keywords.");
          return;
        }
        setIdentifiedChapters(chaptersToQuery.map(c => c.chapter));

        // STEP 2: Query each identified chapter (parallel, all use real IDs)
        await Promise.all(
          chaptersToQuery.map(async ({ chapter, syms }) => {
            const res = await fetch(`${API_BASE}/doctor/rubrics/repertorize/`, {
              method: "POST", credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chapter_id: chapter.id, symptoms: syms, top_n: 7 }),
            });
            const data = await res.json();
            if (res.ok && data.success) newResults[chapter.id] = data;
          })
        );
      }

      if (Object.keys(newResults).length === 0) {
        setError("No rubric matches found. Try different symptom keywords.");
        return;
      }

      setAnalysisResults(newResults);
      setIsAnalysisModalOpen(true);
    } catch (e: any) {
      setError("Analysis failed: " + (e.message || "Network error."));
    } finally {
      setLoading(false);
    }
  };

  const filteredChapters = chapters.filter(c =>
    c.name.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    (c.name_hindi || "").toLowerCase().includes(chapterSearch.toLowerCase())
  );


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
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        .chapter-card { transition:all .18s ease; }
        .chapter-card:hover { transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,.1); }
      `}</style>
      
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Table2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-lg leading-none">Global Repertory Analysis</h1>
                <p className="text-gray-400 text-xs mt-0.5">Enter symptoms below to automatically identify chapters</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedChapters.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                <BookOpen className="w-3.5 h-3.5" />
                {selectedChapters.length} Chapters Selected
              </div>
            )}
            <button 
              onClick={() => setIsRubricModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
              ADD RUBRIC
            </button>
            <button 
              onClick={runAnalysis}
              disabled={loading || (selectedChapters.length === 0 && globalSymptoms.length === 0)}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              ANALYZE
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden">
        


        {/* MAIN AREA: 3 Columns */}
        <main className="flex-1 bg-gray-50 overflow-hidden flex flex-col p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm font-medium animate-shake">
              <AlertCircle className="w-5 h-5" />
              {error}
              <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>
            </div>
          )}

          {selectedChapters.length === 0 ? (
            <div className="flex-1 flex flex-col p-8 bg-white rounded-3xl border border-gray-200 shadow-sm mx-auto w-full max-w-5xl">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-indigo-500" />
                    Global Symptom Entry
                  </h3>
                  <p className="text-gray-500 max-w-md">Type all patient symptoms below. The system will automatically detect the relevant repertory chapters.</p>
                </div>
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <Activity className="w-8 h-8 text-indigo-500" />
                </div>
              </div>
              
              <div className="w-full space-y-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-15 group-focus-within:opacity-30 transition duration-1000 group-focus-within:duration-200"></div>
                  <div className="relative flex items-center gap-4 bg-white p-5 rounded-2xl border-2 border-gray-100 focus-within:border-indigo-500 transition-all shadow-sm">
                    <Search className="w-6 h-6 text-gray-300" />
                    <input 
                      type="text" 
                      placeholder="Enter a symptom (e.g. Headache in evening, thirst for cold water)..." 
                      value={globalInput}
                      onChange={e => setGlobalInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && globalInput.trim()) {
                          setGlobalSymptoms(prev => [...prev, globalInput.trim()]);
                          setGlobalInput("");
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-xl font-medium placeholder:text-gray-300"
                    />
                    {/* Language toggle */}
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                      <button
                        onClick={() => setDictationLang("en-IN")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${dictationLang === "en-IN" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setDictationLang("hi-IN")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${dictationLang === "hi-IN" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        हि
                      </button>
                    </div>

                    {/* Microphone button */}
                    <button
                      onClick={toggleGlobalListening}
                      title={isGlobalListening ? "Stop listening" : `Speak in ${dictationLang === "hi-IN" ? "Hindi" : "English"}`}
                      className={`relative p-3 rounded-xl transition-all ${
                        isGlobalListening
                          ? "bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse"
                          : "bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600"
                      }`}
                    >
                      {isGlobalListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      {isGlobalListening && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (globalInput.trim()) {
                          setGlobalSymptoms(prev => [...prev, globalInput.trim()]);
                          setGlobalInput("");
                        }
                      }}
                      className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg font-bold text-sm"
                    >
                      ADD
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">ADDED SYMPTOMS ({globalSymptoms.length})</h4>
                  <div className="flex flex-wrap gap-3">
                    {globalSymptoms.map((sym, idx) => (
                      <div key={idx} className="group flex items-center gap-3 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all animate-in slide-in-from-top-2">
                        <Tag className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-bold text-gray-800">{sym}</span>
                        <button onClick={() => setGlobalSymptoms(prev => prev.filter((_, i) => i !== idx))} className="ml-2">
                          <X className="w-4 h-4 text-gray-300 group-hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    ))}
                    {globalSymptoms.length === 0 && (
                      <div className="w-full py-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center opacity-40">
                        <Pill className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-400">Start by typing a symptom above</p>
                      </div>
                    )}
                  </div>
                </div>

                {globalSymptoms.length > 0 && (
                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                      onClick={runAnalysis}
                      disabled={loading}
                      className="group relative flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:animate-pulse" />}
                      RUN FULL ANALYSIS
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full overflow-y-auto lg:overflow-hidden p-1">
              {selectedChapters.map((chapter) => (
                <div key={chapter.id} className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] lg:min-h-0">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{chapter.name}</h3>
                      {chapter.name_hindi && <p className="text-[10px] text-orange-500 font-medium">{chapter.name_hindi}</p>}
                    </div>
                    <button 
                      onClick={() => toggleChapterSelection(chapter)}
                      className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-lg transition-colors flex-shrink-0 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Symptom Input */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl border border-gray-200 focus-within:border-indigo-400 focus-within:bg-white transition-all overflow-hidden">
                      <input 
                        ref={el => inputRefs.current[chapter.id] = el}
                        type="text" 
                        placeholder="Add symptom..." 
                        value={chapterInputs[chapter.id] || ""}
                        onChange={e => setChapterInputs(prev => ({ ...prev, [chapter.id]: e.target.value }))}
                        onKeyDown={e => handleKeyDown(e, chapter.id)}
                        className="flex-1 bg-transparent border-none outline-none text-sm px-2 min-w-0"
                      />
                      <button 
                        onClick={() => toggleListening(chapter.id)}
                        className={`p-2 rounded-lg transition-all flex-shrink-0 ${isListening && listeningChapterId === chapter.id ? "bg-red-500 text-white animate-pulse" : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50"}`}
                      >
                        {isListening && listeningChapterId === chapter.id ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => addSymptom(chapter.id)}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Symptom List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {(chapterSymptoms[chapter.id] || []).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-30">
                        <Tag className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-xs font-medium">No symptoms added</p>
                      </div>
                    ) : (
                      chapterSymptoms[chapter.id].map((sym, idx) => (
                        <div key={idx} className="group flex items-start justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition-all animate-in slide-in-from-top-2 gap-2">
                          <div className="flex items-start gap-2 min-w-0 flex-1 pt-0.5">
                            <Tag className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-semibold text-gray-700 break-words whitespace-normal text-left">{sym}</span>
                          </div>
                          <button 
                            onClick={() => removeSymptom(chapter.id, idx)}
                            className="p-1 text-gray-300 hover:text-red-500 hover:bg-white rounded-md transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
              
              {selectedChapters.length > 0 && (
                <button 
                  onClick={() => setIsSidebarExpanded(true)}
                  className="flex flex-col border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center text-center p-6 opacity-40 hover:opacity-100 hover:border-indigo-300 transition-all group"
                >
                  <Plus className="w-10 h-10 text-gray-300 mb-2 group-hover:text-indigo-400" />
                  <p className="text-sm font-bold text-gray-400 group-hover:text-indigo-500">Add another chapter</p>
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ANALYSIS MODAL */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-[1400px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                  Comparative Analysis Results
                </h2>
                <p className="text-sm text-gray-500">
                  Showing results across {Object.values(analysisResults).filter(r => r.top_rubrics?.length > 0).length} matched chapter{Object.values(analysisResults).filter(r => r.top_rubrics?.length > 0).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button 
                onClick={() => setIsAnalysisModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500 text-gray-400 flex items-center justify-center transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 bg-gray-50/50 w-full overflow-hidden flex flex-col">
              <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-y-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse border border-gray-200">
                  <thead className="sticky top-0 z-50 shadow-sm">
                    <tr>
                      <th style={{width:'18%'}} className="p-5 font-black text-slate-700 bg-slate-50/90 backdrop-blur-md border-b border-r border-slate-200 uppercase text-[11px] tracking-widest">Symptom & Chapter</th>
                      <th style={{width:'32%'}} className="p-5 font-black text-slate-700 bg-slate-50/90 backdrop-blur-md border-b border-r border-slate-200 uppercase text-[11px] tracking-widest">Selected Rubric</th>
                      <th style={{width:'30%'}} className="p-5 font-black text-slate-700 bg-slate-50/90 backdrop-blur-md border-b border-r border-slate-200 uppercase text-[11px] tracking-widest">Remedy Indicators</th>
                      <th style={{width:'20%'}} className="p-5 font-black text-slate-700 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 uppercase text-[11px] tracking-widest text-right">Clinical Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 align-top bg-white">
                    {(() => {
                      const allSymptomRows: { chapter: Chapter, symptom: string, rubric: any }[] = [];
                      
                      (selectedChapters.length > 0 ? selectedChapters : identifiedChapters).forEach((chapter) => {
                        const result = analysisResults[chapter.id];
                        if (result && result.symptoms_breakdown) {
                          result.symptoms_breakdown.forEach(row => {
                            if (row.rubrics && row.rubrics.length > 0) {
                              row.rubrics.forEach(rb => {
                                allSymptomRows.push({ chapter, symptom: row.symptom, rubric: rb });
                              });
                            }
                          });
                        }
                      });

                      if (allSymptomRows.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-20 text-center">
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                  <MicOff className="w-8 h-8 text-slate-300" />
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-slate-800">No matches found</p>
                                  <p className="text-sm text-slate-500">Try adjusting your symptom keywords or chapter selection.</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return allSymptomRows.map((item, idx) => {
                        const chapter = item.chapter;
                        const rb = item.rubric;

                        const synonyms = (rb.synonyms || []).map((s: any) => 
                          typeof s === 'string' ? s : (s.synonym || "")
                        ).filter(Boolean).slice(0, 5);

                        const aggrs = (rb.modalities?.aggravations || []).map((m: any) => m.name).slice(0, 4);
                        const amels = (rb.modalities?.ameliorations || []).map((m: any) => m.name).slice(0, 4);

                        return (
                          <tr key={`${chapter.id}-${idx}`} className="group hover:bg-indigo-50/30 transition-all duration-300">
                            {/* Symptom & Chapter */}
                            <td className="p-5 border-r border-slate-100 relative">
                              <div className="flex flex-col gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-tight w-fit">
                                  {chapter.name}
                                </span>
                                <p className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-900 transition-colors">{item.symptom}</p>
                              </div>
                            </td>

                            {/* Selected Rubric */}
                            <td className="p-5 border-r border-slate-100">
                              <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm ring-1 ring-slate-900/5 group-hover:ring-indigo-500/20 transition-all">
                                <p className="text-sm font-bold text-slate-800 leading-relaxed mb-1.5">{rb.full_path || rb.name}</p>
                                {rb.name_hindi && (
                                  <div className="flex items-center gap-1.5">
                                    <Tag className="w-3 h-3 text-orange-400" />
                                    <p className="text-xs font-medium text-orange-600/90 italic">{rb.name_hindi}</p>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Remedy Indicators */}
                            <td className="p-5 border-r border-slate-100">
                              <div className="flex flex-wrap gap-1.5">
                                {(rb.medicines || []).slice(0, 12).map((med, mi) => (
                                  <div 
                                    key={mi} 
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all hover:scale-105 cursor-default ${
                                      med.grade === 3 ? "bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-100" :
                                      med.grade === 2 ? "bg-blue-50 text-blue-700 border-blue-100 shadow-sm shadow-blue-100" :
                                      "bg-slate-50 text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    <Pill className={`w-2.5 h-2.5 ${med.grade === 3 ? "text-rose-400" : med.grade === 2 ? "text-blue-400" : "text-slate-400"}`} />
                                    {med.name}
                                  </div>
                                ))}
                                {(rb.medicines || []).length > 12 && (
                                  <span className="text-[10px] text-slate-400 font-black self-center ml-1">+{rb.medicines.length - 12} MORE</span>
                                )}
                              </div>
                            </td>

                            {/* Clinical Context */}
                            <td className="p-5 text-right">
                              <div className="flex flex-col gap-3 items-end">
                                {(aggrs.length > 0 || amels.length > 0) && (
                                  <div className="flex flex-wrap gap-1 justify-end">
                                    {aggrs.map((m, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[9px] font-black border border-red-100 uppercase tracking-tighter">
                                        Worse: {m}
                                      </span>
                                    ))}
                                    {amels.map((m, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black border border-emerald-100 uppercase tracking-tighter">
                                        Better: {m}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {synonyms.length > 0 && (
                                  <div className="flex flex-wrap gap-1 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                                    {synonyms.map((s, i) => (
                                      <span key={i} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {!aggrs.length && !amels.length && !synonyms.length && (
                                  <span className="text-[10px] text-slate-400 font-medium italic bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Standard Presentation</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>

                {/* Remedy Indicator Leaderboard */}
                {(() => {
                  // Map to track unique symptoms per medicine
                  const medStats = new Map<number, { id: number, name: string, symptomsCovered: number }>();
                  let totalSymptomsAnalyzed = 0;

                  (selectedChapters.length > 0 ? selectedChapters : identifiedChapters).forEach((chapter) => {
                    const result = analysisResults[chapter.id];
                    if (result && result.symptoms_breakdown) {
                      result.symptoms_breakdown.forEach(row => {
                        if (row.rubrics && row.rubrics.length > 0) {
                          totalSymptomsAnalyzed++;
                          
                          const medsInSymptom = new Set<number>();
                          const medNames = new Map<number, string>();
                          
                          row.rubrics.forEach(rb => {
                            (rb.medicines || []).forEach((m: any) => {
                              medsInSymptom.add(m.id);
                              medNames.set(m.id, m.name);
                            });
                          });

                          medsInSymptom.forEach(mId => {
                            if (medStats.has(mId)) {
                              medStats.get(mId)!.symptomsCovered += 1;
                            } else {
                              medStats.set(mId, { id: mId, name: medNames.get(mId) || "Unknown", symptomsCovered: 1 });
                            }
                          });
                        }
                      });
                    }
                  });

                  const sortedMeds = Array.from(medStats.values())
                    .sort((a, b) => b.symptomsCovered - a.symptomsCovered)
                    .slice(0, 15);
                  
                  if (sortedMeds.length === 0 || totalSymptomsAnalyzed === 0) return null;

                  return (
                    <div className="p-10 bg-gradient-to-br from-slate-50 to-white border-t border-slate-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 flex items-center justify-center ring-4 ring-indigo-50">
                            <Activity className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Remedy Indicator Leaderboard</h3>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Symptom Coverage Analysis ({totalSymptomsAnalyzed} total symptoms)</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-5 max-w-3xl mx-auto pb-12">
                        {sortedMeds.map((med, i) => {
                          const pct = Math.round((med.symptomsCovered / totalSymptomsAnalyzed) * 100);
                          return (
                            <div key={med.id} className="relative group">
                              <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 flex flex-col md:flex-row items-center gap-6 ${
                                i === 0 ? 'bg-indigo-50/50 border-indigo-200 shadow-xl shadow-indigo-100/50' : 
                                'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-lg'
                              }`}>
                                {/* Rank & Icon */}
                                <div className="flex items-center gap-4 min-w-[180px]">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${
                                    i === 0 ? 'bg-indigo-600 text-white' : 
                                    i === 1 ? 'bg-slate-200 text-slate-600' :
                                    i === 2 ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-50 text-slate-400'
                                  }`}>
                                    {i === 0 ? <Star className="w-8 h-8 fill-current" /> : (i + 1)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">{med.name}</span>
                                    {i === 0 && <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Recommended Primary</span>}
                                  </div>
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block w-px h-10 bg-slate-100 mx-2"></div>

                                {/* Stats & Bars */}
                                <div className="flex-1 w-full space-y-4">
                                  <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-2">
                                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-tighter border border-slate-200">
                                        Coverage: {med.symptomsCovered}/{totalSymptomsAnalyzed} symptoms
                                      </span>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-xl text-sm font-black border-2 transition-all ${
                                      pct >= 70 ? 'bg-blue-950 text-white border-blue-900' :
                                      pct >= 50 ? 'bg-blue-800 text-white border-blue-700' :
                                      'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                      {pct}% Match
                                    </div>
                                  </div>

                                  <div className="relative h-6 bg-slate-100 rounded-full border border-slate-200 shadow-inner overflow-hidden p-1">
                                    <div
                                      style={{ width: `${pct}%` }}
                                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg relative ${
                                        pct >= 70 ? 'bg-gradient-to-r from-blue-700 to-blue-950' :
                                        pct >= 50 ? 'bg-gradient-to-r from-blue-500 to-blue-800' :
                                        'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                      }`}
                                    >
                                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move-stripe_2s_linear_infinite]"></div>
                                    </div>
                                    
                                    {/* Critical Benchmarks */}
                                    <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-blue-500/20"></div>
                                    <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-blue-700/30"></div>
                                  </div>
                                  
                                  <div className="flex justify-between px-2">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Base</span>
                                    <div className="flex items-center gap-1.5">
                                       <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                       <span className="text-[9px] font-black text-blue-800 uppercase tracking-widest">50% Marker</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                       <div className="w-1.5 h-1.5 rounded-full bg-blue-950"></div>
                                       <span className="text-[9px] font-black text-blue-950 uppercase tracking-widest">70% Critical</span>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Full</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
              <button 
                onClick={() => setIsAnalysisModalOpen(false)}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg"
              >
                Close Results
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rubric Management Modal */}
      <RubricModal
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
        onSuccess={() => {
          setSuccessMessage("Rubric added successfully!");
          // Refresh chapters if needed
          fetch(`${API_BASE}/doctor/rubrics/chapters/`, { credentials: "include" })
            .then(r => r.json())
            .then(d => { if (d.success) setChapters(d.chapters || []); });
          setTimeout(() => setSuccessMessage(""), 3000);
        }}
      />

      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}
    </div>
  );
}
