import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Cpu,
  BarChart2,
  BookOpen,
  Award,
  Database,
  Play,
  RotateCcw,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileText,
  Zap
} from 'lucide-react';

export default function HomeoAISection({ onTryPlatformClick }) {
  // 4 Steps representing the exact clinical workflow in RubricAnalyzer.jsx & RepertoriesTab.jsx
  const steps = [
    { id: 1, name: '1. Select Repertory', short: 'Repertory' },
    { id: 2, name: '2. Input Symptoms', short: 'Symptoms' },
    { id: 3, name: '3. AI Analysis', short: 'AI Analysis' },
    { id: 4, name: '4. Chart & Remedies', short: 'Repertorization' },
  ];

  const availableRepertories = [
    { id: 'kent', title: "Kent's Repertory of Homeopathic Materia Medica", chapters: 37, rubrics: '12,400+', default: true },
    { id: 'boericke', title: 'Boericke Pocket Manual of Materia Medica', chapters: 24, rubrics: '8,900+', default: false },
    { id: 'custom', title: 'Dr. Nautiyal Master Repertory Database', chapters: 42, rubrics: '15,000+', default: false }
  ];

  const sampleScenarios = [
    {
      id: 'migraine',
      label: 'Migraine & Weather',
      symptomQuery: 'Chronic right-sided throbbing headache, worse in damp weather, thirstless, relieved by cool open air',
      category: 'Head & Thermal',
      rubrics: [
        { chapter: 'HEAD', rubric: 'PAIN', subrubric: 'right side', confidence: 98, agg: 'damp weather', amel: 'open air', grades: { 'Pulsatilla': 3, 'Rhus Tox': 3, 'Silicea': 2, 'Spigelia': 2 } },
        { chapter: 'GENERALITIES', rubric: 'WEATHER', subrubric: 'damp - agg.', confidence: 94, agg: 'cold damp', amel: 'dry warmth', grades: { 'Pulsatilla': 3, 'Rhus Tox': 3, 'Silicea': 2, 'Dulcamara': 3 } },
        { chapter: 'STOMACH', rubric: 'THIRSTLESS', subrubric: 'fever during', confidence: 96, agg: 'heat', amel: 'cold drink', grades: { 'Pulsatilla': 3, 'Apis': 3, 'Gelsemium': 2, 'Silicea': 1 } },
        { chapter: 'GENERALITIES', rubric: 'AIR', subrubric: 'open - amel.', confidence: 91, agg: 'warm room', amel: 'cool breeze', grades: { 'Pulsatilla': 3, 'Allium Cepa': 2, 'Sabina': 2, 'Rhus Tox': 1 } }
      ],
      remedies: [
        { name: 'Pulsatilla Nigricans', score: 12, rubricsCovered: 4, rank: 1, match: 98, g3: 4, g2: 0, g1: 0 },
        { name: 'Rhus Toxicodendron', score: 9, rubricsCovered: 3, rank: 2, match: 89, g3: 2, g2: 1, g1: 1 },
        { name: 'Silicea Terra', score: 8, rubricsCovered: 3, rank: 3, match: 84, g3: 1, g2: 2, g1: 1 },
        { name: 'Spigelia Anthelmia', score: 6, rubricsCovered: 2, rank: 4, match: 78, g3: 1, g2: 1, g1: 1 }
      ]
    },
    {
      id: 'pcod',
      label: 'PCOD & Hormonal',
      symptomQuery: 'Irregular delayed menses with facial acne, emotional tearfulness, thermal intolerance to warm rooms',
      category: 'Gynecology & Mind',
      rubrics: [
        { chapter: 'FEMALE', rubric: 'MENSES', subrubric: 'irregular, delayed', confidence: 97, agg: 'exertion', amel: 'rest', grades: { 'Pulsatilla': 3, 'Sepia': 3, 'Calc Carb': 2, 'Lachesis': 2 } },
        { chapter: 'FACE', rubric: 'ERUPTIONS', subrubric: 'acne - forehead', confidence: 92, agg: 'warmth', amel: 'washing', grades: { 'Pulsatilla': 2, 'Sepia': 3, 'Calc Carb': 3, 'Sulphur': 2 } },
        { chapter: 'MIND', rubric: 'WEEPING', subrubric: 'mood - tearful', confidence: 95, agg: 'consolation', amel: 'alone', grades: { 'Pulsatilla': 3, 'Sepia': 2, 'Ignatia': 3, 'Nat Mur': 3 } },
        { chapter: 'GENERALITIES', rubric: 'WARMTH', subrubric: 'aggravation', confidence: 89, agg: 'stuffy room', amel: 'cool air', grades: { 'Pulsatilla': 3, 'Sepia': 2, 'Apis': 2, 'Lachesis': 2 } }
      ],
      remedies: [
        { name: 'Pulsatilla Nigricans', score: 11, rubricsCovered: 4, rank: 1, match: 96, g3: 3, g2: 1, g1: 0 },
        { name: 'Sepia Officinalis', score: 10, rubricsCovered: 4, rank: 2, match: 92, g3: 2, g2: 2, g1: 0 },
        { name: 'Calcarea Carbonica', score: 8, rubricsCovered: 3, rank: 3, match: 85, g3: 1, g2: 2, g1: 1 },
        { name: 'Lachesis Mutus', score: 7, rubricsCovered: 3, rank: 4, match: 80, g3: 1, g2: 2, g1: 0 }
      ]
    }
  ];

  const [activeStep, setActiveStep] = useState(1);
  const [selectedRep, setSelectedRep] = useState('kent');
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const currentScenario = sampleScenarios[activeScenarioIndex];

  // Auto-advance through the workflow steps every 4.5 seconds if autoplay is enabled
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const features = [
    {
      icon: Database,
      title: 'Multi-Repertory Ingestion',
      description: 'Select from Kent, Boericke, or upload custom clinical repertory datasets with standardized hierarchical rubric mapping.',
      badge: 'Database Core'
    },
    {
      icon: Brain,
      title: 'AI Rubric Synthesis',
      description: 'Transforms unstructured Hindi and English patient narratives into official Kent repertory rubrics with confidence scores.',
      badge: 'Bilingual NLP'
    },
    {
      icon: BarChart2,
      title: 'Remedy Grade Matrix',
      description: 'Calculates cumulative weighted grades (1°–3°) across rubrics to display real-time medicine rankings and coverage charts.',
      badge: 'Grade Scoring'
    },
    {
      icon: FileText,
      title: 'Digital Rx & WhatsApp',
      description: 'One-click conversion of repertorized remedies into official clinic prescriptions sent directly to patients via WhatsApp.',
      badge: 'Instant Dispatch'
    }
  ];

  return (
    <section id="homeoai" className="py-20 lg:py-32 bg-[#051329] text-[#F8F9FA] relative z-20 rounded-t-[2.5rem] lg:rounded-t-[3.5rem] border-t border-white/10">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C86B5E] animate-pulse" />
            <span className="font-mono-ledger text-xs uppercase tracking-widest text-[#E89B8F] font-semibold">
              HOMEOAI CLINICAL REPERTORIZATION SUITE
            </span>
          </div>

          <h2 className="font-secondary-regular font-light text-3.5xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
            Intelligence meets <span className="font-secondary-regular italic text-[#E89B8F]">classical homeopathy</span>
          </h2>
          <p className="font-primary-regular text-base sm:text-lg text-white/80 leading-relaxed">
            Experience the complete 4-step AI repertorization workflow: from selecting repertories to symptom matching, repertory chart generation, and medicine distribution.
          </p>
        </div>

        {/* HERO INTERACTIVE WORKFLOW SIMULATOR */}
        <div className="relative mb-16 sm:mb-20">

          {/* Main macOS Dashboard Window */}
          <div className="bg-[#0A1833] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Window Header & Autoplay Toggle */}
            <div className="bg-[#061226] px-4 sm:px-6 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono-ledger text-xs text-white/60 hidden sm:inline-block font-semibold">
                  HomeoAI Clinical Workflow Simulator
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-ledger transition-colors cursor-pointer ${
                    isAutoPlaying
                      ? 'bg-[#C86B5E]/20 text-[#E89B8F] border border-[#C86B5E]/40'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isAutoPlaying ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  <span>{isAutoPlaying ? 'Auto-Advancing Demo' : 'Paused (Click Steps)'}</span>
                </button>
              </div>
            </div>

            {/* Step Navigation Bar */}
            <div className="p-3 sm:p-4 bg-[#08152E] border-b border-white/10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {steps.map((step) => {
                  const isActive = activeStep === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        setActiveStep(step.id);
                        setIsAutoPlaying(false);
                      }}
                      className={`px-3 py-2.5 rounded-xl text-xs font-mono-ledger transition-all duration-300 text-left flex items-center justify-between cursor-pointer border ${
                        isActive
                          ? 'bg-[#C86B5E] text-white border-[#E89B8F]/50 shadow-lg font-bold'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{step.name}</span>
                      {isActive && <ChevronRight className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP WORKFLOW CONTAINER — all 4 panels always in DOM, CSS opacity switch = zero flash */}
            <div className="min-h-[480px] sm:min-h-[450px] relative bg-[#0A1833] rounded-b-2xl sm:rounded-b-3xl overflow-hidden">

              {/* STEP 1: SELECT REPERTORY */}
              <div className={activeStep === 1 ? 'block' : 'hidden'}>
                <div className="p-6 sm:p-8 space-y-6 bg-[#0A1833] min-h-[480px] sm:min-h-[450px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <div>
                        <span className="text-xs font-mono-ledger text-[#E89B8F] uppercase tracking-wider">Step 1 of 4</span>
                        <h3 className="text-lg sm:text-xl font-secondary-regular text-white font-semibold flex items-center gap-2">
                          <Database className="w-5 h-5 text-[#C86B5E]" />
                          Select Repertory Source
                        </h3>
                      </div>
                      <span className="text-xs text-white/50 font-mono-ledger">Choose from active database</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {availableRepertories.map((rep) => (
                        <div
                          key={rep.id}
                          onClick={() => setSelectedRep(rep.id)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                            selectedRep === rep.id
                              ? 'bg-[#0F244A] border-[#C86B5E] shadow-xl ring-2 ring-[#C86B5E]/30'
                              : 'bg-[#050E1F]/60 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <BookOpen className={`w-6 h-6 ${selectedRep === rep.id ? 'text-[#E89B8F]' : 'text-white/40'}`} />
                              {selectedRep === rep.id && (
                                <span className="text-[10px] bg-[#C86B5E] text-white px-2 py-0.5 rounded-full font-mono-ledger font-bold">
                                  SELECTED
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-white text-sm mb-2 leading-snug">{rep.title}</h4>
                          </div>
                          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60 font-mono-ledger">
                            <span>{rep.chapters} Chapters</span>
                            <span>{rep.rubrics} Rubrics</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => { setActiveStep(2); setIsAutoPlaying(false); }}
                      className="px-5 py-2.5 bg-[#C86B5E] hover:bg-[#B85A4D] text-white rounded-xl text-xs font-primary-medium flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      Next: Input Symptoms
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 2: INPUT SYMPTOMS */}
              <div className={activeStep === 2 ? 'block' : 'hidden'}>
                <div className="p-6 sm:p-8 space-y-6 bg-[#0A1833] min-h-[480px] sm:min-h-[450px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <div>
                        <span className="text-xs font-mono-ledger text-[#E89B8F] uppercase tracking-wider">Step 2 of 4</span>
                        <h3 className="text-lg sm:text-xl font-secondary-regular text-white font-semibold flex items-center gap-2">
                          <Search className="w-5 h-5 text-[#C86B5E]" />
                          Enter Clinical Symptoms (English &amp; Hindi)
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        {sampleScenarios.map((scen, idx) => (
                          <button
                            key={scen.id}
                            onClick={() => setActiveScenarioIndex(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-mono-ledger transition-colors ${
                              activeScenarioIndex === idx ? 'bg-[#C86B5E] text-white font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            {scen.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#050E1F] border border-white/15 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs font-mono-ledger text-white/60">
                        <span>Active Case Symptom Narrative</span>
                        <span className="text-[#E89B8F] bg-[#C86B5E]/20 px-2 py-0.5 rounded border border-[#C86B5E]/30">
                          {currentScenario.category}
                        </span>
                      </div>

                      <div className="p-4 bg-[#08152E] border border-white/10 rounded-xl font-mono-ledger text-sm text-white/90 leading-relaxed min-h-[90px]">
                        "{currentScenario.symptomQuery}"
                      </div>

                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono-ledger">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ready for AI candidate search &amp; rubric matching</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <button
                      onClick={() => { setActiveStep(1); setIsAutoPlaying(false); }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-mono-ledger"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => { setActiveStep(3); setIsAutoPlaying(false); }}
                      className="px-5 py-2.5 bg-[#C86B5E] hover:bg-[#B85A4D] text-white rounded-xl text-xs font-primary-medium flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      Run AI Analysis
                      <Brain className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 3: AI ANALYSIS */}
              <div className={activeStep === 3 ? 'block' : 'hidden'}>
                <div className="p-6 sm:p-8 space-y-6 bg-[#0A1833] min-h-[480px] sm:min-h-[450px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                      <div>
                        <span className="text-xs font-mono-ledger text-[#E89B8F] uppercase tracking-wider">Step 3 of 4</span>
                        <h3 className="text-lg sm:text-xl font-secondary-regular text-white font-semibold flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-[#C86B5E]" />
                          AI Rubric Extraction &amp; Confidence Match
                        </h3>
                      </div>
                      <span className="text-xs text-emerald-400 font-mono-ledger">4 Rubrics Synthesized</span>
                    </div>

                    <div className="space-y-2.5">
                      {currentScenario.rubrics.map((r, idx) => (
                        <div key={idx} className="bg-[#08152E] border border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono-ledger text-[#E89B8F] bg-[#C86B5E]/20 px-2 py-0.5 rounded border border-[#C86B5E]/30 uppercase font-bold">
                                {r.chapter}
                              </span>
                              <span className="font-mono-ledger text-sm text-white font-semibold">
                                {r.rubric} {r.subrubric ? `— ${r.subrubric}` : ''}
                              </span>
                            </div>
                            <div className="flex gap-3 text-xs font-mono-ledger text-white/50">
                              {r.agg && <span className="text-amber-400">▲ Agg: {r.agg}</span>}
                              {r.amel && <span className="text-emerald-400">▼ Amel: {r.amel}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] text-white/50 font-mono-ledger block">Match Confidence</span>
                              <span className="text-xs font-bold text-emerald-400 font-mono-ledger">{r.confidence}%</span>
                            </div>
                            <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <button
                      onClick={() => { setActiveStep(2); setIsAutoPlaying(false); }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-mono-ledger"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => { setActiveStep(4); setIsAutoPlaying(false); }}
                      className="px-5 py-2.5 bg-[#C86B5E] hover:bg-[#B85A4D] text-white rounded-xl text-xs font-primary-medium flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      View Chart &amp; Remedy Ranking
                      <BarChart2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 4: REPERTORIZED CHART & MEDICINE DISTRIBUTION */}
              <div className={activeStep === 4 ? 'block' : 'hidden'}>
                  <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0A1833] min-h-[480px] sm:min-h-[450px]">
                    {/* LEFT: REPERTORIZED CHART GRID (7 cols) */}
                    <div className="lg:col-span-7 bg-[#08152E] border border-white/15 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#C86B5E]" />
                            <h4 className="font-mono-ledger text-xs uppercase text-white font-bold tracking-wider">
                              Repertorized Grid Chart
                            </h4>
                          </div>
                          <div className="flex gap-1.5 text-[10px] font-mono-ledger">
                            <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">3° High</span>
                            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">2° Med</span>
                            <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">1° Low</span>
                          </div>
                        </div>

                        {/* Mini Table Header */}
                        <div className="overflow-x-auto thin-scroll">
                          <table className="w-full text-left font-mono-ledger text-xs">
                            <thead>
                              <tr className="text-white/50 border-b border-white/10">
                                <th className="pb-2">Rubric</th>
                                <th className="pb-2 text-center">Pulsatilla</th>
                                <th className="pb-2 text-center">Rhus Tox</th>
                                <th className="pb-2 text-center">Silicea</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {currentScenario.rubrics.map((r, idx) => (
                                <tr key={idx} className="text-white/80">
                                  <td className="py-2 pr-2 truncate max-w-[140px]">
                                    <span className="text-[#E89B8F] text-[10px] block uppercase">{r.chapter}</span>
                                    {r.rubric} {r.subrubric ? `(${r.subrubric})` : ''}
                                  </td>
                                  <td className="text-center py-2">
                                    <span className="bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded text-[11px]">
                                      {r.grades['Pulsatilla'] ? `${r.grades['Pulsatilla']}°` : '—'}
                                    </span>
                                  </td>
                                  <td className="text-center py-2">
                                    <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[11px]">
                                      {r.grades['Rhus Tox'] ? `${r.grades['Rhus Tox']}°` : '—'}
                                    </span>
                                  </td>
                                  <td className="text-center py-2">
                                    <span className="bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded text-[11px]">
                                      {r.grades['Silicea'] ? `${r.grades['Silicea']}°` : '—'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 text-[11px] font-mono-ledger text-white/50 flex justify-between items-center">
                        <span>4 Rubrics Matched</span>
                        <span>Kent Standard Weighting</span>
                      </div>
                    </div>

                    {/* RIGHT: MEDICINE DISTRIBUTION MATRIX (5 cols) */}
                    <div className="lg:col-span-5 bg-[#08152E] border border-white/15 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#C86B5E]" />
                            <h4 className="font-mono-ledger text-xs uppercase text-white font-bold tracking-wider">
                              Medicine Distribution
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono-ledger text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            RANKED
                          </span>
                        </div>

                        <div className="space-y-2">
                          {currentScenario.remedies.map((remedy, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border transition-all ${
                                idx === 0
                                  ? 'bg-[#0F244A] border-[#C86B5E]/50 shadow-md'
                                  : 'bg-[#050E1F]/60 border-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-mono-ledger mb-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                    idx === 0 ? 'bg-[#C86B5E] text-white' : 'bg-white/10 text-white/70'
                                  }`}>
                                    #{remedy.rank}
                                  </span>
                                  <span className="text-white font-bold truncate max-w-[120px]">{remedy.name}</span>
                                </div>
                                <span className="text-[#E89B8F] font-bold text-[11px]">{remedy.score} pts</span>
                              </div>

                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-1">
                                <div
                                  className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-[#C86B5E] to-[#E89B8F]' : 'bg-white/40'}`}
                                  style={{ width: `${remedy.match}%` }}
                                />
                              </div>

                              <div className="flex justify-between text-[10px] text-white/60 font-mono-ledger">
                                <span>Coverage: {remedy.rubricsCovered}/4 rubrics</span>
                                <span>3°×{remedy.g3}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-white/10">
                        <button
                          onClick={onTryPlatformClick}
                          className="w-full py-2 rounded-xl bg-[#C86B5E] hover:bg-[#B85A4D] text-white font-primary-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          Open Full Repertory Analyzer
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

          </div>
        </div>

        {/* 4 FEATURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[#0A1833] border border-white/10 rounded-2xl p-6 hover:border-white/25 hover:bg-[#0C1E42] transition-colors group flex flex-col justify-between"
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
              </div>
            );
          })}
        </div>

        {/* HIGH-IMPACT CTA BANNER */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#061E42] via-[#0A2654] to-[#061E42] border border-white/20 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C86B5E]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="font-secondary-regular font-light text-2.5xl sm:text-4xl text-white">
              Ready to experience <span className="font-secondary-regular italic text-[#E89B8F]">AI-powered clinical practice?</span>
            </h3>
            
            <p className="font-primary-regular text-sm sm:text-base text-white/80 leading-relaxed">
              Login to access AI symptom analysis, Kent Repertory rubric matching, digital prescriptions, and complete patient record management.
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
        </div>

      </div>
    </section>
  );
}
