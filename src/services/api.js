import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'https://homeoai-backend-83yt.onrender.com/api';

const api = axios.create({
  baseURL: BASE,
  timeout: 120000, // 2 minutes default timeout for API requests
  withCredentials: true, // Include cookies in requests
});

// Track if we're currently logging in (prevent 401 interceptor during login)
let isLoggingIn = false;

// Export function to set login state (called by authService)
export const setLoginState = (state) => {
  isLoggingIn = state;
};

// Performance monitoring interceptor
api.interceptors.request.use((config) => {
  // Track request start time for performance monitoring
  config.metadata = { startTime: Date.now() };
  return config;
});

// Cookies are preferred, with a Bearer-token fallback for cross-site
// Netlify → Render deployments where third-party cookies are blocked.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('homeo_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Prevent API response caching
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  config.headers['Pragma'] = 'no-cache';
  config.headers['Expires'] = '0';
  
  return config;
});

// Response interceptor: 401 handling only
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid) — clear session and redirect
    if (error.response?.status === 401) {
      if (!isLoggingIn) {
        localStorage.removeItem('homeo_user');
        localStorage.removeItem('homeo_auth_token');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────
export const loginUser     = (data) => api.post('/auth/login',    data).then(r => r.data);
export const registerUser  = (data) => api.post('/auth/register', data).then(r => r.data);
export const getProfile    = ()     => api.get('/auth/profile').then(r => r.data);
export const updateProfile = (data) => api.put('/auth/profile', data).then(r => r.data);
export const getPendingUsers  = ()  => api.get('/auth/pending').then(r => r.data);
export const getAllUsers       = ()  => api.get('/auth/users').then(r => r.data);
export const getChatContacts   = ()  => api.get('/auth/chat-contacts').then(r => r.data);
export const approveUser   = (id)   => api.put(`/auth/approve/${id}`).then(r => r.data);
export const rejectUser    = (id, reason) => api.put(`/auth/reject/${id}`, { reason }).then(r => r.data);
export const deleteUser    = (id)   => api.delete(`/auth/users/${id}`).then(r => r.data);

// ─── Repertories ───────────────────────────────────────────────
export const getRepertories = (params) => api.get('/repertories', { params }).then(r => r.data.data);
export const createRepertory = (data) => api.post('/repertories', data).then(r => r.data.data);
export const uploadRepertoryExcel = (repertoryId, file, replace = false) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/repertories/${repertoryId}/upload?replace=${replace}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      // Dispatch custom event for progress tracking
      window.dispatchEvent(new CustomEvent('excelUploadProgress', { detail: percentCompleted }));
    },
  }).then(r => r.data);
};
export const deleteRepertory = (id) => api.delete(`/repertories/${id}`).then(r => r.data);
export const getRepertoryChapters = (repertoryId) => api.get(`/repertories/${repertoryId}/chapters`).then(r => r.data.data);
// ─── Rubrics ───────────────────────────────────────────────────
export const getRubrics = (params) => api.get('/rubrics', { params }).then(r => r.data);
export const getChapters = (repertoryId) =>
  api.get('/rubrics/chapters', { params: { repertoryId } }).then(r => r.data.data);
export const createRubric = (data) => api.post('/rubrics', data).then(r => r.data.data);
export const updateRubric = (id, data) => api.put(`/rubrics/${id}`, data).then(r => r.data.data);
export const deleteRubric = (id) => api.delete(`/rubrics/${id}`).then(r => r.data);
export const bulkUpdateChapter = (oldChapter, newChapter, repertoryId = null) => 
  api.patch('/rubrics/bulk-update-chapter', { oldChapter, newChapter, repertoryId }).then(r => r.data);

// ─── Doctors ──────────────────────────────────────────────────────
export const getDoctors = (params) => api.get('/doctors', { params }).then(r => r.data.data);
export const getDoctor = (id) => api.get(`/doctors/${id}`).then(r => r.data.data);
export const createDoctor = (data) => api.post('/doctors', data).then(r => r.data.data);
export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data).then(r => r.data.data);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`).then(r => r.data);
export const getDoctorStats = () => api.get('/doctors/stats').then(r => r.data.data);

// ─── Medicines ──────────────────────────────────────────────────
export const getMedicines = (params) => api.get('/medicines', { params }).then(r => r.data);
export const getMedicine = (id) => api.get(`/medicines/${id}`).then(r => r.data.data);
export const createMedicine = (data) => api.post('/medicines', data).then(r => r.data.data);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data).then(r => r.data.data);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`).then(r => r.data);
export const getMedicineStatistics = () => api.get('/medicines/statistics').then(r => r.data.data);
export const syncMedicinesFromRubrics = () => api.post('/medicines/sync-rubrics').then(r => r.data);

// ─── Analysis ──────────────────────────────────────────────────
export const runAnalysis = (payload) =>
  api.post('/analysis/run', payload, { timeout: 120000 }).then(r => r.data.data); // 2 minutes for AI analysis
export const getAnalyses = (params) => api.get('/analysis', { params }).then(r => r.data);
export const getAnalysis = (id) => api.get(`/analysis/${id}`).then(r => r.data.data);
export const deleteAnalysis = (id) => api.delete(`/analysis/${id}`).then(r => r.data);
export const getAnalysisStats = () => api.get('/analysis/stats').then(r => r.data.data);

// ─── Patients ──────────────────────────────────────────────────
export const getPatients = (params) => api.get('/patients', { params }).then(r => r.data);
export const getPatient = (id) => api.get(`/patients/${id}`).then(r => r.data.data);
export const createPatient = (data) => api.post('/patients', data).then(r => r.data.data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data).then(r => r.data.data);
export const getPatientStats = () => api.get('/patients/stats').then(r => r.data.data);

// ─── Prescriptions ─────────────────────────────────────────────
export const createPrescription  = (data)     => api.post('/prescriptions', data).then(r => r.data.data);
export const getPrescriptions    = (params)   => api.get('/prescriptions', { params }).then(r => r.data);
export const getPrescription     = (id)       => api.get(`/prescriptions/${id}`).then(r => r.data.data);
export const updatePrescription  = (id, data) => api.put(`/prescriptions/${id}`, data).then(r => r.data.data);
export const deletePrescription  = (id)       => api.delete(`/prescriptions/${id}`).then(r => r.data);

// ─── Chat Messages ─────────────────────────────────────────────
export const getChatMessages = (roomId) => api.get(`/messages/${roomId}`).then(r => r.data.data);
export const createChatMessage = (data) => api.post('/messages', data).then(r => r.data.data);
export const uploadChatAttachment = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/messages/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};
export const deleteChatMessage = (messageId, senderId) => api.delete(`/messages/${messageId}`, { data: { senderId } }).then(r => r.data);
export const sharePrescriptionViaChat = (data) => api.post('/messages/share-prescription', data).then(r => r.data);

// ─── Consultations ─────────────────────────────────────────────
export const getApprovedDoctors = () => api.get('/consultations/doctors').then(r => r.data.doctors);
export const createConsultation = (data) => api.post('/consultations', data).then(r => r.data);
export const getConsultations = (params) => api.get('/consultations', { params }).then(r => r.data);
export const getConsultation = (id) => api.get(`/consultations/${id}`).then(r => r.data.consultation);
export const updateConsultation = (id, data) => api.put(`/consultations/${id}`, data).then(r => r.data);
export const deleteConsultation = (id) => api.delete(`/consultations/${id}`).then(r => r.data);

// ─── Reference Library ─────────────────────────────────────────
export const uploadRepertoryPDF = (repertoryId, file) => {
  const form = new FormData();
  form.append('pdf', file);
  return api.post(`/repertories/${repertoryId}/upload-pdf`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000, // 10 minutes — large PDFs need time to upload + Cloudinary chunked processing
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      // Dispatch custom event for progress tracking
      window.dispatchEvent(new CustomEvent('uploadProgress', { detail: percentCompleted }));
    },
  }).then(r => r.data);
};
export const updateChapterPages = (repertoryId, chapterPages, pageOffset) => 
  api.put(`/repertories/${repertoryId}/chapter-pages`, { chapterPages, pageOffset }).then(r => r.data);
export const scanMedicinePages = (repertoryId) =>
  api.post(`/repertories/${repertoryId}/scan-medicine-pages`, {}, { timeout: 120000 }).then(r => r.data);

export default api;
