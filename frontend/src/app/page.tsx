// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
  User,
  ChevronRight,
  Sparkles,
  Activity,
  Pill,
  List,
  Bell,
  Plus,
  Filter,
  Download,
  AlertCircle,
  LogOut,
  Mic,
  MicOff,
  X,
} from "lucide-react";

import CreateCaseModal from "@/components/CreateCaseModal";
import CaseDetailModal from "@/components/CaseDetailModal";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

interface DoctorProfile {
  id: number;
  email: string;
  name: string;
  specialization: string;
  role: string;
}

interface Case {
  id: number;
  case_number: string;
  patient_name: string;
  chief_complaint: string;
  symptoms: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  cases_today: number;
  active_patients: number;
  total_repertorizations: number;
  total_cases: number;
  cases_today_change: string;
  active_patients_change: string;
}

const DoctorDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [error, setError] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);

  // In-memory search data
  const allRubrics = useRef<any[]>([]);
  const allMedicines = useRef<any[]>([]);
  const rubricIndex = useRef<Map<string, Set<number>>>(new Map());
  const medicineIndex = useRef<Map<string, Set<number>>>(new Map());
  const rubricMap = useRef<Map<number, any>>(new Map());
  const medicineMap = useRef<Map<number, any>>(new Map());

  // Search display state
  const [rubricResults, setRubricResults] = useState<any[]>([]);
  const [medicineResults, setMedicineResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDataLoading, setSearchDataLoading] = useState(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [dictationLang, setDictationLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const recognitionRef = useRef<any>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch dashboard data when authenticated
  useEffect(() => {
    if (doctor) {
      fetchDashboardStats();
      fetchRecentCases();
    }
  }, [doctor]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/doctor/check-auth/`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.authenticated && data.doctor) {
        setDoctor(data.doctor);
      } else {
        // Redundant redirect removed as layout handles authentication via modal
        console.warn("Doctor not authenticated, handled by layout modal");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setError("Failed to verify authentication");
    } finally {
      setLoading(false);
    }
  };

  // ── Search Indexer Logic ──────────────────────────────────────────────
  const tokenize = (text: string) => {
    return (text || "")
      .toLowerCase()
      .split(/[\s,.\-()/]+/)
      .filter((t) => t.length > 1);
  };

  const buildIndex = (items: any[], type: "rubric" | "medicine") => {
    const idx = new Map<string, Set<number>>();
    const map = type === "rubric" ? rubricMap.current : medicineMap.current;
    const add = (token: string, id: number) => {
      if (!idx.has(token)) idx.set(token, new Set());
      idx.get(token)!.add(id);
    };

    for (const item of items) {
      map.set(item.id, item);
      const fields = type === "rubric" 
        ? [item.name, item.name_hindi, item.description, item.parent_name]
        : [item.name, item.latin_name, item.common_name, item.name_hindi, item.family];
      
      for (const f of fields) {
        if (f) {
          for (const tok of tokenize(f)) add(tok, item.id);
        }
      }
    }
    return idx;
  };

  const searchIndex = (query: string, index: Map<string, Set<number>>, map: Map<number, any>) => {
    const tokens = tokenize(query);
    if (tokens.length === 0) return [];

    // Map of itemId -> matchCount
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

    // Convert to array and sort by score (desc), then by name
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1]) // Higher score first
      .map(([id]) => map.get(id))
      .filter(Boolean);
  };

  const fetchSearchData = async () => {
    try {
      setSearchDataLoading(true);
      // Fetch rubrics
      const rRes = await fetch(`${API_BASE}/doctor/rubrics/?limit=99999`, { credentials: "include" });
      if (rRes.ok) {
        const rData = await rRes.json();
        allRubrics.current = rData.rubrics || [];
        rubricIndex.current = buildIndex(allRubrics.current, "rubric");
      }

      // Fetch medicines
      const mRes = await fetch(`${API_BASE}/doctor/medicines/all/?limit=99999`, { credentials: "include" });
      if (mRes.ok) {
        const mData = await mRes.json();
        allMedicines.current = mData.medicines || [];
        medicineIndex.current = buildIndex(allMedicines.current, "medicine");
      }
    } catch (err) {
      console.error("Failed to pre-fetch search data:", err);
    } finally {
      setSearchDataLoading(false);
    }
  };

  useEffect(() => {
    if (doctor) {
      fetchSearchData();
    }
  }, [doctor]);

  // Speech Recognition initialization
  useEffect(() => {
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

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = dictationLang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const r = searchIndex(searchQuery, rubricIndex.current, rubricMap.current);
      const m = searchIndex(searchQuery, medicineIndex.current, medicineMap.current);
      setRubricResults(r.slice(0, 10));
      setMedicineResults(m.slice(0, 10));
    } else {
      setIsSearching(false);
      setRubricResults([]);
      setMedicineResults([]);
    }
  }, [searchQuery]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/doctor/stats/dashboard/`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchRecentCases = async () => {
    try {
      const response = await fetch(`${API_BASE}/doctor/cases/?limit=4`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setRecentCases(data.cases || []);
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/doctor/logout/`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Modal handlers
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const openCaseDetail = (caseId: number) => {
    setSelectedCaseId(caseId);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setSelectedCaseId(null);
  };

  const handleCaseCreated = () => {
    // Refresh dashboard data
    fetchDashboardStats();
    fetchRecentCases();
  };

  const handleEditFromDetail = () => {
    // Close detail modal and navigate to edit
    setShowDetailModal(false);
    // You can add edit modal here or navigate to edit page
    // For now, we'll just close the detail modal
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {error || "Please sign in to continue"}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      label: "Cases Today",
      value: stats?.cases_today?.toString() || "0",
      change: stats?.cases_today_change || "+0",
      icon: FileText,
      color: "bg-gray-900",
    },
    {
      label: "Active Patients",
      value: stats?.active_patients?.toString() || "0",
      change: stats?.active_patients_change || "+0",
      icon: User,
      color: "bg-[#3F856C]",
    },
    {
      label: "Repertorizations",
      value: stats?.total_repertorizations?.toString() || "0",
      change: "--",
      icon: TrendingUp,
      color: "bg-gray-700",
    },
    {
      label: "Total Cases",
      value: stats?.total_cases?.toString() || "0",
      change: "--",
      icon: BookOpen,
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 md:px-8 py-3 md:py-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  Good{" "}
                  {new Date().getHours() < 12
                    ? "Morning"
                    : new Date().getHours() < 18
                      ? "Afternoon"
                      : "Evening"}
                  , Dr. {doctor.name.split(" ")[0]}
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1 truncate">
                  Here's your practice overview for today
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-4 ml-2">
                <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#3F856C] rounded-full"></span>
                </button>
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {doctor.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doctor.specialization}
                    </p>
                  </div>
                  <div className="relative group">
                    <div className="w-11 h-11 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg cursor-pointer">
                      {getInitials(doctor.name)}
                    </div>
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 hidden group-hover:block min-w-[160px]">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
                <div className="md:hidden relative group">
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-sm cursor-pointer">
                    {getInitials(doctor.name)}
                  </div>
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 hidden group-hover:block min-w-[140px]">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-3 md:mt-6 relative group">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
              <input
                type="text"
                placeholder="Search rubrics, medicines, symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-24 py-2.5 md:py-3.5 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all shadow-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <button
                  onClick={() => setDictationLang(p => p === "en-IN" ? "hi-IN" : "en-IN")}
                  className="text-[10px] font-black text-gray-500 hover:text-gray-900 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-all"
                  title="Toggle voice search language (English/Hindi)"
                >
                  {dictationLang === "en-IN" ? "EN" : "HI"}
                </button>
                <div className="relative flex items-center justify-center">
                  {isListening && (
                    <div className="absolute w-8 h-8 rounded-full bg-red-400 animate-ping pointer-events-none" />
                  )}
                  <button
                    onClick={toggleListening}
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all z-10 ${
                      isListening
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    title="Voice search"
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Instant Search Results Dropdown */}
              {isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 md:p-4">
                    {searchDataLoading ? (
                      <div className="py-12 text-center">
                        <Loader2 className="w-10 h-10 text-gray-900 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Indexing repertory data...</p>
                        <p className="text-xs text-gray-400 mt-1">Almost ready</p>
                      </div>
                    ) : rubricResults.length === 0 && medicineResults.length === 0 ? (
                      <div className="py-8 text-center">
                        <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No results found for "{searchQuery}"</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Rubric Results */}
                        <div>
                          <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-2">
                            <BookOpen className="w-3 h-3" />
                            Rubrics ({rubricResults.length})
                          </div>
                          <div className="space-y-1">
                            {rubricResults.map((rubric) => (
                              <button
                                key={`rubric-${rubric.id}`}
                                onClick={() => {
                                  // Navigate to rubrics with search? 
                                  // For now just console log
                                  console.log("Selected rubric:", rubric);
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                              >
                                <p className="text-sm font-bold text-gray-900 group-hover:text-black">{rubric.name}</p>
                                {rubric.name_hindi && <p className="text-xs text-gray-500 font-medium">{rubric.name_hindi}</p>}
                                <p className="text-[10px] text-gray-400 mt-1 italic">{rubric.parent_name || "Chapter Level"}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Medicine Results */}
                        <div>
                          <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-2">
                            <Pill className="w-3 h-3" />
                            Medicines ({medicineResults.length})
                          </div>
                          <div className="space-y-1">
                            {medicineResults.map((med) => (
                              <button
                                key={`med-${med.id}`}
                                onClick={() => {
                                  // Navigate to medicines?
                                  console.log("Selected medicine:", med);
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-bold text-gray-900 group-hover:text-black">{med.name}</p>
                                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{med.family || "N/A"}</span>
                                </div>
                                <p className="text-xs text-gray-600 italic">{med.latin_name}</p>
                                {med.name_hindi && <p className="text-[10px] text-gray-500 mt-0.5">{med.name_hindi}</p>}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 italic">
                      <p>Showing top 10 results each</p>
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="text-gray-900 font-bold hover:underline not-italic"
                      >
                        Clear Search
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-3 md:p-8 space-y-4 md:space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
            {quickStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 border border-gray-200 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-2 md:mb-4">
                    <div
                      className={`${stat.color} p-2 md:p-3 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </div>
                    {stat.change !== "--" && (
                      <span className="text-xs font-semibold text-[#3F856C] bg-green-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Recent Cases */}
            <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-3 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-gray-900">
                    Recent Cases
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">
                    Your latest consultations
                  </p>
                </div>
                <div className="flex gap-1 md:gap-2 ml-2">
                  <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={openCreateModal}
                    className="px-2 md:px-4 py-1.5 md:py-2 bg-gray-900 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-black transition-colors flex items-center gap-1 md:gap-2"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">New</span>
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {recentCases.length > 0 ? (
                  recentCases.map((case_) => (
                    <div
                      key={case_.id}
                      className="p-3 md:p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => openCaseDetail(case_.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                                {case_.patient_name || case_.case_number}
                              </h4>
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                                  case_.status === "active"
                                    ? "bg-green-50 text-[#3F856C]"
                                    : case_.status === "completed"
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-blue-50 text-blue-600"
                                }`}
                              >
                                {case_.status}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 truncate">
                              {case_.chief_complaint || case_.symptoms}
                            </p>
                            <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                              <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(case_.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      No cases yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start by creating your first case
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Create Case
                    </button>
                  </div>
                )}
              </div>

              {recentCases.length > 0 && (
                <div className="p-2 md:p-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => (window.location.href = "/cases")}
                    className="w-full py-2 md:py-2.5 text-xs md:text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    View All Cases →
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4 md:space-y-6">
              {/* Rubric Repertorization Card — NEW */}
              <div
                className="rounded-xl md:rounded-2xl p-4 md:p-6 text-white relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f2b3d 100%)",
                  border: "1px solid rgba(56,189,248,0.25)",
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, #38bdf8, transparent)", transform: "translate(20%, -20%)" }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-sky-400 text-[10px] font-bold uppercase tracking-widest">New Feature</span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-1.5">
                    Rubric Repertorization
                  </h3>
                  <p className="text-xs text-blue-200/60 mb-4">
                    Select a chapter → describe symptoms → get matched rubrics and a ranked medicine chart
                  </p>
                  <button
                    onClick={() => (window.location.href = "/rubrics")}
                    className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={{ background: "linear-gradient(90deg, #0ea5e9, #6366f1)" }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Open Repertorizer
                  </button>
                </div>
              </div>

              {/* Quick Repertorize Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 mb-3 md:mb-4 text-[#3F856C]" />
                <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2">
                  Quick Repertorize
                </h3>
                <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">
                  Start analyzing symptoms instantly
                </p>
                <button
                  onClick={() => (window.location.href = "/repertorize")}
                  className="w-full py-2.5 md:py-3 bg-white text-gray-900 rounded-lg md:rounded-xl text-sm md:text-base font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  Start Now
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                    {getInitials(doctor.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-900">
                      {doctor.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Role</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {doctor.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => (window.location.href = "/doctorprofile")}
                  className="w-full mt-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateCaseModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSuccess={handleCaseCreated}
        apiBase={API_BASE}
      />

      <CaseDetailModal
        isOpen={showDetailModal}
        onClose={handleModalClose}
        onEdit={handleEditFromDetail}
        caseId={selectedCaseId}
        apiBase={API_BASE}
      />
    </div>
  );
};

export default DoctorDashboard;
