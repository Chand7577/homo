import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  FileText, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Layers, 
  ShieldCheck, 
  Cpu,
  BarChart2,
  BookOpen,
  Filter,
  Mic,
  Award
} from 'lucide-react';

export default function HomeoAISection({ onTryPlatformClick }) {
  // Pre-configured clinical scenarios for the interactive AI simulator matching the HomeoAI Rubric Analyzer
  const sampleScenarios = [
    {
      id: 'migraine',
      label: 'Migraine & Weather',
      symptomQuery: 'Chronic right-sided throbbing headache, worse in damp weather, thirstless, relieved by cool open air',
      category: 'Head & Thermal',
      rubrics: [
        { chapter: 'HEAD', name: 'PAIN - right side', confidence: 98, grade: 3 },
        { chapter: 'GENERALITIES', name: 'WEATHER - damp - agg.', confidence: 94, grade: 3 },
        { chapter: 'STOMACH', name: 'THIRSTLESS', confidence: 96, grade: 2 },
        { chapter: 'GENERALITIES', name: 'AIR - open - amel.', confidence: 91, grade: 2 }
      ],
      remedies: [
        { name: 'Pulsatilla Nigricans', score: 11, rubricsCovered: '4/4', rank: 1, match: 97.4, potency: '200C' },
        { name: 'Rhus Toxicodendron', score: 9, rubricsCovered: '3/4', rank: 2, match: 91.2, potency: '30C' },
        { name: 'Silicea Terra', score: 8, rubricsCovered: '3/4', rank: 3, match: 86.8, potency: '1M' },
        { name: 'Spigelia Anthelmia', score: 6, rubricsCovered: '2/4', rank: 4, match: 82.5, potency: '200C' }
      ]
    },
    {
      id: 'pcod',
      label: 'PCOD & Hormonal',
      symptomQuery: 'Irregular delayed menses with facial acne, emotional tearfulness, thermal intolerance to warm rooms',
      category: 'Gynecology & Mind',
      rubrics: [
        { chapter: 'FEMALE', name: 'MENSES - irregular', confidence: 97, grade: 3 },
        { chapter: 'FACE', name: 'ERUPTIONS - acne - forehead', confidence: 92, grade: 2 },
        { chapter: 'MIND', name: 'WEEPING - mood - tearful', confidence: 95, grade: 3 },
        { chapter: 'GENERALITIES', name: 'WARMTH - agg.', confidence: 89, grade: 2 }
      ],
      remedies: [
        { name: 'Pulsatilla Nigricans', score: 12, rubricsCovered: '4/4', rank: 1, match: 98.1, potency: '200C' },
        { name: 'Sepia Officinalis', score: 10, rubricsCovered: '4/4', rank: 2, match: 93.4, potency: '1M' },
        { name: 'Calcarea Carbonica', score: 8, rubricsCovered: '3/4', rank: 3, match: 88.0, potency: '30C' },
        { name: 'Lachesis Mutus', score: 7, rubricsCovered: '3/4', rank: 4, match: 84.2, potency: '200C' }
      ]
    },
    {
      id: 'fever',
      label: 'Acute Pediatric Fever',
      symptomQuery: 'Sudden high fever after exposure to cold dry wind, intense restlessness, red hot face, unquenchable thirst',
      category: 'Acute Pediatrics',
      rubrics: [
        { chapter: 'FEVER', name: 'HIGH - sudden onset', confidence: 99, grade: 3 },
        { chapter: 'MIND', name: 'RESTLESSNESS - anxious', confidence: 96, grade: 3 },
        { chapter: 'GENERALITIES', name: 'WIND - cold dry - agg.', confidence: 98, grade: 3 },
        { chapter: 'STOMACH', name: 'THIRST - extreme', confidence: 94, grade: 2 }
      ],
      remedies: [
        { name: 'Aconitum Napellus', score: 12, rubricsCovered: '4/4', rank: 1, match: 99.2, potency: '30C' },
        { name: 'Belladonna', score: 10, rubricsCovered: '4/4', rank: 2, match: 92.5, potency: '200C' },
        { name: 'Arsenicum Album', score: 8, rubricsCovered: '3/4', rank: 3, match: 87.9, potency: '30C' },
        { name: 'Ferrum Phosphoricum', score: 6, rubricsCovered: '2/4', rank: 4, match: 83.1, potency: '6X' }
      ]
    }
  ];

  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const currentScenario = sampleScenarios[activeScenarioIndex];

  // 4 Feature Cards below
  const features = [
    {
      icon: Brain,
      title: 'AI Rubric Synthesis',
      description: 'Transforms unstructured Hindi and English patient narratives into official Kent & Boenninghausen repertory rubrics in real-time.',
      badge: 'NLP Core'
    },
    {
      icon: Zap,
      title: 'Vectorized Remedy Matching',
      description: 'Evaluates 2,500+ remedies across 37 repertory chapters using high-dimensional clinical vector embeddings for constitutional accuracy.',
      badge: '99.4% Accuracy'
    },
    {
      icon: FileText,
      title: 'Digital Rx & WhatsApp Dispatch',
      description: 'Generates official clinic digital prescriptions with custom dosage instructions and direct one-click WhatsApp dispatch to patients.',
      badge: 'Instant Rx'
    },
    {
      icon: Activity,
      title: 'Kent’s 12 Observations Log',
      description: 'Tracks longitudinal patient recovery trajectories, aggravation patterns, and second prescription guidance over continuous follow-ups.',
      badge: 'Clinical Telemetry'
    }
  ];

  return (
    <section id="homeoai" className="py-20 lg:py-32 bg-[#051329] text-[#F8F9FA] relative overflow-hidden z-20 rounded-t-[2.5rem] lg:rounded-t-[3.5rem] shadow-[0_-25px_60px_rgba(0,0,0,0.45)] border-t border-white/10">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#062E6F]/40 via-[#084A9E]/25 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#C86B5E]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 halftone-dots opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C86B5E] animate-pulse" />
            <span className="font-mono-ledger text-xs uppercase tracking-widest text-[#E89B8F] font-semibold">
              HOMEOAI CLINICAL REPERTORIZATION SUITE
            </span>
          </div>

          <h2 className="font-secondary-regular font-light text-3.5xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
            Intelligence meets <span className="font-secondary-regular italic text-[#E89B8F]">classical homeopathy</span>
          </h2>
          <p className="font-primary-regular text-base sm:text-lg text-white/80 leading-relaxed">
            State-of-the-art AI symptom analysis. Real-time Kent repertory matching, rubric vectorization, and medicine distribution matrix.
          </p>
        </div>

        {/* HERO INTERACTIVE PRODUCT MOCKUP CONTAINER (No Overlapping Badges) */}
        <div className="relative mb-16 sm:mb-20">

          {/* Main macOS Dashboard Window */}
          <div className="bg-[#0A1833] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl">
            
            {/* macOS Window Title Bar with Embedded Badges (Clean, zero overlap) */}
            <div className="bg-[#061226] px-4 sm:px-6 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono-ledger text-xs text-white/60 hidden sm:inline-block font-semibold">
                  HomeoAI Repertory Engine v2.4
                </span>
              </div>

              {/* Seamlessly Integrated Badges Bar (No clipping/overlapping) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center gap-1.5 bg-[#062E6F]/80 border border-white/15 px-2.5 py-1 rounded-full text-[11px] font-mono-ledger text-white">
                  <Zap className="w-3 h-3 text-[#C86B5E]" />
                  <span>Kent Instant Vector Match</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-mono-ledger text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>99.4% Clinical Accuracy</span>
                </div>
              </div>
            </div>

            {/* Interactive Control Strip (Scenario Selectors) */}
            <div className="p-4 sm:p-5 bg-[#08152E] border-b border-white/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C86B5E]" />
                  <span className="font-mono-ledger text-xs text-white/90 uppercase tracking-wider font-semibold">
                    SELECT CLINICAL CASE SAMPLE:
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {sampleScenarios.map((scenario, index) => (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenarioIndex(index)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-primary-medium transition-all duration-200 cursor-pointer ${
                        activeScenarioIndex === index
                          ? 'bg-[#C86B5E] text-white shadow-md font-semibold scale-105'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {scenario.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Console Interior Layout - Left: Symptoms & Rubrics Found | Right: List of Medicines */}
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              
              {/* LEFT COLUMN (7 cols): Searched Symptoms + Matched Rubrics Found by AI */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Search / Entered Symptoms Bar */}
                <div className="bg-[#050E1F] border border-white/15 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono-ledger uppercase tracking-wider text-white/60 flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-[#C86B5E]" />
                      Patient Symptoms Input
                    </span>
                    <span className="text-[10px] font-mono-ledger text-[#E89B8F] bg-[#C86B5E]/15 px-2 py-0.5 rounded border border-[#C86B5E]/30">
                      {currentScenario.category}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentScenario.id + '_symptom'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="font-mono-ledger text-xs sm:text-sm text-white/95 leading-relaxed pt-1"
                    >
                      "{currentScenario.symptomQuery}"
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Rubrics Found by AI Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2 font-mono-ledger uppercase tracking-wider">
                      <Cpu className="w-4 h-4 text-[#C86B5E]" />
                      Matched Rubrics Found by AI ({currentScenario.rubrics.length})
                    </h4>
                    <span className="text-xs text-emerald-400 font-mono-ledger">NLP Score: 98.2%</span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentScenario.id + '_rubrics'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2.5"
                    >
                      {currentScenario.rubrics.map((rubric, idx) => (
                        <div 
                          key={idx}
                          className="bg-[#08152E] border border-white/10 rounded-lg p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:border-white/25 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="inline-block text-[10px] font-mono-ledger text-[#E89B8F] uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10 mr-2">
                                {rubric.chapter}
                              </span>
                              <span className="font-mono-ledger text-xs sm:text-sm text-white/90 font-medium truncate">
                                {rubric.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-mono-ledger text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded hidden sm:inline-block">
                              Grade {rubric.grade}
                            </span>
                            <span className="font-mono-ledger text-xs text-[#E89B8F] font-bold bg-[#C86B5E]/20 px-2 py-0.5 rounded">
                              {rubric.confidence}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>

              {/* RIGHT COLUMN (5 cols): List of Medicines (HomeoAI Medicine Distribution Layout) */}
              <div className="lg:col-span-5 bg-[#08152E] border border-white/15 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2 font-mono-ledger uppercase tracking-wider">
                      <BarChart2 className="w-4 h-4 text-[#C86B5E]" />
                      Remedy Distribution Matrix
                    </h4>
                    <span className="text-[10px] font-mono-ledger text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      RANKED
                    </span>
                  </div>

                  {/* List of Medicines Table / Cards */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentScenario.id + '_remedies'}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      {currentScenario.remedies.map((remedy, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg border transition-all ${
                            idx === 0 
                              ? 'bg-[#0F244A] border-[#C86B5E]/40 shadow-lg' 
                              : 'bg-[#050E1F]/60 border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-mono-ledger mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                idx === 0 
                                  ? 'bg-[#C86B5E] text-white' 
                                  : 'bg-white/10 text-white/70'
                              }`}>
                                #{remedy.rank}
                              </span>
                              <span className="text-white font-bold text-xs sm:text-sm">
                                {remedy.name}
                              </span>
                            </div>
                            <span className="text-[#E89B8F] font-bold text-xs">
                              {remedy.match}% Match
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${remedy.match}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.08 }}
                              className={`h-full rounded-full ${
                                idx === 0 
                                  ? 'bg-gradient-to-r from-[#C86B5E] to-[#E89B8F]' 
                                  : 'bg-white/40'
                              }`}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-white/60 font-mono-ledger">
                            <span>Rubrics Covered: <strong className="text-white">{remedy.rubricsCovered}</strong></span>
                            <span>Score: <strong className="text-[#E89B8F]">{remedy.score} pts</strong></span>
                            <span>Potency: <strong className="text-emerald-400">{remedy.potency}</strong></span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10">
                  <button
                    onClick={onTryPlatformClick}
                    className="w-full py-2.5 rounded-lg bg-[#C86B5E] hover:bg-[#B85A4D] text-white font-primary-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    Open Full Repertory Analyzer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 4-CARD ASYMMETRICAL FEATURE LEDGER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#0A1833]/80 border border-white/10 rounded-2xl p-6 hover:border-white/25 hover:bg-[#0C1E42] transition-all duration-300 group flex flex-col justify-between backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-[#C86B5E]/20 group-hover:border-[#C86B5E]/40 transition-colors">
                      <IconComponent className="w-6 h-6 text-[#E89B8F] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-mono-ledger uppercase text-[#E89B8F] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="font-secondary-regular text-lg font-semibold text-white mb-2 group-hover:text-[#E89B8F] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="font-primary-regular text-xs sm:text-sm text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono-ledger text-white/50 group-hover:text-white/80 transition-colors">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#C86B5E]" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* HIGH-IMPACT CTA BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-r from-[#061E42] via-[#0A2654] to-[#061E42] border border-white/20 p-8 sm:p-12 text-center overflow-hidden shadow-2xl"
        >
          {/* Subtle glow circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C86B5E]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="font-secondary-regular font-light text-2.5xl sm:text-4xl text-white">
              Ready to experience <span className="font-secondary-regular italic text-[#E89B8F]">AI-powered clinical practice?</span>
            </h3>
            
            <p className="font-primary-regular text-sm sm:text-base text-white/80 leading-relaxed">
              Login to access advanced symptom analysis, digital prescriptions, Kent Repertory vector search, and complete patient record management.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onTryPlatformClick}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#C86B5E] hover:bg-[#B85A4D] text-white rounded-xl font-primary-semibold text-base transition-all shadow-xl hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
              >
                Access HomeoAI Platform
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
