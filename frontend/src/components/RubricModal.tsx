// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  Search,
  Layers,
  Loader2,
} from "lucide-react";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

interface RubricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rubric?: any; // For edit mode
}

const RubricModal = ({
  isOpen,
  onClose,
  onSuccess,
  rubric,
}: RubricModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<"single" | "sub-rubrics" | "bulk">("single");

  // Sub-rubrics mode state
  const [parentSearch, setParentSearch] = useState("");
  const [parentResults, setParentResults] = useState<any[]>([]);
  const [parentSearching, setParentSearching] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [subRows, setSubRows] = useState([{ name: "", description: "" }]);
  const [subLoading, setSubLoading] = useState(false);
  const [subResults, setSubResults] = useState<{ name: string; ok: boolean; msg: string }[]>([]);
  const parentSearchTimer = useRef<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    language: "EN",
    modality: "General",
    parent_id: null,
  });
  const [synonyms, setSynonyms] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bulk upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Mind",
    "Head",
    "Eye",
    "Ear",
    "Nose",
    "Face",
    "Mouth",
    "Throat",
    "Stomach",
    "Abdomen",
    "Rectum",
    "Bladder",
    "Chest",
    "Back",
    "Extremities",
    "Sleep",
    "Fever",
    "Skin",
    "Generalities",
  ];

  const languages = [
    { value: "EN", label: "English" },
    { value: "HI", label: "Hindi" },
    { value: "EN/HI", label: "English/Hindi" },
  ];

  useEffect(() => {
    if (rubric) {
      // Edit mode - force single mode
      setMode("single");
      setFormData({
        name: rubric.name || "",
        category: rubric.category || "",
        description: rubric.description || "",
        language: rubric.language || "EN",
        modality: rubric.modality || "General",
        parent_id: rubric.parent_id || null,
      });
      setSynonyms(rubric.synonyms?.length > 0 ? rubric.synonyms : [""]);
    } else {
      // Create mode - reset form
      setFormData({
        name: "",
        category: "",
        description: "",
        language: "EN",
        modality: "General",
        parent_id: null,
      });
      setSynonyms([""]);
      setMode("single");
    }
    setError("");
    setSuccess("");
    setErrors({});
    setUploadFile(null);
    setUploadProgress(null);
    // reset sub-rubrics
    setParentSearch("");
    setParentResults([]);
    setSelectedParent(null);
    setSubRows([{ name: "", description: "" }]);
    setSubResults([]);
  }, [rubric, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  const handleSynonymChange = (index: number, value: string) => {
    const newSynonyms = [...synonyms];
    newSynonyms[index] = value;
    setSynonyms(newSynonyms);
  };

  const addSynonym = () => {
    setSynonyms([...synonyms, ""]);
  };

  // ── Parent search ─────────────────────────────────────────────────
  const searchParent = (q: string) => {
    setParentSearch(q);
    setShowParentDropdown(true);
    clearTimeout(parentSearchTimer.current);
    if (!q.trim()) { setParentResults([]); return; }
    parentSearchTimer.current = setTimeout(async () => {
      setParentSearching(true);
      try {
        const res = await fetch(
          `${API_BASE}/doctor/rubrics/search/?query=${encodeURIComponent(q)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setParentResults(data.rubrics || data.results || []);
      } catch { setParentResults([]); }
      finally { setParentSearching(false); }
    }, 350);
  };

  // ── Sub-row helpers ───────────────────────────────────────────────
  const addSubRow = () => setSubRows(r => [...r, { name: "", description: "" }]);
  const removeSubRow = (i: number) => setSubRows(r => r.filter((_, idx) => idx !== i));
  const updateSubRow = (i: number, field: string, val: string) =>
    setSubRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  // ── Submit sub-rubrics ────────────────────────────────────────────
  const handleSubmitSubRubrics = async () => {
    if (!selectedParent) { setError("Please select a parent rubric."); return; }
    const validRows = subRows.filter(r => r.name.trim());
    if (!validRows.length) { setError("Add at least one sub-rubric name."); return; }
    setSubLoading(true); setError(""); setSubResults([]);
    const results: { name: string; ok: boolean; msg: string }[] = [];
    for (const row of validRows) {
      try {
        const res = await fetch(`${API_BASE}/admin/rubrics/create/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: row.name.trim(),
            description: row.description.trim(),
            category: selectedParent.category || "",
            language: "EN",
            modality: "General",
            parent_id: selectedParent.id,
            synonyms: [],
          }),
        });
        const data = await res.json();
        results.push({ name: row.name, ok: res.ok, msg: res.ok ? "Created" : (data.error || "Failed") });
      } catch {
        results.push({ name: row.name, ok: false, msg: "Network error" });
      }
    }
    setSubResults(results);
    setSubLoading(false);
    const allOk = results.every(r => r.ok);
    if (allOk) {
      setSuccess(`${results.length} sub-rubric(s) created under "${selectedParent.name}"!`);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    }
  };

  const removeSynonym = (index: number) => {
    if (synonyms.length > 1) {
      setSynonyms(synonyms.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Rubric name is required";
    if (!formData.category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setError("Please upload an Excel file (.xlsx or .xls)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setUploadFile(file);
      setError("");
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await fetch(`${API_BASE}/admin/rubrics/bulk-upload/`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to upload file");
        return;
      }

      setSuccess(
        `Upload successful! Created: ${data.stats.created}, Updated: ${data.stats.updated}, Failed: ${data.stats.failed}`,
      );
      setUploadProgress(data.stats);

      // Reset file input
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh list after 2 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/rubrics/download-template/`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        setError("Failed to download template");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rubric_upload_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download template");
      console.error("Error downloading template:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = rubric
        ? `${API_BASE}/admin/rubrics/${rubric.id}/update/`
        : `${API_BASE}/admin/rubrics/create/`;

      const method = rubric ? "PUT" : "POST";

      // Filter out empty synonyms
      const filteredSynonyms = synonyms.filter((s) => s.trim());

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          synonyms: filteredSynonyms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          setError(data.error || "Validation failed");
        } else {
          setError(
            data.error || `Failed to ${rubric ? "update" : "create"} rubric`,
          );
        }
        return;
      }

      setSuccess(`Rubric ${rubric ? "updated" : "created"} successfully!`);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error saving rubric:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {rubric ? "Edit Rubric" : "Add Rubrics"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {rubric
                ? "Update rubric information"
                : "Create rubrics individually or bulk upload from Excel"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Mode Selector (only in create mode) */}
        {!rubric && (
          <div className="p-6 pb-0">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setMode("single")}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all ${
                  mode === "single" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Single
                </div>
              </button>
              <button
                onClick={() => { setMode("sub-rubrics"); setError(""); }}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all ${
                  mode === "sub-rubrics" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Sub-Rubrics
                </div>
              </button>
              <button
                onClick={() => setMode("bulk")}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all ${
                  mode === "bulk" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Bulk Upload
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {mode === "sub-rubrics" && !rubric ? (
            /* ── Sub-Rubrics Form ── */
            <div className="space-y-5">
              {/* Parent rubric search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Rubric *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={selectedParent ? selectedParent.name : parentSearch}
                    onChange={e => { setSelectedParent(null); searchParent(e.target.value); }}
                    onFocus={() => setShowParentDropdown(true)}
                    placeholder="Search for a rubric (e.g. Mind, Anxiety)…"
                    className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none text-sm"
                  />
                  {parentSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                  {selectedParent && (
                    <button onClick={() => { setSelectedParent(null); setParentSearch(""); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-red-400 flex items-center justify-center transition-colors">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                  {showParentDropdown && !selectedParent && parentResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                      {parentResults.map((r: any) => (
                        <button key={r.id} type="button"
                          onClick={() => { setSelectedParent(r); setParentSearch(""); setShowParentDropdown(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                          <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                          {r.full_path && <p className="text-xs text-gray-400 mt-0.5 truncate">{r.full_path}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedParent && (
                  <div className="mt-2 px-3 py-2 bg-sky-50 border border-sky-200 rounded-lg flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-sky-800 truncate">{selectedParent.full_path || selectedParent.name}</span>
                  </div>
                )}
              </div>

              {/* Sub-rubric rows */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">Sub-Rubrics to Add *</label>
                  <button type="button" onClick={addSubRow}
                    className="flex items-center gap-1.5 text-sm text-[#3F856C] hover:text-[#2d6350] font-semibold">
                    <Plus className="w-4 h-4" /> Add Row
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {subRows.map((row, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={row.name}
                          onChange={e => updateSubRow(i, "name", e.target.value)}
                          placeholder={`Sub-rubric name ${i + 1} *`}
                          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none text-sm transition-colors"
                        />
                        <input
                          type="text"
                          value={row.description}
                          onChange={e => updateSubRow(i, "description", e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none text-xs text-gray-600 transition-colors"
                        />
                      </div>
                      {subRows.length > 1 && (
                        <button type="button" onClick={() => removeSubRow(i)}
                          className="mt-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{subRows.filter(r => r.name.trim()).length} of {subRows.length} row(s) will be submitted</p>
              </div>

              {/* Results after submit */}
              {subResults.length > 0 && (
                <div className="space-y-1.5">
                  {subResults.map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                      r.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {r.ok ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                      <span className="font-bold">{r.name}</span> — {r.msg}
                    </div>
                  ))}
                </div>
              )}

              {/* Action */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} disabled={subLoading}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmitSubRubrics} disabled={subLoading || !selectedParent}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {subLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Layers className="w-4 h-4" /> Create Sub-Rubrics</>}
                </button>
              </div>
            </div>
          ) : mode === "bulk" && !rubric ? (
            /* Bulk Upload Form */
            <div className="space-y-6">
              {/* Download Template Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Download Template First
                    </h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Download our Excel template to see the required format for
                      bulk upload
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Excel File
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />

                  {uploadFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <FileSpreadsheet className="w-12 h-12 text-green-600" />
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">
                            {uploadFile.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {(uploadFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setUploadFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        Select Excel File
                      </label>
                      <p className="text-sm text-gray-500 mt-3">
                        Supports .xlsx and .xls files (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-3">
                    Upload Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {uploadProgress.total_rows}
                      </p>
                      <p className="text-xs text-gray-600">Total Rows</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {uploadProgress.created}
                      </p>
                      <p className="text-xs text-gray-600">Created</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {uploadProgress.updated}
                      </p>
                      <p className="text-xs text-gray-600">Updated</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {uploadProgress.failed}
                      </p>
                      <p className="text-xs text-gray-600">Failed</p>
                    </div>
                  </div>
                  {uploadProgress.errors &&
                    uploadProgress.errors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-sm font-semibold text-red-800 mb-2">
                          Errors:
                        </p>
                        <ul className="text-xs text-red-700 space-y-1">
                          {uploadProgress.errors.map(
                            (err: string, idx: number) => (
                              <li key={idx}>• {err}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleBulkUpload}
                disabled={!uploadFile || uploading}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload & Process
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Single Entry Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rubric Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.name
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-gray-900"
                      }`}
                      placeholder="e.g., Mind - Anxiety"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          errors.category
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-gray-900"
                        }`}
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                      >
                        {languages.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Modality
                      </label>
                      <input
                        type="text"
                        name="modality"
                        value={formData.modality}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                        placeholder="e.g., General, Worse, Better"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors resize-none"
                      placeholder="Additional details about this rubric..."
                    />
                  </div>
                </div>
              </div>

              {/* Synonyms */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Synonyms (Optional)
                  </h3>
                  <button
                    type="button"
                    onClick={addSynonym}
                    className="flex items-center gap-1 text-sm text-[#3F856C] hover:text-[#2d6350] font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Synonym
                  </button>
                </div>
                <div className="space-y-2">
                  {synonyms.map((synonym, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={synonym}
                        onChange={(e) =>
                          handleSynonymChange(index, e.target.value)
                        }
                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-sm"
                        placeholder="Enter synonym"
                      />
                      {synonyms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSynonym(index)}
                          className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 active:bg-gray-300 transition-all touch-manipulation"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black active:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  disabled={loading}
                >
                  {loading
                    ? rubric
                      ? "Updating..."
                      : "Creating..."
                    : rubric
                      ? "Update Rubric"
                      : "Create Rubric"}
                </button>
              </div>
            </form>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 text-sm flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RubricModal;
