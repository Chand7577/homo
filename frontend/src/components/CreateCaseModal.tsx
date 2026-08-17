"use client";

import { useState } from 'react';
import { X, User, Phone, Calendar, Stethoscope, ClipboardList, Clock, FileText } from 'lucide-react';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apiBase: string;
}

const CreateCaseModal = ({ isOpen, onClose, onSuccess, apiBase }: CreateCaseModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    patient_name: '',
    patient_age: '',
    patient_gender: '',
    patient_phone: '',
    chief_complaint: '',
    symptoms: '',
    duration: '',
    doctor_notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      patient_name: '',
      patient_age: '',
      patient_gender: '',
      patient_phone: '',
      chief_complaint: '',
      symptoms: '',
      duration: '',
      doctor_notes: '',
    });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.chief_complaint.trim()) errors.chief_complaint = 'Chief complaint is required';
    if (!formData.symptoms.trim()) errors.symptoms = 'Symptoms are required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormLoading(true);
    setFormErrors({});

    try {
      const response = await fetch(`${apiBase}/doctor/cases/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        throw new Error(data.error || 'Failed to create case');
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating case:', err);
      alert(err.message || 'Failed to create case');
    } finally {
      setFormLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 md:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Case</h2>
              <p className="text-sm text-gray-600 mt-1">Add a new patient consultation</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:rotate-90"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 md:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Case Title */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Case Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                    formErrors.title 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50' 
                      : 'border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-50'
                  }`}
                  placeholder="e.g., Chronic Migraine Treatment"
                />
                {formErrors.title && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Patient Information */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                  <User className="w-4 h-4 text-blue-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all duration-200"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.patient_age}
                      onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all duration-200"
                      placeholder="35"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.patient_gender}
                      onChange={(e) => setFormData({ ...formData, patient_gender: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all duration-200"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                      <Phone className="w-3.5 h-3.5" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.patient_phone}
                      onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all duration-200"
                      placeholder="+91 801 234 5678"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-50 transition-all duration-200"
                  placeholder="e.g., 2 weeks, 3 months"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Chief Complaint */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl border border-purple-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Stethoscope className="w-4 h-4 text-purple-600" />
                  Chief Complaint *
                </label>
                <input
                  type="text"
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                    formErrors.chief_complaint 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50' 
                      : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50'
                  }`}
                  placeholder="Primary reason for consultation"
                />
                {formErrors.chief_complaint && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {formErrors.chief_complaint}
                  </p>
                )}
              </div>

              {/* Symptoms */}
              <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-2xl border border-green-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <ClipboardList className="w-4 h-4 text-green-600" />
                  Symptoms *
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  rows={5}
                  className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 resize-none ${
                    formErrors.symptoms 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50' 
                      : 'border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50'
                  }`}
                  placeholder="Describe all symptoms in detail..."
                />
                {formErrors.symptoms && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {formErrors.symptoms}
                  </p>
                )}
              </div>

              {/* Doctor Notes */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-4 h-4 text-gray-600" />
                  Doctor's Notes
                </label>
                <textarea
                  value={formData.doctor_notes}
                  onChange={(e) => setFormData({ ...formData, doctor_notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-50 transition-all duration-200 resize-none"
                  placeholder="Additional observations or notes..."
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 md:px-8 py-5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-semibold hover:from-black hover:to-gray-900 transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gray-900/20"
              disabled={formLoading}
            >
              {formLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                'Create Case'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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

export default CreateCaseModal;
