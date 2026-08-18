import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, UploadCloud, Check, Loader2, ChevronRight, 
  Settings, AlertCircle, ArrowLeft, Pencil, FileText, 
  Save, Eye, RefreshCw, X, Plus, Search, ExternalLink
} from 'lucide-react';
import { getRepertories, createRepertory, getChapters, uploadRepertoryPDF, updateChapterPages, scanMedicinePages } from '../services/api';

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

// Master Materia Medica remedies mapped to standard first appearance pages
const DEFAULT_MATERIA_MEDICA_INDEX = {
  "ABIES CANADENSIS": 12,
  "ABIES NIGRA": 13,
  "ABROTANUM": 14,
  "ABRUS PRAECATORIUS": 422,
  "ABRUS PRÆCATORIUS": 422,
  "ABSINTHIUM": 15,
  "ACALYPHA": 16,
  "ACANTHIA": 246,
  "ACETANILID": 17,
  "ACETIC ACID": 17,
  "ACHYRANTHES": 24,
  "ACONITINE": 23,
  "ACONITUM FEROX": 24,
  "ACONITUM LYCOCTONUM": 23,
  "ACONITUM NAPELLUS": 19,
  "ACTAEA RACEMOSA": 247,
  "ACTAEA SPICATA": 25,
  "ACTÆA RACEMOSA": 247,
  "ACTÆA SPICATA": 25,
  "ADONIDIN": 26,
  "ADONIS VERNALIS": 25,
  "ADRENALIN": 26,
  "AESCULUS GLABRA": 31,
  "AESCULUS HIPPOCASTANUM": 28,
  "AETHIOPS ANTIMONIALIS": 31,
  "AETHIOPS MERCURIALIS": 31,
  "AETHUSA CYNAPIUM": 31,
  "AGARICIN": 154,
  "AGARICUS EMETICUS": 37,
  "AGARICUS MUSCARIUS": 34,
  "AGARICUS PHALLOIDES": 37,
  "AGAVE": 38,
  "AGNUS CASTUS": 38,
  "AGRAPHIS": 39,
  "AGRIMONIA": 386,
  "AGROPYRUM": 763,
  "AGROSTEMA": 580,
  "AILANTHUS": 39,
  "ALCOHOL SULPHURIS": 213,
  "ALETRIS FARINOSA": 40,
  "ALFALFA": 41,
  "ALKEKENGI": 598,
  "ALLIUM CEPA": 42,
  "ALLIUM SATIVUM": 44,
  "ALNUS": 45,
  "ALOE": 45,
  "ALSTONIA": 48,
  "ALUMEN": 48,
  "ALUMINA": 50,
  "ALUMINA ACETICA": 53,
  "ALUMINA SILICATA": 53,
  "AMBRA GRISEA": 53,
  "AMBROSIA": 55,
  "AMMONIACUM": 55,
  "AMMONIUM ACETICUM": 19,
  "AMMONIUM BENZOICUM": 56,
  "AMMONIUM BROMATUM": 56,
  "AMMONIUM CARBONICUM": 57,
  "AMMONIUM CAUSTICUM": 60,
  "AMMONIUM MURIATICUM": 61,
  "AMMONIUM PHOSPHORICUM": 63,
  "AMMONIUM PICRICUM": 64,
  "AMPELOPSIS": 64,
  "AMYGDALA AMARA": 65,
  "AMYGDALUS PERSICA": 64,
  "AMYL NITRITE": 65,
  "ANACARDIUM OCCIDENTALE": 68,
  "ANACARDIUM ORIENTALE": 66,
  "ANAGALLIS": 69,
  "ANANTHERUM": 69,
  "ANGUSTURA": 71,
  "ANILINUM": 72,
  "ANTHEMIS": 72,
  "ANTHRACINUM": 73,
  "ANTHRAKOKALI": 74,
  "ANTIMONIUM ARSENICUM": 74,
  "ANTIMONIUM CRUDUM": 74,
  "ANTIMONIUM TARTARICUM": 78,
  "ANTIPYRINUM": 80,
  "APIS MELLIFICA": 81,
  "APIUM GRAVEOLENS": 85,
  "APOCYNUM ANDROSAEMIFOLIUM": 86,
  "APOCYNUM CANNABINUM": 86,
  "APOMORPHINUM": 88,
  "AQUILEGIA": 88,
  "ARAGALLUS": 89,
  "ARALIA RACEMOSA": 89,
  "ARANEA DIADEMA": 90,
  "ARBUTUS": 92,
  "ARECA": 92,
  "ARGEMONE": 92,
  "ARGENTUM METALLICUM": 93,
  "ARGENTUM NITRICUM": 94,
  "ARNICA MONTANA": 98,
  "ARSENICUM ALBUM": 101,
  "ARSENICUM BROMATUM": 106,
  "ARSENICUM IODATUM": 107,
  "ARSENICUM METALLICUM": 109,
  "ARSENICUM SULPHURATUM": 110,
  "ARTEMISIA VULGARIS": 110,
  "ARUM TRIPHYLLUM": 111,
  "ARUNDO": 112,
  "ASAFOETIDA": 113,
  "ASARUM": 115,
  "ASCLEPIAS TUBEROSA": 117,
  "ASPARAGUS": 118,
  "ASPIDOSPERMA": 119,
  "ASTACUS FLUVIATILIS": 119,
  "ASTERIAS RUBENS": 119,
  "AURUM METALLICUM": 121,
  "AURUM MURIATICUM": 124,
  "AVENA SATIVA": 125,
  "BACILLINUM": 127,
  "BADIAGA": 128,
  "BALSAMUM PERUVIANUM": 129,
  "BAPTISIA TINCTORIA": 130,
  "BARYTA CARBONICA": 133,
  "BARYTA MURIATICA": 134,
  "BELLADONNA": 136,
  "BELLIS PERENNIS": 143,
  "BENZOICUM ACIDUM": 146,
  "BERBERIS VULGARIS": 148,
  "BISMUTHUM": 152,
  "BLATTA ORIENTALIS": 153,
  "BORAX": 155,
  "BOTHROPS": 157,
  "BOVISTA": 158,
  "BROMIUM": 161,
  "BRYONIA": 163,
  "BUFO": 166,
  "BUTYRICUM ACIDUM": 168,
  "CACTUS GRANDIFLORUS": 168,
  "CADMIUM": 171,
  "CALADIUM": 174,
  "CALCAREA CARBONICA": 174,
  "CALCAREA FLUORICA": 183,
  "CALCAREA IODATA": 185,
  "CALCAREA PHOSPHORICA": 186,
  "CALCAREA SULPHURICA": 189,
  "CALENDULA": 191,
  "CAMPHORA": 193,
  "CANNABIS INDICA": 196,
  "CANNABIS SATIVA": 199,
  "CANTHARIS": 200,
  "CAPSICUM": 203,
  "CARBO ANIMALIS": 205,
  "CARBO VEGETABILIS": 207,
  "CARBOLICUM ACIDUM": 211,
  "CARDUUS MARIANUS": 215,
  "CASCARA SAGRADA": 217,
  "CAULOPHYLLUM": 220,
  "CAUSTICUM": 221,
  "CEANOTHUS": 224,
  "CEDRON": 225,
  "CHAMOMILLA": 228,
  "CHELIDONIUM": 230,
  "CHENOPODIUM": 233,
  "CHIMAPHILA UMBELLATA": 234,
  "CHINA": 251,
  "CHININUM ARSENICOSUM": 236,
  "CHININUM SULPHURICUM": 237,
  "CHIONANTHUS": 238,
  "CHLORALUM": 239,
  "CHLOROFORMUM": 241,
  "CHROMICUM ACIDUM": 243,
  "CICUTA VIROSA": 244,
  "CIMEX": 246,
  "CIMICIFUGA": 247,
  "CINA": 249,
  "CINNABARIS": 255,
  "CINNAMOMUM": 256,
  "CISTUS": 257,
  "CLEMATIS ERECTA": 259,
  "COBALTUM": 260,
  "COCA": 261,
  "COCCULUS": 264,
  "COCCUS CACTI": 267,
  "COFFEA CRUDA": 269,
  "COLCHICUM": 271,
  "COLLINSONIA": 273,
  "COLOCYNTHIS": 275,
  "CONIUM": 278,
  "CONVALLARIA": 282,
  "COPAIVA": 283,
  "CORALLIUM RUBRUM": 285,
  "CORNUS": 286,
  "COTYLEDON": 287,
  "CRATAEGUS": 288,
  "CROCUS SATIVUS": 289,
  "CROTALUS HORRIDUS": 291,
  "CROTON TIGLIUM": 294,
  "CUBEBA": 295,
  "CUPRUM METALLICUM": 298,
  "CURARE": 301,
  "CYCLAMEN": 302,
  "CYPRIPEDIUM": 304,
  "DIGITALIS": 305,
  "DIOSCOREA": 308,
  "DROSERA": 313,
  "DULCAMARA": 315,
  "ECHINACEA": 318,
  "ELAPS CORALLINUS": 319,
  "EUPATORIUM PERFOLIATUM": 330,
  "EUPHRASIA": 336,
  "FERRUM METALLICUM": 341,
  "FLUORICUM ACIDUM": 348,
  "GELSEMIUM": 358,
  "GLONOINUM": 364,
  "GRAPHITES": 369,
  "GUAIACUM": 376,
  "HAMAMELIS": 378,
  "HELLEBORUS NIGER": 381,
  "HELONIAS": 385,
  "HEPAR SULPHURIS": 386,
  "HYDRASTIS": 392,
  "HYOSCYAMUS": 398,
  "HYPERICUM": 401,
  "IGNATIA": 404,
  "IODUM": 412,
  "IPECACUANHA": 415,
  "IRIS VERSICOLOR": 419,
  "KALI BICHROMICUM": 427,
  "KALI CARBONICUM": 432,
  "KALI IODATUM": 438,
  "KALI MURIATICUM": 440,
  "KALI PHOSPHORICUM": 444,
  "KALI SULPHURICUM": 447,
  "KALMIA": 448,
  "KREOSOTUM": 450,
  "LAC CANINUM": 453,
  "LACHESIS": 449,
  "LEDUM": 467,
  "LILIUM TIGRINUM": 470,
  "LYCOPODIUM": 478,
  "MAGNESIA CARBONICA": 486,
  "MAGNESIA MURIATICA": 488,
  "MAGNESIA PHOSPHORICA": 490,
  "MEDORRHINUM": 496,
  "MERCURIUS SOLUBILIS": 504,
  "MEZEREUM": 515,
  "MILLEFOLIUM": 518,
  "MOSCHUS": 522,
  "MURIATICUM ACIDUM": 524,
  "NAJA": 529,
  "NATRUM CARBONICUM": 533,
  "NATRUM MURIATICUM": 536,
  "NATRUM PHOSPHORICUM": 540,
  "NATRUM SULPHURICUM": 543,
  "NITRICUM ACIDUM": 548,
  "NUX MOSCHATA": 553,
  "NUX VOMICA": 549,
  "OPIUM": 568,
  "PETROLEUM": 586,
  "PHOSPHORICUM ACIDUM": 590,
  "PHOSPHORUS": 593,
  "PHYTOLACCA": 601,
  "PICRICUM ACIDUM": 604,
  "PLATINA": 610,
  "PLUMBUM METALLICUM": 613,
  "PODOPHYLLUM": 615,
  "PSORINUM": 623,
  "PULSATILLA": 622,
  "PYROGENIUM": 632,
  "RADIUM": 636,
  "RANUNCULUS BULBOSUS": 638,
  "RHEUM": 644,
  "RHODODENDRON": 645,
  "RHUS TOXICODENDRON": 648,
  "RUMEX CRISPUS": 655,
  "RUTA": 656,
  "SABAL SERRULATA": 659,
  "SABINA": 660,
  "SANGUINARIA": 667,
  "SANICULA": 672,
  "SARSAPARILLA": 675,
  "SECALE CORNUTUM": 678,
  "SELENIUM": 681,
  "SEPIA": 687,
  "SILICEA": 692,
  "SPIGELIA": 714,
  "SPONGIA": 717,
  "STANNUM": 722,
  "STAPHYSAGRIA": 724,
  "STRAMONIUM": 728,
  "SULPHUR": 719,
  "SULPHURICUM ACIDUM": 741,
  "SYPHILINUM": 745,
  "TABACUM": 747,
  "TARENTULA": 752,
  "TELLURIUM": 755,
  "THUJA": 746,
  "TUBERCULINUM": 764,
  "URANIUM NITRICUM": 770,
  "URTICA URENS": 771,
  "VALERIANA": 775,
  "VERATRUM ALBUM": 778,
  "VERATRUM VIRIDE": 780,
  "VIBURNUM": 784,
  "VIOLA ODORATA": 786,
  "ZINCUM METALLICUM": 791,
  "ÆSCULUS GLABRA": 31,
  "ÆSCULUS HIPPOCASTANUM": 28,
  "ÆTHIOPS ANTIMONIALIS": 31,
  "ÆTHIOPS MERCURIALIS": 31,
  "ÆTHUSA CYNAPIUM": 31
};

export default function ReferenceLibrary({ lang = 'en' }) {
  const [repertories, setRepertories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRep, setSelectedRep] = useState(null);
  
  // PDF state
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  
  // Chapters & Mapping
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [pageMappings, setPageMappings] = useState({});
  const [isEditingMappings, setIsEditingMappings] = useState(false);
  const [savingMappings, setSavingMappings] = useState(false);

  // View state
  const [selectedChapter, setSelectedChapter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [manualPageInput, setManualPageInput] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Page offset for PDFs where internal numbering differs from physical pages
  const [pageOffset, setPageOffset] = useState(0);

  // Create Reference Book Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRepName, setNewRepName] = useState('');
  const [newRepDesc, setNewRepDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Add medicine name state
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newMedicinePage, setNewMedicinePage] = useState('');
  const [mobileViewerTab, setMobileViewerTab] = useState('list');

  // A-Z letter filter for My Library
  const [selectedLetter, setSelectedLetter] = useState('ALL');

  const t = (en, hi) => lang === 'en' ? en : hi;

  // Load repertories on mount
  useEffect(() => {
    fetchRepertories();
  }, []);

  const fetchRepertories = async () => {
    try {
      setLoading(true);
      const data = await getRepertories({ type: 'Reference' });
      const filtered = (data || []).filter(r => r.type === 'Reference' || r.name.toLowerCase().includes('materia medica') || r.name.toLowerCase().includes('reference'));
      setRepertories(filtered);
    } catch (err) {
      setError(t('Failed to load repertories.', 'रेपरटॉरी लोड करने में विफल।'));
    } finally {
      setLoading(false);
    }
  };

  // Load chapters when repertory is selected
  useEffect(() => {
    if (selectedRep) {
      // Load page offset if available
      setPageOffset(selectedRep.pageOffset || 0);
      
      // For Reference books (Materia Medica), use chapterPages as the source of medicine names
      // For Repertories, fetch chapters from rubrics
      if (selectedRep.type === 'Reference' || selectedRep.name.toLowerCase().includes('materia medica')) {
        // Load medicine names from saved mappings
        let initialMap = {};
        if (selectedRep.chapterPages) {
          const srcMap = selectedRep.chapterPages instanceof Map 
            ? Object.fromEntries(selectedRep.chapterPages) 
            : selectedRep.chapterPages;
          
          // Filter out repertory chapters, keep only medicine names
          const repertoryChapters = new Set([
            'MATERIA MEDICA', 'REPERTORY', 'MIND', 'HEAD', 'EYES', 'EARS', 
            'NOSE', 'FACE', 'MOUTH', 'THROAT', 'STOMACH', 'ABDOMEN', 'RECTUM',
            'URINARY ORGANS', 'MALE SEXUAL ORGANS', 'FEMALE SEXUAL ORGANS',
            'RESPIRATORY ORGANS', 'CIRCULATORY ORGANS', 'BACK', 'EXTREMITIES',
            'SLEEP', 'FEVER', 'SKIN', 'GENERALITIES', 'MODALITIES'
          ]);
          
          Object.keys(srcMap).forEach(key => {
            const upperKey = key.toUpperCase();
            if (!repertoryChapters.has(upperKey)) {
              initialMap[upperKey] = srcMap[key];
            }
          });
        }

        // If no saved mappings exist, populate default Materia Medica index so medicines are shown instantly!
        if (Object.keys(initialMap).length === 0) {
          initialMap = { ...DEFAULT_MATERIA_MEDICA_INDEX };
        }

        setPageMappings(initialMap);
        setChapters(Object.keys(initialMap).sort());
      } else {
        // For Repertories, fetch chapters from rubrics as before
        fetchChapters(selectedRep._id);
        
        const initialMap = {};
        if (selectedRep.chapterPages) {
          const srcMap = selectedRep.chapterPages instanceof Map 
            ? Object.fromEntries(selectedRep.chapterPages) 
            : selectedRep.chapterPages;
          
          Object.keys(srcMap).forEach(key => {
            initialMap[key.toUpperCase()] = srcMap[key];
          });
        }
        setPageMappings(initialMap);
      }
      
      setIsEditingMappings(false);
      setSelectedChapter('');
      setCurrentPage(1);
      setManualPageInput('1');
    }
  }, [selectedRep]);

  const fetchChapters = async (repertoryId) => {
    try {
      setChaptersLoading(true);
      const data = await getChapters(repertoryId);
      setChapters(data || []);
    } catch (err) {
      console.error('Error loading chapters', err);
    } finally {
      setChaptersLoading(false);
    }
  };

  // PDF upload handler with progress tracking
  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile || !selectedRep) return;

    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);
      
      // Listen for progress events
      const handleProgress = (event) => {
        setUploadProgress(event.detail);
      };
      window.addEventListener('uploadProgress', handleProgress);
      
      const res = await uploadRepertoryPDF(selectedRep._id, pdfFile);
      setUploadProgress(100);
      
      // Clean up event listener
      window.removeEventListener('uploadProgress', handleProgress);
      
      // Update local state with new PDF data (now using Cloudinary URLs)
      setSelectedRep(prev => ({
        ...prev,
        cloudinaryPdfUrl: res.data.pdfUrl,
        pdfUrl: res.data.pdfUrl, // Use Cloudinary URL
        pdfName: res.data.pdfName,
        chapterPages: res.data.chapterPages
      }));

      // Refresh list
      fetchRepertories();
      
      // Clear file input
      setPdfFile(null);
    } catch (err) {
      setError(err?.response?.data?.message || t('PDF Upload failed. Please make sure file is less than 100MB.', 'पीडीएफ अपलोड विफल रहा। कृपया सुनिश्चित करें कि फ़ाइल 100MB से कम है।'));
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after 1 second
    }
  };

  // Save mappings
  const handleSaveMappings = async () => {
    if (!selectedRep) return;
    try {
      setSavingMappings(true);
      setError('');
      
      const cleaned = {};
      Object.keys(pageMappings).forEach(key => {
        const val = parseInt(pageMappings[key]);
        if (!isNaN(val)) cleaned[key.toUpperCase()] = val;
      });

      const res = await updateChapterPages(selectedRep._id, cleaned, pageOffset);
      
      setSelectedRep(prev => ({
        ...prev,
        chapterPages: res.data.chapterPages,
        pageOffset: res.data.pageOffset || 0
      }));

      // Update chapters list for Reference type
      if (selectedRep.type === 'Reference' || selectedRep.name.toLowerCase().includes('materia medica')) {
        setChapters(Object.keys(cleaned).map(k => k.toUpperCase()).sort());
      }

      setIsEditingMappings(false);
      
      // Refresh list
      fetchRepertories();
    } catch (err) {
      setError(t('Failed to save chapter mappings.', 'अध्याय मैपिंग सहेजने में विफल।'));
    } finally {
      setSavingMappings(false);
    }
  };

  const handleLoadMasterIndex = async () => {
    if (!selectedRep) return;
    try {
      setSavingMappings(true);
      setError('');
      
      const autoOffset = 11;
      const physicalMap = { ...DEFAULT_MATERIA_MEDICA_INDEX };

      const mergedMap = {
        ...physicalMap,
        ...pageMappings
      };

      const res = await updateChapterPages(selectedRep._id, mergedMap, autoOffset);
      
      setSelectedRep(prev => ({
        ...prev,
        chapterPages: res.data.chapterPages,
        pageOffset: res.data.pageOffset || autoOffset
      }));

      setPageMappings(mergedMap);
      setChapters(Object.keys(mergedMap).sort());
      setPageOffset(autoOffset);
      fetchRepertories();
    } catch (err) {
      console.error(err);
      setError(t('Failed to load Master Medicine Index.', 'मास्टर दवा सूचकांक लोड करने में विफल।'));
    } finally {
      setSavingMappings(false);
    }
  };

  const handleOffsetChange = async (newOffset) => {
    const val = parseInt(newOffset) || 0;
    setPageOffset(val);
    if (selectedRep) {
      try {
        const cleaned = {};
        Object.keys(pageMappings).forEach(key => {
          const v = parseInt(pageMappings[key]);
          if (!isNaN(v)) cleaned[key.toUpperCase()] = v;
        });
        const res = await updateChapterPages(selectedRep._id, cleaned, val);
        setSelectedRep(prev => ({
          ...prev,
          chapterPages: res.data.chapterPages,
          pageOffset: res.data.pageOffset || val
        }));
      } catch (err) {
        console.error('Error saving page offset', err);
      }
    }
  };

  const handleAiScanPdf = async () => {
    if (!selectedRep?._id) return;
    try {
      setSavingMappings(true);
      setError('');
      const res = await scanMedicinePages(selectedRep._id);
      if (res.data?.chapterPages) {
        const pages = res.data.chapterPages instanceof Map
          ? Object.fromEntries(res.data.chapterPages)
          : res.data.chapterPages;
        setPageMappings(pages);
        setChapters(Object.keys(pages).sort());
        setSelectedRep(prev => ({ ...prev, chapterPages: pages }));
        setPageOffset(res.data.pageOffset || 0);

        if (res.isFallback) {
          setError(t(
            "ℹ️ PDF is a scanned image book (no selectable digital text). Master Remedies Index (~250+ medicines) loaded! Adjust PDF Offset to sync physical page numbers.",
            "ℹ️ PDF एक स्कैन की गई इमेज बुक है। मास्टर दवा सूचकांक (~250+ दवाएं) लोड किया गया! सही पेज नंबर सिंक करने के लिए PDF ऑफ़सेट एडजस्ट करें।"
          ));
        }
      }
    } catch (err) {
      console.error('AI scan failed:', err);
      // Even if call fails, populate default Materia Medica index as resilient fallback
      setPageMappings(DEFAULT_MATERIA_MEDICA_INDEX);
      setChapters(Object.keys(DEFAULT_MATERIA_MEDICA_INDEX).sort());
      setError(t(
        "Loaded Master Remedies Index (~250+ medicines). Adjust PDF Offset to match your book's page numbers.",
        "मास्टर दवा सूचकांक (~250+ दवाएं) लोड किया गया। अपनी पुस्तक के पेज नंबरों से मेल खाने के लिए PDF ऑफ़सेट एडजस्ट करें।"
      ));
    } finally {
      setSavingMappings(false);
    }
  };

  const handleAddMedicine = () => {
    if (!newMedicineName.trim() || !newMedicinePage) return;
    
    const medicineName = newMedicineName.trim().toUpperCase();
    const pageNum = parseInt(newMedicinePage);
    
    if (isNaN(pageNum)) return;
    
    // Add to mappings
    setPageMappings(prev => ({
      ...prev,
      [medicineName]: pageNum
    }));
    
    // Add to chapters list if not already there
    if (!chapters.includes(medicineName)) {
      setChapters(prev => [...prev, medicineName].sort());
    }
    
    // Clear form
    setNewMedicineName('');
    setNewMedicinePage('');
  };

  const handlePinMedicinePage = async (medicineName, pageNum) => {
    if (!selectedRep || !medicineName || !pageNum) return;
    try {
      const updatedMap = {
        ...pageMappings,
        [medicineName.toUpperCase()]: parseInt(pageNum)
      };
      setPageMappings(updatedMap);
      
      const res = await updateChapterPages(selectedRep._id, updatedMap, pageOffset);
      setSelectedRep(prev => ({
        ...prev,
        chapterPages: res.data.chapterPages
      }));
    } catch (err) {
      console.error('Error pinning medicine page:', err);
    }
  };

  const handleCreateRepertory = async (e) => {
    e.preventDefault();
    if (!newRepName.trim()) return;

    try {
      setCreating(true);
      setError('');
      
      const data = await createRepertory({
        name: newRepName,
        description: newRepDesc,
        type: 'Reference'
      });

      // Refresh repertories list
      await fetchRepertories();

      // Automatically select the newly created book so they can upload the PDF immediately
      setSelectedRep(data);
      setIsAddingNew(false);
      setNewRepName('');
      setNewRepDesc('');
    } catch (err) {
      console.error(err);
      setError(t('Failed to create reference book.', 'संदर्भ पुस्तक बनाने में विफल।'));
    } finally {
      setCreating(false);
    }
  };

  const handleChapterClick = (ch) => {
    setSelectedChapter(ch);
    const page = pageMappings[ch.toUpperCase()] || 1;
    setCurrentPage(page);
    setManualPageInput(page.toString());
    setMobileViewerTab('pdf');
  };

  const handlePageChange = (p) => {
    const val = parseInt(p);
    if (!isNaN(val) && val > 0) {
      setCurrentPage(val);
      setManualPageInput(val.toString());
    }
  };

  const getPdfIframeUrl = (pdfUrl) => {
    if (!pdfUrl || !selectedRep) return '';
    
    // currentPage stores physical PDF page number directly
    const physicalPage = currentPage;
    
    // For Google Drive URLs, use Google Drive's embedded viewer
    if (pdfUrl.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null;
      
      // Format: https://drive.google.com/uc?export=download&id=FILE_ID
      const ucMatch = pdfUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (ucMatch) {
        fileId = ucMatch[1];
      }
      
      // Format: https://drive.google.com/file/d/FILE_ID/...
      const fileMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch) {
        fileId = fileMatch[1];
      }
      
      if (fileId) {
        // Use Google Drive's embedded viewer with page parameter
        // This viewer supports page navigation via #page=X in the embedded URL
        return `https://drive.google.com/file/d/${fileId}/preview#page=${physicalPage}`;
      }
    }
    
    // For Cloudinary or other direct PDF URLs
    if (pdfUrl.startsWith('http')) {
      const params = `#page=${physicalPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
      return `${pdfUrl}${params}`;
    }
    
    // Local server storage: stream via authenticated endpoint
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'https://homeoai-backend-83yt.onrender.com';
    const token = localStorage.getItem('homeo_auth_token');
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
    const params = `#page=${physicalPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
    
    return `${backendUrl}/api/repertories/${selectedRep._id}/view-pdf${tokenParam}${params}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-[#062E6F] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">
          {t('Loading Reference Library...', 'संदर्भ लाइब्रेरी लोड हो रही है...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#062E6F]" />
            {t("Reference Library & Materia Medica", "संदर्भ लाइब्रेरी और मटेरिया मेडिका")}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t("Upload pocket manuals, map chapters, and view reference materials side-by-side.", "पॉकेट मैनुअल अपलोड करें, अध्याय मैप करें और संदर्भ सामग्री साथ-साथ देखें।")}
          </p>
        </div>
      </div>

      {/* ── MY LIBRARY ── */}
      <div className="space-y-4">
          {selectedRep && (
            <button
              onClick={() => setSelectedRep(null)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold shadow-sm transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('Back to Repertories', 'रेपरटॉरी सूची')}
            </button>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Repertory Selector Dropdown & Actions */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
              {repertories.filter(r => !!r.pdfUrl).length > 0 ? (
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t('Select Reference Pocket Manual (PDF Verified)', 'संदर्भ पॉकेट मैनुअल चुनें (पीडीएफ सत्यापित)')}
                  </label>
                  <select
                    value={selectedRep ? selectedRep._id : ''}
                    onChange={(e) => {
                      const id = e.target.value;
                      const found = repertories.find(r => r._id === id);
                      setSelectedRep(found || null);
                      setIsAddingNew(false);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
                  >
                    <option value="">-- {t('Choose Reference Manual', 'संदर्भ मैनुअल चुनें')} --</option>
                    {repertories.filter(r => !!r.pdfUrl).map(rep => (
                      <option key={rep._id} value={rep._id}>
                        {lang === 'en' ? rep.name : rep.nameHi || rep.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-start text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 mr-2 shrink-0 animate-pulse text-amber-500" />
                  <span>{t('No reference manuals with uploaded PDFs exist yet.', 'अपलोड किए गए पीडीएफ के साथ कोई संदर्भ मैनुअल अभी तक मौजूद नहीं है।')}</span>
                </div>
              )}
              
              <div className="flex gap-2 shrink-0 pt-1">
                <button
                  onClick={() => {
                    setIsAddingNew(!isAddingNew);
                    if (!isAddingNew) setSelectedRep(null); // Deselect active rep when creating new
                  }}
                  className={`flex items-center justify-center gap-1.5 text-xs px-4 py-2 rounded-lg font-bold transition-all border ${
                    isAddingNew 
                      ? 'bg-slate-700 text-white border-slate-700 hover:bg-slate-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <span>{isAddingNew ? t('Cancel', 'रद्द करें') : t('➕ Add Reference Manual', '➕ संदर्भ मैनुअल जोड़ें')}</span>
                </button>

                {selectedRep && selectedRep.pdfUrl && (
                  <>
                    <button
                      onClick={() => setIsEditingMappings(!isEditingMappings)}
                      className={`flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg font-bold transition-all border ${
                        isEditingMappings 
                          ? 'bg-[#062E6F] text-white border-[#062E6F] hover:bg-[#042050]' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      {isEditingMappings ? t('Exit Mappings', 'मैपिंग बंद करें') : t('Map Chapters', 'अध्याय मैपिंग करें')}
                    </button>

                    <label className="flex items-center justify-center gap-1.5 text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg font-bold shadow-sm transition-colors cursor-pointer">
                      <RefreshCw className="h-3.5 w-3.5" />
                      {t('Replace PDF', 'पीडीएफ बदलें')}
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setPdfFile(e.target.files[0]);
                            const form = document.getElementById('pdf-upload-form');
                            if (form) setTimeout(() => form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* INLINE FORM: Add New Repertory */}
            {isAddingNew && (
              <form onSubmit={handleCreateRepertory} className="surface p-5 space-y-4 border border-slate-200/80 rounded-xl max-w-xl animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#062E6F]" />
                  {t('Create New Reference Manual', 'नया संदर्भ मैनुअल बनाएं')}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      {t('Manual/Repertory Name *', 'मैनुअल/रेपरटॉरी का नाम *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Boericke's Pocket Manual"
                      value={newRepName}
                      onChange={(e) => setNewRepName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      {t('Description (Optional)', 'विवरण (वैकल्पिक)')}
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Provide a short description of the reference manual..."
                      value={newRepDesc}
                      onChange={(e) => setNewRepDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {t('Create Reference Book', 'संदर्भ पुस्तक बनाएं')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                  >
                    {t('Cancel', 'रद्द करें')}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* STEP 2: Selected Repertory Workspace or Placeholder */}
          {!selectedRep ? (
            <div className="surface p-12 text-center border border-slate-100/80 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#062E6F]/5 flex items-center justify-center text-[#062E6F] mb-2">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {t('No Reference Selected', 'कोई संदर्भ चयनित नहीं है')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                {t('Please select a reference manual from the dropdown menu above, or click "Add Reference Manual" to create a new book and upload its PDF.', 'कृपया ऊपर ड्रॉपडाउन मेनू से एक संदर्भ मैनुअल चुनें, या नई पुस्तक बनाने और उसका पीडीएफ अपलोड करने के लिए "संदर्भ मैनुअल जोड़ें" पर क्लिक करें।')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Repertory info summary card */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {lang === 'en' ? selectedRep.name : selectedRep.nameHi || selectedRep.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {selectedRep.pdfUrl 
                      ? `${t('Linked Manual:', 'संबद्ध मैनुअल:')} ${selectedRep.pdfName}`
                      : t('No PDF manual attached to this repertory. Please upload a PDF below.', 'इस रेपरटॉरी के साथ कोई पीडीएफ संलग्न नहीं है। कृपया नीचे अपलोड करें।')}
                  </p>
                  {selectedRep.pdfUrl && selectedRep.pdfUrl.startsWith('/uploads/') && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 max-w-2xl">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-bold mb-0.5">
                          {t('Local Server Storage Active', 'स्थानीय सर्वर संग्रहण सक्रिय')}
                        </p>
                        <p>
                          {t(
                            'This manual is stored on the server\'s local disk (bypassed Cloudinary 10MB limit). Note: On ephemeral environments like Render free tier, this file is temporary and will need to be re-uploaded if the server restarts.',
                            'यह मैनुअल सर्वर के स्थानीय डिस्क पर संग्रहीत है (Cloudinary 10MB सीमा से बाहर)। नोट: Render फ्री टियर पर यह फ़ाइल अस्थायी है।'
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form to submit PDF if not uploaded */}
              {(!selectedRep.pdfUrl || pdfFile) && (
                <form id="pdf-upload-form" onSubmit={handlePdfUpload} className="surface p-6 max-w-xl mx-auto space-y-4 border-2 border-dashed border-slate-200 hover:border-[#062E6F]/50 rounded-xl transition-all">
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                    <h4 className="font-bold text-slate-700 text-sm">
                      {pdfFile ? pdfFile.name : t('Upload Materia Medica / Repertory PDF', 'मटेरिया मेडिका / रेपरटॉरी पीडीएफ अपलोड करें')}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                      {t('Drag & drop or click to browse. Max file size: 100MB. Required for side-by-side reading.', 'खींचें और छोड़ें या ब्राउज़ करें। अधिकतम फ़ाइल आकार: 100MB।')}
                    </p>
                    
                    {!pdfFile ? (
                      <label className="mt-4 px-4 py-2 bg-[#062E6F] text-white hover:bg-[#042050] text-xs font-bold rounded-lg cursor-pointer shadow-sm transition-colors">
                        {t('Select PDF File', 'पीडीएफ फाइल चुनें')}
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={(e) => setPdfFile(e.target.files?.[0] || null)} 
                          className="hidden" 
                        />
                      </label>
                    ) : (
                      <div className="flex items-center gap-2 mt-4">
                        <button 
                          type="submit" 
                          disabled={uploading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              {t('Uploading...', 'अपलोड हो रहा है...')}
                            </>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              {t('Upload File', 'अपलोड करें')}
                            </>
                          )}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setPdfFile(null)} 
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                        >
                          {t('Cancel', 'रद्द करें')}
                        </button>
                      </div>
                    )}

                    {uploading && (
                      <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#062E6F] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* Side-by-Side Reference Viewer & Mappings */}
              {selectedRep.pdfUrl && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 lg:min-h-[600px]">

                  {/* Mobile tab toggle */}
                  <div className="lg:hidden col-span-full flex rounded-lg border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileViewerTab('list')}
                      className={`flex-1 py-2.5 text-xs font-semibold min-h-[44px] transition-colors ${
                        mobileViewerTab === 'list' ? 'bg-[#062E6F] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t('Medicine List', 'दवा सूची')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileViewerTab('pdf')}
                      className={`flex-1 py-2.5 text-xs font-semibold min-h-[44px] transition-colors ${
                        mobileViewerTab === 'pdf' ? 'bg-[#062E6F] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t('PDF View', 'PDF दृश्य')}
                    </button>
                  </div>
                  
                  {/* Left Column: Chapters & Mappings */}
                  <div className={`lg:col-span-4 surface flex flex-col overflow-hidden max-h-[50vh] lg:max-h-[700px] ${mobileViewerTab === 'pdf' ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-[#062E6F]" />
                        {isEditingMappings 
                          ? t('Define Page Numbers', 'पेज नंबर निर्दिष्ट करें') 
                          : t('Medicine Names', 'दवाओं के नाम')}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!isEditingMappings && (
                          <>
                            <button
                              onClick={handleAiScanPdf}
                              disabled={savingMappings}
                              title={t('Scan this PDF page-by-page and auto-detect medicine names + correct page numbers', 'इस PDF को स्कैन करें और दवाओं के नाम + सही पेज नंबर स्वतः पहचानें')}
                              className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded border border-emerald-200 transition-colors"
                            >
                              {savingMappings ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>🔍 {t('Scan PDF', 'PDF स्कैन')}</span>}
                            </button>
                            <button
                              onClick={handleLoadMasterIndex}
                              disabled={savingMappings}
                              title={t('Load standard Materia Medica remedy list (fallback if scan fails)', 'मानक दवा सूची लोड करें (स्कैन विफल होने पर)')}
                              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-[#062E6F] text-[10px] font-bold px-2 py-1 rounded border border-blue-200 transition-colors"
                            >
                              {savingMappings ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>⚡ {t('Default Index', 'डिफॉल्ट')}</span>}
                            </button>
                          </>
                        )}
                        {isEditingMappings && (
                          <button
                            onClick={handleSaveMappings}
                            disabled={savingMappings}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow transition-colors"
                          >
                            {savingMappings ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            {t('Save Mappings', 'मैपिंग सहेजें')}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Page Offset Control (Edit Mode) */}
                    {isEditingMappings && (
                      <div className="p-3 border-b border-slate-100 bg-blue-50/30">
                        <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">
                          {t('Page Offset', 'पेज ऑफसेट')}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={pageOffset}
                            onChange={(e) => setPageOffset(parseInt(e.target.value) || 0)}
                            className="w-20 border border-blue-200 rounded px-2 py-1 text-xs font-mono focus:ring-1 focus:ring-blue-300 outline-none"
                            placeholder="0"
                          />
                          <p className="text-[10px] text-blue-600 flex-1">
                            {t('If PDF page numbers differ from list (e.g., list shows 12, PDF shows 1, set offset to 11)', 'यदि PDF पृष्ठ संख्याएं सूची से भिन्न हैं (उदा. सूची 12 दिखाती है, PDF 1 दिखाता है, ऑफसेट 11 सेट करें)')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Search / Filter */}
                    {chapters.length > 0 && !isEditingMappings && (
                      <>
                        <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                          <input
                            type="text"
                            placeholder={t('Search medicines...', 'दवाएं खोजें...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-all font-semibold"
                          />
                        </div>

                        {/* A-Z Horizontal Cubical Letter Filter Bar */}
                        <div className="px-2 py-2.5 border-b border-slate-100 bg-slate-50/30">
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            {ALPHABET.map((letter) => {
                              const isActive = selectedLetter === letter;
                              const count = letter === 'ALL'
                                ? chapters.length
                                : chapters.filter(ch => ch.toUpperCase().startsWith(letter)).length;

                              return (
                                <button
                                  key={letter}
                                  onClick={() => setSelectedLetter(letter)}
                                  className={`flex items-center justify-center min-w-[28px] h-7 px-2 text-[11px] font-bold rounded-lg border transition-all shrink-0 select-none ${
                                    isActive
                                      ? 'bg-gradient-to-b from-[#062E6F] to-[#041E48] text-white border-[#062E6F] shadow-sm ring-2 ring-[#062E6F]/20 scale-105'
                                      : count > 0
                                        ? 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border-slate-200 hover:text-slate-900 shadow-xs'
                                        : 'bg-slate-50 text-slate-300 border-slate-100/60 cursor-default opacity-40'
                                  }`}
                                  title={`${letter === 'ALL' ? 'All Medicines' : `Letter ${letter}`}: ${count} medicines`}
                                  disabled={count === 0}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Add Medicine Form (Edit Mode) */}
                    {isEditingMappings && selectedRep.type === 'Reference' && (
                      <div className="p-3 border-b border-slate-100 bg-emerald-50/30 space-y-2">
                        <p className="text-[10px] text-emerald-700 font-semibold uppercase">{t('Add New Medicine', 'नई दवा जोड़ें')}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={t('Medicine name...', 'दवा का नाम...')}
                            value={newMedicineName}
                            onChange={(e) => setNewMedicineName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddMedicine()}
                            className="flex-1 bg-white border border-emerald-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                          <input
                            type="number"
                            placeholder="Page"
                            value={newMedicinePage}
                            onChange={(e) => setNewMedicinePage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddMedicine()}
                            className="w-16 bg-white border border-emerald-200 rounded px-2 py-1.5 text-xs text-center outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                          <button
                            onClick={handleAddMedicine}
                            className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {chaptersLoading ? (
                      <div className="flex-1 flex items-center justify-center p-8">
                        <Loader2 className="h-5 w-5 text-[#062E6F] animate-spin" />
                      </div>
                    ) : chapters.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <BookOpen className="h-8 w-8 text-slate-300" />
                        <p className="text-xs text-slate-500 max-w-xs">
                          {t('No medicines mapped yet. Scan the PDF to auto-detect medicine names and their exact page numbers.', 'अभी तक कोई दवा मैप नहीं। दवाओं के नाम और सही पेज नंबर स्वतः पहचानने के लिए PDF स्कैन करें।')}
                        </p>
                        <button
                          onClick={handleAiScanPdf}
                          disabled={savingMappings}
                          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-1.5"
                        >
                          {savingMappings
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('Scanning PDF...', 'PDF स्कैन हो रहा है...')}</>
                            : <span>🔍 {t('Scan PDF (Detect Real Page Numbers)', 'PDF स्कैन करें (सही पेज नंबर पहचानें)')}</span>
                          }
                        </button>
                        <button
                          onClick={handleLoadMasterIndex}
                          disabled={savingMappings}
                          className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 hover:bg-slate-50"
                        >
                          <span>⚡ {t('Load Default Index (Estimated Pages)', 'डिफॉल्ट सूचकांक लोड करें (अनुमानित पेज)')}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 max-h-[40vh] lg:max-h-[600px]">
                        {(chapters
                          .filter(ch => {
                            const matchesSearch = ch.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesLetter = selectedLetter === 'ALL' || ch.toUpperCase().startsWith(selectedLetter);
                            return matchesSearch && matchesLetter;
                          })).map((ch, idx) => {
                          const isActive = selectedChapter === ch;
                          const mappedPage = pageMappings[ch.toUpperCase()] || '';
                          
                          return (
                            <div 
                              key={idx}
                              className={`flex items-center justify-between p-3 text-xs font-semibold transition-all ${
                                isActive 
                                  ? 'bg-[#062E6F]/5 text-[#062E6F]' 
                                  : 'hover:bg-slate-50/50 text-slate-600'
                              }`}
                            >
                              {isEditingMappings ? (
                                <div className="flex items-center gap-2 w-full">
                                  <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="flex-1 truncate text-slate-700 font-medium">{ch}</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400">Pg:</span>
                                    <input
                                      type="number"
                                      min="1"
                                      value={mappedPage}
                                      onChange={(e) => setPageMappings(prev => ({
                                        ...prev,
                                        [ch]: e.target.value
                                      }))}
                                      placeholder="Page"
                                      className="w-16 border border-slate-200 rounded px-1.5 py-1 text-center font-mono text-xs focus:ring-1 focus:ring-[#062E6F]/30 focus:border-[#062E6F] outline-none"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleChapterClick(ch)}
                                  className="flex items-center justify-between w-full text-left"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                      isActive ? 'bg-[#062E6F] text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <span className="truncate">{ch}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                      mappedPage 
                                        ? (isActive ? 'bg-[#062E6F]/20 text-[#062E6F]' : 'bg-slate-100 text-slate-600') 
                                        : 'bg-red-50 text-red-600 border border-red-100'
                                    }`}>
                                      {mappedPage ? `Pg ${mappedPage}` : 'Unmapped'}
                                    </span>
                                    <ChevronRight className={`h-3.5 w-3.5 text-slate-300 transition-transform ${isActive ? 'rotate-90 text-[#062E6F]' : ''}`} />
                                  </div>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Column: PDF Viewport Frame */}
                  <div className={`lg:col-span-8 surface p-3 flex flex-col min-h-[500px] lg:min-h-[600px] h-[calc(100vh-220px)] lg:h-auto lg:max-h-[700px] ${mobileViewerTab === 'list' ? 'hidden lg:flex' : 'flex'}`}>
                    {/* PDF Header Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-700">{selectedRep.pdfName}</span>
                        {selectedChapter && (
                          <span className="text-[10px] bg-[#062E6F]/10 text-[#062E6F] px-2 py-0.5 rounded-full font-semibold">
                            {selectedChapter}
                          </span>
                        )}
                      </div>
                      
                      {/* Manual page navigator & PDF Offset controls */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        {/* Page Offset Quick Sync */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{t('PDF Offset:', 'ऑफ़सेट:')}</span>
                          <button
                            onClick={() => handleOffsetChange(pageOffset - 1)}
                            className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-600 font-bold text-xs"
                            title="Decrease Page Offset by 1"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={pageOffset}
                            onChange={(e) => handleOffsetChange(parseInt(e.target.value) || 0)}
                            className="w-10 text-center font-mono border border-slate-200 bg-white rounded py-0.5 text-xs outline-none focus:ring-1 focus:ring-[#062E6F]/30 font-bold text-[#062E6F]"
                          />
                          <button
                            onClick={() => handleOffsetChange(pageOffset + 1)}
                            className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-600 font-bold text-xs"
                            title="Increase Page Offset by 1"
                          >
                            +
                          </button>
                        </div>

                        {/* Page Navigator */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"
                          >
                            ← Prev
                          </button>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Pg</span>
                            <input 
                              type="text" 
                              value={manualPageInput}
                              onChange={(e) => setManualPageInput(e.target.value)}
                              onBlur={() => handlePageChange(manualPageInput)}
                              onKeyDown={(e) => e.key === 'Enter' && handlePageChange(manualPageInput)}
                              className="w-12 text-center font-mono border border-slate-200 rounded py-0.5 text-xs outline-none focus:ring-1 focus:ring-[#062E6F]/30"
                            />
                          </div>
                          <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600 transition-colors"
                          >
                            Next →
                          </button>
                        </div>

                        {/* Quick 1-Click Pin Medicine Page */}
                        {selectedChapter && (
                          <button
                            onClick={() => handlePinMedicinePage(selectedChapter, currentPage)}
                            className="px-2.5 py-1 bg-[#062E6F]/10 hover:bg-[#062E6F] text-[#062E6F] hover:text-white border border-[#062E6F]/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                            title={`Save ${selectedChapter} -> Page ${currentPage} directly to database`}
                          >
                            <span>📌 {t('Pin', 'पिन करें')} {selectedChapter} {t('to Pg', 'पेज')} {currentPage}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chapter Navigation Breadcrumb */}
                    {selectedChapter && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-3 flex items-center gap-2 text-xs">
                        <BookOpen className="h-3.5 w-3.5 text-[#062E6F]" />
                        <span className="text-slate-500">{t('Currently viewing:', 'वर्तमान में देख रहे हैं:')}</span>
                        <span className="font-semibold text-slate-700">{selectedChapter}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          {t('PDF Page:', 'PDF पृष्ठ:')} <strong className="text-slate-700">{currentPage}</strong>
                          {pageOffset > 0 && currentPage > pageOffset && (
                            <span className="text-[10px] text-slate-400 ml-2">
                              ({t('Book Page:', 'पुस्तक पृष्ठ:')} {currentPage - pageOffset})
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => setSelectedChapter('')}
                          className="ml-auto text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* The Embedded PDF iframe — toolbar hidden via CSS clip + URL params */}
                    <div className="flex-1 relative bg-slate-100 rounded-xl overflow-hidden shadow-inner">
                      {/* Google Drive specific warning */}
                      {selectedRep.pdfUrl && selectedRep.pdfUrl.includes('drive.google.com') && (
                        <div className="absolute top-2 left-2 right-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs p-2 rounded-lg z-10 flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold">Google Drive PDF Viewer</p>
                            <p className="text-[10px] mt-0.5">If PDF doesn't load, try refreshing the page or opening in a new tab.</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Outer clip: hides the ~40px PDF browser toolbar that bleeds in from the top */}
                      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '12px' }}>
                        <iframe 
                          key={`${selectedRep.pdfUrl}-${currentPage}-${selectedChapter}`}
                          src={getPdfIframeUrl(selectedRep.pdfUrl)}
                          style={{
                            width: '100%',
                            height: 'calc(100% + 42px)',   /* extra height to compensate for negative offset */
                            marginTop: '-42px',             /* push iframe up to clip the browser toolbar */
                            border: 'none',
                            background: 'white',
                            display: 'block',
                          }}
                          title={`${selectedRep.pdfName} - ${selectedChapter ? `Chapter: ${selectedChapter}` : `Page ${currentPage}`}`}
                          allow="autoplay"
                        />
                      </div>
                    </div>

                    {/* Page Index at bottom for quick chapter jumping */}
                    {Object.keys(pageMappings).length > 0 && (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                          <span className="text-[10px] text-slate-400 font-semibold mr-2 py-1">
                            {t('Quick Jump:', 'त्वरित जाएं:')}
                          </span>
                          {Object.entries(pageMappings).map(([chapter, page]) => (
                            <button
                              key={chapter}
                              onClick={() => {
                                setSelectedChapter(chapter.toLowerCase());
                                handlePageChange(page);
                              }}
                              className={`text-[9px] px-2 py-1 rounded font-semibold transition-colors ${
                                selectedChapter === chapter.toLowerCase()
                                  ? 'bg-[#062E6F] text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {chapter} (p{page})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
