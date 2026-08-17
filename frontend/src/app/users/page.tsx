// @ts-nocheck
"use client";

import { useState } from 'react';
import { 
  Search, 
  Sparkles,
  FileText,
  Clock,
  Heart,
  User,
  ChevronRight,
  Pill,
  Activity,
  TrendingUp,
  Calendar,
  Download,
  Plus,
  Filter,
  X,
  Check,
  AlertCircle,
  Info,
  Star,
  Zap,
  Shield
} from 'lucide-react';

const PatientDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const recentSearches = [
    { id: 1, symptoms: 'Headache, Nausea', date: '2 hours ago', remedies: 3 },
    { id: 2, symptoms: 'Anxiety, Insomnia', date: '1 day ago', remedies: 5 },
    { id: 3, symptoms: 'Fever, Body ache', date: '3 days ago', remedies: 4 },
  ];

  const popularSymptoms = [
    { id: 1, name: 'Headache', category: 'Head', icon: '🤕' },
    { id: 2, name: 'Anxiety', category: 'Mind', icon: '😰' },
    { id: 3, name: 'Fever', category: 'General', icon: '🤒' },
    { id: 4, name: 'Cough', category: 'Chest', icon: '😷' },
    { id: 5, name: 'Nausea', category: 'Stomach', icon: '🤢' },
    { id: 6, name: 'Insomnia', category: 'Sleep', icon: '😴' },
    { id: 7, name: 'Fatigue', category: 'General', icon: '😮‍💨' },
    { id: 8, name: 'Joint Pain', category: 'Extremities', icon: '🦴' },
  ];

  const suggestedSymptoms = [
    'Morning headache',
    'Throbbing pain',
    'Worse from light',
    'Better lying down',
    'With nausea',
  ];

  const remedyResults = [
    { 
      name: 'Belladonna', 
      latinName: 'Atropa Belladonna',
      grade: 5, 
      match: 95,
      potency: '200C',
      description: 'Excellent match for throbbing headache with heat and light sensitivity',
      keySymptoms: ['Throbbing pain', 'Heat', 'Light sensitivity']
    },
    { 
      name: 'Nux Vomica', 
      latinName: 'Strychnos Nux-vomica',
      grade: 4, 
      match: 87,
      potency: '30C',
      description: 'Good match for morning headache with digestive symptoms',
      keySymptoms: ['Morning worse', 'Nausea', 'Irritability']
    },
    { 
      name: 'Bryonia', 
      latinName: 'Bryonia Alba',
      grade: 3, 
      match: 78,
      potency: '30C',
      description: 'Moderate match for headache worse from motion',
      keySymptoms: ['Worse from motion', 'Better lying still', 'Bursting pain']
    },
  ];

  const addSymptom = (symptom) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const removeSymptom = (id) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== id));
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length > 0) {
      setShowResults(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 sm:px-8 py-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Your Remedy</h1>
                <p className="text-sm text-gray-600 mt-0.5">Tell us your symptoms, we'll suggest remedies</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Guest User</p>
                  <p className="text-xs text-gray-500">Patient</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#3F856C] to-[#2d6050] rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  G
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search symptoms... (e.g., headache, fever, anxiety)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white focus:border-gray-900 transition-all text-base"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 sm:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Your Searches</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-gray-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Remedies Found</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-10 h-10 bg-[#3F856C] rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Last Search</p>
                <p className="text-2xl font-bold text-gray-900">2h</p>
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-900 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#3F856C]" />
                Selected Symptoms ({selectedSymptoms.length})
              </h3>
              <button 
                onClick={() => setSelectedSymptoms([])}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSymptoms.map((symptom) => (
                <div 
                  key={symptom.id}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-medium text-sm"
                >
                  <span className="text-lg">{symptom.icon}</span>
                  <span>{symptom.name}</span>
                  <button 
                    onClick={() => removeSymptom(symptom.id)}
                    className="ml-1 hover:bg-white/20 rounded-lg p-0.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={analyzeSymptoms}
              className="w-full py-4 bg-[#3F856C] text-white rounded-xl font-bold text-base hover:bg-[#2d6050] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Analyze & Find Remedies
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Popular Symptoms */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Popular Symptoms</h3>
              <p className="text-sm text-gray-600 mt-0.5">Select symptoms you're experiencing</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularSymptoms.map((symptom) => {
              const isSelected = selectedSymptoms.find(s => s.id === symptom.id);
              return (
                <button
                  key={symptom.id}
                  onClick={() => isSelected ? removeSymptom(symptom.id) : addSymptom(symptom)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-gray-900 bg-gray-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-900 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">{symptom.icon}</div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{symptom.name}</p>
                  <p className="text-xs text-gray-600">{symptom.category}</p>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-[#3F856C] text-xs font-bold">
                      <Check className="w-3 h-3" />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">How It Works</h3>
              <p className="text-gray-300 text-sm">Our intelligent system analyzes your symptoms and suggests the best homeopathic remedies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="w-10 h-10 bg-[#3F856C] rounded-lg flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold mb-1">1. Select Symptoms</h4>
              <p className="text-sm text-gray-400">Choose from popular symptoms or search for specific ones</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="w-10 h-10 bg-[#3F856C] rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold mb-1">2. AI Analysis</h4>
              <p className="text-sm text-gray-400">Our system matches symptoms with remedies using expert data</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="w-10 h-10 bg-[#3F856C] rounded-lg flex items-center justify-center mb-3">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold mb-1">3. Get Results</h4>
              <p className="text-sm text-gray-400">Receive ranked remedy suggestions with detailed information</p>
            </div>
          </div>
        </div>

        {/* Recent Searches */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Searches</h3>
              <p className="text-sm text-gray-600 mt-0.5">Your previous symptom analyses</p>
            </div>
            <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentSearches.map((search) => (
              <div key={search.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{search.symptoms}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {search.date}
                        </span>
                        <span className="text-[#3F856C] font-medium flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5" />
                          {search.remedies} remedies found
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {showResults && selectedSymptoms.length > 0 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#3F856C] to-[#2d6050] rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Analysis Complete!</h2>
                  <p className="text-green-100 text-sm mt-0.5">Found {remedyResults.length} matching remedies for your symptoms</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recommended Remedies</h3>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>

              <div className="space-y-4">
                {remedyResults.map((remedy, idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-900 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ${
                            remedy.grade === 5 ? 'bg-gray-900 text-white' :
                            remedy.grade === 4 ? 'bg-[#3F856C] text-white' :
                            'bg-orange-400 text-white'
                          }`}>
                            {remedy.grade}
                          </div>
                          <span className="text-xs font-bold text-gray-600">Grade</span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold text-gray-900">{remedy.name}</h4>
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold">
                              {remedy.potency}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 italic mb-3">{remedy.latinName}</p>
                          <p className="text-sm text-gray-700 mb-4">{remedy.description}</p>

                          <div className="flex flex-wrap gap-2">
                            {remedy.keySymptoms.map((symptom, i) => (
                              <span key={i} className="bg-green-50 text-[#3F856C] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-3xl font-bold text-gray-900">{remedy.match}%</div>
                        <p className="text-xs text-gray-600 font-medium mt-1">Match</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-black transition-colors">
                        View Details
                      </button>
                      <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-2">Important Medical Advice</p>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    This analysis is for informational purposes only. Always consult with a qualified homeopathic practitioner or healthcare provider before taking any remedies. Self-medication can be harmful if not done under proper guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
