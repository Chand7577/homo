import React, { useState, useEffect } from 'react';
import { User, Phone, Briefcase, Award, GraduationCap, Save, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { updateProfile } from '../services/api';

export default function ProfileSettings({ currentUser, onProfileUpdate, onClose, lang = 'en' }) {
  const t = (en, hi) => lang === 'en' ? en : hi;

  const [formData, setFormData] = useState({
    name: '',
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

    if (!formData.phone.trim()) {
      setError(t('Phone number is required', 'फ़ोन नंबर आवश्यक है'));
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

      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || t('Failed to update profile', 'प्रोफ़ाइल अपडेट करने में विफल'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDoctor = currentUser?.role !== 'Patient';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#062E6F] to-[#042050] text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{t('Profile Settings', 'प्रोफ़ाइल सेटिंग्स')}</h2>
            <p className="text-sm text-blue-100 mt-1">{t('Update your personal information', 'अपनी व्यक्तिगत जानकारी अपडेट करें')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold">{t('Profile updated successfully!', 'प्रोफ़ाइल सफलतापूर्वक अपडेट किया गया!')}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Role (Read-only) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t('Account Type', 'खाता प्रकार')}
            </label>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                currentUser?.role === 'Admin' ? 'bg-amber-100 text-amber-800' :
                currentUser?.role === 'Core Team' ? 'bg-blue-100 text-blue-800' :
                currentUser?.role === 'External Doctor' ? 'bg-slate-200 text-slate-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {currentUser?.role}
              </span>
              <span className="text-xs text-slate-400">{t('(Cannot be changed)', '(बदला नहीं जा सकता)')}</span>
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {t('Email Address', 'ईमेल पता')} <span className="text-slate-400 font-normal">({t('Cannot be changed', 'बदला नहीं जा सकता')})</span>
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              <User className="h-3.5 w-3.5 inline mr-1" />
              {t('Full Name', 'पूरा नाम')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder={t('Enter your full name', 'अपना पूरा नाम दर्ज करें')}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              <Phone className="h-3.5 w-3.5 inline mr-1" />
              {t('Phone Number', 'फ़ोन नंबर')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Doctor-specific fields */}
          {isDoctor && (
            <>
              {/* Specialization */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  <Briefcase className="h-3.5 w-3.5 inline mr-1" />
                  {t('Specialization', 'विशेषज्ञता')}
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  placeholder={t('e.g., Homeopathic Physician', 'जैसे, होम्योपैथिक चिकित्सक')}
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  <Award className="h-3.5 w-3.5 inline mr-1" />
                  {t('Experience', 'अनुभव')}
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  placeholder={t('e.g., 10 years', 'जैसे, 10 साल')}
                />
              </div>

              {/* Qualifications */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  <GraduationCap className="h-3.5 w-3.5 inline mr-1" />
                  {t('Qualifications', 'योग्यताएं')}
                </label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows={3}
                  className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  placeholder={t('e.g., BHMS, MD (Hom)', 'जैसे, बीएचएमएस, एमडी (होम)')}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('Cancel', 'रद्द करें')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#062E6F] hover:bg-[#042050] text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  );
}
