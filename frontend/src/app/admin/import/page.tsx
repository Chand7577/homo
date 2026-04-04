// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
const API_BASE = "http://127.0.0.1:8000/homeopathy";

import { 
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  Trash2,
  Eye,
  ChevronRight,
  Info,
  Clock,
  TrendingUp,
  Database,
  Pill,
  List,
  Tag,
  Download,
  AlertTriangle,
  Check
} from 'lucide-react';

const ImportManagement = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [importHistory, setImportHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/import/history/`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setImportHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const deleteHistory = async (id) => {
    if (!confirm("Are you sure? This will delete the history record and ALL rubrics/medicines imported in this session.")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/import/history/${id}/delete/`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        fetchHistory(); // Refresh
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("An error occurred during deletion");
    }
  };

  const importTemplates = [
    {
      name: 'Medicines Import Template',
      description: 'Excel template for importing medicine data',
      type: 'Medicines',
      icon: Pill,
      fileFormat: '.xlsx',
      columns: ['Name', 'Latin Name', 'Potency', 'Description']
    },
    {
      name: 'Rubrics Import Template',
      description: 'CSV template for importing rubric hierarchy',
      type: 'Rubrics',
      icon: List,
      fileFormat: '.csv',
      columns: ['Rubric Name', 'Parent ID', 'Level', 'Category']
    },
    {
      name: 'Grade Mappings Template',
      description: 'Medicine-rubric grade mappings (1-5 scale)',
      type: 'Mappings',
      icon: Database,
      fileFormat: '.xlsx',
      columns: ['Rubric ID', 'Medicine ID', 'Grade', 'Notes']
    },
    {
      name: 'Synonyms Import Template',
      description: 'Rubric synonyms and cross-references',
      type: 'Synonyms',
      icon: Tag,
      fileFormat: '.csv',
      columns: ['Rubric ID', 'Synonym', 'Language']
    },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files).map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.name.includes('.xlsx') ? 'Excel' : 'CSV'
    }));
    setSelectedFiles([...selectedFiles, ...fileArray]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const processImport = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsProcessing(true);
    setUploadProgress(0);
    setStatusMessage("Uploading file to server...");
    setUploadError("");
    
    const formData = new FormData();
    formData.append("file", selectedFiles[0].file);

    try {
      // 1. Upload File
      const uploadRes = await fetch(`${API_BASE}/admin/import/mastersheet/`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || uploadData.error) {
        throw new Error(uploadData.error || "Failed to upload file");
      }
      
      setStatusMessage("File uploaded. Background processing started...");
      setUploadProgress(20); // Arbitrary upload complete progress

      // 2. Poll Status
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE}/admin/import/status/`, { credentials: 'include' });
          const statusData = await statusRes.json();
          
          setStatusMessage(statusData.message || "Processing...");
          
          // Faux progress increment while running just for UI feedback
          setUploadProgress(prev => Math.min(prev + 5, 95));

          if (statusData.is_running === false) {
            clearInterval(interval);
            setIsProcessing(false);
            setUploadProgress(100);
            
            if (statusData.error) {
              setUploadError(statusData.error);
            } else {
              setStatusMessage("Database successfully updated!");
              fetchHistory(); // SHIFT: Refresh the real history list
              setTimeout(() => {
                setSelectedFiles([]);
                setUploadProgress(0);
                setStatusMessage("");
              }, 4000);
            }
          }
        } catch (pollErr) {
          console.error("Polling error", pollErr);
        }
      }, 2000);

    } catch (err) {
      console.error(err);
      setUploadError(err.message || "An error occurred during upload");
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 md:px-8 py-3 md:py-6">
        <div className="flex items-center justify-between mb-3 md:mb-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">Import</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1 truncate">Bulk import from Excel/CSV</p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 ml-2">
            <button className="hidden md:flex px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors items-center gap-2">
              <Download className="w-4 h-4" />
              Templates
            </button>
            <button className="p-2 md:px-4 md:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-semibold">Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 md:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-8">
          {[
            { label: 'Total Imports', value: '47', change: '+12', icon: Upload, color: 'bg-gray-900' },
            { label: 'Records Added', value: '2,847', icon: CheckCircle, color: 'bg-[#3F856C]' },
            { label: 'Last Import', value: '3h', icon: Clock, color: 'bg-gray-700' },
            { label: 'Success Rate', value: '96%', icon: TrendingUp, color: 'bg-gray-600' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className={`${stat.color} w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center`}>
                    <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  {stat.change && (
                    <span className="text-xs font-bold text-[#3F856C] bg-green-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg">
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1 truncate">{stat.label}</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl md:rounded-2xl border-2 border-gray-200 overflow-hidden mb-4 md:mb-8">
          <div className="p-3 md:p-6 border-b border-gray-200">
            <h3 className="text-base md:text-lg font-bold text-gray-900">Upload Files</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-0.5 truncate">Drag & drop or click to upload</p>
          </div>

          <div className="p-3 md:p-6">
            <div
              className={`relative border-2 border-dashed rounded-xl md:rounded-2xl p-6 md:p-12 text-center transition-all ${
                dragActive 
                  ? 'border-gray-900 bg-gray-50' 
                  : 'border-gray-300 hover:border-gray-900 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
              </div>
              
              <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2">
                {dragActive ? 'Drop files here' : 'Drag & drop files'}
              </h4>
              <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                or click to browse
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#3F856C]" />
                  <span className="hidden sm:inline">Excel (.xlsx)</span>
                  <span className="sm:hidden">.xlsx</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#3F856C]" />
                  <span className="hidden sm:inline">CSV (.csv)</span>
                  <span className="sm:hidden">.csv</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-[#3F856C]" />
                  Max 50 MB
                </div>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base">Selected ({selectedFiles.length})</h4>
                  <button 
                    onClick={() => setSelectedFiles([])}
                    className="text-xs md:text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2.5 md:p-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-600">{file.size} • {file.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(index)}
                      className="p-1.5 md:p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0 ml-2"
                    >
                      <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                    </button>
                  </div>
                ))}

                {isProcessing && (
                  <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg md:rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-semibold text-blue-900">{statusMessage}</span>
                      <span className="text-xs md:text-sm font-bold text-blue-900">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>{uploadError}</p>
                  </div>
                )}
                
                {statusMessage && !isProcessing && !uploadError && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p>{statusMessage}</p>
                  </div>
                )}

                <button 
                  onClick={processImport}
                  disabled={isProcessing}
                  className="w-full py-3 md:py-4 bg-gray-900 text-white rounded-lg md:rounded-xl text-sm md:text-base font-bold hover:bg-black transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                      <span className="hidden sm:inline">Processing Import...</span>
                      <span className="sm:hidden">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 md:w-5 md:h-5" />
                      Start Import
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Templates - Mobile Cards */}
        

        {/* Import History - Mobile Cards */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-3 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-gray-900">History</h3>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 truncate">Recent imports</p>
            </div>
            <button 
              onClick={fetchHistory}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5 md:gap-2 ml-2"
            >
              <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {importHistory.map((item) => (
              <div key={item.id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.fileName}</p>
                    <p className="text-xs text-gray-500">{item.fileSize} • {item.time}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0 ${
                    item.type === 'Medicines' ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.status === 'success' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-[#3F856C]" />
                        <span className="text-xs font-semibold text-[#3F856C]">Success</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-semibold text-orange-600">Warning</span>
                      </>
                    )}
                    <span className="text-xs text-gray-600">• {item.recordsAdded} added</span>
                  </div>
                  <button onClick={() => deleteHistory(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">File Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Records</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {importHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.fileName}</p>
                          <p className="text-xs text-gray-500">{item.fileSize} • {item.time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {item.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{item.recordsAdded} added</p>
                        {item.recordsFailed > 0 && (
                          <p className="text-xs text-red-600">{item.recordsFailed} failed</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.status === 'success' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-[#3F856C]" />
                            <span className="text-sm font-semibold text-[#3F856C]">Success</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-semibold text-orange-600">Warning</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => deleteHistory(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete History File">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 md:p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs md:text-sm text-gray-600">Showing 3 of 47</p>
            <button className="text-xs md:text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1">
              Load More
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl md:rounded-2xl p-3 md:p-6 mt-4 md:mt-8">
          <div className="flex items-start gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-bold text-blue-900 mb-1 md:mb-2">Import Guidelines</p>
              <ul className="text-xs md:text-sm text-blue-800 space-y-0.5 md:space-y-1">
                <li>• Use provided templates for correct formatting</li>
                <li>• Validate data before importing</li>
                <li className="hidden md:list-item">• Large imports may take several minutes</li>
                <li>• Check logs for failed records</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImportManagement;
