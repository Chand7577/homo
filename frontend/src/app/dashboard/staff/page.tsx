"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  Wallet,
  BarChart3,
  ClipboardList,
  Brain,
  Plus,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
} from "recharts";

/**
 * StaffsPage.tsx
 * - Dark cinematic Staff Management / HR dashboard
 * - Tabs: Overview, Attendance, Payroll, Performance, Leave, AI Insights
 * - Mock data for charts, tables, and cards
 * - Uses Tailwind CSS + Framer Motion + Recharts + lucide-react icons
 */

const attendanceTrend = [
  { day: "Mon", pct: 92 },
  { day: "Tue", pct: 89 },
  { day: "Wed", pct: 94 },
  { day: "Thu", pct: 90 },
  { day: "Fri", pct: 87 },
  { day: "Sat", pct: 70 },
  { day: "Sun", pct: 65 },
];

const performanceData = [
  { name: "Jan", productivity: 72 },
  { name: "Feb", productivity: 75 },
  { name: "Mar", productivity: 78 },
  { name: "Apr", productivity: 80 },
  { name: "May", productivity: 83 },
  { name: "Jun", productivity: 81 },
];

const staffList = [
  { id: 1, name: "Aisha Bello", role: "Cashier", status: "On Duty", attendance: "Present", score: 88 },
  { id: 2, name: "Daniel O.", role: "Floor Manager", status: "Off Duty", attendance: "Leave", score: 92 },
  { id: 3, name: "Emeka Obi", role: "Stock Clerk", status: "On Duty", attendance: "Present", score: 80 },
  { id: 4, name: "Mary Johnson", role: "Cashier", status: "Late", attendance: "Late (09:20)", score: 76 },
];

const leaveRequests = [
  { id: "LR-1001", name: "Emeka Obi", days: 3, from: "2025-10-12", reason: "Medical", status: "Pending" },
  { id: "LR-1002", name: "Aisha Bello", days: 1, from: "2025-10-08", reason: "Personal", status: "Approved" },
];

export default function StaffsPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "attendance" | "payroll" | "performance" | "leave" | "insights"
  >("overview");

  return (
    <div className="min-h-screen p-8 relative bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -left-36 -top-36 w-[520px] h-[520px] bg-purple-600/16 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute -right-36 -bottom-36 w-[520px] h-[520px] bg-emerald-600/12 blur-[120px] rounded-full -z-10 animate-pulse" />

      {/* Header */}
      <header className="flex items-start sm:items-center justify-between gap-4 mb-8 flex-col sm:flex-row">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-300">
            Staff Management
          </h1>
          <p className="text-gray-400 mt-1">Attendance, payroll, performance and AI-driven HR insights.</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition">
            <Plus size={16} /> Add Staff
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition">
            <Download size={16} /> Export
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: Users },
          { id: "attendance", label: "Attendance", icon: Calendar },
          { id: "payroll", label: "Payroll", icon: Wallet },
          { id: "performance", label: "Performance", icon: BarChart3 },
          { id: "leave", label: "Leave & Requests", icon: ClipboardList },
          { id: "insights", label: "AI Insights", icon: Brain },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === t.id ? "bg-gradient-to-r from-purple-600 to-emerald-400 text-black shadow" : "bg-gray-900/40 text-gray-300 hover:bg-gray-900/60"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Main card */}
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow min-h-[480px]">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-800/30 to-purple-800/20 border border-gray-800">
                  <div className="text-sm text-gray-300">Total Staff</div>
                  <div className="text-2xl font-semibold">84</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-800/30 to-teal-700/20 border border-gray-800">
                  <div className="text-sm text-gray-300">On Duty Today</div>
                  <div className="text-2xl font-semibold">62</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-rose-800/30 to-red-700/20 border border-gray-800">
                  <div className="text-sm text-gray-300">Absent</div>
                  <div className="text-2xl font-semibold">4</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-800/30 to-yellow-700/20 border border-gray-800">
                  <div className="text-sm text-gray-300">Avg Attendance</div>
                  <div className="text-2xl font-semibold">89%</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Staff list */}
                <div className="lg:col-span-1 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <h3 className="font-semibold mb-3">Active Staff</h3>
                  <ul className="space-y-3">
                    {staffList.map((s) => (
                      <li key={s.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/30 transition">
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-gray-400">{s.role}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${s.attendance === "Present" ? "text-emerald-300" : s.attendance.includes("Late") ? "text-amber-300" : "text-gray-300"}`}>
                            {s.attendance}
                          </div>
                          <div className="text-xs text-gray-400">{s.status}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Attendance chart */}
                <div className="lg:col-span-2 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Weekly Attendance %</h3>
                      <div className="text-xs text-gray-400">Shows present percentage for the last 7 days</div>
                    </div>
                    <div className="text-sm text-gray-300">Avg: 86%</div>
                  </div>

                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceTrend}>
                        <XAxis dataKey="day" tick={{ fill: "#9CA3AF" }} />
                        <YAxis tick={{ fill: "#9CA3AF" }} domain={[50, 100]} />
                        <Tooltip contentStyle={{ background: "rgba(17,24,39,0.9)", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="pct" stroke="#34d399" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800">
                      <div className="text-xs text-gray-400">Late Today</div>
                      <div className="font-semibold text-amber-300">6</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800">
                      <div className="text-xs text-gray-400">On Leave</div>
                      <div className="font-semibold text-rose-300">4</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800">
                      <div className="text-xs text-gray-400">Shift Gaps</div>
                      <div className="font-semibold text-blue-300">2</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "attendance" && (
            <motion.div key="attendance" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Attendance</h3>
                <div className="flex items-center gap-3">
                  <button className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700">Scan Now</button>
                  <button className="px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">Mark All Present</button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-400">
                        <tr>
                          <th className="py-2 px-3 text-left">Name</th>
                          <th className="py-2 px-3 text-center">Role</th>
                          <th className="py-2 px-3 text-center">Status</th>
                          <th className="py-2 px-3 text-center">Check-in</th>
                          <th className="py-2 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {staffList.map((s) => (
                          <tr key={s.id} className="border-t border-gray-800">
                            <td className="py-3 px-3">{s.name}</td>
                            <td className="py-3 px-3 text-center">{s.role}</td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs ${s.attendance === "Present" ? "bg-emerald-900/30 text-emerald-300" : s.attendance.includes("Late") ? "bg-amber-900/30 text-amber-300" : "bg-rose-900/30 text-rose-300"}`}>
                                {s.attendance}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">{s.attendance.includes("Late") ? "09:20" : "08:45"}</td>
                            <td className="py-3 px-3 text-right">
                              <button className="text-sm text-blue-300 hover:underline">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <h4 className="font-semibold mb-2">Today Summary</h4>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div>Present: <span className="text-emerald-300 font-semibold">62</span></div>
                    <div>Absent: <span className="text-rose-300 font-semibold">4</span></div>
                    <div>Late: <span className="text-amber-300 font-semibold">6</span></div>
                    <div>On Leave: <span className="text-gray-300 font-semibold">2</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "payroll" && (
            <motion.div key="payroll" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Payroll</h3>
                <div className="flex items-center gap-3">
                  <button className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700">Generate Payslips</button>
                  <button className="px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">Pay All</button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-400">
                      <tr>
                        <th className="py-2 px-3 text-left">Employee</th>
                        <th className="py-2 px-3">Role</th>
                        <th className="py-2 px-3">Monthly</th>
                        <th className="py-2 px-3">Last Paid</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-t border-gray-800">
                        <td className="py-3 px-3">Emeka Obi</td>
                        <td className="py-3 px-3 text-center">Stock Clerk</td>
                        <td className="py-3 px-3 text-center">$220</td>
                        <td className="py-3 px-3 text-center">2025-09-30</td>
                        <td className="py-3 px-3 text-center"><span className="text-emerald-300">Paid</span></td>
                        <td className="py-3 px-3 text-right"><button className="text-sm text-gray-300 hover:underline">View</button></td>
                      </tr>

                      <tr className="border-t border-gray-800">
                        <td className="py-3 px-3">Aisha Bello</td>
                        <td className="py-3 px-3 text-center">Cashier</td>
                        <td className="py-3 px-3 text-center">$190</td>
                        <td className="py-3 px-3 text-center">2025-09-01</td>
                        <td className="py-3 px-3 text-center"><span className="text-amber-300">Pending</span></td>
                        <td className="py-3 px-3 text-right"><button className="text-sm text-gray-300 hover:underline">Pay</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "performance" && (
            <motion.div key="performance" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <h3 className="text-xl font-semibold mb-4">Performance Analytics</h3>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                        <XAxis dataKey="name" tick={{ fill: "#9CA3AF" }} />
                        <YAxis tick={{ fill: "#9CA3AF" }} />
                        <Tooltip contentStyle={{ background: "rgba(17,24,39,0.9)" }} />
                        <Bar dataKey="productivity" fill="#7c3aed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <h4 className="font-semibold mb-3">Top Performers</h4>
                  <ol className="text-sm space-y-2">
                    <li className="flex items-center justify-between"><span>1. Daniel O.</span><span className="text-emerald-300">92</span></li>
                    <li className="flex items-center justify-between"><span>2. Emeka Obi</span><span className="text-emerald-300">88</span></li>
                    <li className="flex items-center justify-between"><span>3. Mary J.</span><span className="text-emerald-300">85</span></li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "leave" && (
            <motion.div key="leave" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Leave Requests</h3>
                <div className="text-sm text-gray-400">Pending approvals: <span className="text-amber-300 font-semibold">1</span></div>
              </div>

              <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                <ul className="space-y-3">
                  {leaveRequests.map((lr) => (
                    <li key={lr.id} className="p-3 rounded-md bg-gray-900/30 border border-gray-800 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{lr.name} • {lr.days} days</div>
                        <div className="text-xs text-gray-400">{lr.reason} — from {lr.from}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm ${lr.status === "Approved" ? "text-emerald-300" : lr.status === "Pending" ? "text-amber-300" : "text-rose-300"}`}>{lr.status}</div>
                        {lr.status === "Pending" && (
                          <>
                            <button className="px-3 py-1 rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-400/20">Approve</button>
                            <button className="px-3 py-1 rounded-md bg-rose-600/20 text-rose-300 border border-rose-400/20">Reject</button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div key="insights" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <h3 className="text-xl font-semibold mb-4">AI HR Insights</h3>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="text-purple-400" />
                    <div className="font-semibold">Turnover Risk</div>
                  </div>
                  <div className="text-sm text-gray-300">3 staff flagged with elevated turnover risk within next 90 days. Suggested: engagement check-ins and targeted bonuses.</div>
                </div>

                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="text-amber-300" />
                    <div className="font-semibold">Shift Efficiency</div>
                  </div>
                  <div className="text-sm text-gray-300">AI recommends adding 1 staff during peak hours (13:00–15:00) to reduce queue times by ~22%.</div>
                </div>

                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="text-emerald-300" />
                    <div className="font-semibold">Engagement Index</div>
                  </div>
                  <div className="text-sm text-gray-300">Current Staff Sentiment: <span className="font-semibold text-emerald-300">87%</span>. Recommend 1:1s for low-scoring employees.</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
