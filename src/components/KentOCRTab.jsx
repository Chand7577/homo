import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, FileText, ChevronRight, ExternalLink, File } from 'lucide-react';
import api from '../services/api'; // Use configured api instance with auth interceptors

const KentOCRTab = ({ lang }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const extractionMode = 'pdf';
  
  const fileInputRef = useRef(null);

  const t = {
    title: lang === 'en' ? 'Kent Repertory Digitizer' : 'केंट रेपरटॉरी डिजिटाइज़र',
    subtitle: lang === 'en' 
      ? 'Extract structured rubrics and medicines from scanned pages or complete PDF books into Excel.'
      : 'स्कैन किए गए पृष्ठों या पूर्ण पीडीएफ पुस्तकों से संरचित रुब्रिक और दवाएं एक्सेल में निकालें।',
    dragDrop: lang === 'en' ? 'Drag and drop your file here, or click to browse' : 'अपनी फ़ाइल यहां खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
    supportedFiles: lang === 'en' ? 'Supported files: JPG, PNG (Max 10MB)' : 'समर्थित फ़ाइलें: JPG, PNG (अधिकतम 10MB)',
    supportedFilesPdf: lang === 'en' ? 'Supported files: PDF, JPG, PNG (Max 200MB)' : 'समर्थित फ़ाइलें: पीडीएफ, JPG, PNG (अधिकतम 200MB)',
    uploading: lang === 'en' ? 'Processing Document...' : 'दस्तावेज़ संसाधित हो रहा है...',
    uploadingPdf: lang === 'en' ? 'Extracting Content...' : 'सामग्री निकाली जा रही है...',
    success: lang === 'en' ? 'Processing Complete!' : 'प्रसंस्करण पूर्ण!',
    downloadExcel: lang === 'en' ? 'Open Excel File' : 'एक्सेल फ़ाइल खोलें',
    extractedRows: lang === 'en' ? 'Extracted Rows' : 'निकाली गई पंक्तियाँ',
    totalPages: lang === 'en' ? 'Pages Processed' : 'पृष्ठ संसाधित',
    preview: lang === 'en' ? 'Data Preview' : 'डेटा पूर्वावलोकन',
    uploadAnother: lang === 'en' ? 'Upload Another File' : 'एक और फ़ाइल अपलोड करें',
    step1: lang === 'en' ? 'Upload File' : 'फ़ाइल अपलोड करें',
    step2: lang === 'en' ? 'OCR Extraction' : 'ओसीआर निष्कर्षण',
    step2Pdf: lang === 'en' ? 'Text Extraction' : 'टेक्स्ट निष्कर्षण',
    step3: lang === 'en' ? 'AI Structuring' : 'एआई स्ट्रक्चरिंग',
    step4: lang === 'en' ? 'Excel Generation' : 'एक्सेल जनरेशन',
    modeImage: lang === 'en' ? 'Single Page (Image)' : 'एकल पृष्ठ (छवि)',
    modePdf: lang === 'en' ? 'Full Book (PDF/Images)' : 'पूर्ण पुस्तक (पीडीएफ/छवि)'
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSize = extractionMode === 'pdf' ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        const limit = extractionMode === 'pdf' ? '200MB' : '10MB';
        setError(lang === 'en' ? `File size exceeds ${limit} limit.` : `फ़ाइल का आकार ${limit} की सीमा से अधिक है।`);
        return;
      }
      
      // Validate file type
      const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf');
      const isImage = /\.(jpg|jpeg|png)$/i.test(selectedFile.name);
      
      if (!isPdf && !isImage) {
        setError(lang === 'en' ? 'Please select a valid file (PDF, JPG, or PNG).' : 'कृपया एक मान्य फ़ाइल चुनें (पीडीएफ, JPG, या PNG)।');
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
      const maxSize = extractionMode === 'pdf' ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
      if (droppedFile.size > maxSize) {
        const limit = extractionMode === 'pdf' ? '200MB' : '10MB';
        setError(lang === 'en' ? `File size exceeds ${limit} limit.` : `फ़ाइल का आकार ${limit} की सीमा से अधिक है।`);
        return;
      }
      
      // Validate file type
      const isPdf = droppedFile.name.toLowerCase().endsWith('.pdf');
      const isImage = /\.(jpg|jpeg|png)$/i.test(droppedFile.name);
      
      if (!isPdf && !isImage) {
        setError(lang === 'en' ? 'Please select a valid file (PDF, JPG, or PNG).' : 'कृपया एक मान्य फ़ाइल चुनें (पीडीएफ, JPG, या PNG)।');
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
    
    // Different endpoints for different modes
    const endpoint = extractionMode === 'pdf' 
      ? 'materia-medica-extract/upload'
      : 'kent-ocr/upload';
    
    const fieldName = extractionMode === 'pdf' ? 'pdf' : 'page';
    formData.append(fieldName, file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + (extractionMode === 'pdf' ? 3 : 5); // Slower for PDF
        });
      }, extractionMode === 'pdf' ? 2000 : 1000);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await api.post(`/${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000 // 5 minutes timeout for heavy OCR & AI translation
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data.data);

    } catch (err) {
      console.error('Upload Error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during processing.');
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t.title}</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Image Quality Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-amber-500 mt-0.5 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1.5">
              {lang === 'en' ? '📄 Tips for PDF extraction:' : '📄 पीडीएफ निष्कर्षण के लिए सुझाव:'}
            </p>
            <ul className="text-xs text-amber-700 space-y-1 list-none">
              <li>✅ {lang === 'en' ? 'For PDFs: Use text-based PDFs (not scanned images)' : 'पीडीएफ के लिए: टेक्स्ट-आधारित पीडीएफ का उपयोग करें'}</li>
              <li>✅ {lang === 'en' ? 'For Images: Scan at 300+ DPI with good lighting' : 'छवियों के लिए: 300+ DPI पर अच्छी रोशनी के साथ स्कैन करें'}</li>
              <li>✅ {lang === 'en' ? 'Ensure files are not password-protected' : 'सुनिश्चित करें फाइलें पासवर्ड से सुरक्षित नहीं हैं'}</li>
              <li>✅ {lang === 'en' ? 'Multiple images can be uploaded one by one' : 'एक-एक करके कई छवियां अपलोड की जा सकती हैं'}</li>
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
            accept={extractionMode === 'pdf' ? '.pdf,.jpg,.jpeg,.png' : '.jpg,.jpeg,.png'}
          />
          
          {!file ? (
            <div className="space-y-4 cursor-pointer">
              <div className="w-16 h-16 bg-blue-50 text-[#062E6F] rounded-full flex items-center justify-center mx-auto">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-700">{t.dragDrop}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {extractionMode === 'pdf' ? t.supportedFilesPdf : t.supportedFiles}
                </p>
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
                    Start Processing
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex justify-between text-sm font-medium text-slate-700">
                    <span>{extractionMode === 'pdf' ? t.uploadingPdf : t.uploading}</span>
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
                      <span>{extractionMode === 'pdf' ? t.step2Pdf : t.step2}</span>
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
            <p className="font-semibold">Processing Error</p>
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
                  <p className="text-2xl font-bold">{result.parsedRows || result.totalEntries}</p>
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
                {t.uploadAnother}
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
                <ExternalLink className="w-4 h-4" />
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
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-xs">
                      <th className="p-3 border-b">Chapter (EN)</th>
                      <th className="p-3 border-b">Chapter (HI)</th>
                      <th className="p-3 border-b">Rubric (EN)</th>
                      <th className="p-3 border-b">Rubric (HI)</th>
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
                        <td className="p-3 text-slate-600">{row.rubric_hi || '-'}</td>
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {result.previewData.map((row, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-slate-100 space-y-3">
                    {/* Medicine and Grade Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="font-bold text-[#062E6F] text-sm">{row.medicine || '-'}</span>
                      </div>
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ml-2 ${
                        row.grading === 3 ? 'bg-red-100 text-red-700' :
                        row.grading === 2 ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {row.grading || 1}°
                      </span>
                    </div>

                    {/* Chapter */}
                    {(row.chapter_en || row.chapter_hi) && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Chapter</span>
                        {row.chapter_en && <div className="text-xs text-slate-700">{row.chapter_en}</div>}
                        {row.chapter_hi && <div className="text-xs text-slate-600">{row.chapter_hi}</div>}
                      </div>
                    )}

                    {/* Rubric */}
                    {(row.rubric_en || row.rubric_hi) && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Rubric</span>
                        {row.rubric_en && <div className="text-xs text-slate-700">{row.rubric_en}</div>}
                        {row.rubric_hi && <div className="text-xs text-slate-600">{row.rubric_hi}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {(result.parsedRows || result.totalEntries) > (result.previewData?.length || 0) && (
                <p className="text-center text-sm text-slate-500 mt-4 italic">
                  ...and {(result.parsedRows || result.totalEntries) - (result.previewData?.length || 0)} more rows available in the Excel file.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KentOCRTab;
