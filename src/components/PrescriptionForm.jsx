import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, CheckCircle, Plus, Trash2, Search, X, Share2, Users, ChevronDown, Loader2, Phone } from 'lucide-react';
import { createPrescription, updatePrescription, getMedicines, getPatients, getAllUsers, sharePrescriptionViaChat } from '../services/api';
import { generatePrescriptionPDF } from '../utils/pdfGenerator';
import VoiceInput from './VoiceInput';
import PersistentNumberPicker from './NumberPicker';

// ─── Constants ──────────────────────────────────────────────────────────────

const MEDICINE_TYPES = [
  { id: 'dilution', label: 'Dilution (Potency)', labelHi: 'डाइल्यूशन (पोटेंसी)' },
  { id: 'mother_tincture', label: 'Mother Tincture (Q)', labelHi: 'मदर टिंचर (Q)' },
  { id: 'biochemic', label: 'Bio Combination (Trituration)', labelHi: 'बायो कॉम्बिनेशन (ट्रिट्यूरेशन)' },
];

const POTENCIES_DILUTION = ['2', '3', '6', '30', '200', '1M', '10M', 'CM', 'LM', 'Patent'];
const POTENCIES_BIOCHEMIC = ['1X', '3X', '6X', '12X', '30X'];

const FREQ_OPTIONS = [
  { value: 'OD', en: 'OD – Once daily', hi: 'OD – दिन में एक बार' },
  { value: 'BD', en: 'BD – Twice daily', hi: 'BD – दिन में दो बार' },
  { value: 'TDS', en: 'TDS – Thrice daily', hi: 'TDS – दिन में तीन बार' },
  { value: 'QID', en: 'QID – Four times daily', hi: 'QID – दिन में चार बार' },
];

const MEAL_OPTIONS = [
  { value: 'BM', en: 'Before Meal', hi: 'भोजन से पहले' },
  { value: 'AM', en: 'After Meal', hi: 'भोजन के बाद' },
];

const WATER_OPTIONS = [
  { value: '1/4', en: '¼ Cup water', hi: '¼ कप पानी' },
  { value: '1/2', en: '½ Cup water', hi: '½ कप पानी' },
  { value: 'full', en: 'Full Cup water', hi: 'पूरा कप पानी' },
];

const TEASPOON_OPTIONS = [
  { value: '1tsp', en: '1 Teaspoon', hi: '1 चम्मच' },
  { value: '2tsp', en: '2 Teaspoons', hi: '2 चम्मच' },
  { value: '3tsp', en: '3 Teaspoons', hi: '3 चम्मच' },
];

// Duration ranges: days 0–21, weeks 0–5, months 0–3 (controlled via 3 separate sliders)

const newMedLine = () => ({
  id: Date.now() + Math.random(),
  type: 'dilution',
  name: '',
  search: '',
  showDropdown: false,
  potency: '30',
  form: 'pills',
  quantity: 0,  // Start at 0
  frequency: 'BD',
  meal: 'BM',
  water: '',
  teaspoons: '',
  remarks: '',
});

// ─── Component ──────────────────────────────────────────────────────────────

export default function PrescriptionForm({
  currentUser = null,
  analysisData,
  selectedMedicine = '',
  prePopulatedMedicines = [],
  patients = [],
  lang = 'en',
  onPrescriptionSaved,
  editingPrescription = null,
  onCancelEdit = null
}) {
  const [patient, setPatient] = useState({
    name: editingPrescription?.patientName || analysisData?.patientName || '',
    age: editingPrescription?.patientAge || analysisData?.patientAge || '',
    gender: editingPrescription?.patientGender || analysisData?.patientGender || 'Male',
    weight: editingPrescription?.patientWeight || analysisData?.patientWeight || '',
    contact: editingPrescription?.patientContact || analysisData?.patientContact || '',
  });

  const [medicines, setMedicines] = useState(() => {
    if (editingPrescription) {
      if (editingPrescription.medicines && editingPrescription.medicines.length > 0) {
        return editingPrescription.medicines.map((m, idx) => ({
          id: m._id || m.id || `existing-${idx}`,
          type: m.type || 'dilution',
          name: m.name || '',
          search: m.name || '',
          potency: m.potency || '30',
          form: m.form || 'pills',
          quantity: m.quantity || 3,
          frequency: m.frequency || 'BD',
          meal: m.meal || 'BM',
          water: m.water || '',
          teaspoons: m.teaspoons || '', // Load teaspoons from existing prescription
          remarks: m.remarks || '', // Load remarks from existing prescription
        }));
      } else if (editingPrescription.remedy) {
        const remedies = editingPrescription.remedy.split(',').map(r => r.trim());
        const potencies = (editingPrescription.potency || '').split(',').map(p => p.trim());
        return remedies.map((r, idx) => ({
          id: `legacy-${idx}`,
          type: 'dilution',
          name: r,
          search: r,
          potency: potencies[idx] || '30',
          form: 'pills',
          quantity: 3,
          frequency: 'BD',
          meal: 'BM',
          water: '',
          teaspoons: '',
        }));
      }
    }
    if (prePopulatedMedicines && prePopulatedMedicines.length > 0) {
      return prePopulatedMedicines.map(m => ({
        ...newMedLine(),
        name: m.name,
        search: m.name,
        type: m.type || 'dilution',
        potency: m.potency || '30',
        form: m.form || 'pills',
        quantity: m.quantity || 3,
        frequency: m.frequency || 'BD',
        meal: m.meal || 'BM',
        water: m.water || '',
        teaspoons: m.teaspoons || '',
        remarks: m.remarks || '',
      }));
    }
    return [{ ...newMedLine(), name: selectedMedicine, search: selectedMedicine || '' }];
  });

  const [duration, setDuration] = useState(() => {
    const durObj = { days: 0, weeks: 0, months: 0 };
    if (editingPrescription) {
      const durStr = editingPrescription.duration || '';
      const parts = durStr.split(',').map(p => p.trim());
      parts.forEach(part => {
        const match = part.match(/^(\d+)\s+(day|week|month)s?$/i);
        if (match) {
          const val = parseInt(match[1], 10);
          const unit = match[2].toLowerCase();
          if (unit === 'day') durObj.days = val;
          else if (unit === 'week') durObj.weeks = val;
          else if (unit === 'month') durObj.months = val;
        }
      });
      if (durObj.days === 0 && durObj.weeks === 0 && durObj.months === 0 && editingPrescription.durationValue) {
        const val = editingPrescription.durationValue;
        const unit = editingPrescription.durationUnit || 'days';
        if (unit === 'days') durObj.days = val;
        else if (unit === 'weeks') durObj.weeks = val;
        else if (unit === 'months') durObj.months = val;
      }
    }
    return durObj;
  });

  const [instructions, setInstructions] = useState(editingPrescription?.instructions || '');
  const [followUp, setFollowUp] = useState(() => {
    if (editingPrescription?.followUpDate) {
      return new Date(editingPrescription.followUpDate).toISOString().split('T')[0];
    }
    return '';
  });
  const [notes, setNotes] = useState(editingPrescription?.notes || '');
  const [doctor] = useState({
    name: editingPrescription?.doctorName || (currentUser?.name ? `Dr. ${currentUser.name}` : 'Dr. Unknown'),
    clinic: editingPrescription?.doctorClinic || (currentUser?.clinic || 'Homeopathic Clinic'),
    qualifications: editingPrescription?.doctorQualifications || currentUser?.qualifications || 'BHMS',
    registrationNumber: editingPrescription?.doctorRegistration || currentUser?.registrationNumber || '',
    experience: editingPrescription?.doctorExperience || currentUser?.experience || '',
  });

  const [savedPrescription, setSavedPrescription] = useState(null);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [sharePatients, setSharePatients] = useState([]);
  const [sharePatientSearch, setSharePatientSearch] = useState('');
  const [loadingSharePatients, setLoadingSharePatients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [medicineList, setMedicineList] = useState([]);
  const dropdownRefs = useRef({});

  // Persistent Number Picker state
  const [activeNumberField, setActiveNumberField] = useState(null);
  const [pickerConfig, setPickerConfig] = useState({
    label: '',
    unit: '',
    currentValue: 0
  });

  // Sync patient info whenever the analysisData prop changes (e.g. after new analysis)
  useEffect(() => {
    if (!editingPrescription) {
      setPatient(p => ({
        ...p,
        name: analysisData?.patientName || p.name,
        age: analysisData?.patientAge || p.age,
        gender: analysisData?.patientGender || p.gender,
        weight: analysisData?.patientWeight || p.weight,
        contact: analysisData?.patientContact || p.contact,
      }));
    }
  }, [analysisData?.patientName, analysisData?.patientAge, analysisData?.patientGender, analysisData?.patientWeight, analysisData?.patientContact, editingPrescription]);

  // Fetch medicines list from Materia Medica
  useEffect(() => {
    getMedicines({ limit: 500 })
      .then(res => {
        const list = res?.data || res || [];
        setMedicineList(list);
      })
      .catch(() => setMedicineList([]));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      setMedicines(ms => ms.map(m => {
        const ref = dropdownRefs.current[m.id];
        if (ref && !ref.contains(e.target)) return { ...m, showDropdown: false };
        return m;
      }));
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const isHi = lang === 'hi';
  const T = (en, hi) => isHi ? hi : en;

  const setPat = k => e => setPatient(p => ({ ...p, [k]: e.target.value }));

  const updateMed = (id, key, val) =>
    setMedicines(ms => ms.map(m => m.id === id ? { ...m, [key]: val } : m));

  const addMed = () => setMedicines(ms => [...ms, newMedLine()]);
  const removeMed = id => setMedicines(ms => ms.filter(m => m.id !== id));

  const getFilteredMedicines = (search) => {
    if (!search || search.length < 2) return [];
    const q = search.toLowerCase();
    return medicineList.filter(m => m.name?.toLowerCase().includes(q)).slice(0, 10);
  };

  const selectMedicine = (medId, name) => {
    setMedicines(ms => ms.map(m => m.id === medId
      ? { ...m, name, search: name, showDropdown: false }
      : m
    ));
  };

  const getPotencies = type =>
    type === 'biochemic' ? POTENCIES_BIOCHEMIC : POTENCIES_DILUTION;

  const getFormLabel = med => {
    if (med.type === 'mother_tincture') return T('Drops', 'बूँदें');
    if (med.type === 'biochemic') return T('Tablets', 'टैबलेट');
    return med.form === 'drops' ? T('Drops', 'बूँदें') : T('Pills / Globules', 'गोलियाँ');
  };

  const freqLabel = val => {
    const o = FREQ_OPTIONS.find(f => f.value === val);
    return o ? (isHi ? o.hi : o.en) : val;
  };

  const mealLabel = val => {
    const o = MEAL_OPTIONS.find(m => m.value === val);
    return o ? (isHi ? o.hi : o.en) : val;
  };

  // Activate number picker for a specific field
  const activateNumberPicker = (fieldKey, label, unit, currentValue, onSelectCallback) => {
    setActiveNumberField(fieldKey);
    setPickerConfig({
      label,
      unit,
      currentValue,
      onSelect: onSelectCallback
    });
  };

  // Handle number selection from picker
  const handleNumberSelect = (value) => {
    if (pickerConfig.onSelect) {
      pickerConfig.onSelect(value);
      // Update the current value in picker config immediately
      setPickerConfig(prev => ({
        ...prev,
        currentValue: value
      }));
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async e => {
    e.preventDefault();
    if (!patient.name || medicines.some(m => !m.name)) return;
    setSaving(true); setError('');
    try {
      const durationParts = [];
      if (duration.days > 0) durationParts.push(`${duration.days} days`);
      if (duration.weeks > 0) durationParts.push(`${duration.weeks} weeks`);
      if (duration.months > 0) durationParts.push(`${duration.months} months`);
      const durationStr = durationParts.join(', ') || '—';

      const payload = {
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        patientWeight: patient.weight,
        patientContact: patient.contact,
        patientId: analysisData?.patientId || null, // Add patientId for in-app chat sharing
        doctorId: currentUser?._id || currentUser?.id || null, // Add doctorId for in-app chat sharing
        medicines: medicines.map(m => ({
          type: m.type,
          name: m.name,
          potency: m.type === 'mother_tincture' ? 'Q' : m.potency,
          form: m.form,
          quantity: m.quantity,
          frequency: m.frequency,
          meal: m.meal,
          water: m.water || '',
          teaspoons: m.teaspoons || '', // Include teaspoons in payload
          remarks: m.remarks || '', // Include remarks in payload
        })),
        remedy: medicines.map(m => m.name).join(', '),
        potency: medicines.map(m => m.potency).join(', '),
        dosage: medicines.map(m => `${m.quantity} ${getFormLabel(m)} ${freqLabel(m.frequency)} ${mealLabel(m.meal)}`).join('; '),
        duration: durationStr,
        durationValue: duration.days || duration.weeks || duration.months || null,
        durationUnit: duration.months > 0 ? 'months' : duration.weeks > 0 ? 'weeks' : 'days',
        instructions,
        followUpDate: followUp || null,
        notes,
        doctorName: doctor.name,
        doctorClinic: doctor.clinic,
        doctorQualifications: doctor.qualifications,
        doctorRegistration: doctor.registrationNumber,
        doctorExperience: doctor.experience,
        analysisId: editingPrescription?.analysisId || analysisData?.analysisId || null,
        symptoms: editingPrescription?.symptoms || analysisData?.symptoms || [],
      };

      let res;
      if (editingPrescription) {
        res = await updatePrescription(editingPrescription._id || editingPrescription.id, payload);
      } else {
        res = await createPrescription(payload);
      }
      generatePrescriptionPDF(res, lang);
      setSavedPrescription(res);

      // Notify parent component that prescription was saved
      if (onPrescriptionSaved) {
        onPrescriptionSaved(res);
      }
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError(T('Saved locally. PDF downloaded.', 'स्थानीय रूप से सहेजा। PDF डाउनलोड हुई।'));
    } finally {
      setSaving(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

  const inp = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-all';
  const seg = 'flex rounded-lg overflow-hidden border border-slate-200 text-xs font-semibold';
  const segBtn = (active) =>
    `flex-1 py-2 text-center cursor-pointer transition-all ${active
      ? 'bg-[#062E6F] text-white'
      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`;

  // ── Render ─────────────────────────────────────────────────────────────────

  // ── WhatsApp share helpers ────────────────────────────────────────────────
  const buildWhatsAppMessage = (rx) => {
    const doc     = rx.doctorName   || 'Dr. Nautiyal';
    const clinic  = rx.doctorClinic || 'Nautiyal Homeopathic Clinic';
    const date    = new Date(rx.prescribedAt || rx.createdAt || Date.now())
                      .toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    // ── Frequency labels ──────────────────────────────────────────
    const freqLabel = (f) => ({
      OD: 'Once daily (OD)', BD: 'Twice daily (BD)',
      TDS: 'Thrice daily (TDS)', QID: 'Four times daily (QID)', SOS: 'As needed (SOS)',
    }[f] || f || '');

    const mealLabel = (m) => m === 'BM' ? 'Before Meal' : m === 'AM' ? 'After Meal' : (m || '');

    const waterLabel = (w) => ({
      '1/4': '¼ cup of water', '1/2': '½ cup of water', 'full': 'Full cup of water',
    }[w] || '');

    const tspLabel = (t) => ({
      '1tsp': '1 teaspoon', '2tsp': '2 teaspoons', '3tsp': '3 teaspoons', 'Syrup': 'Syrup',
    }[t] || t || '');

    // ── Medicine lines ────────────────────────────────────────────
    let medsText = '';
    if (rx.medicines?.length > 0) {
      medsText = rx.medicines.map((m, i) => {
        const potency  = m.type === 'mother_tincture' ? 'Q (Mother Tincture)' : (m.potency ? `${m.potency}` : '');
        const form     = m.type === 'biochemic' ? 'Tablet(s)' : m.form === 'drops' ? 'Drop(s)' : 'Pill(s)/Globule(s)';
        const qty      = m.quantity || '';
        const freq     = freqLabel(m.frequency);
        const meal     = mealLabel(m.meal);
        const water    = waterLabel(m.water);
        const tsp      = tspLabel(m.teaspoons);

        let line = `*${i + 1}. ${m.name}*${potency ? ` — ${potency}` : ''}\n`;
        line    += `   💊 ${qty} ${form}  •  ${freq}\n`;
        line    += `   🕐 ${meal}`;
        if (water)   line += `  •  with ${water}`;
        if (tsp)     line += `  •  ${tsp}`;
        if (m.remarks) line += `\n   📌 _${m.remarks}_`;
        return line;
      }).join('\n\n');
    } else {
      medsText = rx.remedy ? `*${rx.remedy}*` : '_As prescribed_';
    }

    // ── Build final message ───────────────────────────────────────
    const D = '─────────────────────────';
    let msg = `🏥 *HOMEOPATHIC PRESCRIPTION*\n${D}\n`;
    msg    += `👨‍⚕️ *Dr.* ${doc}\n`;
    msg    += `🏥 ${clinic}\n`;
    msg    += `📅 *Date:* ${date}\n`;
    msg    += `${D}\n\n`;

    msg    += `👤 *PATIENT DETAILS*\n`;
    msg    += `*Name:* ${rx.patientName}\n`;
    if (rx.patientAge)    msg += `*Age:* ${rx.patientAge} years\n`;
    if (rx.patientGender) msg += `*Gender:* ${rx.patientGender}\n`;
    if (rx.patientWeight) msg += `*Weight:* ${rx.patientWeight} kg\n`;
    msg    += `\n${D}\n\n`;

    msg    += `💊 *MEDICINES PRESCRIBED*\n\n`;
    msg    += `${medsText}\n\n`;
    msg    += `${D}`;

    if (rx.duration)      msg += `\n\n⏱️ *Duration:* ${rx.duration}`;
    if (rx.instructions)  msg += `\n\n📋 *Special Instructions:*\n${rx.instructions}`;
    if (rx.followUpDate) {
      const fu = new Date(rx.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      msg    += `\n\n📅 *Follow-up Date:* ${fu}`;
    }
    if (rx.notes) msg += `\n\n📝 *Notes:* ${rx.notes}`;

    msg    += `\n\n${D}\n`;
    msg    += `_Please follow the prescribed dosage and timings strictly._\n`;
    msg    += `_Avoid coffee, mint, camphor & strong perfumes during treatment._\n`;
    msg    += `\n✨ *Wishing you a speedy recovery!*\n`;
    msg    += `🙏 — ${doc}`;

    return encodeURIComponent(msg);
  };

  const openWhatsAppShare = (rx, phone) => {
    const msg = buildWhatsAppMessage(rx);
    const cleaned = (phone || '').replace(/[^\d]/g, '');
    window.open(cleaned ? `https://wa.me/${cleaned}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank');
  };

  const sendToPatientDashboard = async (patient) => {
    if (!savedPrescription || !patient) return;
    
    // Debug: Log patient data to console
    console.log('Attempting to send prescription to:', {
      patientId: patient._id,
      patientName: patient.name,
      patientRole: patient.role,
      patientStatus: patient.status,
    });
    
    try {
      // Prepare prescription data for backend
      const prescriptionData = {
        patientName: savedPrescription.patientName,
        doctorName: savedPrescription.doctorName || currentUser?.name || 'Doctor',
        medicines: savedPrescription.medicines || [],
        remedy: savedPrescription.remedy,
        potency: savedPrescription.potency,
        dosage: savedPrescription.dosage,
        duration: savedPrescription.duration,
        instructions: savedPrescription.instructions,
        prescribedAt: savedPrescription.prescribedAt || savedPrescription.createdAt,
        createdAt: savedPrescription.createdAt,
      };
      
      // Send prescription to patient's dashboard via chat API
      const response = await sharePrescriptionViaChat({
        patientId: patient._id,
        prescriptionId: savedPrescription._id,
        doctorId: currentUser._id || currentUser.id,
        prescriptionData: prescriptionData,
      });
      
      console.log('Prescription sent successfully:', response);
      
      alert(T(
        `Prescription sent to ${patient.name}'s dashboard successfully!`,
        `${patient.name} के डैशबोर्ड में पर्चा भेज दिया गया!`
      ));
      
      setShowSharePanel(false);
    } catch (error) {
      console.error('Failed to send prescription to patient:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message;
      alert(T(
        `Failed to send prescription: ${errorMessage}`,
        `पर्चा भेजने में विफल: ${errorMessage}`
      ));
    }
  };

  const loadSharePatients = async () => {
    if (loadingSharePatients) return;
    setLoadingSharePatients(true);
    try {
      const [usersRes, patientsRes] = await Promise.allSettled([
        getAllUsers(),
        getPatients({ limit: 300 }),
      ]);
      
      console.log('📊 Raw data received:');
      console.log('- Users API response:', usersRes);
      console.log('- Patients API response:', patientsRes);
      
      // Registered users with role=Patient - THESE CAN RECEIVE PRESCRIPTIONS VIA CHAT
      const allUsers = usersRes.status === 'fulfilled' ? (usersRes.value?.users || []) : [];
      console.log('- Total users from API:', allUsers.length);
      
      const userPatients = allUsers
        .filter(u => {
          const isPatient = u.role === 'Patient';
          const isApproved = u.status === 'Approved';
          console.log(`  User: ${u.name} - Role: ${u.role}, Status: ${u.status}, Show: ${isPatient && isApproved}`);
          return isPatient && isApproved;
        })
        .map(u => ({ 
          _id: u._id, 
          name: u.name, 
          age: u.age || '', 
          gender: u.gender || '', 
          contact: u.phone || '', 
          role: u.role,
          status: u.status,
          source: 'registered' 
        }));
      
      console.log('✅ Filtered registered patients:', userPatients.length);
      console.log('   List:', userPatients.map(p => p.name));
        
      // Only show registered users for in-app sharing
      setSharePatients(userPatients);
    } catch (error) { 
      console.error('❌ Error loading share patients:', error);
      setSharePatients([]); 
    } finally { 
      setLoadingSharePatients(false); 
    }
  };

  const filteredSharePatients = sharePatients.filter(p =>
    p.name?.toLowerCase().includes(sharePatientSearch.toLowerCase()) ||
    (p.contact && p.contact.includes(sharePatientSearch))
  );

  const resetForm = () => {
    setPatient({ name: '', age: '', gender: 'Male', weight: '', contact: '' });
    setMedicines([newMedLine()]);
    setDuration({ days: 0, weeks: 0, months: 0 });
    setInstructions('');
    setFollowUp('');
    setNotes('');
    setError('');
    setSavedPrescription(null);
    setShowSharePanel(false);
    setSharePatientSearch('');
  };

  const WaIcon = () => (
    <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  if (savedPrescription) return (
    <section className="surface p-6 space-y-6">
      {/* ── Success header ── */}
      <div className="flex flex-col items-center text-center gap-3 py-6 border-b border-slate-100">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">{T('Prescription Saved!', 'पर्चा सहेजा गया!')}</p>
          <p className="text-sm text-slate-500 mt-1">{T('PDF downloaded to your device.', 'PDF आपके डिवाइस पर डाउनलोड हो गई।')}</p>
        </div>
      </div>

      {/* ── Share section ── */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Share2 className="h-4 w-4 text-[#062E6F]" />
          {T('Share Prescription', 'पर्चा साझा करें')}
        </p>
        <div className="space-y-3">

          {/* WhatsApp direct */}
          <button
            onClick={() => openWhatsAppShare(savedPrescription, savedPrescription.patientContact)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <WaIcon />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-sm">{T('Share via WhatsApp', 'व्हाट्सऐप से साझा करें')}</p>
              <p className="text-xs text-slate-500">
                {savedPrescription.patientContact
                  ? savedPrescription.patientContact
                  : T('Opens WhatsApp — select contact manually', 'व्हाट्सऐप खुलेगा')}
              </p>
            </div>
          </button>

          {/* Send to registered patient */}
          <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => {
                setShowSharePanel(v => !v);
                if (!sharePatients.length && !loadingSharePatients) loadSharePatients();
              }}
              className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-all text-left"
            >
              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">{T('Send to Registered Patient', 'पंजीकृत मरीज़ को भेजें')}</p>
                <p className="text-xs text-slate-500">{T('Search & pick from your patient list', 'मरीज़ सूची से चुनें')}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${showSharePanel ? 'rotate-180' : ''}`} />
            </button>

            {showSharePanel && (
              <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/80">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={sharePatientSearch}
                    onChange={e => setSharePatientSearch(e.target.value)}
                    placeholder={T('Search by name or phone…', 'नाम या फ़ोन से खोजें…')}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 thin-scroll">
                  {loadingSharePatients ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {T('Loading patients…', 'मरीज़ लोड हो रहे हैं…')}
                    </div>
                  ) : filteredSharePatients.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-6">
                      {T('No patients found', 'कोई मरीज़ नहीं मिला')}
                    </p>
                  ) : filteredSharePatients.map(p => (
                    <button
                      key={p._id}
                      onClick={() => sendToPatientDashboard(p)}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#062E6F]/10 flex items-center justify-center shrink-0 text-[#062E6F] text-sm font-bold">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          {p.contact
                            ? <><Phone className="h-3 w-3 shrink-0" />{p.contact}</>
                            : T('No phone number', 'फ़ोन नहीं')}
                        </p>
                      </div>
                      <div className="shrink-0 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Share2 className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="pt-2 border-t border-slate-100">
        {editingPrescription ? (
          <button onClick={onCancelEdit} className="w-full ghost-btn border border-slate-200 text-sm py-3 min-h-[44px]">
            {T('← Back to Details', '← विवरण पर वापस')}
          </button>
        ) : (
          <button onClick={resetForm} className="w-full ghost-btn border border-slate-200 text-sm py-3 min-h-[44px]">
            {T('✏️  Write Another Prescription', '✏️  और पर्चा लिखें')}
          </button>
        )}
      </div>
    </section>
  );

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-[calc(100vh-12rem)] lg:max-h-[900px]">
      
      {/* LEFT SIDE: Form - Scrollable */}
      <section className="flex-1 surface p-4 sm:p-6 space-y-4 sm:space-y-6 lg:overflow-y-auto">
        {/* Title */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="h-5 w-5 text-[#062E6F]" />
          <h3 className="text-base font-bold text-slate-800">
            {editingPrescription ? T('Edit Prescription', 'नुस्खा संपादित करें') : T('Write Prescription', 'पर्चा लिखें')}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-24 md:pb-0">

        {/* ── Patient ── */}
        <div>
          <p className="overline mb-3">{T('Patient Details', 'मरीज़ का विवरण')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">{T('Patient Name', 'मरीज़ का नाम')} *</label>
              <input required className={inp} value={patient.name} onChange={setPat('name')} placeholder="e.g. Ramesh Kumar" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{T('Age', 'उम्र')}</label>
              <input 
                type="number" 
                min="0" 
                max="120" 
                className={inp} 
                value={patient.age} 
                onChange={setPat('age')} 
                placeholder="35" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{T('Gender', 'लिंग')}</label>
              <select className={inp} value={patient.gender} onChange={setPat('gender')}>
                <option value="Male">{T('Male', 'पुरुष')}</option>
                <option value="Female">{T('Female', 'महिला')}</option>
                <option value="Other">{T('Other', 'अन्य')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{T('Weight', 'वज़न')}</label>
              <input 
                type="text" 
                className={inp} 
                value={patient.weight} 
                onChange={setPat('weight')} 
                placeholder="65 kg" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{T('Contact', 'संपर्क')}</label>
              <input className={inp} value={patient.contact} onChange={setPat('contact')} placeholder="+91 98765 43210" />
            </div>
          </div>
        </div>

        {/* ── Medicines ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="overline">{T('Medicines', 'दवाइयाँ')}</p>
            <button type="button" onClick={addMed}
              className="flex items-center gap-1 text-xs text-[#062E6F] hover:text-[#042050] font-semibold transition-colors">
              <Plus className="h-3.5 w-3.5" /> {T('Add Medicine', 'दवा जोड़ें')}
            </button>
          </div>

          <div className="space-y-3">
            {medicines.map((med, idx) => (
              <div key={med.id} className="border border-slate-200 rounded-xl p-3 space-y-2.5 bg-slate-50/50">

                {/* Row 1: # + medicine search + type select + delete */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">#{idx+1}</span>
                  
                  {/* SEARCH FIELD */}
                  <div ref={el => dropdownRefs.current[med.id] = el} className="relative flex-1 min-w-[150px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    <input required
                      className="w-full text-sm border border-slate-200 rounded-lg pl-7 pr-6 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
                      value={med.search !== undefined ? med.search : med.name}
                      placeholder={med.type === 'mother_tincture' ? 'Medicine (Q)' : 'Medicine name'}
                      onChange={e => setMedicines(ms => ms.map(m => m.id === med.id ? { ...m, search: e.target.value, name: e.target.value, showDropdown: true } : m))}
                      onFocus={() => setMedicines(ms => ms.map(m => m.id === med.id ? { ...m, showDropdown: true } : m))}
                    />
                    {med.search && (
                      <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 resize-y"
                        onClick={() => setMedicines(ms => ms.map(m => m.id === med.id ? { ...m, search: '', name: '', showDropdown: false } : m))}>
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    {med.showDropdown && getFilteredMedicines(med.search).length > 0 && (
                      <ul className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                        {getFilteredMedicines(med.search).map(opt => (
                          <li key={opt._id} onMouseDown={() => selectMedicine(med.id, opt.name)}
                            className="px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#062E6F] cursor-pointer">
                            {opt.name}{opt.category && <span className="text-xs text-slate-400 ml-1">{opt.category}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {med.showDropdown && med.search?.length >= 2 && getFilteredMedicines(med.search).length === 0 && (
                      <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl px-3 py-2 text-xs text-slate-500">
                        {T('No match — will save as typed', 'कोई मिलान नहीं')}
                      </div>
                    )}
                  </div>

                  {/* TYPE SELECT */}
                  <select value={med.type} onChange={e => updateMed(med.id, 'type', e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none shrink-0 font-semibold text-slate-700 w-[110px] md:w-auto">
                    {MEDICINE_TYPES.map(mt => <option key={mt.id} value={mt.id}>{isHi ? mt.labelHi : mt.label}</option>)}
                  </select>

                  {medicines.length > 1 && (
                    <button type="button" onClick={() => removeMed(med.id)} className="text-red-400 hover:text-red-600 shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Row 2: Potency + Form + Qty stepper + form label */}
                <div className="flex items-center gap-2 flex-wrap">
                  {med.type !== 'mother_tincture' && (
                    <>
                      <span className="text-[10px] font-bold text-slate-400">{T('Potency', 'पोटेंसी')}</span>
                      <select value={med.potency} onChange={e => updateMed(med.id, 'potency', e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-bold text-[#062E6F] focus:outline-none">
                        {getPotencies(med.type).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </>
                  )}
                  {med.type === 'dilution' && (
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 text-[11px] font-semibold">
                      {['pills', 'tablets', 'drops'].map(f => (
                        <button type="button" key={f} onClick={() => updateMed(med.id, 'form', f)}
                          className={`px-2.5 py-1 transition-all ${med.form === f ? 'bg-[#062E6F] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                          {f === 'pills' ? T('Pills', 'गोली') : f === 'tablets' ? T('Tablets', 'टैबलेट') : T('Drops', 'बूँद')}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Quantity Picker Button */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">{T('Qty', 'मात्रा')}</span>
                    <button
                      type="button"
                      onClick={() => activateNumberPicker(
                        `qty-${med.id}`,
                        T('Quantity', 'मात्रा'),
                        getFormLabel(med),
                        med.quantity,
                        (val) => updateMed(med.id, 'quantity', val)
                      )}
                      className={`min-h-[36px] min-w-[60px] px-3 flex items-center justify-center gap-2 border-2 rounded-lg transition-all ${
                        activeNumberField === `qty-${med.id}`
                          ? 'border-[#062E6F] bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-[#062E6F]'
                      }`}
                    >
                      <span className="text-sm font-bold text-[#062E6F]">{med.quantity}</span>
                    </button>
                    <span className="text-[10px] text-slate-500">{getFormLabel(med)}</span>
                  </div>
                </div>

                {/* Row 3: Freq + Meal + Water + Syrup — compact toggles */}
                <div className="space-y-2">
                  {/* First Row: Frequency + Meal */}
                  <div className="flex items-start gap-2 flex-wrap">
                    {/* FREQUENCY DROPDOWN */}
                    <select 
                      value={med.frequency} 
                      onChange={e => updateMed(med.id, 'frequency', e.target.value)}
                      className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#062E6F]/30 min-h-[36px] flex-1 min-w-[120px]"
                    >
                      {FREQ_OPTIONS.map(f => (
                        <option key={f.value} value={f.value}>
                          {isHi ? f.hi : f.en}
                        </option>
                      ))}
                    </select>

                    <div className="flex rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      {MEAL_OPTIONS.map(m => (
                        <button type="button" key={m.value} onClick={() => updateMed(med.id, 'meal', m.value)}
                          className={`px-2 py-1.5 text-[11px] font-bold transition-all min-h-[36px] whitespace-nowrap ${med.meal === m.value ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                          {m.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Second Row: Water Options */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">{T('Water:', 'पानी:')}</span>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <button type="button" onClick={() => updateMed(med.id, 'water', '')}
                        className={`px-1.5 py-1 text-[10px] font-bold transition-all min-h-[32px] whitespace-nowrap ${!med.water ? 'bg-slate-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                        {T('None', 'नहीं')}
                      </button>
                      {WATER_OPTIONS.map(w => (
                        <button type="button" key={w.value} onClick={() => updateMed(med.id, 'water', w.value)}
                          className={`px-1.5 py-1 text-[10px] font-bold transition-all min-h-[32px] whitespace-nowrap ${med.water === w.value ? 'bg-[#062E6F] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                          {w.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Third Row: Syrup & Teaspoons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">{T('Form:', 'रूप:')}</span>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <button type="button" onClick={() => updateMed(med.id, 'teaspoons', med.teaspoons === 'Syrup' ? '' : 'Syrup')}
                        className={`px-2 py-1 text-[10px] font-bold transition-all min-h-[32px] whitespace-nowrap ${med.teaspoons === 'Syrup' ? 'bg-[#062E6F] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                        {T('Syrup', 'सिरप')}
                      </button>
                      {TEASPOON_OPTIONS.map(tsp => (
                        <button type="button" key={tsp.value} onClick={() => updateMed(med.id, 'teaspoons', med.teaspoons === tsp.value ? '' : tsp.value)}
                          className={`px-1.5 py-1 text-[10px] font-bold transition-all min-h-[32px] whitespace-nowrap ${med.teaspoons === tsp.value ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                          {tsp.value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 4: Remarks */}
                <textarea
                  rows="3"
                  className="w-full text-xs border border-slate-100 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#062E6F]/30 text-slate-600 resize-y"
                  value={med.remarks || ''}
                  onChange={e => updateMed(med.id, 'remarks', e.target.value)}
                  placeholder={T('Doctor’s remarks for this medicine…', 'टिप्पणी (वैकल्पिक)')}
                ></textarea>
              </div>
            ))}
          </div>
        </div>

        {/* ── Duration ── */}
        <div>
          <p className="overline mb-3">{T('Duration', 'अवधि')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Days */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">{T('Days', 'दिन')}</label>
              <button
                type="button"
                onClick={() => activateNumberPicker(
                  'days',
                  T('Days', 'दिन'),
                  T('days', 'दिन'),
                  duration.days,
                  (val) => setDuration(d => ({ ...d, days: val }))
                )}
                className={`w-full h-12 flex items-center justify-center border-2 rounded-lg transition-all ${
                  activeNumberField === 'days'
                    ? 'border-[#062E6F] bg-blue-50'
                    : 'border-slate-200 bg-slate-50 hover:border-[#062E6F]'
                }`}
              >
                <span className="text-xl font-bold text-[#062E6F]">
                  {duration.days}
                </span>
              </button>
            </div>

            {/* Weeks */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">{T('Weeks', 'सप्ताह')}</label>
              <button
                type="button"
                onClick={() => activateNumberPicker(
                  'weeks',
                  T('Weeks', 'सप्ताह'),
                  T('weeks', 'सप्ताह'),
                  duration.weeks,
                  (val) => setDuration(d => ({ ...d, weeks: val }))
                )}
                className={`w-full h-12 flex items-center justify-center border-2 rounded-lg transition-all ${
                  activeNumberField === 'weeks'
                    ? 'border-[#062E6F] bg-blue-50'
                    : 'border-slate-200 bg-slate-50 hover:border-[#062E6F]'
                }`}
              >
                <span className="text-xl font-bold text-[#062E6F]">
                  {duration.weeks}
                </span>
              </button>
            </div>

            {/* Months */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">{T('Months', 'महीने')}</label>
              <button
                type="button"
                onClick={() => activateNumberPicker(
                  'months',
                  T('Months', 'महीने'),
                  T('months', 'महीने'),
                  duration.months,
                  (val) => setDuration(d => ({ ...d, months: val }))
                )}
                className={`w-full h-12 flex items-center justify-center border-2 rounded-lg transition-all ${
                  activeNumberField === 'months'
                    ? 'border-[#062E6F] bg-blue-50'
                    : 'border-slate-200 bg-slate-50 hover:border-[#062E6F]'
                }`}
              >
                <span className="text-xl font-bold text-[#062E6F]">
                  {duration.months}
                </span>
              </button>
            </div>

          </div>
          {/* Summary line */}
          {(duration.days > 0 || duration.weeks > 0 || duration.months > 0) && (
            <p className="mt-2 text-xs text-slate-500">
              {T('Total:', 'कुल:')} <span className="font-semibold text-slate-700">
                {[duration.days > 0 && `${duration.days} ${T('days', 'दिन')}`,
                duration.weeks > 0 && `${duration.weeks} ${T('weeks', 'सप्ताह')}`,
                duration.months > 0 && `${duration.months} ${T('months', 'महीने')}`,
                ].filter(Boolean).join(' + ')}
              </span>
            </p>
          )}
        </div>

        {/* ── Extra fields ── */}
        <div>
          <p className="overline mb-3">{T('Additional Info', 'अतिरिक्त जानकारी')}</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{T('Special Instructions', 'विशेष निर्देश')}</label>
              <div className="relative flex items-start">
                <textarea 
                  rows="4"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/20 focus:border-[#062E6F] text-slate-800 pr-12 resize-y" 
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder={T('Special instructions', 'विशेष निर्देश')} />
                <div className="absolute right-2 top-2">
                  <VoiceInput defaultLang={lang} onResult={text => setInstructions(text)} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{T('Follow-up Date', 'अनुवर्ती तिथि')}</label>
              <input type="date" className={inp} value={followUp} onChange={e => setFollowUp(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{T('Notes', 'नोट्स')}</label>
              <div className="relative flex items-start">
                <textarea 
                  rows="4"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/20 focus:border-[#062E6F] text-slate-800 pr-12 resize-y" 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={T('Notes', 'नोट्स')} />
                <div className="absolute right-2 top-2">
                  <VoiceInput defaultLang={lang} onResult={text => setNotes(text)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">{error}</p>
        )}

        <div className="flex gap-3 md:static md:p-0 md:bg-transparent md:border-none md:shadow-none fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[60]">
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-lg text-xs md:text-sm transition-all min-h-[44px] flex items-center justify-center"
            >
              {T('Cancel', 'रद्द करें')}
            </button>
          )}
          <button type="submit" disabled={saving}
            className={`flex-1 terracotta-btn justify-center py-3 text-xs md:text-sm font-bold shadow-lg shadow-[#062E6F]/20 min-h-[44px] flex items-center gap-1.5 ${onCancelEdit ? 'w-auto' : 'w-full'}`}>
            <Download className="h-4 w-4" />
            {saving ? T('Saving…', 'सहेज रहे हैं…') : T('Save & Download PDF', 'PDF सहेजें और डाउनलोड करें')}
          </button>
        </div>
      </form>
    </section>

      {/* RIGHT SIDE: Persistent Number Picker - Modal on mobile, sidebar on desktop */}
      
      {/* Mobile: Modal overlay when active */}
      {activeNumberField && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">{pickerConfig.label}</h3>
              <button
                type="button"
                onClick={() => setActiveNumberField(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
              >
                <span className="text-slate-600 text-lg font-bold">×</span>
              </button>
            </div>
            {/* Number Picker */}
            <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
              <PersistentNumberPicker
                activeField={activeNumberField}
                label={pickerConfig.label}
                unit={pickerConfig.unit}
                currentValue={pickerConfig.currentValue}
                onSelect={(value) => {
                  handleNumberSelect(value);
                  setActiveNumberField(null); // Close modal after selection
                }}
                lang={lang}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop: Sidebar */}
      <aside className="hidden lg:block w-[380px] shrink-0 sticky top-0 self-start">
        <PersistentNumberPicker
          activeField={activeNumberField}
          label={pickerConfig.label}
          unit={pickerConfig.unit}
          currentValue={pickerConfig.currentValue}
          onSelect={handleNumberSelect}
          lang={lang}
        />
      </aside>

    </div>
    </>
  );
}
