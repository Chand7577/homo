import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, UploadCloud, Check, Loader2, ChevronRight, 
  Settings, AlertCircle, ArrowLeft, Pencil, FileText, 
  Save, Eye, RefreshCw, X, Plus, Search, ExternalLink
} from 'lucide-react';
import { getRepertories, createRepertory, getChapters, uploadRepertoryPDF, updateChapterPages } from '../services/api';

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

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
      if (selectedRep.type === 'Reference') {
        // Load medicine names from saved mappings
        const initialMap = {};
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
            // Only include if it's NOT a repertory chapter
            if (!repertoryChapters.has(upperKey)) {
              initialMap[upperKey] = srcMap[key];
            }
          });
        }
        setPageMappings(initialMap);
        // Set chapters to the list of medicine names only
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
      if (selectedRep.type === 'Reference') {
        setChapters(Object.keys(cleaned).map(k => k.toUpperCase()));
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
    
    // Add page offset to calculate the physical PDF page number
    const physicalPage = currentPage + (pageOffset || 0);
    
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
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-[#062E6F]" />
                        {isEditingMappings 
                          ? t('Define Page Numbers', 'पेज नंबर निर्दिष्ट करें') 
                          : t('Medicine Names', 'दवाओं के नाम')}
                      </h4>
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
                      <div className="flex-1 flex items-center justify-center p-8 text-center">
                        <p className="text-xs text-slate-400">
                          {t('No medicines found. Please map medicine names to page numbers using the "Map Chapters" button above.', 'कोई दवा नहीं मिली। कृपया ऊपर "अध्याय मैपिंग करें" बटन का उपयोग करके दवाओं के नाम पेज नंबर से मैप करें।')}
                        </p>
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
                      
                      {/* Manual page navigator controls */}
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <button 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"
                        >
                          ← Prev
                        </button>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Page</span>
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
                    </div>

                    {/* Chapter Navigation Breadcrumb */}
                    {selectedChapter && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-3 flex items-center gap-2 text-xs">
                        <BookOpen className="h-3.5 w-3.5 text-[#062E6F]" />
                        <span className="text-slate-500">{t('Currently viewing:', 'वर्तमान में देख रहे हैं:')}</span>
                        <span className="font-semibold text-slate-700">{selectedChapter}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          {t('Book Page:', 'पुस्तक पृष्ठ:')} <strong className="text-slate-700">{currentPage}</strong>
                          {pageOffset !== 0 && (
                            <span className="text-[10px] text-slate-400 ml-2">
                              ({t('PDF Page:', 'PDF पृष्ठ:')} {currentPage + (pageOffset || 0)})
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
