// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Pill, 
  FileText, 
  List,
  Download,
  Eye,
  X,
  Star,
  TrendingUp,
  Activity,
  AlertCircle,
  Loader2,
  Save,
  Trash2
} from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000/homeopathy";

interface Medicine {
  id: number;
  name: string;
  latin_name: string;
  name_hindi?: string;
  common_name?: string;
  family?: string;
  description?: string;
  description_hindi?: string;
  source?: string;
  potencies?: string;
  indications?: string;
  contraindications?: string;
  usage_count?: number;
  avg_rating?: number;
  popular?: boolean;
}

interface RubricMedicineGrade {
  id: number;
  rubric_id: number;
  rubric_name: string;
  rubric_path: string;
  medicine_id: number;
  medicine_name: string;
  grade: number;
}

const DoctorMedicines = () => {
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [mappings, setMappings] = useState<RubricMedicineGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stats
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [popularCount, setPopularCount] = useState(0);
  const [mostUsed, setMostUsed] = useState('');
  const [totalMappings, setTotalMappings] = useState(0);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    latin_name: '',
    common_name: '',
    name_hindi: '',
    family: '',
    description: '',
    description_hindi: '',
    source: '',
    potencies: '',
    indications: '',
    contraindications: '',
  });

  const subTabs = [
    { id: 'list', label: 'List', icon: Pill, count: totalMedicines },
    { id: 'grades', label: 'Grades', icon: FileText, count: 5 },
    { id: 'mapping', label: 'Mapping', icon: List, count: totalMappings }
  ];

  const gradeSystem = [
    { grade: 1, label: 'Minimal', color: 'bg-gray-400', desc: 'Rarely indicated', icon: '•' },
    { grade: 2, label: 'Slight', color: 'bg-yellow-400', desc: 'Sometimes helpful', icon: '••' },
    { grade: 3, label: 'Moderate', color: 'bg-orange-400', desc: 'Frequently indicated', icon: '•••' },
    { grade: 4, label: 'Strong', color: 'bg-[#3F856C]', desc: 'Commonly indicated', icon: '••••' },
    { grade: 5, label: 'Definitive', color: 'bg-gray-900', desc: 'Highly characteristic', icon: '•••••' }
  ];

  // Pagination state
  const [medicinesPage, setMedicinesPage] = useState(1);
  const [medicinesTotal, setMedicinesTotal] = useState(0);
  const [medicinesLimit] = useState(50);
  const [hasMoreMedicines, setHasMoreMedicines] = useState(false);

  useEffect(() => {
    fetchMedicines();
    if (activeSubTab === 'mapping') {
      fetchMappings();
    }
  }, [activeSubTab, medicinesPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setMedicinesPage(1);
      fetchMedicines();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMedicines = async () => {
    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE}/doctor/medicines/?page=${medicinesPage}&limit=${medicinesLimit}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch medicines');
      }

      const data = await response.json();
      const medicinesList = data.medicines || [];
      
      setMedicines(medicinesList);
      setMedicinesTotal(data.total || 0);
      setTotalMedicines(data.total || 0);
      setHasMoreMedicines(data.has_more || false);
      
      // Popular count and most used are tricky with server-side pagination 
      // but we can estimate or use the first page's data for display if needed.
      // Usually these stats should come from a separate "stats" endpoint for better accuracy.
      const popular = medicinesList.filter((m: Medicine) => m.popular).length;
      setPopularCount(popular);
      
      const sorted = [...medicinesList].sort((a, b) => 
        (b.usage_count || 0) - (a.usage_count || 0)
      );
      setMostUsed(sorted[0]?.name || 'N/A');

    } catch (err: any) {
      setError(err.message || 'Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const fetchMappings = async () => {
    try {
      const response = await fetch(`${API_BASE}/doctor/rubric-medicine-grades/`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mappings');
      }

      const data = await response.json();
      setMappings(data.mappings || []);
      setTotalMappings((data.mappings || []).length);

    } catch (err: any) {
      console.error('Error fetching mappings:', err);
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      latin_name: '',
      common_name: '',
      name_hindi: '',
      family: '',
      description: '',
      description_hindi: '',
      source: '',
      potencies: '',
      indications: '',
      contraindications: '',
    });
    setShowCreateModal(true);
  };

  const openEditModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      latin_name: medicine.latin_name,
      common_name: medicine.common_name || '',
      name_hindi: medicine.name_hindi || '',
      family: medicine.family || '',
      description: medicine.description || '',
      description_hindi: medicine.description_hindi || '',
      source: medicine.source || '',
      potencies: medicine.potencies || '',
      indications: medicine.indications || '',
      contraindications: medicine.contraindications || '',
    });
    setShowEditModal(true);
  };

  const openViewModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowViewModal(true);
  };

  const openDeleteModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowDeleteModal(true);
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/doctor/medicines/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create medicine');
      }

      await fetchMedicines();
      setShowCreateModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create medicine');
      console.error('Error creating medicine:', err);
    }
  };

  const handleUpdateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMedicine) return;

    try {
      const response = await fetch(
        `${API_BASE}/doctor/medicines/${selectedMedicine.id}/update/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update medicine');
      }

      await fetchMedicines();
      setShowEditModal(false);
      setSelectedMedicine(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update medicine');
      console.error('Error updating medicine:', err);
    }
  };

  const handleDeleteMedicine = async () => {
    if (!selectedMedicine) return;

    try {
      const response = await fetch(
        `${API_BASE}/doctor/medicines/${selectedMedicine.id}/delete/`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete medicine');
      }

      await fetchMedicines();
      setShowDeleteModal(false);
      setSelectedMedicine(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete medicine');
      console.error('Error deleting medicine:', err);
    }
  };

  const filteredMedicines = medicines;

  const filteredMappings = mappings.filter(mapping =>
    mapping.rubric_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 md:px-8 py-3 md:py-6">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">Medicines</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1 truncate">Manage remedies & grades</p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 ml-2">
            <button className="hidden md:flex px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={openCreateModal}
              className="px-2 md:px-4 py-2 md:py-2.5 bg-gray-900 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-black transition-colors flex items-center gap-1 md:gap-2"
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3.5 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
            </button>
          )}
        </div>
      </header>

      {/* Sub Tabs */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-8 overflow-x-auto">
        <div className="flex gap-0.5 md:gap-1 min-w-max">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 md:py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-semibold">{tab.label}</span>
                <span className={`text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full ${
                  activeSubTab === tab.id 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-3 md:p-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error loading medicines</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <Loader2 className="w-16 h-16 text-gray-400 animate-spin mx-auto mb-6" />
            <p className="text-gray-600 font-medium">Loading medicines...</p>
          </div>
        ) : (
          <>
            {activeSubTab === 'list' && (
              <div className="space-y-3 md:space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  {[
                    { label: 'Total', value: totalMedicines.toString(), icon: Pill, color: 'bg-gray-900' },
                    { label: 'Most Used', value: mostUsed, icon: TrendingUp, color: 'bg-[#3F856C]' },
                    { label: 'Popular', value: popularCount.toString(), icon: Star, color: 'bg-gray-700' },
                    { label: 'Mappings', value: totalMappings.toString(), icon: Activity, color: 'bg-gray-600' },
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div key={idx} className="bg-white rounded-lg md:rounded-xl p-2.5 md:p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 font-medium truncate">{stat.label}</p>
                            <p className="text-lg md:text-2xl font-bold text-gray-900 mt-0.5 md:mt-1 truncate">{stat.value}</p>
                          </div>
                          <div className={`w-8 h-8 md:w-10 md:h-10 ${stat.color} rounded-lg flex items-center justify-center ml-2 flex-shrink-0`}>
                            <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Medicines Cards - Mobile Optimized */}
                <div className="space-y-2 md:hidden">
                  {filteredMedicines.map((med) => (
                    <div key={med.id} className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Pill className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900 truncate">{med.name}</span>
                            {med.popular && <Star className="w-3 h-3 text-[#3F856C] fill-[#3F856C] flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-600 italic mb-2 truncate">{med.latin_name}</p>
                          {med.family && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md mb-2 inline-block">
                              {med.family}
                            </span>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {med.usage_count || 0} uses
                            </span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => openViewModal(med)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => openEditModal(med)}
                                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => openDeleteModal(med)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                    {/* Mobile Pagination */}
                    <div className="mt-4 flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <button
                        onClick={() => setMedicinesPage(prev => Math.max(1, prev - 1))}
                        disabled={medicinesPage === 1}
                        className="px-3 py-1 bg-gray-100 rounded text-xs font-bold disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="text-xs text-gray-500">Page {medicinesPage}</span>
                      <button
                        onClick={() => setMedicinesPage(prev => prev + 1)}
                        disabled={!hasMoreMedicines}
                        className="px-3 py-1 bg-gray-100 rounded text-xs font-bold disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                </div>

                {/* Medicines Table - Desktop */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Medicine</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Latin Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Family</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Usage</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredMedicines.map((med) => (
                          <tr key={med.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                                  <Pill className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-gray-900">{med.name}</span>
                                  {med.popular && <Star className="w-3.5 h-3.5 text-[#3F856C] fill-[#3F856C]" />}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600 italic">{med.latin_name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                                {med.family || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                {med.usage_count || 0} times
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => openViewModal(med)}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => openEditModal(med)}
                                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => openDeleteModal(med)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Desktop Pagination */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {(medicinesPage - 1) * medicinesLimit + 1} to {Math.min(medicinesPage * medicinesLimit, medicinesTotal)} of {medicinesTotal} medicines
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMedicinesPage(prev => Math.max(1, prev - 1))}
                        disabled={medicinesPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setMedicinesPage(prev => prev + 1)}
                        disabled={!hasMoreMedicines}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {filteredMedicines.length === 0 && (
                    <div className="p-12 text-center">
                      <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No medicines found</h3>
                      <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search' : 'Create your first medicine to get started'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'grades' && (
              <div className="space-y-3 md:space-y-6">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl md:rounded-2xl p-4 md:p-8 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Grade System</h3>
                      <p className="text-gray-300 text-xs md:text-sm">Clinical significance & reliability (1-5)</p>
                    </div>
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-sm ml-2 flex-shrink-0">
                      <FileText className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 md:gap-4">
                  {gradeSystem.map((item) => (
                    <div key={item.grade} className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                      <div className="flex items-center p-3 md:p-6">
                        <div className={`w-12 h-12 md:w-16 md:h-16 ${item.color} rounded-lg md:rounded-xl flex items-center justify-center font-bold text-lg md:text-2xl text-white mr-3 md:mr-6 flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                          {item.grade}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <h4 className="text-sm md:text-lg font-bold text-gray-900">{item.label}</h4>
                            <span className="text-lg md:text-2xl text-gray-300 tracking-wider">{item.icon}</span>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 truncate">{item.desc}</p>
                        </div>
                      </div>

                      <div className="px-3 md:px-6 pb-3 md:pb-6">
                        <div className="h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.color} transition-all`}
                            style={{ width: `${(item.grade / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl md:rounded-2xl p-3 md:p-6">
                  <div className="flex items-start gap-2 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-bold text-blue-900 mb-1 md:mb-2">Clinical Note</p>
                      <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                        Higher grades represent stronger correlations backed by clinical experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'mapping' && (
              <div className="space-y-3 md:space-y-6">
                {/* Mobile Cards */}
                <div className="space-y-2 md:hidden">
                  {filteredMappings.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-900 block truncate">{item.rubric_name}</span>
                          <span className="text-xs text-gray-500 block truncate">{item.rubric_path}</span>
                        </div>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shadow-md ml-2 flex-shrink-0 ${
                          item.grade === 5 ? 'bg-gray-900 text-white' : 
                          item.grade === 4 ? 'bg-[#3F856C] text-white' : 
                          item.grade === 3 ? 'bg-orange-400 text-white' :
                          item.grade === 2 ? 'bg-yellow-400 text-white' :
                          'bg-gray-400 text-white'
                        }`}>
                          {item.grade}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                            <Pill className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-bold text-gray-900">{item.medicine_name}</span>
                        </div>
                        <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Rubric</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Medicine</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">Grade</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredMappings.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                              <div>
                                <span className="text-sm font-semibold text-gray-900">{item.rubric_name}</span>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-gray-500">{item.rubric_path}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                                  <Pill className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-bold text-gray-900">{item.medicine_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm shadow-md ${
                                  item.grade === 5 ? 'bg-gray-900 text-white' : 
                                  item.grade === 4 ? 'bg-[#3F856C] text-white' : 
                                  item.grade === 3 ? 'bg-orange-400 text-white' :
                                  item.grade === 2 ? 'bg-yellow-400 text-white' :
                                  'bg-gray-400 text-white'
                                }`}>
                                  {item.grade}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredMappings.length === 0 && (
                    <div className="p-12 text-center">
                      <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No mappings found</h3>
                      <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search' : 'No rubric-medicine mappings available'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {showCreateModal ? 'Create New Medicine' : 'Edit Medicine'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedMedicine(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form 
              onSubmit={showCreateModal ? handleCreateMedicine : handleUpdateMedicine}
              className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                    placeholder="e.g., Aconite"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latin Name *
                  </label>
                  <input
                    type="text"
                    value={formData.latin_name}
                    onChange={(e) => setFormData({ ...formData, latin_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                    placeholder="e.g., Aconitum Napellus"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Common Name
                  </label>
                  <input
                    type="text"
                    value={formData.common_name}
                    onChange={(e) => setFormData({ ...formData, common_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                    placeholder="e.g., Monkshood"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name (Hindi)
                  </label>
                  <input
                    type="text"
                    value={formData.name_hindi}
                    onChange={(e) => setFormData({ ...formData, name_hindi: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                    placeholder="हिंदी नाम"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Family
                  </label>
                  <input
                    type="text"
                    value={formData.family}
                    onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                    placeholder="e.g., Ranunculaceae"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                    placeholder="e.g., Whole plant"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Potencies
                </label>
                <input
                  type="text"
                  value={formData.potencies}
                  onChange={(e) => setFormData({ ...formData, potencies: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                  placeholder="e.g., 6C, 30C, 200C, 1M"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                  placeholder="Detailed description of the medicine..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Indications
                </label>
                <textarea
                  value={formData.indications}
                  onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                  placeholder="When this medicine is indicated..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraindications
                </label>
                <textarea
                  value={formData.contraindications}
                  onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                  placeholder="When this medicine should not be used..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedMedicine(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {showCreateModal ? 'Create Medicine' : 'Update Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Medicine Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMedicine(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedMedicine.name}
                </h3>
                <p className="text-lg text-gray-600 italic">{selectedMedicine.latin_name}</p>
                {selectedMedicine.common_name && (
                  <p className="text-sm text-gray-500 mt-1">Common: {selectedMedicine.common_name}</p>
                )}
                {selectedMedicine.name_hindi && (
                  <p className="text-sm text-gray-500 mt-1">हिंदी: {selectedMedicine.name_hindi}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Family</p>
                  <p className="text-lg font-bold text-gray-900">{selectedMedicine.family || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Usage Count</p>
                  <p className="text-lg font-bold text-gray-900">{selectedMedicine.usage_count || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Rating</p>
                  <p className="text-lg font-bold text-gray-900">{selectedMedicine.avg_rating || 0}/5</p>
                </div>
              </div>

              {selectedMedicine.source && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Source</h4>
                  <p className="text-gray-600">{selectedMedicine.source}</p>
                </div>
              )}

              {selectedMedicine.potencies && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Potencies</h4>
                  <p className="text-gray-600">{selectedMedicine.potencies}</p>
                </div>
              )}

              {selectedMedicine.description && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedMedicine.description}</p>
                </div>
              )}

              {selectedMedicine.indications && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Indications</h4>
                  <p className="text-gray-600">{selectedMedicine.indications}</p>
                </div>
              )}

              {selectedMedicine.contraindications && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Contraindications</h4>
                  <p className="text-gray-600">{selectedMedicine.contraindications}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Medicine?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "<strong>{selectedMedicine.name}</strong>"? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedMedicine(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMedicine}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMedicines;
