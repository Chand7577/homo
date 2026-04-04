// @ts-nocheck
"use client";

import { X, Mail, Phone, Calendar, Droplet, MapPin, AlertTriangle, FileText, User, Activity } from 'lucide-react';

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

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

const PatientDetailModal = ({ isOpen, onClose, patient }: PatientDetailModalProps) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3F856C] to-[#2d6350] rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {patient.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-sm text-gray-600">{patient.age ? `${patient.age} years old` : 'Age not specified'}</p>
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
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="text-sm font-semibold text-gray-900">{patient.email}</p>
                </div>
              </div>

              {patient.phone && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-900">{patient.phone}</p>
                  </div>
                </div>
              )}

              {patient.emergency_contact && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Emergency Contact</p>
                    <p className="text-sm font-semibold text-gray-900">{patient.emergency_contact}</p>
                  </div>
                </div>
              )}

              {patient.address && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-sm font-semibold text-gray-900">{patient.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Gender</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{patient.gender}</p>
                </div>
              </div>

              {patient.date_of_birth && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Droplet className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                  <p className="text-sm font-semibold text-gray-900">{patient.blood_group}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date Registered</p>
                  <p className="text-sm font-semibold text-gray-900">{patient.date_registered}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          {(patient.medical_history || patient.allergies) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Medical Information</h3>
              <div className="space-y-3">
                {patient.medical_history && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Medical History</p>
                      <p className="text-sm text-gray-900">{patient.medical_history}</p>
                    </div>
                  </div>
                )}

                {patient.allergies && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-red-600 mb-1">Allergies</p>
                      <p className="text-sm text-gray-900">{patient.allergies}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Last Visit</p>
                  <p className="text-sm font-semibold text-gray-900">{patient.last_visit}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Activity className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Searches</p>
                  <p className="text-sm font-semibold text-gray-900">{patient.total_searches}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
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

export default PatientDetailModal;
