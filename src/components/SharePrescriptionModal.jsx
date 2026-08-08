import React, { useState } from 'react';
import { X, Share2, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { sharePrescriptionViaChat } from '../services/api';

export default function SharePrescriptionModal({ prescription, onClose, lang = 'en' }) {
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');

  const isEn = lang === 'en';
  const t = (en, hi) => isEn ? en : hi;

  if (!prescription) return null;

  // Format WhatsApp message
  const formatWhatsAppMessage = () => {
    const doctorName = prescription.doctorName || "Dr. Nautiyal";
    const clinicName = prescription.doctorClinic || "Nautiyal Homeopathic Clinic";
    
    // Format medicines with full details
    let medicinesText = '';
    if (prescription.medicines && prescription.medicines.length > 0) {
      medicinesText = prescription.medicines.map((m, idx) => {
        const pot = m.type === 'mother_tincture' ? 'Q' : (m.potency || '');
        const form = m.form === 'drops' ? t('Drops', 'बूँदें') : t('Pills', 'गोलियाँ');
        const freq = m.frequency || 'BD';
        const meal = m.meal === 'BM' ? t('Before Meal', 'भोजन से पहले') : t('After Meal', 'भोजन के बाद');
        const water = m.water ? ` (${m.water} ${t('cup water', 'कप पानी')})` : '';
        const teaspoons = m.teaspoons ? ` (${m.teaspoons})` : '';
        const remarks = m.remarks ? `\n   ${t('Note', 'नोट')}: ${m.remarks}` : '';
        
        return `${idx + 1}. ${m.name} ${pot}\n   ${t('Dosage', 'खुराक')}: ${m.quantity} ${form}, ${freq} ${t('times daily', 'बार प्रतिदिन')}\n   ${t('Timing', 'समय')}: ${meal}${water}${teaspoons}${remarks}`;
      }).join('\n\n');
    } else {
      medicinesText = prescription.remedy || t('As prescribed', 'निर्धारित अनुसार');
    }

    // Build comprehensive message
    let message = `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🏥 *${t('PRESCRIPTION', 'प्रिस्क्रिप्शन')}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Doctor Details
    message += `👨‍⚕️ *${t('Doctor', 'डॉक्टर')}:* ${doctorName}\n`;
    message += `🏥 *${t('Clinic', 'क्लिनिक')}:* ${clinicName}\n`;
    if (prescription.doctorContact) {
      message += `📞 ${prescription.doctorContact}\n`;
    }
    message += `\n`;
    
    // Patient Details
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 *${t('PATIENT INFORMATION', 'मरीज़ की जानकारी')}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `${t('Name', 'नाम')}: *${prescription.patientName}*\n`;
    if (prescription.patientAge) {
      message += `${t('Age', 'उम्र')}: ${prescription.patientAge} ${t('years', 'वर्ष')}\n`;
    }
    if (prescription.patientGender) {
      message += `${t('Gender', 'लिंग')}: ${prescription.patientGender}\n`;
    }
    if (prescription.patientWeight) {
      message += `${t('Weight', 'वज़न')}: ${prescription.patientWeight}\n`;
    }
    message += `📅 ${t('Date', 'तिथि')}: ${new Date(prescription.prescribedAt || prescription.createdAt).toLocaleDateString()}\n`;
    message += `\n`;
    
    // Medicines
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💊 *${t('MEDICINES PRESCRIBED', 'निर्धारित दवाएं')}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `${medicinesText}\n\n`;
    
    // Duration
    if (prescription.duration) {
      message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `⏱️ *${t('DURATION', 'अवधि')}*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      message += `${prescription.duration}\n\n`;
    }
    
    // Instructions
    if (prescription.instructions) {
      message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📋 *${t('INSTRUCTIONS', 'निर्देश')}*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      message += `${prescription.instructions}\n\n`;
    }
    
    // Follow-up
    if (prescription.followUpDate) {
      message += `📅 *${t('Follow-up Date', 'अगली मुलाकात')}:* ${new Date(prescription.followUpDate).toLocaleDateString()}\n\n`;
    }
    
    // Notes
    if (prescription.notes) {
      message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📝 *${t('ADDITIONAL NOTES', 'अतिरिक्त नोट्स')}*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      message += `${prescription.notes}\n\n`;
    }
    
    // Footer
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `${t('Please follow the prescribed dosage and timings strictly.', 'कृपया निर्धारित खुराक और समय का सख्ती से पालन करें।')}\n`;
    message += `${t('Contact the clinic for any queries.', 'किसी भी प्रश्न के लिए क्लिनिक से संपर्क करें।')}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `✨ ${t('Wishing you a speedy recovery!', 'जल्द स्वस्थ होने की शुभकामनाएं!')}\n`;
    message += `🙏 ${doctorName}`;

    return encodeURIComponent(message);
  };

  // Share via WhatsApp
  const handleWhatsAppShare = () => {
    const message = formatWhatsAppMessage();
    const phone = prescription.patientContact?.replace(/[^\d]/g, '') || '';
    
    // WhatsApp deep link
    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // Share via in-app chat
  const handleChatShare = async () => {
    setSharing(true);
    try {
      await sharePrescriptionViaChat({
        prescriptionId: prescription._id,
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        prescriptionData: {
          patientName: prescription.patientName,
          doctorName: prescription.doctorName,
          medicines: prescription.medicines,
          remedy: prescription.remedy,
          duration: prescription.duration,
          prescribedAt: prescription.prescribedAt,
          createdAt: prescription.createdAt
        }
      });
      
      setShareSuccess(t('Sent to patient chat', 'मरीज़ की चैट में भेजा गया'));
      setTimeout(() => {
        setShareSuccess('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to share via chat:', err);
      alert(t('Failed to send via chat', 'चैट के माध्यम से भेजने में विफल'));
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white md:rounded-xl shadow-2xl md:max-w-md w-full h-full md:h-auto overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {t('Share Prescription', 'पर्चा साझा करें')}
              </h3>
              <p className="text-xs text-slate-500">
                {prescription.patientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Message */}
        {shareSuccess && (
          <div className="mx-6 mt-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {shareSuccess}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Prescription Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t('Patient', 'मरीज़')}</span>
              <span className="font-semibold text-slate-800">{prescription.patientName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t('Medicine', 'दवा')}</span>
              <span className="font-semibold text-slate-800">
                {prescription.medicines?.[0]?.name || prescription.remedy?.split(',')[0] || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t('Date', 'तिथि')}</span>
              <span className="font-semibold text-slate-800">
                {new Date(prescription.prescribedAt || prescription.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* In-App Chat */}
            <button
              onClick={handleChatShare}
              disabled={sharing || !prescription.patientId}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                prescription.patientId
                  ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800 text-sm">
                  {t('Share via In-App Chat', 'इन-ऐप चैट से साझा करें')}
                </p>
                <p className="text-xs text-slate-500">
                  {prescription.patientId 
                    ? t('Send to patient\'s inbox', 'मरीज़ के इनबॉक्स में भेजें')
                    : t('Patient not registered', 'मरीज़ पंजीकृत नहीं है')}
                </p>
              </div>
              {sharing && <Send className="h-5 w-5 text-blue-600 animate-pulse" />}
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800 text-sm">
                  {t('Share via WhatsApp', 'व्हाट्सऐप से साझा करें')}
                </p>
                <p className="text-xs text-slate-500">
                  {prescription.patientContact || t('Send message', 'संदेश भेजें')}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 mt-auto shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100"
          >
            {t('Cancel', 'रद्द करें')}
          </button>
        </div>
      </div>
    </div>
  );
}
