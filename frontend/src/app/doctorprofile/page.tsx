// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Award,
  FileText,
  Briefcase,
  Calendar,
  Lock,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  LogOut,
  Settings,
  Shield,
  Bell,
  ChevronRight,
  Camera,
  Upload,
  CreditCard,
  IdCard,
  Badge,
} from "lucide-react";

import { API_BASE } from "@/config";

interface DoctorProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  registration_number: string;
  experience_years: number;
  doctor_class?: string;
  aadhar_number?: string;
  pan_number?: string;
  license_number?: string;
  bio: string;
  consultation_fee?: string;
  profile_image?: string;
  created_at: string;
}

const DoctorProfile = () => {
  const [profile, setProfile] = useState<DoctorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    phone: "",
    bio: "",
    consultation_fee: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/doctor/profile/`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.doctor);
      setEditData({
        phone: data.doctor.phone || "",
        bio: data.doctor.bio || "",
        consultation_fee: data.doctor.consultation_fee || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);

    try {
      const response = await fetch(`${API_BASE}/doctor/profile/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await fetchProfile();
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert(err.message || "Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("profile_image", file);

      const response = await fetch(`${API_BASE}/doctor/profile/upload-image/`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      await fetchProfile();
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    if (!passwordData.current_password) {
      errors.current_password = "Current password is required";
    }
    if (!passwordData.new_password) {
      errors.new_password = "New password is required";
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = "Password must be at least 8 characters";
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors({});

    try {
      const response = await fetch(`${API_BASE}/doctor/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          setPasswordErrors({ current_password: data.error });
        }
        throw new Error(data.error || "Failed to change password");
      }

      alert("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err: any) {
      console.error("Error changing password:", err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;

    try {
      await fetch(`${API_BASE}/doctor/logout/`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getDoctorClassLabel = (value?: string) => {
    if (!value) return null;
    const labels = {
      doctor_jp_nautiyal: "Doctor JP Nautiyal",
      core_team: "Core Team",
      individual: "Individual",
    };
    return labels[value] || value;
  };

  const formatAadhar = (aadhar?: string) => {
    if (!aadhar) return "N/A";
    const cleaned = aadhar.replace(/\s/g, "");
    return cleaned.match(/.{1,4}/g)?.join(" ") || aadhar;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {error || "Failed to load profile"}
          </p>
          <button
            onClick={fetchProfile}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar with Upload */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {profile.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt={profile.name}
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white border-opacity-30"
                  />
                ) : (
                  <div className="w-24 h-24 text-black bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl font-bold border-4 border-white border-opacity-30">
                    {getInitials(profile.name)}
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50"
                  title="Upload profile picture"
                >
                  {uploadingImage ? (
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin text-black"></div>
                  ) : (
                    <Camera className="w-5 h-5 text-black" />
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {profile.name}
                </h1>
                <p className="text-white text-opacity-80 text-lg mb-3">
                  {profile.specialization}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm font-medium text-black">
                    {profile.experience_years} years experience
                  </span>
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm font-medium text-black">
                    {profile.qualification}
                  </span>
                  {profile.doctor_class && (
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm font-medium text-black">
                      {getDoctorClassLabel(profile.doctor_class)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-semibold transition-all text-black"
                  >
                    <Edit className="w-4 h-4 text-black" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          phone: profile.phone || "",
                          bio: profile.bio || "",
                          consultation_fee: profile.consultation_fee || "",
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-semibold transition-all text-black"
                    >
                      <X className="w-4 h-4 text-black" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      {saveLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin text-black"></div>
                      ) : (
                        <Save className="w-4 h-4 text-black" />
                      )}
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Identity Documents */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Identity Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.aadhar_number && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IdCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Aadhar Number</p>
                    <p className="font-semibold text-gray-900 font-mono">
                      {formatAadhar(profile.aadhar_number)}
                    </p>
                  </div>
                </div>
              )}

              {profile.pan_number && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">PAN Number</p>
                    <p className="font-semibold text-gray-900 font-mono">
                      {profile.pan_number}
                    </p>
                  </div>
                </div>
              )}

              {profile.license_number && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">License Number</p>
                    <p className="font-semibold text-gray-900 font-mono">
                      {profile.license_number}
                    </p>
                  </div>
                </div>
              )}

              {profile.doctor_class && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Badge className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Doctor Class</p>
                    <p className="font-semibold text-gray-900">
                      {getDoctorClassLabel(profile.doctor_class)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Email Address</p>
                  <p className="font-semibold text-gray-900">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
                      placeholder="+91 801 234 5678"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900">
                      {profile.phone || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Specialization</p>
                  <p className="font-semibold text-gray-900">
                    {profile.specialization}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">
                    Registration Number
                  </p>
                  <p className="font-semibold text-gray-900">
                    {profile.registration_number}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Experience</p>
                  <p className="font-semibold text-gray-900">
                    {profile.experience_years} years
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) =>
                  setEditData({ ...editData, bio: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none"
                placeholder="Tell us about yourself, your practice, and your approach to homeopathy..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {profile.bio ||
                  "No bio provided yet. Click Edit to add information about yourself."}
              </p>
            )}
          </div>

          {/* Consultation Fee */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Consultation Fee
            </h2>
            {isEditing ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">₹</span>
                <input
                  type="number"
                  value={editData.consultation_fee}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      consultation_fee: e.target.value,
                    })
                  }
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none text-lg"
                  placeholder="5000"
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {profile.consultation_fee
                  ? `₹${profile.consultation_fee}`
                  : "Not set"}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              This information is optional and for your records only
            </p>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Security & Settings
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      Change Password
                    </p>
                    <p className="text-sm text-gray-500">
                      Update your account password
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-red-900">Logout</p>
                    <p className="text-sm text-red-700">
                      Sign out of your account
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Change Password
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update your account password
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current_password: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    passwordErrors.current_password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-gray-900"
                  }`}
                  placeholder="Enter current password"
                />
                {passwordErrors.current_password && (
                  <p className="text-xs text-red-600 mt-1">
                    {passwordErrors.current_password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    passwordErrors.new_password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-gray-900"
                  }`}
                  placeholder="Enter new password"
                />
                {passwordErrors.new_password && (
                  <p className="text-xs text-red-600 mt-1">
                    {passwordErrors.new_password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirm_password: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    passwordErrors.confirm_password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-gray-900"
                  }`}
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirm_password && (
                  <p className="text-xs text-red-600 mt-1">
                    {passwordErrors.confirm_password}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all disabled:opacity-50"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
