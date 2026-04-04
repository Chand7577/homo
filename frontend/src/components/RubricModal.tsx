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
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/homeopathy";

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
  const [mode, setMode] = useState<"single" | "bulk">("single");
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
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                  mode === "single"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Single Entry
                </div>
              </button>
              <button
                onClick={() => setMode("bulk")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                  mode === "bulk"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  Bulk Upload
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {mode === "bulk" && !rubric ? (
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
