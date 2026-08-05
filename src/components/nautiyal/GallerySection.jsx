import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GallerySection() {
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const images = [
    {
      src: '/images/drjpnaut/3.jpg',
      title: 'Doctor Consultation Room',
      caption: 'Dr. J.P. Nautiyal in consultation with patient at Rajeev Nagar Clinic, Dehradun.'
    },
    {
      src: '/images/drjpnaut/1.jpg',
      title: 'Clinic Reception & Pharmacy',
      caption: 'Organized classical homeopathic dispensaries with authentic dilution remedies.'
    },
    {
      src: '/images/drjpnaut/2.jpg',
      title: 'Patient Waiting Area',
      caption: 'Clean, serene waiting lounge for visiting patients and families.'
    },
    {
      src: '/images/drjpnaut/4.jpg',
      title: 'Materia Medica Reference Library',
      caption: 'Comprehensive collection of classical homeopathic literature and Kent Repertories.'
    },
    {
      src: '/images/drjpnaut/5.jpg',
      title: 'Doctor Consultation Chamber',
      caption: 'Equipped for detailed physical examination and constitutional case taking.'
    },
    {
      src: '/images/drjpnaut/6.jpg',
      title: 'Authentic Dilution Stock',
      caption: 'High-purity liquid potencies sourced from accredited homeopathic laboratories.'
    },
    {
      src: '/images/drjpnaut/7.jpg',
      title: 'Government Service Recognition',
      caption: 'Honors and citations from 23 years of public service in Doon Medical College.'
    },
    {
      src: '/images/drjpnaut/8.jpg',
      title: 'Published Literature & Research',
      caption: 'Ayush Chikitsa Padhatiyan treatise authored by Dr. J.P. Nautiyal.'
    }
  ];

  const handleNext = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex + 1) % images.length);
    }
  };

  const handlePrev = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <section id="gallery" className="py-16 lg:py-24 bg-[#F8F9FA] relative border-b border-[#6C757D]/20 overflow-hidden">
      {/* Halftone dots */}
      <div className="absolute inset-0 halftone-dots-light opacity-35 pointer-events-none" />
      <div className="section-container">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9ECEF] border border-[#6C757D]/30 mb-3">
            <Camera className="w-3.5 h-3.5 text-[#C86B5E]" />
            <span className="font-mono-ledger text-xs uppercase tracking-widest text-[#062E6F] font-semibold">
              CLINIC GALLERY & ARCHIVES
            </span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#062E6F] tracking-tight">
            A glimpse inside our Dehradun healing sanctuary.
          </h2>
          <p className="text-base text-[#212529]/85 font-sans-body mt-3">
            Explore our consultation chambers, pharmacy stock, and classical literature collection.
          </p>
        </div>

        {/* Complex Grid Layout - Varied sizes with responsive row height */}
        <div className="grid grid-cols-12 gap-3 sm:gap-4 auto-rows-[130px] sm:auto-rows-[150px]">
          {/* Row 1 */}
          {/* Image 0 - Large wide */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            onClick={() => setActiveImageIndex(0)}
            className="col-span-12 md:col-span-5 row-span-2 specimen-card rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="corner-tick corner-tick-tl" />
            <div className="corner-tick corner-tick-tr" />
            <div className="corner-tick corner-tick-bl" />
            <div className="corner-tick corner-tick-br" />
            <img src={images[0].src} alt={images[0].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/90 via-[#062E6F]/30 to-transparent opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 sm:p-4 flex flex-col justify-between text-[#F8F9FA]">
              <div className="flex justify-end"><Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#E89B8F]" /></div>
              <div>
                <h4 className="font-serif-display font-bold text-xs sm:text-sm text-[#F8F9FA]">{images[0].title}</h4>
                <p className="font-mono-ledger text-[9px] sm:text-[10px] text-[#E89B8F] mt-0.5">Click to view full image</p>
              </div>
            </div>
          </motion.div>

          {/* Image 1 - Small square */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            onClick={() => setActiveImageIndex(1)}
            className="col-span-6 md:col-span-3 row-span-2 specimen-card rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="corner-tick corner-tick-tl" />
            <div className="corner-tick corner-tick-tr" />
            <div className="corner-tick corner-tick-bl" />
            <div className="corner-tick corner-tick-br" />
            <img src={images[1].src} alt={images[1].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/85 via-[#062E6F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-[#F8F9FA]">
              <div className="flex justify-end"><Maximize2 className="w-5 h-5 text-[#E89B8F]" /></div>
              <div>
                <h4 className="font-serif-display font-bold text-sm text-[#F8F9FA]">{images[1].title}</h4>
                <p className="font-mono-ledger text-[10px] text-[#E89B8F] mt-0.5">Click to view full image</p>
              </div>
            </div>
          </motion.div>

          {/* Image 2 - Medium square */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => setActiveImageIndex(2)}
            className="col-span-6 md:col-span-4 row-span-2 specimen-card rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="corner-tick corner-tick-tl" />
            <div className="corner-tick corner-tick-tr" />
            <div className="corner-tick corner-tick-bl" />
            <div className="corner-tick corner-tick-br" />
            <img src={images[2].src} alt={images[2].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/85 via-[#062E6F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-[#F8F9FA]">
              <div className="flex justify-end"><Maximize2 className="w-5 h-5 text-[#E89B8F]" /></div>
              <div>
                <h4 className="font-serif-display font-bold text-sm text-[#F8F9FA]">{images[2].title}</h4>
                <p className="font-mono-ledger text-[10px] text-[#E89B8F] mt-0.5">Click to view full image</p>
              </div>
            </div>
          </motion.div>

          {/* Row 2 */}
          {/* Image 3 - Extra Large wide */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            onClick={() => setActiveImageIndex(3)}
            className="col-span-12 md:col-span-6 row-span-2 specimen-card rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="corner-tick corner-tick-tl" />
            <div className="corner-tick corner-tick-tr" />
            <div className="corner-tick corner-tick-bl" />
            <div className="corner-tick corner-tick-br" />
            <img src={images[3].src} alt={images[3].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/85 via-[#062E6F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-[#F8F9FA]">
              <div className="flex justify-end"><Maximize2 className="w-5 h-5 text-[#E89B8F]" /></div>
              <div>
                <h4 className="font-serif-display font-bold text-sm text-[#F8F9FA]">{images[3].title}</h4>
                <p className="font-mono-ledger text-[10px] text-[#E89B8F] mt-0.5">Click to view full image</p>
              </div>
            </div>
          </motion.div>

          {/* Image 4 - Medium */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={() => setActiveImageIndex(4)}
            className="col-span-6 md:col-span-3 row-span-2 specimen-card rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="corner-tick corner-tick-tl" />
            <div className="corner-tick corner-tick-tr" />
            <div className="corner-tick corner-tick-bl" />
            <div className="corner-tick corner-tick-br" />
            <img src={images[4].src} alt={images[4].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/85 via-[#062E6F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-[#F8F9FA]">
              <div className="flex justify-end"><Maximize2 className="w-5 h-5 text-[#E89B8F]" /></div>
              <div>
                <h4 className="font-serif-display font-bold text-sm text-[#F8F9FA]">{images[4].title}</h4>
                <p className="font-mono-ledger text-[10px] text-[#E89B8F] mt-0.5">Click to view full image</p>
              </div>
            </div>
          </motion.div>

          {/* Image 5 - Large tall */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 }}
            onClick={() => setActiveImageIndex(5)}
            className="col-span-6 md:col-span-3 row-span-2 specimen-card rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="corner-tick corner-tick-tl" />
            <div className="corner-tick corner-tick-tr" />
            <div className="corner-tick corner-tick-bl" />
            <div className="corner-tick corner-tick-br" />
            <img src={images[5].src} alt={images[5].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/85 via-[#062E6F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-[#F8F9FA]">
              <div className="flex justify-end"><Maximize2 className="w-5 h-5 text-[#E89B8F]" /></div>
              <div>
                <h4 className="font-serif-display font-bold text-sm text-[#F8F9FA]">{images[5].title}</h4>
                <p className="font-mono-ledger text-[10px] text-[#E89B8F] mt-0.5">Click to view full image</p>
              </div>
            </div>
          </motion.div>

          {/* Row 3 */}
          {/* Image 6 - Small */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onClick={() => setActiveImageIndex(6)}
            className="col-span-6 md:col-span-3 row-span-2 specimen-card rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="corner-tick corner-tick-tl" />
            <div className="corner-tick corner-tick-tr" />
            <div className="corner-tick corner-tick-bl" />
            <div className="corner-tick corner-tick-br" />
            <img src={images[6].src} alt={images[6].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/85 via-[#062E6F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-[#F8F9FA]">
              <div className="flex justify-end"><Maximize2 className="w-5 h-5 text-[#E89B8F]" /></div>
              <div>
                <h4 className="font-serif-display font-bold text-sm text-[#F8F9FA]">{images[6].title}</h4>
                <p className="font-mono-ledger text-[10px] text-[#E89B8F] mt-0.5">Click to view full image</p>
              </div>
            </div>
          </motion.div>

          {/* Image 7 - Large wide */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.35 }}
            onClick={() => setActiveImageIndex(7)}
            className="col-span-6 md:col-span-5 row-span-2 specimen-card rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="corner-tick corner-tick-tl" />
            <div className="corner-tick corner-tick-tr" />
            <div className="corner-tick corner-tick-bl" />
            <div className="corner-tick corner-tick-br" />
            <img src={images[7].src} alt={images[7].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/85 via-[#062E6F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-[#F8F9FA]">
              <div className="flex justify-end"><Maximize2 className="w-5 h-5 text-[#E89B8F]" /></div>
              <div>
                <h4 className="font-serif-display font-bold text-sm text-[#F8F9FA]">{images[7].title}</h4>
                <p className="font-mono-ledger text-[10px] text-[#E89B8F] mt-0.5">Click to view full image</p>
              </div>
            </div>
          </motion.div>

          {/* Image hidden on mobile, shown on md - Medium */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            onClick={() => setActiveImageIndex(0)}
            className="hidden md:block col-span-4 row-span-2 specimen-card rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative"
          >
            <div className="corner-tick corner-tick-tl" />
            <div className="corner-tick corner-tick-tr" />
            <div className="corner-tick corner-tick-bl" />
            <div className="corner-tick corner-tick-br" />
            <img src={images[0].src} alt={images[0].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/85 via-[#062E6F]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-[#F8F9FA]">
              <div className="flex justify-end"><Maximize2 className="w-5 h-5 text-[#E89B8F]" /></div>
              <div>
                <h4 className="font-serif-display font-bold text-sm text-[#F8F9FA]">{images[0].title}</h4>
                <p className="font-mono-ledger text-[10px] text-[#E89B8F] mt-0.5">Click to view full image</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {activeImageIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setActiveImageIndex(null)}
            >
              <div 
                className="relative max-w-4xl w-full bg-[#062E6F] rounded-xl border border-[#6C757D]/40 shadow-2xl p-4 sm:p-6 text-[#F8F9FA] max-h-[90dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveImageIndex(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-[#084A9E] text-[#F8F9FA] hover:bg-[#C86B5E] transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Lightbox Image */}
                <div
                  className="relative w-full overflow-hidden rounded-lg border border-[#6C757D]/30 bg-black"
                  style={{ height: 'clamp(240px, 60dvh, 620px)' }}
                >
                  <img
                    src={images[activeImageIndex].src}
                    alt={images[activeImageIndex].title}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Prev / Next Nav Buttons */}
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-[#C86B5E] transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-[#C86B5E] transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Lightbox Caption */}
                <div className="mt-4 pt-3 border-t border-[#6C757D]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-serif-display text-lg font-bold text-[#E89B8F]">
                      {images[activeImageIndex].title}
                    </h3>
                    <p className="text-xs text-[#F8F9FA]/80 font-sans-body">
                      {images[activeImageIndex].caption}
                    </p>
                  </div>

                  <div className="font-mono-ledger text-xs text-[#6C757D]">
                    {activeImageIndex + 1} of {images.length}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
