"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BarChart3,
  Package,
  FileText,
  Brain,
  Download,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const supplierScores = [
  { name: "Prestige Foods", score: 98, avgDeliveryDays: 1.8, onTimePct: 98 },
  { name: "DairyCo", score: 72, avgDeliveryDays: 3.4, onTimePct: 72 },
  { name: "TechWorld", score: 85, avgDeliveryDays: 2.4, onTimePct: 85 },
  { name: "FreshFarm", score: 65, avgDeliveryDays: 4.1, onTimePct: 65 },
  { name: "CyberTech", score: 90, avgDeliveryDays: 2.0, onTimePct: 90 },
];

const orders = [
  {
    id: "ORD-1024",
    supplier: "Prestige Foods",
    items: 50,
    status: "Delivered",
    eta: "2025-10-02",
  },
  {
    id: "ORD-1025",
    supplier: "DairyCo",
    items: 120,
    status: "Delayed",
    eta: "2025-10-05",
  },
  {
    id: "ORD-1026",
    supplier: "TechWorld",
    items: 30,
    status: "Pending",
    eta: "2025-10-03",
  },
];

const contracts = [
  { supplier: "Prestige Foods", expires: "2026-03-01", status: "Active" },
  { supplier: "DairyCo", expires: "2025-10-15", status: "Expiring Soon" },
  { supplier: "FreshFarm", expires: "2024-12-01", status: "Expired" },
];

const reliabilityTrend = [
  { month: "May", avg: 82 },
  { month: "Jun", avg: 85 },
  { month: "Jul", avg: 80 },
  { month: "Aug", avg: 86 },
  { month: "Sep", avg: 88 },
];

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "performance" | "orders" | "contracts" | "insights" | "reports"
  >("overview");
  const [drawerSupplier, setDrawerSupplier] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-8 relative bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -left-40 -top-40 w-[520px] h-[520px] bg-amber-600/20 blur-[140px] rounded-full -z-10 animate-[pulse_6s_infinite]" />
      <div className="absolute -right-40 -bottom-40 w-[520px] h-[520px] bg-emerald-600/20 blur-[140px] rounded-full -z-10 animate-[pulse_7s_infinite]" />

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-emerald-300">
            Supplier Network
          </h1>
          <p className="text-gray-400 mt-1">
            AI-driven supplier reliability, orders, contracts and real-time alerts.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition">
            <Plus size={16} /> Add Supplier
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition">
            <Download size={16} /> Export Summary
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT: Overview cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow">
            <h3 className="text-sm text-gray-300 mb-3">Network Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-amber-600/20 to-amber-400/10">
                <div className="text-sm text-gray-300">Total Suppliers</div>
                <div className="text-xl font-semibold">126</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-600/20 to-emerald-400/10">
                <div className="text-sm text-gray-300">Active</div>
                <div className="text-xl font-semibold">102</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-600/20 to-amber-400/10">
                <div className="text-sm text-gray-300">Pending</div>
                <div className="text-xl font-semibold">8</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-red-600/20 to-rose-400/10">
                <div className="text-sm text-gray-300">Suspended</div>
                <div className="text-xl font-semibold">4</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow">
            <h3 className="text-sm text-gray-300 mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800/40 transition flex items-center gap-3">
                <Package className="text-blue-400" /> Create Purchase Order
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800/40 transition flex items-center gap-3">
                <Clock className="text-yellow-400" /> Review Delayed Deliveries
              </button>
              <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800/40 transition flex items-center gap-3">
                <FileText className="text-green-400" /> Verify Contracts
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow">
            <h3 className="text-sm text-gray-300 mb-3">Top Supplier</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Prestige Foods</div>
                <div className="text-xs text-gray-400">Reliability: 98%</div>
              </div>
              <div className="text-right">
                <span className="text-emerald-300 font-semibold">A+</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">Avg delivery: 1.8 days</div>
          </div>
        </div>

        {/* RIGHT: main content wide */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB BAR */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { id: "overview", label: "Overview", icon: Users },
              { id: "performance", label: "Performance", icon: BarChart3 },
              { id: "orders", label: "Orders", icon: Package },
              { id: "contracts", label: "Contracts", icon: FileText },
              { id: "insights", label: "AI Insights", icon: Brain },
              { id: "reports", label: "Reports", icon: Download },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition whitespace-nowrap ${
                  activeTab === t.id
                    ? "bg-gradient-to-r from-amber-500 to-emerald-400 text-black font-semibold shadow"
                    : "bg-gray-900/40 text-gray-300 hover:bg-gray-900/60"
                }`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          {/* CARD FRAME */}
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow min-h-[420px]">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.section
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Supplier List */}
                    <div className="lg:w-1/2">
                      <h3 className="text-lg font-semibold mb-3">Suppliers</h3>
                      <div className="space-y-3">
                        {supplierScores.map((s) => (
                          <div
                            key={s.name}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-900/40 border border-gray-800 hover:bg-gray-800/40 transition"
                          >
                            <div>
                              <div className="font-medium">{s.name}</div>
                              <div className="text-xs text-gray-400">
                                Avg delivery: {s.avgDeliveryDays} days
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-gray-300 text-right">
                                <div className="font-semibold">{s.score}</div>
                                <div className="text-xs text-gray-400">Score</div>
                              </div>
                              <button
                                onClick={() => setDrawerSupplier(s.name)}
                                className="px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition text-sm"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Charts */}
                    <div className="lg:w-1/2 space-y-4">
                      <h3 className="text-lg font-semibold mb-3">Reliability Trend</h3>
                      <div className="h-48 bg-gray-900/40 p-3 rounded-lg border border-gray-800">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reliabilityTrend}>
                            <XAxis dataKey="month" tick={{ fill: "#cbd5e1" }} />
                            <YAxis tick={{ fill: "#cbd5e1" }} />
                            <Tooltip
                              contentStyle={{
                                background: "rgba(17,24,39,.9)",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }}
                            />
                            <Bar dataKey="avg" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800">
                          <div className="text-xs text-gray-400">Avg Lead Time</div>
                          <div className="font-semibold">2.6 days</div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800">
                          <div className="text-xs text-gray-400">Defect Rate</div>
                          <div className="font-semibold">1.8%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeTab === "performance" && (
                <motion.section
                  key="performance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Supplier Performance</h3>

                  <div className="space-y-3">
                    {supplierScores.map((s) => (
                      <div
                        key={s.name}
                        className="p-3 rounded-lg bg-gray-900/40 border border-gray-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-gray-400">{s.onTimePct}% on-time</div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right mr-2">
                            <div className="font-semibold">{s.score}</div>
                            <div className="text-xs text-gray-400">score</div>
                          </div>
                          <div className="w-40 bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${s.onTimePct}%` }}
                              className={`h-2 rounded-full ${
                                s.onTimePct > 85 ? "bg-emerald-400" : s.onTimePct > 70 ? "bg-amber-400" : "bg-red-400"
                              }`}
                            />
                          </div>
                          <button
                            onClick={() => setDrawerSupplier(s.name)}
                            className="px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition text-sm"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {activeTab === "orders" && (
                <motion.section
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-400">
                        <tr>
                          <th className="py-2 px-3 text-left">Order ID</th>
                          <th className="py-2 px-3">Supplier</th>
                          <th className="py-2 px-3">Items</th>
                          <th className="py-2 px-3">ETA</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {orders.map((o) => (
                          <tr key={o.id} className="border-t border-gray-800">
                            <td className="py-3 px-3">{o.id}</td>
                            <td className="py-3 px-3">{o.supplier}</td>
                            <td className="py-3 px-3 text-center">{o.items}</td>
                            <td className="py-3 px-3 text-center">{o.eta}</td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  o.status === "Delivered"
                                    ? "bg-emerald-900/30 text-emerald-300"
                                    : o.status === "Delayed"
                                    ? "bg-amber-900/30 text-amber-300"
                                    : "bg-blue-900/30 text-blue-300"
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button className="text-sm text-gray-300 hover:text-white">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              )}

              {activeTab === "contracts" && (
                <motion.section
                  key="contracts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Contracts</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {contracts.map((c) => (
                      <div key={c.supplier} className="p-4 rounded-lg bg-gray-900/40 border border-gray-800">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{c.supplier}</div>
                            <div className="text-xs text-gray-400">Expires: {c.expires}</div>
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${c.status === "Active" ? "text-emerald-300" : c.status === "Expiring Soon" ? "text-amber-300" : "text-red-300"}`}>
                              {c.status}
                            </div>
                            <div className="text-xs text-gray-400 mt-2">View / Upload</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {activeTab === "insights" && (
                <motion.section
                  key="insights"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-lg font-semibold mb-4">AI Insights</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-800">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="text-amber-400" />
                        <div className="font-semibold">Potential Delays</div>
                      </div>
                      <div className="text-sm text-gray-300">
                        The model predicts high delay risk from <b>DairyCo</b> and <b>FreshFarm</b> next month due to route disruptions.
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-800">
                      <div className="flex items-center gap-3 mb-2">
                        <Brain className="text-purple-400" />
                        <div className="font-semibold">Reorder Recommendations</div>
                      </div>
                      <div className="text-sm text-gray-300">
                        Reorder <b>Milk</b> and <b>Eggs</b> from Prestige Foods for faster lead time and lower risk.
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeTab === "reports" && (
                <motion.section
                  key="reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Reports & Exports</h3>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700">Export CSV</button>
                    <button className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700">Export PDF</button>
                    <button className="px-4 py-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30">Download AI Reliability Report</button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide-over supplier drawer */}
      <AnimatePresence>
        {drawerSupplier && (
          <motion.aside
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed right-8 top-16 w-[420px] h-[72vh] bg-gray-900/80 border border-gray-800 rounded-2xl shadow-xl p-6 backdrop-blur-md z-50"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-semibold">{drawerSupplier}</div>
                <div className="text-xs text-gray-400">Supplier ID: SUP-{drawerSupplier?.slice(0,3).toUpperCase()}</div>
              </div>
              <button onClick={() => setDrawerSupplier(null)} className="p-2 rounded-md hover:bg-gray-800/40">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-emerald-300" /> <div>Reliability: 98%</div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-yellow-300" /> <div>Avg Delivery: 1.8 days</div>
              </div>
              <div className="pt-2">
                <div className="text-xs text-gray-400">Recent Orders</div>
                <ul className="mt-2 space-y-2">
                  <li className="text-sm">ORD-1009 — Delivered — 2025-09-25</li>
                  <li className="text-sm">ORD-1012 — Delivered — 2025-09-28</li>
                </ul>
              </div>

              <div className="pt-4">
                <div className="text-xs text-gray-400">Notes</div>
                <div className="mt-2 text-sm bg-gray-900/50 p-3 rounded-md border border-gray-800">No active issues. Preferred for perishables.</div>
              </div>
            </div>

            <div className="mt-auto flex gap-2">
              <button className="flex-1 px-4 py-2 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-400/30">Contact</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">View full profile</button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
