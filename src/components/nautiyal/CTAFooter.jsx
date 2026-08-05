import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Phone, Mail, MapPin, Calendar, ArrowUp, Star, Send } from 'lucide-react';

export default function CTAFooter({ onBookClick }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "Dr. J.P. Nautiyal",
    "medicalSpecialty": "Homeopathic",
    "description": "Senior Homeopathic Physician with 45+ years experience, MD (Homeo) in Dehradun, Uttarakhand.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rajeev Nagar Road, Near Rispana Bridge, Haridwar Road",
      "addressLocality": "Dehradun",
      "addressRegion": "Uttarakhand",
      "postalCode": "248001",
      "addressCountry": "IN"
    },
    "telephone": "+91-7983909157",
    "priceRange": "₹₹",
    "openingHours": "Mo-Sa 09:30-13:00, Mo-Sa 16:00-20:00"
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* CTA Pine Band */}
      <section className="relative bg-[#062E6F] text-[#F8F9FA] py-24 lg:py-32 overflow-hidden min-h-[700px] flex items-center">
        {/* Large Circular Gradient Background with visible glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-8 sm:px-12 lg:px-16">
          {/* Elliptical Gradient Glow - Very prominent and visible */}
          <div 
            className="absolute rounded-full max-w-full"
            style={{
              width: '1200px',
              height: '800px',
              background: 'radial-gradient(ellipse, rgba(200, 107, 94, 0.6) 0%, rgba(200, 107, 94, 0.4) 25%, rgba(200, 107, 94, 0.2) 50%, rgba(6, 46, 111, 0) 75%)',
              filter: 'blur(60px)'
            }}
          />
          {/* Visible elliptical outline */}
          <div 
            className="rounded-full border-2 border-[#C86B5E]/30 max-w-full"
            style={{
              width: '1200px',
              height: '800px'
            }}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto px-8 sm:px-12 lg:px-16 relative z-10 text-center space-y-6"
        >
          <h2 className="font-secondary-regular text-3xl sm:text-4xl lg:text-5xl text-white leading-tight font-light">
            Ready to begin your journey to natural,{' '}
            <span className="font-secondary-regular italic">individualized healing?</span>
          </h2>
          <p className="text-base text-[#F8F9FA]/80 mx-auto font-primary-regular leading-relaxed max-w-xl">
            Schedule a personal consultation with Dr. J.P. Nautiyal in Dehradun or connect via online WhatsApp care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <motion.button
              onClick={onBookClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 rounded-lg bg-[#C86B5E] hover:bg-[#B85A4D] text-white font-primary-semibold text-sm transition-all shadow-lg cursor-pointer"
            >
              Book Appointment
            </motion.button>

            <motion.a
              href="tel:+917983909157"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 rounded-lg bg-white hover:bg-gray-100 text-black font-primary-semibold text-sm transition-all shadow-lg cursor-pointer"
            >
              Call Clinic
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* Footer Container with matching background */}
      <div className="bg-[#062E6F] px-2 sm:px-3 lg:px-4 pt-4 pb-4">
        {/* Main Footer - Maven Style */}
        <footer className="bg-[#041E48] text-[#F8F9FA]/90 pt-16 pb-8 rounded-t-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-[#6C757D]/20">
            
            {/* Column 1: Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="font-primary-bold text-sm text-[#F8F9FA] mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm font-primary-regular text-[#F8F9FA]/70">
                <li><a href="#about" className="hover:text-[#C86B5E] transition-colors">About</a></li>
                <li><a href="#treatments" className="hover:text-[#C86B5E] transition-colors">Treatments</a></li>
                <li><a href="#homeoai" className="hover:text-[#C86B5E] transition-colors">HomeoAI Platform</a></li>
                <li><a href="#testimonials" className="hover:text-[#C86B5E] transition-colors">Testimonials</a></li>
              </ul>
            </div>

            {/* Column 2: More Links */}
            <div className="lg:col-span-2">
              <h4 className="font-primary-bold text-sm text-[#F8F9FA] mb-4">More</h4>
              <ul className="space-y-3 text-sm font-primary-regular text-[#F8F9FA]/70">
                <li><a href="#faq" className="hover:text-[#C86B5E] transition-colors">FAQs</a></li>
                <li><a href="#gallery" className="hover:text-[#C86B5E] transition-colors">Gallery</a></li>
                <li><a href="#contact" className="hover:text-[#C86B5E] transition-colors">Contact</a></li>
                <li><a href="tel:+917983909157" className="hover:text-[#C86B5E] transition-colors">Call Us</a></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="lg:col-span-2">
              <h4 className="font-primary-bold text-sm text-[#F8F9FA] mb-4">Contact</h4>
              <ul className="space-y-3 text-sm font-primary-regular text-[#F8F9FA]/70">
                <li><a href="tel:+917983909157" className="hover:text-[#C86B5E] transition-colors">+91 7983909157</a></li>
                <li><a href="tel:+919410504434" className="hover:text-[#C86B5E] transition-colors">+91 9410504434</a></li>
                <li><a href="https://wa.me/917983909157" target="_blank" rel="noopener noreferrer" className="hover:text-[#C86B5E] transition-colors">WhatsApp</a></li>
                <li><a href="#contact" className="hover:text-[#C86B5E] transition-colors">Book Appointment</a></li>
                <li><span className="text-[#F8F9FA]/50">Dehradun, Uttarakhand</span></li>
              </ul>
            </div>

            {/* Column 4: Newsletter Subscription */}
            <div className="lg:col-span-6">
              <div className="bg-[#062E6F]/40 backdrop-blur-sm rounded-2xl p-4 border border-[#6C757D]/20">
                <h4 className="font-secondary-bold text-base text-[#F8F9FA] mb-1.5">Stay in the loop</h4>
                <p className="text-sm font-primary-light text-[#F8F9FA]/70 mb-3">Get health tips and updates from Dr. Nautiyal</p>
                
                <form onSubmit={handleSubscribe} className="flex gap-2 mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email*"
                    className="flex-1 px-4 py-3 rounded-lg bg-[#041E48] border border-[#6C757D]/30 text-[#F8F9FA] placeholder-[#F8F9FA]/40 text-sm font-primary-regular focus:outline-none focus:border-[#C86B5E] transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribed}
                    className="px-6 py-3 rounded-lg bg-[#C86B5E] hover:bg-[#E89B8F] text-white font-primary-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {subscribed ? '✓ Subscribed' : 'Subscribe'}
                  </button>
                </form>

                <p className="text-xs font-primary-light text-[#F8F9FA]/50 mb-6">
                  By signing up, I agree with the data protection policy of Dr. Nautiyal Clinic.
                </p>

                {/* Star Rating & Social */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#C86B5E] text-[#C86B5E]" />
                    ))}
                    <span className="text-sm text-[#F8F9FA] font-primary-bold ml-2">Based on 1000+ reviews</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm font-primary-regular text-[#F8F9FA]/70">
                    <a href="https://wa.me/917983909157" target="_blank" rel="noopener noreferrer" className="hover:text-[#C86B5E] transition-colors">WhatsApp</a>
                    <a href="tel:+917983909157" className="hover:text-[#C86B5E] transition-colors">Call</a>
                    <a href="#contact" className="hover:text-[#C86B5E] transition-colors">Email</a>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="pt-8 space-y-6">
            
            {/* Clinic Info & Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <div className="mb-4 inline-block bg-white rounded-lg p-3">
                  <img 
                    src="/images/drjpnaut/logo.png" 
                    alt="Dr. J.P. Nautiyal Logo" 
                    className="h-12 w-auto object-contain"
                  />
                </div>
                
                <div className="space-y-2 font-primary-regular text-[#F8F9FA]/70">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#C86B5E] flex-shrink-0 mt-0.5" />
                    <span>Rajeev Nagar Road, Near Rispana Bridge, Haridwar Road, Dehradun 248001</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#C86B5E] flex-shrink-0" />
                    <a href="tel:+917983909157" className="hover:text-[#C86B5E] transition-colors">+91 7983909157</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#C86B5E] flex-shrink-0" />
                    <a href="mailto:drjpnaut@gmail.com" className="hover:text-[#C86B5E] transition-colors">drjpnaut@gmail.com</a>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-primary-bold text-sm text-[#F8F9FA] mb-3">Consultation Hours</h4>
                <div className="space-y-1 font-primary-regular text-[#F8F9FA]/70 text-sm">
                  <div>Mon – Sat (Summer): 9:00 AM – 1:00 PM, 4:30 PM – 8:00 PM</div>
                  <div>Mon – Sat (Winter): 10:00 AM – 1:00 PM, 4:00 PM – 7:00 PM</div>
                  <div className="text-[#C86B5E] font-primary-bold mt-2">Sunday: Closed</div>
                </div>
                
                <button
                  onClick={scrollToTop}
                  className="mt-4 text-sm text-[#C86B5E] hover:text-[#E89B8F] flex items-center gap-2 font-primary-bold transition-colors"
                >
                  <ArrowUp className="w-4 h-4" /> Back to top
                </button>
              </div>
            </div>

            {/* Copyright Bar */}
            <div className="pt-6 border-t border-[#6C757D]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-primary-light text-[#F8F9FA]/50">
              <div>
                © {new Date().getFullYear()} Dr. J.P. Nautiyal Homeopathy Clinic, Dehradun. All rights reserved.
              </div>
              <div className="flex items-center gap-4 font-primary-regular">
                <span>Uttarakhand's First MD (Homeo)</span>
                <span>•</span>
                <span>45+ Years Excellence</span>
              </div>
            </div>

          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
