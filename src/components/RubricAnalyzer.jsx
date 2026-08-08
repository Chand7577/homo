import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Mic, Brain, BarChart2, FileText, ChevronRight, AlertCircle, Loader2, CheckCircle2, Upload, X, ChevronDown, Search, RefreshCw, Square, Sparkles } from 'lucide-react';
import VoiceInput from './VoiceInput';
import RepertoryChart from './RepertoryChart';
import MedicineDistribution from './MedicineDistribution';
import PrescriptionForm from './PrescriptionForm';
import { getRepertories, runAnalysis, createRepertory, uploadRepertoryExcel, updateRubric, getAllUsers, getPatients } from '../services/api';

// Mobile-optimized VoiceInput component
const VoiceInputMobile = ({ lang, onResult }) => {
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState(lang); // Allow per-field language switching
  
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = () => {
    if (!isSupported) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      if (text) onResult(text);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.start();
    setListening(true);
  };

  const toggleLanguage = () => {
    setVoiceLang(prev => prev === 'en' ? 'hi' : 'en');
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-0.5">
      {/* Language toggle - only show when not recording */}
      {!listening && (
        <button
          type="button"
          onClick={toggleLanguage}
          className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center transition-colors"
          title={`Voice: ${voiceLang === 'en' ? 'English' : 'हिंदी'}`}
        >
          {voiceLang === 'en' ? 'EN' : 'हि'}
        </button>
      )}
      
      {/* Mic button */}
      <button
        type="button"
        onClick={listening ? () => setListening(false) : startListening}
        className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
          listening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-[#062E6F]/10 text-[#062E6F] hover:bg-[#062E6F]/20'
        }`}
        aria-label={listening ? 'Stop recording' : `Voice input (${voiceLang === 'en' ? 'English' : 'हिंदी'})`}
      >
        {listening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
};

const STEPS = [
  { id: 1, label: 'Select Repertory',    labelHi: 'रेपरटॉरी चुनें',    icon: BookOpen },
  { id: 2, label: 'Enter Symptoms',      labelHi: 'लक्षण दर्ज करें',    icon: Mic },
  { id: 3, label: 'AI Analysis',         labelHi: 'AI विश्लेषण',        icon: Brain },
  { id: 4, label: 'Repertory Chart',     labelHi: 'रेपरटॉरी चार्ट',    icon: BarChart2 },
  { id: 5, label: 'Prescription',        labelHi: 'पर्चा',              icon: FileText },
];

const EMPTY_SYMPTOMS = ['', '', '', '', '', '', '', '', ''];

export default function RubricAnalyzer({ currentUser = null, lang = 'en', patientSubmission = null, loadedAnalysis = null, onAnalysisComplete, onPrescriptionSaved }) {
  // Step control
  const [step, setStep] = useState(1);

  // Step 1: Repertory
  const [repertories, setRepertories]     = useState([]);
  const [selectedRep, setSelectedRep]     = useState(null);
  const [loadingReps, setLoadingReps]     = useState(false);
  const [repError, setRepError]           = useState('');
  const [repSearch, setRepSearch]         = useState('');
  // Create / upload repertory
  const [showCreate, setShowCreate]       = useState(false);
  const [newRepName, setNewRepName]       = useState('');
  const [newRepAuthor, setNewRepAuthor]   = useState('');
  const [creating, setCreating]           = useState(false);
  const [showAdvanced, setShowAdvanced]   = useState(false);
  const [uploadFile, setUploadFile]       = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadResult, setUploadResult]  = useState(null);

  // Step 2: Symptoms
  const [symptoms, setSymptoms] = useState(EMPTY_SYMPTOMS);
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientContact, setPatientContact] = useState(''); // stored for WhatsApp
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientWeight, setPatientWeight] = useState('');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [hasPromptedPatient, setHasPromptedPatient] = useState(false);
  // Patient picker inside modal
  const [modalTab, setModalTab] = useState('registered'); // 'registered' | 'custom'
  const [modalPatients, setModalPatients] = useState([]);
  const [modalPatientSearch, setModalPatientSearch] = useState('');
  const [loadingModalPatients, setLoadingModalPatients] = useState(false);

  // Step 3: Analysis
  const [analyzing, setAnalyzing]         = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Step 3: Mobile tab state for repertory chart vs medicine distribution
  const [mobileTab, setMobileTab] = useState('chart'); // 'chart' | 'distribution'

  // Step 4: Prescription
  const [selectedMedicine, setSelectedMedicine] = useState('');
  // Multi-select: list of medicine names chosen from the distribution table
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  // Right pane state (Master-Detail)
  const [selectedRubricId, setSelectedRubricId] = useState(null);
  const [activeRightTab, setActiveRightTab] = useState('overall'); // 'overall' | 'details'

  const isEn = lang === 'en';
  const t = (en, hi) => isEn ? en : hi;

  // Load repertories with retry logic and better error handling
  useEffect(() => {
    const loadRepertoriesWithRetry = async (retryCount = 0) => {
      const maxRetries = 3;
      
      // Only set loading on first attempt
      if (retryCount === 0) {
        setLoadingReps(true);
      }
      
      try {
        console.log(`🔄 Loading repertories... (attempt ${retryCount + 1}/${maxRetries + 1})`);
        const data = await getRepertories({ type: 'Repertory' });
        const filtered = (data || []).filter(r => r.type !== 'Reference' && !r.name.toLowerCase().includes('materia medica') && !r.name.toLowerCase().includes('reference'));
        setRepertories(filtered);
        setRepError(''); // Clear any previous errors
        setLoadingReps(false); // ✅ STOP LOADING ON SUCCESS
        console.log(`✅ Repertories loaded successfully: ${filtered.length} items`);
      } catch (error) {
        console.error(`❌ Repertory loading failed (attempt ${retryCount + 1}):`, error);
        
        const isNetworkError = !error.response;
        const isServerError = error.response?.status >= 500;
        const isAuthError = error.response?.status === 401;
        
        let errorMessage = '';
        if (isAuthError) {
          errorMessage = t('Session expired. Please login again.', 'सत्र समाप्त। कृपया पुनः लॉगिन करें।');
        } else if (isNetworkError) {
          errorMessage = t('Network connection failed. Check your internet.', 'नेटवर्क कनेक्शन फेल। इंटरनेट चेक करें।');
        } else if (isServerError) {
          errorMessage = t('Server temporarily unavailable. Try again later.', 'सर्वर अस्थायी रूप से अनुपलब्ध।');
        } else {
          errorMessage = t('Could not load repertories. Is the server running?', 'सर्वर से रेपरटॉरी लोड नहीं हुई।');
        }
        
        // Retry logic - don't retry auth errors
        if (retryCount < maxRetries && !isAuthError) {
          console.log(`🔁 Retrying in ${(retryCount + 1) * 2} seconds...`);
          setTimeout(() => loadRepertoriesWithRetry(retryCount + 1), (retryCount + 1) * 2000);
          return; // Don't set error or stop loading yet - retry in progress
        }
        
        // Final failure - stop loading and show error
        setRepError(errorMessage);
        setLoadingReps(false);
      }
    };

    loadRepertoriesWithRetry();
  }, []);

  // Load analysis from history when loadedAnalysis prop changes
  // Track the last loaded analysis ID to prevent reloading the same one
  const lastLoadedIdRef = useRef(null);
  
  useEffect(() => {
    if (loadedAnalysis && loadedAnalysis._id !== lastLoadedIdRef.current) {
      console.log('📊 Loading existing analysis:', loadedAnalysis._id);
      console.log('   - matchedRubrics:', loadedAnalysis.matchedRubrics?.length || 0);
      console.log('   - medicines:', loadedAnalysis.medicineDistribution?.length || 0);
      
      lastLoadedIdRef.current = loadedAnalysis._id;
      
      // Clear any loading/analyzing state
      setAnalyzing(false);
      setAnalysisError('');
      
      // Find and set the repertory
      const rep = repertories.find(r => r._id === loadedAnalysis.repertoryId);
      if (rep) {
        setSelectedRep(rep);
      } else {
        // Create a temporary repertory object if not found in list
        setSelectedRep({
          _id: loadedAnalysis.repertoryId,
          name: loadedAnalysis.repertoryName,
          rubricCount: loadedAnalysis.matchedRubrics?.length || 0
        });
      }
      
      // Set patient name and symptoms
      setPatientNameInput(loadedAnalysis.patientName || '');
      // Also load other patient details if available in the loaded analysis
      if (loadedAnalysis.patientAge) setPatientAge(String(loadedAnalysis.patientAge));
      if (loadedAnalysis.patientGender) setPatientGender(loadedAnalysis.patientGender);
      if (loadedAnalysis.patientWeight) setPatientWeight(String(loadedAnalysis.patientWeight));
      if (loadedAnalysis.patientContact) setPatientContact(loadedAnalysis.patientContact);
      
      setSymptoms(
        loadedAnalysis.symptoms?.slice(0, 9).concat(Array(Math.max(0, 9 - loadedAnalysis.symptoms.length)).fill('')) || EMPTY_SYMPTOMS
      );
      
      // Set analysis result
      const result = {
        analysisId: loadedAnalysis._id,
        repertoryName: loadedAnalysis.repertoryName,
        symptoms: loadedAnalysis.symptoms,
        matchedRubrics: loadedAnalysis.matchedRubrics,
        medicineDistribution: loadedAnalysis.medicineDistribution,
        aiUsed: loadedAnalysis.aiUsed,
      };
      
      console.log('✅ Setting analysis result and jumping to step 4');
      setAnalysisResult(result);
      
      // Jump to Step 4 (Results)
      setStep(4);
    } else if (!loadedAnalysis) {
      // Clear the ref when loadedAnalysis is cleared
      lastLoadedIdRef.current = null;
    }
  }, [loadedAnalysis, repertories]);

  // Load all patients: registered users (role=Patient) + manually added by doctor
  const loadModalPatients = async () => {
    if (modalPatients.length > 0 || loadingModalPatients) return;
    setLoadingModalPatients(true);
    try {
      const isClinicalUser = ['Admin', 'Core Team', 'External Doctor'].includes(currentUser?.role);
      const [usersRes, patientsRes] = await Promise.allSettled([
        isClinicalUser ? getAllUsers() : Promise.resolve({ users: [] }),
        getPatients({ limit: 300 }),
      ]);
      // Registered users with role=Patient
      const userPatients = (usersRes.status === 'fulfilled' ? (usersRes.value?.users || []) : [])
        .filter(u => u.role === 'Patient' && u.status === 'Approved')
        .map(u => ({ _id: u._id, name: u.name, age: u.age || '', gender: u.gender || '', contact: u.phone || '', source: 'registered' }));
      // Manually added Patient collection records
      const dbPatients = (patientsRes.status === 'fulfilled' ? (patientsRes.value?.data || []) : [])
        .map(p => ({ _id: p._id, name: p.name, age: p.age || '', gender: p.gender || '', contact: p.contact || '', source: 'manual' }));
      // Merge, deduplicate by lowercased name
      const seen = new Set();
      const merged = [...userPatients, ...dbPatients].filter(p => {
        const key = p.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
      setModalPatients(merged);
    } catch { setModalPatients([]); }
    finally { setLoadingModalPatients(false); }
  };

  // Auto-load patients as soon as the modal opens (default tab is 'registered')
  useEffect(() => {
    if (showPatientModal) loadModalPatients();
  }, [showPatientModal]);

  // Auto-populate patient name from submission when doctor clicks "Analyze Now"
  useEffect(() => {
    if (patientSubmission && patientSubmission.patientName) {
      setPatientNameInput(patientSubmission.patientName);
      // Also load other patient details if available
      // Note: patientSubmission uses 'age', 'gender', 'weight' (not 'patientAge', etc.)
      if (patientSubmission.age) setPatientAge(String(patientSubmission.age));
      if (patientSubmission.gender) setPatientGender(patientSubmission.gender);
      if (patientSubmission.weight) setPatientWeight(String(patientSubmission.weight));
      // Contact is not currently captured in patient consultation form
    }
  }, [patientSubmission]);

  // Auto-fill symptoms when patientSubmission is loaded
  useEffect(() => {
    if (patientSubmission && patientSubmission.symptoms && patientSubmission.symptoms.length > 0) {
      // Take up to 9 symptoms and fill the symptom slots
      const symptomsToFill = patientSubmission.symptoms.slice(0, 9);
      const filledSymptoms = [...symptomsToFill];
      
      // Pad with empty strings if less than 9 symptoms
      while (filledSymptoms.length < 9) {
        filledSymptoms.push('');
      }
      
      setSymptoms(filledSymptoms);
    }
  }, [patientSubmission]);

  // Handlers
  const handleCreateRepertory = async (e) => {
    e.preventDefault();
    if (!newRepName) return;
    setCreating(true);
    try {
      const rep = await createRepertory({ name: newRepName, author: newRepAuthor, type: 'Repertory' });
      setRepertories(prev => [rep, ...prev]);
      setSelectedRep(rep);
      setShowCreate(false);
      setNewRepName(''); setNewRepAuthor('');
    } catch { setRepError(t('Failed to create repertory', 'रेपरटॉरी बनाने में विफल')); }
    finally { setCreating(false); }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedRep) return;
    setUploading(true); setUploadResult(null);
    try {
      const res = await uploadRepertoryExcel(selectedRep._id, uploadFile, true);
      setUploadResult(res);
      // Refresh list
      const data = await getRepertories({ type: 'Repertory' });
      const filtered = (data || []).filter(r => r.type !== 'Reference' && !r.name.toLowerCase().includes('materia medica') && !r.name.toLowerCase().includes('reference'));
      setRepertories(filtered);
      const updated = filtered.find(r => r._id === selectedRep._id);
      if (updated) setSelectedRep(updated);
    } catch (err) {
      setUploadResult({ message: err?.response?.data?.message || 'Upload failed' });
    } finally { setUploading(false); }
  };

  const handleRunAnalysis = async () => {
    console.log('🚀 Starting analysis...');
    const cleanSymptoms = symptoms.filter(s => s.trim());
    console.log('   - Symptoms:', cleanSymptoms);
    console.log('   - Repertory:', selectedRep?.name);
    console.log('   - Patient:', patientNameInput || 'Patient');
    
    if (!selectedRep || cleanSymptoms.length === 0) {
      console.log('❌ Cannot run analysis - missing data');
      return;
    }
    
    // Clear the loaded analysis tracking so useEffect doesn't reload old data
    lastLoadedIdRef.current = null;
    
    setAnalyzing(true); setAnalysisError(''); setAnalysisResult(null);
    setStep(3); // Go to AI Analysis step
    
    try {
      console.log('📡 Calling API...');
      const result = await runAnalysis({ 
        repertoryId: selectedRep._id, 
        symptoms: cleanSymptoms,
        patientName: patientNameInput || 'Patient', // Pass patient name
        patientAge: patientAge || '',
        patientGender: patientGender || '',
        patientWeight: patientWeight || '',
        patientContact: patientContact || ''
      });
      console.log('✅ Analysis complete:', {
        rubrics: result.matchedRubrics?.length || 0,
        medicines: result.medicineDistribution?.length || 0
      });
      setAnalysisResult(result);
      setStep(4); // Go to Repertory Chart step
      // Mark patient submission as analyzed
      if (onAnalysisComplete) onAnalysisComplete();
    } catch (err) {
      console.error('❌ Analysis failed:', err);
      setAnalysisError(err?.response?.data?.message || t('Analysis failed. Check server connection.', 'विश्लेषण विफल। सर्वर कनेक्शन जाँचें।'));
      setStep(2);
    } finally { 
      console.log('🏁 Analysis finished, clearing analyzing state');
      setAnalyzing(false); 
    }
  };

  const handleUpdateGrade = async (rubricId, medicineName, grade) => {
    if (!analysisResult) return;

    const updatedMatchedRubrics = analysisResult.matchedRubrics.map(r => {
      if (r.rubricId === rubricId) {
        const updatedMeds = { ...r.medicines };
        if (grade === 0) {
          delete updatedMeds[medicineName];
        } else {
          updatedMeds[medicineName] = grade;
        }
        return { ...r, medicines: updatedMeds };
      }
      return r;
    });

    try {
      const targetRubric = updatedMatchedRubrics.find(r => r.rubricId === rubricId);
      if (targetRubric) {
        await updateRubric(rubricId, { medicines: targetRubric.medicines });
      }

      const medicineMap = {};
      updatedMatchedRubrics.forEach(mr => {
        if (!mr.medicines) return;
        Object.entries(mr.medicines).forEach(([medName, g]) => {
          const val = parseInt(g);
          if (isNaN(val) || val <= 0) return;
          if (!medicineMap[medName]) {
            medicineMap[medName] = { totalScore: 0, rubricsCount: 0, grades: [] };
          }
          medicineMap[medName].totalScore += val;
          medicineMap[medName].rubricsCount += 1;
          medicineMap[medName].grades.push(val);
        });
      });

      const updatedDistribution = Object.entries(medicineMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.totalScore - a.totalScore || b.rubricsCount - a.rubricsCount)
        .map((m, idx) => ({ ...m, rank: idx + 1 }));

      setAnalysisResult(prev => ({
        ...prev,
        matchedRubrics: updatedMatchedRubrics,
        medicineDistribution: updatedDistribution
      }));

    } catch (err) {
      console.error("Failed to update medicine grade:", err);
      alert(t("Failed to update medicine grade.", "दवा ग्रेड अपडेट करने में विफल।"));
    }
  };

  const validSymptoms = symptoms.filter(s => s.trim()).length;
  const canRunAnalysis = selectedRep && validSymptoms > 0;

  // Filter repertories by search
  const filteredRepertories = repertories.filter(r => 
    r.name.toLowerCase().includes(repSearch.toLowerCase()) ||
    (r.author && r.author.toLowerCase().includes(repSearch.toLowerCase()))
  );

  // ── PREMIUM Tab Navigation with Glassmorphism & Connected Stepper Track ──────────────────
  const renderTabNavigation = () => {
    const tabs = STEPS.map(s => {
      const Icon = s.icon;
      const done = step > s.id;
      const active = step === s.id;
      
      // Status indicator
      let statusIcon = null;
      let statusText = '';
      let statusClass = '';
      let statusBadgeColor = '';
      
      if (active) {
        statusIcon = <Icon className="h-3 w-3 animate-pulse" />;
        statusText = t('Active', 'सक्रिय');
        statusClass = 'text-white';
        statusBadgeColor = 'bg-gradient-to-r from-blue-600 via-[#062E6F] to-indigo-700 text-white shadow-md shadow-blue-500/20';
      } else if (done) {
        if (s.id === 3) {
          statusIcon = <RefreshCw className="h-3 w-3" />;
          statusText = t('Re-run', 'पुनः');
          statusClass = 'text-amber-700';
          statusBadgeColor = 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm';
        } else {
          statusIcon = <CheckCircle2 className="h-3 w-3" />;
          statusText = t('Done', 'पूर्ण');
          statusClass = 'text-emerald-700';
          statusBadgeColor = 'bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-sm';
        }
      } else {
        statusIcon = <ChevronRight className="h-3 w-3" />;
        statusText = t('Step 0' + s.id, 'चरण 0' + s.id);
        statusClass = 'text-slate-400';
        statusBadgeColor = 'bg-slate-100 text-slate-600';
      }
      
      const handleTabClick = () => {
        if (s.id === 3 && step > 3) {
          handleRunAnalysis();
        } else if (done || s.id <= step) {
          setStep(s.id);
        }
      };
      
      return {
        id: s.id,
        label: isEn ? s.label : s.labelHi,
        icon: Icon,
        active,
        done,
        clickable: done || s.id <= step,
        statusIcon,
        statusText,
        statusClass,
        statusBadgeColor,
        onClick: handleTabClick
      };
    });
    
    // Calculate overall progress percentage for timeline bar
    const progressPercent = Math.min(100, Math.max(0, ((step - 1) / (STEPS.length - 1)) * 100));

    return (
      <div className="space-y-4 mb-8 relative z-0">
        {/* Top Progress Tracker Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#062E6F]">
              {t(`Step ${step} of ${STEPS.length}`, `चरण ${step} / ${STEPS.length}`)}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">
              {tabs.find(t => t.active)?.label}
            </span>
          </div>
          <div className="text-xs font-bold text-[#062E6F] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {Math.round(progressPercent)}% {t('Completed', 'पूर्ण')}
          </div>
        </div>

        {/* Desktop: Connected Stepper Line & Glass Tabs */}
        <div className="hidden lg:block">
          <div className="relative p-2 bg-gradient-to-r from-slate-100/80 via-blue-50/40 to-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm">
            
            {/* Connected Animated Progress Line behind icons */}
            <div className="absolute top-[38px] left-[60px] right-[60px] h-[3px] bg-slate-200 rounded-full z-0 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-[#062E6F] to-blue-600 transition-all duration-700 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              {tabs.map((tab, idx) => {
                const TabIcon = tab.icon;
                return (
                  <React.Fragment key={tab.id}>
                    <button
                      onClick={tab.onClick}
                      disabled={!tab.clickable}
                      className={`
                        relative flex flex-col items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-300 flex-1 group
                        ${tab.active 
                          ? 'bg-white shadow-xl shadow-blue-900/10 ring-2 ring-[#062E6F]/20 transform scale-105 z-20' 
                          : tab.done 
                            ? 'bg-white/70 hover:bg-white hover:shadow-md cursor-pointer' 
                            : 'bg-white/30 opacity-50 cursor-not-allowed'}
                      `}
                    >
                      {/* Active indicator bar */}
                      {tab.active && (
                        <div className="absolute top-0 left-4 right-4 h-[3px] bg-gradient-to-r from-blue-500 via-[#062E6F] to-indigo-600 rounded-b-full shadow-sm" />
                      )}
                      
                      {/* Stepper Circle */}
                      <div className={`
                        relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300
                        ${tab.active 
                          ? 'bg-gradient-to-br from-[#062E6F] via-blue-800 to-indigo-900 text-white shadow-lg shadow-blue-900/30 ring-4 ring-blue-500/20' 
                          : tab.done 
                            ? 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-400/30 group-hover:scale-105' 
                            : 'bg-slate-100 text-slate-400'}
                      `}>
                        {tab.done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <TabIcon className={`h-5 w-5 transition-transform duration-300 ${tab.active ? 'scale-110' : ''}`} />
                        )}
                        
                        {/* Glow halo on active */}
                        {tab.active && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/30 to-transparent animate-pulse" />
                        )}
                      </div>
                      
                      {/* Label & Status */}
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs font-bold tracking-tight transition-colors ${
                          tab.active ? 'text-[#062E6F]' : tab.done ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          {tab.label}
                        </span>
                        
                        <div className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider
                          ${tab.statusBadgeColor}
                        `}>
                          {tab.statusIcon}
                          <span>{tab.statusText}</span>
                        </div>
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── PREMIUM Context Bar with Glassmorphism ──────────────
  const renderContextBar = () => {
    const contextItems = [];
    
    if (selectedRep) {
      contextItems.push({
        icon: BookOpen,
        label: selectedRep.name,
        sublabel: `${selectedRep.rubricCount || 0} rubrics`,
        gradient: 'from-blue-500 to-blue-600'
      });
    }
    
    const validSymptoms = symptoms.filter(s => s.trim()).length;
    if (validSymptoms > 0) {
      contextItems.push({
        icon: Mic,
        label: `${validSymptoms} ${t('symptoms', 'लक्षण')}`,
        sublabel: patientNameInput || t('Patient', 'मरीज़'),
        gradient: 'from-purple-500 to-purple-600'
      });
    }
    
    if (analysisResult) {
      const timeSince = analysisResult.stats?.timingsMs?.total 
        ? `${(analysisResult.stats.timingsMs.total / 1000).toFixed(1)}s`
        : t('Complete', 'पूर्ण');
      contextItems.push({
        icon: Brain,
        label: t('AI Analysis', 'AI विश्लेषण'),
        sublabel: analysisResult.aiUsed ? `✓ ${timeSince}` : t('Keyword match', 'कीवर्ड'),
        gradient: 'from-emerald-500 to-green-600'
      });
    }
    
    if (contextItems.length === 0) return null;
    
    return (
      <div className="mb-8 relative z-0">
        {/* Premium glass card with gradient border */}
        <div className="relative group">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-2xl opacity-20 blur-sm group-hover:opacity-30 transition-opacity" />
          
          {/* Main card */}
          <div className="relative bg-gradient-to-br from-white via-white to-slate-50/50 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl shadow-slate-200/50 p-4 sm:p-6">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 rounded-2xl pointer-events-none" />
            
            {/* Content */}
            <div className="relative flex flex-wrap items-center gap-3 sm:gap-6">
              {contextItems.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-2 sm:gap-3 group/item">
                      {/* Premium icon box with gradient */}
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-xl opacity-10 group-hover/item:opacity-20 transition-opacity blur-md`} />
                        <div className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg shadow-current/20 group-hover/item:scale-110 transition-transform duration-300`}>
                          <ItemIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Text content */}
                      <div className="flex flex-col">
                        <div className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">{item.label}</div>
                        <div className="text-xs sm:text-sm text-slate-500 font-medium">{item.sublabel}</div>
                      </div>
                    </div>
                    
                    {/* Premium separator */}
                    {idx < contextItems.length - 1 && (
                      <div className="flex items-center">
                        <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 -ml-2.5 shrink-0" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* Premium shine effect */}
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
          </div>
        </div>
      </div>
    );
  };

  // ── STEP 1: Select Repertory ────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t('Select a Repertory', 'रेपरटॉरी चुनें')}</h3>
          <p className="text-sm text-slate-600">
            {t('Choose the repertory to use for this analysis. Only one repertory applies per session.','इस विश्लेषण के लिए उपयोग की जाने वाली रेपरटॉरी चुनें।')}
          </p>
        </div>
        
        {/* Enter Symptoms Button - Top Right */}
        <button
          type="button"
          disabled={!selectedRep}
          onClick={() => {
            setStep(2);
            if (!patientNameInput && !patientSubmission && !loadedAnalysis && !hasPromptedPatient) {
              setShowPatientModal(true);
              setHasPromptedPatient(true);
            }
          }}
          className={`terracotta-btn text-sm px-6 py-3 shadow-lg min-h-[44px] whitespace-nowrap ${!selectedRep ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {t('Enter Symptoms','लक्षण दर्ज करें')} <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {repError && (
        <div className="flex items-start gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{repError}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button 
                onClick={() => {
                  setRepError('');
                  setLoadingReps(true);
                  getRepertories({ type: 'Repertory' })
                    .then(data => {
                      const filtered = (data || []).filter(r => r.type !== 'Reference' && !r.name.toLowerCase().includes('materia medica') && !r.name.toLowerCase().includes('reference'));
                      setRepertories(filtered);
                      setRepError('');
                    })
                    .catch(() => setRepError(t('Still cannot connect. Check your internet connection.', 'अभी भी कनेक्ट नहीं हो सका। इंटरनेट चेक करें।')))
                    .finally(() => setLoadingReps(false));
                }}
                disabled={loadingReps}
                className="px-3 py-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${loadingReps ? 'animate-spin' : ''}`} />
                {loadingReps ? t('Retrying...', 'पुनः प्रयास...') : t('Try Again', 'पुनः प्रयास')}
              </button>
              
              <button 
                onClick={() => window.location.reload()} 
                className="text-xs font-medium text-slate-600 hover:text-slate-800 underline"
              >
                {t('Reload Page', 'पेज रीलोड करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingReps ? (
        <div className="flex items-center gap-3 text-slate-500 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> 
          <span className="text-sm font-medium">{t('Loading repertories…','लोड हो रहा है…')}</span>
        </div>
      ) : (
        <>
          {/* Search/Filter (shown when >6 repertories) */}
          {repertories.length > 6 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={repSearch}
                onChange={e => setRepSearch(e.target.value)}
                placeholder={t('Search repertories...', 'रेपरटॉरी खोजें...')}
                className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredRepertories.map(rep => (
              <button
                key={rep._id}
                onClick={() => setSelectedRep(rep)}
                className={`text-left p-5 rounded-xl border-2 transition-all min-h-[88px] ${
                  selectedRep?._id === rep._id
                    ? 'border-[#062E6F] bg-blue-50/50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <BookOpen className={`h-5 w-5 shrink-0 mt-0.5 ${selectedRep?._id === rep._id ? 'text-[#062E6F]' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{rep.name}</span>
                      {selectedRep?._id === rep._id && <CheckCircle2 className="h-4 w-4 text-[#062E6F] shrink-0" />}
                    </div>
                    {rep.author && <p className="text-xs text-slate-600 mt-1">{rep.author}</p>}
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {rep.rubricCount || 0} {t('rubrics','रुब्रिक्स')}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Add new repertory card */}
            <button
              onClick={() => setShowCreate(true)}
              className="text-left p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#062E6F]/40 bg-white text-slate-400 hover:text-[#062E6F] transition-all text-sm font-semibold flex items-center justify-center gap-2 min-h-[88px]"
            >
              <span className="text-2xl font-light">+</span>
              {t('Add New Repertory','नई रेपरटॉरी जोड़ें')}
            </button>
          </div>
        </>
      )}

      {/* Create repertory form */}
      {showCreate && (
        <div className="surface p-6 space-y-5 border-2 border-[#062E6F]/20 rounded-xl">
          <h4 className="text-base font-bold text-slate-800">{t('Create New Repertory','नई रेपरटॉरी बनाएं')}</h4>
          <form onSubmit={handleCreateRepertory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {t('Repertory Name', 'रेपरटॉरी का नाम')} <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                value={newRepName} 
                onChange={e => setNewRepName(e.target.value)}
                placeholder={t("e.g. Kent's Repertory",'जैसे केंट की रेपरटॉरी')}
                className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {t('Author', 'लेखक')} <span className="text-slate-400 font-normal">({t('optional', 'वैकल्पिक')})</span>
              </label>
              <input 
                value={newRepAuthor} 
                onChange={e => setNewRepAuthor(e.target.value)}
                placeholder={t('e.g. James Tyler Kent','जैसे जेम्स टायलर केंट')}
                className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30" 
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="submit" 
                disabled={creating} 
                className="terracotta-btn text-sm px-5 py-3 min-h-[44px]"
              >
                {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('Creating...','बनाया जा रहा है...')}</> : t('Create','बनाएं')}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreate(false)} 
                className="ghost-btn border border-slate-200 text-sm px-5 py-3 min-h-[44px]"
              >
                {t('Cancel','रद्द करें')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Advanced section: Excel upload (collapsed accordion) */}
      {selectedRep && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-slate-600" />
              <span className="text-sm font-bold text-slate-700">{t('Advanced: Upload Excel Data', 'उन्नत: Excel डेटा अपलोड करें')}</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
          
          {showAdvanced && (
            <div className="border-t border-slate-200 p-5 space-y-5 bg-slate-50">
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('Upload Excel data to bulk-import rubrics for', 'थोक रुब्रिक्स आयात करने के लिए Excel अपलोड करें')} <span className="font-semibold">{selectedRep.name}</span>. {t('Required columns: chapter_en, chapter_hi, rubric_en, rubric_hi, subrubric_en, subrubric_hi, aggravation, amelioration, synonyms_en, synonyms_hi. Then one column per medicine (header = medicine name, value = grade 1/2/3).','आवश्यक कॉलम: chapter_en, rubric_en आदि। फिर प्रत्येक दवा के लिए एक कॉलम।')}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-5 py-3 text-sm font-semibold border-2 border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 text-slate-700 transition-all min-h-[44px]">
                  <Upload className="h-4 w-4" />
                  {uploadFile ? uploadFile.name : t('Choose .xlsx file','Excel फ़ाइल चुनें')}
                  <input 
                    type="file" 
                    accept=".xlsx,.xls" 
                    className="hidden" 
                    onChange={e => { setUploadFile(e.target.files[0]); setUploadResult(null); }} 
                  />
                </label>
                {uploadFile && (
                  <button 
                    onClick={handleUpload} 
                    disabled={uploading} 
                    className="terracotta-btn text-sm px-5 py-3 min-h-[44px]"
                  >
                    {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('Uploading…','अपलोड हो रहा है…')}</> : t('Upload & Import','अपलोड करें')}
                  </button>
                )}
              </div>

              {uploadResult && (
                <div className={`text-xs p-4 rounded-lg border ${uploadResult.rubricCount ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  <p className="font-bold mb-1">{uploadResult.message}</p>
                  {uploadResult.rubricCount && <p>{uploadResult.rubricCount} {t('rubrics imported.','रुब्रिक्स आयात हुईं।')} {uploadResult.skippedRows > 0 ? `${uploadResult.skippedRows} ${t('rows skipped.','पंक्तियाँ छोड़ी गईं।')}` : ''}</p>}
                  {uploadResult.medicinesDetected?.length > 0 && <p className="mt-1">{t('Medicines detected:','दवाएं:')} {uploadResult.medicinesDetected.join(', ')}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── STEP 2: Symptoms ──────────────────────────────────────────────
  const renderStep2 = () => {
    return (
    <div className="relative">
      {/* Patient Name / Picker Modal */}
      {showPatientModal && (() => {
        const filtered = modalPatients.filter(p =>
          p.name?.toLowerCase().includes(modalPatientSearch.toLowerCase()) ||
          (p.contact && p.contact.includes(modalPatientSearch))
        );
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{t('Select Patient', 'मरीज़ चुनें')}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t('Pick from registered list or enter a custom name', 'सूची से चुनें या नया नाम लिखें')}</p>
                </div>
                <button onClick={() => setShowPatientModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-6 pt-4 shrink-0">
                <button
                  onClick={() => { setModalTab('registered'); loadModalPatients(); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    modalTab === 'registered'
                      ? 'bg-[#062E6F] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  👥 {t('Registered', 'पंजीकृत')}
                </button>
                <button
                  onClick={() => setModalTab('custom')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    modalTab === 'custom'
                      ? 'bg-[#062E6F] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ✏️ {t('Custom Name', 'नया नाम')}
                </button>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 thin-scroll">

                {modalTab === 'registered' && (
                  <div className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={modalPatientSearch}
                        onChange={e => setModalPatientSearch(e.target.value)}
                        placeholder={t('Search by name or phone…', 'नाम या फ़ोन से खोजें…')}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
                        autoFocus
                      />
                    </div>

                    {/* Patient list */}
                    {loadingModalPatients ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('Loading patients…', 'मरीज़ लोड हो रहे हैं…')}
                      </div>
                    ) : filtered.length === 0 ? (
                      <p className="text-center text-sm text-slate-400 py-8">
                        {modalPatients.length === 0
                          ? t('No registered patients found.', 'कोई पंजीकृत मरीज़ नहीं मिला।')
                          : t('No match — try custom name tab.', 'कोई मिलान नहीं — नया नाम लिखें।')}
                      </p>
                    ) : filtered.map(p => (
                      <button
                        key={p._id}
                        onClick={() => {
                          setPatientNameInput(p.name);
                          setPatientContact(p.contact || '');
                          if (p.age)    setPatientAge(String(p.age));
                          if (p.gender) setPatientGender(p.gender);
                          if (p.weight) setPatientWeight(String(p.weight));
                          setShowPatientModal(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-[#062E6F]/40 rounded-xl transition-all text-left group"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#062E6F]/10 flex items-center justify-center shrink-0 text-[#062E6F] text-sm font-bold group-hover:bg-[#062E6F] group-hover:text-white transition-colors">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                          <p className="text-xs text-slate-500">
                            {[p.age && `${p.age} yrs`, p.gender, p.contact].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#062E6F] shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {modalTab === 'custom' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        {t('Patient Name or ID', 'मरीज़ का नाम या ID')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={patientNameInput}
                        onChange={e => setPatientNameInput(e.target.value)}
                        placeholder={t('e.g. Ramesh Kumar', 'जैसे रमेश कुमार')}
                        className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter' && patientNameInput.trim()) setShowPatientModal(false); }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        {t('Phone (optional)', 'फ़ोन (वैकल्पिक)')}
                      </label>
                      <input
                        type="tel"
                        value={patientContact}
                        onChange={e => setPatientContact(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {t('Phone number will be used for WhatsApp sharing later.', 'फ़ोन नंबर बाद में व्हाट्सऐप शेयरिंग के लिए उपयोग होगा।')}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-3 border-t border-slate-100 shrink-0 flex gap-3">
                <button
                  onClick={() => { if (patientNameInput.trim()) setShowPatientModal(false); }}
                  disabled={!patientNameInput.trim()}
                  className={`flex-1 bg-[#062E6F] text-white font-bold py-3 rounded-xl transition-colors ${
                    patientNameInput.trim() ? 'hover:bg-blue-800' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  {t('Continue', 'जारी रखें')}
                </button>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  {t('Skip', 'छोड़ें')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className={`space-y-8 transition-all duration-300 ${showPatientModal ? 'blur-sm pointer-events-none opacity-60' : ''}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('Enter Patient Symptoms','मरीज़ के लक्षण दर्ज करें')}</h3>
            <p className="text-sm text-slate-600">
              {t('Enter up to 9 symptoms. Type naturally or use the microphone. AI will match them to rubrics.',
                 'अधिकतम 9 लक्षण दर्ज करें। स्वाभाविक रूप से टाइप करें या माइक्रोफ़ोन का उपयोग करें।')}
            </p>
          </div>
          
          {/* Run AI Analysis Button - Top Right */}
          <button
            disabled={!canRunAnalysis || analyzing}
            onClick={handleRunAnalysis}
            className={`terracotta-btn shadow-lg text-sm px-6 py-3 min-h-[44px] whitespace-nowrap flex items-center gap-2 ${!canRunAnalysis ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <Brain className="h-5 w-5" />
            {analyzing ? t('Analyzing...', 'विश्लेषण...') : t('Run AI Analysis','AI विश्लेषण चलाएं')}
          </button>
        </div>

        {/* Patient Info Card */}
        <div className="surface border border-slate-200 rounded-xl overflow-hidden">
          {/* Name row */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{t('Patient Name', 'रोगी का नाम')}</p>
              <p className="text-sm font-bold text-slate-800">
                {patientNameInput || t('Patient', 'मरीज़')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPatientModal(true)}
              className="text-xs font-bold px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors min-h-[44px]"
            >
              {t('Edit', 'संपादित करें')}
            </button>
          </div>

          {/* Age / Gender / Weight row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-slate-100 bg-slate-50/60 gap-0">
            {/* Age */}
            <div className="px-4 py-3">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('Age', 'आयु')}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={patientAge}
                  onChange={e => setPatientAge(e.target.value)}
                  placeholder="—"
                  className="w-full text-sm font-semibold text-slate-800 bg-transparent border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F]/40 placeholder-slate-300"
                />
                <span className="text-xs text-slate-400 shrink-0">{t('yrs', 'वर्ष')}</span>
              </div>
            </div>

            {/* Gender */}
            <div className="px-4 py-3">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('Gender', 'लिंग')}
              </label>
              <select
                value={patientGender}
                onChange={e => setPatientGender(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F]/40"
              >
                <option value="">{t('Select', 'चुनें')}</option>
                <option value="Male">{t('Male', 'पुरुष')}</option>
                <option value="Female">{t('Female', 'महिला')}</option>
                <option value="Other">{t('Other', 'अन्य')}</option>
              </select>
            </div>

            {/* Weight */}
            <div className="px-4 py-3">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('Weight', 'वजन')}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={patientWeight}
                  onChange={e => setPatientWeight(e.target.value)}
                  placeholder="—"
                  className="w-full text-sm font-semibold text-slate-800 bg-transparent border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F]/40 placeholder-slate-300"
                />
                <span className="text-xs text-slate-400 shrink-0">{t('kg', 'किग्रा')}</span>
              </div>
            </div>
          </div>
        </div>

      {/* Symptom input cards — enhanced mobile design */}
      <div className="rounded-xl overflow-hidden border border-slate-200 divide-y divide-slate-100">
        {symptoms.map((sym, idx) => (
          <div key={idx} className="bg-white hover:bg-slate-50/60 transition-colors">

            {/* ── Enhanced Mobile layout: buttons below input ── */}
            <div className="md:hidden px-4 py-3 space-y-2">
              {/* Top row: number + input */}
              <div className="flex items-center gap-3">
                {/* Number badge */}
                <span className="w-6 h-6 rounded-full bg-[#062E6F]/10 text-[#062E6F] text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                
                {/* Input field - clean, no buttons inside */}
                <input
                  type="text"
                  value={sym}
                  onChange={e => setSymptoms(prev => prev.map((s, i) => i === idx ? e.target.value : s))}
                  placeholder={isEn
                    ? `Symptom ${idx + 1}`
                    : `लक्षण ${idx + 1}`}
                  className="flex-1 text-sm bg-transparent border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F]/40"
                />
              </div>
              
              {/* Bottom row: controls below input */}
              <div className="flex items-center justify-end gap-2 pl-9">
                {sym && (
                  <button
                    onClick={() => setSymptoms(prev => prev.map((s, i) => i === idx ? '' : s))}
                    className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    {t('Clear', 'साफ़')}
                  </button>
                )}
                
                {/* VoiceInput with language toggle */}
                <VoiceInputMobile
                  lang={lang}
                  onResult={text => setSymptoms(prev => prev.map((s, i) => i === idx ? text : s))}
                />
              </div>
            </div>

            {/* ── Desktop layout: single row (unchanged) ── */}
            <div className="hidden md:flex items-center gap-4 px-5 py-4">
              <span className="w-7 h-7 rounded-full bg-[#062E6F]/10 text-[#062E6F] text-sm font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={sym}
                onChange={e => setSymptoms(prev => prev.map((s, i) => i === idx ? e.target.value : s))}
                placeholder={isEn
                  ? `Symptom ${idx + 1} — e.g. "irritable, worse in morning"`
                  : `लक्षण ${idx + 1} — जैसे "सुबह चिड़चिड़ाहट"`}
                className="flex-1 text-sm bg-transparent border-none outline-none text-slate-700 placeholder-slate-400"
              />
              {sym && (
                <button
                  onClick={() => setSymptoms(prev => prev.map((s, i) => i === idx ? '' : s))}
                  className="text-slate-300 hover:text-slate-500 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={t('Clear', 'साफ़ करें')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="shrink-0">
                <VoiceInput
                  lang={lang}
                  onResult={text => setSymptoms(prev => prev.map((s, i) => i === idx ? text : s))}
                />
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Live symptom counter */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
          <span className="text-sm font-bold text-slate-700">{validSymptoms}</span>
          <span className="text-sm text-slate-600">{t('of 9 symptoms added', '/ 9 लक्षण जोड़े गए')}</span>
        </div>
      </div>

      {/* Tips section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
        <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
          <span>💡</span>
          {t('Tips for better AI matching:','💡 बेहतर AI मिलान के लिए सुझाव:')}
        </p>
        <ul className="space-y-1.5 pl-1">
          <li>• {t('Include modalities: "worse in morning", "better from heat"','मोडैलिटी शामिल करें: "सुबह बदतर", "गर्मी से बेहतर"')}</li>
          <li>• {t('Mention location: "headache on right side", "burning in stomach"','स्थान बताएं: "दाईं ओर सिरदर्द", "पेट में जलन"')}</li>
          <li>• {t('Describe character: "throbbing pain", "watery discharge"','चरित्र बताएं: "धड़कते दर्द", "पानी जैसा स्राव"')}</li>
          <li>• {t('You can paste a repertory row directly (tab-separated entries are handled automatically)','आप सीधे रेपरटॉरी की पंक्ति पेस्ट कर सकते हैं')}</li>
        </ul>
      </div>

      {/* Error message with retry */}
      {analysisError && (
        <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-2">{analysisError}</p>
            <button
              onClick={handleRunAnalysis}
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              {t('Try Again', 'पुनः प्रयास करें')}
            </button>
          </div>
        </div>
      )}

      {/* Back button at bottom */}
      <div className="flex justify-start pt-4">
        <button 
          onClick={() => setStep(1)} 
          className="ghost-btn border border-slate-200 text-sm px-5 py-3 min-h-[44px]"
        >
          ← {t('Back','वापस')}
        </button>
      </div>
      </div>
    </div>
  );
  };

  // ── STEP 3: AI Analysis Loading View ─────────────────────────
  const renderStep3Analysis = () => (
    <div className="space-y-10 py-10 max-w-4xl mx-auto">
      {/* Central Glowing Radar Scan Engine */}
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="relative flex items-center justify-center">
          {/* Pulse Outer Rings */}
          <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-[#062E6F]/20 to-blue-500/20 animate-ping opacity-75" />
          <div className="absolute w-28 h-28 rounded-full border-2 border-[#062E6F]/40 animate-spin" style={{ animationDuration: '8s' }} />
          
          {/* Main Glowing Engine Center */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#062E6F] via-blue-800 to-indigo-900 flex items-center justify-center shadow-2xl shadow-blue-900/40 ring-4 ring-blue-500/20 transform rotate-3">
            <Brain className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#062E6F] border border-blue-100 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-spin" />
            {t('AI Clinical Reasoning', 'AI नैदानिक विश्लेषण')}
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {t('Analyzing Patient Symptoms…', 'लक्षणों का AI विश्लेषण जारी है…')}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t(`Matching symptoms against "${selectedRep?.name || 'Repertory'}" using Kent hierarchy and remedy gradings.`,
               `चुनी गई रेपरटॉरी से लक्षणों का मिलान किया जा रहा है।`)}
          </p>
        </div>
      </div>

      {/* Real-time Processing Status Checklist */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-blue-900/5 space-y-4 max-w-lg mx-auto">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
          {t('Pipeline Execution Status', 'विश्लेषण प्रगति')}
        </h4>
        
        <div className="space-y-3 text-xs font-medium text-slate-700">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100">
            <span className="flex items-center gap-2.5 text-emerald-800 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              {t('Extracting symptom rubric keywords', 'लक्षण रुब्रिक निकालना')}
            </span>
            <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-full">{t('Done', 'पूर्ण')}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 border border-blue-100">
            <span className="flex items-center gap-2.5 text-[#062E6F] font-bold">
              <Loader2 className="h-4 w-4 text-[#062E6F] animate-spin shrink-0" />
              {t('Searching Repertory database & gradings', 'रेपरटॉरी डेटाबेस खोजें')}
            </span>
            <span className="text-[10px] bg-blue-200 text-[#062E6F] font-bold px-2 py-0.5 rounded-full animate-pulse">{t('Active', 'जारी')}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 opacity-60">
            <span className="flex items-center gap-2.5 text-slate-500">
              <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
              {t('Calculating remedy weights & rank distribution', 'दवा रैंकिंग की गणना')}
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">{t('Pending', 'लंबित')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── STEP 4: Results with Master-Detail Split Pane ─────────────────────────
  const renderStep4Results = () => {
    const topMedicines = (analysisResult?.medicineDistribution || []).slice(0, 3);
    const selectedRubric = analysisResult?.matchedRubrics?.find(r => r.rubricId === selectedRubricId || r._id === selectedRubricId);
    
    // Check if no rubrics were found
    const hasNoRubrics = !analysisResult?.matchedRubrics || analysisResult.matchedRubrics.length === 0;
    
    // Show "No rubrics found" modal/message
    if (hasNoRubrics) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-8">
          {/* No Rubrics Found Card */}
          <div className="relative group max-w-lg w-full">
            {/* Gradient border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-2xl opacity-20 blur-xl" />
            
            <div className="relative bg-gradient-to-br from-white via-white to-amber-50/30 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl shadow-amber-200/50 p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/50">
                  <AlertCircle className="h-10 w-10 text-amber-600" />
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-slate-800">
                  {t('No Rubrics Found', 'कोई रुब्रिक नहीं मिला')}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t(
                    `No matching rubrics were found from the selected repertory "${analysisResult?.repertoryName || selectedRep?.name}". Try rephrasing your symptoms or selecting a different repertory.`,
                    `चयनित रेपरटॉरी "${analysisResult?.repertoryName || selectedRep?.name}" से कोई मेल खाने वाले रुब्रिक नहीं मिले। अपने लक्षणों को दोबारा लिखें या दूसरी रेपरटॉरी चुनें।`
                  )}
                </p>
                
                {/* Suggestions */}
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4 text-left">
                  <h4 className="font-semibold text-amber-800 mb-2 text-sm">
                    {t('Suggestions:', 'सुझाव:')}
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                    <li>{t('Try using different symptom descriptions', 'अलग लक्षण विवरण का उपयोग करें')}</li>
                    <li>{t('Use more specific or general terms', 'अधिक विशिष्ट या सामान्य शब्दों का उपयोग करें')}</li>
                    <li>{t('Select a different repertory', 'एक अलग रेपरटॉरी चुनें')}</li>
                  </ul>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  {t('Edit Symptoms', 'लक्षण बदलें')}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-all duration-200"
                >
                  {t('Change Repertory', 'रेपरटॉरी बदलें')}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-[400px] md:h-[calc(100vh-160px)] md:min-h-[500px] space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 shrink-0">
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-800">{t('Analysis Results', 'विश्लेषण परिणाम')}</h3>
          <p className="text-sm text-slate-500">
            {analysisResult?.repertoryName} • {analysisResult?.matchedRubrics?.length} {t('rubrics', 'रुब्रिक्स')}
          </p>
          {/* Patient Name Badge */}
          {patientNameInput && (
            <div className="inline-flex items-center gap-2 bg-[#062E6F]/8 border border-[#062E6F]/20 text-[#062E6F] text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#062E6F] inline-block"></span>
              {t('Patient', 'मरीज़')}: {patientNameInput}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button 
            onClick={() => setStep(2)} 
            className="ghost-btn border border-slate-200 text-xs sm:text-sm px-3 sm:px-4 py-2 min-h-[44px] flex items-center"
          >
            ← {t('Edit','बदलें')}
          </button>
          <button
            onClick={() => setStep(5)}
            className="terracotta-btn text-xs sm:text-sm px-4 sm:px-5 py-2 shadow-md flex items-center gap-2 min-h-[44px]"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t('Write Prescription','पर्चा लिखें')}</span>
            <span className="sm:hidden">{t('Prescribe','पर्चा')}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tabs - Only visible on mobile */}
      <div className="lg:hidden flex border-b border-slate-200 bg-slate-50 rounded-lg p-1 shrink-0">
        <button 
          onClick={() => setMobileTab('chart')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            mobileTab === 'chart' 
              ? 'bg-white shadow-sm text-[#062E6F] ring-1 ring-slate-200' 
              : 'text-slate-500'
          }`}
        >
          {t('Repertory Chart', 'रेपरटॉरी चार्ट')}
        </button>
        <button 
          onClick={() => setMobileTab('distribution')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            mobileTab === 'distribution' 
              ? 'bg-white shadow-sm text-[#062E6F] ring-1 ring-slate-200' 
              : 'text-slate-500'
          }`}
        >
          {t('Medicine List', 'दवा सूची')}
        </button>
      </div>

      {/* MOBILE VIEW - Tabbed Content */}
      <div className="lg:hidden flex-1 flex flex-col min-h-0">
        {mobileTab === 'chart' ? (
          <div className="flex-1 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="flex-1 overflow-hidden relative">
              <RepertoryChart 
                matchedRubrics={analysisResult?.matchedRubrics || []} 
                aiUsed={analysisResult?.aiUsed}
                lang={lang} 
                onUpdateGrade={handleUpdateGrade} 
                selectedRubricId={selectedRubricId}
                onRowSelect={(id) => {
                  setSelectedRubricId(id);
                  setActiveRightTab('details');
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="flex-1 overflow-y-auto p-4">
              <MedicineDistribution
                distribution={analysisResult?.medicineDistribution || []}
                stats={analysisResult?.stats}
                lang={lang}
                selectedMedicines={selectedMedicines}
                onToggleSelect={(name) => {
                  setSelectedMedicines(prev =>
                    prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
                  );
                }}
                onPrescribeSelected={() => {
                  if (selectedMedicines.length === 0 && analysisResult?.medicineDistribution?.length > 0) {
                    setSelectedMedicine(analysisResult.medicineDistribution[0].name);
                  }
                  setStep(5);
                }}
                onSelect={med => { setSelectedMedicine(med.name); setSelectedMedicines([med.name]); setStep(5); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW - MASTER-DETAIL SPLIT LAYOUT */}
      <div className="hidden lg:flex flex-1 flex-row gap-5 min-h-0">
        
        {/* LEFT PANE: Repertory Table (Master) */}
        <div className="w-full lg:w-3/5 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="flex-1 overflow-hidden relative">
            <RepertoryChart 
              matchedRubrics={analysisResult?.matchedRubrics || []} 
              aiUsed={analysisResult?.aiUsed}
              lang={lang} 
              onUpdateGrade={handleUpdateGrade} 
              selectedRubricId={selectedRubricId}
              onRowSelect={(id) => {
                setSelectedRubricId(id);
                setActiveRightTab('details');
              }}
            />
          </div>
        </div>

        {/* RIGHT PANE: Details & Medicine List (Detail) */}
        <div className="w-full lg:w-2/5 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-sm">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-100/50 p-1 shrink-0">
            <button 
              onClick={() => setActiveRightTab('overall')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeRightTab === 'overall' 
                  ? 'bg-white shadow-sm text-[#062E6F] ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              {t('Overall Distribution', 'संपूर्ण वितरण')}
            </button>
            <button 
              onClick={() => setActiveRightTab('details')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeRightTab === 'details' 
                  ? 'bg-white shadow-sm text-[#062E6F] ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              {t('Rubric Details', 'रुब्रिक विवरण')}
              {selectedRubricId && activeRightTab !== 'details' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto thin-scroll p-4">
            {activeRightTab === 'overall' ? (
              <MedicineDistribution
                distribution={analysisResult?.medicineDistribution || []}
                stats={analysisResult?.stats}
                lang={lang}
                selectedMedicines={selectedMedicines}
                onToggleSelect={(name) => {
                  setSelectedMedicines(prev =>
                    prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
                  );
                }}
                onPrescribeSelected={() => {
                  if (selectedMedicines.length === 0 && analysisResult?.medicineDistribution?.length > 0) {
                    setSelectedMedicine(analysisResult.medicineDistribution[0].name);
                  }
                  setStep(5);
                }}
                onSelect={med => { setSelectedMedicine(med.name); setSelectedMedicines([med.name]); setStep(5); }}
              />
            ) : (
              selectedRubric ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                    <span className="inline-block bg-[#062E6F]/10 text-[#062E6F] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {lang === 'en' ? selectedRubric.chapter?.en : (selectedRubric.chapter?.hi || selectedRubric.chapter?.en)}
                    </span>
                    <h4 className="text-lg font-bold text-slate-800">
                      {lang === 'en' ? selectedRubric.rubric?.en : (selectedRubric.rubric?.hi || selectedRubric.rubric?.en)}
                    </h4>
                    {selectedRubric.subrubric?.en && (
                      <p className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3">
                        {lang === 'en' ? selectedRubric.subrubric?.en : (selectedRubric.subrubric?.hi || selectedRubric.subrubric?.en)}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-sm text-slate-700">
                      {t('Indicated Medicines', 'संकेतित दवाएं')}
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {Object.entries(selectedRubric.medicines instanceof Map ? Object.fromEntries(selectedRubric.medicines) : (selectedRubric.medicines || {}))
                        .sort(([, a], [, b]) => b - a)
                        .map(([med, grade]) => (
                        <li key={med} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                          <span className="font-semibold text-slate-700">{med}</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${
                            grade === 3 ? 'bg-red-100 text-red-700 border-red-200' :
                            grade === 2 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {grade}° {grade === 3 ? t('High', 'उच्च') : grade === 2 ? t('Medium', 'मध्यम') : t('Low', 'निम्न')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-slate-300" />
                  </div>
                  <h4 className="font-semibold text-slate-700 mb-1">{t('No Rubric Selected', 'कोई रुब्रिक नहीं चुना गया')}</h4>
                  <p className="text-sm">{t('Click a row in the repertory table to view its detailed medicines here.', 'रेपरटॉरी तालिका में किसी पंक्ति पर क्लिक करके उसकी विस्तृत दवाएं यहां देखें।')}</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      </div>
    );
  };

  // ── STEP 5: Prescription ────────────────────────────────────────
  const renderStep5Prescription = () => {
    // Decide which medicines to pre-populate:
    // • If the doctor multi-selected some → use those (in ranked order from distribution)
    // • Else if a single medicine was clicked → use that one
    // • Else → empty (doctor fills manually)
    const distribution = analysisResult?.medicineDistribution || [];
    const preSelectedNames = selectedMedicines.length > 0
      ? selectedMedicines
      : selectedMedicine
        ? [selectedMedicine]
        : [];

    // Build medicine objects preserving rank order from distribution
    const prePopulatedMeds = preSelectedNames
      .map(name => distribution.find(m => m.name === name))
      .filter(Boolean)
      .map(med => ({
        name: med.name,
        // Defaults — the doctor can change these in the form
        type: 'dilution',
        potency: '30',
        form: 'pills',
        quantity: 3,
        frequency: 'BD',
        meal: 'BM',
        water: '',
        teaspoons: '',
        remarks: '',
      }));
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{t('Prescription','पर्चा')}</h3>
            <p className="text-sm text-slate-600 mt-1">
              {prePopulatedMeds.length > 0
                ? t(`${prePopulatedMeds.length} medicine(s) pre-filled from analysis. Adjust details below.`,
                    `${prePopulatedMeds.length} दवाएं विश्लेषण से भरी गई हैं। विवरण बदलें।`)
                : t('Build and save the prescription for this case','इस मामले के लिए पर्चा बनाएं और सहेजें')}
            </p>
          </div>
          <button 
            onClick={() => setStep(4)} 
            className="ghost-btn border border-slate-200 text-sm px-4 py-2.5 min-h-[44px]"
          >
            ← {t('Back to Results','परिणाम पर वापस')}
          </button>
        </div>
        <PrescriptionForm
          currentUser={currentUser}
          key={`prescription-${prePopulatedMeds.map(m => m.name).join('-') || selectedMedicine || 'empty'}`}
          analysisData={{ ...analysisResult, patientName: patientNameInput, patientAge, patientGender, patientWeight, patientContact }}
          selectedMedicine={selectedMedicine}
          prePopulatedMedicines={prePopulatedMeds}
          lang={lang}
          onPrescriptionSaved={onPrescriptionSaved}
        />
      </div>
    );
  };

  // Check if symptoms have been entered
  const hasSymptoms = symptoms.some(s => s.trim().length > 0);
  
  return (
    <div className="relative min-h-screen">
      {/* Premium background with subtle gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent -z-10" />
      
      <div className="relative space-y-6 z-0">
        {/* Premium Header Card */}
        <div className="relative group">
          {/* Gradient border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
          
          <div className="relative bg-gradient-to-br from-white via-white to-slate-50/50 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-200/50 p-4 sm:p-6 lg:p-8">
            {/* Shine effect */}
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
            
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
              <div className="flex items-start gap-3 sm:gap-5 flex-1 min-w-0">
                {/* Premium icon */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-20 blur-lg animate-pulse" />
                  <div className="relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#062E6F] to-blue-700 shadow-xl shadow-blue-500/30">
                    <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#062E6F] via-blue-700 to-purple-700 tracking-tight mb-2 leading-tight">
                    {hasSymptoms 
                      ? t('AI Rubric Analyzer','AI रुब्रिक विश्लेषक')
                      : t('Repertorization','रेपरटोराइज़ेशन')
                    }
                  </h2>
                  <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {hasSymptoms ? 'AI Powered' : 'Classical'}
                    </span>
                    {hasSymptoms 
                      ? t('Powered by Groq LLaMA 3.3 · Kent, Mastersheet & custom repertories','Groq LLaMA 3.3 द्वारा संचालित')
                      : t('Classical homeopathic repertorization with digital tools','शास्त्रीय होम्योपैथिक रेपरटोराइज़ेशन')
                    }
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Run AI Analysis Button - Prominent */}
                {canRunAnalysis && !analysisResult && step === 2 && (
                  <button
                    onClick={handleRunAnalysis}
                    disabled={analyzing}
                    className="group relative px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-105 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#062E6F] via-blue-600 to-blue-700 rounded-xl transition-all duration-300 group-hover:from-blue-700 group-hover:via-blue-600 group-hover:to-[#062E6F]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <span className="relative text-white flex items-center gap-3">
                      {analyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {t('Analyzing...','विश्लेषण कर रहे हैं...')}
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          {t('Run AI Analysis','AI विश्लेषण चलाएं')}
                        </>
                      )}
                    </span>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                  </button>
                )}
                
                {/* New Analysis Button - When results exist */}
                {analysisResult && (
                  <button
                    onClick={() => { 
                      setStep(1); 
                      setAnalysisResult(null); 
                      setSymptoms(EMPTY_SYMPTOMS); 
                      setSelectedRep(null); 
                      setPatientNameInput(''); 
                      setPatientContact('');
                      setPatientAge('');
                      setPatientGender('');
                      setPatientWeight('');
                      setHasPromptedPatient(false); 
                      setSelectedMedicine('');
                      setSelectedMedicines([]);
                    }}
                    className="group relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
                  >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl transition-all duration-300 group-hover:from-slate-200 group-hover:to-slate-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-400/0 via-slate-400/10 to-slate-400/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <span className="relative text-slate-700 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                      {t('New Analysis','नया विश्लेषण')}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Premium Horizontal Tabs */}
      {renderTabNavigation()}
      
      {renderContextBar()}

      {/* Premium Content Container */}
      <div className="relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-blue-50/20 rounded-3xl -z-10" />
        
        <div className="min-h-[500px] pb-20 lg:pb-0">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3Analysis()}
          {step === 4 && renderStep4Results()}
          {step === 5 && renderStep5Prescription()}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            const locked = step < s.id;
            
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (done || active) {
                    setStep(s.id);
                  }
                }}
                disabled={locked}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all min-w-[60px] min-h-[60px] ${
                  active 
                    ? 'bg-[#062E6F] text-white shadow-md' 
                    : done 
                      ? 'text-emerald-600 hover:bg-emerald-50' 
                      : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                {done && !active ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <Icon className="h-5 w-5 shrink-0" />
                )}
                <span className="text-[9px] font-bold text-center leading-tight">
                  {s.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}
