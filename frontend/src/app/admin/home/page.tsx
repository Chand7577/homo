// @ts-nocheck
"use client";

import { useState } from 'react';
import { 
  Search, 
  Sparkles,
  FileText,
  Clock,
  User,
  ChevronRight,
  Pill,
  Activity,
  TrendingUp,
  Calendar,
  Plus,
  Filter,
  Star,
  Zap,
  BookOpen,
  Target,
  Award,
  BarChart3,
  Heart,
  Bell,
  Settings,
  Menu,
  X
} from 'lucide-react';

const DoctorHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const quickStats = [
    { label: 'Active Cases', value: '12', change: '+3', icon: FileText, color: 'bg-gray-900' },
    { label: 'Total Patients', value: '48', change: '+5', icon: User, color: 'bg-[#3F856C]' },
    { label: 'This Month', value: '34', change: '+8', icon: TrendingUp, color: 'bg-gray-700' },
    { label: 'Success Rate', value: '94%', change: '+2%', icon: Award, color: 'bg-gray-600' },
  ];

  const recentCases = [
    { id: 1, patient: 'Patient #2847', age: 34, gender: 'F', symptoms: 'Headache, Nausea, Sensitivity to light', date: '2 hours ago', status: 'In Progress', priority: 'high' },
    { id: 2, patient: 'Patient #2846', age: 45, gender: 'M', symptoms: 'Fever, Body ache, Fatigue', date: '5 hours ago', status: 'Completed', priority: 'medium' },
    { id: 3, patient: 'Patient #2845', age: 28, gender: 'F', symptoms: 'Anxiety, Insomnia, Restlessness', date: '1 day ago', status: 'In Progress', priority: 'high' },
    { id: 4, patient: 'Patient #2844', age: 52, gender: 'M', symptoms: 'Digestive issues, Bloating', date: '2 days ago', status: 'Completed', priority: 'low' },
  ];

  const popularRemedies = [
    { name: 'Belladonna', uses: 24, grade: 4.5, cases: '8 cases' },
    { name: 'Nux Vomica', uses: 18, grade: 4.2, cases: '6 cases' },
    { name: 'Arsenicum Album', uses: 15, grade: 4.8, cases: '5 cases' },
    { name: 'Pulsatilla', uses: 12, grade: 4.0, cases: '4 cases' },
  ];

  const upcomingAppointments = [
    { id: 1, patient: 'Patient #2850', time: 'Today, 2:00 PM', type: 'Follow-up', duration: '30 min' },
    { id: 2, patient: 'Patient #2851', time: 'Today, 4:30 PM', type: 'New Case', duration: '60 min' },
    { id: 3, patient: 'Patient #2852', time: 'Tomorrow, 10:00 AM', type: 'Follow-up', duration: '30 min' },
  ];

  const quickActions = [
    { icon: Plus, label: 'New Case', description: 'Start a new patient case', color: 'bg-gray-900', action: 'new-case' },
    { icon: Search, label: 'Search Rubrics', description: 'Browse symptom database', color: 'bg-[#3F856C]', action: 'search' },
    { icon: BookOpen, label: 'Repertorize', description: 'Analyze symptoms', color: 'bg-gray-700', action: 'repertorize' },
    { icon: Pill, label: 'Medicine DB', description: 'View remedies', color: 'bg-gray-600', action: 'medicines' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, Dr. Sharma</h1>
                <p className="text-sm text-gray-600 mt-1">Here's your practice overview for today • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#3F856C] rounded-full"></span>
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">Dr. Sharma</p>
                    <p className="text-xs text-gray-500">Homeopathy Specialist</p>
                  </div>
                  <div className="w-11 h-11 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    DS
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients, cases, symptoms, or remedies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.change !== '--' && (
                      <span className="text-xs font-semibold text-[#3F856C] bg-green-50 px-2 py-1 rounded-lg">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button 
                  key={idx}
                  className={`${action.color} rounded-2xl p-6 text-white hover:shadow-2xl transition-all text-left group`}
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{action.label}</h3>
                  <p className="text-sm text-white/80">{action.description}</p>
                </button>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Cases */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recent Cases</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Your latest patient consultations</p>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Case
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {recentCases.map((case_) => (
                  <div key={case_.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-gray-900">{case_.patient}</h4>
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {case_.age}Y • {case_.gender}
                            </span>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              case_.status === 'In Progress' 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'bg-green-50 text-[#3F856C]'
                            }`}>
                              {case_.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{case_.symptoms}</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-500">{case_.date}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button className="w-full py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
                  View All Cases
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-700" />
                    Today's Schedule
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{upcomingAppointments.length} appointments</p>
                </div>
                <div className="p-6 space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-[#3F856C] rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{apt.patient}</p>
                          <p className="text-xs text-gray-600">{apt.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">{apt.type}</span>
                        <span className="text-gray-500">{apt.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Remedies */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Top Remedies</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Most prescribed this month</p>
                </div>
                <div className="p-6 space-y-4">
                  {popularRemedies.map((remedy, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3F856C] to-[#2d6050] rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{remedy.name}</p>
                          <p className="text-xs text-gray-500">{remedy.cases}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-[#3F856C] fill-[#3F856C]" />
                        <span className="text-sm font-bold text-gray-900">{remedy.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Monthly Performance</h3>
                <p className="text-gray-400">Your practice statistics for January 2026</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Cases This Month</p>
                <p className="text-3xl font-bold">34</p>
                <p className="text-xs text-[#3F856C] mt-2">+24% from last month</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Avg. Case Time</p>
                <p className="text-3xl font-bold">42m</p>
                <p className="text-xs text-gray-400 mt-2">Within target range</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Patient Satisfaction</p>
                <p className="text-3xl font-bold">4.8</p>
                <p className="text-xs text-[#3F856C] mt-2">Excellent rating</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">Follow-up Rate</p>
                <p className="text-3xl font-bold">87%</p>
                <p className="text-xs text-[#3F856C] mt-2">+5% improvement</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active = false, badge = null, sidebarOpen }) => {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
        active 
          ? 'bg-gray-900 text-white' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {sidebarOpen && (
        <>
          <span className="flex-1 text-left font-medium text-sm">{label}</span>
          {badge && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              active ? 'bg-white text-gray-900' : 'bg-[#3F856C] text-white'
            }`}>
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default DoctorHome;
