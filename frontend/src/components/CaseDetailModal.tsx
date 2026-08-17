"use client";

import { useState, useEffect } from 'react';
import { 
  X, 
  Edit, 
  User, 
  Phone, 
  Calendar, 
  Stethoscope, 
  ClipboardList, 
  Clock, 
  FileText,
  Pill,
  Tag,
  Activity
} from 'lucide-react';

interface CaseDetail {
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
  status: string;
  doctor_notes?: string;
  follow_up_date?: string;
  prescribed_medicine?: {
    id: number;
    name: string;
  };
  prescribed_potency?: string;
  dosage_instructions?: string;
  selected_rubrics?: Array<{
    id: number;
    name: string;
    intensity: number;
    notes: string;
    added_at: string;
  }>;
  repertorizations?: Array<{
    id: number;
    method: string;
    total_rubrics: number;
    total_medicines_analyzed: number;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  caseId: number | null;
  apiBase: string;
}

const CaseDetailModal = ({ isOpen, onClose, onEdit, caseId, apiBase }: CaseDetailModalProps) => {
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && caseId) {
      fetchCaseDetail();
    }
  }, [isOpen, caseId]);

  const fetchCaseDetail = async () => {
    if (!caseId) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/doctor/cases/${caseId}/`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }

      const data = await response.json();
      setCaseDetail(data.case);
    } catch (err: any) {
      console.error('Error fetching case details:', err);
      alert(err.message || 'Failed to load case details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'follow_up':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 md:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Case Details</h2>
              {caseDetail && (
                <p className="text-sm text-gray-600 mt-1 font-mono">{caseDetail.case_number}</p>
              )}
            </div>
            <div className="flex gap-2">
              {caseDetail && (
                <button
                  onClick={onEdit}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                  title="Edit Case"
                >
                  <Edit className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:rotate-90"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] px-6 md:px-8 py-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading case details...</p>
            </div>
          ) : caseDetail ? (
            <div className="space-y-6">
              {/* Status & Date Row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(caseDetail.status)}`}>
                  <Tag className="w-3.5 h-3.5 inline mr-1.5" />
                  {caseDetail.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium border-2 border-gray-200">
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  Created {formatDate(caseDetail.created_at)}
                </span>
              </div>

              {/* Title */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">{caseDetail.title}</h3>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Patient Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      Patient Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-blue-100">
                        <span className="text-sm text-gray-600">Name</span>
                        <span className="text-sm font-semibold text-gray-900">{caseDetail.patient_name}</span>
                      </div>
                      {caseDetail.patient_age && (
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Age</span>
                          <span className="text-sm font-semibold text-gray-900">{caseDetail.patient_age} years</span>
                        </div>
                      )}
                      {caseDetail.patient_gender && (
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                          <span className="text-sm text-gray-600">Gender</span>
                          <span className="text-sm font-semibold text-gray-900 capitalize">{caseDetail.patient_gender}</span>
                        </div>
                      )}
                      {caseDetail.patient_phone && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            Phone
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{caseDetail.patient_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-white" />
                      </div>
                      Chief Complaint
                    </h4>
                    <p className="text-gray-900 leading-relaxed">{caseDetail.chief_complaint}</p>
                  </div>

                  {/* Duration */}
                  {caseDetail.duration && (
                    <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl border border-amber-100">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        Duration
                      </h4>
                      <p className="text-gray-900 font-semibold">{caseDetail.duration}</p>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Symptoms */}
                  <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-4 h-4 text-white" />
                      </div>
                      Symptoms
                    </h4>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{caseDetail.symptoms}</p>
                  </div>

                  {/* Doctor Notes */}
                  {caseDetail.doctor_notes && (
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        Doctor's Notes
                      </h4>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{caseDetail.doctor_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prescribed Medicine */}
              {caseDetail.prescribed_medicine && (
                <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
                      <Pill className="w-4 h-4 text-white" />
                    </div>
                    Prescribed Medicine
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-rose-200">
                      <p className="text-xs text-gray-600 mb-1">Medicine</p>
                      <p className="text-sm font-bold text-gray-900">{caseDetail.prescribed_medicine.name}</p>
                    </div>
                    {caseDetail.prescribed_potency && (
                      <div className="bg-white p-4 rounded-xl border border-rose-200">
                        <p className="text-xs text-gray-600 mb-1">Potency</p>
                        <p className="text-sm font-bold text-gray-900">{caseDetail.prescribed_potency}</p>
                      </div>
                    )}
                    {caseDetail.dosage_instructions && (
                      <div className="bg-white p-4 rounded-xl border border-rose-200 md:col-span-2">
                        <p className="text-xs text-gray-600 mb-1">Dosage Instructions</p>
                        <p className="text-sm text-gray-900">{caseDetail.dosage_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Rubrics */}
              {caseDetail.selected_rubrics && caseDetail.selected_rubrics.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    Selected Rubrics ({caseDetail.selected_rubrics.length})
                  </h4>
                  <div className="space-y-3">
                    {caseDetail.selected_rubrics.map((rubric) => (
                      <div key={rubric.id} className="bg-white p-4 rounded-xl border border-indigo-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{rubric.name}</p>
                            {rubric.notes && (
                              <p className="text-xs text-gray-600 mt-1">{rubric.notes}</p>
                            )}
                          </div>
                          <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold whitespace-nowrap">
                            Intensity: {rubric.intensity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Repertorizations */}
              {caseDetail.repertorizations && caseDetail.repertorizations.length > 0 && (
                <div className="bg-gradient-to-br from-cyan-50 to-white p-6 rounded-2xl border border-cyan-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    Repertorization History ({caseDetail.repertorizations.length})
                  </h4>
                  <div className="space-y-3">
                    {caseDetail.repertorizations.map((rep) => (
                      <div key={rep.id} className="bg-white p-4 rounded-xl border border-cyan-200">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg font-semibold">
                            {rep.method}
                          </span>
                          <span className="text-gray-600">
                            <strong>{rep.total_rubrics}</strong> rubrics
                          </span>
                          <span className="text-gray-600">
                            <strong>{rep.total_medicines_analyzed}</strong> medicines analyzed
                          </span>
                          <span className="text-gray-500 ml-auto">
                            {formatDate(rep.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CaseDetailModal;
