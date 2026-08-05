import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './nautiyal/Navbar';
import HeroSection from './nautiyal/HeroSection';
import TrustStrip from './nautiyal/TrustStrip';
import AboutSection from './nautiyal/AboutSection';
import TreatmentsSection from './nautiyal/TreatmentsSection';
import HomeoAISection from './nautiyal/HomeoAISection';
import TestimonialsSection from './nautiyal/TestimonialsSection';
import FAQSection from './nautiyal/FAQSection';
import GallerySection from './nautiyal/GallerySection';
import ContactSection from './nautiyal/ContactSection';
import CTAFooter from './nautiyal/CTAFooter';
import StickyMobileBar from './nautiyal/StickyMobileBar';

gsap.registerPlugin(ScrollTrigger);

export default function DrNautiyalWebsite({ onLaunchApp }) {
  const [selectedCondition, setSelectedCondition] = useState('');
  const pinnedWrapperRef = useRef(null);

  const handleBookClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookWithCondition = (condition) => {
    setSelectedCondition(condition);
    handleBookClick();
  };

  useEffect(() => {
    // ScrollTrigger reserved for future animations
    // No pin active — TreatmentsSection scrolls freely, HomeoAI rolls up via CSS z-index
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-16 md:pb-0" style={{ overflowX: 'clip' }}>
      <Navbar onBookClick={handleBookClick} onLaunchApp={onLaunchApp} />
      <HeroSection onBookClick={handleBookClick} />
      <TrustStrip />
      
      <AboutSection />
      <TreatmentsSection onBookWithCondition={handleBookWithCondition} />
      <HomeoAISection onTryPlatformClick={onLaunchApp} />
      <TestimonialsSection />
      <FAQSection />
      <GallerySection />
      <ContactSection selectedCondition={selectedCondition} />
      <CTAFooter onBookClick={handleBookClick} />
      <StickyMobileBar onBookClick={handleBookClick} />
    </div>
  );
}
