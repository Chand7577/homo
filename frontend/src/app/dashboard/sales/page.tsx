"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  LineChart,
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
  Download,
  MessageSquare,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const salesSpark = [
  { day: "Mon", value: 5200 },
  { day: "Tue", value: 6100 },
  { day: "Wed", value: 7200 },
  { day: "Thu", value: 6600 },
  { day: "Fri", value: 9800 },
  { day: "Sat", value: 12300 },
  { day: "Sun", value: 11000 },
];

const forecastData = [
  { day: "1", sales: 4000 },
  { day: "5", sales: 5200 },
  { day: "10", sales: 7000 },
  { day: "15", sales: 8300 },
  { day: "20", sales: 7600 },
  { day: "25", sales: 9400 },
  { day: "30", sales: 10200 },
];

const categoryBreakdown = [
  { name: "Electronics", value: 45 },
  { name: "Accessories", value: 25 },
  { name: "Groceries", value: 18 },
  { name: "Home", value: 12 },
];

const COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#f87171"];

const topProducts = [
  { id: 1, name: "Wireless Headphones", sold: 420, rev: "$21,000", status: "Hot" },
  { id: 2, name: "Phone Charger", sold: 340, rev: "$6,800", status: "Rising" },
  { id: 3, name: "Smartwatch", sold: 210, rev: "$31,500", status: "Stable" },
  { id: 4, name: "Bluetooth Speaker", sold: 180, rev: "$14,400", status: "Cooling" },
];

const customers = [
  { id: 1, name: "John Doe", lifetime: "$2,140", orders: 4, prob: "80%" },
  { id: 2, name: "Aisha Bello", lifetime: "$1,020", orders: 2, prob: "65%" },
  { id: 3, name: "Emeka Obi", lifetime: "$3,720", orders: 9, prob: "92%" },
];

const alerts = [
  { text: "Headphones inventory will run out in 3 days.", level: "warning" },
  { text: "Smartwatch sales spiked +20% this week.", level: "info" },
  { text: "Unusual drop in Camera sales detected.", level: "critical" },
];

export default function SalesPage() {
  const [tab, setTab] = useState<
    "overview" | "trends" | "forecast" | "top" | "customers" | "alerts"
  >("overview");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white p-8 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -left-24 -top-24 w-[480px] h-[480px] bg-purple-600/18 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute -right-24 -bottom-24 w-[420px] h-[420px] bg-blue-600/14 blur-[120px] rounded-full -z-10 animate-pulse" />

      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            AI Sales Command Center
          </h1>
          <p className="text-gray-400 mt-1">Monitor revenue, trends and AI-driven recommendations in real-time.</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 transition">
            <Plus size={16} /> New Sale
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition">
            <Zap size={16} /> AI Insights
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: LineChart },
          { id: "trends", label: "Trends", icon: BarChart3 },
          { id: "forecast", label: "Forecast", icon: TrendingUp },
          { id: "top", label: "Top Products", icon: Zap },
          { id: "customers", label: "Customers", icon: Users },
          { id: "alerts", label: "Smart Alerts", icon: AlertTriangle },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${
              tab === t.id ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow" : "bg-gray-900/40 text-gray-300 hover:bg-gray-900/60"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content card */}
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow min-h-[420px]">
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-800/40 to-purple-800/30 border border-gray-800">
                  <div className="text-sm text-gray-300">Today's Revenue</div>
                  <div className="text-2xl font-semibold">$24,530 <span className="text-sm text-green-400">(+8%)</span></div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-rose-800/30 to-red-800/20 border border-gray-800">
                  <div className="text-sm text-gray-300">Orders</div>
                  <div className="text-2xl font-semibold">340</div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-800/30 to-yellow-700/20 border border-gray-800">
                  <div className="text-sm text-gray-300">Conversion Rate</div>
                  <div className="text-2xl font-semibold">7.4%</div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-800/30 to-teal-700/20 border border-gray-800">
                  <div className="text-sm text-gray-300">Avg Basket</div>
                  <div className="text-2xl font-semibold">$72.10</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Sales spark + Insight */}
                <div className="lg:col-span-2 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Sales (Last 7 days)</h3>
                      <div className="text-sm text-gray-400">Actual vs predicted — live updates</div>
                    </div>
                    <div className="text-sm text-gray-300">Peak: Sat</div>
                  </div>

                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={salesSpark}>
                        <XAxis dataKey="day" tick={{ fill: "#9CA3AF" }} />
                        <YAxis tick={{ fill: "#9CA3AF" }} />
                        <Tooltip contentStyle={{ background: "rgba(17,24,39,0.9)", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-gray-900/40 border border-gray-800 flex items-center justify-between">
                    <div className="text-sm text-gray-300">AI Note</div>
                    <div className="text-sm text-emerald-300">Weekend surge expected — +15%</div>
                  </div>
                </div>

                {/* Category breakdown + forecast quick */}
                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <h3 className="font-semibold mb-3">Category Mix</h3>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={34} outerRadius={60} paddingAngle={4}>
                          {categoryBreakdown.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-gray-400">Top category: <span className="text-white font-medium">Electronics</span></div>
                    <div className="text-xs text-gray-400 mt-2">Predicted next 7d: <span className="text-emerald-300 font-medium">+12%</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "trends" && (
            <motion.div key="trends" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <h3 className="text-xl font-semibold mb-4">Trends — Historical Performance</h3>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={forecastData}>
                        <XAxis dataKey="day" tick={{ fill: "#CBD5E1" }} />
                        <YAxis tick={{ fill: "#CBD5E1" }} />
                        <Tooltip contentStyle={{ background: "rgba(17,24,39,0.9)" }} />
                        <Line type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={3} dot={false} />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <h4 className="font-semibold mb-2">Quick Insights</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Electronics growth up <span className="text-emerald-300">18%</span></li>
                    <li>• Conversion improved after price tweak</li>
                    <li>• Category shifts toward accessories on weekends</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "forecast" && (
            <motion.div key="forecast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <h3 className="text-xl font-semibold mb-4">Revenue Forecast (AI)</h3>
              <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={forecastData}>
                      <XAxis dataKey="day" tick={{ fill: "#CBD5E1" }} />
                      <YAxis tick={{ fill: "#CBD5E1" }} />
                      <Tooltip contentStyle={{ background: "rgba(17,24,39,0.9)" }} />
                      <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-300">Confidence: <span className="text-emerald-300 font-medium">91%</span></div>
                  <div className="text-sm text-gray-300">Predicted Growth: <span className="text-emerald-300 font-medium">+18%</span></div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "top" && (
            <motion.div key="top" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <h3 className="text-xl font-semibold mb-4">Top Products</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {topProducts.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-2xl">📦</div>
                    <div className="flex-1">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-gray-400">Units sold: {p.sold} • Revenue: {p.rev}</div>
                    </div>
                    <div>
                      <div className={`px-3 py-1 rounded text-sm ${p.status === "Hot" ? "bg-rose-600/20 text-rose-300" : p.status === "Rising" ? "bg-amber-600/20 text-amber-300" : "bg-gray-800 text-gray-200"}`}>
                        {p.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "customers" && (
            <motion.div key="customers" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <h3 className="text-xl font-semibold mb-4">Customers & Behavior</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <h4 className="font-semibold mb-3">High-value customers</h4>
                  <ul className="space-y-3 text-sm text-gray-300">
                    {customers.map((c) => (
                      <li key={c.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.orders} orders • {c.lifetime} lifetime</div>
                        </div>
                        <div className="text-sm text-emerald-300">{c.prob} chance to reorder</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <h4 className="font-semibold mb-3">Segmentation</h4>
                  <div className="text-sm text-gray-300">
                    New vs Returning vs VIP — show segmentation widgets here (placeholder)
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "alerts" && (
            <motion.div key="alerts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <h3 className="text-xl font-semibold mb-4">Smart Alerts</h3>
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className={`p-3 rounded-lg border border-gray-800 bg-gray-900/40 flex items-center gap-3 ${a.level === "critical" ? "border-red-600/30 text-red-300" : a.level === "warning" ? "border-amber-500/30 text-amber-300" : "border-blue-600/30 text-blue-300"}`}>
                    <AlertTriangle className="w-5 h-5" />
                    <div className="text-sm">{a.text}</div>
                    <div className="ml-auto text-xs text-gray-400">2h ago</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="fixed right-8 bottom-8 bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full shadow-lg"
        onClick={() => setChatOpen((s) => !s)}
      >
        <MessageSquare className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} transition={{ type: "spring", stiffness: 120 }} className="fixed right-8 bottom-20 w-80 h-96 bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="text-amber-300" />
                <div className="font-semibold">Sales AI</div>
              </div>
              <button className="text-gray-400" onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <div className="text-sm text-gray-300 space-y-2 h-[72%] overflow-y-auto">
              <p>👋 Hi! I see weekend traffic rising — consider boosting staff between 2–5 PM.</p>
              <p>💡 Suggestion: Apply 5% cross-sell discount on chargers with phones.</p>
              <p>⚠️ Note: Camera category declining — recommend targeted promo.</p>
            </div>

            <div className="mt-3 flex gap-2">
              <input placeholder="Ask Sales AI..." className="flex-1 px-3 py-2 bg-gray-800 rounded-md border border-gray-700 text-sm" />
              <button className="px-3 py-2 rounded-md bg-amber-600/20 text-amber-300">Send</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
