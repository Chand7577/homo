"use client";

import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface Case {
  id: number;
  case_number: string;
  title: string;
  patient_name: string;
}

interface DeleteCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  caseData: Case | null;
  apiBase: string;
}

const DeleteCaseModal = ({ isOpen, onClose, onSuccess, caseData, apiBase }: DeleteCaseModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!caseData) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${apiBase}/doctor/cases/${caseData.id}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete case');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error deleting case:', err);
      alert(err.message || 'Failed to delete case');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !caseData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-red-50 to-white border-b border-red-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Case</h3>
                <p className="text-xs text-gray-600 mt-0.5 font-mono">{caseData.case_number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 rounded-xl transition-all duration-200 hover:rotate-90"
              disabled={isDeleting}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-gray-900">{caseData.title}</strong>
              {caseData.patient_name && (
                <>
                  {' '}for patient{' '}
                  <strong className="text-gray-900">{caseData.patient_name}</strong>
                </>
              )}
              ?
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Warning</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  This action cannot be undone. All case data including symptoms, notes, 
                  selected rubrics, and repertorization results will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/30"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Case
                </span>
              )}
            </button>
          </div>
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

import { useState } from 'react';

export default DeleteCaseModal;
