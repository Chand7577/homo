import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, List, ArrowRight, RefreshCw, Brain } from 'lucide-react';
import RubricBrowser, { rubricMedicinesArray } from './RubricBrowser';
import RepertoryChart from './RepertoryChart';
import MedicineDistribution from './MedicineDistribution';
import PrescriptionForm from './PrescriptionForm';
import ResizableSplitPane from './ResizableSplitPane';
import { getRepertories } from '../services/api';

export default function ManualRepertorization({ currentUser = null, lang = 'en', onPrescriptionSaved }) {
  // Repertory state
  const [repertories, setRepertories] = useState([]);
  const [selectedRep, setSelectedRep] = useState(null);
  const [loadingReps, setLoadingReps] = useState(false);
  const [repError, setRepError] = useState('');
  
  // Manual selection state
  const [selectedRubrics, setSelectedRubrics] = useState([]);
  const [calculatingManual, setCalculatingManual] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  
  // Step state: 1=Select Repertory, 2=Select Rubrics, 3=Results, 4=Prescription
  const [step, setStep] = useState(1);
  
  // Selected medicines for prescription
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  const t = (en, hi) => (lang === 'en' ? en : hi);

  // Load repertories
  useEffect(() => {
    const loadRepertories = async () => {
      setLoadingReps(true);
      try {
        const data = await getRepertories({ type: 'Repertory' });
        const filtered = (data || []).filter(r => 
          r.type !== 'Reference' && 
          !r.name.toLowerCase().includes('materia medica') && 
          !r.name.toLowerCase().includes('reference')
        );
        setRepertories(filtered);
        setRepError('');
      } catch (error) {
        console.error('Failed to load repertories:', error);
        setRepError(t('Could not load repertories. Check server connection.', 'रेपरटॉरी लोड नहीं हुई।'));
      } finally {
        setLoadingReps(false);
      }
    };
    loadRepertories();
  }, []);

  // Handlers
  const handleAddRubric = (rubric) => {
    if (!selectedRubrics.find(r => (r._id || r.id) === (rubric._id || rubric.id))) {
      setSelectedRubrics(prev => [...prev, rubric]);
    }
  };

  const handleRemoveRubric = (rubric) => {
    setSelectedRubrics(prev => 
      prev.filter(r => (r._id || r.id) !== (rubric._id || rubric.id))
    );
  };

  const calculateManualAnalysis = () => {
    if (selectedRubrics.length === 0) {
      alert(t('Please select at least one rubric', 'कृपया कम से कम एक रुब्रिक चुनें'));
      return;
    }

    setCalculatingManual(true);
    setAnalysisError('');
    
    try {
      const medicineScores = {};
      
      selectedRubrics.forEach((rubric) => {
        // Normalise medicines: schema stores as Map<name,grade> or plain object
        const medicines = rubricMedicinesArray(rubric);
        const symptomText = rubric?.rubric?.en || rubric?.symptom || '';
        
        medicines.forEach(({ name, grade }) => {
          const g = parseInt(grade) || 1;
          if (!name) return;
          
          if (!medicineScores[name]) {
            medicineScores[name] = {
              name,
              totalScore: 0,
              rubricsCount: 0,
              grades: [],
              rubricDetails: []
            };
          }
          
          medicineScores[name].totalScore += g;
          medicineScores[name].rubricsCount += 1;
          medicineScores[name].grades.push(g);
          medicineScores[name].rubricDetails.push({
            rubricText: symptomText,
            grade: g
          });
        });
      });
      
      const sortedMedicines = Object.values(medicineScores)
        .sort((a, b) => {
          if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
          if (b.rubricsCount !== a.rubricsCount) return b.rubricsCount - a.rubricsCount;
          return a.name.localeCompare(b.name);
        })
        .map((m, idx) => ({ ...m, rank: idx + 1 }));
      
      const matchedRubrics = selectedRubrics.map(rubric => {
        const chName = rubric?.chapter?.en || (typeof rubric?.chapter === 'string' ? rubric?.chapter : '');
        const rName = rubric?.rubric?.en || rubric?.symptom || '';
        const subName = rubric?.subrubric?.en || '';
        const fullText = subName ? `${rName} — ${subName}` : rName;

        return {
          rubricId: rubric._id || rubric.id,
          symptom: fullText,
          rubricText: fullText,
          chapter: typeof rubric?.chapter === 'object' ? rubric.chapter : { en: chName, hi: '' },
          rubric: typeof rubric?.rubric === 'object' ? rubric.rubric : { en: rName, hi: '' },
          subrubric: typeof rubric?.subrubric === 'object' ? rubric.subrubric : { en: subName, hi: '' },
          medicines: rubricMedicinesArray(rubric).reduce((acc, { name, grade }) => {
            if (name) acc[name] = grade;
            return acc;
          }, {}),
          score: rubricMedicinesArray(rubric).length
        };
      });
      
      setAnalysisResult({
        matchedRubrics: matchedRubrics,
        medicineDistribution: sortedMedicines,
        aiUsed: false,
        manual: true,
        repertoryName: selectedRep?.name || 'Manual Selection',
        stats: {
          totalRubrics: selectedRubrics.length,
          totalMedicines: sortedMedicines.length,
          manual: true
        }
      });
      
      setStep(3);
      
    } catch (err) {
      console.error('Manual calculation failed:', err);
      setAnalysisError(t('Calculation failed. Please try again.', 'गणना विफल। कृपया पुनः प्रयास करें।'));
    } finally {
      setCalculatingManual(false);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setSelectedRep(null);
    setSelectedRubrics([]);
    setAnalysisResult(null);
    setAnalysisError('');
    setSelectedMedicines([]);
  };

  // Step 1: Select Repertory
  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <BookOpen className="h-8 w-8 text-[#062E6F]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {t('Manual Repertorization', 'मैनुअल रेपरटोराइज़ेशन')}
            </h2>
            <p className="text-sm text-slate-600">
              {t('Traditional homeopathic case analysis - Browse rubrics, build your case, and calculate remedy scores manually', 
                  'पारंपरिक होम्योपैथिक केस विश्लेषण - रुब्रिक्स ब्राउज़ करें, केस बनाएं, और मैन्युअल रूप से दवा स्कोर की गणना करें')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {t('Step 1: Select Repertory', 'चरण 1: रेपरटॉरी चुनें')}
        </h3>

        {loadingReps ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-[#062E6F]"></div>
            <p className="mt-4 text-sm text-slate-600">{t('Loading repertories...', 'रेपरटॉरी लोड हो रही हैं...')}</p>
          </div>
        ) : repError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">{t('Error', 'त्रुटि')}</p>
              <p className="text-xs text-red-600">{repError}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {repertories.map(rep => (
              <button
                key={rep._id || rep.id}
                onClick={() => {
                  setSelectedRep(rep);
                  setStep(2);
                }}
                className="text-left p-4 border-2 border-slate-200 rounded-xl hover:border-[#062E6F] hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 mb-1 group-hover:text-[#062E6F]">{rep.name}</p>
                    <p className="text-xs text-slate-500">
                      {rep.rubricCount || 0} {t('rubrics', 'रुब्रिक्स')} • {rep.author || 'Unknown'}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#062E6F] shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Step 2: Select Rubrics
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {t('Step 2: Select Rubrics', 'चरण 2: रुब्रिक्स चुनें')}
            </h3>
            <p className="text-xs text-slate-600">
              {t('Repertory:', 'रेपरटॉरी:')} <span className="font-semibold">{selectedRep?.name}</span>
            </p>
          </div>
          <button
            onClick={() => setStep(1)}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
          >
            ← {t('Change Repertory', 'रेपरटॉरी बदलें')}
          </button>
        </div>
      </div>

      <RubricBrowser
        selectedRubrics={selectedRubrics}
        onAddRubric={handleAddRubric}
        onRemoveRubric={handleRemoveRubric}
        onCalculate={calculateManualAnalysis}
        repertory={selectedRep}
        lang={lang}
        calculating={calculatingManual}
      />

      {analysisError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">{t('Error', 'त्रुटि')}</p>
            <p className="text-xs text-red-600">{analysisError}</p>
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: Results
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {t('Step 3: Analysis Results', 'चरण 3: विश्लेषण परिणाम')}
            </h3>
            <p className="text-xs text-slate-600">
              {selectedRubrics.length} {t('rubrics analyzed', 'रुब्रिक्स का विश्लेषण किया गया')} • 
              {' '}{analysisResult?.medicineDistribution?.length || 0} {t('remedies found', 'दवाएं मिलीं')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              ← {t('Back', 'वापस')}
            </button>
            <button
              onClick={handleRestart}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('New Analysis', 'नया विश्लेषण')}
            </button>
          </div>
        </div>
      </div>

      <ResizableSplitPane
        initialLeftWidth={50}
        minLeftWidth={25}
        maxLeftWidth={75}
        leftContent={
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
              <List className="h-4 w-4 text-[#062E6F]" />
              {t('Repertory Chart', 'रेपरटॉरी चार्ट')}
            </h4>
            <div className="flex-1 overflow-x-auto min-w-0">
              <RepertoryChart 
                matchedRubrics={analysisResult?.matchedRubrics || []} 
                lang={lang} 
              />
            </div>
          </div>
        }
        rightContent={
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
            <h4 className="text-sm font-bold text-slate-800 mb-4 shrink-0">
              {t('Medicine Distribution', 'दवा वितरण')}
            </h4>
            <div className="flex-1 min-w-0">
              <MedicineDistribution
                distribution={analysisResult?.medicineDistribution || []}
                lang={lang}
                onSelect={med => {
                  setSelectedMedicines([med.name]);
                  setStep(4);
                }}
              />
            </div>
          </div>
        }
      />

      <div className="flex justify-center">
        <button
          onClick={() => setStep(4)}
          className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#062E6F] to-blue-700 hover:from-[#042050] hover:to-blue-800 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          {t('Create Prescription', 'प्रिस्क्रिप्शन बनाएं')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Step 4: Prescription
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">
          {t('Step 4: Create Prescription', 'चरण 4: प्रिस्क्रिप्शन बनाएं')}
        </h3>
        <button
          onClick={() => setStep(3)}
          className="px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
        >
          ← {t('Back to Results', 'परिणामों पर वापस')}
        </button>
      </div>

      <PrescriptionForm
        currentUser={currentUser}
        selectedMedicines={selectedMedicines}
        analysisResult={analysisResult}
        lang={lang}
        onPrescriptionSaved={(prescription) => {
          if (onPrescriptionSaved) onPrescriptionSaved(prescription);
          alert(t('Prescription saved successfully!', 'प्रिस्क्रिप्शन सफलतापूर्वक सहेजी गई!'));
          handleRestart();
        }}
        onCancelEdit={handleRestart}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
}
