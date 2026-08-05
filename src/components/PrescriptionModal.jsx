import React, { useState, useEffect } from 'react';
import { X, FileText, User, Pill, AlertCircle, Eye, Trash2 } from 'lucide-react';
import PrescriptionForm from './PrescriptionForm';
import { getPrescriptionPDFBlobUrl } from '../utils/pdfGenerator';

export default function PrescriptionModal({ currentUser = null, prescription, isOpen, onClose, onDelete, onUpdate, lang = 'en' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' or 'details'
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  const t = (en, hi) => (lang === 'en' ? en : hi);

  useEffect(() => {
    if (isOpen && prescription) {
      setIsEditing(false);
      // For Hindi, default to details view since PDF doesn't render Hindi well
      setViewMode(lang === 'hi' ? 'details' : 'pdf');
      const enhancedRx = {
        ...prescription,
        doctorQualifications: prescription.doctorQualifications || currentUser?.qualifications || 'BHMS, MD (Hom.)',
        doctorRegistration: prescription.doctorRegistration || currentUser?.registrationNumber || '',
        doctorExperience: prescription.doctorExperience || currentUser?.experience || '',
      };
      try {
        const url = getPrescriptionPDFBlobUrl(enhancedRx, lang);
        if (url) {
          // Append toolbar=0 to hide browser PDF download/print toolbar icons in iframe preview
          setPdfBlobUrl(`${url}#toolbar=0&navpanes=0&scrollbar=1`);
        }
      } catch (e) {
        console.error('Error generating PDF preview URL:', e);
      }
    }
  }, [isOpen, prescription, currentUser, lang]);

  if (!isOpen || !prescription) return null;

  const formatDate = (dateString) => {
    if (!dateString) return t('Not specified', 'निर्दिष्ट नहीं');
    return new Date(dateString).toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      t(
        'Are you sure you want to delete this prescription? This action cannot be undone.',
        'क्या आप वाकई इस प्रिस्क्रिप्शन को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
      )
    );

    if (confirmDelete && onDelete) {
      onDelete(prescription._id || prescription.id);
      onClose();
    }
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
        <div className="bg-white md:rounded-2xl shadow-2xl max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#062E6F] to-[#042050] text-white p-4 md:p-5 flex justify-between items-center shrink-0">
            <h2 className="text-lg md:text-xl font-bold">
              {t('Edit Prescription', 'प्रिस्क्रिप्शन संपादित करें')}
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Form Content */}
          <div className="overflow-y-auto flex-1">
            <PrescriptionForm
              currentUser={currentUser}
              editingPrescription={prescription}
              lang={lang}
              onPrescriptionSaved={(updatedRx) => {
                setIsEditing(false);
                if (onUpdate) {
                  onUpdate(updatedRx);
                }
              }}
              onCancelEdit={() => setIsEditing(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-white w-full h-full md:h-auto md:max-h-[92vh] max-w-4xl md:rounded-2xl shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#062E6F] to-[#042050] text-white p-4 md:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 hover:bg-white/20 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl shrink-0">
                <FileText className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold truncate">
                  {t('Prescription Preview', 'प्रिस्क्रिप्शन पूर्वावलोकन')}
                </h2>
                <p className="text-blue-100 text-xs truncate">
                  {t('Patient:', 'मरीज़:')} <span className="font-semibold text-white">{prescription.patientName || '—'}</span>
                  {prescription.id && ` • ID: ${prescription.id}`}
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-white/10 p-1 rounded-xl shrink-0 self-start sm:self-auto mt-1 sm:mt-0">
              <button
                onClick={() => setViewMode('pdf')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'pdf'
                    ? 'bg-white text-[#062E6F] shadow-sm'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                {t('Preview', 'पूर्वावलोकन')}
              </button>
              <button
                onClick={() => setViewMode('details')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'details'
                    ? 'bg-white text-[#062E6F] shadow-sm'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                {t('Details', 'विवरण')}
              </button>
            </div>
          </div>
        </div>

        {/* Content Body - Mobile Responsive */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 bg-slate-50">
          {viewMode === 'pdf' ? (
            <div className="space-y-3">
              {/* MOBILE VIEW DIGITAL PRESCRIPTION CARD (Shown on screens < md) */}
              <div className="block md:hidden space-y-3">
                {/* Mobile Action Bar */}
                <div className="bg-[#062E6F]/5 border border-[#062E6F]/20 rounded-xl p-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#062E6F]" />
                      <span className="text-xs font-bold text-[#062E6F]">
                        {t('Prescription Document', 'प्रिस्क्रिप्शन दस्तावेज़')}
                      </span>
                    </div>
                    <span className="text-[10px] bg-[#062E6F]/10 text-[#062E6F] font-bold px-2 py-0.5 rounded-full">
                      {t('PDF Ready', 'पीडीएफ तैयार')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (pdfBlobUrl) {
                          window.open(pdfBlobUrl, '_blank');
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-[#062E6F] text-white rounded-xl text-xs font-bold hover:bg-[#042050] transition-colors flex items-center justify-center gap-1.5 min-h-[40px] shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t('Open PDF', 'पीडीएफ खोलें')}
                    </button>

                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = pdfBlobUrl;
                        link.download = `Prescription_${prescription.patientName || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 min-h-[40px] shadow-xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {t('Download PDF', 'डाउनलोड करें')}
                    </button>
                  </div>
                </div>

                {/* Mobile Digital Prescription Paper View */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4 text-slate-800">
                  {/* Doctor Header */}
                  <div className="border-b border-slate-100 pb-3 text-center">
                    <h3 className="text-base font-extrabold text-[#062E6F]">
                      {prescription.doctorName || currentUser?.name || 'Dr. Homeo AI'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {prescription.doctorQualifications || currentUser?.qualifications || 'BHMS, MD (Hom.)'}
                      {(prescription.doctorRegistration || currentUser?.registrationNumber) && ` • Reg: ${prescription.doctorRegistration || currentUser?.registrationNumber}`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {prescription.doctorClinic || currentUser?.clinicName || 'Homeopathic Consultation'}
                    </p>
                  </div>

                  {/* Patient Info Summary */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">{t('Patient', 'मरीज़')}</span>
                      <span className="font-bold text-slate-800">{prescription.patientName || '—'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">{t('Date', 'तिथि')}</span>
                      <span className="font-semibold text-slate-700">{formatDate(prescription.prescribedAt || prescription.createdAt)}</span>
                    </div>
                    {prescription.patientAge && (
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">{t('Age / Gender', 'उम्र / लिंग')}</span>
                        <span className="font-medium text-slate-700">{prescription.patientAge} yrs {prescription.patientGender && `• ${prescription.patientGender}`}</span>
                      </div>
                    )}
                    {prescription.patientContact && (
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">{t('Contact', 'संपर्क')}</span>
                        <span className="font-medium text-slate-700">{prescription.patientContact}</span>
                      </div>
                    )}
                  </div>

                  {/* Prescribed Remedies */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#062E6F] uppercase tracking-wide flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-[#062E6F]" />
                      {t('Prescribed Remedy', 'निर्धारित दवा')}
                    </h4>

                    {prescription.medicines && prescription.medicines.length > 0 ? (
                      <div className="space-y-2">
                        {prescription.medicines.map((m, idx) => (
                          <div key={idx} className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col gap-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#062E6F] text-sm">{m.name}</span>
                              {m.potency && (
                                <span className="bg-[#062E6F] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                  {m.type === 'mother_tincture' ? 'Q' : m.potency}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-slate-600 text-[11px] mt-0.5">
                              <span>{m.frequency || 'OD'} {m.meal ? `• ${m.meal}` : ''}</span>
                              <span>{m.quantity ? `${m.quantity} ${m.form || ''}` : ''}</span>
                            </div>
                            {m.remarks && <p className="text-[10px] italic text-slate-500 mt-1">{m.remarks}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#062E6F] text-sm">{prescription.remedy}</span>
                          {prescription.potency && (
                            <span className="bg-[#062E6F] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                              {prescription.potency}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600 text-[11px] mt-0.5">
                          {prescription.dosage && <span>{t('Dosage:', 'खुराक:')} {prescription.dosage}</span>}
                          {prescription.duration && <span className="ml-3">{t('Duration:', 'अवधि:')} {prescription.duration}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes / Instructions */}
                  {(prescription.instructions || prescription.notes) && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      {prescription.instructions && (
                        <p><strong className="text-slate-700">{t('Instructions:', 'निर्देश:')}</strong> {prescription.instructions}</p>
                      )}
                      {prescription.notes && (
                        <p><strong className="text-slate-700">{t('Notes:', 'नोट्स:')}</strong> {prescription.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* DESKTOP VIEW IFRAME (Shown on screens >= md) */}
              <div className="hidden md:flex w-full bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-col" style={{ height: 'calc(100vh - 300px)' }}>
                {pdfBlobUrl ? (
                  <iframe
                    src={pdfBlobUrl}
                    className="w-full h-full border-none rounded-xl"
                    title="Prescription PDF Preview"
                    style={{ minHeight: '400px' }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062E6F]"></div>
                    <p className="text-sm font-medium">{t('Loading preview...', 'पूर्वावलोकन लोड हो रहा है...')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {/* Patient Information */}
              <section className="space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#062E6F]" />
                  {t('Patient Information', 'मरीज़ की जानकारी')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 mb-0.5">
                      {t('Full Name', 'पूरा नाम')}
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {prescription.patientName || t('Not provided', 'प्रदान नहीं किया गया')}
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 mb-0.5">
                      {t('Age & Gender', 'उम्र और लिंग')}
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {prescription.patientAge ? `${prescription.patientAge} ${t('years', 'वर्ष')}` : t('Not specified', 'निर्दिष्ट नहीं')}
                      {prescription.patientAge && prescription.patientGender && ' • '}
                      {prescription.patientGender || ''}
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 mb-0.5">
                      {t('Contact', 'संपर्क')}
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {prescription.patientContact || t('Not provided', 'प्रदान नहीं किया गया')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Prescription Details */}
              <section className="space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-[#062E6F]" />
                  {t('Prescribed Remedy', 'निर्धारित दवा')}
                </h3>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-800">{prescription.remedy}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{prescription.potency}</p>
                    </div>
                    {prescription.potency && (
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        {prescription.potency}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                    <div>
                      <p className="font-bold text-slate-600 mb-0.5">{t('Dosage', 'खुराक')}</p>
                      <p className="text-slate-800">{prescription.dosage || t('As directed', 'निर्देशानुसार')}</p>
                    </div>

                    {prescription.duration && (
                      <div>
                        <p className="font-bold text-slate-600 mb-0.5">{t('Duration', 'अवधि')}</p>
                        <p className="text-slate-800">{prescription.duration}</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Guidelines */}
              <section>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 space-y-1">
                    <p className="font-bold">{t('Homeopathic Guidelines', 'होम्योपैथिक दिशानिर्देश')}</p>
                    <p>• {t('Take 30 minutes before or after meals', 'भोजन से 30 मिनट पहले या बाद में लें')}</p>
                    <p>• {t('Avoid coffee, mint, camphor, and strong odors', 'कॉफी, पुदीना, कपूर और तेज़ गंध से बचें')}</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer - Only Clean Actions & Mobile Responsive */}
        <div className="border-t border-slate-200 bg-white p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 w-full sm:w-auto text-center sm:text-left">
            {t('Prescribed on', 'प्रिस्क्रिप्शन तिथि')} {formatDate(prescription.prescribedAt || prescription.createdAt)}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onUpdate && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#062E6F] hover:bg-[#042050] text-white rounded-xl text-xs md:text-sm font-bold transition-colors min-h-[44px]"
              >
                {t('Edit', 'संपादित करें')}
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title={t('Delete Prescription', 'प्रिस्क्रिप्शन हटाएं')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs md:text-sm font-bold transition-colors min-h-[44px]"
            >
              {t('Close', 'बंद करें')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}