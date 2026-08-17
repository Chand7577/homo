// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  X,
  Trash2,
  Sparkles,
  TrendingUp,
  Award,
  AlertCircle,
  ChevronRight,
  Filter,
  BookOpen,
  Pill,
  Star,
  Info,
  BarChart3,
  CheckCircle,
  FileText,
  Save,
  Loader2,
  Activity,
  Download,
} from "lucide-react";

import { API_BASE } from "@/config";

interface Rubric {
  id: number;
  name: string;
  name_hindi?: string;
  description?: string;
  category?: string;
  full_path?: string;
  chapter_name?: string;
}

interface Chapter {
  name: string;
  rubrics: Rubric[];
}

interface SelectedRubric {
  rubric: Rubric;
  intensity: number;
  notes: string;
}

interface Medicine {
  id: number;
  name: string;
  score: number;
  rubric_count: number;
  coverage_percentage: number;
  details?: {
    rubric_intensities: Array<{
      rubric_name: string;
      intensity: number;
    }>;
  };
}

interface RepertorizationResult {
  id: number;
  method: string;
  total_rubrics: number;
  total_medicines_analyzed: number;
  top_medicines: Medicine[];
  created_at: string;
}

interface Case {
  id: number;
  case_number: string;
  title: string;
  patient_name: string;
}

const DoctorRepertorize = () => {
  // Search & Rubrics
  const [searchQuery, setSearchQuery] = useState("");
  const [searchChapters, setSearchChapters] = useState<Chapter[]>([]);
  const [selectedRubrics, setSelectedRubrics] = useState<SelectedRubric[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const RUBRICS_PREVIEW = 5; // show this many before "Show more"

  // Repertorization
  const [repertorizationMethod, setRepertorizationMethod] = useState<
    "simple_addition" | "weighted"
  >("weighted");
  const [repertorizationResult, setRepertorizationResult] =
    useState<RepertorizationResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Case Association
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loadingCases, setLoadingCases] = useState(false);

  // Save to case
  const [savingToCase, setSavingToCase] = useState(false);

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchChapters([]);
      setExpandedChapters(new Set());
      return;
    }

    const timer = setTimeout(() => {
      setExpandedChapters(new Set()); // reset expansions on new search
      searchRubrics();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load rubrics from URL query params
  const searchParams = useSearchParams();
  useEffect(() => {
    const rubricsParam = searchParams.get("rubrics");
    if (rubricsParam && selectedRubrics.length === 0) {
      const ids = rubricsParam.split(",");
      const fetchInitialRubrics = async () => {
        try {
          const loadedRubrics = [];
          for (const id of ids) {
            const resp = await fetch(`${API_BASE}/doctor/rubrics/${id}/`, {
              credentials: "include",
            });
            if (resp.ok) {
              const data = await resp.json();
              if (data.success && data.rubric) {
                loadedRubrics.push({
                  rubric: data.rubric,
                  intensity: 3,
                  notes: "Extracted from patient symptoms",
                });
              }
            }
          }
          if (loadedRubrics.length > 0) {
            setSelectedRubrics(loadedRubrics);
            // Trigger repertorization after a short delay to ensure state is updated
            // and the UI is ready
            setTimeout(() => {
                performRepertorization();
            }, 500);
          }
        } catch (e) {
          console.error("Error loading rubrics from URL:", e);
        }
      };
      fetchInitialRubrics();
    }
  }, [searchParams]);

  const searchRubrics = async () => {
    if (searchQuery.trim().length < 2) return;

    setSearching(true);
    try {
      const response = await fetch(
        `${API_BASE}/doctor/rubrics/search/?query=${encodeURIComponent(searchQuery)}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setSearchChapters(data.chapters || []);
      }
    } catch (err) {
      console.error("Error searching rubrics:", err);
    } finally {
      setSearching(false);
    }
  };

  const addRubric = (rubric: Rubric) => {
    // Check if already added
    const exists = selectedRubrics.find((sr) => sr.rubric.id === rubric.id);
    if (exists) {
      alert("This rubric is already added");
      return;
    }

    setSelectedRubrics([
      ...selectedRubrics,
      {
        rubric,
        intensity: 2, // Default intensity
        notes: "",
      },
    ]);
    setSearchQuery("");
    setSearchChapters([]);
  };

  const removeRubric = (rubricId: number) => {
    setSelectedRubrics(
      selectedRubrics.filter((sr) => sr.rubric.id !== rubricId),
    );
  };

  const updateIntensity = (rubricId: number, intensity: number) => {
    setSelectedRubrics(
      selectedRubrics.map((sr) =>
        sr.rubric.id === rubricId ? { ...sr, intensity } : sr,
      ),
    );
  };

  const updateNotes = (rubricId: number, notes: string) => {
    setSelectedRubrics(
      selectedRubrics.map((sr) =>
        sr.rubric.id === rubricId ? { ...sr, notes } : sr,
      ),
    );
  };

  const performRepertorization = async () => {
    if (selectedRubrics.length === 0) {
      alert("Please add at least one rubric");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE}/doctor/repertorize/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rubrics: selectedRubrics.map((sr) => ({
            rubric_id: sr.rubric.id,
            intensity: sr.intensity,
            notes: sr.notes,
          })),
          method: repertorizationMethod,
          case_id: selectedCase?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform repertorization");
      }

      const data = await response.json();
      setRepertorizationResult(data.repertorization);
    } catch (err: any) {
      console.error("Error performing repertorization:", err);
      alert(err.message || "Failed to perform repertorization");
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const response = await fetch(`${API_BASE}/doctor/cases/`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error("Error fetching cases:", err);
    } finally {
      setLoadingCases(false);
    }
  };

  const openCaseModal = () => {
    fetchCases();
    setShowCaseModal(true);
  };

  const selectCase = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowCaseModal(false);
  };

  const clearCase = () => {
    setSelectedCase(null);
  };

  const saveResultToCase = async () => {
    if (!selectedCase || !repertorizationResult) {
      alert("Please select a case and perform repertorization first");
      return;
    }

    setSavingToCase(true);
    try {
      const response = await fetch(
        `${API_BASE}/doctor/cases/${selectedCase.id}/save-repertorization/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            repertorization_id: repertorizationResult.id,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save to case");
      }

      alert("Repertorization saved to case successfully!");
    } catch (err: any) {
      console.error("Error saving to case:", err);
      alert(err.message || "Failed to save to case");
    } finally {
      setSavingToCase(false);
    }
  };

  const resetRepertorization = () => {
    setSelectedRubrics([]);
    setRepertorizationResult(null);
    setSelectedCase(null);
    setSearchChapters([]);
  };

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 1:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case 2:
        return "bg-orange-100 text-orange-700 border-orange-300";
      case 3:
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getIntensityLabel = (intensity: number) => {
    switch (intensity) {
      case 1:
        return "Mild";
      case 2:
        return "Moderate";
      case 3:
        return "Severe";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 to-gray-800 text-white sticky top-0 z-10">
        <div className="px-4 md:px-8 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                  Repertorization
                </h1>
                <p className="text-white text-opacity-80 mt-2">
                  Analyze symptoms and find the best homeopathic remedies
                </p>
              </div>
              <button
                onClick={resetRepertorization}
                className="px-4 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4 text-gray-700" />
                <span className="hidden sm:inline text-gray-700">Reset</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white text-gray-700 bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-gray-700 text-opacity-70 text-xs mb-1">
                  Selected Rubrics
                </p>
                <p className="text-2xl text-gray-700 font-bold">
                  {selectedRubrics.length}
                </p>
              </div>
              <div className="bg-white text-gray-700 bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-gray-700 text-opacity-70 text-xs mb-1">
                  Method
                </p>
                <p className="text-lg text-gray-700 font-bold capitalize">
                  {repertorizationMethod.replace("_", " ")}
                </p>
              </div>
              <div className="bg-white bg-opacity-10  backdrop-blur-sm rounded-xl p-4">
                <p className="text-gray-700 text-opacity-70 text-xs mb-1">
                  Medicines Found
                </p>
                <p className="text-2xl text-gray-700 font-bold">
                  {repertorizationResult?.top_medicines.length || 0}
                </p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-gray-700 text-opacity-70 text-xs mb-1">
                  Case
                </p>
                <p className="text-sm text-gray-700 font-bold truncate">
                  {selectedCase?.case_number || "None"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Rubric Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search Rubrics */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 overflow-visible">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Search & Add Rubrics
                </h2>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search rubrics by name or symptom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                  />
                  {searching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}

                  {/* Floating dropdown overlay */}
                  {(searchChapters.length > 0 || (searchQuery.length >= 2 && !searching && searchChapters.length === 0)) && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-[9999] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white">
                      <div 
                        className="max-h-[420px] overflow-y-auto overscroll-contain custom-scrollbar bg-white pr-1 rounded-2xl"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        {searchChapters.length > 0 ? (
                          <div className="p-2 space-y-2">
                            {searchChapters.map((chapter) => {
                              const isExpanded = expandedChapters.has(chapter.name);
                              const visibleRubrics = isExpanded ? chapter.rubrics : chapter.rubrics.slice(0, RUBRICS_PREVIEW);
                              const hasMore = chapter.rubrics.length > RUBRICS_PREVIEW;
                              return (
                                <div key={chapter.name} className="rounded-xl border border-gray-100 bg-white">
                                  <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                      <BookOpen className="w-3 h-3 text-gray-400" />
                                      {chapter.name}
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
                                      {chapter.rubrics.length}
                                    </span>
                                  </div>
                                  <div>
                                    {visibleRubrics.map((rubric) => (
                                      <button
                                        key={rubric.id}
                                        onMouseDown={(e) => { e.preventDefault(); addRubric(rubric); }}
                                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 group"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700">
                                              {rubric.name}
                                            </p>
                                            {rubric.name_hindi && (
                                              <p className="text-xs text-gray-500">{rubric.name_hindi}</p>
                                            )}
                                            <p className="text-[10px] text-gray-400 truncate italic mt-0.5">
                                              {rubric.full_path || rubric.parent_name}
                                            </p>
                                          </div>
                                          <Plus className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 flex-shrink-0" />
                                        </div>
                                      </button>
                                    ))}
                                    {hasMore && (
                                      <button
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          setExpandedChapters(prev => {
                                            const next = new Set(prev);
                                            if (isExpanded) next.delete(chapter.name);
                                            else next.add(chapter.name);
                                            return next;
                                          });
                                        }}
                                        className="w-full px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5 border-t border-gray-100"
                                      >
                                        {isExpanded ? (
                                          <> ↑ Show less </>
                                        ) : (
                                          <> ↓ Show {chapter.rubrics.length - RUBRICS_PREVIEW} more rubrics </>
                                        )}
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
                            <p className="text-sm text-gray-500 font-medium">No matches found in any chapter.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Rubrics */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Selected Rubrics ({selectedRubrics.length})
                  </h2>
                  {selectedRubrics.length > 0 && (
                    <button
                      onClick={() => setSelectedRubrics([])}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedRubrics.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      No Rubrics Selected
                    </h3>
                    <p className="text-gray-600">
                      Search and add rubrics to begin repertorization
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedRubrics.map((sr, index) => (
                      <div
                        key={sr.rubric.id}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-gray-500">
                                #{index + 1}
                              </span>
                              <h4 className="font-semibold text-gray-900">
                                {sr.rubric.name}
                              </h4>
                            </div>
                            {sr.rubric.description && (
                              <p className="text-xs text-gray-600 mb-2">
                                {sr.rubric.description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeRubric(sr.rubric.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>

                        {/* Intensity Selection */}
                        <div className="mb-3">
                          <label className="text-xs font-semibold text-gray-700 mb-2 block">
                            Intensity
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3].map((intensity) => (
                              <button
                                key={intensity}
                                onClick={() =>
                                  updateIntensity(sr.rubric.id, intensity)
                                }
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                                  sr.intensity === intensity
                                    ? getIntensityColor(intensity)
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                {getIntensityLabel(intensity)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-2 block">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={sr.notes}
                            onChange={(e) =>
                              updateNotes(sr.rubric.id, e.target.value)
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                            placeholder="Add any additional notes..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Settings & Actions */}
            <div className="space-y-6">
              {/* Case Association */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Associate with Case
                </h3>

                {selectedCase ? (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 font-semibold mb-1">
                          {selectedCase.case_number}
                        </p>
                        <p className="font-semibold text-gray-900 truncate">
                          {selectedCase.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedCase.patient_name}
                        </p>
                      </div>
                      <button
                        onClick={clearCase}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={openCaseModal}
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all"
                  >
                    <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600">
                      Select Case
                    </p>
                  </button>
                )}
              </div>

              {/* Method Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Repertorization Method
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => setRepertorizationMethod("simple_addition")}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      repertorizationMethod === "simple_addition"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-bold mb-1">Simple Addition</p>
                    <p
                      className={`text-xs ${repertorizationMethod === "simple_addition" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      Equal weight to all rubrics
                    </p>
                  </button>

                  <button
                    onClick={() => setRepertorizationMethod("weighted")}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      repertorizationMethod === "weighted"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-900 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-bold mb-1">Weighted Method</p>
                    <p
                      className={`text-xs ${repertorizationMethod === "weighted" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      Intensity-based scoring
                    </p>
                  </button>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={performRepertorization}
                disabled={selectedRubrics.length === 0 || analyzing}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-gray-900/20"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-6 h-6" />
                    Analyze Rubrics
                  </>
                )}
              </button>

              {/* Save to Case Button */}
              {repertorizationResult && selectedCase && (
                <button
                  onClick={saveResultToCase}
                  disabled={savingToCase}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingToCase ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save to Case
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          {repertorizationResult && (
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Award className="w-7 h-7 text-yellow-500" />
                    Top Remedies
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {repertorizationResult.total_rubrics} rubrics
                    analyzed
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      localStorage.setItem("comparative_rubrics", JSON.stringify(selectedRubrics));
                      localStorage.setItem("comparative_result", JSON.stringify(repertorizationResult));
                      window.location.href = "/comparative";
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
                  >
                    <Activity className="w-5 h-5" />
                    Comparative Analysis
                  </button>
                  <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {repertorizationResult.top_medicines.map((medicine, index) => (
                  <div
                    key={medicine.id}
                    className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-200 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Medicine Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {medicine.name}
                          </h3>
                          {index === 0 && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">
                              Best Match
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Score</p>
                            <p className="text-lg font-bold text-gray-900">
                              {medicine.score}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Rubrics Matched
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {medicine.rubric_count}
                            </p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-xs text-gray-500 mb-1">
                              Coverage
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {medicine.coverage_percentage}%
                            </p>
                          </div>
                        </div>

                        {/* Coverage Timeline */}
                        <div className="relative mt-2 mb-10">
                          <div className="w-full bg-gray-100 rounded-full h-2.5 border border-gray-200 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                                medicine.coverage_percentage >= 50
                                  ? "bg-blue-600"
                                  : "bg-blue-400"
                              }`}
                              style={{
                                width: `${medicine.coverage_percentage}%`,
                              }}
                            ></div>
                          </div>
                          {/* Timeline Markers */}
                          <div className="absolute top-4 left-0 w-full flex justify-between px-0.5">
                            {[0, 25, 50, 75, 100].map((mark) => (
                              <div key={mark} className="flex flex-col items-center">
                                <div className="h-1.5 w-0.5 bg-gray-300 mb-1"></div>
                                <span className="text-[10px] font-bold text-gray-400">{mark}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Rubric Details */}
                        {medicine.details?.rubric_intensities &&
                          medicine.details.rubric_intensities.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                Matched Rubrics:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {medicine.details.rubric_intensities
                                  .slice(0, 5)
                                  .map((ri, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-1 rounded-lg text-xs font-medium ${getIntensityColor(ri.intensity)}`}
                                    >
                                      {ri.rubric_name} (
                                      {getIntensityLabel(ri.intensity)})
                                    </span>
                                  ))}
                                {medicine.details.rubric_intensities.length >
                                  5 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                    +
                                    {medicine.details.rubric_intensities
                                      .length - 5}{" "}
                                    more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                {repertorizationResult.top_medicines.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      No Remedies Found
                    </h3>
                    <p className="text-gray-600">
                      No medicines match the selected rubrics. Try adjusting
                      your selection.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Case Selection Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Select Case
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Associate this repertorization with a case
                </p>
              </div>
              <button
                onClick={() => setShowCaseModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {loadingCases ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading cases...</p>
                </div>
              ) : cases.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Cases Found
                  </h3>
                  <p className="text-gray-600">
                    Create a case first to associate repertorization
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cases.map((caseItem) => (
                    <button
                      key={caseItem.id}
                      onClick={() => selectCase(caseItem)}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-semibold mb-1">
                            {caseItem.case_number}
                          </p>
                          <p className="font-bold text-gray-900 truncate">
                            {caseItem.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {caseItem.patient_name}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 flex-shrink-0 ml-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRepertorize;
