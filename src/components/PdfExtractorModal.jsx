import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, FileText, Download, X } from 'lucide-react';
import api from '../services/api'; // Use configured api instance with auth interceptors

const PdfExtractorModal = ({ isOpen, onClose, lang }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const t = {
    title: lang === 'en' ? 'Extract PDF to Excel' : 'पीडीएफ से एक्सेल निकालें',
    subtitle: lang === 'en' 
      ? 'Upload a Materia Medica or Repertory PDF to extract all content into a structured Excel file.'
      : 'मटेरिया मेडिका या रेपरटॉरी पीडीएफ अपलोड करें और सभी सामग्री को संरचित एक्सेल फ़ाइल में निकालें।',
    dragDrop: lang === 'en' ? 'Drag and drop your PDF here, or click to browse' : 'अपनी पीडीएफ यहां खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
    supportedFiles: lang === 'en' ? 'Supported: PDF files (Max 200MB)' : 'समर्थित: पीडीएफ फाइलें (अधिकतम 200MB)',
    uploading: lang === 'en' ? 'Extracting Content...' : 'सामग्री निकाली जा रही है...',
    success: lang === 'en' ? 'Extraction Complete!' : 'निष्कर्षण पूर्ण!',
    downloadExcel: lang === 'en' ? 'Download Excel File' : 'एक्सेल फ़ाइल डाउनलोड करें',
    extractedRows: lang === 'en' ? 'Total Entries' : 'कुल प्रविष्टियाँ',
    totalPages: lang === 'en' ? 'Pages Processed' : 'पृष्ठ संसाधित',
    preview: lang === 'en' ? 'Data Preview' : 'डेटा पूर्वावलोकन',
    extractAnother: lang === 'en' ? 'Extract Another PDF' : 'एक और पीडीएफ निकालें',
    step1: lang === 'en' ? 'Upload PDF' : 'पीडीएफ अपलोड',
    step2: lang === 'en' ? 'Text Extraction' : 'टेक्स्ट निष्कर्षण',
    step3: lang === 'en' ? 'AI Parsing' : 'एआई पार्सिंग',
    step4: lang === 'en' ? 'Excel Generation' : 'एक्सेल जनरेशन',
    close: lang === 'en' ? 'Close' : 'बंद करें',
    tips: lang === 'en' ? 'Tips for best results:' : 'सर्वोत्तम परिणामों के लिए सुझाव:',
    tip1: lang === 'en' ? 'Use text-based PDFs (not scanned images)' : 'टेक्स्ट-आधारित पीडीएफ का उपयोग करें',
    tip2: lang === 'en' ? 'Ensure PDF is not password-protected' : 'सुनिश्चित करें पीडीएफ पासवर्ड से सुरक्षित नहीं है',
    tip3: lang === 'en' ? 'Clear formatting works best' : 'स्पष्ट फॉर्मेटिंग सर्वोत्तम काम करती है'
  };

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 200 * 1024 * 1024) {
        setError(lang === 'en' ? 'File size exceeds 200MB limit.' : 'फ़ाइल का आकार 200MB की सीमा से अधिक है।');
        return;
      }
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError(lang === 'en' ? 'Only PDF files are supported.' : 'केवल पीडीएफ फाइलें समर्थित हैं।');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 200 * 1024 * 1024) {
        setError(lang === 'en' ? 'File size exceeds 200MB limit.' : 'फ़ाइल का आकार 200MB की सीमा से अधिक है।');
        return;
      }
      if (!droppedFile.name.toLowerCase().endsWith('.pdf')) {
        setError(lang === 'en' ? 'Only PDF files are supported.' : 'केवल पीडीएफ फाइलें समर्थित हैं।');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(10);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 3;
        });
      }, 2000);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await api.post('/materia-medica-extract/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000 // 5 minutes timeout for heavy PDF extraction & AI translation
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data.data);

    } catch (err) {
      console.error('Extraction Error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during extraction.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white md:rounded-2xl shadow-2xl max-w-5xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 md:p-6 flex items-center justify-between md:rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">{t.title}</h2>
            <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 mt-0.5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1.5">{t.tips}</p>
                <ul className="text-xs text-blue-700 space-y-1 list-none">
                  <li>✅ {t.tip1}</li>
                  <li>✅ {t.tip2}</li>
                  <li>✅ {t.tip3}</li>
                </ul>
              </div>
            </div>
          </div>

          {!result && (
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                file ? 'border-[#062E6F] bg-[#062E6F]/5' : 'border-slate-300 hover:border-[#062E6F] hover:bg-slate-50'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf"
              />
              
              {!file ? (
                <div className="space-y-4 cursor-pointer">
                  <div className="w-16 h-16 bg-blue-50 text-[#062E6F] rounded-full flex items-center justify-center mx-auto">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-700">{t.dragDrop}</p>
                    <p className="text-sm text-slate-400 mt-1">{t.supportedFiles}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4 text-[#062E6F]">
                    <FileText className="w-10 h-10" />
                    <div className="text-left">
                      <p className="font-semibold text-lg">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  
                  {!isUploading ? (
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); resetForm(); }}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                        className="px-6 py-2 bg-[#062E6F] text-white rounded-lg hover:bg-blue-800 font-medium shadow-md transition-all"
                      >
                        Start Extraction
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="flex justify-between text-sm font-medium text-slate-700">
                        <span>{t.uploading}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-[#062E6F] h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                      </div>
                      
                      {/* Process indicators */}
                      <div className="flex justify-between items-center text-xs font-medium text-slate-400 pt-4">
                        <div className={`flex flex-col items-center gap-1 ${progress >= 10 ? 'text-[#062E6F]' : ''}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 10 ? 'bg-blue-100' : 'bg-slate-100'}`}>1</div>
                          <span>{t.step1}</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200 mx-2"></div>
                        <div className={`flex flex-col items-center gap-1 ${progress >= 40 ? 'text-[#062E6F]' : ''}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 40 ? 'bg-blue-100' : 'bg-slate-100'}`}>2</div>
                          <span>{t.step2}</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200 mx-2"></div>
                        <div className={`flex flex-col items-center gap-1 ${progress >= 70 ? 'text-[#062E6F]' : ''}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 70 ? 'bg-blue-100' : 'bg-slate-100'}`}>3</div>
                          <span>{t.step3}</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200 mx-2"></div>
                        <div className={`flex flex-col items-center gap-1 ${progress >= 95 ? 'text-[#062E6F]' : ''}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${progress >= 95 ? 'bg-blue-100' : 'bg-slate-100'}`}>4</div>
                          <span>{t.step4}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Extraction Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">{t.success}</h3>
                  <div className="flex items-center justify-center gap-6 mt-3 text-green-700">
                    <div>
                      <p className="text-2xl font-bold">{result.totalEntries || result.parsedRows}</p>
                      <p className="text-xs">{t.extractedRows}</p>
                    </div>
                    {result.totalPages && (
                      <div>
                        <p className="text-2xl font-bold">{result.totalPages}</p>
                        <p className="text-xs">{t.totalPages}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 flex justify-center gap-4">
                  <button 
                    onClick={resetForm}
                    className="px-6 py-2.5 border border-slate-300 bg-white rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-all"
                  >
                    {t.extractAnother}
                  </button>
                  
                  <a 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // Open in Google Sheets viewer
                      const excelUrl = `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:4000'}${result.excelUrl}`;
                      // Create a temporary link to force download instead of opening a new tab
                      const link = document.createElement('a');
                      link.href = excelUrl;
                      link.setAttribute('download', 'Kent_Extraction.xlsx');
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadExcel}
                  </a>
                </div>
              </div>

              {result.previewData && result.previewData.length > 0 && (
                <div className="surface p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-[#062E6F]" />
                    {t.preview}
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-xs">
                          <th className="p-3 border-b">Chapter (EN)</th>
                          <th className="p-3 border-b">Chapter (HI)</th>
                          <th className="p-3 border-b">Rubric (EN)</th>
                          <th className="p-3 border-b">Medicine</th>
                          <th className="p-3 border-b">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.previewData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-medium text-slate-700">{row.chapter_en || '-'}</td>
                            <td className="p-3 text-slate-600">{row.chapter_hi || '-'}</td>
                            <td className="p-3 text-slate-600">{row.rubric_en || '-'}</td>
                            <td className="p-3">
                              <span className="font-bold text-[#062E6F]">{row.medicine || '-'}</span>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                row.grading === 3 ? 'bg-red-100 text-red-700' :
                                row.grading === 2 ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {row.grading || 1}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(result.totalEntries || result.parsedRows) > 10 && (
                    <p className="text-center text-sm text-slate-500 mt-4 italic">
                      ...and {(result.totalEntries || result.parsedRows) - 10} more entries in the Excel file.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfExtractorModal;
