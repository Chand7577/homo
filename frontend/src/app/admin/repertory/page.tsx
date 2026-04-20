// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Pill,
  Filter,
  Download,
  Upload,
  X,
  ChevronRight,
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Layers,
  Globe,
  Tag,
} from "lucide-react";

import RubricModal from "@/components/RubricModal";
import MedicineModal from "@/components/MedicineModal";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

interface Rubric {
  id: number;
  name: string;
  name_hindi?: string;
  sub_rubric?: string;
  sub_rubric_hindi?: string;
  category: string;
  sheet_name?: string;
  description?: string;
  description_hindi?: string;
  language: string;
  parent_id: number | null;
  parent_name: string | null;
  sub_rubrics: number;
  medicines: number;
  synonyms: string[];
  synonyms_detailed?: {
    english: string[];
    hindi: string[];
  };
  cross_references?: {
    english: string[];
    hindi: string[];
  };
  modalities?: string[];
  modalities_detailed?: {
    aggravations: Array<{
      text: string;
      english: string;
      hindi: string;
    }>;
    ameliorations: Array<{
      text: string;
      english: string;
      hindi: string;
    }>;
  };
  created_at: string;
}

interface Medicine {
  id: number;
  name: string;
  latin_name: string;
  common_name: string;
  potencies: string[];
  indications: string;
  contraindications: string;
  source: string;
  description: string;
  average_grade: number;
  rubric_count: number;
  created_at: string;
}

const RepertoryManagement = () => {
  const [activeTab, setActiveTab] = useState<"rubrics" | "medicines">(
    "rubrics",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rubrics state
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [filteredRubrics, setFilteredRubrics] = useState<Rubric[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Medicines state
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);

  // Modal states
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination state
  const [rubricsPage, setRubricsPage] = useState(1);
  const [rubricsTotal, setRubricsTotal] = useState(0);
  const [rubricsLimit] = useState(50);
  const [hasMoreRubrics, setHasMoreRubrics] = useState(false);

  const [medicinesPage, setMedicinesPage] = useState(1);
  const [medicinesTotal, setMedicinesTotal] = useState(0);
  const [medicinesLimit] = useState(50);
  const [hasMoreMedicines, setHasMoreMedicines] = useState(false);

  // Fetch rubrics when page or search changes
  useEffect(() => {
    fetchRubrics();
  }, [rubricsPage, selectedCategory]);

  // Fetch medicines when page or search changes
  useEffect(() => {
    fetchMedicines();
  }, [medicinesPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setRubricsPage(1);
      setMedicinesPage(1);
      fetchRubrics();
      fetchMedicines();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRubrics = async () => {
    setLoading(true);
    setError("");

    try {
      let url = `${API_BASE}/admin/rubrics/?page=${rubricsPage}&limit=${rubricsLimit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 403 || response.status === 401) {
        setError("Authentication required. Please log in as admin.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch rubrics");
      }

      setRubrics(data.rubrics || []);
      setFilteredRubrics(data.rubrics || []);
      setRubricsTotal(data.total || 0);
      setHasMoreRubrics(data.has_more || false);

      console.log(`✓ Loaded page ${rubricsPage} of rubrics`);
    } catch (err: any) {
      setError(err.message || "Failed to load rubrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    setLoading(true);
    setError("");

    try {
      let url = `${API_BASE}/admin/medicines/?page=${medicinesPage}&limit=${medicinesLimit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 403 || response.status === 401) {
        setError("Authentication required. Please log in as admin.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch medicines");
      }

      setMedicines(data.medicines || []);
      setFilteredMedicines(data.medicines || []);
      setMedicinesTotal(data.total || 0);
      setHasMoreMedicines(data.has_more || false);

    } catch (err: any) {
      setError(err.message || "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRubric = async () => {
    if (!deletingItem) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/admin/rubrics/${deletingItem.id}/delete/`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete rubric");
      }

      await fetchRubrics();
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete rubric");
      console.error("Error deleting rubric:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteMedicine = async () => {
    if (!deletingItem) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/admin/medicines/${deletingItem.id}/delete/`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete medicine");
      }

      await fetchMedicines();
      setShowDeleteModal(false);
      setDeletingItem(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete medicine");
      console.error("Error deleting medicine:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === "rubrics") {
      setShowRubricModal(true);
    } else {
      setShowMedicineModal(true);
    }
  };

  const handleDeleteClick = (item: any) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    if (activeTab === "rubrics") {
      setShowRubricModal(true);
    } else {
      setShowMedicineModal(true);
    }
  };

  const handleModalClose = () => {
    setShowRubricModal(false);
    setShowMedicineModal(false);
    setEditingItem(null);
  };

  const handleSuccess = () => {
    if (activeTab === "rubrics") {
      fetchRubrics();
    } else {
      fetchMedicines();
    }
  };

  // Get unique categories from rubrics (use sheet_name if available, else category)
  const categories = Array.from(
    new Set(rubrics.map((r) => r.sheet_name || r.category).filter(Boolean)),
  ).sort();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Repertory Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {loading
                  ? "Loading..."
                  : activeTab === "rubrics"
                    ? `${rubricsTotal} total rubrics`
                    : `${medicinesTotal} total medicines`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Excel
              </button>
              <button className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("rubrics")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "rubrics"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Rubrics
            </button>
            <button
              onClick={() => setActiveTab("medicines")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "medicines"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Pill className="w-4 h-4" />
              Medicines
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Search and Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "rubrics"
                      ? "Search rubrics by name, sub-rubric, synonym, Hindi, modality..."
                      : "Search medicines..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              <button
                onClick={handleSuccess}
                className="px-4 py-2.5 bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleAddNew}
                className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add {activeTab === "rubrics" ? "Rubric" : "Medicine"}
              </button>
            </div>

            {/* Category Filter for Rubrics */}
            {activeTab === "rubrics" && categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Category:
                </span>
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === ""
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Error loading data</p>
                <p className="text-xs mt-1">{error}</p>
                {error.includes("Authentication") && (
                  <button
                    onClick={() => (window.location.href = "/admin/login")}
                    className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
                  >
                    Go to Login
                  </button>
                )}
                {error.includes("Network") && (
                  <button
                    onClick={handleSuccess}
                    className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {activeTab}...</p>
          </div>
        ) : (
          <>
            {/* Rubrics List - ENHANCED WITH NEW FIELDS */}
            {activeTab === "rubrics" && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    All Rubrics
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {filteredRubrics.length} rubric
                    {filteredRubrics.length !== 1 ? "s" : ""}
                    {selectedCategory && ` in ${selectedCategory}`}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
                </div>

                {filteredRubrics.length === 0 ? (
                  <div className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {searchQuery || selectedCategory
                        ? "No rubrics found"
                        : "No rubrics yet"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || selectedCategory
                        ? "Try adjusting your filters"
                        : "Get started by adding your first rubric"}
                    </p>
                    {!searchQuery && !selectedCategory && (
                      <button
                        onClick={handleAddNew}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Add New Rubric
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredRubrics.map((rubric) => (
                      <div
                        key={rubric.id}
                        className="p-4 sm:p-5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 mb-2 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm sm:text-base text-gray-900">
                                  {rubric.name}
                                  {rubric.sub_rubric && (
                                    <span className="text-purple-600">
                                      {" "}
                                      › {rubric.sub_rubric}
                                    </span>
                                  )}
                                </h4>
                                {(rubric.name_hindi ||
                                  rubric.sub_rubric_hindi) && (
                                  <p className="text-xs sm:text-sm text-orange-600 mt-1">
                                    {rubric.name_hindi}
                                    {rubric.sub_rubric_hindi &&
                                      ` › ${rubric.sub_rubric_hindi}`}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                  {rubric.sheet_name || rubric.category}
                                </span>
                                {rubric.language && (
                                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                    {rubric.language}
                                  </span>
                                )}
                                {rubric.parent_name && (
                                  <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Layers className="w-3 h-3" />
                                    Sub of: {rubric.parent_name}
                                  </span>
                                )}
                              </div>
                            </div>

                            {rubric.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                {rubric.description}
                              </p>
                            )}
                            {rubric.description_hindi && (
                              <p className="text-xs sm:text-sm text-orange-600 mb-2">
                                {rubric.description_hindi}
                              </p>
                            )}

                            {/* Synonyms & Cross-refs */}
                            <div className="space-y-1 mb-2">
                              {rubric.synonyms_detailed?.english &&
                                rubric.synonyms_detailed.english.length > 0 && (
                                  <div className="flex flex-wrap gap-1 items-center">
                                    <span className="text-xs text-gray-500">
                                      Synonyms:
                                    </span>
                                    {rubric.synonyms_detailed.english.map(
                                      (syn, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded"
                                        >
                                          {syn}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}
                              {rubric.cross_references?.english &&
                                rubric.cross_references.english.length > 0 && (
                                  <div className="flex flex-wrap gap-1 items-center">
                                    <span className="text-xs text-gray-500">
                                      Cross-refs:
                                    </span>
                                    {rubric.cross_references.english.map(
                                      (ref, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded"
                                        >
                                          {ref}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}
                              {rubric.modalities &&
                                rubric.modalities.length > 0 && (
                                  <div className="flex flex-wrap gap-1 items-center">
                                    <Tag className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-gray-500">
                                      {rubric.modalities.length} modalities
                                    </span>
                                  </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                <span>{rubric.sub_rubrics} Sub-rubrics</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Pill className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                <span>{rubric.medicines} Medicines</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(rubric)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(rubric)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    <div className="p-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                      <div className="text-xs text-gray-500 font-medium">
                        Showing {((rubricsPage - 1) * rubricsLimit) + 1} to {Math.min(rubricsPage * rubricsLimit, rubricsTotal)} of {rubricsTotal} rubrics
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRubricsPage(prev => Math.max(1, prev - 1))}
                          disabled={rubricsPage === 1}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setRubricsPage(prev => prev + 1)}
                          disabled={!hasMoreRubrics}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Medicines List */}
            {activeTab === "medicines" && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    All Medicines
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {filteredMedicines.length} medicine
                    {filteredMedicines.length !== 1 ? "s" : ""}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
                </div>

                {filteredMedicines.length === 0 ? (
                  <div className="p-12 text-center">
                    <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {searchQuery ? "No medicines found" : "No medicines yet"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery
                        ? "Try adjusting your search query"
                        : "Get started by adding your first medicine"}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={handleAddNew}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Add New Medicine
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMedicines.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="p-4 sm:p-5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-bold text-sm sm:text-base text-gray-900">
                                {medicine.name}
                              </h4>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < Math.round(medicine.average_grade)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                ({medicine.average_grade.toFixed(1)})
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 italic mb-2">
                              {medicine.latin_name}
                            </p>
                            {medicine.common_name && (
                              <p className="text-xs text-gray-500 mb-2">
                                Common: {medicine.common_name}
                              </p>
                            )}

                            <div className="space-y-2">
                              {medicine.potencies &&
                                medicine.potencies.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="text-xs font-medium text-gray-600">
                                      Potencies:
                                    </span>
                                    {medicine.potencies.map(
                                      (potency, index) => (
                                        <span
                                          key={index}
                                          className="text-xs font-medium bg-[#3F856C] text-white px-2 py-0.5 rounded-full"
                                        >
                                          {potency}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                )}

                              {medicine.indications && (
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs sm:text-sm text-gray-700">
                                    <strong>Indications:</strong>{" "}
                                    {medicine.indications}
                                  </p>
                                </div>
                              )}

                              {medicine.contraindications &&
                                medicine.contraindications !== "None known" && (
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs sm:text-sm text-gray-700">
                                      <strong>Contraindications:</strong>{" "}
                                      {medicine.contraindications}
                                    </p>
                                  </div>
                                )}

                              <div className="text-xs text-gray-500">
                                Used in {medicine.rubric_count} rubric
                                {medicine.rubric_count !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(medicine)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(medicine)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    <div className="p-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
                      <div className="text-xs text-gray-500 font-medium">
                        Showing {((medicinesPage - 1) * medicinesLimit) + 1} to {Math.min(medicinesPage * medicinesLimit, medicinesTotal)} of {medicinesTotal} medicines
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMedicinesPage(prev => Math.max(1, prev - 1))}
                          disabled={medicinesPage === 1}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setMedicinesPage(prev => prev + 1)}
                          disabled={!hasMoreMedicines}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <RubricModal
        isOpen={showRubricModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        rubric={editingItem}
      />

      <MedicineModal
        isOpen={showMedicineModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        medicine={editingItem}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete {activeTab === "rubrics" ? "Rubric" : "Medicine"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{deletingItem.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingItem(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={
                  activeTab === "rubrics"
                    ? handleDeleteRubric
                    : handleDeleteMedicine
                }
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepertoryManagement;
