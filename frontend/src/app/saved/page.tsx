// @ts-nocheck
"use client";



import { useState } from 'react';
import { 
  Search,
  Heart,
  Star,
  Calendar,
  Filter,
  ChevronRight,
  Download,
  Trash2,
  Eye,
  Edit2,
  X,
  Check,
  Pill,
  TrendingUp,
  Award,
  FileText,
  Share2,
  Plus
} from 'lucide-react';

const SavedRemedies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [editingNote, setEditingNote] = useState(null);

  const savedRemedies = [
    {
      id: 1,
      name: 'Belladonna',
      latinName: 'Atropa Belladonna',
      potency: '200C',
      grade: 5,
      matchScore: 95,
      savedDate: '24 Jan 2026',
      keySymptoms: ['Throbbing pain', 'Heat', 'Light sensitivity', 'Sudden onset'],
      notes: 'Works great for my migraines. Take when headache starts.',
      usedCount: 8,
      category: 'Head'
    },
    {
      id: 2,
      name: 'Nux Vomica',
      latinName: 'Strychnos Nux-vomica',
      potency: '30C',
      grade: 4,
      matchScore: 87,
      savedDate: '23 Jan 2026',
      keySymptoms: ['Morning worse', 'Nausea', 'Irritability', 'Digestive issues'],
      notes: 'Good for stress-related stomach problems.',
      usedCount: 5,
      category: 'Stomach'
    },
    {
      id: 3,
      name: 'Arsenicum Album',
      latinName: 'Arsenicum Album',
      potency: '30C',
      grade: 5,
      matchScore: 92,
      savedDate: '22 Jan 2026',
      keySymptoms: ['Anxiety', 'Restlessness', 'Weakness', 'Chilly'],
      notes: 'Helps with anxiety and sleep.',
      usedCount: 6,
      category: 'Mind'
    },
    {
      id: 4,
      name: 'Bryonia',
      latinName: 'Bryonia Alba',
      potency: '30C',
      grade: 3,
      matchScore: 78,
      savedDate: '21 Jan 2026',
      keySymptoms: ['Worse from motion', 'Better lying still', 'Dry cough', 'Joint pain'],
      notes: '',
      usedCount: 3,
      category: 'Chest'
    },
    {
      id: 5,
      name: 'Pulsatilla',
      latinName: 'Pulsatilla Nigricans',
      potency: '200C',
      grade: 4,
      matchScore: 85,
      savedDate: '20 Jan 2026',
      keySymptoms: ['Changeable symptoms', 'Weepy', 'Better open air', 'Gentle'],
      notes: 'Emotional support remedy.',
      usedCount: 4,
      category: 'Mind'
    },
  ];

  const stats = [
    { label: 'Saved Remedies', value: '12', icon: Heart, color: 'bg-[#3F856C]' },
    { label: 'Most Used', value: 'Belladonna', icon: TrendingUp, color: 'bg-gray-900' },
    { label: 'Avg. Grade', value: '4.2', icon: Award, color: 'bg-gray-700' },
    { label: 'Categories', value: '5', icon: FileText, color: 'bg-gray-600' },
  ];

  const categories = ['All', 'Head', 'Mind', 'Stomach', 'Chest', 'General'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 sm:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saved Remedies</h1>
            <p className="text-sm text-gray-600 mt-1">Your favorite homeopathic remedies in one place</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your saved remedies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
          <button className="px-4 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 sm:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Remedies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savedRemedies.map((remedy) => (
            <div 
              key={remedy.id} 
              className="bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-900 hover:shadow-xl transition-all overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg ${
                      remedy.grade === 5 ? 'bg-gray-900 text-white' :
                      remedy.grade === 4 ? 'bg-[#3F856C] text-white' :
                      'bg-orange-400 text-white'
                    }`}>
                      {remedy.grade}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{remedy.name}</h3>
                      <p className="text-sm text-gray-600 italic mb-3">{remedy.latinName}</p>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold">
                          {remedy.potency}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                          {remedy.category}
                        </span>
                        <span className="text-xs text-gray-600">
                          Used {remedy.usedCount} times
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors group">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">{remedy.matchScore}% Match</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs">{remedy.savedDate}</span>
                  </div>
                </div>
              </div>

              {/* Key Symptoms */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Key Symptoms:</h4>
                <div className="flex flex-wrap gap-2">
                  {remedy.keySymptoms.map((symptom, idx) => (
                    <span 
                      key={idx}
                      className="bg-green-50 text-[#3F856C] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Personal Notes */}
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-700">My Notes:</h4>
                  {editingNote !== remedy.id && (
                    <button 
                      onClick={() => setEditingNote(remedy.id)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>

                {editingNote === remedy.id ? (
                  <div className="space-y-2">
                    <textarea
                      defaultValue={remedy.notes}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none resize-none text-sm"
                      placeholder="Add your personal notes about this remedy..."
                    ></textarea>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingNote(null)}
                        className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingNote(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 italic">
                    {remedy.notes || 'No notes added yet. Click edit to add your observations.'}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <button className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button className="p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State - Only show if no remedies */}
        {savedRemedies.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Saved Remedies Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              When you find helpful remedies, save them here for quick reference. Click the heart icon on any remedy to add it to your favorites.
            </p>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" />
              Search Remedies
            </button>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Pill className="w-5 h-5 text-[#3F856C]" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-900 mb-2">Managing Your Saved Remedies</p>
              <p className="text-sm text-green-800 leading-relaxed">
                Keep track of remedies that work well for you. Add personal notes to remember when and how each remedy helped. 
                You can organize by categories, share your favorites with your homeopathic doctor, or export the list for your records. 
                Remember: this is for reference only - always consult with a qualified practitioner before taking any remedies.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SavedRemedies;
