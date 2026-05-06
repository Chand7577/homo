"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  FileText,
  Clock,
  X,
  AlertCircle,
  CheckCircle,
  Activity,
  Phone,
} from "lucide-react";

import CreateCaseModal from "@/components/CreateCaseModal";
import EditCaseModal from "@/components/EditCaseModal";
import CaseDetailModal from "@/components/CaseDetailModal";
import DeleteCaseModal from "@/components/DeleteCaseModal";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

interface Case {
  id: number;
  case_number: string;
  title: string;
  patient_name: string;
  patient_age?: number;
  patient_gender?: string;
  patient_phone?: string;
  chief_complaint: string;
  symptoms: string;
  duration: string;
  status: "active" | "completed" | "follow_up" | "cancelled";
  doctor_notes?: string;
  created_at: string;
  updated_at: string;
}

const DoctorCases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [searchQuery, statusFilter, cases]);

  const fetchCases = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/doctor/cases/`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }

      const data = await response.json();

      const normalizedCases: Case[] = (data.cases || [])
        .filter((c: any) => c.id)
        .map((c: any) => ({
          id: c.id,
          case_number: c.case_number,
          title: c.title,
          patient_name: c.patient_name,
          patient_age: c.patient_age,
          patient_gender: c.patient_gender,
          patient_phone: c.patient_phone,
          chief_complaint: c.chief_complaint,
          symptoms: c.symptoms,
          duration: c.duration,
          status: c.status,
          doctor_notes: c.doctor_notes,
          created_at: c.created_at,
          updated_at: c.updated_at,
        }));

      setCases(normalizedCases);
    } catch (err: any) {
      setError(err.message || "Failed to load cases");
      console.error("Error fetching cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = [...cases];

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.case_number.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.patient_name.toLowerCase().includes(query) ||
          c.chief_complaint.toLowerCase().includes(query),
      );
    }

    setFilteredCases(filtered);
  };

  const openViewModal = (caseItem: Case) => {
    setSelectedCaseId(caseItem.id);
    setSelectedCase(caseItem);
    setShowDetailModal(true);
  };

  const openEditModal = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowEditModal(true);
  };

  const openEditFromDetail = () => {
    setShowDetailModal(false);
    if (selectedCase) {
      setShowEditModal(true);
    }
  };

  const openDeleteModal = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowDeleteModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedCase(null);
    setSelectedCaseId(null);
  };

  const handleSuccess = () => {
    fetchCases();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "follow_up":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusOptions = [
    { value: "all", label: "All Cases", count: cases.length },
    {
      value: "active",
      label: "Active",
      count: cases.filter((c) => c.status === "active").length,
    },
    {
      value: "completed",
      label: "Completed",
      count: cases.filter((c) => c.status === "completed").length,
    },
    {
      value: "follow_up",
      label: "Follow-up",
      count: cases.filter((c) => c.status === "follow_up").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Cases
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your patient cases and consultations
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Case</span>
            </button>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by case number, patient, or complaint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  statusFilter === option.value
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1 font-medium">
              Total Cases
            </p>
            <p className="text-3xl font-bold text-gray-900">{cases.length}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1 font-medium">Active</p>
            <p className="text-3xl font-bold text-gray-900">
              {cases.filter((c) => c.status === "active").length}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1 font-medium">Follow-ups</p>
            <p className="text-3xl font-bold text-gray-900">
              {cases.filter((c) => c.status === "follow_up").length}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1 font-medium">Completed</p>
            <p className="text-3xl font-bold text-gray-900">
              {cases.filter((c) => c.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-sm flex items-start gap-3 animate-slideDown">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading cases</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 font-medium">Loading cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No cases found"
                : "No cases yet"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Get started by creating your first patient case"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all duration-200 shadow-lg shadow-gray-900/20 hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create First Case
              </button>
            )}
          </div>
        ) : (
          /* Cases Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {caseItem.case_number}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(caseItem.status)}`}
                      >
                        {caseItem.status.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      {caseItem.title}
                    </h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openViewModal(caseItem);
                      }}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(caseItem);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(caseItem);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {caseItem.patient_name}
                    </span>
                    {caseItem.patient_age && (
                      <span className="text-gray-500">
                        • {caseItem.patient_age}y
                      </span>
                    )}
                    {caseItem.patient_gender && (
                      <span className="text-gray-500 capitalize">
                        • {caseItem.patient_gender}
                      </span>
                    )}
                  </div>
                  {caseItem.patient_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {caseItem.patient_phone}
                    </div>
                  )}
                </div>

                {/* Chief Complaint */}
                <div className="mb-4 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1 font-medium">
                    Chief Complaint
                  </p>
                  <p className="text-sm text-gray-900 line-clamp-2 leading-relaxed">
                    {caseItem.chief_complaint}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(caseItem.created_at)}
                  </div>
                  {caseItem.duration && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {caseItem.duration}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateCaseModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        apiBase={API_BASE}
      />

      <EditCaseModal
        isOpen={showEditModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        caseData={selectedCase}
        apiBase={API_BASE}
      />

      <CaseDetailModal
        isOpen={showDetailModal}
        onClose={handleModalClose}
        onEdit={openEditFromDetail}
        caseId={selectedCaseId}
        apiBase={API_BASE}
      />

      <DeleteCaseModal
        isOpen={showDeleteModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        caseData={selectedCase}
        apiBase={API_BASE}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DoctorCases;
