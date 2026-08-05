import React from 'react';
import { Check } from 'lucide-react';

/**
 * PersistentNumberPicker - Always-visible sidebar number picker
 * Shared across all numeric fields in the prescription form
 * 
 * @param {string} activeField - Currently active field name (e.g., "days", "quantity")
 * @param {string} label - Display label (e.g., "Days", "Quantity")
 * @param {string} unit - Unit label (e.g., "days", "pills")
 * @param {number} currentValue - Currently selected value
 * @param {function} onSelect - Called when a number is selected
 * @param {string} lang - Language ('en' or 'hi')
 */
export default function PersistentNumberPicker({
  activeField = null,
  label = '',
  unit = '',
  currentValue = 0,
  onSelect,
  lang = 'en'
}) {
  const t = (en, hi) => lang === 'hi' ? hi : en;

  const handleNumberClick = (num) => {
    if (onSelect) {
      onSelect(num);
    }
  };

  // UNIVERSAL RANGE: 1-21 (covers all use cases)
  const numbers = [];
  for (let i = 1; i <= 21; i++) {
    numbers.push(i);
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 border-l-2 border-slate-200 flex flex-col">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#062E6F]/10 flex items-center justify-center">
            <span className="text-xl">🔢</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {t('Number Picker', 'नंबर चयनकर्ता')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('Tap to select', 'चुनने के लिए टैप करें')}
            </p>
          </div>
        </div>

        {/* Active Field Display */}
        {activeField ? (
          <div className="bg-gradient-to-r from-[#062E6F]/10 to-blue-50 rounded-lg p-3 border border-[#062E6F]/20">
            <p className="text-xs text-slate-600 mb-1">
              {t('Selecting for', 'चयन कर रहे हैं')}
            </p>
            <p className="text-sm font-bold text-[#062E6F]">{label}</p>
          </div>
        ) : (
          <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              {t('Click a field to select number', 'नंबर चुनने के लिए फ़ील्ड पर क्लिक करें')}
            </p>
          </div>
        )}
      </div>

      {/* Current Selection Display */}
      {activeField && (
        <div className="px-5 py-4 bg-white border-b border-slate-200">
          <p className="text-xs text-slate-600 mb-2">{t('Current Value', 'वर्तमान मान')}</p>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#062E6F] to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold text-white">
                {currentValue}
              </span>
            </div>
            {unit && (
              <div className="text-sm font-semibold text-slate-700">
                {unit}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Number Grid - UNIVERSAL 0-30 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 gap-2">
          {numbers.map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              disabled={!activeField}
              className={`
                h-11 rounded-lg text-sm font-bold border-2 transition-all
                ${!activeField 
                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                  : currentValue === num
                    ? 'bg-[#062E6F] text-white border-[#062E6F] shadow-md scale-105'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-[#062E6F] hover:bg-blue-50 hover:scale-105'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Helper Text */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-start gap-2 text-xs text-slate-500">
          <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
          <p>
            {t(
              'Click any number above to instantly update the selected field',
              'चयनित फ़ील्ड को तुरंत अपडेट करने के लिए ऊपर किसी भी नंबर पर क्लिक करें'
            )}
          </p>
        </div>
      </div>

    </div>
  );
}

