import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ onBookClick, onLaunchApp }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Treatments', href: '#treatments' },
    { name: 'HomeoAI Platform', href: '#homeoai' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQs', href: '#faq' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-6 sm:px-8 lg:px-12">
      {/* White card navbar with rounded corners and spacing */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-300 max-w-[1200px] mx-auto px-5 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <img 
              src="/images/drjpnaut/logo.png" 
              alt="Dr. Nautiyal Logo" 
              className="h-10 object-contain"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-primary-medium text-[#212529] hover:text-[#062E6F] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onLaunchApp}
              className="px-5 py-2 rounded-lg bg-[#C86B5E] hover:bg-[#B85A4D] text-white font-primary-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              Access HomeoAI
            </button>

            <button
              onClick={onBookClick}
              className="px-5 py-2 rounded-lg border-2 border-[#062E6F] text-[#062E6F] font-primary-semibold text-sm hover:bg-[#062E6F]/5 transition-all cursor-pointer"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-[#062E6F] hover:bg-gray-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white rounded-2xl shadow-xl mt-2 mx-4 px-6 pt-4 pb-6 space-y-4">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-3 rounded-md text-base font-primary-medium text-[#212529] hover:bg-gray-50 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunchApp();
              }}
              className="w-full px-6 py-3 rounded-lg bg-[#C86B5E] text-white font-primary-semibold text-sm transition-all shadow-md cursor-pointer"
            >
              Access HomeoAI
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookClick();
              }}
              className="w-full px-6 py-3 rounded-lg border-2 border-[#062E6F] text-[#062E6F] font-primary-semibold text-sm hover:bg-[#062E6F]/5 transition-all cursor-pointer"
            >
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
