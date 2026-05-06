// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen, Search, Plus, X, Pill, Sparkles, ChevronRight,
  ChevronDown, Tag, Loader2, BarChart3, Trophy, AlertCircle,
  CheckCircle2, ArrowLeft, Zap, Filter, Star, Activity,
  Hash, Info, Table2, FlaskConical, Microscope, Mic, MicOff,
  PlusCircle, Layers
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

  // ── Emotion (maps to Emotion chapter which is an alias for Mind emotions) ──
  sadness:"Mind", grief:"Mind", weeping:"Mind", despair:"Mind", melancholy:"Mind",
  gloom:"Mind", hopeless:"Mind", dejected:"Mind", sorrow:"Mind", despondent:"Mind",

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

  // ── Nose ─────────────────────────────────────────────────────────────────
  nose:"Nose", nasal:"Nose", sneezing:"Nose", rhinitis:"Nose",
  coryza:"Nose", nostril:"Nose", discharge:"Nose", bleeding:"Nose",
  polyp:"Nose",
  "नाक":"Nose", "नाक से":"Nose", "छींक":"Nose", "जुकाम":"Nose",

  // ── Face ─────────────────────────────────────────────────────────────────
  face:"Face",
  "चेहरा":"Face", "चेहरे":"Face", "गाल":"Face",

  // ── Mouth ─────────────────────────────────────────────────────────────────
  mouth:"Mouth", tongue:"Mouth", lips:"Mouth", saliva:"Mouth", aphthae:"Mouth",
  "मुँह":"Mouth", "जीभ":"Mouth",

  // ── Teeth ─────────────────────────────────────────────────────────────────
  teeth:"Teeth", tooth:"Teeth", gum:"Teeth", dental:"Teeth", caries:"Teeth",
  "दाँत":"Teeth", "मसूड़":"Teeth",

  // ── Throat ────────────────────────────────────────────────────────────────
  throat:"Throat", tonsil:"Throat", swallow:"Throat", pharynx:"Throat", hoarse:"Throat",
  "गला":"Throat", "गले":"Throat", "टॉन्सिल":"Throat",

  // ── Stomach ───────────────────────────────────────────────────────────────
  stomach:"Stomach", nausea:"Stomach", vomit:"Stomach", gastric:"Stomach",
  appetite:"Stomach", hunger:"Stomach", eructation:"Stomach", heartburn:"Stomach",
  thirst:"Stomach", indigestion:"Stomach", pain:"Stomach",
  "भूख":"Stomach", "प्यास":"Stomach", "मतली":"Stomach", "उल्टी":"Stomach",
  "पेट":"Stomach",

  // ── Abdomen ───────────────────────────────────────────────────────────────
  abdomen:"Abdomen", abdominal:"Abdomen", belly:"Abdomen",
  distension:"Abdomen", flatulence:"Abdomen", bloat:"Abdomen",
  "पेड़ू":"Abdomen", "गैस":"Abdomen",

  // ── Rectum ────────────────────────────────────────────────────────────────
  stool:"Rectum", constipat:"Rectum", diarrhea:"Rectum", rectal:"Rectum",
  hemorrhoid:"Rectum", piles:"Rectum", dysentery:"Rectum",
  "कब्ज":"Rectum", "दस्त":"Rectum", "बवासीर":"Rectum", "मल":"Rectum",

  // ── Urinary ───────────────────────────────────────────────────────────────
  urine:"Urinary", urinary:"Urinary", bladder:"Urinary", dysuria:"Urinary",
  "पेशाब":"Urinary", "मूत्र":"Urinary",

  // ── Kidney ────────────────────────────────────────────────────────────────
  kidney:"Kidney",
  "गुर्दा":"Kidney", "गुर्दे":"Kidney",

  // ── Chest ─────────────────────────────────────────────────────────────────
  chest:"Chest", lung:"Chest", breast:"Chest",
  "छाती":"Chest", "फेफड़ा":"Chest",

  // ── Heart ─────────────────────────────────────────────────────────────────
  heart:"Heart", palpitat:"Heart", cardiac:"Heart",
  "हृदय":"Heart", "दिल":"Heart", "धड़कन":"Heart",

  // ── Respiratory ───────────────────────────────────────────────────────────
  breath:"Respiratory", breathe:"Respiratory", asthma:"Respiratory",
  wheez:"Respiratory", dyspnea:"Respiratory",
  "साँस":"Respiratory", "दमा":"Respiratory",

  // ── Cough ─────────────────────────────────────────────────────────────────
  cough:"Cough", "खाँसी":"Cough", "खांसी":"Cough",

  // ── Back ──────────────────────────────────────────────────────────────────
  back:"Back", spine:"Back", sciatica:"Back",
  "पीठ":"Back",

  // ── Lumbosacral ───────────────────────────────────────────────────────────
  lumbar:"Lumbosacral", sacrum:"Lumbosacral",
  "कमर":"Lumbosacral", "कमरदर्द":"Lumbosacral",

  // ── Cervical ──────────────────────────────────────────────────────────────
  cervical:"Cervical",
  "गर्दन":"Cervical",

  // ── Extremities ───────────────────────────────────────────────────────────
  leg:"Extremities", arm:"Extremities", joint:"Extremities", knee:"Extremities",
  ankle:"Extremities", hand:"Extremities", foot:"Extremities", feet:"Extremities",
  elbow:"Extremities", shoulder:"Extremities", wrist:"Extremities", hip:"Extremities",
  rheumatism:"Extremities", arthritis:"Extremities",
  "हाथ":"Extremities", "पैर":"Extremities", "जोड़":"Extremities", "जोड़ों":"Extremities",

  // ── Skin ──────────────────────────────────────────────────────────────────
  skin:"Skin", rash:"Skin", eruption:"Skin", itch:"Skin", eczema:"Skin",
  urticaria:"Skin", psoriasis:"Skin", acne:"Skin",
  "त्वचा":"Skin", "खुजली":"Skin", "दाद":"Skin", "दाने":"Skin",

  // ── Fever ─────────────────────────────────────────────────────────────────
  fever:"Fever", chill:"Fever", ague:"Fever",
  "बुखार":"Fever", "ताप":"Fever",

  // ── Sleep ─────────────────────────────────────────────────────────────────
  sleep:"Sleep", insomnia:"Sleep",
  "नींद":"Sleep", "अनिद्रा":"Sleep",

  // ── Nervous ───────────────────────────────────────────────────────────────
  nerve:"Nervous", neural:"Nervous", neuralgia:"Nervous",
  paralysis:"Nervous", convulsion:"Nervous", epilepsy:"Nervous",
  trembling:"Nervous", numbness:"Nervous", tingling:"Nervous",
  "नस":"Nervous", "लकवा":"Nervous", "मिर्गी":"Nervous", "कंपन":"Nervous",

  // ── Generalities ──────────────────────────────────────────────────────────
  weakness:"Generalities", fatigue:"Generalities",
  perspiration:"Generalities", sweat:"Generalities", debility:"Generalities",
  "कमजोरी":"Generalities", "थकान":"Generalities", "पसीना":"Generalities",
} as Record<string, string>;

// Exact phrase index to override single-word tokens
const PHRASE_INDEX: Record<string, string> = {
  "सिर में दर्द": "Head",
  "सिर दर्द":    "Head",
  "आँख में":     "Eyes",
  "कान में":     "Ears",
  "नाक से":      "Nose",
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
      .then(d => { if (d.success) setChapters(d.chapters || []); })
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
                body: JSON.stringify({ chapter_id: chapter.id, symptoms: chapterSymptoms[chapter.id], top_n: 8 }),
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
          const tokens = lowerSym.split(/[\s,।|.:;!?]+/).filter(t => t.length >= 3);
          
          // Score each token against the keyword index
          const scores: Record<string, number> = {};
          for (const token of tokens) {
            // Exact match — GENERALITIES gets lower base score
            if (KEYWORD_INDEX[token]) {
              const weight = (KEYWORD_INDEX[token] === "GENERALITIES") ? 5 : 10;
              scores[KEYWORD_INDEX[token]] = (scores[KEYWORD_INDEX[token]] || 0) + weight;
              continue;
            }
            // Prefix / substring match (handles plural, conjugations)
            for (const [kw, chName] of Object.entries(KEYWORD_INDEX)) {
              if (token.includes(kw) || kw.includes(token)) {
                // GENERALITIES gets a lower weight so specific chapters always beat it in ties
                const weight = (chName === "GENERALITIES") ? 3 : 6;
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
              body: JSON.stringify({ chapter_id: chapter.id, symptoms: syms, top_n: 8 }),
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
                  <thead className="sticky top-0 z-50 shadow-sm border-b border-indigo-200 bg-red-400">
                    <tr>
                      <th style={{width:'20%'}} className="p-4 font-black text-indigo-800 bg-indigo-50 border-r border-gray-200">Symptom</th>
                      <th style={{width:'55%'}} className="p-4 font-black text-indigo-800 bg-indigo-50 border-r border-gray-200">Matched Rubric</th>
                      <th style={{width:'15%'}} className="p-4 font-black text-indigo-800 bg-indigo-50 border-r border-gray-200">Modalities</th>
                      <th style={{width:'10%'}} className="p-4 font-black text-indigo-800 bg-indigo-50 text-right">Synonyms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 align-top bg-white">
                    {(() => {
                      // Collect all symptom rows across all results
                      const allSymptomRows: { chapter: Chapter, symptom: string, rubric: any }[] = [];
                      
                      (selectedChapters.length > 0 ? selectedChapters : identifiedChapters).forEach((chapter) => {
                        const result = analysisResults[chapter.id];
                        if (result && result.symptoms_breakdown) {
                          result.symptoms_breakdown.forEach(row => {
                            if (row.rubrics && row.rubrics.length > 0) {
                              // Only take the single best matched rubric for this symptom
                              allSymptomRows.push({ chapter, symptom: row.symptom, rubric: row.rubrics[0] });
                            }
                          });
                        }
                      });

                      if (allSymptomRows.length === 0) {
                        return (
                          <tr><td colSpan={4} className="p-8 text-center text-gray-500">No matched rubrics found for your symptoms.</td></tr>
                        );
                      }

                      return allSymptomRows.map((item, idx) => {
                        const chapter = item.chapter;
                        const rb = item.rubric;

                        const synonymPairs = Array.from(
                          new Map(
                            (rb.synonyms || []).map((s: any) => {
                              const eng = typeof s === 'string' ? s : (s.synonym || s.name || "");
                              const hi  = typeof s === 'object' ? (s.synonym_hindi || "") : "";
                              return [eng, { eng, hi }];
                            }).filter(([k]) => k)
                          ).values()
                        ).slice(0, 8);

                        const aggravationPairs = Array.from(new Map(
                          (rb.modalities?.aggravations || []).map((m: any) => [
                            m.name, { eng: m.name, hi: m.name_hindi || "" }
                          ])
                        ).values()).slice(0, 6);

                        const ameliorationPairs = Array.from(new Map(
                          (rb.modalities?.ameliorations || []).map((m: any) => [
                            m.name, { eng: m.name, hi: m.name_hindi || "" }
                          ])
                        ).values()).slice(0, 6);

                        return (
                          <tr key={`${chapter.id}-${idx}`} className="bg-white hover:bg-gray-50 transition-colors">
                            {/* Symptom */}
                            <td className="p-4 bg-white border-r border-gray-200">
                              <p className="font-bold text-indigo-900">{item.symptom}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">{chapter.name}</p>
                            </td>

                            {/* Matched Rubric */}
                            <td className="p-4 bg-white border-r border-gray-200">
                              <div className="flex flex-col gap-3">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm border-l-4 border-l-indigo-500">
                                  <p className="text-sm md:text-base font-bold text-gray-800 leading-snug break-words">{rb.full_path || rb.name}</p>
                                  {rb.name_hindi && <p className="text-xs text-orange-600 mt-1 break-words">{rb.name_hindi}</p>}
                                </div>
                              </div>
                            </td>

                            {/* Modalities */}
                            <td className="p-1 bg-white border-r border-gray-200">
                              <div className="flex flex-col gap-3">
                                {aggravationPairs.length > 0 && (
                                  <div>
                                    <p className="text-[9px] font-bold text-red-700 uppercase tracking-wider mb-1">⬆ Aggravates</p>
                                    <div className="flex flex-wrap gap-1">
                                      {aggravationPairs.map((m, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-red-100 text-red-900 rounded text-[10px] border border-red-200 inline-block break-words">
                                          {m.eng}{m.hi && <span className="text-red-600 ml-1">· {m.hi}</span>}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {ameliorationPairs.length > 0 && (
                                  <div>
                                    <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider mb-1">⬇ Ameliorates</p>
                                    <div className="flex flex-wrap gap-1">
                                      {ameliorationPairs.map((m, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded text-[10px] border border-emerald-200 inline-block break-words">
                                          {m.eng}{m.hi && <span className="text-emerald-700 ml-1">· {m.hi}</span>}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {aggravationPairs.length === 0 && ameliorationPairs.length === 0 && (
                                  <p className="text-xs text-gray-400 italic">None</p>
                                )}
                              </div>
                            </td>

                            {/* Synonyms */}
                            <td className="p-1 align-top text-right bg-white">
                              <div className="flex flex-wrap gap-1 justify-end">
                                {synonymPairs.length > 0 ? synonymPairs.map((s, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] border border-amber-200 inline-block break-words font-semibold">
                                    {s.eng}
                                    {s.hi && <span className="text-amber-700 ml-1 font-normal">· {s.hi}</span>}
                                  </span>
                                )) : (
                                  <p className="text-xs text-gray-400 italic">None</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>

                {/* Repertory Grid Chart */}
                {(() => {
                  const globalMedicineMap = new Map<number, { id: number, name: string, count: number, score: number }>();
                  let totalSymptomsMatched = 0;
                  const allSymptomRows: { chapter: Chapter, symptom: string, rubric: any }[] = [];

                  (selectedChapters.length > 0 ? selectedChapters : identifiedChapters).forEach((chapter) => {
                    const result = analysisResults[chapter.id];
                    if (result && result.symptoms_breakdown) {
                      result.symptoms_breakdown.forEach(row => {
                        if (row.rubrics && row.rubrics.length > 0) {
                          totalSymptomsMatched++;
                          const rb = row.rubrics[0];
                          allSymptomRows.push({ chapter, symptom: row.symptom, rubric: rb });
                          (rb.medicines || []).forEach((med: any) => {
                            if (globalMedicineMap.has(med.id)) {
                              const existing = globalMedicineMap.get(med.id)!;
                              existing.count += 1;
                              existing.score += med.grade;
                            } else {
                              globalMedicineMap.set(med.id, { id: med.id, name: med.name, count: 1, score: med.grade });
                            }
                          });
                        }
                      });
                    }
                  });

                  const sorted = Array.from(globalMedicineMap.values())
                    .sort((a, b) => b.count - a.count || b.score - a.score)
                    .slice(0, 15); // Top 15 medicines for the grid
                  
                  if (sorted.length === 0) return null;

                  return (
                    <div className="p-6 bg-gray-50/30 border-t border-gray-100 animate-in slide-in-from-bottom-4 duration-500 overflow-x-auto">
                      <div className="flex items-center justify-between mb-6 min-w-[800px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-gray-900">Repertory Chart</h3>
                            <p className="text-xs text-black font-medium">Matrix of top matched medicines vs symptoms</p>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-[800px] border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <table className="w-full text-left text-sm table-fixed border-collapse">
                          <thead className="bg-indigo-50 border-b border-indigo-100">
                            <tr>
                              <th className="p-3 font-black text-indigo-900 border-r border-indigo-100 w-[200px]">Symptom</th>
                              {sorted.map(med => (
                                <th key={med.id} className="p-3 text-center border-r border-indigo-100">
                                  <span className="block text-xs font-bold text-indigo-700 truncate" title={med.name}>{med.name}</span>
                                  <span className="text-[10px] text-gray-500 font-medium block mt-0.5">{med.count}/{totalSymptomsMatched}</span>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allSymptomRows.map((row, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-3 border-r border-gray-100 text-xs font-bold text-gray-800 leading-tight">
                                  {row.symptom}
                                </td>
                                {sorted.map(med => {
                                  const medInRubric = (row.rubric.medicines || []).find((m: any) => m.id === med.id);
                                  return (
                                    <td key={med.id} className="p-3 text-center border-r border-gray-100">
                                      {medInRubric ? (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${medInRubric.grade === 3 ? 'bg-red-100 text-red-700' : medInRubric.grade === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                          G{medInRubric.grade}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
