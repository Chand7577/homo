import React, { useState } from 'react';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, UserCheck, 
  Stethoscope, AlertCircle, CheckCircle, ArrowLeft, ChevronDown
} from 'lucide-react';
import { authService } from '../services/authService';

export default function RegistrationForm({ onBackToLogin, onRegistrationSuccess, lang = 'en', showToast }) {
  const t = (en, hi) => lang === 'en' ? en : hi;
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    confirmPassword: '', role: 'External Doctor',
    specialization: '', experience: '', qualifications: '',
    registrationNumber: '' // For doctors only - admin verification
  });
  
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOptional, setShowOptional]               = useState(false);
  const [isLoading, setIsLoading]                     = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const { name, email, phone, password, confirmPassword, role, registrationNumber } = formData;
    if (!name || !email || !phone || !password || !confirmPassword || !role)
      return showToast(t('⚠️ Please fill in all required fields to continue', '⚠️ जारी रखने के लिए कृपया सभी आवश्यक फ़ील्ड भरें'), 'error'), false;
    
    // Validate registration number for doctors (Core Team and External Doctor)
    if ((role === 'Core Team' || role === 'External Doctor') && !registrationNumber?.trim()) {
      return showToast(t('🩺 Registration number is required for doctor accounts', '🩺 डॉक्टर खातों के लिए पंजीकरण संख्या आवश्यक है'), 'error'), false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showToast(t('📧 Please enter a valid email address (e.g., name@example.com)', '📧 कृपया एक वैध ईमेल पता दर्ज करें (जैसे, name@example.com)'), 'error'), false;
    if (password.length < 8)
      return showToast(t('🔒 Password must be at least 8 characters long for security', '🔒 सुरक्षा के लिए पासवर्ड कम से कम 8 अक्षर लंबा होना चाहिए'), 'error'), false;
    if (password !== confirmPassword)
      return showToast(t('🔐 Passwords don\'t match. Please make sure both passwords are identical.', '🔐 पासवर्ड मेल नहीं खाते। कृपया सुनिश्चित करें कि दोनों पासवर्ड समान हैं।'), 'error'), false;
    if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone))
      return showToast(t('📱 Please enter a valid phone number (10+ digits)', '📱 कृपया एक वैध फोन नंबर दर्ज करें (10+ अंक)'), 'error'), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await authService.register(submitData);
      if (response.success) {
        // Use the friendly message from backend
        showToast(response.message, 'success', 6000);
        setTimeout(() => onRegistrationSuccess(), 1500);
      } else {
        showToast(response.message || t('Registration failed. Please try again.', 'पंजीकरण विफल। कृपया पुनः प्रयास करें।'), 'error');
      }
    } catch (err) {
      // Use backend error message directly - it's already friendly!
      const errorMsg = err.response?.data?.message || t(
        '❌ Registration failed. Please check your details and try again.',
        '❌ पंजीकरण विफल। कृपया अपना विवरण जांचें और पुनः प्रयास करें।'
      );
      showToast(errorMsg, 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 focus:border-[#062E6F] transition-colors bg-white";
  const iconCls  = "absolute left-2.5 top-2.5 h-4 w-4 text-slate-400";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="w-full">
      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBackToLogin} className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#062E6F] rounded-lg">
            <UserCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">
              {t('Join HOMEO A.I', 'होमियो A.I में शामिल हों')}
            </h1>
            <p className="text-[11px] text-slate-500">
              {t('Create your account — admin approval required', 'खाता बनाएं — व्यवस्थापक अनुमोदन आवश्यक')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Row 1: Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('Full Name', 'पूरा नाम')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className={iconCls} />
              <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                placeholder={formData.role === 'Patient' ? t('Your Full Name', 'आपका पूरा नाम') : t('Dr. Your Name', 'डॉ. आपका नाम')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('Phone', 'फोन')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Phone className={iconCls} />
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                placeholder="+91 98765 43210" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Row 2: Email + Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('Email', 'ईमेल')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className={iconCls} />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                placeholder="email@example.com" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('Role', 'भूमिका')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <UserCheck className={iconCls} />
              <select name="role" value={formData.role} onChange={handleInputChange}
                className={`${inputCls} appearance-none pr-7 cursor-pointer`}>
                <option value="Core Team">{t('Core Team', 'मुख्य टीम')}</option>
                <option value="External Doctor">{t('External Doctor', 'बाहरी डॉक्टर')}</option>
                <option value="Patient">{t('Patient', 'मरीज़')}</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Registration Number - Only for Doctors */}
        {(formData.role === 'Core Team' || formData.role === 'External Doctor') && (
          <div>
            <label className={labelCls}>
              {t('Registration Number', 'पंजीकरण संख्या')} 
              <span className="text-red-500">*</span>
              <span className="text-[10px] text-slate-400 font-normal ml-1">
                ({t('Required for verification', 'सत्यापन के लिए आवश्यक')})
              </span>
            </label>
            <div className="relative">
              <Stethoscope className={iconCls} />
              <input 
                type="text" 
                name="registrationNumber" 
                value={formData.registrationNumber} 
                onChange={handleInputChange}
                placeholder={t('e.g. MDS Reg-123 or MH-123', 'उदा. MDS Reg-123 या MH-123')} 
                className={inputCls}
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 ml-0.5">
              {t('Medical council registration number for admin verification', 'व्यवस्थापक सत्यापन के लिए चिकित्सा परिषद पंजीकरण संख्या')}
            </p>
          </div>
        )}

        {/* Row 3: Password + Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('Password', 'पासवर्ड')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Lock className={iconCls} />
              <input type={showPassword ? 'text' : 'password'} name="password"
                value={formData.password} onChange={handleInputChange}
                placeholder={t('Min 8 chars', 'न्यूनतम 8 अक्षर')} className={`${inputCls} pr-8`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>{t('Confirm Password', 'पासवर्ड पुष्टि')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Lock className={iconCls} />
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                value={formData.confirmPassword} onChange={handleInputChange}
                placeholder={t('Re-enter password', 'पासवर्ड दोबारा')} className={`${inputCls} pr-8`} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Optional Professional Details Toggle — doctors only */}
        {formData.role !== 'Patient' && (
          <>
            <button type="button" onClick={() => setShowOptional(!showOptional)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                {t('Professional Details', 'पेशेवर विवरण')} 
                <span className="text-slate-400 font-normal">({t('optional', 'वैकल्पिक')})</span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showOptional ? 'rotate-180' : ''}`} />
            </button>

            {showOptional && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                <div>
                  <label className={labelCls}>{t('Specialization', 'विशेषज्ञता')}</label>
                  <div className="relative">
                    <Stethoscope className={iconCls} />
                    <input type="text" name="specialization" value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder={t('e.g. Chronic Diseases', 'जैसे. पुरानी बीमारियां')} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t('Experience', 'अनुभव')}</label>
                  <div className="relative">
                    <UserCheck className={iconCls} />
                    <input type="text" name="experience" value={formData.experience}
                      onChange={handleInputChange}
                      placeholder={t('e.g. 10 years', 'जैसे. 10 साल')} className={inputCls} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>{t('Qualifications', 'योग्यताएं')}</label>
                  <input type="text" name="qualifications" value={formData.qualifications}
                    onChange={handleInputChange}
                    placeholder={t('e.g. BHMS, MD (Hom)', 'जैसे. BHMS, MD (Hom)')}
                    className={inputCls} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Submit */}
        <button type="submit" disabled={isLoading}
          className="w-full bg-[#062E6F] hover:bg-[#042050] text-white font-semibold py-2.5 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
          {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {t('Create Account', 'खाता बनाएं')}
        </button>

        {/* Inline note */}
        <p className="text-center text-[11px] text-slate-400">
          <AlertCircle className="inline h-3 w-3 mr-1 text-amber-400" />
          {t('Account requires admin approval before activation.', 'खाते को सक्रियण से पहले व्यवस्थापक अनुमोदन की आवश्यकता है।')}
        </p>
      </form>
    </div>
  );
}