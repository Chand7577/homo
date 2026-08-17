"use client";

import {
  Users,
  UserPlus,
  Edit,
  Trash,
  Briefcase,
  BarChart3,
  CheckSquare,
  FileText,
  Download,
  PieChart,
  Cpu,
  Calendar,
  Clock,
  DollarSign,
  Receipt,
} from "lucide-react";

export default function TeacherManagementPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#050510] to-[#020205] text-gray-100 p-6">
      {/* Background animated blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/30 rounded-full filter blur-[160px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full filter blur-[140px] animate-pulse"></div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 relative z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_#9333ea]">
          Teacher & Staff Management
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-emerald-800/40 hover:scale-105 transition-transform">
          <UserPlus size={18} /> Add New Staff
        </button>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Teacher Directory */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-cyan-500/20 transition-shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-cyan-300">
            <Users size={18} /> Teacher Directory
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
              <span>Mrs. Johnson – Mathematics</span>
              <div className="flex gap-2">
                <button className="p-1 hover:text-blue-400">
                  <Edit size={16} />
                </button>
                <button className="p-1 hover:text-red-400">
                  <Trash size={16} />
                </button>
              </div>
            </li>
            <li className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
              <span>Mr. Adams – English</span>
              <div className="flex gap-2">
                <button className="p-1 hover:text-blue-400">
                  <Edit size={16} />
                </button>
                <button className="p-1 hover:text-red-400">
                  <Trash size={16} />
                </button>
              </div>
            </li>
          </ul>
        </div>

        {/* Role Assignment */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-300">
            <Briefcase size={18} /> Role Assignment
          </h2>
          <p className="text-sm text-gray-400 mb-3">
            Assign staff as Subject Teacher, Admin, or Head Teacher.
          </p>
          <button className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-600/40 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition">
            Assign Roles
          </button>
        </div>

        {/* Class & Subject Allocation */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-shadow">
          <h2 className="text-lg font-semibold mb-4 text-blue-300">
            Class & Subject Allocation
          </h2>
          <p className="text-sm text-gray-400 mb-3">
            Drag and drop teachers to classes/subjects.
          </p>
          <div className="border-2 border-dashed border-white/20 p-6 text-center text-gray-500 rounded-lg hover:border-cyan-400/40 transition">
            Drag & Drop Area
          </div>
        </div>

        {/* Performance Tracking */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-pink-500/20 transition-shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-pink-300">
            <BarChart3 size={18} /> Performance Tracking (AI)
          </h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <PieChart size={16} className="text-pink-400" /> Analytics of teacher impact on student outcomes
            </li>
            <li className="flex items-center gap-2">
              <Cpu size={16} className="text-purple-400" /> AI grading of teaching effectiveness
            </li>
          </ul>
        </div>

        {/* Attendance & Workload */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-yellow-500/20 transition-shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-300">
            <CheckSquare size={18} /> Attendance & Workload
          </h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Calendar size={16} className="text-yellow-400" /> Staff attendance tracking (biometric/QR)
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-orange-400" /> Workload hours vs assigned timetable
            </li>
          </ul>
        </div>

        {/* Payroll */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-300">
            <FileText size={18} /> Payroll Management
          </h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-400" /> Salary setup, bonuses, deductions
            </li>
            <li className="flex items-center gap-2">
              <Receipt size={16} className="text-blue-400" /> Generate payslips
            </li>
          </ul>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-600/40 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition mt-3">
            <Download size={16} /> Download Payslip
          </button>
        </div>
      </div>
    </div>
  );
}
