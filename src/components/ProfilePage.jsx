import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Briefcase, Award, GraduationCap, Save, 
  ArrowLeft, CheckCircle, AlertTriangle, Shield, Calendar
} from 'lucide-react';
import { updateProfile } from '../services/api';

export default function ProfilePage({ currentUser, onProfileUpdate, onBack, lang = 'en' }) {
  const t = (en, hi) => lang === 'en' ? en : hi;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualifications: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        specialization: currentUser.specialization || '',
        experience: currentUser.experience || '',
        qualifications: currentUser.qualifications || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.name.trim()) {
      setError(t('Name is required', 'नाम आवश्यक है'));
      return;
    }

    if (!formData.email.trim()) {
      setError(t('Email is required', 'ईमेल आवश्यक है'));
      return;
    }

    if (!formData.phone.trim()) {
      setError(t('Phone number is required', 'फ़ोन नंबर आवश्यक है'));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('Please enter a valid email address', 'कृपया एक वैध ईमेल पता दर्ज करें'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateProfile(formData);
      setSuccess(true);
      
      // Update parent component with new user data
      if (onProfileUpdate && response.user) {
        onProfileUpdate(response.user);
      }

      // Show success for 2 seconds then navigate back
      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || t('Failed to update profile', 'प्रोफ़ाइल अपडेट करने में विफल'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDoctor = currentUser?.role !== 'Patient';

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch(currentUser?.role) {
      case 'Admin': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Core Team': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'External Doctor': return 'bg-slate-200 text-slate-800 border-slate-300';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            type="button"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">
              {t('Account Settings', 'खाता सेटिंग्स')}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {t('Manage your personal information and preferences', 'अपनी व्यक्तिगत जानकारी और प्राथमिकताएं प्रबंधित करें')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-[#062E6F] to-[#042050] text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
              {currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold truncate">{currentUser?.name}</h2>
              <p className="text-blue-100 text-sm mt-1">{currentUser?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getRoleBadgeColor()}`}>
                  {currentUser?.role}
                </span>
                <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  {currentUser?.status}
                </span>
                {currentUser?.approvedAt && (
                  <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {t('Since', 'से')} {new Date(currentUser.approvedAt).toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 animate-fade-in">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">{t('Profile updated successfully!', 'प्रोफ़ाइल सफलतापूर्वक अपडेट किया गया!')}</p>
              <p className="text-sm text-emerald-600 mt-0.5">{t('Your changes have been saved.', 'आपके परिवर्तन सहेजे गए हैं।')}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              {t('Personal Information', 'व्यक्तिगत जानकारी')}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {t('Update your account details below', 'नीचे अपने खाते का विवरण अपडेट करें')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Basic Information Section */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4 text-[#062E6F]" />
                {t('Basic Information', 'बुनियादी जानकारी')}
              </h4>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('Full Name', 'पूरा नाम')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    placeholder={t('Enter your full name', 'अपना पूरा नाम दर्ज करें')}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('Email Address', 'ईमेल पता')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-0.5">
                  {t('Used for login and notifications', 'लॉगिन और सूचनाओं के लिए उपयोग किया गया')}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('Phone Number', 'फ़ोन नंबर')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details - Doctors Only */}
            {isDoctor && (
              <>
                <div className="border-t border-slate-200 pt-6"></div>
                <div className="space-y-5">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#062E6F]" />
                    {t('Professional Details', 'पेशेवर विवरण')}
                  </h4>

                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('Specialization', 'विशेषज्ञता')}
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        placeholder={t('e.g., Homeopathic Physician', 'जैसे, होम्योपैथिक चिकित्सक')}
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('Experience', 'अनुभव')}
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        placeholder={t('e.g., 10 years', 'जैसे, 10 साल')}
                      />
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('Qualifications', 'योग्यताएं')}
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <textarea
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleChange}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        placeholder={t('e.g., BHMS, MD (Hom)', 'जैसे, बीएचएमएस, एमडी (होम)')}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="border-t border-slate-200 pt-6 flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('Cancel', 'रद्द करें')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-3 bg-[#062E6F] hover:bg-[#042050] text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('Saving...', 'सेव हो रहा है...')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t('Save Changes', 'परिवर्तन सहेजें')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">{t('Account Security', 'खाता सुरक्षा')}</p>
              <p className="text-blue-700 mt-1">
                {t('Your role and approval status can only be changed by an administrator. Contact support if you need assistance.', 'आपकी भूमिका और अनुमोदन स्थिति केवल व्यवस्थापक द्वारा बदली जा सकती है। यदि आपको सहायता की आवश्यकता है तो सहायता से संपर्क करें।')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
