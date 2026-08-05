import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TreatmentsSection({ onBookWithCondition }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  // All 13 treatments with photos in bento layout
  const treatments = [
    // Row 1 - Large left card with image overlay
    {
      id: 1,
      title: 'Fever & General Care',
      description: 'Acute and recurring fevers, treated gently — safe for infants, elderly, and co-morbid patients',
      img: '/images/drjpnaut/fever_general.jpg',
      bgColor: 'bg-[#6C757D]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-2',
      type: 'image-overlay'
    },
    // Row 1 - Top middle
    {
      id: 2,
      title: "Women's Health Specialties",
      description: 'PCOD/PCOS, hormonal imbalance, uterine fibroids, painful or irregular menstruation, menopause support',
      img: '/images/drjpnaut/women_problem.jpg',
      bgColor: 'bg-[#062E6F]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-1',
      type: 'image-overlay'
    },
    // Row 1 - Top right
    {
      id: 3,
      title: 'Digestive & Liver Care',
      description: 'Hyperacidity, IBS, chronic constipation, ulcerative colitis, fatty liver, jaundice, GERD treatment',
      img: '/images/drjpnaut/digestive_problem.jpg',
      bgColor: 'bg-[#C86B5E]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-1',
      type: 'image-overlay'
    },
    // Row 2 - Bottom left tall
    {
      id: 4,
      title: 'Skin & Hair Treatment',
      description: 'Psoriasis, eczema, stubborn fungal infections, alopecia, urticaria, severe acne, dandruff solutions',
      img: '/images/drjpnaut/skin-hair-pro.jpg',
      bgColor: 'bg-[#062E6F]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-2',
      type: 'image-overlay'
    },
    // Row 2 - Middle right
    {
      id: 5,
      title: 'Joint & Muscle Pain Relief',
      description: 'Rheumatoid arthritis, osteoarthritis, cervical spondylosis, sciatica, gout, old traumatic injuries',
      img: '/images/drjpnaut/joint_musle.jpg',
      bgColor: 'bg-[#8B9AA3]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-1',
      type: 'image-overlay'
    },
    // Row 2 - Bottom right
    {
      id: 6,
      title: 'Respiratory & Allergies',
      description: 'Asthma, chronic bronchitis, allergic rhinitis, sinusitis, recurrent throat infections treatment',
      img: '/images/drjpnaut/respiratory.jpg',
      bgColor: 'bg-[#C86B5E]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-1',
      type: 'image-overlay'
    },
    // Row 3 - Varied sizes (tall card on left, 2 stacked on right)
    {
      id: 7,
      title: 'Chronic & Degenerative Diseases',
      description: 'Constitutional treatment for deep-seated multi-systemic chronic disorders and auto-immune issues',
      img: '/images/drjpnaut/chronic.jpg',
      bgColor: 'bg-[#062E6F]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-2',
      type: 'image-overlay'
    },
    {
      id: 8,
      title: 'Renal & Kidney Stones',
      description: 'Renal calculi (kidney stones), recurrent urinary tract infections (UTI), painful micturition care',
      img: '/images/drjpnaut/kidney.jpg',
      bgColor: 'bg-[#6C757D]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-1',
      type: 'image-overlay'
    },
    {
      id: 9,
      title: 'Lifestyle Diseases Management',
      description: 'Hypertension support, metabolic syndrome, stress-induced headaches, chronic insomnia, obesity treatment',
      img: '/images/drjpnaut/life_style_dis.jpg',
      bgColor: 'bg-[#C86B5E]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-1',
      type: 'image-overlay'
    },
    // Row 3 right column - tall card
    {
      id: 10,
      title: 'Children & Pediatrics',
      description: 'Recurrent teething troubles, growth delays, low immunity, nocturnal enuresis, hyperactivity management',
      img: '/images/drjpnaut/children.jpg',
      bgColor: 'bg-[#062E6F]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-2',
      type: 'image-overlay'
    },
    // Row 4 - 3 equal cards filling the full width
    {
      id: 11,
      title: 'Heart & Cardiac Support',
      description: 'Complementary support for functional cardiac neurosis, palpitations, arteriosclerosis prevention',
      img: '/images/drjpnaut/cardiac_disease.jpg',
      bgColor: 'bg-[#8B9AA3]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-1',
      type: 'image-overlay'
    },
    {
      id: 12,
      title: 'Mind & Psychiatric Care',
      description: 'Anxiety neurosis, depression, grief recovery, panic attacks, emotional trauma, phobias treatment',
      img: '/images/drjpnaut/mind_psychiatric.jpg',
      bgColor: 'bg-[#062E6F]',
      textColor: 'text-white',
      span: 'lg:col-span-2 lg:row-span-1',
      type: 'image-overlay'
    },
    {
      id: 13,
      title: 'General Ailments',
      description: 'Post-viral fatigue, general debility, appetite loss, seasonal weakness, immune restoration support',
      img: '/images/drjpnaut/general_deseases.jpg',
      bgColor: 'bg-[#6C757D]',
      textColor: 'text-white',
      span: 'lg:col-span-4 lg:row-span-1',
      type: 'image-overlay'
    }
  ];

  return (
    <section id="treatments" className="py-20 lg:py-28 bg-[#E9ECEF] relative overflow-hidden z-20 rounded-t-[2.5rem] lg:rounded-t-[3.5rem] shadow-[0_-25px_60px_rgba(0,0,0,0.35)] border-t border-white/60">
      <div className="section-container relative">
        
        {/* Section Header - Two Column Layout */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          >
            {/* Left: Heading - Takes 7 columns */}
            <h2 className="font-secondary-regular text-3xl sm:text-4xl lg:text-6xl text-[#062E6F] leading-tight lg:col-span-7 font-light">
              Comprehensive homeopathic treatments for{' '}
              <span className="font-secondary-regular italic">every ailment</span>
            </h2>
            
            {/* Right: Description - Takes 5 columns */}
            <p className="font-primary-regular text-base sm:text-lg lg:text-xl text-[#6C757D] lg:pt-12 lg:col-span-5 leading-relaxed">
              Classical precision, gentle constitutional healing, and evidence-based care tailored specifically to your medical history.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid - Responsive heights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-fr gap-4">
          
          {treatments.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onBookWithCondition(card.title)}
              className={`${card.span} ${card.bgColor} ${card.textColor} p-5 sm:p-6 lg:p-8 relative overflow-hidden cursor-pointer transition-all duration-300 hover:opacity-95 min-h-[220px] sm:min-h-[260px] flex flex-col justify-between rounded-lg shadow-sm`}
            >
              
              {/* Image with overlay text */}
              {card.type === 'image-overlay' && (
                <>
                  <div className="absolute inset-0">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/drjpnaut/fever_general.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h3 className="font-primary-bold text-lg lg:text-xl leading-tight mb-2">
                      {card.title}
                    </h3>
                    <p className="font-primary-light text-sm opacity-90 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </>
              )}

              {/* Image at bottom with text on top */}
              {card.type === 'image-bottom' && (
                <>
                  <div>
                    <h3 className="font-primary-bold text-xl lg:text-2xl leading-tight mb-3">
                      {card.title}
                    </h3>
                    <p className="font-primary-light text-base opacity-90 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <div className="relative h-32 -mb-6 -mx-6 lg:-mb-8 lg:-mx-8 mt-4">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover opacity-80"
                      onError={(e) => {
                        e.target.src = '/images/drjpnaut/fever_general.jpg';
                      }}
                    />
                  </div>
                </>
              )}

              {/* Hover effect indicator */}
              {hoveredCard === card.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full"
                />
              )}

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}
