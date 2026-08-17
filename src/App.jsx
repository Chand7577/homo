import React, { useState, useMemo, useEffect } from 'react';
import { 
  statsData, 
  coreTeamMembers, 
  medicinesData, 
  rubricsData, 
  translations 
} from './dashboardData';
import RubricAnalyzer from './components/RubricAnalyzer';
import AnalysisHistoryTab from './components/AnalysisHistoryTab';
import RepertoriesTab from './components/RepertoriesTab';
import ChatTab from './components/ChatTab';
import PatientDashboardTab from './components/PatientDashboardTab';
import ReferenceLibrary from './components/ReferenceLibrary';
import MedicineManagement from './components/MedicineManagement';
import RubricManagement from './components/RubricManagement';
import PrescriptionModal from './components/PrescriptionModal';
import SharePrescriptionModal from './components/SharePrescriptionModal';
import PatientsDatabase from './components/PatientsDatabase';
import RecentPatients from './components/RecentPatients';
import UserManagement from './components/UserManagement';
import AuthWrapper from './components/AuthWrapper';
import KentOCRTab from './components/KentOCRTab';
import ManualRepertorization from './components/ManualRepertorization';
import ProfilePage from './components/ProfilePage';
import DrNautiyalWebsite from './components/DrNautiyalWebsite';
import { getPrescriptions, getDoctors, createDoctor, deleteDoctor, getDoctorStats, getPatientStats, deletePrescription, getAnalyses, getAnalysis, getPatients, createPatient, getConsultations, updateConsultation, getAnalysisStats } from './services/api';
import { authService } from './services/authService';
import { io } from 'socket.io-client';
import logoImg from './assets/logo.png';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Activity, 
  Pill, 
  Bookmark, 
  BookOpen, 
  Terminal, 
  Languages, 
  LogOut, 
  Search, 
  Plus, 
  User, 
  Globe, 
  UserCheck, 
  Lock,
  ChevronRight,
  TrendingUp,
  Clock,
  PlusCircle,
  Database,
  FileText,
  MessageSquare,
  HeartPulse,
  Eye,
  AlertCircle,
  CheckCircle,
  Trash2,
  Share2,
  Menu,
  X,
  ScanText,
  Phone,
  Mail,
  List
} from 'lucide-react';

function App() {
  // Main view state: 'website' for Dr. J.P. Nautiyal public website, 'app' for clinical portal
  const [viewMode, setViewMode] = useState(() => {
    // Default to 'app' (login) - users can access website via banner/logo
    const path = window.location.pathname;
    if (path === '/website' || path.includes('/website')) return 'website';
    return 'app'; // Show login by default
  });

  // Sync viewMode with browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setViewMode(path === '/website' || path.includes('/website') ? 'website' : 'app');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser history when viewMode changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    const targetPath = viewMode === 'website' ? '/website' : '/';
    
    if (currentPath !== targetPath) {
      window.history.pushState({ viewMode }, '', targetPath);
    }
  }, [viewMode]);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // User Role State: 'Admin', 'Core Team', 'External Doctor', 'Patient'
  const [userRole, setUserRole] = useState('Admin');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('Dashboard'); // 'Dashboard', 'Core team', 'Patients', 'Rubric Analyzer', 'Medicines', 'Rubrics', 'Repertories', 'System logs'
  
  // Patient Cases Tab State
  const [patientCaseTab, setPatientCaseTab] = useState('pending'); // 'pending', 'completed', 'all'

  // Language State: 'en' for English, 'hi' for Hindi
  const [lang, setLang] = useState('en');

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = authService.getCurrentUser();
      const hasToken = Boolean(localStorage.getItem('homeo_auth_token'));
      
      // Instant local initialization for zero-lag mobile startup
      if (savedUser && hasToken) {
        setCurrentUser(savedUser);
        setUserRole(savedUser.role);
        setIsLoggedIn(true);
      } else {
        return;
      }

      try {
        // Verify profile in background
        const profile = await authService.getProfile();
        const user = profile.user;
        if (user?.status === 'Approved') {
          localStorage.setItem('homeo_user', JSON.stringify(user));
          setCurrentUser(user);
          setUserRole(user.role);
        }
      } catch (err) {
        // Only clear storage and logout on true 401 Unauthorized (expired/invalid token)
        if (err.response?.status === 401) {
          localStorage.removeItem('homeo_user');
          localStorage.removeItem('homeo_auth_token');
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      }
    };
    checkAuth();
  }, []);

  // Handle authentication success
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setIsLoggedIn(true);
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole('Admin');
  };

  // Search/Filters states
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal / Add states
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', email: '', phone: '', status: 'Active' });
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Male', contact: '', symptoms: '' });
  
  // External Doctors states
  const [showAddExternalDoctorModal, setShowAddExternalDoctorModal] = useState(false);
  const [newExternalDoctor, setNewExternalDoctor] = useState({ name: '', phone: '', email: '', specialization: '', status: 'Active' });
  const [externalDoctors, setExternalDoctors] = useState([]);
  
  // Prescription modal states
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPrescriptionForShare, setSelectedPrescriptionForShare] = useState(null);

  // Custom data arrays (with state so user can append new entries dynamically)
  const [team, setTeam] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescLoading, setPrescLoading] = useState(false);
  const [prescriptionSearch, setPrescriptionSearch] = useState('');
  const [prescPage, setPrescPage] = useState(1);
  const PRESC_PAGE_SIZE = 10;
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  
  // Doctor statistics
  const [doctorStats, setDoctorStats] = useState({
    totalDoctors: 0,
    coreTeam: 0,
    externalDoctors: 0,
    onBreak: 0
  });

  // Patient statistics
  const [patientStats, setPatientStats] = useState({
    totalPatients: 0,
    patientsThisMonth: 0,
    growthPercentage: 0,
    recentPatients: []
  });
  const [patientStatsLoading, setPatientStatsLoading] = useState(false);

  // Analysis statistics (per-doctor)
  const [analysisStats, setAnalysisStats] = useState({
    totalAnalyses: 0,
    referredPatients: 0,
    remediesUsed: 0
  });
  const [analysisStatsLoading, setAnalysisStatsLoading] = useState(false);

  // Recent analyses — drives the 'Recent Patients' widget
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  // Doctors available for patient selection — all core team members
  const doctorsList = team.filter(m =>
    m.role.toLowerCase().includes('doctor') ||
    m.role.toLowerCase().includes('physician') ||
    m.role.toLowerCase().includes('consultant') ||
    m.role.toLowerCase().includes('specialist') ||
    m.role.toLowerCase().includes('pharmacist')
  ).concat([
    { id: 'ext-1', name: 'Dr. Rahul Sharma', role: 'External Consultant Doctor', status: 'Active', initials: 'RS', color: 'bg-indigo-600' }
  ]);

  // Load prescriptions from backend (non-blocking — dashboard still works if server is down)
  // Debounced search: waits 500ms after user stops typing
  useEffect(() => {
    // Only fetch if user is logged in (Edge compatibility)
    if (!isLoggedIn || !currentUser) return;
    
    const timer = setTimeout(() => {
      setPrescLoading(true);
      getPrescriptions({ search: prescriptionSearch })
        .then(res => setPrescriptions(res.data || []))
        .catch(() => {}) // silently fail — backend may not be running yet
        .finally(() => setPrescLoading(false));
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [prescriptionSearch, isLoggedIn, currentUser]); // Wait for auth to complete

  // Load recent analyses for the Recent Patients widget (clinical users only)
  const loadRecentAnalyses = async () => {
    // Only load if user is logged in (analyses are user-specific)
    if (!isLoggedIn || !currentUser) return;
    
    // Patients don't need recent analyses widget (they see their own in PatientDashboardTab)
    if (currentUser.role === 'Patient') return;
    
    try {
      const result = await getAnalyses({ limit: 10 });
      setRecentAnalyses(result.data || []);
    } catch (error) {
      console.error('Failed to load recent analyses:', error);
      setRecentAnalyses([]);
    }
  };

  // Load patient statistics from backend (only for clinical users)
  useEffect(() => {
    // Only fetch if user is logged in (Edge compatibility)
    if (!isLoggedIn || !currentUser) return;
    if (currentUser.role === 'Patient') return;
    
    const abortController = new AbortController();
    
    const fetchPatientStats = async () => {
      setPatientStatsLoading(true);
      try {
        const stats = await getPatientStats();
        if (abortController.signal.aborted) return;
        setPatientStats(stats || {
          totalPatients: 0,
          patientsThisMonth: 0,
          growthPercentage: 0,
          recentPatients: []
        });
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') return;
        console.error('❌ Failed to load patient stats:', error);
      } finally {
        if (!abortController.signal.aborted) {
          setPatientStatsLoading(false);
        }
      }
    };
    
    fetchPatientStats();
    
    return () => abortController.abort();
  }, [isLoggedIn, currentUser]); // Wait for auth to complete

  // Load analysis statistics from backend (only for clinical users - per-doctor)
  useEffect(() => {
    // Only fetch if user is logged in (Edge compatibility)
    if (!isLoggedIn || !currentUser) return;
    if (currentUser.role === 'Patient') return;
    
    const abortController = new AbortController();
    
    const fetchAnalysisStats = async () => {
      setAnalysisStatsLoading(true);
      try {
        const stats = await getAnalysisStats();
        if (abortController.signal.aborted) return;
        setAnalysisStats(stats || {
          totalAnalyses: 0,
          referredPatients: 0,
          remediesUsed: 0
        });
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') return;
        console.error('❌ Failed to load analysis stats:', error);
      } finally {
        if (!abortController.signal.aborted) {
          setAnalysisStatsLoading(false);
        }
      }
    };
    
    fetchAnalysisStats();
    
    return () => abortController.abort();
  }, [isLoggedIn, currentUser]); // Wait for auth to complete

  // Load patients from backend
  useEffect(() => {
    // Only fetch if user is logged in AND is a clinical user (not a patient)
    if (!isLoggedIn || !currentUser) return;
    if (currentUser.role === 'Patient') return;
    
    const abortController = new AbortController();
    
    const fetchPatients = async () => {
      setPatientsLoading(true);
      try {
        const result = await getPatients({ limit: 1000 }); // Get all patients
        if (abortController.signal.aborted) return;
        
        const patientsData = result.data || [];
        
        // Format patients for display
        const formattedPatients = patientsData.map(p => ({
          ...p,
          id: p._id || p.id,
          lastVisit: p.lastVisit || p.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          genderHindi: p.gender === 'Male' ? 'पुरुष' : p.gender === 'Female' ? 'महिला' : 'अन्य',
          symptomsHindi: p.symptoms || ''
        }));
        
        setPatients(formattedPatients);
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') return;
        console.error('❌ Failed to load patients:', error);
        setPatients([]);
      } finally {
        if (!abortController.signal.aborted) {
          setPatientsLoading(false);
        }
      }
    };
    
    fetchPatients();
    
    return () => abortController.abort();
  }, [isLoggedIn, currentUser]); // Wait for auth to complete

  // Load recent analyses when user logs in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadRecentAnalyses();
    }
  }, [isLoggedIn, currentUser]);

  // Load doctors (Core Team and External) from backend
  useEffect(() => {
    // Only fetch if user is logged in (Edge compatibility)
    if (!isLoggedIn || !currentUser) return;
    
    const abortController = new AbortController();
    
    const fetchDoctors = async () => {
      setDoctorsLoading(true);
      try {
        // Fetch core team
        const coreTeamData = await getDoctors({ type: 'Core Team' });
        if (abortController.signal.aborted) return;
        setTeam(coreTeamData || []);
        
        // Fetch external doctors
        const externalData = await getDoctors({ type: 'External Doctor' });
        if (abortController.signal.aborted) return;
        setExternalDoctors(externalData || []);
        
        // Fetch stats
        const stats = await getDoctorStats();
        if (abortController.signal.aborted) return;
        setDoctorStats(stats || { totalDoctors: 0, coreTeam: 0, externalDoctors: 0, onBreak: 0 });
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') return;
        console.error('Failed to load doctors:', error);
        setTeam([]);
        setExternalDoctors([]);
      } finally {
        if (!abortController.signal.aborted) {
          setDoctorsLoading(false);
        }
      }
    };
    
    fetchDoctors();
    
    return () => abortController.abort();
  }, [isLoggedIn, currentUser]); // Wait for auth to complete

  // ── Patient Symptom Queue (loaded dynamically from backend per role) ──
  const [patientSymptomQueue, setPatientSymptomQueue] = useState([]);

  // Fetch consultations from backend (strictly scoped to doctor role)
  useEffect(() => {
    if (!isLoggedIn || !currentUser || userRole === 'Patient') return;

    const abortController = new AbortController();
    
    // Helper: parse numbered symptom text ("1. fever\n2. headache") into array
    const parseSymptomText = (text) => {
      if (!text || !text.trim()) return [];
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      const parsed = lines.map(line => {
        const match = line.match(/^\d+[.)\s]\s*(.+)$/);
        return match ? match[1].trim() : line;
      });
      return parsed.filter(s => s);
    };

    const fetchConsultations = async () => {
      try {
        const res = await getConsultations();
        if (abortController.signal.aborted) return;
        
        if (res && res.success && Array.isArray(res.consultations)) {
          const formattedQueue = res.consultations.map(c => {
            // Parse the symptom text into individual rows for the RubricAnalyzer
            const parsedSymptoms = parseSymptomText(c.symptomsDescription);
            return {
              id: c._id,
              consultationId: c._id,
              patientName: c.patientName,
              age: c.patientAge,
              gender: c.patientGender,
              weight: c.patientWeight,
              submittedAt: c.submittedAt || c.createdAt,
              symptoms: parsedSymptoms.length > 0 ? parsedSymptoms : (c.symptomsDescription ? [c.symptomsDescription] : []),
              fullSymptomText: c.symptomsDescription || '',
              language: c.language || 'en',
              status: c.status || 'Pending',
              assignedDoctorId: String(c.assignedDoctorId?._id || c.assignedDoctorId || ''),
              assignedDoctorName: c.assignedDoctorName || c.assignedDoctorId?.name || ''
            };
          });
          setPatientSymptomQueue(formattedQueue);
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') return;
        console.error('Failed to load consultations from backend:', err);
      }
    };

    fetchConsultations();
    
    return () => abortController.abort();
  }, [isLoggedIn, currentUser, userRole]);

  // Strict role-based filter: Admins see all, Doctors see ONLY symptoms assigned to them
  const visibleSymptomQueue = useMemo(() => {
    if (!currentUser || userRole === 'Patient') return [];
    if (userRole === 'Admin') return patientSymptomQueue;
    const currentId = String(currentUser._id || currentUser.id || '');
    return patientSymptomQueue.filter(q => String(q.assignedDoctorId) === currentId);
  }, [patientSymptomQueue, userRole, currentUser]);

  // ✅ SOCKET.IO CONNECTION FOR REAL-TIME SYMPTOM NOTIFICATIONS
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only logged-in clinical staff with a valid auth token need real-time socket connections
    const token = localStorage.getItem('homeo_auth_token');
    if (!isLoggedIn || !token || userRole === 'Patient') return;

    const newSocket = io('https://homeoai-backend-83yt.onrender.com', {
      transports: ['polling', 'websocket'],
      withCredentials: true,
      auth: { token: localStorage.getItem('homeo_auth_token') },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    newSocket.on('connect', () => {
      console.log('✅ Doctor Socket.IO connected:', newSocket.id);
      // Join doctor notification room using user ID
      if (currentUser?._id || currentUser?.id) {
        newSocket.emit('join_doctor_notifications', currentUser._id || currentUser.id);
      }
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('❌ Doctor Socket.IO connection error:', error);
    });

    // Listen for new symptom submissions (strictly for assigned doctor or admin)
    newSocket.on('new_symptom_submission', (data) => {
      console.log('📨 Received new symptom submission:', data);
      
      const currentDoctorId = String(currentUser?._id || currentUser?.id || '');
      const assignedDoctorId = String(data.assignedDoctorId || '');

      // Add to queue if user is Admin OR if submission is assigned specifically to current doctor
      if (userRole === 'Admin' || (currentDoctorId && currentDoctorId === assignedDoctorId)) {
        setPatientSymptomQueue(prev => {
          const exists = prev.find(q => String(q.id) === String(data.id) || String(q.consultationId) === String(data.id));
          if (exists) return prev;
          
          const newEntry = {
            id: data.id,
            consultationId: data.id,
            patientName: data.patientName,
            age: data.age,
            gender: data.gender,
            weight: data.weight,
            submittedAt: data.submittedAt || new Date().toISOString(),
            symptoms: data.symptoms || [data.fullSymptomText],
            fullSymptomText: data.fullSymptomText || '',
            language: data.language || 'en',
            status: data.status || 'Pending',
            assignedDoctorId: String(data.assignedDoctorId),
            assignedDoctorName: data.assignedDoctorName
          };

          return [newEntry, ...prev];
        });
        
        // Show browser notification if supported
        if (Notification.permission === 'granted') {
          new Notification('New Patient Symptom Submission', {
            body: `${data.patientName} (Age ${data.age}) has submitted new symptoms`,
            icon: '/favicon.svg'
          });
        }
      }
    });

    // Listen for urgent submissions to specific doctors
    newSocket.on('urgent_patient_symptom', (data) => {
      console.log('🚨 Received URGENT symptom submission:', data);
    });
    
    setSocket(newSocket);
    return () => newSocket.close();
  }, [userRole, currentUser]); // Re-connect when user changes

  // Request notification permission on mount
  useEffect(() => {
    if (userRole !== 'Patient' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isLoggedIn, userRole]);

  // Selected patient for rubric analysis (set by doctor in Patients tab)
  const [selectedPatientForAnalysis, setSelectedPatientForAnalysis] = useState(null);
  
  // Loaded analysis from history (for viewing/editing)
  const [loadedAnalysis, setLoadedAnalysis] = useState(null);

  // Called when a patient submits new symptoms
  const handlePatientSymptomSubmit = (submissionEntry) => {
    setPatientSymptomQueue(prev => [submissionEntry, ...prev]);
  };

  // Called when doctor clicks Analyze on a queue entry
  const handleAnalyzePatient = async (entry) => {
    setLoadedAnalysis(null); // ← clear any previously loaded analysis
    setSelectedPatientForAnalysis(entry);
    setPatientSymptomQueue(prev =>
      prev.map(q => q.id === entry.id ? { ...q, status: 'In Progress' } : q)
    );
    navigateToTab('Rubric Analyzer');

    // Make backend call to update status to "In Progress"
    try {
      if (entry.consultationId || entry.id) {
        await updateConsultation(entry.consultationId || entry.id, { status: 'In Progress' });
      }
    } catch (err) {
      console.error('Failed to update consultation status:', err);
    }
  };

  // Role switcher handler
  const handleRoleChange = (role) => {
    setUserRole(role);
    setActiveTab('Dashboard');
  };

  // Prescription modal handler
  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  // Delete prescription handler
  const handleDeletePrescription = async (prescriptionId) => {
    const confirmDelete = window.confirm(
      lang === 'en' 
        ? 'Are you sure you want to delete this prescription? This action cannot be undone.' 
        : 'क्या आप वाकई इस प्रिस्क्रिप्शन को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
    );
    
    if (!confirmDelete) return;
    
    try {
      await deletePrescription(prescriptionId);
      // Remove from local state
      setPrescriptions(prev => prev.filter(rx => rx._id !== prescriptionId));
      alert(lang === 'en' ? 'Prescription deleted successfully' : 'प्रिस्क्रिप्शन सफलतापूर्वक हटाई गई');
    } catch (error) {
      console.error('Delete prescription error:', error);
      alert(lang === 'en' ? 'Failed to delete prescription' : 'प्रिस्क्रिप्शन हटाने में विफल');
    }
  };

  // Share prescription handler
  const handleSharePrescription = (prescription) => {
    setSelectedPrescriptionForShare(prescription);
    setShowShareModal(true);
  };

  // Handle new prescription saved - add to list in real-time
  const handlePrescriptionSaved = async (newPrescription) => {
    // Add the new prescription to the beginning of the list
    setPrescriptions(prev => [newPrescription, ...prev]);
    
    // Auto-navigate to Prescriptions tab to show the new prescription
    setActiveTab('Prescriptions');
    
    // Show success notification
    setTimeout(() => {
      alert(lang === 'en' 
        ? '✅ Prescription saved successfully and added to your prescriptions list!' 
        : '✅ प्रिस्क्रिप्शन सफलतापूर्वक सहेजी गई और आपकी सूची में जोड़ी गई!'
      );
    }, 100);

    // If this was from a patient symptom queue, mark it as completed
    if (selectedPatientForAnalysis?.id || selectedPatientForAnalysis?.consultationId) {
      const consultationId = selectedPatientForAnalysis.consultationId || selectedPatientForAnalysis.id;
      
      // Update local state
      setPatientSymptomQueue(prev =>
        prev.map(q => q.id === selectedPatientForAnalysis.id ? { ...q, status: 'Completed' } : q)
      );

      // Update backend status
      try {
        await updateConsultation(consultationId, { status: 'Completed' });
      } catch (err) {
        console.error('Failed to update consultation status to Completed:', err);
      }
    }
  };

  // Handle updated prescription
  const handlePrescriptionUpdated = (updatedPrescription) => {
    setPrescriptions(prev => prev.map(rx => rx._id === updatedPrescription._id ? updatedPrescription : rx));
    setSelectedPrescription(updatedPrescription);
  };

  // Handle loading analysis from history
  const handleLoadAnalysis = (analysisData) => {
    setLoadedAnalysis(analysisData);
    setActiveTab('Rubric Analyzer');
  };

  // Fetch full analysis (with matchedRubrics) then load into Rubric Analyzer
  const handleViewAnalysis = async (analysisOrId) => {
    try {
      const id = typeof analysisOrId === 'string' ? analysisOrId : analysisOrId._id;
      console.log('🔍 Fetching full analysis:', id);
      const fullAnalysis = await getAnalysis(id);
      console.log('✅ Received analysis:', {
        id: fullAnalysis._id,
        rubrics: fullAnalysis.matchedRubrics?.length || 0,
        medicines: fullAnalysis.medicineDistribution?.length || 0
      });
      handleLoadAnalysis(fullAnalysis);
    } catch (err) {
      console.error('❌ Failed to load analysis:', err);
    }
  };

  // Dynamic Navigation Items based on role
  const getNavItems = () => {
    switch (userRole) {
      case 'Patient':
        return [
          { name: 'Dashboard', nameHi: 'डैशबोर्ड', icon: LayoutDashboard },
          { name: 'Patient Symptom', nameHi: 'मरीज़ लक्षण', icon: HeartPulse },
          { name: 'Symptoms History', nameHi: 'लक्षण इतिहास', icon: Clock },
          { name: 'Prescriptions', nameHi: 'पर्चे', icon: FileText },
          { name: 'Chat', nameHi: 'चैट', icon: MessageSquare }
        ];
      case 'Core Team':
        return [
          { name: 'Dashboard', nameHi: 'डैशबोर्ड', icon: LayoutDashboard },
          { name: 'Patients', nameHi: 'मरीज़', icon: UserSquare2 },
          { name: 'Rubric Analyzer', nameHi: 'रुब्रिक विश्लेषक', icon: Activity },
          { name: 'Manual Repertorization', nameHi: 'मैनुअल रेपरटोराइज़ेशन', icon: List },
          { name: 'Analysis History', nameHi: 'विश्लेषण इतिहास', icon: Clock },
          { name: 'Reference Library', nameHi: 'संदर्भ लाइब्रेरी', icon: BookOpen },
          { name: 'Medicines', nameHi: 'दवाएं', icon: Pill },
          { name: 'Prescriptions', nameHi: 'पर्चे', icon: FileText },
          { name: 'Chat', nameHi: 'चैट', icon: MessageSquare }
        ];
      case 'External Doctor':
        return [
          { name: 'Dashboard', nameHi: 'डैशबोर्ड', icon: LayoutDashboard },
          { name: 'Patients', nameHi: 'मरीज़', icon: UserSquare2 },
          { name: 'Rubric Analyzer', nameHi: 'रुब्रिक विश्लेषक', icon: Activity },
          { name: 'Manual Repertorization', nameHi: 'मैनुअल रेपरटोराइज़ेशन', icon: List },
          { name: 'Analysis History', nameHi: 'विश्लेषण इतिहास', icon: Clock },
          { name: 'Reference Library', nameHi: 'संदर्भ लाइब्रेरी', icon: BookOpen },
          { name: 'Medicines', nameHi: 'दवाएं', icon: Pill },
          { name: 'Prescriptions', nameHi: 'पर्चे', icon: FileText },
          { name: 'Chat', nameHi: 'चैट', icon: MessageSquare }
        ];
      case 'Admin':
      default:
        return [
          { name: 'Dashboard', nameHi: 'डैशबोर्ड', icon: LayoutDashboard },
          { name: 'User Management', nameHi: 'उपयोगकर्ता प्रबंधन', icon: Users },
          { name: 'Core team', nameHi: 'मुख्य टीम', icon: Users },
          { name: 'External Doctors', nameHi: 'बाहरी डॉक्टर', icon: UserCheck },
          { name: 'Patients', nameHi: 'मरीज़', icon: UserSquare2 },
          { name: 'Rubric Analyzer', nameHi: 'रुब्रिक विश्लेषक', icon: Activity },
          { name: 'Manual Repertorization', nameHi: 'मैनुअल रेपरटोराइज़ेशन', icon: List },
          { name: 'Analysis History', nameHi: 'विश्लेषण इतिहास', icon: Clock },
          { name: 'Reference Library', nameHi: 'संदर्भ लाइब्रेरी', icon: BookOpen },
          { name: 'Medicines', nameHi: 'दवाएं', icon: Pill },
          { name: 'Rubrics', nameHi: 'रुब्रिक्स', icon: Bookmark },
          { name: 'Repertories', nameHi: 'रेपरटॉरी', icon: BookOpen },
          { name: 'Prescriptions', nameHi: 'पर्चे', icon: FileText },
          { name: 'Kent OCR', nameHi: 'केंट ओसीआर', icon: ScanText },
          { name: 'Chat', nameHi: 'चैट', icon: MessageSquare }
        ];
    }
  };

  const getRoleHeader = () => {
    const name = currentUser?.name || '';
    const initials = name
      ? name.split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase()
      : userRole === 'Patient' ? 'PT' : userRole === 'Core Team' ? 'CT' : userRole === 'External Doctor' ? 'ED' : 'AD';

    const titles = {
      Patient:           { en: 'Patient Dashboard',       hi: 'मरीज़ डैशबोर्ड' },
      'Core Team':       { en: 'Core Team Dashboard',     hi: 'मुख्य टीम डैशबोर्ड' },
      'External Doctor': { 
        en: currentUser?.specialization ? `External ${currentUser.specialization}` : 'External Doctor',
        hi: currentUser?.specialization ? `बाहरी ${currentUser.specialization}` : 'बाहरी डॉक्टर'
      },
      Admin:             { en: 'Admin Dashboard',         hi: 'एडमिन डैशबोर्ड' },
    };
    const title = titles[userRole] || titles.Admin;

    return { name: name || 'User', titleEn: title.en, titleHi: title.hi, logo: initials };
  };

  // Translations
  const t = translations[lang];

  // Helper for tab change
  const navigateToTab = (tabName) => {
    setActiveTab(tabName);
    setGlobalSearch('');
    // Clear loaded analysis when navigating away from Rubric Analyzer
    if (tabName !== 'Rubric Analyzer') {
      setLoadedAnalysis(null);
    }
  };

  // Add handlers
  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    if (!newTeamMember.name || !newTeamMember.role || !newTeamMember.email || !newTeamMember.phone) return;

    try {
      const doctorData = {
        name: newTeamMember.name,
        role: newTeamMember.role,
        email: newTeamMember.email,
        phone: newTeamMember.phone,
        status: newTeamMember.status || 'Active',
        type: 'Core Team'
      };

      const createdDoctor = await createDoctor(doctorData);
      setTeam([...team, createdDoctor]);
      
      // Refresh stats
      const stats = await getDoctorStats();
      setDoctorStats(stats || doctorStats);
      
      setNewTeamMember({ name: '', role: '', email: '', phone: '', status: 'Active' });
      setShowAddTeamModal(false);
    } catch (error) {
      console.error('Failed to add team member:', error);
      alert('Failed to add team member. Please try again.');
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age || !newPatient.contact) return;

    try {
      const patientData = {
        name: newPatient.name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender,
        contact: newPatient.contact,
        symptoms: newPatient.symptoms || 'General Checkup'
      };

      const createdPatient = await createPatient(patientData);
      
      // Add to local state
      const formattedPatient = {
        ...createdPatient,
        id: createdPatient._id,
        lastVisit: new Date().toISOString().split('T')[0],
        genderHindi: createdPatient.gender === 'Male' ? 'पुरुष' : 'महिला',
        symptomsHindi: patientData.symptoms
      };
      setPatients([formattedPatient, ...patients]);
      
      // Refresh patient stats
      const stats = await getPatientStats();
      setPatientStats(stats || patientStats);
      
      setNewPatient({ name: '', age: '', gender: 'Male', contact: '', symptoms: '' });
      setShowAddPatientModal(false);
    } catch (error) {
      console.error('Failed to add patient:', error);
      alert('Failed to add patient. Please try again.');
    }
  };

  const handleAddExternalDoctor = async (e) => {
    e.preventDefault();
    if (!newExternalDoctor.name || !newExternalDoctor.phone || !newExternalDoctor.email) return;

    try {
      const doctorData = {
        name: newExternalDoctor.name,
        phone: newExternalDoctor.phone,
        email: newExternalDoctor.email,
        specialization: newExternalDoctor.specialization,
        status: newExternalDoctor.status || 'Active',
        type: 'External Doctor'
      };

      const createdDoctor = await createDoctor(doctorData);
      setExternalDoctors([...externalDoctors, createdDoctor]);
      
      // Refresh stats
      const stats = await getDoctorStats();
      setDoctorStats(stats || doctorStats);
      
      setNewExternalDoctor({ name: '', phone: '', email: '', specialization: '', status: 'Active' });
      setShowAddExternalDoctorModal(false);
    } catch (error) {
      console.error('Failed to add external doctor:', error);
      alert('Failed to add external doctor. Please try again.');
    }
  };

  // Remove handlers
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm(lang === 'en' ? 'Remove this team member? They will no longer have access.' : 'इस टीम सदस्य को हटाएं? उनकी पहुंच समाप्त हो जाएगी।')) return;
    try {
      await deleteDoctor(memberId);
      setTeam(prev => prev.filter(m => (m._id || m.id) !== memberId));
      const stats = await getDoctorStats();
      setDoctorStats(stats || doctorStats);
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert(lang === 'en' ? 'Failed to remove member. Please try again.' : 'सदस्य हटाने में विफल। कृपया पुनः प्रयास करें।');
    }
  };

  const handleRemoveExternalDoctor = async (doctorId) => {
    if (!window.confirm(lang === 'en' ? 'Remove this external doctor? They will no longer have access.' : 'इस बाहरी डॉक्टर को हटाएं? उनकी पहुंच समाप्त हो जाएगी।')) return;
    try {
      await deleteDoctor(doctorId);
      setExternalDoctors(prev => prev.filter(d => (d._id || d.id) !== doctorId));
      const stats = await getDoctorStats();
      setDoctorStats(stats || doctorStats);
    } catch (err) {
      console.error('Failed to remove external doctor:', err);
      alert(lang === 'en' ? 'Failed to remove doctor. Please try again.' : 'डॉक्टर हटाने में विफल। कृपया पुनः प्रयास करें।');
    }
  };

  // Filtered Lists based on search term
  const filteredTeam = useMemo(() => {
    return team.filter(m => 
      m.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      m.role.toLowerCase().includes(globalSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [team, globalSearch]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.symptoms.toLowerCase().includes(globalSearch.toLowerCase()) ||
      (p.symptomsHindi && p.symptomsHindi.includes(globalSearch)) ||
      p.contact.includes(globalSearch)
    );
  }, [patients, globalSearch]);

  const filteredRubrics = useMemo(() => {
    return rubricsData.filter(r => {
      const matchCat = selectedCategory === 'All' || r.chapter === selectedCategory;
      const matchText = r.symptom.toLowerCase().includes(globalSearch.toLowerCase()) ||
                        r.symptomHindi.includes(globalSearch);
      return matchCat && matchText;
    });
  }, [globalSearch, selectedCategory]);

  // Note: Repertories are now loaded dynamically via RepertoriesTab component from backend
  // No need for client-side filtering of mock data

  const filteredExternalDoctors = useMemo(() => {
    return externalDoctors.filter(doc => 
      doc.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(globalSearch.toLowerCase()) ||
      doc.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
      doc.phone.includes(globalSearch)
    );
  }, [externalDoctors, globalSearch]);

  // Public Website View Mode
  if (viewMode === 'website') {
    return (
      <DrNautiyalWebsite 
        onLaunchApp={() => setViewMode('app')}
      />
    );
  }

  // Lock Screen view - Show AuthWrapper if not logged in
  if (!isLoggedIn) {
    return (
      <AuthWrapper 
        onAuthSuccess={handleAuthSuccess}
        lang={lang}
        onLanguageChange={() => setLang(lang === 'en' ? 'hi' : 'en')}
        onViewWebsite={() => setViewMode('website')}
      />
    );
  }

  const renderSidebarContent = (isMobile = false) => {
    const roleHeader = getRoleHeader();
    return (
      <div className="w-64 flex flex-col h-full bg-[#062E6F] relative">
        {/* Brand Header */}
        <div className="flex items-center justify-center h-[72px] border-b border-[#00A3B4]/20 bg-[#042050]/40 shrink-0 relative">
          {!isMobile && (
            <Menu className="absolute left-[28px] h-6 w-6 text-slate-300 transition-opacity duration-200 opacity-100 group-hover:opacity-0" />
          )}
          <div className={`transition-opacity duration-200 whitespace-nowrap overflow-hidden flex items-center justify-center ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <img src={logoImg} alt="Homeo AI Logo" className="h-8 object-contain shrink-0" />
          </div>
          {isMobile && (
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-4 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Sidebar Header */}
        <div className="flex items-center px-5 py-5 border-b border-[#00A3B4]/20 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#062E6F] flex items-center justify-center text-white font-bold text-sm shrink-0 ring-1 ring-white/10 shadow-sm">
            {roleHeader.logo}
          </div>
          <div className={`ml-4 whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <h2 className="font-bold text-sm leading-tight text-white">{roleHeader.name}</h2>
            <span className="text-[10px] text-emerald-400 font-medium tracking-wide flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              {lang === 'en' ? roleHeader.titleEn : roleHeader.titleHi}
            </span>
          </div>
        </div>

        {/* Navigation Options */}
        <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto thin-scroll">
          {getNavItems().map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.name;
            
            // Show notification badge for Patients tab when there are pending submissions
            const pendingCount = item.name === 'Patients' && userRole !== 'Patient' 
              ? visibleSymptomQueue.filter(q => q.status === 'Pending').length 
              : 0;
            
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigateToTab(item.name);
                  if (isMobile) setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all text-left relative min-h-[48px] overflow-hidden ${
                  isSelected 
                    ? 'bg-[#062E6F] text-white shadow-sm ring-1 ring-white/10' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <div className="w-6 flex items-center justify-center shrink-0">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                </div>
                
                <span className={`ml-4 whitespace-nowrap flex-1 transition-opacity duration-200 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {lang === 'en' ? item.name : item.nameHi}
                </span>
                
                {/* Notification badge for pending symptoms */}
                {pendingCount > 0 && (
                  <span className={`absolute right-3 bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 font-bold animate-pulse whitespace-nowrap transition-opacity duration-200 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {pendingCount}
                  </span>
                )}
                
                {isSelected && !pendingCount && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#00A3B4]/20 bg-[#042050]/60 space-y-3 shrink-0">
          <div className={`flex items-center justify-between text-[10px] text-slate-500 font-semibold px-2 transition-opacity duration-200 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <span>v1.2.6</span>
            <span className="flex items-center gap-1.5 text-emerald-500/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block shadow-[0_0_5px_#10b981]"></span>
              <span className="whitespace-nowrap">{lang === 'en' ? 'Online' : 'ऑनलाइन'}</span>
            </span>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-semibold border border-slate-700/50 min-h-[48px] bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 transition-colors text-slate-300"
          >
            <div className="w-6 flex items-center justify-center shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {t.logout}
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#F8F6F0] grain flex flex-col md:flex-row font-sans">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-20 hover:w-64 transition-all duration-300 ease-in-out bg-[#062E6F] text-slate-100 flex-col shrink-0 border-r border-[#00A3B4]/20 shadow-xl group overflow-hidden z-40 sticky top-0 h-screen">
        {renderSidebarContent(false)}
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <aside className="relative w-64 bg-[#062E6F] text-slate-100 flex flex-col shrink-0 border-r border-[#00A3B4]/20 shadow-2xl h-full z-10 animate-slide-in overflow-hidden">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-h-0 flex flex-col min-w-0">
        
        {/* HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 md:py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-2">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">
              {userRole === 'Admin' && (lang === 'en' ? "HOMEO A.I — Admin Dashboard" : "होमियो ए.आई. — एडमिन डैशबोर्ड")}
              {userRole === 'Core Team' && (lang === 'en' ? "HOMEO A.I — Core Doctor Dashboard" : "होमियो ए.आई. — मुख्य डॉक्टर डैशबोर्ड")}
              {userRole === 'External Doctor' && (lang === 'en' ? "HOMEO A.I — External Dashboard" : "होमियो ए.आई. — बाहरी डैशबोर्ड")}
              {userRole === 'Patient' && (lang === 'en' ? "HOMEO A.I — Patient Dashboard" : "होमियो ए.आई. — मरीज़ डैशबोर्ड")}
            </h1>
            <h1 className="text-lg font-bold text-slate-800 md:hidden">
              HOMEO A.I
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 shadow-sm rounded-lg transition-colors"
              title={lang === 'en' ? "Switch to Hindi" : "अंग्रेजी में बदलें"}
            >
              <Languages className="h-4 w-4 text-[#062E6F]" />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Profile Settings Button (Hidden for Admin) */}
            {userRole !== 'Admin' && (
              <button
                onClick={() => navigateToTab('Profile')}
                className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 shadow-sm rounded-lg transition-colors"
                title={lang === 'en' ? "Profile Settings" : "प्रोफ़ाइल सेटिंग्स"}
              >
                <User className="h-4 w-4 text-[#062E6F]" />
                <span className="hidden xs:inline">{lang === 'en' ? 'Profile' : 'प्रोफ़ाइल'}</span>
              </button>
            )}

            {/* Logout Button on Mobile */}
            <button
              onClick={handleLogout}
              className="md:hidden border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs p-2 rounded-lg flex items-center justify-center shadow-sm"
              title={t.logout}
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Rubric Analyzer top right quick button (Hidden for patients) */}
            {userRole !== 'Patient' && (
              <button
                onClick={() => navigateToTab('Rubric Analyzer')}
                className="flex items-center justify-center bg-[#C86B5E] hover:bg-[#8B3A2A] text-white text-xs p-2.5 shadow-sm cursor-pointer rounded-lg transition-colors"
                title={t.topRightRubricBtn}
              >
                <Activity className="h-4 w-4" />
              </button>
            )}
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <div 
          id="main-content" 
          className={`flex-1 min-h-0 ${activeTab === 'Chat' ? 'p-0 overflow-hidden' : 'p-4 md:p-6 overflow-y-auto space-y-6'}`}
        >
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'Dashboard' && userRole === 'Admin' && (
            <div className="space-y-6">
              
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-no-repeat bg-right bg-contain grain"></div>
                <div className="relative z-10 space-y-2">
                  <span className="overline text-[#062E6F] font-bold tracking-wider">{t.admin}</span>
                  <h2 className="text-2xl font-bold">{t.welcome}</h2>
                  <p className="text-slate-400 text-xs md:text-sm">{t.subtitle}</p>
                </div>
              </div>

              {/* Stats Cards Grid (3 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Total Patients Card */}
                <div className="surface p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.totalPatients}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {patientStatsLoading ? '...' : patientStats.totalPatients}
                    </p>
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 mt-0.5 ${
                      patientStats.growthPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {patientStats.growthPercentage >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3 rotate-180" />
                      )}
                      {patientStats.growthPercentage >= 0 ? '+' : ''}{patientStats.growthPercentage}% {lang === 'en' ? 'this month' : 'इस महीने'}
                    </span>
                  </div>
                </div>

                {/* Total Core Team Card */}
                <div className="surface p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.totalCoreTeam}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{doctorStats.coreTeam}</p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      {lang === 'en' ? `${team.filter(m => m.status === 'Active').length} Active Doctors` : `${team.filter(m => m.status === 'Active').length} सक्रिय डॉक्टर`}
                    </span>
                  </div>
                </div>

                {/* External Doctors Card */}
                <div className="surface p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.externalDoctors}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{doctorStats.externalDoctors}</p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      {lang === 'en' ? "Referred partners network" : "संबद्ध पार्टनर नेटवर्क"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Layout - 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Column 1 (Left): Core Team (7 columns) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Core Team Grid (Quick Overview) */}
                  <div className="surface p-5">
                    <div className="flex justify-between items-center border-b border-slate-300 pb-3 mb-4">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#062E6F]" />
                        {lang === 'en' ? "Core Team Members" : "मुख्य टीम सदस्य"}
                      </h3>
                      <button 
                        onClick={() => navigateToTab('Core team')} 
                        className="text-xs text-[#062E6F] hover:underline flex items-center gap-0.5"
                      >
                        {lang === 'en' ? "Manage Team" : "टीम प्रबंधित करें"}
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {team.slice(0, 4).map((member) => (
                        <div key={member._id || member.id} className="p-3 border border-slate-300 rounded-xl bg-slate-50/50 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${member.color} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                            {member.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                            <p className="text-xs text-slate-500 truncate">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Column 2 (Right): Recent Patients (5 columns) */}
                <div className="lg:col-span-5">
                  <RecentPatients
                    patients={recentAnalyses}
                    lang={lang}
                    onNavigateToTab={navigateToTab}
                    onAnalyzePatient={handleViewAnalysis}
                    limit={5}
                  />
                </div>

              </div>

            </div>
          )}

          {/* DASHBOARD: CORE TEAM */}
          {activeTab === 'Dashboard' && userRole === 'Core Team' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-no-repeat bg-right bg-contain grain"></div>
                <div className="relative z-10 space-y-1">
                  <span className="overline text-emerald-300 font-bold tracking-wider text-xs">
                    {lang === 'en' ? 'CORE CLINICAL STAFF' : 'मुख्य क्लिनिकल स्टाफ'}
                  </span>
                  <h2 className="text-2xl font-bold">
                    {lang === 'en' ? `Welcome, ${currentUser?.name || 'Doctor'} 👋` : `स्वागत है, ${currentUser?.name || 'डॉक्टर'} 👋`}
                  </h2>
                  <p className="text-emerald-200 text-xs md:text-sm">
                    {lang === 'en'
                      ? "Manage your patients, run analyses, and write prescriptions."
                      : "अपने मरीजों का प्रबंधन करें, विश्लेषण चलाएं और पर्चे लिखें।"}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="surface p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl"><UserSquare2 className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{lang === 'en' ? "Referred Patients" : "रेफर किए गए मरीज़"}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{analysisStatsLoading ? '...' : analysisStats.referredPatients}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">{lang === 'en' ? 'Unique patients' : 'अद्वितीय मरीज़'}</span>
                  </div>
                </div>
                <div className="surface p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl"><FileText className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{lang === 'en' ? "Prescriptions" : "पर्चे"}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{prescriptions.length}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{lang === 'en' ? 'Total written' : 'कुल लिखे'}</span>
                  </div>
                </div>
                <div className="surface p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3.5 bg-blue-50 text-[#062E6F] rounded-xl"><Activity className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{lang === 'en' ? "AI Analyses" : "AI विश्लेषण"}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{analysisStatsLoading ? '...' : analysisStats.totalAnalyses}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{lang === 'en' ? 'Total performed' : 'कुल किए गए'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions + Recent Patients */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-[#062E6F]" />
                    {lang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
                  </h3>
                  {[
                    { label: lang === 'en' ? 'Run Rubric Analysis' : 'रुब्रिक विश्लेषण चलाएं', tab: 'Rubric Analyzer', color: 'bg-[#062E6F]', icon: Activity },
                    { label: lang === 'en' ? 'View Patients' : 'मरीज़ देखें', tab: 'Patients', color: 'bg-blue-600', icon: UserSquare2 },
                    { label: lang === 'en' ? 'View Prescriptions' : 'पर्चे देखें', tab: 'Prescriptions', color: 'bg-indigo-600', icon: FileText },
                    { label: lang === 'en' ? 'Team Chat' : 'टीम चैट', tab: 'Chat', color: 'bg-emerald-600', icon: MessageSquare },
                  ].map(({ label, tab, color, icon: Icon }) => (
                    <button key={tab} onClick={() => navigateToTab(tab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold ${color} hover:opacity-90 transition-opacity shadow-sm`}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-8">
                  <RecentPatients
                    patients={recentAnalyses}
                    lang={lang}
                    onNavigateToTab={navigateToTab}
                    onAnalyzePatient={handleViewAnalysis}
                    limit={6}
                  />
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD: EXTERNAL DOCTOR */}
          {activeTab === 'Dashboard' && userRole === 'External Doctor' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-no-repeat bg-right bg-contain grain"></div>
                <div className="relative z-10 space-y-1">
                  <span className="overline text-indigo-300 font-bold tracking-wider text-xs">
                    {lang === 'en' ? 'EXTERNAL DASHBOARD' : 'बाहरी डैशबोर्ड'}
                  </span>
                  <h2 className="text-2xl font-bold">
                    {lang === 'en' ? `Welcome, ${currentUser?.name || 'Doctor'} 👨‍⚕️` : `स्वागत है, ${currentUser?.name || 'डॉक्टर'} 👨‍⚕️`}
                  </h2>
                  <p className="text-indigo-200 text-xs md:text-sm">
                    {lang === 'en'
                      ? "Access the repertory, run AI analyses, and manage referred patients."
                      : "रेपरटॉरी तक पहुंचें, AI विश्लेषण चलाएं और रेफर किए गए मरीजों का प्रबंधन करें।"}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="surface p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl"><UserSquare2 className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{lang === 'en' ? "Referred Patients" : "रेफर किए गए मरीज़"}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{analysisStatsLoading ? '...' : analysisStats.referredPatients}</p>
                    <span className="text-[10px] text-blue-600 font-semibold">{lang === 'en' ? 'Under my care' : 'मेरी देखरेख में'}</span>
                  </div>
                </div>
                <div className="surface p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3.5 bg-blue-50 text-[#062E6F] rounded-xl"><Activity className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{lang === 'en' ? "AI Analyses" : "AI विश्लेषण"}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{analysisStatsLoading ? '...' : analysisStats.totalAnalyses}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{lang === 'en' ? 'Total performed' : 'कुल किए गए'}</span>
                  </div>
                </div>
                <div className="surface p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl"><Pill className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{lang === 'en' ? "Remedies Used" : "उपाय उपयोग"}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{analysisStatsLoading ? '...' : analysisStats.remediesUsed}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{lang === 'en' ? 'Unique medicines' : 'अद्वितीय दवाएं'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions + Recent Patients */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-[#062E6F]" />
                    {lang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: lang === 'en' ? 'Run AI Rubric Analysis' : 'AI रुब्रिक विश्लेषण', tab: 'Rubric Analyzer', color: 'bg-[#062E6F]', icon: Activity },
                      { label: lang === 'en' ? 'My Patients' : 'मेरे मरीज़', tab: 'Patients', color: 'bg-blue-600', icon: UserSquare2 },
                      { label: lang === 'en' ? 'Browse Medicines' : 'दवाएं देखें', tab: 'Medicines', color: 'bg-indigo-600', icon: Pill },
                      { label: lang === 'en' ? 'My Prescriptions' : 'मेरे पर्चे', tab: 'Prescriptions', color: 'bg-slate-600', icon: FileText },
                    ].map(({ label, tab, color, icon: Icon }) => (
                      <button key={tab} onClick={() => navigateToTab(tab)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold ${color} hover:opacity-90 transition-opacity shadow-sm`}>
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Patients */}
                <div className="lg:col-span-8">
                  <RecentPatients
                    patients={recentAnalyses}
                    lang={lang}
                    onNavigateToTab={navigateToTab}
                    onAnalyzePatient={handleViewAnalysis}
                    limit={6}
                  />
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD: PATIENT — uses full PatientDashboardTab */}
          {activeTab === 'Dashboard' && userRole === 'Patient' && (
            <PatientDashboardTab currentUser={currentUser} lang={lang} navigateToTab={navigateToTab} initialSubTab="dashboard" onSymptomSubmit={handlePatientSymptomSubmit} doctors={doctorsList} userRole={userRole} />
          )}

          {/* TAB: USER MANAGEMENT — Admin only */}
          {activeTab === 'User Management' && userRole === 'Admin' && (
            <UserManagement lang={lang} />
          )}

          {/* TAB 2: CORE TEAM */}
          {activeTab === 'Core team' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                    <Users className="h-6 w-6 text-[#062E6F]" />
                    {lang === 'en' ? "Core Team Members" : "मुख्य टीम सदस्य"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {lang === 'en' ? "Manage details, roles, and status of clinic doctors and admin team." : "क्लिनिक के डॉक्टरों और व्यवस्थापक टीम के विवरण, भूमिकाओं और स्थिति को प्रबंधित करें।"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddTeamModal(true)}
                  className="terracotta-btn self-start sm:self-center"
                >
                  <Plus className="h-4 w-4" />
                  {t.addMember}
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder={lang === 'en' ? "Search team members..." : "टीम के सदस्यों को खोजें..."}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
                  />
                </div>
              </div>

              {/* Desktop Members List Table */}
              <div className="hidden md:block surface overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-3 px-5">{t.name}</th>
                        <th className="py-3 px-5">{lang === 'en' ? 'Phone' : 'फोन'}</th>
                        <th className="py-3 px-5">{t.email}</th>
                        <th className="py-3 px-5">{t.status}</th>
                        <th className="py-3 px-5">{lang === 'en' ? 'Actions' : 'कार्रवाई'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 text-sm">
                      {filteredTeam.map((member) => (
                        <tr key={member._id || member.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5 font-semibold text-slate-700 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${member.color} text-white flex items-center justify-center font-bold text-xs`}>
                              {member.initials}
                            </div>
                            {member.name}
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 font-mono">{member.phone}</td>
                          <td className="py-3.5 px-5 text-slate-500">{member.email}</td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                              member.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              member.status === 'On Break' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {lang === 'en' ? member.status : (member.status === 'Active' ? 'सक्रिय' : member.status === 'On Break' ? 'छुट्टी पर' : 'निष्क्रिय')}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <button
                              onClick={() => handleRemoveMember(member._id || member.id)}
                              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors border border-red-100 hover:border-red-200"
                              title={lang === 'en' ? 'Remove member' : 'सदस्य हटाएं'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {lang === 'en' ? 'Remove' : 'हटाएं'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Core Team Card View */}
              <div className="md:hidden space-y-3">
                {filteredTeam.map((member) => (
                  <div key={member._id || member.id} className="surface p-4 space-y-3 border border-slate-300">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full ${member.color} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                          {member.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{member.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{member.email}</p>
                        </div>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                        member.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        member.status === 'On Break' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {lang === 'en' ? member.status : (member.status === 'Active' ? 'सक्रिय' : member.status === 'On Break' ? 'छुट्टी पर' : 'निष्क्रिय')}
                      </span>
                    </div>
                    <div className="border-t border-slate-300 pt-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700">{member.phone}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-300 pt-3">
                      <button
                        onClick={() => handleRemoveMember(member._id || member.id)}
                        className="w-full flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-200 font-semibold min-h-[44px]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {lang === 'en' ? 'Remove Member' : 'सदस्य हटाएं'}
                      </button>
                    </div>
                  </div>
                ))}
                {filteredTeam.length === 0 && (
                  <div className="surface p-8 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">{lang === 'en' ? 'No team members found' : 'कोई टीम सदस्य नहीं मिले'}</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: EXTERNAL DOCTORS */}
          {activeTab === 'External Doctors' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                    <UserCheck className="h-6 w-6 text-[#062E6F]" />
                    {lang === 'en' ? "External Doctors Management" : "बाहरी डॉक्टर प्रबंधन"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {lang === 'en' ? "Manage external consultant doctors, their contact information and specializations." : "बाहरी सलाहकार डॉक्टरों, उनकी संपर्क जानकारी और विशेषज्ञता का प्रबंधन करें।"}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddExternalDoctorModal(true)}
                  className="terracotta-btn self-start sm:self-center"
                >
                  <Plus className="h-4 w-4" />
                  {lang === 'en' ? "Add External Doctor" : "बाहरी डॉक्टर जोड़ें"}
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder={lang === 'en' ? "Search by name, phone, specialization..." : "नाम, फोन, विशेषज्ञता द्वारा खोजें..."}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
                  />
                </div>
              </div>

              {/* Desktop External Doctors Table */}
              <div className="hidden md:block surface overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-3 px-5">{lang === 'en' ? 'Name' : 'नाम'}</th>
                        <th className="py-3 px-5">{lang === 'en' ? 'Phone Number' : 'फोन नंबर'}</th>
                        <th className="py-3 px-5">{t.email}</th>
                        <th className="py-3 px-5">{lang === 'en' ? 'Specialization' : 'विशेषज्ञता'}</th>
                        <th className="py-3 px-5">{t.status}</th>
                        <th className="py-3 px-5">{lang === 'en' ? 'Actions' : 'कार्रवाई'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 text-sm">
                      {filteredExternalDoctors.map((doctor) => (
                        <tr key={doctor._id || doctor.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5 font-semibold text-slate-700 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${doctor.color} text-white flex items-center justify-center font-bold text-xs`}>
                              {doctor.initials}
                            </div>
                            {doctor.name}
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 font-mono">{doctor.phone}</td>
                          <td className="py-3.5 px-5 text-slate-500">{doctor.email}</td>
                          <td className="py-3.5 px-5 text-slate-600">{doctor.specialization}</td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                              doctor.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {lang === 'en' ? doctor.status : (doctor.status === 'Active' ? 'सक्रिय' : 'निष्क्रिय')}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <button
                              onClick={() => handleRemoveExternalDoctor(doctor._id || doctor.id)}
                              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors border border-red-100 hover:border-red-200"
                              title={lang === 'en' ? 'Remove doctor' : 'डॉक्टर हटाएं'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {lang === 'en' ? 'Remove' : 'हटाएं'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile External Doctors Card View */}
              <div className="md:hidden space-y-3">
                {filteredExternalDoctors.map((doctor) => (
                  <div key={doctor._id || doctor.id} className="surface p-4 space-y-3 border border-slate-300 hover:border-[#062E6F]/20 transition-all">
                    {/* Doctor Name & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full ${doctor.color || 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                          {doctor.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{doctor.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{doctor.specialization}</p>
                        </div>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                        doctor.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {lang === 'en' ? doctor.status : (doctor.status === 'Active' ? 'सक्रिय' : 'निष्क्रिय')}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="border-t border-slate-300 pt-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700">{doctor.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-600 truncate">{doctor.email}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-300 pt-3">
                      <button
                        onClick={() => handleRemoveExternalDoctor(doctor._id || doctor.id)}
                        className="w-full flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-200 hover:border-red-300 font-semibold min-h-[44px]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {lang === 'en' ? 'Remove Doctor' : 'डॉक्टर हटाएं'}
                      </button>
                    </div>
                  </div>
                ))}

                {filteredExternalDoctors.length === 0 && (
                  <div className="surface p-8 text-center text-slate-400">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">{lang === 'en' ? 'No external doctors found' : 'कोई बाहरी डॉक्टर नहीं मिले'}</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: PATIENTS */}
          {activeTab === 'Patients' && (
            <PatientsDatabase
              lang={lang}
              t={t}
              patientSymptomQueue={visibleSymptomQueue}
              setPatientSymptomQueue={setPatientSymptomQueue}
              filteredPatients={filteredPatients}
              patientsLoading={patientsLoading}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              setShowAddPatientModal={setShowAddPatientModal}
              handleAnalyzePatient={handleAnalyzePatient}
              navigateToTab={navigateToTab}
              patientCaseTab={patientCaseTab}
              setPatientCaseTab={setPatientCaseTab}
            />
          )}

          {/* TAB 4: RUBRIC ANALYZER */}
          {activeTab === 'Rubric Analyzer' && (
            <RubricAnalyzer
              currentUser={currentUser}
              lang={lang}
              patientSubmission={selectedPatientForAnalysis}
              loadedAnalysis={loadedAnalysis}
              onAnalysisComplete={(analysisResult) => {
                // Refresh recent analyses widget after each analysis
                loadRecentAnalyses();
                if (selectedPatientForAnalysis) {
                  setPatientSymptomQueue(prev =>
                    prev.map(q => q.id === selectedPatientForAnalysis.id ? { ...q, status: 'Analyzed' } : q)
                  );
                  setSelectedPatientForAnalysis(null);
                }
                // Clear loaded analysis after completion
                setLoadedAnalysis(null);
              }}
              onPrescriptionSaved={handlePrescriptionSaved}
            />
          )}

          {/* TAB 4.5: ANALYSIS HISTORY */}
          {activeTab === 'Analysis History' && (
            <AnalysisHistoryTab
              lang={lang}
              onLoadAnalysis={handleLoadAnalysis}
            />
          )}

          {/* TAB 4.6: MANUAL REPERTORIZATION */}
          {activeTab === 'Manual Repertorization' && (
            <ManualRepertorization
              currentUser={currentUser}
              lang={lang}
              onPrescriptionSaved={handlePrescriptionSaved}
            />
          )}

          {/* TAB 5: MEDICINES */}
          {activeTab === 'Medicines' && (
            <MedicineManagement lang={lang} />
          )}

          {/* TAB 6: RUBRICS */}
          {activeTab === 'Rubrics' && (
            <RubricManagement lang={lang} />
          )}

          {/* TAB: REFERENCE LIBRARY */}
          {activeTab === 'Reference Library' && (
            <ReferenceLibrary lang={lang} />
          )}

          {/* TAB 7: REPERTORIES */}
          {activeTab === 'Repertories' && (
            <RepertoriesTab lang={lang} navigateToTab={navigateToTab} />
          )}

          {/* TAB 8: PRESCRIPTIONS */}
          {activeTab === 'Prescriptions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-[#062E6F]" />
                    {lang === 'en' ? 'Prescriptions' : 'पर्चे'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {userRole === 'Patient' 
                      ? (lang === 'en' 
                          ? 'All prescriptions from your doctors. Click any to view details.' 
                          : 'आपके डॉक्टरों से सभी पर्चे। विवरण देखने के लिए किसी पर भी क्लिक करें।')
                      : (lang === 'en' 
                          ? `All prescriptions written by ${currentUser?.name || 'you'}. Click any to view details.` 
                          : `${currentUser?.name || 'आप'} द्वारा लिखे गए सभी पर्चे। विवरण देखने के लिए किसी पर भी क्लिक करें।`)
                    }
                  </p>
                </div>
                {userRole !== 'Patient' && (
                  <button 
                    onClick={() => {
                      setLoadedAnalysis(null);
                      navigateToTab('Rubric Analyzer');
                    }} 
                    className="terracotta-btn self-start sm:self-center"
                  >
                    <FileText className="h-4 w-4" />
                    {lang === 'en' ? 'New Analysis + Rx' : 'नया विश्लेषण'}
                  </button>
                )}
              </div>

              {/* Smart Search Bar */}
              <div className="surface p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={prescriptionSearch}
                    onChange={(e) => setPrescriptionSearch(e.target.value)}
                    placeholder={lang === 'en' 
                      ? 'Search by patient name, medicine, symptoms...' 
                      : 'मरीज़ का नाम, दवा, लक्षण से खोजें...'
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#062E6F]/20 focus:border-[#062E6F] transition-all"
                  />
                  {prescriptionSearch && (
                    <button
                      onClick={() => { setPrescriptionSearch(''); setPrescPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {prescriptionSearch && (
                  <p className="text-xs text-slate-500 mt-2">
                    {lang === 'en' 
                      ? `Searching for "${prescriptionSearch}"... ${prescriptions.length} results found` 
                      : `"${prescriptionSearch}" के लिए खोज रहे हैं... ${prescriptions.length} परिणाम मिले`
                    }
                  </p>
                )}
              </div>

              {prescLoading ? (
                <div className="flex items-center gap-2 text-slate-500 py-10">
                  <span className="w-4 h-4 border-2 border-[#062E6F] border-t-transparent rounded-full animate-spin"></span>
                  {lang === 'en' ? 'Loading prescriptions from server…' : 'सर्वर से लोड हो रहा है…'}
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="surface p-12 text-center space-y-3">
                  <FileText className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="text-slate-500 text-sm font-medium">
                    {prescriptionSearch 
                      ? (lang === 'en' ? `No prescriptions found for "${prescriptionSearch}"` : `"${prescriptionSearch}" के लिए कोई पर्चा नहीं मिला`)
                      : (lang === 'en' ? 'No prescriptions found.' : 'कोई पर्चा नहीं मिला।')
                    }
                  </p>
                  {prescriptionSearch ? (
                    <p className="text-slate-400 text-xs">
                      {lang === 'en' ? 'Try different search terms or clear the search.' : 'अलग खोज शब्द आज़माएं या खोज साफ़ करें।'}
                    </p>
                  ) : (
                    <>
                      <p className="text-slate-400 text-xs">
                        {lang === 'en' ? 'Run an analysis in Rubric Analyzer and write a prescription to see it here.' : 'रुब्रिक विश्लेषक में विश्लेषण करें और पर्चा लिखें।'}
                      </p>
                      <button 
                        onClick={() => {
                          setLoadedAnalysis(null);
                          navigateToTab('Rubric Analyzer');
                        }} 
                        className="terracotta-btn mx-auto mt-2"
                      >
                        {lang === 'en' ? 'Go to Rubric Analyzer' : 'रुब्रिक विश्लेषक पर जाएं'}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <>
                {/* Desktop Prescriptions Table */}
                <div className="hidden md:block surface overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-300 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          <th className="py-3 px-5">{lang === 'en' ? 'Patient' : 'मरीज़'}</th>
                          <th className="py-3 px-5">{lang === 'en' ? 'Doctor' : 'डॉक्टर'}</th>
                          <th className="py-3 px-5">{lang === 'en' ? 'Remedy & Potency' : 'दवा और पोटेंसी'}</th>
                          <th className="py-3 px-5">{lang === 'en' ? 'Dosage' : 'खुराक'}</th>
                          <th className="py-3 px-5">{lang === 'en' ? 'Duration' : 'अवधि'}</th>
                          <th className="py-3 px-5">{lang === 'en' ? 'Follow-up' : 'अनुवर्ती'}</th>
                          <th className="py-3 px-5">{lang === 'en' ? 'Date' : 'तारीख'}</th>
                          <th className="py-3 px-5">{lang === 'en' ? 'Actions' : 'कार्रवाइयां'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 text-sm">
                        {prescriptions
                          .slice((prescPage - 1) * PRESC_PAGE_SIZE, prescPage * PRESC_PAGE_SIZE)
                          .map(rx => (
                          <tr key={rx._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-5">
                              <p className="font-semibold text-slate-800">{rx.patientName}</p>
                              <p className="text-xs text-slate-400">{rx.patientAge ? `${rx.patientAge} yrs` : ''} {rx.patientGender || ''}</p>
                            </td>
                            <td className="py-3.5 px-5">
                              <p className="font-semibold text-slate-700">{rx.doctorName || 'Dr. Nautiyal'}</p>
                              {rx.doctorClinic && <p className="text-xs text-slate-400">{rx.doctorClinic}</p>}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="font-bold text-[#062E6F]">{rx.remedy}</span>
                              <span className="ml-1.5 text-xs bg-blue-50 text-orange-700 border border-blue-100 px-1.5 py-0.5 rounded font-semibold">{rx.potency}</span>
                            </td>
                            <td className="py-3.5 px-5 text-slate-600 text-xs">{rx.dosage}</td>
                            <td className="py-3.5 px-5 text-slate-600 text-xs">{rx.duration}</td>
                            <td className="py-3.5 px-5 text-slate-500 text-xs">
                              {rx.followUpDate ? new Date(rx.followUpDate).toLocaleDateString('en-IN') : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="py-3.5 px-5 text-slate-400 text-xs">
                              {new Date(rx.prescribedAt || rx.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewPrescription(rx)}
                                  className="flex items-center gap-1.5 text-xs bg-[#062E6F] hover:bg-[#042050] text-white px-3 py-1.5 rounded-lg font-semibold transition-colors min-h-[36px]"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  {lang === 'en' ? 'View' : 'देखें'}
                                </button>
                                {userRole !== 'Patient' && (
                                  <button
                                    onClick={() => handleSharePrescription(rx)}
                                    className="flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors min-h-[36px]"
                                    title={lang === 'en' ? 'Share Prescription' : 'पर्चा साझा करें'}
                                  >
                                    <Share2 className="h-3.5 w-3.5" />
                                    {lang === 'en' ? 'Share' : 'साझा करें'}
                                  </button>
                                )}
                                {userRole !== 'Patient' && (
                                  <button
                                    onClick={() => handleDeletePrescription(rx._id)}
                                    className="flex items-center gap-1.5 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors min-h-[36px]"
                                    title={lang === 'en' ? 'Delete Prescription' : 'प्रिस्क्रिप्शन हटाएं'}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {lang === 'en' ? 'Delete' : 'हटाएं'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Desktop Pagination ── */}
                  {prescriptions.length > PRESC_PAGE_SIZE && (() => {
                    const totalPages = Math.ceil(prescriptions.length / PRESC_PAGE_SIZE);
                    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
                    return (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-300 bg-slate-50/50">
                        <p className="text-xs text-slate-500">
                          {lang === 'en'
                            ? `Showing ${(prescPage - 1) * PRESC_PAGE_SIZE + 1}–${Math.min(prescPage * PRESC_PAGE_SIZE, prescriptions.length)} of ${prescriptions.length}`
                            : `${prescriptions.length} में से ${(prescPage - 1) * PRESC_PAGE_SIZE + 1}–${Math.min(prescPage * PRESC_PAGE_SIZE, prescriptions.length)} दिखा रहे हैं`
                          }
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPrescPage(p => Math.max(1, p - 1))}
                            disabled={prescPage === 1}
                            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                          >
                            ← {lang === 'en' ? 'Prev' : 'पिछला'}
                          </button>
                          {pageNumbers.map(n => (
                            <button
                              key={n}
                              onClick={() => setPrescPage(n)}
                              className={`min-w-[44px] min-h-[44px] text-xs font-bold rounded-lg transition-colors ${
                                n === prescPage
                                  ? 'bg-[#062E6F] text-white shadow-sm'
                                  : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                          <button
                            onClick={() => setPrescPage(p => Math.min(totalPages, p + 1))}
                            disabled={prescPage === totalPages}
                            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                          >
                            {lang === 'en' ? 'Next' : 'अगला'} →
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Mobile Prescriptions Card View */}
                <div className="md:hidden space-y-3">
                  {prescriptions
                    .slice((prescPage - 1) * PRESC_PAGE_SIZE, prescPage * PRESC_PAGE_SIZE)
                    .map(rx => (
                    <div key={rx._id} className="surface p-4 space-y-3 border border-slate-300">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{rx.patientName}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {rx.patientAge ? `${rx.patientAge} yrs` : ''} {rx.patientGender || ''}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(rx.prescribedAt || rx.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="border-t border-slate-300 pt-3 space-y-2 text-xs">
                        <p className="text-slate-600">
                          <span className="font-semibold">{lang === 'en' ? 'Doctor:' : 'डॉक्टर:'}</span> {rx.doctorName || 'Dr. Nautiyal'}
                          {rx.doctorClinic && <span className="text-slate-400 ml-1">({rx.doctorClinic})</span>}
                        </p>
                        <div className="flex items-center gap-2">
                          <Pill className="h-3.5 w-3.5 text-[#062E6F] shrink-0" />
                          <span className="font-bold text-[#062E6F]">{rx.remedy}</span>
                          <span className="text-xs bg-blue-50 text-orange-700 border border-blue-100 px-1.5 py-0.5 rounded font-semibold">{rx.potency}</span>
                        </div>
                        <p className="text-slate-600"><span className="font-semibold">{lang === 'en' ? 'Dosage:' : 'खुराक:'}</span> {rx.dosage}</p>
                        <p className="text-slate-600"><span className="font-semibold">{lang === 'en' ? 'Duration:' : 'अवधि:'}</span> {rx.duration}</p>
                        {rx.followUpDate && (
                          <p className="text-slate-500"><span className="font-semibold">{lang === 'en' ? 'Follow-up:' : 'अनुवर्ती:'}</span> {new Date(rx.followUpDate).toLocaleDateString('en-IN')}</p>
                        )}
                      </div>
                      <div className={`border-t border-slate-300 pt-3 grid ${userRole !== 'Patient' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                        <button
                          onClick={() => handleViewPrescription(rx)}
                          className="flex items-center justify-center gap-1 text-xs bg-[#062E6F] hover:bg-[#042050] text-white px-2 py-2.5 rounded-lg font-semibold transition-colors min-h-[44px]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {lang === 'en' ? 'View' : 'देखें'}
                        </button>
                        {userRole !== 'Patient' && (
                          <button
                            onClick={() => handleSharePrescription(rx)}
                            className="flex items-center justify-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-2.5 rounded-lg font-semibold transition-colors min-h-[44px]"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            {lang === 'en' ? 'Share' : 'साझा'}
                          </button>
                        )}
                        {userRole !== 'Patient' && (
                          <button
                            onClick={() => handleDeletePrescription(rx._id)}
                            className="flex items-center justify-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-2.5 rounded-lg font-semibold transition-colors min-h-[44px]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {lang === 'en' ? 'Delete' : 'हटाएं'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}
            </div>
          )}

          {/* TAB: CHAT — all non-Director roles + Director */}
          {activeTab === 'Chat' && (
            <ChatTab lang={lang} role={userRole} currentUser={currentUser} />
          )}

          {/* TAB: PROFILE — all non-Admin roles */}
          {activeTab === 'Profile' && userRole !== 'Admin' && (
            <ProfilePage 
              currentUser={currentUser} 
              onProfileUpdate={(updatedUser) => {
                setCurrentUser(updatedUser);
                localStorage.setItem('homeo_user', JSON.stringify(updatedUser));
              }}
              onBack={() => navigateToTab('Dashboard')}
              lang={lang}
            />
          )}

          {/* TAB: KENT OCR */}
          {activeTab === 'Kent OCR' && (
            <KentOCRTab lang={lang} />
          )}

          {/* TAB: PATIENT SYMPTOM — Patient role only */}
          {activeTab === 'Patient Symptom' && userRole === 'Patient' && (
            <PatientDashboardTab currentUser={currentUser} lang={lang} navigateToTab={navigateToTab} initialSubTab="consultation" onSymptomSubmit={handlePatientSymptomSubmit} userRole={userRole} />
          )}

          {/* TAB: SYMPTOMS HISTORY — Patient role only */}
          {activeTab === 'Symptoms History' && userRole === 'Patient' && (
            <PatientDashboardTab currentUser={currentUser} lang={lang} navigateToTab={navigateToTab} initialSubTab="history" onSymptomSubmit={handlePatientSymptomSubmit} userRole={userRole} />
          )}

        </div>
      </main>

      {/* MODAL 1: ADD CORE TEAM MEMBER */}
      {showAddTeamModal && (
        <div className="fixed inset-0 bg-[#062E6F]/60 backdrop-blur-sm z-50 flex items-center justify-center md:p-4">
          <div className="surface w-full md:max-w-md h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 rounded-none md:rounded-2xl flex flex-col justify-between md:justify-start">
            <div>
              <div className="flex justify-between items-center border-b border-slate-300 pb-3">
                <h3 className="text-base font-bold text-slate-800">{t.addMember}</h3>
                <button 
                  onClick={() => setShowAddTeamModal(false)}
                  className="text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddTeamMember} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.name}</label>
                  <input
                    type="text"
                    required
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Kumar"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.role}</label>
                  <input
                    type="text"
                    required
                    value={newTeamMember.role}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                    placeholder="e.g. Resident Doctor"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'en' ? 'Phone Number' : 'फोन नंबर'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={newTeamMember.phone}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={newTeamMember.email}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                    placeholder="e.g. ramesh@homo.com"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.status}</label>
                  <select
                    value={newTeamMember.status}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, status: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="Active">{lang === 'en' ? "Active" : "सक्रिय"}</option>
                    <option value="On Break">{lang === 'en' ? "On Break" : "छुट्टी पर"}</option>
                    <option value="Inactive">{lang === 'en' ? "Inactive" : "निष्क्रिय"}</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-300 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddTeamModal(false)}
                    className="ghost-btn border border-slate-200 text-xs min-h-[44px] px-4 font-bold"
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    className="terracotta-btn text-xs min-h-[44px] px-5 font-bold"
                  >
                    {lang === 'en' ? "Submit" : "जमा करें"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW PATIENT */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-[#062E6F]/60 backdrop-blur-sm z-50 flex items-center justify-center md:p-4">
          <div className="surface w-full md:max-w-md h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 rounded-none md:rounded-2xl flex flex-col justify-between md:justify-start">
            <div>
              <div className="flex justify-between items-center border-b border-slate-300 pb-3">
                <h3 className="text-base font-bold text-slate-800">{t.addPatient}</h3>
                <button 
                  onClick={() => setShowAddPatientModal(false)}
                  className="text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddPatient} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.name}</label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t.age}</label>
                    <input
                      type="number"
                      required
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      placeholder="e.g. 42"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t.gender}</label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                    >
                      <option value="Male">{lang === 'en' ? "Male" : "पुरुष"}</option>
                      <option value="Female">{lang === 'en' ? "Female" : "महिला"}</option>
                      <option value="Other">{lang === 'en' ? "Other" : "अन्य"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.contact}</label>
                  <input
                    type="text"
                    required
                    value={newPatient.contact}
                    onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.symptoms}</label>
                  <textarea
                    value={newPatient.symptoms}
                    onChange={(e) => setNewPatient({ ...newPatient, symptoms: e.target.value })}
                    placeholder="e.g. Chronic acidity, sleeplessness"
                    rows="3"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-300 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddPatientModal(false)}
                    className="ghost-btn border border-slate-200 text-xs min-h-[44px] px-4 font-bold"
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    className="terracotta-btn text-xs min-h-[44px] px-5 font-bold"
                  >
                    {lang === 'en' ? "Register" : "पंजीकृत करें"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD EXTERNAL DOCTOR */}
      {showAddExternalDoctorModal && (
        <div className="fixed inset-0 bg-[#062E6F]/60 backdrop-blur-sm z-50 flex items-center justify-center md:p-4">
          <div className="surface w-full md:max-w-md h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 rounded-none md:rounded-2xl flex flex-col justify-between md:justify-start">
            <div>
              <div className="flex justify-between items-center border-b border-slate-300 pb-3">
                <h3 className="text-base font-bold text-slate-800">
                  {lang === 'en' ? "Add External Doctor" : "बाहरी डॉक्टर जोड़ें"}
                </h3>
                <button 
                  onClick={() => setShowAddExternalDoctorModal(false)}
                  className="text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddExternalDoctor} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'en' ? 'Doctor Name' : 'डॉक्टर का नाम'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newExternalDoctor.name}
                    onChange={(e) => setNewExternalDoctor({ ...newExternalDoctor, name: e.target.value })}
                    placeholder={lang === 'en' ? "e.g. Dr. Rahul Sharma" : "जैसे डॉ राहुल शर्मा"}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {lang === 'en' ? 'Phone Number' : 'फोन नंबर'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newExternalDoctor.phone}
                      onChange={(e) => setNewExternalDoctor({ ...newExternalDoctor, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {t.email} *
                    </label>
                    <input
                      type="email"
                      required
                      value={newExternalDoctor.email}
                      onChange={(e) => setNewExternalDoctor({ ...newExternalDoctor, email: e.target.value })}
                      placeholder="doctor@email.com"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {lang === 'en' ? 'Specialization' : 'विशेषज्ञता'}
                  </label>
                  <input
                    type="text"
                    value={newExternalDoctor.specialization}
                    onChange={(e) => setNewExternalDoctor({ ...newExternalDoctor, specialization: e.target.value })}
                    placeholder={lang === 'en' ? "e.g. Chronic Disease Specialist" : "जैसे पुरानी बीमारी विशेषज्ञ"}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.status}</label>
                  <select
                    value={newExternalDoctor.status}
                    onChange={(e) => setNewExternalDoctor({ ...newExternalDoctor, status: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="Active">{lang === 'en' ? 'Active' : 'सक्रिय'}</option>
                    <option value="Inactive">{lang === 'en' ? 'Inactive' : 'निष्क्रिय'}</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-300 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddExternalDoctorModal(false)}
                    className="ghost-btn border border-slate-200 text-xs min-h-[44px] px-4 font-bold"
                  >
                    {t.close}
                  </button>
                  <button
                    type="submit"
                    className="terracotta-btn text-xs min-h-[44px] px-5 font-bold"
                  >
                    {lang === 'en' ? "Add Doctor" : "डॉक्टर जोड़ें"}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
        onDelete={currentUser?.role !== 'Patient' ? handleDeletePrescription : undefined}
        onUpdate={handlePrescriptionUpdated}
        lang={lang}
      />

      {/* Share Prescription Modal */}
      {showShareModal && (
        <SharePrescriptionModal
          prescription={selectedPrescriptionForShare}
          onClose={() => {
            setShowShareModal(false);
            setSelectedPrescriptionForShare(null);
          }}
          lang={lang}
        />
      )}

    </div>
  );
}

export default App;
