"use client";

import {
  Users,
  UserPlus,
  Edit,
  Trash,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Activity,
  FileText,
  Book,
  BarChart3,
  RefreshCw,
  Award,
  AlertTriangle,
  TrendingDown,
  XCircle,
} from "lucide-react";

export default function StudentManagementPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#07101a] via-[#04050a] to-[#020205] p-6 text-white">
      {/* Background blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-60 -right-40 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />

      {/* Header */}
      <header className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
          Student Management
        </h1>
        <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-700 hover:from-emerald-500 hover:to-purple-600 transition-all shadow-[0_0_15px_rgba(147,51,234,0.5)]">
          <UserPlus size={18} className="text-white" /> Add New Student
        </button>
      </header>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student List & Profiles */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-400">
            <Users size={18} /> Student List & Profiles
          </h2>
          <p className="text-sm text-gray-300 mb-3">
            View all students with filters (class, performance, fee status).
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
              <span>Jane Doe – Grade 10</span>
              <div className="flex gap-2">
                <button className="p-1 hover:text-emerald-400">
                  <Edit size={16} />
                </button>
                <button className="p-1 hover:text-red-400">
                  <Trash size={16} />
                </button>
              </div>
            </li>
            <li className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
              <span>John Smith – Grade 8</span>
              <div className="flex gap-2">
                <button className="p-1 hover:text-emerald-400">
                  <Edit size={16} />
                </button>
                <button className="p-1 hover:text-red-400">
                  <Trash size={16} />
                </button>
              </div>
            </li>
          </ul>
        </div>

        {/* Academic Records */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-400">
            <BookOpen size={18} /> Academic Records
          </h2>
          <ul className="space-y-2 text-sm text-gray-200">
            <li className="flex items-center gap-2"><FileText size={16}/> Upload/view grades</li>
            <li className="flex items-center gap-2"><Book size={16}/> Transcripts</li>
            <li className="flex items-center gap-2"><BarChart3 size={16}/> Progress reports</li>
          </ul>
        </div>

        {/* Attendance Records */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-400">
            <CalendarDays size={18} /> Attendance Records
          </h2>
          <p className="text-sm text-gray-300 mb-3">
            Track class-wise/monthly attendance.
          </p>
          <div className="border border-white/10 p-4 rounded-lg text-sm text-gray-400 bg-white/5">
            Attendance dashboard goes here
          </div>
        </div>

        {/* Transfers & Alumni */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-pink-400">
            <GraduationCap size={18} /> Transfers & Alumni
          </h2>
          <ul className="space-y-2 text-sm text-gray-200">
            <li className="flex items-center gap-2"><RefreshCw size={16}/> Manage transfer requests</li>
            <li className="flex items-center gap-2"><Award size={16}/> Alumni database</li>
          </ul>
        </div>

        {/* AI Student Insights */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(236,72,153,0.4)] col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-rose-400">
            <Activity size={18} /> AI Student Insights
          </h2>
          <ul className="space-y-2 text-sm text-gray-200">
            <li className="flex items-center gap-2"><AlertTriangle size={16}/> Likely dropouts</li>
            <li className="flex items-center gap-2"><TrendingDown size={16}/> Failing students</li>
            <li className="flex items-center gap-2"><XCircle size={16}/> Absenteeism risk</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
