import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Activity, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { authService } from '../services/authService';
import logoImg from '../assets/logo.png';

export default function LoginForm({ onLoginSuccess, onSwitchToRegister, lang = 'en', showToast }) {
  const t = (en, hi) => lang === 'en' ? en : hi;

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showToast(t('Please fill in all fields', 'सभी फ़ील्ड भरें'), 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);

      if (response.success) {
        showToast(response.message || t('Login successful!', 'लॉगिन सफल!'), 'success');
        // Edge/Safari need even more time for localStorage to be committed
        setTimeout(() => onLoginSuccess(response.user), 1500);
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage;

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = t(
          'Server timed out while starting up. Please click Sign In again.',
          'सर्वर स्टार्ट होने में समय लगा। कृपया पुनः साइन इन पर क्लिक करें।'
        );
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (!error.response) {
        errorMessage = t(
          'Network error. Please check your internet connection and try again.',
          'नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।'
        );
      } else {
        errorMessage = t('Login failed. Please try again.', 'लॉगिन विफल। कृपया पुनः प्रयास करें।');
      }

      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      admin: { email: 'admin@gmail.com', password: 'admin' },
      core: { email: 'doctor@gmail.com', password: '123456' },
      external: { email: 'external@demo.com', password: '123456' },
      patient: { email: 'patient@gmail.com', password: '123456' }
    };

    const creds = demoCredentials[role];
    if (creds) {
      setFormData(creds);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-2">
          <img src={logoImg} alt="Homeo AI Logo" className="h-20 object-contain drop-shadow-md" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {t('Welcome Back', 'वापस स्वागत है')}
        </h1>
        <p className="text-slate-600 text-sm">
          {t('Sign in to access your HOMEO A.I dashboard', 'अपने होमियो A.I डैशबोर्ड में साइन इन करें')}
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {t('Email Address', 'ईमेल पता')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('Enter your email', 'अपना ईमेल दर्ज करें')}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-colors"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {t('Password', 'पासवर्ड')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('Enter your password', 'अपना पासवर्ड दर्ज करें')}
              className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-colors"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#062E6F] hover:bg-[#042050] text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {t('Sign In', 'साइन इन करें')}
        </button>
      </form>

      {/* Demo Login Section */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">
          {t('Quick Demo Access', 'त्वरित डेमो एक्सेस')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="text-xs px-3 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors min-h-[44px]"
            disabled={isLoading}
          >
            {t('Dr JP Admin', 'डॉ जेपी एडमिन')}
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('core')}
            className="text-xs px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
            disabled={isLoading}
          >
            {t('Core Team', 'मुख्य टीम')}
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('external')}
            className="text-xs px-3 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px]"
            disabled={isLoading}
          >
            {t('External Dr', 'बाहरी डॉक्टर')}
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('patient')}
            className="text-xs px-3 py-2.5 bg-[#062E6F] text-white rounded-lg hover:bg-[#042050] transition-colors min-h-[44px]"
            disabled={isLoading}
          >
            {t('Patient', 'मरीज़')}
          </button>
        </div>
      </div>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          {t("Don't have an account?", 'खाता नहीं है?')}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#062E6F] hover:text-[#042050] font-semibold transition-colors"
          >
            {t('Register Now', 'अभी रजिस्टर करें')}
          </button>
        </p>
      </div>
    </div>
  );
}