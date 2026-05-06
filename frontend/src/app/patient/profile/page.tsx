// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit2,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Lock,
  Trash2,
  Activity,
  Clock,
  FileText,
  Languages,
  Moon,
  Sun,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

import { API_BASE } from "@/config";

// Change Password Modal
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match");
      return;
    }

    if (passwords.new.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/patient/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.new,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Password changed successfully");
        setTimeout(() => {
          onClose();
          setPasswords({ current: "", new: "", confirm: "" });
        }, 2000);
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-900">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Delete Account Modal
const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const handleDelete = async () => {
    if (confirmation !== "DELETE") {
      return;
    }

    setLoading(true);
    // Implement delete account logic
    setTimeout(() => {
      alert("Account deletion is not implemented yet");
      setLoading(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-red-900">Delete Account</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-900 font-semibold mb-2">
              Warning: This action cannot be undone
            </p>
            <p className="text-sm text-red-800">
              Deleting your account will permanently remove all your data,
              including search history and saved results.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type <span className="text-red-600 font-bold">DELETE</span> to
              confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmation !== "DELETE" || loading}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Settings
  const [language, setLanguage] = useState("english");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    address: "",
    emergency_contact: "",
    age: 0,
  });

  const [stats, setStats] = useState({
    total_searches: 0,
    searches_this_month: 0,
    saved_searches: 0,
    member_since: "Jan 2026",
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/patient/profile/`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfileData(data.patient);
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/patient/stats/dashboard/`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/patient/profile/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone: profileData.phone,
          address: profileData.address,
          emergency_contact: profileData.emergency_contact,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Profile updated successfully");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadData = () => {
    alert("Data download functionality coming soon!");
  };

  const displayStats = [
    {
      label: "Total Searches",
      value: stats.total_searches || 0,
      icon: Activity,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "This Month",
      value: stats.searches_this_month || 0,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Saved Results",
      value: stats.saved_searches || 0,
      icon: FileText,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Member Since",
      value: stats.member_since || "Jan 2026",
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const tabs = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "settings", label: "Settings", icon: Shield },
    { id: "privacy", label: "Privacy", icon: Lock },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="px-3 md:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#3F856C] to-[#2d6050] rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-2xl">
                {profileData.name
                  ? profileData.name.charAt(0).toUpperCase()
                  : "P"}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                <Camera className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
                {profileData.name || "Patient Name"}
              </h1>
              <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">
                {profileData.email || "email@example.com"}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                <span className="bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium">
                  {profileData.gender || "N/A"}
                </span>
                <span className="bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium">
                  Blood: {profileData.blood_group || "N/A"}
                </span>
                {profileData.age > 0 && (
                  <span className="bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium">
                    Age: {profileData.age}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 md:px-6 py-2 md:py-3 bg-white text-gray-900 rounded-lg md:rounded-xl text-sm md:text-base font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Cancel</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="p-3 md:p-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-900">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
          {displayStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-200 hover:shadow-lg transition-all"
              >
                <div
                  className={`${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3`}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1 truncate">
                  {stat.label}
                </p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 mb-4 md:mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-gray-900 text-gray-900 bg-gray-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base font-semibold">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
          {activeTab === "profile" && (
            <div className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
                Personal Information
              </h3>

              <div className="space-y-4 md:space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.name || ""}
                      disabled
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none opacity-60"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Name cannot be changed
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email || ""}
                      disabled
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none opacity-60"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone || ""}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Date of Birth & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <input
                        type="date"
                        value={profileData.date_of_birth || ""}
                        disabled
                        className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <input
                      type="text"
                      value={profileData.blood_group || ""}
                      disabled
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none opacity-60"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 md:left-4 top-3 md:top-4 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <textarea
                      value={profileData.address || ""}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60 resize-none"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t border-gray-200 pt-4 md:pt-5">
                  <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                    Emergency Contact
                  </h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.emergency_contact || ""}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          emergency_contact: e.target.value,
                        })
                      }
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3 md:py-4 bg-gray-900 text-white rounded-lg md:rounded-xl text-sm md:text-base font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 md:w-5 md:h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Language */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5 md:w-6 md:h-6 text-[#3F856C]" />
                  Language Preference
                </h4>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {["English", "हिंदी"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang.toLowerCase())}
                      className={`p-3 md:p-4 rounded-lg md:rounded-xl text-sm md:text-base font-semibold transition-all border-2 ${
                        language === lang.toLowerCase()
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 md:w-6 md:h-6 text-[#3F856C]" />
                  Notifications
                </h4>
                <div className="space-y-3 md:space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl"
                    >
                      <span className="text-sm md:text-base font-medium text-gray-900 capitalize">
                        {key} Notifications
                      </span>
                      <button
                        onClick={() =>
                          setNotifications({ ...notifications, [key]: !value })
                        }
                        className={`relative w-12 h-6 md:w-14 md:h-7 rounded-full transition-colors ${
                          value ? "bg-[#3F856C]" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full transition-transform ${
                            value
                              ? "translate-x-6 md:translate-x-7"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  {darkMode ? (
                    <Moon className="w-5 h-5 md:w-6 md:h-6 text-[#3F856C]" />
                  ) : (
                    <Sun className="w-5 h-5 md:w-6 md:h-6 text-[#3F856C]" />
                  )}
                  Appearance
                </h4>
                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                  <span className="text-sm md:text-base font-medium text-gray-900">
                    Dark Mode
                  </span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative w-12 h-6 md:w-14 md:h-7 rounded-full transition-colors ${
                      darkMode ? "bg-gray-900" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full transition-transform ${
                        darkMode
                          ? "translate-x-6 md:translate-x-7"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Change Password */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 md:w-6 md:h-6 text-[#3F856C]" />
                  Security
                </h4>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg md:rounded-xl text-sm md:text-base font-semibold text-gray-900 transition-colors flex items-center justify-between"
                >
                  <span>Change Password</span>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </button>
              </div>

              {/* Data Management */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                  Data Management
                </h4>
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadData}
                    className="w-full p-3 md:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg md:rounded-xl text-sm md:text-base font-semibold text-blue-900 transition-colors flex items-center justify-between"
                  >
                    <span>Download My Data</span>
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full p-3 md:p-4 bg-red-50 hover:bg-red-100 rounded-lg md:rounded-xl text-sm md:text-base font-semibold text-red-900 transition-colors flex items-center justify-between"
                  >
                    <span>Delete Account</span>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg md:rounded-xl p-3 md:p-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs md:text-sm font-bold text-blue-900 mb-1">
                      Your Privacy Matters
                    </p>
                    <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                      We protect your data with encryption and never share your
                      personal information without consent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PatientProfile;
