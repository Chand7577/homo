// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Calendar,
  X,
  Users,
  Activity,
  Droplet,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import PatientRegistrationModal from "@/components/PatientRegistrationModal";
import PatientDetailModal from "@/components/PatientDetailModal";
// import PatientEditModal from '@/components/PatientEditModal'; // You'll need to create this

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  blood_group: string;
  gender: string;
  date_of_birth: string | null;
  age: number | null;
  address: string;
  emergency_contact: string;
  medical_history: string;
  allergies: string;
  date_registered: string;
  last_visit: string;
  total_searches: number;
}

const ManagePatients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          patient.email.toLowerCase().includes(query) ||
          patient.phone.toLowerCase().includes(query) ||
          patient.blood_group.toLowerCase().includes(query),
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/admin/patients/`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch patients");
      }

      setPatients(data.patients || []);
      setFilteredPatients(data.patients || []);
    } catch (err: any) {
      setError(err.message || "Failed to load patients");
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/admin/patients/${selectedPatient.id}/delete/`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete patient");
      }

      // Refresh the list
      await fetchPatients();

      // Close modal
      setShowDeleteModal(false);
      setSelectedPatient(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete patient");
      console.error("Error deleting patient:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  // Calculate stats
  const totalPatients = patients.length;
  const totalSearches = patients.reduce((sum, p) => sum + p.total_searches, 0);
  const activeToday = patients.filter(
    (p) =>
      p.last_visit ===
      new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
  ).length;
  const thisMonth = patients.filter((p) => {
    const registeredDate = new Date(p.date_registered);
    const now = new Date();
    return (
      registeredDate.getMonth() === now.getMonth() &&
      registeredDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Manage Patients
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {loading
                ? "Loading..."
                : `${totalPatients} patient${totalPatients !== 1 ? "s" : ""} registered`}
            </p>
          </div>
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#3F856C] text-white rounded-xl font-semibold hover:bg-[#2d6350] transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Patient
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, email, phone, blood group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
          <button
            onClick={fetchPatients}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#3F856C] rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Active Today</p>
            <p className="text-2xl font-bold text-gray-900">{activeToday}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">This Month</p>
            <p className="text-2xl font-bold text-gray-900">{thisMonth}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Total Searches</p>
            <p className="text-2xl font-bold text-gray-900">{totalSearches}</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading patients</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No patients found" : "No patients registered yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by adding your first patient"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#3F856C] text-white rounded-xl font-semibold hover:bg-[#2d6350] transition-all"
              >
                <Plus className="w-5 h-5" />
                Add New Patient
              </button>
            )}
          </div>
        ) : (
          /* Patients Table */
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Blood Group
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Registered
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Last Visit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Searches
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {patient.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {patient.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {patient.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {patient.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            {patient.blood_group}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {patient.date_registered}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {patient.last_visit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {patient.total_searches}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewPatient(patient)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(patient)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredPatients.length} of {totalPatients} patient
                {totalPatients !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PatientRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={fetchPatients}
      />

      <PatientDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete Patient
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedPatient.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPatient(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePatient}
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

export default ManagePatients;
