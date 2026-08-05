import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, History, FileText, Calendar, AlertCircle, 
  Download, CheckCircle, Stethoscope, Info, X, Mic, ChevronDown,
  Eye, Loader2
} from 'lucide-react';
import VoiceInput from './VoiceInput';
import PrescriptionModal from './PrescriptionModal';
import PatientConsultationForm from './PatientConsultationForm';
import { io } from 'socket.io-client';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';
import { getConsultations } from '../services/api';

export default function PatientDashboardTab({ currentUser = null, lang = 'en', navigateToTab, initialSubTab = 'dashboard', onSymptomSubmit, doctors = [], userRole = 'Patient' }) {
  const t = (en, hi) => lang === 'en' ? en : hi;
  const [subTab, setSubTab] = useState(initialSubTab);

  React.useEffect(() => { setSubTab(initialSubTab); }, [initialSubTab]);

  // Socket connection for real-time symptom submission
  const [socket, setSocket] = React.useState(null);

  React.useEffect(() => {
    const newSocket = io('https://homeoai-backend-83yt.onrender.com', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token: localStorage.getItem('homeo_auth_token') },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    newSocket.on('connect', () => {
      console.log('✅ Patient Socket.IO connected:', newSocket.id);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('❌ Patient Socket.IO connection error:', error);
    });
    
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // Simplified symptom form - single text area for all symptoms
  const [symptomText, setSymptomText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Doctor selection
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors.length > 0 ? doctors[0].id : null);

  // Prescription modal state
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Symptom history state
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDateFilter, setHistoryDateFilter] = useState('all'); // 'all', '7days', '30days'
  
  // Fetch symptom history when switching to history tab
  useEffect(() => {
    if (subTab === 'history' && currentUser) {
      loadSymptomHistory();
    }
  }, [subTab, currentUser]);
  
  const loadSymptomHistory = async () => {
    try {
      setHistoryLoading(true);
      const result = await getConsultations({ limit: 50 });
      setSymptomHistory(result.consultations || []);
    } catch (error) {
      console.error('Failed to load symptom history:', error);
      setSymptomHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredHistory = React.useMemo(() => {
    if (historyDateFilter === 'all') return symptomHistory;
    
    const now = new Date();
    return symptomHistory.filter(c => {
      const date = new Date(c.createdAt || c.submittedAt);
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (historyDateFilter === '7days') return diffDays <= 7;
      if (historyDateFilter === '30days') return diffDays <= 30;
      return true;
    });
  }, [symptomHistory, historyDateFilter]);

  const [cases, setCases] = useState([
    { id: 'CASE-402', date: '19 Jun 2026', symptoms: 'Anxiety – worries about health, about own health', modalities: 'Aggravation: Minor symptoms | Amelioration: Reassurance', status: 'Analyzed & Remedy Prescribed', remedy: 'Arsenicum album 30C', doctor: 'Dr. Jp Nautiyal' },
    { id: 'CASE-208', date: '02 May 2026', symptoms: 'Acid reflux after heavy meals, bloating', modalities: 'Aggravation: Hot drinks | Amelioration: Cold water', status: 'Completed', remedy: 'Carbo vegetabilis 200C', doctor: 'Dr. Rahul Sharma' }
  ]);

  const prescriptions = [
    { 
      id: 'RX-9820', 
      date: '19 Jun 2026', 
      doctor: 'Dr. Jp Nautiyal',
      patientName: 'Amrit Chand',
      patientAge: 28,
      patientGender: 'Male',
      patientContact: '+91 98453-21980',
      remedy: 'Arsenicum album',
      potency: '30C',
      dosage: '4 globules, twice daily',
      duration: '7 days',
      instructions: 'Take on empty stomach',
      doctorName: 'Dr. Jp Nautiyal',
      doctorClinic: 'Nautiyal Homeopathic Clinic',
      doctorContact: '+91 98453-21980',
      prescribedAt: '2026-06-19T10:30:00.000Z',
      followUpDate: '2026-06-26T10:30:00.000Z',
      notes: 'Avoid camphor, strong coffee, or raw onion within 30 minutes of taking remedy.',
      symptoms: [
        'Anxiety – worries about health, about own health',
        'Restlessness, cannot sit still',
        'Fear of death, especially at night',
        'Weakness and exhaustion',
        'Digestive issues after eating'
      ],
      repertoryName: 'Kent Repertory',
      remedies: [
        { name: 'Arsenicum album 30C', dosage: '4 globules, twice daily', duration: '7 days', instruction: 'Take on empty stomach' },
        { name: 'Calcarea carbonica 200C', dosage: '4 globules, once a week (Sundays)', duration: '4 weeks', instruction: 'Early morning' }
      ]
    }
  ];

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };


  const handleSubmitSymptom = (e) => {
    e.preventDefault();
    const trimmedText = symptomText.trim();
    if (!trimmedText) return;
    setIsSubmitting(true);

    const assignedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0] || null;
    const assignedDoctorName = assignedDoctor ? assignedDoctor.name : 'Dr. Jp Nautiyal';

    setTimeout(() => {
      const submissionData = {
        id: `SQ-${Date.now()}`,
        patientId: currentUser?._id || currentUser?.id || 10,
        patientName: currentUser?.name || 'Patient',
        age: currentUser?.age || null,
        submittedAt: new Date().toLocaleString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          day: '2-digit', 
          month: 'short',
          year: 'numeric'
        }),
        symptoms: [trimmedText], // Store full text as single symptom
        fullSymptomText: trimmedText, // Store complete text for doctor analysis
        language: lang,
        status: 'Pending',
        assignedDoctorId: assignedDoctor?.id || null,
        assignedDoctorName,
      };

      const newCase = {
        id: `CASE-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        symptoms: trimmedText.substring(0, 150) + (trimmedText.length > 150 ? '...' : ''),
        modalities: 'To be analyzed by doctor',
        status: 'Awaiting Analysis',
        remedy: 'Pending Doctor Review',
        doctor: assignedDoctorName
      };
      setCases([newCase, ...cases]);

      // Push to shared symptom queue in App.jsx
      if (onSymptomSubmit) {
        onSymptomSubmit(submissionData);
      }

      // ✅ EMIT TO BACKEND VIA SOCKET.IO FOR REAL-TIME NOTIFICATIONS
      if (socket && socket.connected) {
        console.log('📡 Emitting patient symptoms to backend...', submissionData);
        socket.emit('submit_patient_symptoms', submissionData);
      } else {
        console.warn('⚠️ Socket not connected, symptom submission not sent to backend');
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSymptomText('');
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Patient inner tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'dashboard',     name: t('🏠 Dashboard',            '🏠 डैशबोर्ड') },
          { id: 'consultation',  name: t('🩺 Doctor Consultation',  '🩺 डॉक्टर परामर्श') },
          { id: 'history',       name: t('📜 Symptoms History',     '📜 लक्षण इतिहास') },
          { id: 'prescriptions', name: t('💊 Prescriptions',        '💊 नुस्खे') }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              subTab === tab.id ? 'bg-[#062E6F] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {tab.name}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: PATIENT DASHBOARD */}
      {subTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#062E6F] to-[#042050] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="overline text-white/80 font-bold tracking-wider">{t('PATIENT DASHBOARD', 'मरीज डैशबोर्ड')}</span>
              <h2 className="text-2xl font-bold">
                {lang === 'en' 
                  ? `Welcome back, ${currentUser?.name || 'Patient'}!` 
                  : `स्वागत है, ${currentUser?.name || 'मरीज'}!`}
              </h2>
              <p className="text-orange-50 text-xs md:text-sm">
                {t("Your wellness is our concern. Manage your active treatments and report new symptoms.", "आपका स्वास्थ्य हमारी चिंता है। अपने सक्रिय उपचारों को प्रबंधित करें और नए लक्षणों की रिपोर्ट भेजें।")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="surface p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Stethoscope className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Consulting Doctor', 'परामर्शदाता डॉक्टर')}</p>
                <p className="text-sm font-bold text-slate-800 mt-1">Dr. Jp Nautiyal</p>
                <span className="text-[10px] text-emerald-600 font-medium">Chief Director</span>
              </div>
            </div>
            <div className="surface p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><FileText className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Active Remedies', 'सक्रिय दवाएं')}</p>
                <p className="text-sm font-bold text-slate-800 mt-1">2 Prescribed</p>
                <button onClick={() => setSubTab('prescriptions')} className="text-[10px] text-[#062E6F] hover:underline block font-semibold mt-0.5">{t('View details', 'विवरण देखें')}</button>
              </div>
            </div>
            <div className="surface p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-[#062E6F] rounded-xl"><Calendar className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Next Follow-up', 'अगला अपॉइंटमेंट')}</p>
                <p className="text-sm font-bold text-slate-800 mt-1">24 Jun 2026</p>
                <span className="text-[10px] text-slate-400">10:00 AM (Online)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="surface p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#062E6F]" />
                  {t('Homeopathy Dosage Guidelines', 'होम्योपैथी खुराक दिशानिर्देश')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <p className="font-bold text-slate-800">⏳ {t('The 30-Minute Rule', '30-मिनट का नियम')}</p>
                    <p className="leading-relaxed">{t('Do not eat or drink anything 30 minutes before and after taking the medicine.', 'दवा लेने से 30 मिनट पहले और बाद में कुछ भी खाएं या पिएं नहीं।')}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <p className="font-bold text-slate-800">🚫 {t('Dietary Restrictions', 'आहार निषेध')}</p>
                    <p className="leading-relaxed">{t('Avoid raw onions, garlic, camphor, mint, and strong coffee.', 'कच्चा प्याज, लहसुन, कपूर, पुदीना और कड़क कॉफी से बचें।')}</p>
                  </div>
                </div>
              </div>

              <div className="surface p-5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">{t('Active Symptom Submissions', 'सक्रिय लक्षण रिपोर्ट')}</h3>
                <div className="divide-y divide-slate-100">
                  {cases.map((c) => (
                    <div key={c.id} className="py-3.5 flex items-start gap-4 first:pt-0 last:pb-0">
                      <div className={`p-2 rounded-lg shrink-0 ${c.status.includes('Awaiting') ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <HeartPulse className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-slate-800">{c.symptoms}</p>
                          <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">{c.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 italic">{c.modalities}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.status.includes('Awaiting') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{c.status}</span>
                          <span className="text-[10px] text-slate-400">Prescription: <strong className="text-slate-600">{c.remedy}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="surface p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('Quick Actions', 'त्वरित कार्रवाइयां')}</h3>
                <button onClick={() => setSubTab('consultation')} className="w-full terracotta-btn justify-center text-xs py-2.5">
                  📝 {t('Report New Symptom', 'नया लक्षण रिपोर्ट करें')}
                </button>
                <button onClick={() => navigateToTab('Chat')} className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer">
                  💬 {t('Chat with Doctor', 'डॉक्टर से बात करें')}
                </button>
                <div className="border-t border-slate-100 pt-4 text-center">
                  <p className="text-[10px] text-slate-400">{t('Emergency Contact', 'आपातकालीन संपर्क')}</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">+91 98453-21980</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: DOCTOR CONSULTATION (2-Step Multi-Role Form) */}
      {subTab === 'consultation' && (
        <PatientConsultationForm lang={lang} onSymptomSubmit={onSymptomSubmit} socket={socket} />
      )}

      {/* SUBTAB 2: SUBMIT SYMPTOM — Fallback to Doctor Consultation */}
      {subTab === 'submit' && (
        <PatientConsultationForm lang={lang} onSymptomSubmit={onSymptomSubmit} socket={socket} />
      )}

      {/* SUBTAB 3: SYMPTOMS HISTORY */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="surface p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <History className="h-4 w-4 text-[#062E6F]" />
                {t('Your Symptoms History', 'आपका लक्षण इतिहास')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('Symptoms you submitted to doctors for analysis', 'विश्लेषण के लिए डॉक्टरों को प्रस्तुत किए गए लक्षण')}
              </p>
            </div>
            
            {/* DATE FILTER */}
            <select
              value={historyDateFilter}
              onChange={(e) => setHistoryDateFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] font-semibold text-slate-700 min-w-[140px]"
            >
              <option value="all">{t('All Time', 'सभी समय')}</option>
              <option value="7days">{t('Last 7 Days', 'पिछले 7 दिन')}</option>
              <option value="30days">{t('Last 30 Days', 'पिछले 30 दिन')}</option>
            </select>
          </div>
          
          {historyLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 text-[#062E6F] animate-spin" />
              <p className="text-xs text-slate-500 font-medium">
                {t('Loading symptoms history...', 'लक्षण इतिहास लोड हो रहा है...')}
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="surface p-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                {t('No symptoms submitted yet', 'अभी तक कोई लक्षण जमा नहीं किया गया')}
              </p>
              <button
                onClick={() => setSubTab('dashboard')}
                className="mt-4 px-4 py-2 bg-[#062E6F] hover:bg-[#042050] text-white text-xs rounded-lg font-semibold transition-colors"
              >
                {t('Submit Symptoms', 'लक्षण जमा करें')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredHistory.map((consultation) => (
                <div key={consultation._id} className="surface p-5 space-y-4 border border-slate-100 hover:border-[#062E6F]/30 transition-colors">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#062E6F] bg-blue-50 px-2.5 py-1 rounded-full">
                          <Stethoscope className="h-3 w-3" />
                          {consultation.assignedDoctorId?.name || consultation.assignedDoctorName || consultation.doctorName || t('Doctor', 'डॉक्टर')}
                          {consultation.assignedDoctorId?.role && (
                            <span className="font-normal text-[#062E6F]/70 text-[10px] ml-1 lowercase">
                              from {consultation.assignedDoctorId.role.toLowerCase()}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t('ID:', 'ID:')} {consultation._id?.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {t('Status:', 'स्थिति:')} <span className="font-semibold text-slate-700">{consultation.status || 'Pending'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {new Date(consultation.createdAt).toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(consultation.createdAt).toLocaleTimeString(lang === 'en' ? 'en-IN' : 'hi-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Symptoms */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
                      {t('Symptoms Submitted:', 'प्रस्तुत लक्षण:')}
                    </h4>
                    <div className="space-y-1.5">
                      {consultation.symptoms && consultation.symptoms.length > 0 ? (
                        consultation.symptoms.map((symptom, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-slate-700 leading-relaxed">{symptom}</p>
                          </div>
                        ))
                      ) : consultation.symptomsDescription ? (
                        <p className="text-xs text-slate-700 leading-relaxed">{consultation.symptomsDescription}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">{t('No symptoms recorded', 'कोई लक्षण दर्ज नहीं')}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
                      consultation.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : consultation.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {consultation.status === 'Completed' 
                        ? t('✓ Completed', '✓ पूर्ण')
                        : consultation.status === 'In Progress'
                        ? t('⏳ In Progress', '⏳ प्रगति में')
                        : t('⏳ Pending', '⏳ लंबित')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: PRESCRIPTIONS */}
      {subTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="surface p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#062E6F]" />
              {t('Prescribed Homeopathic Remedies', 'अनुशंसित होम्योपैथिक दवाएं')}
            </h3>
          </div>
          {prescriptions.map((rx) => (
            <div key={rx.id} className="surface p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{rx.doctor}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('Date:', 'तिथि:')} {rx.date} • ID: {rx.id}</p>
                </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewPrescription(rx)}
                      className="flex items-center gap-1.5 bg-[#062E6F] hover:bg-[#042050] text-white text-xs px-3.5 py-2 rounded-lg font-semibold cursor-pointer transition-colors min-h-[38px]"
                    >
                      <Eye className="h-3.5 w-3.5" /> {t('View Prescription', 'प्रिस्क्रिप्शन देखें')}
                    </button>
                  </div>
              </div>
              <div className="space-y-3">
                {rx.remedies.map((rem, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-[#062E6F]">{rem.name}</span>
                      <span className="text-[10px] bg-white border border-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">{rem.duration}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400 block">{t('Dosage:', 'खुराक:')}</span><span className="font-semibold text-slate-700">{rem.dosage}</span></div>
                      <div><span className="text-slate-400 block">{t('Instructions:', 'निर्देश:')}</span><span className="font-semibold text-slate-700">{rem.instruction}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50/50 border border-amber-100/80 rounded-xl p-4 flex items-start gap-2.5 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div><span className="font-bold block">{t('Special Diet Notes:', 'विशेष आहार निर्देश:')}</span><span className="leading-relaxed mt-0.5 block">{rx.notes}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescription Modal */}
      <PrescriptionModal
        currentUser={currentUser}
        prescription={selectedPrescription}
        isOpen={showPrescriptionModal}
        onClose={() => {
          setShowPrescriptionModal(false);
          setSelectedPrescription(null);
        }}
        lang={lang}
      />
    </div>
  );
}
