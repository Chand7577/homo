import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

/* ── Individual Toast ─────────────────────────────────────────── */
function Toast({ id, type, message, onClose }) {
  const styles = {
    success: { bar: 'bg-emerald-500', icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, bg: 'bg-white border-emerald-200' },
    error:   { bar: 'bg-red-500',     icon: <XCircle     className="h-4 w-4 text-red-500"     />, bg: 'bg-white border-red-200'     },
    info:    { bar: 'bg-blue-500',    icon: <AlertCircle className="h-4 w-4 text-blue-500"    />, bg: 'bg-white border-blue-200'    },
  };
  const s = styles[type] || styles.info;

  return (
    <div
      className={`flex items-start gap-3 w-80 rounded-xl border shadow-lg p-3.5 pr-2 relative overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300 ${s.bg}`}
    >
      {/* colour bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${s.bar}`} />
      <div className="ml-2 shrink-0 mt-0.5">{s.icon}</div>
      <p className="flex-1 text-sm text-slate-700 font-medium leading-snug">{message}</p>
      <button onClick={() => onClose(id)} className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── Toast Container ──────────────────────────────────────────── */
export function ToastContainer({ toasts, onClose }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={onClose} />
      ))}
    </div>
  );
}

/* ── useToast hook ────────────────────────────────────────────── */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const closeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, closeToast };
}
