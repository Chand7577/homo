// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { X, Pill, AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  medicine?: any; // For edit mode
}

const MedicineModal = ({
  isOpen,
  onClose,
  onSuccess,
  medicine,
}: MedicineModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    latin_name: "",
    common_name: "",
    source: "",
    indications: "",
    contraindications: "",
    description: "",
  });
  const [potencies, setPotencies] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const commonPotencies = [
    "6C",
    "12C",
    "30C",
    "200C",
    "1M",
    "10M",
    "50M",
    "CM",
  ];

  useEffect(() => {
    if (medicine) {
      // Edit mode - populate form
      setFormData({
        name: medicine.name || "",
        latin_name: medicine.latin_name || "",
        common_name: medicine.common_name || "",
        source: medicine.source || "",
        indications: medicine.indications || "",
        contraindications: medicine.contraindications || "",
        description: medicine.description || "",
      });
      setPotencies(medicine.potencies?.length > 0 ? medicine.potencies : [""]);
    } else {
      // Create mode - reset form
      setFormData({
        name: "",
        latin_name: "",
        common_name: "",
        source: "",
        indications: "",
        contraindications: "",
        description: "",
      });
      setPotencies([""]);
    }
    setError("");
    setSuccess("");
    setErrors({});
  }, [medicine, isOpen]);

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

  const handlePotencyChange = (index: number, value: string) => {
    const newPotencies = [...potencies];
    newPotencies[index] = value;
    setPotencies(newPotencies);
  };

  const addPotency = () => {
    setPotencies([...potencies, ""]);
  };

  const removePotency = (index: number) => {
    if (potencies.length > 1) {
      setPotencies(potencies.filter((_, i) => i !== index));
    }
  };

  const addCommonPotency = (potency: string) => {
    if (!potencies.includes(potency)) {
      const filtered = potencies.filter((p) => p.trim());
      setPotencies([...filtered, potency]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Medicine name is required";
    if (!formData.latin_name.trim())
      newErrors.latin_name = "Latin name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const url = medicine
        ? `${API_BASE}/admin/medicines/${medicine.id}/update/`
        : `${API_BASE}/admin/medicines/create/`;

      const method = medicine ? "PUT" : "POST";

      // Filter out empty potencies
      const filteredPotencies = potencies.filter((p) => p.trim());

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          potencies: filteredPotencies,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          setError(data.error || "Validation failed");
        } else {
          setError(
            data.error ||
              `Failed to ${medicine ? "update" : "create"} medicine`,
          );
        }
        return;
      }

      setSuccess(`Medicine ${medicine ? "updated" : "created"} successfully!`);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error saving medicine:", err);
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
              {medicine ? "Edit Medicine" : "Add New Medicine"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {medicine
                ? "Update medicine information"
                : "Create a new homeopathic medicine"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medicine Name *
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
                    placeholder="e.g., Belladonna"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latin Name *
                  </label>
                  <input
                    type="text"
                    name="latin_name"
                    value={formData.latin_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.latin_name
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                    placeholder="e.g., Atropa belladonna"
                  />
                  {errors.latin_name && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.latin_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Common Name
                  </label>
                  <input
                    type="text"
                    name="common_name"
                    value={formData.common_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                    placeholder="e.g., Deadly Nightshade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                    placeholder="e.g., Plant, Mineral, Animal"
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
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors resize-none"
                  placeholder="General information about the medicine..."
                />
              </div>
            </div>
          </div>

          {/* Potencies */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Potencies
              </h3>
              <button
                type="button"
                onClick={addPotency}
                className="flex items-center gap-1 text-sm text-[#3F856C] hover:text-[#2d6350] font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Custom
              </button>
            </div>

            {/* Quick Add Common Potencies */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {commonPotencies.map((potency) => (
                  <button
                    key={potency}
                    type="button"
                    onClick={() => addCommonPotency(potency)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      potencies.includes(potency)
                        ? "bg-[#3F856C] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {potency}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Potency Inputs */}
            <div className="space-y-2">
              {potencies.map((potency, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={potency}
                    onChange={(e) => handlePotencyChange(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors text-sm"
                    placeholder="e.g., 30C, 200C, 1M"
                  />
                  {potencies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePotency(index)}
                      className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Clinical Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Indications
                </label>
                <textarea
                  name="indications"
                  value={formData.indications}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors resize-none"
                  placeholder="Main symptoms and conditions this medicine addresses..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraindications
                </label>
                <textarea
                  name="contraindications"
                  value={formData.contraindications}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors resize-none"
                  placeholder="When this medicine should not be used..."
                />
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 text-sm flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading
                ? medicine
                  ? "Updating..."
                  : "Creating..."
                : medicine
                  ? "Update Medicine"
                  : "Create Medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineModal;
