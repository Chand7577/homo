// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Pill, FileText, List } from 'lucide-react';

const Medicines = () => {
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [medicines] = useState([
    { id: 1, name: 'Aconite', latinName: 'Aconitum Napellus', potency: '30C' },
    { id: 2, name: 'Arnica', latinName: 'Arnica Montana', potency: '200C' },
    { id: 3, name: 'Belladonna', latinName: 'Atropa Belladonna', potency: '30C' },
    { id: 4, name: 'Bryonia', latinName: 'Bryonia Alba', potency: '30C' },
    { id: 5, name: 'Chamomilla', latinName: 'Matricaria Chamomilla', potency: '200C' },
    { id: 6, name: 'Nux Vomica', latinName: 'Strychnos Nux-vomica', potency: '30C' },
    { id: 7, name: 'Pulsatilla', latinName: 'Pulsatilla Nigricans', potency: '200C' }
  ]);

  const subTabs = [
    { id: 'list', label: 'Medicine List', icon: Pill },
    { id: 'grades', label: 'Grades', icon: FileText },
    { id: 'mapping', label: 'Rubric Mapping', icon: List }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Medicines Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage remedies, grades, and mappings</p>
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
        {activeSubTab === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 mr-4 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Common Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Latin Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Potency</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {medicines.map((med) => (
                      <tr key={med.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{med.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 italic">{med.latinName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{med.potency}</td>
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

        {activeSubTab === 'grades' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Grade Scale Definition</h3>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {[
                  { grade: 1, label: 'Weak', color: 'bg-gray-200', textColor: 'text-gray-700', desc: 'Minimal indication - remedy rarely indicated for this symptom' },
                  { grade: 2, label: 'Mild', color: 'bg-yellow-200', textColor: 'text-yellow-900', desc: 'Slight indication - remedy sometimes helpful for this symptom' },
                  { grade: 3, label: 'Moderate', color: 'bg-orange-300', textColor: 'text-orange-900', desc: 'Clear indication - remedy frequently indicated for this symptom' },
                  { grade: 4, label: 'Strong', color: 'bg-green-400', textColor: 'text-white', desc: 'Strong indication - remedy commonly indicated for this symptom' },
                  { grade: 5, label: 'Very Strong', color: 'bg-green-600', textColor: 'text-white', desc: 'Definitive indication - remedy highly characteristic for this symptom' }
                ].map(item => (
                  <div key={item.grade} className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center font-bold ${item.textColor} mr-4 flex-shrink-0`}>
                      {item.grade}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-800">{item.label}</h4>
                      <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                    </div>
                    <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded ml-4">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium">Grading System Note</p>
              <p className="text-xs text-blue-700 mt-1">
                These grades are used throughout the system to indicate the strength of relationship between a remedy and a rubric. 
                Higher grades mean stronger clinical correlation.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'mapping' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Rubric-Medicine Mapping</h3>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Mapping
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rubric</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Grade</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { rubric: 'Anxiety', medicine: 'Aconite', grade: 5 },
                      { rubric: 'Fear of death', medicine: 'Aconite', grade: 5 },
                      { rubric: 'Headache', medicine: 'Belladonna', grade: 4 },
                      { rubric: 'Headache', medicine: 'Bryonia', grade: 3 },
                      { rubric: 'Nausea', medicine: 'Nux Vomica', grade: 4 },
                      { rubric: 'Vertigo', medicine: 'Bryonia', grade: 3 }
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">{item.rubric}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{item.medicine}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                            item.grade === 5 ? 'bg-green-600' : item.grade === 4 ? 'bg-green-400' : 'bg-orange-300'
                          }`}>
                            {item.grade}
                          </span>
                        </td>
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

export default Medicines;
