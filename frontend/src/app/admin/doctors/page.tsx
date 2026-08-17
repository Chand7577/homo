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
  Mail,
  Phone,
  Calendar,
  X,
  CheckCircle,
  Stethoscope,
  AlertCircle,
  RefreshCw,
  Badge,
} from "lucide-react";

import DoctorRegistrationModal from "@/components/DoctorRegistrationModal";
import DoctorDetailModal from "@/components/DoctorDetailModal";
import DoctorEditModal from "@/components/DoctorEditModal";

import { API_BASE } from "@/config";

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification?: string;
  registration_number: string;
  experience_years: number;
  doctor_class?: string; // NEW
  aadhar_number?: string; // NEW
  pan_number?: string; // NEW
  license_number?: string; // NEW
  created_at: string;
}

const ManageDoctors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = doctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.email.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query) ||
          doctor.registration_number.toLowerCase().includes(query) ||
          (doctor.doctor_class &&
            doctor.doctor_class.toLowerCase().includes(query)),
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/admin/doctors/`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch doctors");
      }

      setDoctors(data.doctors || []);
      setFilteredDoctors(data.doctors || []);
    } catch (err: any) {
      setError(err.message || "Failed to load doctors");
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/admin/doctors/${selectedDoctor.id}/delete/`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete doctor");
      }

      // Refresh the list
      await fetchDoctors();

      // Close modal
      setShowDeleteModal(false);
      setSelectedDoctor(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete doctor");
      console.error("Error deleting doctor:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const getDoctorClassLabel = (value?: string) => {
    if (!value) return "N/A";
    const labels = {
      doctor_jp_nautiyal: "Dr. JP Nautiyal",
      core_team: "Core Team",
      individual: "Individual",
    };
    return labels[value] || value;
  };

  const getDoctorClassColor = (value?: string) => {
    const colors = {
      doctor_jp_nautiyal: "bg-purple-100 text-purple-700",
      core_team: "bg-blue-100 text-blue-700",
      individual: "bg-gray-100 text-gray-700",
    };
    return colors[value] || "bg-gray-100 text-gray-700";
  };

  // Calculate stats
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.length; // All are active by default
  const thisMonth = doctors.filter((d) => {
    const createdDate = new Date(d.created_at);
    const now = new Date();
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Manage Doctors
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {loading
                ? "Loading..."
                : `${totalDoctors} doctor${totalDoctors !== 1 ? "s" : ""} registered`}
            </p>
          </div>
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#3F856C] text-white rounded-xl font-semibold hover:bg-[#2d6350] transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Doctor
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name, email, specialization, class..."
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
            onClick={fetchDoctors}
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
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Total Doctors</p>
            <p className="text-2xl font-bold text-gray-900">{totalDoctors}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-gray-900">{activeDoctors}</p>
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
            <p className="text-xs text-gray-600 mb-1">Filtered Results</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredDoctors.length}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading doctors</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No doctors found" : "No doctors registered yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by adding your first doctor"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#3F856C] text-white rounded-xl font-semibold hover:bg-[#2d6350] transition-all"
              >
                <Plus className="w-5 h-5" />
                Add New Doctor
              </button>
            )}
          </div>
        ) : (
          /* Doctors Table */
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div
              className="overflow-x-auto 
                [scrollbar-width:thin] 
                [scrollbar-color:#888 #f1f1f1] 
                [&::-webkit-scrollbar]:h-1 
                [&::-webkit-scrollbar-thumb]:bg-gray-400 
                [&::-webkit-scrollbar-thumb]:rounded-full 
                [&::-webkit-scrollbar-track]:bg-gray-100 
                [&::-webkit-scrollbar-track]:rounded-full"
            >
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Class
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Experience
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDoctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {doctor.name.split(" ")[0][0]}
                              {doctor.name.split(" ")[1]?.[0] || ""}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {doctor.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {doctor.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold ${getDoctorClassColor(doctor.doctor_class)}`}
                        >
                          {getDoctorClassLabel(doctor.doctor_class)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {doctor.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {doctor.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {doctor.experience_years} years
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewDoctor(doctor)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleEditDoctor(doctor)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(doctor)}
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
                Showing {filteredDoctors.length} of {totalDoctors} doctor
                {totalDoctors !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <DoctorRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={fetchDoctors}
      />

      <DoctorDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
      />

      <DoctorEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDoctor(null);
        }}
        onSuccess={fetchDoctors}
        doctor={selectedDoctor}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete Doctor
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedDoctor.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDoctor(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDoctor}
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

export default ManageDoctors;
