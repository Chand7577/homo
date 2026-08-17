// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronRight, ChevronDown, ChevronUp, FolderTree, Tag, BookOpen } from 'lucide-react';

const Rubrics = () => {
  const [activeSubTab, setActiveSubTab] = useState('tree');
  const [searchTerm, setSearchTerm] = useState('');
  const [rubrics, setRubrics] = useState([
    { id: 1, name: 'Mind', level: 0, expanded: true },
    { id: 2, name: 'Anxiety', level: 1, parent: 1, expanded: false },
    { id: 3, name: 'Fear', level: 1, parent: 1, expanded: true },
    { id: 4, name: 'Fear of death', level: 2, parent: 3, expanded: false },
    { id: 5, name: 'Head', level: 0, expanded: false },
    { id: 6, name: 'Headache', level: 1, parent: 5, expanded: false },
    { id: 7, name: 'Vertigo', level: 1, parent: 5, expanded: false },
    { id: 8, name: 'Stomach', level: 0, expanded: false },
    { id: 9, name: 'Nausea', level: 1, parent: 8, expanded: false }
  ]);

  const subTabs = [
    { id: 'tree', label: 'Rubric Tree', icon: FolderTree },
    { id: 'modalities', label: 'Modalities', icon: Tag },
    { id: 'synonyms', label: 'Synonyms', icon: BookOpen }
  ];

  const toggleRubric = (id) => {
    setRubrics(rubrics.map(r => r.id === id ? { ...r, expanded: !r.expanded } : r));
  };

  const RubricNode = ({ rubric, allRubrics }) => {
    const children = allRubrics.filter(r => r.parent === rubric.id);
    const hasChildren = children.length > 0;
    return (
      <div>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors" style={{ paddingLeft: `${rubric.level * 2 + 1}rem` }}>
          <div className="flex items-center flex-1">
            {hasChildren ? (
              <button onClick={() => toggleRubric(rubric.id)} className="mr-2">
                {rubric.expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
            ) : <div className="w-6" />}
            <span className="text-sm font-medium text-gray-700">{rubric.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {rubric.expanded && children.map(child => (
          <RubricNode key={child.id} rubric={child} allRubrics={allRubrics} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Rubrics Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage symptom hierarchy and classifications</p>
          </div>
        </div>
      </header>

      {/* Sub Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex space-x-2">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center px-4 py-3 border-b-2 transition-colors ${
                  activeSubTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8">
        {activeSubTab === 'tree' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 mr-4 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search rubrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Rubric
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {rubrics.filter(r => r.level === 0).map(rubric => (
                <RubricNode key={rubric.id} rubric={rubric} allRubrics={rubrics} />
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'modalities' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Modalities Management</h3>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Modality
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
                  <ChevronUp className="w-5 h-5 text-red-500 mr-2" />
                  Aggravations
                </h4>
                <div className="space-y-2">
                  {['Morning', 'Evening', 'Night', 'Cold', 'Motion', 'Pressure', 'Touch'].map(mod => (
                    <div key={mod} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700">{mod}</span>
                      <div className="flex space-x-2">
                        <button className="text-gray-500 hover:text-green-600"><Edit2 className="w-4 h-4" /></button>
                        <button className="text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
                  <ChevronDown className="w-5 h-5 text-green-500 mr-2" />
                  Ameliorations
                </h4>
                <div className="space-y-2">
                  {['Rest', 'Warmth', 'Pressure', 'Open air', 'Lying down', 'Walking', 'Cold applications'].map(mod => (
                    <div key={mod} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700">{mod}</span>
                      <div className="flex space-x-2">
                        <button className="text-gray-500 hover:text-green-600"><Edit2 className="w-4 h-4" /></button>
                        <button className="text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'synonyms' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Synonyms Management</h3>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Synonym
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rubric</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Synonyms</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { rubric: 'Anxiety', synonyms: 'Worry, Nervousness, Apprehension, Uneasiness' },
                      { rubric: 'Fear', synonyms: 'Fright, Terror, Dread, Panic' },
                      { rubric: 'Headache', synonyms: 'Head pain, Cephalalgia, Migraine' },
                      { rubric: 'Nausea', synonyms: 'Queasiness, Sick stomach, Vomiting sensation' },
                      { rubric: 'Vertigo', synonyms: 'Dizziness, Giddiness, Spinning sensation' }
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{item.rubric}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.synonyms}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Rubrics;
