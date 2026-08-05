import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function HeroSection({ onBookClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Carousel images - using three doctor images
  const carouselImages = [
    '/images/drjpnaut/img1.jpg',
    '/images/drjpnaut/img2.jpg',
    '/images/drjpnaut/img3.jpg'
  ];

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  return (
    <section className="relative pt-14 pb-3 px-4 sm:px-5 lg:px-6 bg-[#F8F9FA]">
      {/* Hero container with rounded corners and spacing */}
      <div className="relative overflow-hidden min-h-[540px] sm:min-h-[620px] h-[calc(100vh-4.5rem)] rounded-2xl max-w-[1400px] mx-auto">
        {/* Carousel Background with crossfade */}
        <div className="absolute inset-0">
          {carouselImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: index === 0 ? 1 : 0 }}
              animate={{ opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <img
                src={image}
                alt={`Homeopathic care ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Premium gradient scrim for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#062E6F]/90 via-black/40 to-black/20" />
            </motion.div>
          ))}
        </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="w-full px-6 sm:px-8 lg:pl-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            {/* Main Heading - matching Maven style */}
            <h1 className="font-secondary-regular text-3.5xl sm:text-5xl lg:text-7xl text-white leading-tight mb-4 sm:mb-6 font-light">
              Evidence-based homeopathy for{' '}
              <span className="font-secondary-regular italic">your whole family</span>
            </h1>

            {/* Subheading */}
            <p className="font-primary-regular text-lg sm:text-2xl text-white/90 mb-8 sm:mb-10 leading-relaxed">
              Expert care across every life stage. Anywhere in India.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBookClick}
                className="px-8 py-3.5 rounded-lg bg-[#C86B5E] hover:bg-[#B85A4D] text-white font-primary-semibold text-base transition-all shadow-lg text-center"
              >
                Book consultation
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBookClick}
                className="px-8 py-3.5 rounded-lg border-2 border-white/80 text-white font-primary-semibold text-base hover:bg-white/10 transition-all text-center"
              >
                Learn more
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom indicator text */}
      <div className="hidden sm:block absolute bottom-8 right-8">
        <p className="text-white/80 text-sm font-primary-regular">
          EXTENDING HEALTH TO MIDLIFE
        </p>
      </div>
      </div>
    </section>
  );
}
