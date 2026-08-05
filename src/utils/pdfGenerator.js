import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const FREQ_OPTIONS = [
  { value: 'OD', en: 'OD – Once daily', hi: 'OD – Once daily' },
  { value: 'BD', en: 'BD – Twice daily', hi: 'BD – Twice daily' },
  { value: 'TDS', en: 'TDS – Thrice daily', hi: 'TDS – Thrice daily' },
  { value: 'QID', en: 'QID – Four times daily', hi: 'QID – Four times daily' },
];

const MEAL_OPTIONS = [
  { value: 'BM', en: 'Before Meal', hi: 'Before Meal' },
  { value: 'AM', en: 'After Meal', hi: 'After Meal' },
  { value: 'DM', en: 'During Meal', hi: 'During Meal' },
];

const WATER_LABELS = {
  '1/4': '¼ cup water',
  '1/2': '½ cup water',
  'full': 'Full cup water',
};

const HINDI_SYMPTOM_MAP = {
  'सिर दर्द': 'Headache', 'सिरदर्द': 'Headache', 'सर दर्द': 'Headache',
  'पेट दर्द': 'Stomach pain', 'पेट में दर्द': 'Stomach pain', 'बुखार': 'Fever',
  'तेज़ बुखार': 'High fever', 'खांसी': 'Cough', 'सूखी खांसी': 'Dry cough',
  'जुकाम': 'Cold / Runny nose', 'सर्दी': 'Cold', 'थकावट': 'Fatigue', 'कमजोरी': 'Weakness',
  'उल्टी': 'Vomiting', 'जी मिचलाना': 'Nausea', 'चक्कर': 'Dizziness', 'चक्कर आना': 'Dizziness',
  'दस्त': 'Diarrhea', 'कब्ज': 'Constipation', 'छाती में दर्द': 'Chest pain',
  'सांस लेने में तकलीफ': 'Shortness of breath', 'गले में खराश': 'Sore throat',
  'जोड़ों का दर्द': 'Joint pain', 'पीठ दर्द': 'Back pain', 'कमर दर्द': 'Lower back pain',
  'गर्दन दर्द': 'Cervical pain', 'मौत का डर': 'Fear of death', 'ऊंचाई से डर': 'Fear of heights',
  'डर': 'Fear / Anxiety', 'चिंता': 'Anxiety', 'गुस्सा': 'Anger / Irritability', 'सूजन': 'Swelling'
};

const devanagariMap = {
  'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au','अं':'an','अः':'ah',
  'ा':'aa','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au','ं':'n','ः':'h','़':'','्':'',
  'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng',
  'च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'n',
  'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n',
  'त':'t','थ':'th','द':'d','ध':'dh','न':'n',
  'प':'p','फ':'ph','ब':'b','भ':'bh','म':'m',
  'य':'y','र':'r','ल':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h',
  'ड़':'d','ढ़':'dh','ज्ञ':'gy'
};

const transliterateHindi = (text) => {
  if (!text) return '';
  let str = String(text).trim();
  if (HINDI_SYMPTOM_MAP[str]) return HINDI_SYMPTOM_MAP[str];
  
  if (/[\u0900-\u097F]/.test(str)) {
    for (const [hi, en] of Object.entries(HINDI_SYMPTOM_MAP)) {
      if (str.includes(hi)) {
        str = str.replace(new RegExp(hi, 'g'), en);
      }
    }
    let res = '';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (devanagariMap[char] !== undefined) {
        res += devanagariMap[char];
      } else {
        res += char;
      }
    }
    return res.trim().replace(/\s+/g, ' ');
  }
  return str;
};

const cleanSymptomText = (sym) => {
  if (!sym) return '';
  let str = '';
  if (typeof sym === 'string') {
    str = sym;
  } else if (typeof sym === 'object') {
    str = sym.symptom || sym.rubricName || sym.rubric || sym.name || sym.label || JSON.stringify(sym);
  } else {
    str = String(sym);
  }
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str);
      str = parsed.symptom || parsed.rubricName || parsed.rubric || parsed.name || str;
    } catch (e) {}
  }
  return transliterateHindi(str);
};

const freqLabel = (val, lang) => {
  const o = FREQ_OPTIONS.find(f => f.value === val);
  return o ? o.en : (val || '');
};

const mealLabel = (val, lang) => {
  const o = MEAL_OPTIONS.find(m => m.value === val);
  return o ? o.en : (val || '');
};

const getFormLabel = (med, lang) => {
  if (med.type === 'mother_tincture') return 'Drops';
  if (med.type === 'biochemic') return 'Tablets';
  return med.form === 'drops' ? 'Drops' : 'Pills / Globules';
};

export const generatePrescriptionPDF = (prescription, lang = 'en', autoDownload = true) => {
  if (!prescription) return null;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const marginL = 15;
  const marginR = 15;
  const contentW = W - marginL - marginR;

  const doctorName        = transliterateHindi(prescription.doctorName        || 'Dr. Unknown');
  const doctorClinic      = transliterateHindi(prescription.doctorClinic      || 'Homeopathic Clinic');
  const doctorContact     = prescription.doctorContact     || '';
  const doctorQualifications = transliterateHindi(prescription.doctorQualifications || prescription.qualifications || 'BHMS');
  const doctorExperience  = prescription.doctorExperience  || prescription.experience || '';
  const doctorRegistration = prescription.doctorRegistration || prescription.registrationNumber || '';

  // ══════════════════════════════════════════════════════════════════════════
  // MODERN HEADER with gradient and enhanced doctor info
  // ══════════════════════════════════════════════════════════════════════════
  
  doc.setFillColor(21, 67, 96); // Professional dark blue
  doc.rect(0, 0, W, 55, 'F');
  
  doc.setFillColor(242, 153, 74); 
  doc.rect(0, 0, W, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(doctorName, W / 2, 18, { align: 'center' });
  
  let currentY = 26;
  
  if (doctorQualifications) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(doctorQualifications, W / 2, currentY, { align: 'center' });
    currentY += 7;
  }
  
  if (doctorRegistration) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reg. No: ${doctorRegistration}`, W / 2, currentY, { align: 'center' });
    currentY += 7;
  }
  
  if (doctorExperience) {
    doc.setFontSize(9);
    doc.text(`${doctorExperience} years experience`, W / 2, currentY, { align: 'center' });
    currentY += 7;
  }
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(doctorClinic, W / 2, currentY, { align: 'center' });
  currentY += 7;
  
  if (doctorContact) {
    doc.setFontSize(9);
    doc.text(`Phone: ${doctorContact}`, W / 2, currentY, { align: 'center' });
  }
  
  doc.setFillColor(242, 153, 74);
  doc.rect(0, 53, W, 2, 'F');

  let y = 70;

  // ══════════════════════════════════════════════════════════════════════════
  // PRESCRIPTION TITLE
  // ══════════════════════════════════════════════════════════════════════════
  
  doc.setTextColor(21, 67, 96);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIPTION', marginL, y);
  
  y += 12;

  // ══════════════════════════════════════════════════════════════════════════
  // PATIENT INFO CARD
  // ══════════════════════════════════════════════════════════════════════════
  
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginL, y, contentW, 35, 2, 2, 'F');
  
  doc.setDrawColor(220, 226, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginL, y, contentW, 35, 2, 2, 'S');
  
  y += 8;
  
  const patientNameClean = transliterateHindi(prescription.patientName || '—');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient:', marginL + 5, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(patientNameClean, marginL + 20, y);
  
  const dateStr = new Date(prescription.prescribedAt || prescription.createdAt || Date.now()).toLocaleDateString('en-IN');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${dateStr}`, marginL + contentW - 5, y, { align: 'right' });
  
  y += 6;
  
  const details = [];
  if (prescription.patientAge) {
    details.push(`Age: ${prescription.patientAge} yrs`);
  }
  if (prescription.patientGender) {
    details.push(`Gender: ${prescription.patientGender}`);
  }
  if (prescription.patientWeight) {
    details.push(`Weight: ${prescription.patientWeight} kg`);
  }
  if (prescription.patientContact) {
    details.push(`Contact: ${prescription.patientContact}`);
  }
  
  if (details.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(details.join(' • '), marginL + 5, y);
  }
  
  y += 6;
  
  if (prescription.repertoryName) {
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.text(`Repertory Used: ${transliterateHindi(prescription.repertoryName)}`, marginL + 5, y);
  }
  
  const refId = prescription._id || prescription.id;
  if (refId) {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Ref: ${String(refId).slice(-8)}`, W - marginR - 5, y, { align: 'right' });
  }
  
  y += 6;

  // ══════════════════════════════════════════════════════════════════════════
  // MEDICINES TABLE
  // ══════════════════════════════════════════════════════════════════════════
  
  let rows = [];
  if (prescription.medicines && prescription.medicines.length > 0) {
    rows = prescription.medicines.map((m, i) => {
      const pot  = m.type === 'mother_tincture' ? 'Q' : (m.potency || '');
      const qty  = `${m.quantity || '—'} ${getFormLabel(m, lang)}`;
      const freq = freqLabel(m.frequency, lang);
      const meal = mealLabel(m.meal, lang);

      const dosageParts = [freq, meal];
      if (m.water && m.water !== '') {
        dosageParts.push(WATER_LABELS[m.water] || m.water);
      }
      if (m.teaspoons && m.teaspoons !== '') {
        dosageParts.push(m.teaspoons);
      }
      const dosageStr = dosageParts.filter(Boolean).join('\n');

      const nameLine = `${transliterateHindi(m.name)}${pot ? ` ${pot}` : ''}`;
      const remarks = m.remarks ? `\n${transliterateHindi(m.remarks)}` : '';

      return [`${i + 1}`, `${nameLine}${remarks}`, qty, dosageStr];
    });
  } else {
    const remedies  = (prescription.remedy  || '').split(',').map(r => transliterateHindi(r.trim()));
    const potencies = (prescription.potency || '').split(',').map(p => p.trim());
    const dosages   = (prescription.dosage  || '').split(';').map(d => transliterateHindi(d.trim()));
    rows = remedies.map((rem, i) => [
      `${i + 1}`,
      `${rem} ${potencies[i] || ''}`,
      '',
      dosages[i] || '',
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [['#', 'Medicine', 'Quantity', 'Dosage / Timing']],
    body: rows,
    theme: 'plain',
    styles: { 
      fontSize: 9.5,
      cellPadding: 4,
      lineColor: [220, 226, 235],
      lineWidth: 0.1,
      textColor: [30, 41, 59]
    },
    headStyles: { 
      fillColor: [21, 67, 96],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 5,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { cellWidth: 70, valign: 'middle' },
      2: { cellWidth: 35, valign: 'middle' },
      3: { cellWidth: 'auto', valign: 'middle' },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: marginL, right: marginR },
    tableLineColor: [220, 226, 235],
    tableLineWidth: 0.3,
  });

  y = doc.lastAutoTable.finalY + 12;

  // ══════════════════════════════════════════════════════════════════════════
  // PRESCRIPTION DETAILS
  // ══════════════════════════════════════════════════════════════════════════
  
  if (prescription.duration && prescription.duration !== '—') {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Duration:', marginL, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(transliterateHindi(prescription.duration), marginL + 26, y);
    y += 8;
  }

  if (prescription.instructions) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Instructions:', marginL, y);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const instrLines = doc.splitTextToSize(transliterateHindi(prescription.instructions), contentW - 32);
    doc.text(instrLines, marginL + 32, y);
    y += instrLines.length * 5 + 3;
  }

  if (prescription.followUpDate) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Follow-up:', marginL, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(new Date(prescription.followUpDate).toLocaleDateString('en-IN'), marginL + 28, y);
    y += 8;
  }

  if (prescription.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Notes:', marginL, y);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const notesLines = doc.splitTextToSize(transliterateHindi(prescription.notes), contentW - 22);
    doc.text(notesLines, marginL + 22, y);
    y += notesLines.length * 5 + 3;
  }

  y += 4;

  // ══════════════════════════════════════════════════════════════════════════
  // CHIEF COMPLAINTS / SYMPTOMS - Normalized & Transliterated
  // ══════════════════════════════════════════════════════════════════════════
  
  let symptomList = [];
  if (Array.isArray(prescription.symptoms)) {
    symptomList = prescription.symptoms
      .map(s => cleanSymptomText(s))
      .filter(s => s && s.trim().length > 0);
  } else if (typeof prescription.symptoms === 'string' && prescription.symptoms.trim()) {
    symptomList = prescription.symptoms
      .split(/[,;\n]+/)
      .map(s => cleanSymptomText(s))
      .filter(s => s && s.trim().length > 0);
  }
  
  if (symptomList.length > 0 && y < H - 45) {
    doc.setDrawColor(220, 226, 235);
    doc.line(marginL, y, W - marginR, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Chief Complaints / Symptoms', marginL, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    
    symptomList.slice(0, 10).forEach((sym, i) => {
      if (y < H - 40) {
        const symLines = doc.splitTextToSize(`${i + 1}. ${sym}`, contentW - 8);
        doc.text(symLines, marginL + 3, y);
        y += symLines.length * 4.5 + 2;
      }
    });
    
    y += 4;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GUIDELINES BOX
  // ══════════════════════════════════════════════════════════════════════════
  
  if (y < H - 35) {
    doc.setFillColor(255, 250, 240);
    doc.roundedRect(marginL, y, contentW, 20, 2, 2, 'F');
    
    doc.setDrawColor(242, 153, 74);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginL, y, contentW, 20, 2, 2, 'S');

    doc.setTextColor(180, 83, 9);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Homeopathic Guidelines', marginL + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 53, 15);
    
    const guidelines = [
      '• Take 30 min before/after meals  •  Avoid coffee, mint, camphor & strong odors',
      '• Let medicine dissolve under tongue  •  Store in a cool, dry place',
    ];
    
    guidelines.forEach((g, gi) => {
      doc.text(g, marginL + 3, y + 10 + gi * 4.5);
    });

    y += 25;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════════════════════
  
  const footerY = H - 15;
  
  doc.setDrawColor(220, 226, 235);
  doc.setLineWidth(0.3);
  doc.line(marginL, footerY, W - marginR, footerY);
  
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Generated by Homeopathic Management System', W / 2, footerY + 5, { align: 'center' });

  if (autoDownload) {
    const safeName = (patientNameClean || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Prescription_${safeName}_${Date.now()}.pdf`);
    return null;
  } else {
    return doc.output('bloburl');
  }
};

export const getPrescriptionPDFBlobUrl = (prescription, lang = 'en') => {
  return generatePrescriptionPDF(prescription, lang, false);
};
