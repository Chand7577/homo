import React from 'react';
import { Phone, MessageCircle, Calendar } from 'lucide-react';

export default function StickyMobileBar({ onBookClick }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#062E6F]/95 backdrop-blur-md border-t border-[#6C757D]/40 px-3 py-2.5 shadow-2xl flex items-center justify-between gap-2">
      <a
        href="tel:+917983909157"
        className="flex-1 py-2 rounded bg-[#084A9E] text-[#F8F9FA] text-center font-mono-ledger text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 border border-[#6C757D]/30"
      >
        <Phone className="w-3.5 h-3.5 text-[#E89B8F]" />
        <span>Call</span>
      </a>

      <a
        href="https://wa.me/917983909157?text=Hello%20Dr.%20Nautiyal,%20I%20would%20like%20to%20book%20an%20appointment."
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-2 rounded bg-[#6C757D] text-[#062E6F] text-center font-mono-ledger text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </a>

      <button
        onClick={onBookClick}
        className="flex-1 py-2 rounded amber-btn text-center font-mono-ledger text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 shadow"
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Book</span>
      </button>
    </div>
  );
}
