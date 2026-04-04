// @ts-nocheck
"use client";

import { useState } from 'react';
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
  Globe,
  Lock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Clock,
  FileText,
  Languages,
  Moon,
  Sun
} from 'lucide-react';

const PatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [language, setLanguage] = useState('english');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  const [profileData, setProfileData] = useState({
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
    bloodGroup: 'O+',
    address: 'Mumbai, Maharashtra, India',
    emergencyContact: '+91 98765 43211',
    emergencyName: 'Priya Kumar'
  });

  const stats = [
    { label: 'Total Searches', value: '23', icon: Activity, color: 'bg-purple-100 text-purple-600' },
    { label: 'This Month', value: '12', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { label: 'Saved Results', value: '8', icon: FileText, color: 'bg-green-100 text-green-600' },
    { label: 'Member Since', value: 'Jan 2026', icon: Clock, color: 'bg-orange-100 text-orange-600' }
  ];

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'settings', label: 'Settings', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="px-3 md:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#3F856C] to-[#2d6050] rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-2xl">
                {profileData.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                <Camera className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{profileData.name}</h1>
              <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4">{profileData.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                <span className="bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium">
                  {profileData.gender}
                </span>
                <span className="bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium">
                  Blood: {profileData.bloodGroup}
                </span>
                <span className="bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Mumbai
                </span>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-200 hover:shadow-lg transition-all">
                <div className={`${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1 truncate">{stat.label}</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
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
                      ? 'border-gray-900 text-gray-900 bg-gray-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
          {activeTab === 'profile' && (
            <div className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Personal Information</h3>
              
              <div className="space-y-4 md:space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Date of Birth & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                        className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                    <input
                      type="text"
                      value={profileData.bloodGroup}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, bloodGroup: e.target.value})}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 md:left-4 top-3 md:top-4 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    <textarea
                      value={profileData.address}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      rows={3}
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60 resize-none"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t border-gray-200 pt-4 md:pt-5">
                  <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={profileData.emergencyName}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, emergencyName: e.target.value})}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        value={profileData.emergencyContact}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="w-full py-3 md:py-4 bg-gray-900 text-white rounded-lg md:rounded-xl text-sm md:text-base font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Save className="w-4 h-4 md:w-5 md:h-5" />
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Language */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5 md:w-6 md:h-6 text-[#3F856C]" />
                  Language Preference
                </h4>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {['English', 'हिंदी'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang.toLowerCase())}
                      className={`p-3 md:p-4 rounded-lg md:rounded-xl text-sm md:text-base font-semibold transition-all border-2 ${
                        language === lang.toLowerCase()
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
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
                    <div key={key} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                      <span className="text-sm md:text-base font-medium text-gray-900 capitalize">{key} Notifications</span>
                      <button
                        onClick={() => setNotifications({...notifications, [key]: !value})}
                        className={`relative w-12 h-6 md:w-14 md:h-7 rounded-full transition-colors ${
                          value ? 'bg-[#3F856C]' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6 md:translate-x-7' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  {darkMode ? <Moon className="w-5 h-5 md:w-6 md:h-6 text-[#3F856C]" /> : <Sun className="w-5 h-5 md:w-6 md:h-6 text-[#3F856C]" />}
                  Appearance
                </h4>
                <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                  <span className="text-sm md:text-base font-medium text-gray-900">Dark Mode</span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative w-12 h-6 md:w-14 md:h-7 rounded-full transition-colors ${
                      darkMode ? 'bg-gray-900' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full transition-transform ${
                      darkMode ? 'translate-x-6 md:translate-x-7' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Change Password */}
              <div className="border-b border-gray-200 pb-4 md:pb-6">
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 md:w-6 md:h-6 text-[#3F856C]" />
                  Security
                </h4>
                <button className="w-full p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg md:rounded-xl text-sm md:text-base font-semibold text-gray-900 transition-colors flex items-center justify-between">
                  <span>Change Password</span>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </button>
              </div>

              {/* Data Management */}
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Data Management</h4>
                <div className="space-y-3">
                  <button className="w-full p-3 md:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg md:rounded-xl text-sm md:text-base font-semibold text-blue-900 transition-colors flex items-center justify-between">
                    <span>Download My Data</span>
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button className="w-full p-3 md:p-4 bg-red-50 hover:bg-red-100 rounded-lg md:rounded-xl text-sm md:text-base font-semibold text-red-900 transition-colors flex items-center justify-between">
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
                    <p className="text-xs md:text-sm font-bold text-blue-900 mb-1">Your Privacy Matters</p>
                    <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                      We protect your data with encryption and never share your personal information without consent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;
