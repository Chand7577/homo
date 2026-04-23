// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  BookOpen,
  Pill,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Download,
  Upload,
  Layers,
  Globe,
  Tag,
  Mic,
  MicOff,
} from "lucide-react";

import RubricModal from "@/components/RubricModal";
import MedicineModal from "@/components/MedicineModal";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";
const PAGE_SIZE = 50;

// ── Search Helper (In-Memory Inverted Index) ──────────────────────────
function tokenize(text: string) {
  return (text || "")
    .toLowerCase()
    .split(/[\s,.\-()/]+/)
    .filter((t) => t.length > 1);
}

function buildRubricIndex(items: any[]): Map<string, Set<number>> {
  const idx = new Map<string, Set<number>>();
  const add = (token: string, id: number) => {
    if (!idx.has(token)) idx.set(token, new Set());
    idx.get(token)!.add(id);
  };
  for (const r of items) {
    const fields = [
      r.name, r.name_hindi, r.sub_rubric, r.sub_rubric_hindi,
      r.category, r.sheet_name, r.description, r.description_hindi,
      r.parent_name,
      ...(r.synonyms || []),
    ];
    for (const f of fields) {
      if (f) for (const tok of tokenize(f)) add(tok, r.id);
    }
  }
  return idx;
}

function buildMedicineIndex(items: any[]): Map<string, Set<number>> {
  const idx = new Map<string, Set<number>>();
  const add = (token: string, id: number) => {
    if (!idx.has(token)) idx.set(token, new Set());
    idx.get(token)!.add(id);
  };
  for (const m of items) {
    const fields = [
      m.name, m.latin_name, m.common_name, m.indications,
      m.contraindications, m.source, m.description,
      ...(m.potencies || []),
    ];
    for (const f of fields) {
      if (f) for (const tok of tokenize(f)) add(tok, m.id);
    }
  }
  return idx;
}

function searchIndex(query: string, index: Map<string, Set<number>>, map: Map<number, any>) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scores = new Map<number, number>();
  
  for (const tok of tokens) {
    const matchedIds = new Set<number>();
    for (const [key, ids] of index.entries()) {
      if (key.includes(tok)) {
        ids.forEach((id) => matchedIds.add(id));
      }
    }
    
    matchedIds.forEach((id) => {
      scores.set(id, (scores.get(id) || 0) + 1);
    });
  }

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => map.get(id))
    .filter(Boolean);
}

const RepertoryManagement = () => {
  const [activeTab, setActiveTab] = useState<"rubrics" | "medicines">("rubrics");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Master data
  const allRubrics    = useRef<any[]>([]);
  const allMedicines  = useRef<any[]>([]);
  const rubricIndex   = useRef<Map<string, Set<number>>>(new Map());
  const medicineIndex = useRef<Map<string, Set<number>>>(new Map());
  const rubricMap     = useRef<Map<number, any>>(new Map());
  const medicineMap   = useRef<Map<number, any>>(new Map());

  // Display state
  const [filteredRubrics, setFilteredRubrics] = useState<any[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination
  const [rubricsPage, setRubricsPage]       = useState(1);
  const [medicinesPage, setMedicinesPage]   = useState(1);
  const [rubricsTotal, setRubricsTotal]     = useState(0);
  const [medicinesTotal, setMedicinesTotal] = useState(0);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [dictationLang, setDictationLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const recognitionRef = useRef<any>(null);

  // ── Apply client-side filter + paginate ───────────────────────────────
  const applyRubricFilter = useCallback(
    (query: string, category: string, page: number, all: any[]) => {
      let results = query.trim()
        ? searchIndex(query, rubricIndex.current, rubricMap.current)
        : all;
      if (category)
        results = results.filter((r) => (r.sheet_name || r.category) === category);
      
      setRubricsTotal(results.length);
      const start = (page - 1) * PAGE_SIZE;
      setFilteredRubrics(results.slice(start, start + PAGE_SIZE));
    },
    []
  );

  const applyMedicineFilter = useCallback(
    (query: string, page: number, all: any[]) => {
      const results = query.trim()
        ? searchIndex(query, medicineIndex.current, medicineMap.current)
        : all;
      
      setMedicinesTotal(results.length);
      const start = (page - 1) * PAGE_SIZE;
      setFilteredMedicines(results.slice(start, start + PAGE_SIZE));
    },
    []
  );

  // ── Data Fetching ────────────────────────────────────────────────────
  const fetchRubrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/doctor/rubrics/?limit=99999`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch rubrics");
      const data = await response.json();
      allRubrics.current = data.rubrics || [];
      rubricIndex.current = buildRubricIndex(allRubrics.current);
      rubricMap.current = new Map(allRubrics.current.map(r => [r.id, r]));
      applyRubricFilter(searchQuery, selectedCategory, 1, allRubrics.current);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await fetch(`${API_BASE}/doctor/medicines/all/?limit=99999`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch medicines");
      const data = await response.json();
      allMedicines.current = data.medicines || [];
      medicineIndex.current = buildMedicineIndex(allMedicines.current);
      medicineMap.current = new Map(allMedicines.current.map(m => [m.id, m]));
      applyMedicineFilter(searchQuery, 1, allMedicines.current);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRubrics(), fetchMedicines()]);
      setLoading(false);
    };
    init();

    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === "rubrics") {
      setRubricsPage(1);
      applyRubricFilter(searchQuery, selectedCategory, 1, allRubrics.current);
    } else {
      setMedicinesPage(1);
      applyMedicineFilter(searchQuery, 1, allMedicines.current);
    }
  }, [searchQuery, selectedCategory, activeTab]);

  useEffect(() => {
    if (activeTab === "rubrics") {
      applyRubricFilter(searchQuery, selectedCategory, rubricsPage, allRubrics.current);
    }
  }, [rubricsPage]);

  useEffect(() => {
    if (activeTab === "medicines") {
      applyMedicineFilter(searchQuery, medicinesPage, allMedicines.current);
    }
  }, [medicinesPage]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else {
      recognitionRef.current.lang = dictationLang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const categories = Array.from(
    new Set(allRubrics.current.map((r) => r.sheet_name || r.category).filter(Boolean))
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Repertory Database</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Instant search through {rubricsTotal} rubrics and {medicinesTotal} medicines
              </p>
            </div>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 max-w-md">
            <button
              onClick={() => setActiveTab("rubrics")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "rubrics" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Rubrics
            </button>
            <button
              onClick={() => setActiveTab("medicines")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "medicines" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Pill className="w-4 h-4" />
              Medicines
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 text-base bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setDictationLang(p => p === "en-IN" ? "hi-IN" : "en-IN")}
                className="text-[10px] font-black text-gray-500 hover:text-gray-900 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-all"
              >
                {dictationLang === "en-IN" ? "EN" : "HI"}
              </button>
              <div className="relative flex items-center justify-center">
                {isListening && <div className="absolute w-8 h-8 rounded-full bg-red-400 animate-ping pointer-events-none" />}
                <button
                  onClick={toggleListening}
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all z-10 ${
                    isListening ? "bg-red-500 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {activeTab === "rubrics" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rubric</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRubrics.map((rubric) => (
                    <tr key={rubric.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{rubric.name}</p>
                        {rubric.name_hindi && <p className="text-xs text-gray-500 font-medium">{rubric.name_hindi}</p>}
                        <p className="text-[10px] text-gray-400 mt-1 italic">{rubric.parent_name || "Top Level"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-tight">
                          {rubric.sheet_name || rubric.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs font-bold text-gray-900">{rubric.medicines} Meds</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Latin Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Family</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMedicines.map((med) => (
                    <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{med.name}</p>
                        {med.name_hindi && <p className="text-xs text-gray-500 font-medium">{med.name_hindi}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 italic">{med.latin_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{med.family || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Showing {(activeTab === "rubrics" ? rubricsPage - 1 : medicinesPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(
                (activeTab === "rubrics" ? rubricsPage : medicinesPage) * PAGE_SIZE,
                activeTab === "rubrics" ? rubricsTotal : medicinesTotal
              )}{" "}
              of {activeTab === "rubrics" ? rubricsTotal : medicinesTotal}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => (activeTab === "rubrics" ? setRubricsPage((p) => Math.max(1, p - 1)) : setMedicinesPage((p) => Math.max(1, p - 1)))}
                disabled={(activeTab === "rubrics" ? rubricsPage : medicinesPage) === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => (activeTab === "rubrics" ? setRubricsPage((p) => p + 1) : setMedicinesPage((p) => p + 1))}
                disabled={(activeTab === "rubrics" ? rubricsPage * PAGE_SIZE >= rubricsTotal : medicinesPage * PAGE_SIZE >= medicinesTotal)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RepertoryManagement;
