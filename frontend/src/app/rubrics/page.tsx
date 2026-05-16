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
// ─── Inverted Index: keyword → candidate chapter names ───────────────────────
// Resolves symptoms to chapters entirely client-side for known terms.
const KEYWORD_INDEX: Record<string, string> = {
  // ── Mind ─────────────────────────────────────────────────────────────────
  anger:"Mind", anxiety:"Mind", anxious:"Mind", fear:"Mind", grief:"Mind", sad:"Mind", sadness:"Mind", depressed:"Mind", depression:"Mind",
  irritab:"Mind", mental:"Mind", worry:"Mind", confused:"Mind", confusion:"Mind", memory:"Mind", delusion:"Mind", insanity:"Mind",
  weeping:"Mind", jealous:"Mind", indifference:"Mind", restless:"Mind",
  contradiction:"Mind", forgetful:"Mind", aversion:"Mind", mania:"Mind",
  morose:"Mind", sensitive:"Mind", timid:"Mind", suspicious:"Mind",
  "मन":"Mind", "डर":"Mind", "गुस्सा":"Mind", "दुख":"Mind", "चिंता":"Mind",
  "भय":"Mind", "क्रोध":"Mind", "उदासी":"Mind", "निराशा":"Mind", "शोक":"Mind",
  "दुखी":"Mind", "निराश":"Mind", "रोना":"Mind", "रोता":"Mind", "रोती":"Mind",
  "अकेलापन":"Mind", "उदास":"Mind", "हताश":"Mind", "विषाद":"Mind",
  "बेचैनी":"Mind", "भ्रम":"Mind", "याददाश्त":"Mind", "एकाग्रता":"Mind", "ध्यान":"Mind", "पढ़ते":"Mind",
  "संदेह":"Mind", "शक":"Mind", "संकोच":"Mind",

  // ── Head ─────────────────────────────────────────────────────────────────
  headache:"Head", head:"Head", migraine:"Head", scalp:"Head", forehead:"Head", temple:"Head", occiput:"Head", vertex:"Head",
  "सिर":"Head", "माथा":"Head", "सिरदर्द":"Head", "आधाशीशी":"Head",
  "शिर":"Head", "सिर में":"Head",

  // ── Eyes ─────────────────────────────────────────────────────────────────
  eye:"Eyes", eyes:"Eyes", vision:"Eyes", sight:"Eyes", cornea:"Eyes", conjunctiv:"Eyes",
  lachrymation:"Eyes", photophobia:"Eyes", lids:"Eyes", lid:"Eyes",
  eyelid:"Eyes", pupil:"Eyes", retina:"Eyes", optic:"Eyes",
  "आँख":"Eyes", "आंख":"Eyes", "आँखों":"Eyes", "आंखों":"Eyes",
  "पलक":"Eyes", "आँसू":"Eyes",

  // ── Ears ─────────────────────────────────────────────────────────────────
  ear:"Ears", ears:"Ears", hearing:"Ears", tinnitus:"Ears", deafness:"Ears",
  otitis:"Ears", discharge:"Ears", cerumen:"Ears", wax:"Ears",
  "कान":"Ears", "कानों":"Ears", "कान में":"Ears",

  // ── Nose ─────────────────────────────────────────────────────────────────
  nose:"Nose", coryza:"Nose", sneezing:"Nose", epistaxis:"Nose", sinusitis:"Nose",
  smell:"Nose", sniffing:"Nose", "नाक":"Nose", "छींक":"Nose", "जुकाम":"Nose",

  // ── Stomach ──────────────────────────────────────────────────────────────
  stomach:"Stomach", appetite:"Stomach", thirst:"Stomach", nausea:"Stomach",
  vomiting:"Stomach", indigestion:"Stomach", heartburn:"Stomach", eructations:"Stomach",
  "पेट":"Stomach", "प्यास":"Stomach", "भूख":"Stomach", "उल्टी":"Stomach", "मतली":"Stomach",

  // ── Abdomen ──────────────────────────────────────────────────────────────
  abdomen:"Abdomen", abdominal:"Abdomen", liver:"Abdomen", spleen:"Abdomen", flatulence:"Abdomen",
  colic:"Abdomen", distension:"Abdomen", "पेट":"Abdomen", "कोख":"Abdomen", "पेड़ू":"Abdomen",

  // ── Extremities ──────────────────────────────────────────────────────────
  extremities:"Extremities", hands:"Extremities", legs:"Extremities", knee:"Extremities",
  shoulder:"Extremities", joints:"Extremities", rheumatism:"Extremities", numbness:"Extremities",
  "हाथ":"Extremities", "पैर":"Extremities", "घुटने":"Extremities", "जोड़ों":"Extremities",

  // ── Generalities ─────────────────────────────────────────────────────────
  generalities:"Generalities", weakness:"Generalities", fatigue:"Generalities",
  collapse:"Generalities", convulsions:"Generalities", pain:"Generalities",
  "सामान्य":"Generalities", "कमजोरी":"Generalities", "थकावट":"Generalities",
  "दर्द":"Generalities", "शरीर":"Generalities", "बदन":"Generalities", "पूरे":"Generalities",
} as Record<string, string>;

// Exact phrase index to override single-word tokens
const PHRASE_INDEX: Record<string, string> = {
  "सिर में दर्द": "Head",
  "सिर दर्द":    "Head",
  "आँख में":     "Eyes",
  "कान में":     "Ears",
  "पेट में":     "Stomach",
  "हाथ पैर":    "Extremities",
  "पूरे शरीर":   "Generalities",
  "बदन दर्द":    "Generalities",
  "शरीर में दर्द": "Generalities",
  "abdominal pain": "Abdomen",
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
  
  const [globalSymptoms, setGlobalSymptoms] = useState<{ text: string, rubric?: any }[]>([]);
  const [globalInput, setGlobalInput] = useState("");
  const [globalSearchChapters, setGlobalSearchChapters] = useState<{name:string; rubrics:any[]}[]>([]);
  const [globalSearching, setGlobalSearching] = useState(false);
  const [globalExpandedChapters, setGlobalExpandedChapters] = useState<Set<string>>(new Set());
  const GLOBAL_PREVIEW = 5;
  const [identifiedChapters, setIdentifiedChapters] = useState<Chapter[]>([]);
  // Rows built directly from pre-selected rubrics (no API call needed)
  const [preSelectedRows, setPreSelectedRows] = useState<{ chapter: Chapter, symptom: string, rubric: any }[]>([]);
  
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
  const globalInputContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  // Probe cache: symptom string → identified root chapter name
  // Persists across analyses in the same session — avoids repeat API probes.
  const probeCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    fetch(`${API_BASE}/doctor/rubrics/chapters/`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { 
        if (d.success) {
          // Allow all chapters returned by the backend
          setChapters(d.chapters || []); 
        }
      })
      .catch(() => setError("Failed to load chapters"))
      .finally(() => setChapterLoading(false));
      
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const transcript = finalTranscript || interimTranscript;

          if (listeningChapterId !== null) {
            // Chapter-specific dictation
            setChapterInputs(prev => ({
              ...prev,
              [listeningChapterId]: (prev[listeningChapterId] || "") + (event.results[0].isFinal ? " " + transcript : transcript)
            }));
          } else {
            // Global dictation
            if (event.results[0].isFinal) {
              setGlobalInput(prev => (prev ? prev + " " + transcript : transcript).trim());
            } else {
              // For interim, we can temporarily show it or just wait
              // For now, let's only update on final to avoid jitter, 
              // but we can show interim state if we had an interim state variable
            }
          }

          if (event.results[0].isFinal) {
            setIsListening(false);
            setIsGlobalListening(false);
            setListeningChapterId(null);
          }
        };
        
        recognitionRef.current.onerror = () => { setIsListening(false); setIsGlobalListening(false); setListeningChapterId(null); };
        recognitionRef.current.onend   = () => { setIsListening(false); setIsGlobalListening(false); setListeningChapterId(null); };
      }
    }
  }, [listeningChapterId]);

  // ── Global input live search ───────────────────────────────────────────────
  useEffect(() => {
    if (globalInput.trim().length < 2) {
      setGlobalSearchChapters([]);
      setGlobalExpandedChapters(new Set());
      setDropdownPos(null);
      return;
    }
    // Calculate fixed position from the container's bounding rect
    if (globalInputContainerRef.current) {
      const rect = globalInputContainerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 12, left: rect.left, width: rect.width });
    }
    const timer = setTimeout(() => {
      searchGlobalRubrics(globalInput);
      setGlobalExpandedChapters(new Set());
    }, 300);
    return () => clearTimeout(timer);
  }, [globalInput]);

  // Close dropdown on outside click or page scroll
  useEffect(() => {
    const close = (e: MouseEvent) => {
      // Don't close if clicking inside the input container OR the dropdown itself
      const isInsideInput = globalInputContainerRef.current?.contains(e.target as Node);
      const isInsideDropdown = dropdownRef.current?.contains(e.target as Node);
      
      if (!isInsideInput && !isInsideDropdown) {
        setDropdownPos(null);
        setGlobalSearchChapters([]);
      }
    };
    const onScroll = (e: Event) => { 
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) return;
      setDropdownPos(null); 
      setGlobalSearchChapters([]); 
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, []);

  const searchGlobalRubrics = async (q: string) => {
    setGlobalSearching(true);
    try {
      const res = await fetch(
        `${API_BASE}/doctor/rubrics/search/?query=${encodeURIComponent(q)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setGlobalSearchChapters(data.chapters || []);
    } catch {
      setGlobalSearchChapters([]);
    } finally {
      setGlobalSearching(false);
    }
  };

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

    if (hasManualSelection) {
      // ── Manual chapter mode: query each selected chapter directly ────────
      const symsToAnalyze = selectedChapters.flatMap(c => chapterSymptoms[c.id] || []);
      if (symsToAnalyze.length === 0) {
        setError("Add at least one symptom to analyze.");
        return;
      }
      setError("");
      setLoading(true);
      const newResults: Record<number, RepertoResult> = {};
      try {
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
        if (Object.keys(newResults).length === 0) {
          setError("No rubric matches found. Try different symptom keywords.");
          return;
        }
        setAnalysisResults(newResults);
        setPreSelectedRows([]);
        setIsAnalysisModalOpen(true);
      } catch (e: any) {
        setError("Analysis failed: " + (e.message || "Network error."));
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Global mode ──────────────────────────────────────────────────────────
    if (globalSymptoms.length === 0) {
      setError("Add at least one symptom to analyze.");
      return;
    }

    setError("");
    setLoading(true);
    // Reset stale state from any previous analysis run
    setIdentifiedChapters([]);
    setAnalysisResults({});
    setPreSelectedRows([]);
    const newResults: Record<number, RepertoResult> = {};
    const directRows: { chapter: Chapter, symptom: string, rubric: any }[] = [];

    try {
      // --- Separate pre-selected rubrics from raw text symptoms ---
      const withRubric = globalSymptoms.filter(s => s.rubric);
      const rawTextSyms = globalSymptoms.filter(s => !s.rubric);

      // 1. Pre-selected rubrics: build rows directly from stored data — NO API call
      for (const entry of withRubric) {
        const rb = entry.rubric;
        // Find the parent chapter from our chapters list
        const chapterName = (rb.chapter_name || (rb.full_path || "").split(">")[0]).trim();
        const chapter = chapters.find(ch =>
          ch.name.toLowerCase() === chapterName.toLowerCase() ||
          ch.name.toLowerCase().includes(chapterName.toLowerCase()) ||
          chapterName.toLowerCase().includes(ch.name.toLowerCase())
        );
        if (chapter) {
          directRows.push({ chapter, symptom: entry.text, rubric: rb });
        }
      }

      // 2. Raw text symptoms: use NLP + API
      if (rawTextSyms.length > 0) {
        const resolveChapterName = async (sym: string): Promise<string[]> => {
          if (probeCache.current.has(sym)) return [probeCache.current.get(sym)!];
          const stopWords = new Set([
            "में", "का", "की", "से", "को", "पर", "और", "है", "हैं", "था", "थी", "थे", "वाला", "वाली", "वाले", "के", "लिए", "करता", "करती", "करते",
            "the", "in", "at", "on", "and", "is", "was", "with", "for", "during", "of", "to", "a", "an", "this", "that", "these", "those"
          ]);
          const lowerSym = sym.toLowerCase();
          if (sym.includes(">")) {
            const root = sym.split(">")[0].trim();
            const ch = chapters.find(c => c.name.toLowerCase() === root.toLowerCase());
            if (ch) { probeCache.current.set(sym, ch.name); return [ch.name]; }
          }
          for (const [phrase, chName] of Object.entries(PHRASE_INDEX)) {
            if (lowerSym.includes(phrase.toLowerCase())) { probeCache.current.set(sym, chName); return [chName]; }
          }
          const tokens = lowerSym.split(/[\s,।|.:;!\-?–—]+/).filter(t => t.length >= 2 && !stopWords.has(t));
          const scores: Record<string, number> = {};
          for (const token of tokens) {
            if (KEYWORD_INDEX[token]) {
              const w = KEYWORD_INDEX[token] === "GENERALITIES" ? 5 : 10;
              scores[KEYWORD_INDEX[token]] = (scores[KEYWORD_INDEX[token]] || 0) + w;
              continue;
            }
            for (const [kw, chName] of Object.entries(KEYWORD_INDEX)) {
              if (token === kw || (token.length >= 4 && kw.length >= 4 && (token.startsWith(kw) || kw.startsWith(token)))) {
                let w = 10;
                if (chName === "GENERALITIES") w = 3;
                else if (["Skin", "Fever", "Sleep", "Nervous"].includes(chName as string)) w = 5;
                scores[chName as string] = (scores[chName as string] || 0) + w;
              }
            }
          }
          if (Object.keys(scores).length > 0) {
            const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
            const top = sorted[0][1];
            const best = sorted.filter(s => top - s[1] <= 4).map(s => s[0]);
            probeCache.current.set(sym, best[0]);
            return best;
          }
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
            probeCache.current.set(sym, rootName);
            return [rootName];
          } catch { return []; }
        };

        const resolved = await Promise.all(
          rawTextSyms.map(async entry => ({ entry, rootNames: await resolveChapterName(entry.text) }))
        );
        const chapterSymMap: Record<number, { chapter: Chapter; syms: string[] }> = {};
        for (const { entry, rootNames } of resolved) {
          if (!rootNames || rootNames.length === 0) continue;
          for (const rootName of rootNames) {
            const matched = chapters.find(ch =>
              ch.name.toLowerCase() === rootName.toLowerCase() ||
              ch.name.toLowerCase().includes(rootName.toLowerCase()) ||
              rootName.toLowerCase().includes(ch.name.toLowerCase())
            );
            if (!matched) continue;
            if (!chapterSymMap[matched.id]) chapterSymMap[matched.id] = { chapter: matched, syms: [] };
            if (!chapterSymMap[matched.id].syms.includes(entry.text)) chapterSymMap[matched.id].syms.push(entry.text);
          }
        }
        const chaptersToQuery = Object.values(chapterSymMap);
        if (chaptersToQuery.length > 0) {
          setIdentifiedChapters(chaptersToQuery.map(c => c.chapter));
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
      }

      // Require at least some data to show
      if (directRows.length === 0 && Object.keys(newResults).length === 0) {
        setError("No rubric matches found. Try different symptom keywords.");
        return;
      }

      setPreSelectedRows(directRows);
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
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
            {isAnalysisModalOpen && (
              <button 
                onClick={() => setIsAnalysisModalOpen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
              >
                <X className="w-4 h-4 text-red-500" />
                CLOSE
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden">
        


        {/* MAIN AREA: 3 Columns */}
        <main className={`flex-1 bg-gray-50 flex flex-col p-4 md:p-6 h-full min-h-0 custom-scrollbar ${isAnalysisModalOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm font-medium animate-shake">
              <AlertCircle className="w-5 h-5" />
              {error}
              <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>
            </div>
          )}

          {isAnalysisModalOpen ? (
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full min-h-0">

              {(() => {
                const allSymptomRows: { chapter: Chapter, symptom: string, rubric: any, serial: number }[] = [];
                let serialCounter = 1;
                
                // 1. First add directly pre-selected rubric rows (no API call)
                preSelectedRows.forEach(row => {
                  allSymptomRows.push({ ...row, serial: serialCounter++ });
                });

                // 2. Then add API-resolved rows
                (selectedChapters.length > 0 ? selectedChapters : identifiedChapters).forEach((chapter) => {
                  const result = analysisResults[chapter.id];
                  if (result && result.symptoms_breakdown) {
                    result.symptoms_breakdown.forEach(row => {
                      if (row.rubrics && row.rubrics.length > 0) {
                        row.rubrics.forEach(rb => {
                          allSymptomRows.push({ chapter, symptom: row.symptom, rubric: rb, serial: serialCounter++ });
                        });
                      }
                    });
                  }
                });

                const medStats = new Map<number, { id: number, name: string, matchedRowNumbers: number[] }>();
                
                allSymptomRows.forEach(item => {
                  (item.rubric.medicines || []).forEach((m: any) => {
                    if (!medStats.has(m.id)) {
                      medStats.set(m.id, { id: m.id, name: m.name, matchedRowNumbers: [] });
                    }
                    const stats = medStats.get(m.id)!;
                    if (!stats.matchedRowNumbers.includes(item.serial)) {
                      stats.matchedRowNumbers.push(item.serial);
                    }
                  });
                });

                const totalRows = allSymptomRows.length;
                const sortedMeds = Array.from(medStats.values()).map(m => {
                  const pct = totalRows > 0 ? Math.round((m.matchedRowNumbers.length / totalRows) * 100) : 0;
                  return { ...m, pct };
                }).sort((a, b) => b.pct - a.pct);

                if (totalRows === 0) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <MicOff className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-bold text-gray-900">No matches found</p>
                      <p className="text-gray-500">Try adjusting your symptom keywords.</p>
                    </div>
                  );
                }

                return (
                  <div className="flex-1 flex flex-col overflow-hidden p-2 md:p-6 h-full min-h-0">
                    {/* Legend Section */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-6 px-5 py-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-sm">
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">1</div>
                          <span className="text-xs font-bold text-indigo-900 uppercase tracking-tight">Rubric Serial Number</span>
                        </div>
                        <div className="w-px h-4 bg-indigo-200 hidden md:block" />
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-black border border-green-200 uppercase">100% Match</div>
                          <span className="text-xs font-bold text-indigo-900 uppercase tracking-tight">Total Case Coverage</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <Activity className="w-3.5 h-3.5 text-indigo-400" />
                        Showing results across <span className="text-indigo-600">{new Set(allSymptomRows.map(r => r.chapter.id)).size}</span> chapters
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-4 min-h-0 w-full overflow-hidden">
                      
                      {/* Box 1: Clinical Chapters */}
                      <div className="lg:w-[12%] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden shrink-0 h-[200px] lg:h-auto">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                            Chapters
                          </h3>
                        </div>
                        <div className="p-4 overflow-y-auto custom-scrollbar space-y-4 flex-1 min-h-0">
                          {(() => {
                            const uniqueChapters = Array.from(new Set(allSymptomRows.map(r => r.chapter.id)))
                              .map(id => allSymptomRows.find(r => r.chapter.id === id)!.chapter);
                            
                            return uniqueChapters.map((ch, idx) => (
                              <div key={idx} style={{ backgroundColor: '#ea580c' }} className="p-4 rounded-xl text-center shadow-lg transform transition-all hover:scale-105 active:scale-95 border border-[#c2410c]">
                                <p className="text-[10px] font-black text-white uppercase leading-tight tracking-wider">
                                  {ch.name}
                                </p>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Box 2: Symptom Rubrics */}
                      <div className="lg:w-[35%] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden shrink-0 h-[300px] lg:h-auto">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-blue-500" />
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                            Rubrics
                          </h3>
                        </div>
                        <div className="p-4 overflow-y-auto custom-scrollbar space-y-3 flex-1 min-h-0">
                          {allSymptomRows.map((item, i) => (
                            <div key={i} className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl flex items-start gap-3 hover:bg-blue-50/60 transition-all group">
                              <span className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                                {item.serial}
                              </span>
                              <div className="min-w-0">
                                <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">
                                  {item.chapter.name}
                                </p>
                                <p className="text-[10px] font-bold text-blue-700 leading-snug break-words">
                                  {item.rubric.full_path || item.rubric.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Box 3: Remedy Analysis */}
                      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[300px] lg:min-h-0">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-emerald-500" />
                            Medicine coverage
                          </h3>
                          <span className="px-2 py-1 rounded-md text-[30px] font-black uppercase tracking-wider border bg-green-100 text-green-700 border-green-200">
                            100%
                          </span>
                        </div>
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                          <div className="space-y-8">
                            {(() => {
                              // Group medicines by each rubric's serial number
                              return allSymptomRows.map(row => (
                                <div key={row.serial} className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">COVERS</span>
                                      <div className="w-5 h-5 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                        {row.serial}
                                      </div>
                                    </div>
                                    <div className="h-px flex-1 bg-gray-100" />
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-3">
                                    {sortedMeds
                                      .filter(med => med.matchedRowNumbers.includes(row.serial))
                                      .map((med) => (
                                        <div key={med.id} className="min-w-[140px] flex flex-col bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group overflow-hidden">
                                          <span className="text-sm font-black text-gray-900 truncate group-hover:text-indigo-600" title={med.name}>
                                            {med.name}
                                          </span>
                                        </div>
                                      ))
                                    }
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          ) : selectedChapters.length === 0 ? (
            <div className="flex-1 flex flex-col p-8 bg-white rounded-3xl border border-gray-200 shadow-sm mx-auto w-full max-w-5xl overflow-visible">
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
              
              <div className="w-full space-y-8 overflow-visible">
                <div className="relative group z-50" ref={globalInputContainerRef}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-15 group-focus-within:opacity-30 transition duration-1000 group-focus-within:duration-200"></div>
                  <div className="relative flex items-center gap-4 bg-white p-5 rounded-2xl border-2 border-gray-100 focus-within:border-indigo-500 transition-all shadow-sm">
                    <Search className="w-6 h-6 text-gray-300 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Enter a symptom (e.g. Headache in evening, thirst for cold water)..." 
                      value={globalInput}
                      onChange={e => setGlobalInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && globalInput.trim()) {
                          setGlobalSymptoms(prev => [...prev, { text: globalInput.trim() }]);
                          setGlobalInput("");
                          setGlobalSearchChapters([]);
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-xl font-medium placeholder:text-gray-300"
                    />
                    {globalSearching && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />}
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
                          setGlobalSymptoms(prev => [...prev, { text: globalInput.trim() }]);
                          setGlobalInput("");
                          setGlobalSearchChapters([]);
                        }
                      }}
                      className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg font-bold text-sm"
                    >
                      ADD
                    </button>
                  </div>

                  {/* Floating rubric dropdown — fixed position avoids all overflow clipping */}
                  {dropdownPos && (globalSearchChapters.length > 0 || (globalInput.trim().length >= 2 && !globalSearching && globalSearchChapters.length === 0)) && (
                    <div
                      ref={dropdownRef}
                      style={{ 
                        position: 'fixed', 
                        top: dropdownPos.top, 
                        left: dropdownPos.left, 
                        width: dropdownPos.width, 
                        zIndex: 99999,
                        maxHeight: `calc(100vh - ${dropdownPos.top + 20}px)`
                      }}
                      className="rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden flex flex-col"
                    >
                      <div className="overflow-y-auto custom-scrollbar flex-1">
                        {globalSearchChapters.length > 0 ? (
                          <div className="p-2 space-y-2">
                            <p className="px-3 pt-2 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Select a specific rubric to add, or press ADD to add the symptom as keyword</p>
                            {globalSearchChapters.map((chapter) => {
                              const isExp = globalExpandedChapters.has(chapter.name);
                              const visible = isExp ? chapter.rubrics : chapter.rubrics.slice(0, GLOBAL_PREVIEW);
                              const hasMore = chapter.rubrics.length > GLOBAL_PREVIEW;
                              return (
                                <div key={chapter.name} className="rounded-xl border border-gray-100">
                                  <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                      <BookOpen className="w-3 h-3 text-indigo-400" />
                                      {chapter.name}
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">{chapter.rubrics.length}</span>
                                  </div>
                                  <div>
                                    {visible.map((rubric: any) => (
                                      <button
                                        key={rubric.id}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          const label = rubric.full_path || rubric.name;
                                          setGlobalSymptoms(prev => {
                                            if (prev.some(s => s.text === label)) return prev;
                                            return [...prev, { text: label, rubric: rubric }];
                                          });
                                          setGlobalInput("");
                                          setGlobalSearchChapters([]);
                                          setDropdownPos(null);
                                        }}
                                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 group"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700">{rubric.name}</p>
                                            {rubric.name_hindi && <p className="text-xs text-gray-500">{rubric.name_hindi}</p>}
                                            <p className="text-[10px] text-gray-400 truncate italic mt-0.5">{rubric.full_path || rubric.parent_name}</p>
                                          </div>
                                          <Plus className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 flex-shrink-0" />
                                        </div>
                                      </button>
                                    ))}
                                    {hasMore && (
                                      <button
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          setGlobalExpandedChapters(prev => {
                                            const next = new Set(prev);
                                            if (isExp) next.delete(chapter.name); else next.add(chapter.name);
                                            return next;
                                          });
                                        }}
                                        className="w-full px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1 border-t border-gray-100"
                                      >
                                        {isExp ? <>↑ Show less</> : <>↓ Show {chapter.rubrics.length - GLOBAL_PREVIEW} more</>}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 font-medium">No rubrics found. Press ADD to use as keyword.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">ADDED SYMPTOMS ({globalSymptoms.length})</h4>
                  <div className="flex flex-wrap gap-3">
                    {globalSymptoms.map((sym, idx) => (
                      <div key={idx} className="group flex items-center gap-3 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all animate-in slide-in-from-top-2">
                        <div className="w-6 h-6 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{sym.rubric ? <><span className="text-[10px] font-black text-indigo-400 uppercase mr-1">[Rubric]</span>{sym.text}</> : sym.text}</span>
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
