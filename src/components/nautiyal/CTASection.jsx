import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="relative py-20 lg:py-28 bg-[#041E48] overflow-hidden">
      {/* Large Circular Gradient Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(200, 107, 94, 0.15) 0%, rgba(4, 30, 72, 0) 70%)'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* Heading */}
          <h2 className="font-secondary-regular text-4xl sm:text-5xl lg:text-6xl text-white leading-tight font-light">
            Bring your benefits{' '}
            <span className="font-secondary-regular italic">into the future</span>
          </h2>

          {/* Description */}
          <p className="font-primary-regular text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Connect with our team and discover how our homeopathic care can work for you.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-lg bg-[#C86B5E] hover:bg-[#B85A4D] text-white font-primary-semibold text-base transition-all shadow-lg"
            >
              Book a consultation
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-lg bg-[#C86B5E] hover:bg-[#B85A4D] text-white font-primary-semibold text-base transition-all shadow-lg"
            >
              Learn more
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
