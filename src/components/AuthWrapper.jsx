import React, { useState, useEffect } from 'react';
import { Languages, Activity } from 'lucide-react';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import ConsentModal from './ConsentModal';
import { ToastContainer, useToast } from './Toast';
import { authService } from '../services/authService';
import logoImg from '../assets/logo.png';

export default function AuthWrapper({ onAuthSuccess, lang, onLanguageChange, onViewWebsite }) {
  const [currentView, setCurrentView] = useState('login');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toasts, showToast, closeToast } = useToast();

  const t = (en, hi) => lang === 'en' ? en : hi;

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // localStorage is only UI state. Verify the httpOnly session cookie
          // before mounting the dashboard, especially after a deploy or login
          // secret rotation has invalidated an older browser session.
          const profile = await authService.getProfile();
          const user = profile.user;
          if (user && user.status === 'Approved') {
            localStorage.setItem('homeo_user', JSON.stringify(user));
            onAuthSuccess(user);
            return;
          } else if (user && user.status === 'Pending') {
            setCurrentView('pending');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('homeo_user');
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [onAuthSuccess]);

  const handleLoginSuccess = (user) => {
    onAuthSuccess(user);
  };

  const handleRegistrationSuccess = () => {
    // Show consent modal before the pending screen
    setCurrentView('consent');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] grain flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#062E6F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">{t('Checking authentication...', 'प्रमाणीकरण जांच रहे हैं...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0] grain">
      
      {/* Website Banner - Top of page */}
      <div className="bg-[#062E6F] text-white py-3 px-4 text-center border-b border-white/10">
        <p className="text-sm font-primary-regular">
          👋 <span className="font-primary-semibold">New here?</span> Learn about our clinic and services{' '}
          <button 
            onClick={onViewWebsite}
            className="inline-flex items-center gap-1 text-[#C86B5E] hover:text-[#E89B8F] font-primary-bold underline transition-colors cursor-pointer"
          >
            → Visit Website
          </button>
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      
      {/* Main Floating Container */}
      <div className="w-full max-w-6xl xl:max-w-7xl flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden shadow-2xl relative">
        
        {/* Left Side: Logo Container */}
        <div className="hidden md:flex md:w-1/2 relative bg-[#062E6F] overflow-hidden flex-col justify-center items-center p-10 min-h-[600px] py-12">
          
          {/* Rich Brand Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#062E6F] via-[#062E6F]/95 to-[#00A3B4]/70"></div>
          
          {/* Logo Positioned at Top - Clickable */}
          <button 
            onClick={onViewWebsite}
            className="relative z-10 w-full flex justify-center mb-6 group cursor-pointer"
            title={lang === 'en' ? "Visit our website" : "हमारी वेबसाइट पर जाएं"}
          >
            <img 
              src={logoImg} 
              alt="Logo" 
              className="h-28 md:h-36 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300" 
            />
          </button>
          
          {/* Text at Center */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-6 text-white">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold tracking-wider uppercase text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#4BB543] animate-pulse shadow-[0_0_8px_#4BB543]"></span>
              {lang === 'en' ? 'AI-Powered Homeopathy Care' : 'एआई-संचालित होम्योपैथी सेवा'}
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-lg">
              {lang === 'en' ? 'Modern Repertory & Clinical Management' : 'आधुनिक रिपर्टरी एवं नैदानिक ​​प्रबंधन'}
            </h1>
            
            <p className="text-sm text-slate-100 leading-relaxed font-light font-sans drop-shadow-md">
              {lang === 'en'
                ? 'Welcome to HOMEO A.I. Empowering clinical teams, consultant doctors, and patients with intelligent repertorization and comprehensive case management.'
                : 'होमियो ए.आई. में आपका स्वागत है। नैदानिक ​​टीमों, सलाहकार डॉक्टरों और रोगियों को बुद्धिमान रिपर्टराइजेशन और व्यापक केस प्रबंधन के साथ सशक्त बनाना।'}
            </p>
          </div>
        </div>

      {/* Right Side: Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden bg-white w-full md:w-1/2">
        
        {/* Background aura decoration */}
        <div className="absolute w-[300px] h-[300px] bg-[#062E6F]/5 rounded-full blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Language Toggle - Top Right */}
        <button
          onClick={onLanguageChange}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-[10px] sm:text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm z-20"
          title={lang === 'en' ? "Switch to Hindi" : "अंग्रेजी में बदलें"}
        >
          <Languages className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#062E6F]" />
          <span className="whitespace-nowrap">{lang === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>

        {/* Content container (Login forms) */}
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {currentView === 'login' && (
            <LoginForm 
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentView('register')}
              lang={lang}
              showToast={showToast}
            />
          )}

          {currentView === 'register' && (
            <RegistrationForm
              onBackToLogin={() => setCurrentView('login')}
              onRegistrationSuccess={handleRegistrationSuccess}
              lang={lang}
              showToast={showToast}
            />
          )}

          {/* Consent modal — sits outside the card, full-screen overlay */}
          {currentView === 'consent' && (
            <ConsentModal
              lang={lang}
              onAccept={() => setCurrentView('pending')}
              onDecline={() => setCurrentView('register')}
            />
          )}

          {currentView === 'pending' && (
            <div className="text-center space-y-6">
              {/* Logo */}
              <div className="flex items-center justify-center mb-6">
                <img src={logoImg} alt="Homeo AI Logo" className="h-16 object-contain drop-shadow-md" />
              </div>

              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-slate-800">
                  {t('Registration Submitted', 'पंजीकरण जमा किया गया')}
                </h1>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t(
                    'Thank you for registering with HOMEO A.I. Your account is currently under review by our administration team. You will receive a notification once your account has been approved.',
                    'होमियो ए.आई. के साथ पंजीकरण के लिए धन्यवाद। आपका खाता वर्तमान में हमारी प्रशासन टीम द्वारा समीक्षा के अधीन है। आपके खाते के अनुमोदित होने पर आपको एक सूचना मिलेगी।'
                  )}
                </p>
              </div>

              {/* Status Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <h3 className="font-semibold text-amber-800 text-sm mb-2">
                  {t('What happens next?', 'आगे क्या होता है?')}
                </h3>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• {t('Admin reviews your credentials', 'एडमिन आपकी साख की समीक्षा करता है')}</li>
                  <li>• {t('Account approval within 24-48 hours', '24-48 घंटों के भीतर खाता अनुमोदन')}</li>
                  <li>• {t('Email notification upon approval', 'अनुमोदन पर ईमेल सूचना')}</li>
                  <li>• {t('Full access to HOMEO A.I dashboard', 'होमियो ए.आई. डैशबोर्ड तक पूरी पहुंच')}</li>
                </ul>
              </div>

              <button
                onClick={() => setCurrentView('login')}
                className="w-full border border-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {t('Back to Login', 'लॉगिन पर वापस जाएं')}
              </button>
            </div>
          )}

        </div>
      </div>
      </div>
      {/* End of Main Floating Container */}

      </div>
      {/* End of flex-1 container */}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
