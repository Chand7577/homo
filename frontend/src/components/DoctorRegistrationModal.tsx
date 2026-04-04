// @ts-nocheck
"use client";

import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Award,
  FileText,
  Briefcase,
  AlertCircle,
  CheckCircle,
  CreditCard,
  IdCard,
  Badge,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/homeopathy";

interface DoctorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DoctorRegistrationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: DoctorRegistrationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    registration_number: "",
    experience_years: 0,
    doctor_class: "",
    aadhar_number: "",
    pan_number: "",
    license_number: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const doctorClasses = [
    { value: "doctor_jp_nautiyal", label: "Doctor JP Nautiyal" },
    { value: "core_team", label: "Core Team" },
    { value: "individual", label: "Individual" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  const formatAadhar = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const match = numbers.match(/(\d{0,4})(\d{0,4})(\d{0,4})/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(" ");
    }
    return numbers;
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhar(e.target.value);
    setFormData((prev) => ({ ...prev, aadhar_number: formatted }));
    if (errors.aadhar_number) {
      setErrors((prev) => ({ ...prev, aadhar_number: "" }));
    }
    setError("");
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
    setFormData((prev) => ({ ...prev, pan_number: value }));
    if (errors.pan_number) {
      setErrors((prev) => ({ ...prev, pan_number: "" }));
    }
    setError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.specialization.trim())
      newErrors.specialization = "Specialization is required";
    if (!formData.qualification.trim())
      newErrors.qualification = "Qualification is required";
    if (!formData.registration_number.trim())
      newErrors.registration_number = "Registration number is required";
    if (!formData.doctor_class)
      newErrors.doctor_class = "Doctor class is required";

    // Aadhar validation
    const aadharDigits = formData.aadhar_number.replace(/\s/g, "");
    if (!aadharDigits) {
      newErrors.aadhar_number = "Aadhar number is required";
    } else if (aadharDigits.length !== 12 || !/^\d+$/.test(aadharDigits)) {
      newErrors.aadhar_number = "Aadhar must be 12 digits";
    }

    // PAN validation
    if (!formData.pan_number.trim()) {
      newErrors.pan_number = "PAN number is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number)) {
      newErrors.pan_number = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    if (!formData.license_number.trim())
      newErrors.license_number = "License number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/admin/doctors/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          setError(data.error || "Validation failed");
        } else {
          setError(data.error || "Failed to create doctor");
        }
        return;
      }

      setSuccess(
        "Doctor created successfully! Login credentials sent to email.",
      );

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        specialization: "",
        qualification: "",
        registration_number: "",
        experience_years: 0,
        doctor_class: "",
        aadhar_number: "",
        pan_number: "",
        license_number: "",
      });

      // Close modal and refresh list after 2 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error creating doctor:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Doctor</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new doctor account
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
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          {/* Doctor Class */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Badge className="w-4 h-4" />
              Doctor Class *
            </label>
            <select
              name="doctor_class"
              value={formData.doctor_class}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                errors.doctor_class
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-gray-900"
              }`}
            >
              <option value="">Select doctor class</option>
              {doctorClasses.map((dc) => (
                <option key={dc.value} value={dc.value}>
                  {dc.label}
                </option>
              ))}
            </select>
            {errors.doctor_class && (
              <p className="text-xs text-red-600 mt-1">{errors.doctor_class}</p>
            )}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.first_name
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                placeholder="John"
              />
              {errors.first_name && (
                <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.last_name
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                placeholder="Doe"
              />
              {errors.last_name && (
                <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.email
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                placeholder="doctor@hospital.com"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                placeholder="+91 801 234 5678"
              />
            </div>
          </div>

          {/* ID Documents */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <IdCard className="w-4 h-4" />
                Aadhar Number *
              </label>
              <input
                type="text"
                name="aadhar_number"
                value={formData.aadhar_number}
                onChange={handleAadharChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.aadhar_number
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                placeholder="1234 5678 9012"
                maxLength={14}
              />
              {errors.aadhar_number && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.aadhar_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                PAN Number *
              </label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handlePanChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors uppercase ${
                  errors.pan_number
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              {errors.pan_number && (
                <p className="text-xs text-red-600 mt-1">{errors.pan_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                License Number *
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.license_number
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                placeholder="LIC123456"
              />
              {errors.license_number && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.license_number}
                </p>
              )}
            </div>
          </div>

          {/* Professional Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Specialization *
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                errors.specialization
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-gray-900"
              }`}
              placeholder="e.g., Homeopathy, General Medicine"
            />
            {errors.specialization && (
              <p className="text-xs text-red-600 mt-1">
                {errors.specialization}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Qualification *
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.qualification
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                placeholder="e.g., MBBS, MD"
              />
              {errors.qualification && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.qualification}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Experience (Years)
              </label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Registration Number *
              </label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.registration_number
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                placeholder="REG123456"
              />
              {errors.registration_number && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.registration_number}
                </p>
              )}
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

          {/* Info Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-sm">
            <p className="font-semibold mb-1">📧 Login Credentials</p>
            <p className="text-xs">
              A secure password will be automatically generated and sent to the
              doctor's email address.
            </p>
          </div>

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
              {loading ? "Creating..." : "Create Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegistrationModal;
