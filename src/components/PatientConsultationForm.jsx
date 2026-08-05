import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle, Upload, Lock, User, AlertTriangle,
  Stethoscope, FileText, ChevronRight, Check, Clock, Calendar
} from 'lucide-react';
import VoiceInput from './VoiceInput';
import { getApprovedDoctors, createConsultation } from '../services/api';


export default function PatientConsultationForm({ lang = 'en', onSymptomSubmit, socket }) {
  const t = (en, hi) => lang === 'en' ? en : hi;

  // ── Doctor Hierarchy & Data (Now loaded from backend) ──
  const [doctorsData, setDoctorsData] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState(null);

  // State
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Will be set after doctors load
  const [currentStep, setCurrentStep] = useState(1);

  // Load approved doctors from backend on mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setDoctorsLoading(true);
        setDoctorsError(null);
        const doctors = await getApprovedDoctors();
        setDoctorsData(doctors || []);
        
        // Auto-select Admin if available (first doctor)
        if (doctors && doctors.length > 0) {
          const adminDoc = doctors.find(d => d.role === 'Admin') || doctors[0];
          setSelectedDoctor(adminDoc);
        }
      } catch (error) {
        console.error('Failed to load doctors:', error);
        setDoctorsError(t('Failed to load doctors. Please try again.', 'डॉक्टरों को लोड करने में विफल। कृपया पुनः प्रयास करें।'));
      } finally {
        setDoctorsLoading(false);
      }
    };
    
    loadDoctors();
  }, []);

  // Form Fields
  const [patientName, setPatientName] = useState('Amrit Chand');
  const [patientAge, setPatientAge] = useState('28');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientWeight, setPatientWeight] = useState('');
  const [symptomsDesc, setSymptomsDesc] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [symptomCounter, setSymptomCounter] = useState(1); // Track symptom numbering

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Filter doctors - no specialty filter, just show all
  const filteredDoctors = doctorsData.filter(doc => doc.role !== 'Admin'); // Admin pinned separately

  // Separate by role type (map database roles to display categories)
  const coreDoctors = filteredDoctors.filter(doc => doc.role === 'Core Team');
  const externalDoctors = filteredDoctors.filter(doc => doc.role === 'External Doctor');
  
  // Get admin doctor for pinned section
  const adminDoctor = doctorsData.find(doc => doc.role === 'Admin');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Handle voice input with auto-numbering
  const handleVoiceSymptomInput = (text) => {
    if (!text || !text.trim()) return;
    
    setSymptomsDesc(prev => {
      // If empty, start with number 1
      if (!prev || prev.trim() === '') {
        setSymptomCounter(2); // Next will be 2
        return `1. ${text.trim()}`;
      }
      
      // If there's existing text, add new line and next number
      const nextNumber = symptomCounter;
      setSymptomCounter(nextNumber + 1);
      
      // Add newline if previous text doesn't end with one
      const separator = prev.endsWith('\n') ? '' : '\n';
      return `${prev}${separator}${nextNumber}. ${text.trim()}`;
    });
  };

  // Handle manual textarea changes - update counter based on content
  const handleSymptomsChange = (e) => {
    const newValue = e.target.value;
    setSymptomsDesc(newValue);
    
    // Count existing numbered items to keep counter in sync
    // Match patterns like "1. ", "2. ", "3. " etc at the start of lines
    const numberedLines = newValue.match(/^\d+\.\s/gm);
    if (numberedLines) {
      // Set counter to one more than the highest number found
      const numbers = numberedLines.map(line => parseInt(line.match(/\d+/)[0]));
      const maxNumber = Math.max(...numbers);
      setSymptomCounter(maxNumber + 1);
    } else if (!newValue.trim()) {
      // If textarea is empty, reset counter
      setSymptomCounter(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedDoctor) {
      setValidationError(t('Please select a doctor in Step 1.', 'कृपया चरण 1 में एक डॉक्टर चुनें।'));
      return;
    }

    if (!patientName.trim()) {
      setValidationError(t('Please enter your name.', 'कृपया अपना नाम दर्ज करें।'));
      return;
    }

    if (!symptomsDesc.trim()) {
      setValidationError(t('Please describe your symptoms.', 'कृपया अपने लक्षणों का विवरण दें।'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user from local storage to link patientId
      const userStr = localStorage.getItem('homeo_user');
      let patientId = null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          patientId = user._id || user.id;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // Prepare consultation data
      const consultationData = {
        patientId, // Added patientId here
        patientName,
        patientAge,
        patientGender,
        patientWeight,
        mainConcern: 'General Consultation', // Default value
        severity: 'Moderate', // Default value
        duration: 'Not specified', // Default value
        symptomsDescription: symptomsDesc,
        assignedDoctorId: selectedDoctor._id || selectedDoctor.id,
        assignedDoctorName: selectedDoctor.name,
        language: lang,
        // File upload would be handled here if implemented
        attachmentUrl: '',
        attachmentName: uploadedFile?.name || '',
        attachmentType: uploadedFile?.type || ''
      };

      // Parse numbered symptoms (e.g., "1. fever\n2. headache") into array
      const parseNumberedSymptoms = (text) => {
        if (!text || !text.trim()) return [];
        
        // Split by newlines and extract numbered items
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const symptoms = [];
        
        for (const line of lines) {
          // Match patterns like "1. symptom" or "1) symptom" or just "symptom"
          const match = line.match(/^\d+[\.\)]\s*(.+)$/);
          if (match) {
            // Extract symptom text after the number
            symptoms.push(match[1].trim());
          } else if (line) {
            // If no number, still add it as a symptom
            symptoms.push(line);
          }
        }
        
        return symptoms.filter(s => s); // Remove empty strings
      };

      const parsedSymptoms = parseNumberedSymptoms(symptomsDesc);
      
      // Add parsed symptoms to consultation data
      consultationData.symptoms = parsedSymptoms;

      // Submit to backend
      const response = await createConsultation(consultationData);
      
      // If backend submission successful, also emit socket event (for real-time notification)
      // Note: Backend already emits, but we can emit from client too for immediate feedback
      if (socket && socket.connected) {
        socket.emit('submit_patient_symptoms', {
          id: response.consultation._id,
          consultationId: response.consultation._id,
          patientId, // Passed actual patientId instead of null
          patientName,
          age: patientAge,
          gender: patientGender,
          weight: patientWeight,
          assignedDoctorId: selectedDoctor._id || selectedDoctor.id,
          assignedDoctorName: selectedDoctor.name,
          symptoms: parsedSymptoms.length > 0 ? parsedSymptoms : [symptomsDesc], // Use parsed symptoms or fallback to full text
          fullSymptomText: symptomsDesc,
          status: 'Pending',
          submittedAt: new Date().toISOString(),
          language: lang
        });
      }

      setIsSubmitting(false);
      setIsSubmitted(true);

      // Call parent callback if provided (for backward compatibility with localStorage queue)
      if (onSymptomSubmit) {
        onSymptomSubmit({
          id: response.consultation._id,
          consultationId: response.consultation._id,
          patientName,
          age: patientAge,
          gender: patientGender,
          weight: patientWeight,
          assignedDoctorId: selectedDoctor._id || selectedDoctor.id,
          assignedDoctorName: selectedDoctor.name,
          symptoms: parsedSymptoms.length > 0 ? parsedSymptoms : [symptomsDesc], // Use parsed symptoms or fallback to full text
          fullSymptomText: symptomsDesc,
          status: 'Pending',
          submittedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to submit consultation:', error);
      setValidationError(t(
        'Failed to submit consultation. Please try again.',
        'परामर्श सबमिट करने में विफल। कृपया पुनः प्रयास करें।'
      ));
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: t('Choose Doctor', 'डॉक्टर चुनें') },
    { id: 2, label: t('Describe Symptoms', 'लक्षण बताएं') }
  ];

  const renderTimeline = () => {
    const currentStepLabel = steps.find(s => s.id === currentStep)?.label;
    return (
      <div className="mb-4 md:mb-6">
        {/* Mobile: Compact Progress Pill */}
        <div className="md:hidden flex items-center justify-center">
          <div className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600">
              {t('Step', 'चरण')} {currentStep}/2:
            </span>
            <span className="text-[11px] font-bold text-blue-600">{currentStepLabel}</span>
          </div>
        </div>

        {/* Desktop: Full Timeline with Navigation */}
        <div className="hidden md:flex items-center justify-center gap-2 border-b border-slate-100 pb-4">
          {steps.map((s, idx) => {
            const active = currentStep === s.id;
            const done = currentStep > s.id;
            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => done && setCurrentStep(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${active ? 'bg-[#062E6F] text-white shadow-sm' :
                      done ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 cursor-pointer' :
                        'text-slate-400 bg-slate-50 cursor-default'
                    }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${active ? 'bg-white/20' : done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}>
                    {s.id}
                  </span>
                  {s.label}
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight className={`h-4 w-4 shrink-0 mx-2 ${done ? 'text-emerald-500' : 'text-slate-300'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 space-y-6 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            {t('Consultation Sent Successfully!', 'परामर्श सफलतापूर्वक भेजा गया!')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t('Your medical concern has been securely transmitted to ', 'आपकी समस्या को सुरक्षित रूप से भेज दिया गया है ')}
            <strong>{selectedDoctor?.name}</strong> ({selectedDoctor?.roleLabel}).
          </p>
          <p className="text-xs text-slate-400">
            {t('Expect a response within 30-60 minutes.', '30-60 मिनट के भीतर उत्तर की उम्मीद है।')}
          </p>
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setSymptomsDesc('');
              setPatientWeight('');
              setPatientGender('Male');
              setSymptomCounter(1); // Reset counter
              setCurrentStep(1);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {t('Send Another Consultation', 'एक और परामर्श भेजें')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3 md:space-y-4 p-1 sm:p-4 text-slate-800">

      {/* STEP TIMELINE */}
      {renderTimeline()}

      {/* STEP 1: CHOOSE A DOCTOR */}
      {currentStep === 1 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 pb-24 md:pb-6 space-y-4 md:space-y-6 shadow-sm">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-1.5">
              {t('Step 1 of 2', 'चरण 1/2')}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">{t('Choose a doctor', 'डॉक्टर चुनें')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('Select your preferred consultant', 'अपनी पसंद के विशेषज्ञ डॉक्टर का चयन करें')}
            </p>
          </div>

          {/* Loading State */}
          {doctorsLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-600">{t('Loading doctors...', 'डॉक्टरों को लोड किया जा रहा है...')}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {doctorsError && !doctorsLoading && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
              <span>{doctorsError}</span>
            </div>
          )}

          {/* Doctors List */}
          {!doctorsLoading && !doctorsError && doctorsData.length > 0 && (
            <>
              {/* Selected Doctor Banner */}
              {selectedDoctor && (
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${selectedDoctor.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                      {selectedDoctor.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">{selectedDoctor.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap ${selectedDoctor.role === 'Admin' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            selectedDoctor.role === 'Core' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                          {selectedDoctor.roleLabel}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 truncate">{selectedDoctor.specialty} • {selectedDoctor.availability}</p>
                    </div>
                  </div>
                  <span className="text-[10px] md:text-xs text-blue-700 font-semibold flex items-center gap-1 shrink-0">
                    <Check className="h-3 w-3 md:h-4 md:w-4 text-blue-600" /> <span className="hidden sm:inline">{t('Selected', 'चयनित')}</span>
                  </span>
                </div>
              )}

          {/* PINNED ADMIN CARD */}
          {adminDoctor && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('Head of Practice', 'प्रमुख चिकित्सक')}</p>
              <div
                onClick={() => setSelectedDoctor(adminDoctor)}
                className={`p-3 md:p-4 rounded-xl border-2 transition-all cursor-pointer bg-amber-50/40 ${
                  selectedDoctor?.id === adminDoctor.id || selectedDoctor?._id === adminDoctor._id
                    ? 'border-amber-500 bg-amber-50/80' 
                    : 'border-amber-200 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full ${adminDoctor.avatarColor} text-white flex items-center justify-center font-bold text-xs md:text-sm shrink-0`}>
                      {adminDoctor.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-xs md:text-sm font-bold text-slate-900 truncate">{adminDoctor.name}</h3>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {adminDoctor.roleLabel}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-600 mt-0.5 truncate">{adminDoctor.specialty} Specialty</p>
                    </div>
                  </div>
                  <span className={`text-[10px] md:text-[11px] font-semibold px-2 py-1 rounded-full shrink-0 whitespace-nowrap ${
                    adminDoctor.availType === 'green' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    ● {adminDoctor.availability}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CORE TEAM DOCTORS */}
          {coreDoctors.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{t('Core Team', 'कोर टीम')}</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">{t('In-House', 'इन-हाउस')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {coreDoctors.map(doc => {
                  const isSelected = selectedDoctor?.id === doc.id || selectedDoctor?._id === doc._id || selectedDoctor?._id === doc.id;
                  return (
                    <div
                      key={doc.id || doc._id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-3 md:p-4 rounded-xl border transition-all cursor-pointer bg-white ${isSelected ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${doc.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                            {doc.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h4>
                              <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">Core</span>
                            </div>
                            <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 truncate">{doc.specialty}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] md:text-[10px] font-medium px-1.5 md:px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${doc.availType === 'green' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {doc.availability}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EXTERNAL TEAM DOCTORS */}
          {externalDoctors.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{t('External Team', 'एक्सटर्नल टीम')}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">{t('Consulting', 'विजिटिंग')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {externalDoctors.map(doc => {
                  const isSelected = selectedDoctor?.id === doc.id || selectedDoctor?._id === doc._id || selectedDoctor?._id === doc.id;
                  return (
                    <div
                      key={doc.id || doc._id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-3 md:p-4 rounded-xl border transition-all cursor-pointer bg-white ${isSelected ? 'border-slate-800 ring-2 ring-slate-800/10' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${doc.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                            {doc.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h4>
                              <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">External</span>
                            </div>
                            <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 truncate">{doc.specialty}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] md:text-[10px] font-medium px-1.5 md:px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${doc.availType === 'green' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {doc.availability}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NEXT STEP BUTTON */}
          <div className="flex justify-end pt-4 border-t border-slate-100 md:static md:p-0 md:bg-transparent md:border-t md:shadow-none fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-30">
            <button
              type="button"
              disabled={!selectedDoctor}
              onClick={() => setCurrentStep(2)}
              className="bg-[#062E6F] hover:bg-[#042050] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full md:w-auto min-h-[44px]"
            >
              <span>{t('Next: Describe Symptoms', 'अगला: लक्षण बताएं')}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          </>
          )}

          {/* No doctors available */}
          {!doctorsLoading && !doctorsError && doctorsData.length === 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <p className="text-sm text-slate-600">{t('No doctors available at the moment.', 'इस समय कोई डॉक्टर उपलब्ध नहीं हैं।')}</p>
            </div>
          )}
        </section>
      )}

      {/* STEP 2: DESCRIBE YOUR CONCERN */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 pb-24 md:pb-6 space-y-4 md:space-y-6 shadow-sm">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase bg-emerald-50 px-2.5 py-1 rounded-md inline-block mb-1.5">
              {t('Step 2 of 2', 'चरण 2/2')}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">{t('Describe your concern', 'अपनी समस्या बताएं')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('All details are encrypted and confidential', 'सभी जानकारी गोपनीय और सुरक्षित रहेगी')}
            </p>
          </div>

          {/* Confirmation banner of selected doctor */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Stethoscope className="h-4 w-4 md:h-5 md:w-5 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-slate-500">{t('Assigned Doctor:', 'असाइन किए गए डॉक्टर:')}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 truncate">{selectedDoctor.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap ${selectedDoctor.role === 'Admin' ? 'bg-amber-100 text-amber-800' :
                      selectedDoctor.role === 'Core' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                    {selectedDoctor.roleLabel}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[10px] md:text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg shrink-0 hidden sm:block">
              {selectedDoctor.specialty}
            </span>
          </div>

          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3 md:space-y-4">

            {/* Name and Age side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t('Patient Full Name', 'मरीज का पूरा नाम')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t('Age', 'उम्र')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  required
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Gender and Weight side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t('Gender', 'लिंग')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  required
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white font-semibold"
                >
                  <option value="Male">{t('Male', 'पुरुष')}</option>
                  <option value="Female">{t('Female', 'महिला')}</option>
                  <option value="Other">{t('Other', 'अन्य')}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t('Weight (kg)', 'वजन (किग्रा)')}
                </label>
                <input
                  type="number"
                  value={patientWeight}
                  onChange={(e) => setPatientWeight(e.target.value)}
                  placeholder="e.g. 70"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Main Symptoms Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-bold text-slate-700">
                  {t('Detailed Symptoms', 'लक्षणों का विवरण')} <span className="text-rose-500">*</span>
                </label>
                <VoiceInput
                  defaultLang={lang}
                  onResult={handleVoiceSymptomInput}
                />
              </div>
              <textarea
                rows={6}
                value={symptomsDesc}
                onChange={handleSymptomsChange}
                placeholder={t(
                  'Describe symptoms: fever, pain, duration, severity, triggers...',
                  'लक्षणों का वर्णन करें: बुखार, दर्द, अवधि, गंभीरता, कारण...'
                )}
                required
                className="w-full text-xs border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white leading-relaxed"
              />
            </div>



            {/* File Upload Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t('Attach Reports / Photos (Optional)', 'रिपोर्ट / फोटो संलग्न करें')}
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-4 md:p-6 text-center bg-slate-50/50 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="h-5 w-5 md:h-6 md:w-6 text-slate-400 mx-auto mb-1.5" />
                {uploadedFile ? (
                  <p className="text-xs font-bold text-blue-600 truncate px-2">{uploadedFile.name}</p>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-700">
                      {t('Tap to upload', 'अपलोड करें')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{t('Photos or PDFs', 'फोटो या PDF')}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* BACK AND SUBMIT BUTTONS */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 md:static md:p-0 md:bg-transparent md:border-t md:shadow-none fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-30">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="ghost-btn border border-slate-200 text-xs px-3 md:px-4 py-2.5 shadow-sm rounded-lg min-h-[44px] font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center"
            >
              ← {t('Back', 'वापस')}
            </button>

            <div className="flex items-center gap-2 md:gap-4 ml-auto">
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{t('Encrypted', 'सुरक्षित')}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 md:px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('Sending...', 'भेजा जा रहा है...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('Send to doctor', 'डॉक्टर को भेजें')}</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
