// @ts-nocheck
"use client";

import { X, Mail, Phone, Award, FileText, Briefcase, Calendar, CheckCircle, CreditCard, IdCard, Badge } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification?: string;
  registration_number: string;
  experience_years: number;
  doctor_class?: string;
  aadhar_number?: string;
  pan_number?: string;
  license_number?: string;
  created_at: string;
}

interface DoctorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

const DoctorDetailModal = ({ isOpen, onClose, doctor }: DoctorDetailModalProps) => {
  if (!isOpen || !doctor) return null;

  const getDoctorClassLabel = (value: string) => {
    const labels = {
      'doctor_jp_nautiyal': 'Doctor JP Nautiyal',
      'core_team': 'Core Team',
      'individual': 'Individual'
    };
    return labels[value] || value;
  };

  const formatAadhar = (aadhar: string) => {
    if (!aadhar) return 'N/A';
    const cleaned = aadhar.replace(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || aadhar;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {doctor.name.split(' ')[0][0]}{doctor.name.split(' ')[1]?.[0] || ''}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
              <p className="text-sm text-gray-600">{doctor.specialization}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Doctor Classification */}
          {doctor.doctor_class && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Classification</h3>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-l-4 border-gray-900">
                <Badge className="w-5 h-5 text-gray-900 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Doctor Class</p>
                  <p className="text-sm font-semibold text-gray-900">{getDoctorClassLabel(doctor.doctor_class)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="text-sm font-semibold text-gray-900">{doctor.email}</p>
                </div>
              </div>
              {doctor.phone && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-900">{doctor.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Identity Documents */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Identity Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {doctor.aadhar_number && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <IdCard className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Aadhar Number</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">{formatAadhar(doctor.aadhar_number)}</p>
                  </div>
                </div>
              )}

              {doctor.pan_number && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <CreditCard className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">PAN Number</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">{doctor.pan_number}</p>
                  </div>
                </div>
              )}

              {doctor.license_number && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">License Number</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">{doctor.license_number}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Award className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Specialization</p>
                  <p className="text-sm font-semibold text-gray-900">{doctor.specialization}</p>
                </div>
              </div>

              {doctor.qualification && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Qualification</p>
                    <p className="text-sm font-semibold text-gray-900">{doctor.qualification}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Registration Number</p>
                  <p className="text-sm font-semibold text-gray-900">{doctor.registration_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Experience</p>
                  <p className="text-sm font-semibold text-gray-900">{doctor.experience_years} years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date Joined</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(doctor.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-semibold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal;
