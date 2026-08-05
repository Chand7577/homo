import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Search, Filter } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);

  const faqs = [
    {
      question: 'How does classical homeopathy differ from conventional disease-based treatment?',
      answer: 'Classical homeopathy treats the patient as a unique individual rather than prescribing to a disease name alone. Dr. J.P. Nautiyal analyzes your physical symptoms, mental state, emotional stressors, and body temperament to select a single matching constitutional remedy.',
      category: 'Treatment Process'
    },
    {
      question: 'Are homeopathic remedies safe for newborn infants, children, and pregnant women?',
      answer: 'Yes, completely safe. Homeopathic remedies are highly diluted micro-doses prepared from natural plant, mineral, and biological substances. They produce no toxic side effects, non-habit forming, and are safe for infants, pregnant mothers, and elderly patients.',
      category: 'Safety & Dosage'
    },
    {
      question: 'Will my symptoms worsen initially after taking the remedy (Homeopathic Aggravation)?',
      answer: 'A slight, temporary increase in symptoms (known as a homeopathic aggravation) sometimes occurs in chronic cases. This is actually a positive sign that the remedy has stimulated your body\'s vital force to initiate deep internal healing.',
      category: 'Treatment Process'
    },
    {
      question: 'How long does a typical homeopathic treatment take for chronic illnesses?',
      answer: 'Acute ailments like fevers or colds often resolve within 24 to 48 hours. Long-standing chronic conditions (such as PCOD, psoriasis, or arthritis) depend on disease duration, but visible improvements usually begin within 3 to 6 weeks of continuous treatment.',
      category: 'Treatment Process'
    },
    {
      question: 'Do I need to follow strict dietary restrictions (like avoiding raw onions, garlic, or coffee)?',
      answer: 'Dr. Nautiyal advises avoiding strong aromatic substances (like raw onion, garlic, camphor, or strong mint) within 30 minutes before and after taking your medicine, as strong aromas can interfere with remedy absorption.',
      category: 'Diet & Guidelines'
    },
    {
      question: 'Can I take Homeopathic medicines alongside my current Allopathic prescriptions?',
      answer: 'Yes, absolutely. Homeopathic remedies operate on dynamic energetic principles and do not chemically interact with allopathic medications like blood pressure or diabetic tablets. You should never abruptly stop prescribed allopathic drugs without consulting your physician.',
      category: 'Safety & Dosage'
    },
    {
      question: 'What happens during the initial consultation with Dr. J.P. Nautiyal?',
      answer: 'Your first consultation lasts 30 to 45 minutes. Dr. Nautiyal takes a detailed case history covering current symptoms, past illnesses, family health background, sleep patterns, thermal sensitivities, and emotional well-being to pinpoint your exact remedy.',
      category: 'Consultation'
    },
    {
      question: 'Is online WhatsApp consultation available for patients outside Dehradun?',
      answer: 'Yes! Patients across India and abroad can book an online video/voice consultation via WhatsApp. Prescriptions and home remedies are sent digitally or dispatched via courier.',
      category: 'Consultation'
    },
    {
      question: 'Are there any steroids or undisclosed chemicals in homeopathic sweet pills?',
      answer: 'No, strictly zero steroids or synthetic chemicals. Homeopathic globules are made of pure cane sugar (lactose/sucrose) saturated with official pharmacopoeial liquid remedies. Dr. Nautiyal maintains strict classical purity.',
      category: 'Safety & Dosage'
    },
    {
      question: 'How are homeopathic potencies (e.g., 30C, 200C, 1M) chosen?',
      answer: 'Potencies are chosen based on the depth of the disease, the patient\'s vital force energy, and age. Acute fevers use lower potencies (30C), while deep-seated constitutional or emotional issues respond best to high potencies (200C or 1M).',
      category: 'Treatment Process'
    },
    {
      question: 'Can acute high fevers or acute viral infections be controlled with homeopathy?',
      answer: 'Yes! Classical remedies like Belladonna, Aconite, and Ferrum Phos can control acute high fevers naturally without causing gut inflammation or digestive upset often associated with heavy antipyretics.',
      category: 'Treatment Process'
    },
    {
      question: 'How should I properly store and consume homeopathic sweet pills?',
      answer: 'Store pills in a cool, dry place away from direct sunlight and strong scents (perfumes, spices). Avoid touching pills with bare hands — use the bottle cap to place 4 to 6 pills directly under your tongue.',
      category: 'Diet & Guidelines'
    },
    {
      question: 'Why is Dr. J.P. Nautiyal recognized as Uttarakhand’s pioneer in Homeopathy?',
      answer: 'Dr. Nautiyal holds 45+ years of experience and is Uttarakhand\'s first Homeopathic MD. He served 23 years in government medical service, including Doon Hospital, and served as Registrar of the Homoeopathic Board.',
      category: 'Consultation'
    }
  ];

  const categories = ['All', 'Treatment Process', 'Safety & Dosage', 'Diet & Guidelines', 'Consultation'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesQuery = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Show only first 6 FAQs unless "Show All" is clicked or search is active
  const displayedFaqs = (showAll || searchQuery || selectedCategory !== 'All') 
    ? filteredFaqs 
    : filteredFaqs.slice(0, 6);
  
  const hasMore = filteredFaqs.length > 6 && !showAll && !searchQuery && selectedCategory === 'All';

  return (
    <section id="faq" className="py-16 lg:py-24 bg-[#E9ECEF] relative border-b border-[#6C757D]/30 overflow-hidden">
      {/* Halftone gradient */}
      <div className="absolute inset-0 halftone-dots-light opacity-40 pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#6C757D]/40 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#C86B5E]" />
            <span className="font-mono-ledger text-xs uppercase tracking-widest text-[#062E6F] font-semibold">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#062E6F] tracking-tight">
            Clear answers to your homeopathy questions.
          </h2>
          <p className="text-base text-[#212529]/85 font-sans-body mt-3">
            Everything you need to know about remedies, safety, consultation, and treatment duration.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4 mb-10">
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-[#6C757D] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (e.g. fever, safety, diet, coffee, steroids)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#F8F9FA] border border-[#6C757D]/40 text-[#212529] placeholder-[#6C757D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C86B5E]"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono-ledger uppercase tracking-wider transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#062E6F] text-[#F8F9FA] font-bold'
                    : 'bg-[#F8F9FA]/70 text-[#212529] hover:bg-[#F8F9FA] border border-[#6C757D]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {displayedFaqs.length === 0 ? (
            <div className="text-center py-10 text-[#6C757D] font-mono-ledger text-sm">
              No matching questions found. Try searching for another term.
            </div>
          ) : (
            displayedFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className="specimen-card rounded-lg overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif-display font-semibold text-lg text-[#062E6F] hover:text-[#C86B5E] focus:outline-none"
                  >
                    <span className="flex items-start gap-3">
                      <span className="font-mono-ledger text-xs text-[#8B3A2A] mt-1 font-bold">
                        Q{index + 1}.
                      </span>
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#C86B5E] transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 pt-1 border-t border-dashed border-[#6C757D]/40"
                      >
                        <p className="text-sm sm:text-base text-[#212529]/90 leading-relaxed font-sans-body">
                          {faq.answer}
                        </p>
                        <div className="mt-3 inline-block font-mono-ledger text-[10px] uppercase text-[#6C757D] bg-[#F8F9FA] px-2.5 py-0.5 rounded border border-[#6C757D]/30">
                          Category: {faq.category}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setShowAll(true)}
              className="px-8 py-3.5 rounded-lg bg-[#C86B5E] hover:bg-[#B85A4D] text-white font-primary-semibold text-base transition-all shadow-lg inline-flex items-center gap-2"
            >
              Load More Questions
              <ChevronDown className="w-4 h-4" />
            </button>
            <p className="mt-3 text-sm text-[#6C757D] font-primary-regular">
              Showing {displayedFaqs.length} of {filteredFaqs.length} questions
            </p>
          </motion.div>
        )}

      </div>
    </section>
  );
}
