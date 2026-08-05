// Bilingual dictionary for the entire Dashboard application
export const translations = {
  en: {
    dashboard: "Dashboard",
    coreTeam: "Core Team",
    patients: "Patients",
    rubricAnalyzer: "Rubric Analyzer",
    medicines: "Medicines",
    rubrics: "Rubrics",
    repertories: "Repertories",
    admin: "Admin",
    welcome: "Welcome back, Dr. Jp Nautiyal",
    subtitle: "Homeopathic Clinic Management & Repertory System",
    language: "हिन्दी",
    logout: "Logout",
    totalPatients: "Total Patients",
    totalCoreTeam: "Total Core Team Members",
    externalDoctors: "External Doctors",
    recentPatients: "Recent Patients",
    topRightRubricBtn: "Quick Rubric Analyzer",
    searchPlaceholder: "Search here...",
    addMember: "Add Core Team Member",
    addPatient: "Add New Patient",
    name: "Name",
    role: "Role",
    status: "Status",
    email: "Email",
    actions: "Actions",
    age: "Age",
    gender: "Gender",
    contact: "Contact",
    lastVisit: "Last Visit",
    symptoms: "Symptoms",
    active: "Active",
    inactive: "Inactive",
    onBreak: "On Break",
    homeopathicRemedy: "Homeopathic Remedy",
    commonRubrics: "Common Rubrics",
    description: "Description / Key Indications",
    category: "Category",
    symptom: "Symptom",
    repertoryName: "Repertory Name",
    author: "Author/Source",
    chapters: "Chapters",
    timestamp: "Timestamp",
    logMessage: "Log Message",
    severity: "Severity",
    source: "Source",
    close: "Close",
    calculate: "Calculate Remedies",
    selectedRubrics: "Selected Rubrics",
    availableRubrics: "Available Rubrics",
    remedyResults: "Remedy Analysis Results",
    intensity: "Intensity/Degree",
    addRubric: "Add Rubric",
    remove: "Remove",
    matchScore: "Match Score",
    noRubricsSelected: "No rubrics selected. Search and add rubrics above to begin analysis.",
    resultsWillShow: "Remedy analysis results will be displayed here.",
    topIndicatedRemedies: "Top Indicated Remedies",
    patientDetails: "Patient Details (Optional)",
    patientNamePlaceholder: "e.g. Ramesh Kumar",
    degree: "Degree",
    activityLogins: "User Logins",
    activityCases: "Cases Analyzed",
    activitySyncs: "Data Syncs",
    systemStatus: "System Status: Healthy",
    loggedAs: "Logged in as Admin"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    coreTeam: "मुख्य टीम",
    patients: "मरीज़",
    rubricAnalyzer: "रुब्रिक विश्लेषक",
    medicines: "दवाएं",
    rubrics: "रुब्रिक्स",
    repertories: "रेपरटॉरी",
    admin: "व्यवस्थापक",
    welcome: "आपका स्वागत है, डॉ. जे.पी. नौटियाल",
    subtitle: "होम्योपैथिक क्लिनिक प्रबंधन और रेपरटॉरी प्रणाली",
    language: "English",
    logout: "लॉगआउट",
    totalPatients: "कुल मरीज़",
    totalCoreTeam: "कुल मुख्य टीम सदस्य",
    externalDoctors: "बाहरी डॉक्टर",
    recentPatients: "हाल के मरीज़",
    topRightRubricBtn: "त्वरित रुब्रिक विश्लेषक",
    searchPlaceholder: "यहाँ खोजें...",
    addMember: "मुख्य टीम सदस्य जोड़ें",
    addPatient: "नया मरीज़ जोड़ें",
    name: "नाम",
    role: "भूमिका",
    status: "स्थिति",
    email: "ईमेल",
    actions: "कार्रवाई",
    age: "उम्र",
    gender: "लिंग",
    contact: "संपर्क",
    lastVisit: "पिछली विज़िट",
    symptoms: "लक्षण",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    onBreak: "छुट्टी पर",
    homeopathicRemedy: "होम्योपैथिक दवा",
    commonRubrics: "सामान्य रुब्रिक्स",
    description: "विवरण / मुख्य संकेत",
    category: "श्रेणी",
    symptom: "लक्षण",
    repertoryName: "रेपरटॉरी का नाम",
    author: "लेखक/स्रोत",
    chapters: "अध्याय",
    timestamp: "समय",
    logMessage: "लॉग संदेश",
    severity: "गंभीरता",
    source: "स्रोत",
    close: "बंद करें",
    calculate: "दवाओं की गणना करें",
    selectedRubrics: "चयनित रुब्रिक्स",
    availableRubrics: "उपलब्ध रुब्रिक्स",
    remedyResults: "दवा विश्लेषण परिणाम",
    intensity: "तीव्रता/डिग्री",
    addRubric: "रुब्रिक जोड़ें",
    remove: "हटाएं",
    matchScore: "मैच स्कोर",
    noRubricsSelected: "कोई रुब्रिक्स चयनित नहीं है। विश्लेषण शुरू करने के लिए ऊपर खोजें और रुब्रिक्स जोड़ें।",
    resultsWillShow: "दवा विश्लेषण परिणाम यहाँ प्रदर्शित होंगे।",
    topIndicatedRemedies: "शीर्ष संकेतित दवाएं",
    patientDetails: "मरीज का विवरण (वैकल्पिक)",
    patientNamePlaceholder: "जैसे: रमेश कुमार",
    degree: "डिग्री",
    activityLogins: "यूज़र लॉगिन",
    activityCases: "विश्लेषण मामले",
    activitySyncs: "डेटा सिंक",
    systemStatus: "सिस्टम स्थिति: स्वस्थ",
    loggedAs: "व्यवस्थापक के रूप में लॉग इन"
  }
};

// Initial Mock Data
export const statsData = {
  totalPatients: 1482,
  totalCoreTeam: 12,
  externalDoctors: 48
};

export const coreTeamMembers = [
  { id: 1, name: "Dr. Jp Nautiyal", role: "Chief Homeopathic Physician & Director", email: "jpnautiyal@homo.com", phone: "+91 98765 00001", status: "Active", initials: "JN", color: "bg-emerald-600" },
  { id: 2, name: "Dr. Ananya Sharma", role: "Senior Repertory Consultant", email: "ananya.sharma@homo.com", phone: "+91 98765 00002", status: "Active", initials: "AS", color: "bg-blue-600" },
  { id: 3, name: "Dr. Vikram Malhotra", role: "Pediatric Homeopathy Specialist", email: "vikram.m@homo.com", phone: "+91 98765 00003", status: "Active", initials: "VM", color: "bg-indigo-600" },
  { id: 4, name: "Dr. Priya Patel", role: "Chronic Disease Specialist", email: "priya.p@homo.com", phone: "+91 98765 00004", status: "On Break", initials: "PP", color: "bg-amber-500" },
  { id: 5, name: "Amit Verma", role: "System Administrator & Tech Support", email: "amit.v@homo.com", phone: "+91 98765 00005", status: "Active", initials: "AV", color: "bg-rose-500" },
  { id: 6, name: "Dr. Rajesh Rawat", role: "Clinical Pharmacist", email: "rajesh.r@homo.com", phone: "+91 98765 00006", status: "Inactive", initials: "RR", color: "bg-slate-500" }
];

export const patientsList = [
  { id: 1, name: "Ramesh Kumar", age: 42, gender: "Male", contact: "+91 98765 43210", lastVisit: "2026-06-18", symptoms: "Chronic acidity, sleeplessness, irritable temper", genderHindi: "पुरुष", symptomsHindi: "पुरानी एसिडिटी, अनिद्रा, चिड़चिड़ा स्वभाव" },
  { id: 2, name: "Sita Devi", age: 38, gender: "Female", contact: "+91 98123 45678", lastVisit: "2026-06-17", symptoms: "Joint pain worse in cold weather, morning stiffness", genderHindi: "महिला", symptomsHindi: "ठंडे मौसम में जोड़ों का दर्द, सुबह की अकड़न" },
  { id: 3, name: "Aarav Mehta", age: 9, gender: "Male", contact: "+91 99887 76655", lastVisit: "2026-06-16", symptoms: "Dry tickling cough at night, mild fever", genderHindi: "पुरुष", symptomsHindi: "रात में सूखी खांसी, हल्का बुखार" },
  { id: 4, name: "Kiran Rao", age: 55, gender: "Female", contact: "+91 98712 34567", lastVisit: "2026-06-15", symptoms: "Anxiety in evenings, hot flashes, palpitation", genderHindi: "महिला", symptomsHindi: "शाम को चिंता, गर्मी लगना, घबराहट" },
  { id: 5, name: "Harpreet Singh", age: 29, gender: "Male", contact: "+91 97654 32109", lastVisit: "2026-06-12", symptoms: "Skin eczema with watery discharge, intense itching", genderHindi: "पुरुष", symptomsHindi: "पानी जैसे स्राव के साथ त्वचा एक्जिमा, तेज खुजली" },
  { id: 6, name: "Sunita Joshi", age: 63, gender: "Female", contact: "+91 99112 23344", lastVisit: "2026-06-10", symptoms: "Vertigo while looking up, weakness, memory loss", genderHindi: "महिला", symptomsHindi: "ऊपर देखते समय चक्कर आना, कमजोरी, याददाश्त में कमी" },
  { id: 7, name: "Mohit Sharma", age: 35, gender: "Male", contact: "+91 95432 16789", lastVisit: "2026-06-09", symptoms: "Migraine headaches, worse from light and noise", genderHindi: "पुरुष", symptomsHindi: "माइग्रेन सिरदर्द, रोशनी और शोर से बदतर" },
  { id: 8, name: "Priya Gupta", age: 28, gender: "Female", contact: "+91 94567 12345", lastVisit: "2026-06-08", symptoms: "Menstrual irregularities, mood swings", genderHindi: "महिला", symptomsHindi: "मासिक धर्म की अनियमितता, मूड स्विंग्स" },
  { id: 9, name: "Ravi Patel", age: 50, gender: "Male", contact: "+91 93456 78901", lastVisit: "2026-06-07", symptoms: "High blood pressure, dizziness, fatigue", genderHindi: "पुरुष", symptomsHindi: "हाई ब्लड प्रेशर, चक्कर आना, थकान" },
  { id: 10, name: "Anjali Singh", age: 33, gender: "Female", contact: "+91 92345 67890", lastVisit: "2026-06-06", symptoms: "Chronic constipation, bloating, lower back pain", genderHindi: "महिला", symptomsHindi: "पुरानी कब्ज, पेट फूलना, पीठ के निचले हिस्से में दर्द" }
];

export const medicinesData = [
  { 
    id: 1, 
    name: "Nux Vomica", 
    description: "Highly indicated for irritable, impatient temperaments. Suited to people with sedentary lives, mental strain, and digestive disorders caused by rich foods, stimulants, or medications.",
    descriptionHindi: "चिड़चिड़े, अधीर स्वभाव के लिए अत्यधिक संकेतित। गतिहीन जीवन, मानसिक तनाव और गरिष्ठ भोजन, उत्तेजक पदार्थों या दवाओं के कारण होने वाले पाचन विकारों वाले लोगों के लिए उपयुक्त।",
    rubrics: ["Mind: Irritable, angry easily", "Stomach: Heartburn after eating", "Stomach: Constipation, ineffectual urging", "Sleep: Insomnia from mental work"],
    rubricsHindi: ["मन: चिड़चिड़ा, आसानी से क्रोधित होना", "पेट: खाने के बाद सीने में जलन", "पेट: कब्ज, अधूरा मलत्याग", "नींद: मानसिक काम से अनिद्रा"]
  },
  { 
    id: 2, 
    name: "Lycopodium clavatum", 
    description: " Suited for complaints that gradually develop, affecting the right side of the body. Often indicated for low confidence, gas bloating, and symptoms that worsen between 4 PM to 8 PM.",
    descriptionHindi: "धीरे-धीरे विकसित होने वाली शिकायतों के लिए उपयुक्त, जो शरीर के दाहिने हिस्से को प्रभावित करती हैं। अक्सर कम आत्मविश्वास, गैस पेट फूलना और शाम 4 से 8 बजे के बीच बिगड़ने वाले लक्षणों के लिए संकेतित।",
    rubrics: ["Mind: Lack of self confidence", "Stomach: Flatulence and bloating", "Head: Throbbing headache", "General: Symptoms worse 4 PM - 8 PM"],
    rubricsHindi: ["मन: आत्मविश्वास की कमी", "पेट: गैस और पेट फूलना", "सिर: धड़कने वाला सिरदर्द", "सामान्य: लक्षण शाम 4-8 बजे बदतर"]
  },
  { 
    id: 3, 
    name: "Pulsatilla pratensis", 
    description: "Suited for mild, gentle, yielding dispositions. Patients who cry easily, seek fresh open air, have changing symptoms, and lack thirst.",
    descriptionHindi: "सौम्य, कोमल, शर्मीले स्वभाव के लिए उपयुक्त। ऐसे मरीज़ जो आसानी से रोते हैं, ताजी खुली हवा चाहते हैं, बदलते लक्षण होते हैं, और प्यास की कमी होती है।",
    rubrics: ["Mind: Weeping, mild disposition", "General: Better in open air", "Stomach: Thirstlessness with dry mouth", "Respiratory: Cough wet in day, dry at night"],
    rubricsHindi: ["मन: रोने की प्रवृत्ति, सौम्य स्वभाव", "सामान्य: खुली हवा में बेहतर", "पेट: सूखे मुंह के साथ प्यास न लगना", "श्वसन: दिन में गीली खांसी, रात में सूखी"]
  },
  { 
    id: 4, 
    name: "Arsenicum Album", 
    description: "Indicated for intense anxiety, restlessness, burning pains relieved by heat, and fastidiousness (neatness). Thirst for small sips of cold water at short intervals.",
    descriptionHindi: "अत्यधिक चिंता, बेचैनी, गर्मी से राहत मिलने वाले जलन के दर्द और अत्यधिक सफाई पसंद करने वालों के लिए संकेतित। कम अंतराल पर ठंडे पानी के छोटे घूंट की प्यास।",
    rubrics: ["Mind: Anxiety, restlessness", "General: Burning pain relieved by heat", "Stomach: Gastric upset from cold food", "Sleep: Fear of death at night"],
    rubricsHindi: ["मन: चिंता, बेचैनी", "सामान्य: गर्मी से राहत मिलने वाला जलन का दर्द", "पेट: ठंडे भोजन से गैस्ट्रिक खराबी", "नींद: रात में मौत का डर"]
  },
  { 
    id: 5, 
    name: "Sepia officinalis", 
    description: "Great remedy for portal congestion, hormonal imbalances, and a state of indifference or apathy to loved ones. Better with vigorous exercise and heat.",
    descriptionHindi: "हार्मोनल असंतुलन, और प्रियजनों के प्रति उदासीनता की स्थिति के लिए बेहतरीन दवा। जोरदार व्यायाम और गर्मी से बेहतर।",
    rubrics: ["Mind: Indifference to loved ones", "Female: Bearing down sensation", "General: Better from vigorous motion", "Skin: Yellow-brown spots on face"],
    rubricsHindi: ["मन: प्रियजनों के प्रति उदासीनता", "महिला: नीचे की ओर दबाव महसूस होना", "सामान्य: जोरदार गतिविधि से बेहतर", "त्वचा: चेहरे पर पीले-भूरे रंग के धब्बे"]
  }
];

export const rubricsData = [
  { id: 1, chapter: "Mind", chapterHindi: "मन", symptom: "Anger, easily provoked", symptomHindi: "क्रोध, आसानी से भड़कना", remedies: { "Nux Vomica": 3, "Lycopodium": 2, "Arsenicum Album": 1 } },
  { id: 2, chapter: "Mind", chapterHindi: "मन", symptom: "Anxiety in evening / night", symptomHindi: "शाम / रात को चिंता", remedies: { "Arsenicum Album": 3, "Pulsatilla": 2, "Sepia": 1 } },
  { id: 3, chapter: "Mind", chapterHindi: "मन", symptom: "Weeping easily, desires sympathy", symptomHindi: "आसानी से रोना, सहानुभूति की इच्छा", remedies: { "Pulsatilla": 3, "Sepia": 1 } },
  { id: 4, chapter: "Mind", chapterHindi: "मन", symptom: "Confidence, lack of self", symptomHindi: "आत्मविश्वास, स्वयं में कमी", remedies: { "Lycopodium": 3, "Pulsatilla": 1 } },
  { id: 5, chapter: "Head", chapterHindi: "सिर", symptom: "Pain, burning, relieved by cold application", symptomHindi: "दर्द, जलन, ठंडे सेक से राहत", remedies: { "Arsenicum Album": 2, "Pulsatilla": 3 } },
  { id: 6, chapter: "Head", chapterHindi: "सिर", symptom: "Pain, throbbing, from mental exertion", symptomHindi: "दर्द, धड़कन, मानसिक श्रम से", remedies: { "Nux Vomica": 3, "Lycopodium": 2 } },
  { id: 7, chapter: "Stomach", chapterHindi: "पेट", symptom: "Heartburn, acidity after eating", symptomHindi: "सीने में जलन, खाने के बाद एसिडिटी", remedies: { "Nux Vomica": 3, "Lycopodium": 2, "Arsenicum Album": 2 } },
  { id: 8, chapter: "Stomach", chapterHindi: "पेट", symptom: "Flatulence, bloated abdomen, 4-8 PM", symptomHindi: "गैस, पेट फूलना, शाम 4-8 बजे", remedies: { "Lycopodium": 3 } },
  { id: 9, chapter: "Stomach", chapterHindi: "पेट", symptom: "Thirstlessness with dry mouth", symptomHindi: "सूखे मुंह के साथ प्यास न लगना", remedies: { "Pulsatilla": 3 } },
  { id: 10, chapter: "Generalities", chapterHindi: "सामान्य", symptom: "Cold air worsens symptoms", symptomHindi: "ठंडी हवा लक्षणों को बिगाड़ती है", remedies: { "Nux Vomica": 2, "Arsenicum Album": 3 } },
  { id: 11, chapter: "Generalities", chapterHindi: "सामान्य", symptom: "Better in fresh open air", symptomHindi: "ताजी खुली हवा में बेहतर", remedies: { "Pulsatilla": 3, "Sepia": 2 } }
];

// Repertories are now loaded dynamically from the backend database
// No hardcoded mock data - only show repertories that are actually uploaded
export const repertoriesList = [];


