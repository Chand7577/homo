"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileText, Calendar, Library, Sparkles, Check, X } from "lucide-react";

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState("curriculum");

  const tabs = [
    { name: "Curriculum Setup", key: "curriculum", icon: BookOpen },
    { name: "Lesson Plan Approval", key: "lessonPlans", icon: FileText },
    { name: "Exam & Timetable Scheduling", key: "timetable", icon: Calendar },
    { name: "Digital Library Control", key: "library", icon: Library },
    { name: "AI Suggestions", key: "ai", icon: Sparkles },
  ];

  return (
    <section className="relative min-h-screen p-8 bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white overflow-hidden">
      {/* Floating Gradient Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/30 blur-[150px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/30 blur-[150px] rounded-full -z-10 animate-pulse" />

      {/* Page Title */}
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
        Academics & Learning
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-800 pb-3">
        {tabs.map(({ name, key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === key
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-700/40"
                : "bg-gray-800/50 text-gray-400 hover:text-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-lg p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "curriculum" && (
            <motion.div
              key="curriculum"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Curriculum Setup</h2>
              <p className="text-gray-400 mb-6">
                Define subjects, grading system, and assessment weights for each class/program.
              </p>
              <button className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow hover:scale-105 transition">
                Add Subject
              </button>
            </motion.div>
          )}

          {activeTab === "lessonPlans" && (
            <motion.div
              key="lessonPlans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Lesson Plan Approval</h2>
              <p className="text-gray-400 mb-6">
                Teachers upload lesson notes → Admin reviews for approval or rejection.
              </p>
              <div className="border border-gray-700 rounded-xl p-5 bg-gray-800/50">
                <p className="text-gray-300 font-medium">Pending Lesson Plans</p>
                <ul className="list-disc ml-6 mt-2 text-sm text-gray-400">
                  <li>Math JSS2 – Algebra Basics</li>
                  <li>English SS1 – Shakespeare Notes</li>
                </ul>
                <div className="flex gap-2 mt-4">
                  <button className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                    <Check size={14} /> Approve
                  </button>
                  <button className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "timetable" && (
            <motion.div
              key="timetable"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Exam & Timetable Scheduling</h2>
              <p className="text-gray-400 mb-6">
                Auto-generate timetables and exam schedules for all classes.
              </p>
              <button className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow hover:scale-105 transition">
                Generate Timetable
              </button>
            </motion.div>
          )}

          {activeTab === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Digital Library Control</h2>
              <p className="text-gray-400 mb-6">
                Upload, organize, and manage eBooks, past papers, and other academic resources.
              </p>
              <button className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow hover:scale-105 transition">
                Upload Resource
              </button>
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4">AI Suggestions</h2>
              <p className="text-gray-400 mb-6">
                Get AI-powered insights on curriculum improvement and learning gaps.
              </p>
              <div className="border border-purple-500/40 bg-purple-500/10 rounded-xl p-5 shadow-md shadow-purple-800/30">
                <div className="flex items-center gap-2 text-purple-400 font-medium mb-3">
                  <Sparkles size={18} /> Smart Recommendations
                </div>
                <ul className="list-disc ml-6 mt-2 text-sm text-gray-300 space-y-1">
                  <li>Increase math support in JSS2 by adding extra practice classes.</li>
                  <li>Consider digital literacy modules for JSS1.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
