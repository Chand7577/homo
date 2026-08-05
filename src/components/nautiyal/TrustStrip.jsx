import { motion } from 'framer-motion';

export default function TrustStrip() {
  // Placeholder text for trust partners - you can replace with actual logos/images
  const partners = [
    'Homeopathic Medical Council',
    'Central Council of Homeopathy',
    'Uttarakhand Medical Board',
    'Indian Institute of Homeopathy',
    'National Health Mission',
    'Ayush Ministry'
  ];

  return (
    <section className="relative bg-[#062E6F] py-10 overflow-hidden">
      {/* "TRUSTED BY" label - Hidden or compact on mobile, fixed on tablet/desktop */}
      <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 sm:px-6 bg-[#062E6F] z-10 border-r border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C86B5E] animate-pulse"></div>
          <p className="text-white/90 text-xs sm:text-sm font-primary-medium uppercase tracking-wider font-semibold">
            Trusted by
          </p>
        </div>
      </div>

      {/* Marquee container */}
      <div className="relative flex">
        {/* First marquee */}
        <motion.div
          className="flex gap-8 sm:gap-12 items-center pl-32 sm:pl-48 min-w-max"
          animate={{
            x: [0, -2000]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear"
            }
          }}
        >
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <div
              key={`first-${index}`}
              className="flex items-center justify-center px-8 py-3 border-l border-white/40 whitespace-nowrap"
            >
              <span className="text-white font-primary-medium text-base">
                {partner}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Duplicate marquee for seamless loop */}
        <motion.div
          className="flex gap-12 items-center min-w-max"
          animate={{
            x: [0, -2000]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear"
            }
          }}
        >
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <div
              key={`second-${index}`}
              className="flex items-center justify-center px-8 py-3 border-l border-white/40 whitespace-nowrap"
            >
              <span className="text-white font-primary-medium text-base">
                {partner}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
