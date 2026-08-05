import { motion } from 'framer-motion';
import { Star, Quote, BadgeCheck } from 'lucide-react';

const testimonials = [
  {
    name: 'Rameshwar Sharma',
    location: 'Dehradun',
    condition: 'Recurrent Fevers',
    text: 'Dr. Nautiyal prescribed a constitutional remedy for my 4-year-old son who had recurring fevers every month. Within two weeks the fevers stopped completely — no antibiotics, no side effects.',
    stars: 5,
    years: '3 years patient'
  },
  {
    name: 'Priya Rawat',
    location: 'Rishikesh',
    condition: 'PCOD & Hormonal',
    text: 'After 3 years of failed specialist treatments for PCOD, Dr. Nautiyal\'s individual remedy brought my cycles back to normal in just 4 months. I feel like myself again.',
    stars: 5,
    years: '2 years patient'
  },
  {
    name: 'Sunil Verma',
    location: 'Haridwar',
    condition: 'Psoriasis',
    text: 'Severe psoriasis on my hands and legs made daily work painful. Graphites prescribed by Dr. Nautiyal stopped the itching within days. No steroids, no harsh creams.',
    stars: 5,
    years: '4 years patient'
  },
  {
    name: 'Meena Bisht',
    location: 'Mussoorie',
    condition: 'Migraine Headaches',
    text: 'I had chronic migraines 3–4 times a week for 7 years. After one month with Dr. Nautiyal, the frequency dropped to once a month. Six months later, I am nearly migraine-free.',
    stars: 5,
    years: '1.5 years patient'
  },
  {
    name: 'Anjali Negi',
    location: 'Dehradun',
    condition: 'Child Allergies',
    text: 'My daughter had dust and food allergies that caused constant sneezing and rashes. Homeopathic treatment from Dr. Nautiyal cleared her symptoms in 3 months. No antihistamines needed.',
    stars: 5,
    years: '5 years patient'
  },
  {
    name: 'Deepak Joshi',
    location: 'Roorkee',
    condition: 'Anxiety & Stress',
    text: 'I was on anxiety medication for 2 years. Dr. Nautiyal\'s constitutional approach treated the root cause. I tapered off medication under my doctor\'s guidance and feel genuinely calm now.',
    stars: 5,
    years: '2 years patient'
  },
  {
    name: 'Kavita Thakur',
    location: 'Pauri',
    condition: 'Thyroid Imbalance',
    text: 'My TSH levels were dangerously high and I was gaining weight rapidly. In 6 months of homeopathic treatment, my thyroid function stabilized and I lost 8 kg naturally.',
    stars: 5,
    years: '3 years patient'
  },
  {
    name: 'Mohan Lal',
    location: 'Dehradun',
    condition: 'Joint Pain',
    text: 'Knee pain from arthritis made climbing stairs impossible. After Rhus Tox treatment by Dr. Nautiyal, I can now walk 4–5 km daily. The stiffness is completely gone.',
    stars: 4,
    years: '6 years patient'
  }
];

// Split into two rows for the dual-marquee effect
const row1 = testimonials.slice(0, 4);
const row2 = testimonials.slice(4, 8);

function StarRating({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t }) {
  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white rounded-2xl border border-[#E9ECEF] shadow-sm p-6 mx-3 flex flex-col gap-4 hover:shadow-md hover:border-[#062E6F]/20 transition-all duration-300">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar initial */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#062E6F] to-[#084A9E] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-primary-bold text-base">{t.name[0]}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-primary-semibold text-[#212529] text-sm">{t.name}</p>
              <BadgeCheck className="w-3.5 h-3.5 text-[#062E6F]" />
            </div>
            <p className="text-xs text-[#6C757D] font-primary-regular">{t.location} · {t.years}</p>
          </div>
        </div>
        <Quote className="w-6 h-6 text-[#C86B5E]/30 flex-shrink-0 mt-0.5" />
      </div>

      {/* Condition badge */}
      <span className="inline-flex self-start items-center px-2.5 py-0.5 rounded-full bg-[#062E6F]/8 border border-[#062E6F]/15 text-[#062E6F] font-mono-ledger text-[10px] uppercase tracking-wider">
        {t.condition}
      </span>

      {/* Review text */}
      <p className="font-primary-regular text-[#212529]/80 text-sm leading-relaxed flex-1">
        "{t.text}"
      </p>

      {/* Stars */}
      <StarRating count={t.stars} />
    </div>
  );
}

function MarqueeRow({ items, reverse = false, speed = 40 }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden py-2">
      <motion.div
        className="flex"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} t={t} />
        ))}
      </motion.div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-20 lg:py-28 bg-[#F8F9FA] overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 halftone-dots-light opacity-30 pointer-events-none" />

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#F8F9FA] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#F8F9FA] to-transparent z-10 pointer-events-none" />

      {/* Section header */}
      <div className="section-container relative z-10 mb-14">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#6C757D]/30 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono-ledger text-xs uppercase tracking-widest text-[#062E6F] font-semibold">
                Patient Reviews
              </span>
            </div>
            <h2 className="font-secondary-regular text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#062E6F] leading-tight font-light">
              Trusted by families{' '}
              <span className="font-secondary-regular italic text-[#C86B5E]">across Uttarakhand</span>
            </h2>
          </div>

          {/* Stats block */}
          <div className="flex items-center gap-6 sm:gap-10 lg:pb-2">
            <div className="text-center">
              <p className="font-secondary-regular text-4xl sm:text-5xl text-[#062E6F] font-light leading-none">45+</p>
              <p className="font-primary-regular text-xs text-[#6C757D] mt-1 uppercase tracking-wide">Years Practice</p>
            </div>
            <div className="w-px h-10 bg-[#6C757D]/20" />
            <div className="text-center">
              <p className="font-secondary-regular text-4xl sm:text-5xl text-[#062E6F] font-light leading-none">10k+</p>
              <p className="font-primary-regular text-xs text-[#6C757D] mt-1 uppercase tracking-wide">Patients Treated</p>
            </div>
            <div className="w-px h-10 bg-[#6C757D]/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <p className="font-secondary-regular text-4xl sm:text-5xl text-[#062E6F] font-light leading-none">4.9</p>
              </div>
              <p className="font-primary-regular text-xs text-[#6C757D] uppercase tracking-wide">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dual marquee rows */}
      <div className="space-y-4 relative z-0">
        <MarqueeRow items={row1} reverse={false} speed={45} />
        <MarqueeRow items={row2} reverse={true} speed={38} />
      </div>

    </section>
  );
}
