import React, { useState } from 'react';
import {
  ShieldCheck, User, HeartPulse, FileText, Lock,
  ChevronRight, X, Eye, AlertTriangle, CheckCircle2, Info
} from 'lucide-react';

export default function ConsentModal({ lang = 'en', onAccept, onDecline }) {
  const [agreed, setAgreed] = useState(false);
  const [showDeclineWarning, setShowDeclineWarning] = useState(false);
  const t = (en, hi) => lang === 'en' ? en : hi;

  const handleDecline = () => {
    setShowDeclineWarning(true);
  };

  const confirmDecline = () => {
    setShowDeclineWarning(false);
    onDecline();
  };

  const cancelDecline = () => {
    setShowDeclineWarning(false);
  };

  const dataCategories = [
    {
      icon: <User className="h-5 w-5" />,
      color: 'blue',
      title: t('Personal Identity', 'व्यक्तिगत पहचान'),
      titleHi: 'व्यक्तिगत पहचान',
      desc: t(
        'Name, age, gender, and body weight — used to personalise your clinical profile.',
        'नाम, उम्र, लिंग और शरीर का वजन — आपके नैदानिक ​​प्रोफ़ाइल को व्यक्तिगत बनाने के लिए उपयोग किया जाता है।'
      ),
      tags: [t('Name', 'नाम'), t('Age', 'उम्र'), t('Gender', 'लिंग'), t('Weight', 'वजन')],
    },
    {
      icon: <HeartPulse className="h-5 w-5" />,
      color: 'rose',
      title: t('Health & Symptoms', 'स्वास्थ्य और लक्षण'),
      desc: t(
        'Symptom descriptions, duration, and severity — shared only with your assigned doctor for consultation and homeopathic analysis.',
        'लक्षणों का विवरण, अवधि और गंभीरता — केवल आपके नियुक्त डॉक्टर के साथ परामर्श और होम्योपैथिक विश्लेषण के लिए साझा किया जाता है।'
      ),
      tags: [t('Symptoms', 'लक्षण'), t('Duration', 'अवधि'), t('Severity', 'गंभीरता')],
    },
    {
      icon: <FileText className="h-5 w-5" />,
      color: 'amber',
      title: t('Uploaded Documents', 'अपलोड किए गए दस्तावेज़'),
      desc: t(
        'Medical reports or photos you optionally attach — stored securely and accessible only to your assigned doctor.',
        'चिकित्सा रिपोर्ट या फ़ोटो जो आप वैकल्पिक रूप से संलग्न करते हैं — सुरक्षित रूप से संग्रहीत और केवल आपके नियुक्त डॉक्टर के लिए सुलभ।'
      ),
      tags: [t('Reports', 'रिपोर्ट'), t('Photos', 'फ़ोटो'), t('Optional', 'वैकल्पिक')],
    },
    {
      icon: <Eye className="h-5 w-5" />,
      color: 'indigo',
      title: t('AI Analysis Context', 'एआई विश्लेषण संदर्भ'),
      desc: t(
        'Your anonymised symptom data may be used to assist AI-driven repertory analysis within the platform. No personally identifiable data leaves the system.',
        'आपका गुमनाम लक्षण डेटा प्लेटफ़ॉर्म के भीतर एआई-संचालित रिपर्टरी विश्लेषण में सहायता के लिए उपयोग किया जा सकता है। व्यक्तिगत रूप से पहचाने जाने योग्य कोई डेटा सिस्टम से बाहर नहीं जाता।'
      ),
      tags: ['AI Analysis', t('Anonymised', 'गुमनाम'), t('In-platform only', 'केवल प्लेटफ़ॉर्म पर')],
    },
  ];

  const colorMap = {
    blue:   { bg: 'bg-white',   border: 'border-slate-200',   icon: 'bg-slate-100 text-slate-700',   tag: 'bg-slate-100 text-slate-700' },
    rose:   { bg: 'bg-white',   border: 'border-slate-200',   icon: 'bg-slate-100 text-slate-700',   tag: 'bg-slate-100 text-slate-700' },
    amber:  { bg: 'bg-white',  border: 'border-slate-200',  icon: 'bg-slate-100 text-slate-700', tag: 'bg-slate-100 text-slate-700' },
    indigo: { bg: 'bg-white', border: 'border-slate-200', icon: 'bg-slate-100 text-slate-700',tag: 'bg-slate-100 text-slate-700'},
  };

  return (
    /* Full-screen overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden animate-in slide-in-from-bottom-6 duration-400 border border-slate-200">

        {/* ── Header ─────────────────────────────── */}
        <div className="relative bg-white px-5 py-6 sm:px-8 sm:py-7 border-b border-slate-200 shrink-0 rounded-t-2xl">
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-2.5 bg-slate-100 rounded-xl shrink-0">
              <ShieldCheck className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                {t('Informed Consent', 'सूचित सहमति')}
              </p>
              <h2 className="text-lg sm:text-xl font-bold leading-snug text-slate-900">
                {t('Your Privacy, Our Priority', 'आपकी गोपनीयता, हमारी प्राथमिकता')}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {t(
                  'Please read what information we collect and how it is used before completing your registration.',
                  'पंजीकरण पूरा करने से पहले कृपया पढ़ें कि हम कौन सी जानकारी एकत्र करते हैं और इसका उपयोग कैसे किया जाता है।'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 space-y-4 bg-slate-50" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* Section label */}
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {t('Information we collect', 'हम जो जानकारी एकत्र करते हैं')}
          </p>

          {/* Data category cards */}
          <div className="space-y-3">
            {dataCategories.map((cat, i) => {
              const c = colorMap[cat.color];
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 ${c.bg} ${c.border} transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${c.icon}`}>
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 mb-0.5">{cat.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">{cat.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.tags.map((tag, ti) => (
                          <span key={ti} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.tag}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* What we DON'T do */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                <Lock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800 mb-1">
                  {t('What we never do', 'हम कभी नहीं करते')}
                </p>
                <ul className="space-y-1">
                  {[
                    t('Sell your data to third parties', 'तीसरे पक्ष को आपका डेटा नहीं बेचते'),
                    t('Share your identity with insurance companies', 'बीमा कंपनियों के साथ आपकी पहचान साझा नहीं करते'),
                    t('Use your data for advertising', 'विज्ञापन के लिए आपके डेटा का उपयोग नहीं करते'),
                    t('Store payment information', 'भुगतान जानकारी संग्रहीत नहीं करते'),
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {t(
                'Your data is stored securely within HOMEO A.I. and shared exclusively with your chosen doctor for the purpose of homeopathic consultation. You may request deletion of your data at any time by contacting us.',
                'आपका डेटा HOMEO A.I. के भीतर सुरक्षित रूप से संग्रहीत है और होम्योपैथिक परामर्श के उद्देश्य से केवल आपके चुने हुए डॉक्टर के साथ साझा किया जाता है। आप हमसे संपर्क करके किसी भी समय अपने डेटा को हटाने का अनुरोध कर सकते हैं।'
              )}
            </p>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────── */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-8 sm:py-5 bg-white rounded-b-2xl space-y-4">

          {/* Agreement checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:border-[#062E6F] peer-checked:bg-[#062E6F] transition-all flex items-center justify-center">
                {agreed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </div>
            </div>
            <span className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
              {t(
                'I have read and understood how HOMEO A.I. collects and uses my information. I voluntarily consent to proceed.',
                'मैंने पढ़ और समझ लिया है कि HOMEO A.I. मेरी जानकारी कैसे एकत्र और उपयोग करता है। मैं स्वेच्छा से आगे बढ़ने के लिए सहमत हूं।'
              )}
            </span>
          </label>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDecline}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors min-h-[44px]"
            >
              {t('Decline', 'अस्वीकार करें')}
            </button>
            <button
              type="button"
              onClick={onAccept}
              disabled={!agreed}
              className="flex-1 py-2.5 bg-[#062E6F] text-white text-xs font-bold rounded-xl hover:bg-[#042050] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-sm"
            >
              {t('I Agree & Continue', 'सहमत हूं और जारी रखें')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
