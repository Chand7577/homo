"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  Download,
  Clock,
  DollarSign,
  Package,
  Tag,
  Bot,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

/**
 * WasteExpiryPage.tsx
 * - Dark cinematic Waste & Expiry management UI
 * - Recharts visualizations, tables, AI insights, action buttons
 * - Tailwind + Framer Motion + lucide-react
 *
 * Drop into a Next.js app route (e.g. app/dashboard/waste/page.tsx)
 */

const wasteTrend = [
  { day: "Oct 1", predicted: 120, actual: 110 },
  { day: "Oct 5", predicted: 140, actual: 132 },
  { day: "Oct 10", predicted: 160, actual: 150 },
  { day: "Oct 15", predicted: 170, actual: 165 },
  { day: "Oct 20", predicted: 150, actual: 142 },
  { day: "Oct 25", predicted: 130, actual: 125 },
  { day: "Oct 30", predicted: 110, actual: 105 },
];

const nearExpiry = [
  {
    id: "SKU-1001",
    product: "Fresh Milk (1L)",
    category: "Dairy",
    stock: 40,
    expiry: "2025-10-08",
    daysLeft: 2,
    risk: 95,
    recommendation: "Discount 20%",
  },
  {
    id: "SKU-1002",
    product: "Greek Yogurt (Cup)",
    category: "Dairy",
    stock: 88,
    expiry: "2025-10-11",
    daysLeft: 5,
    risk: 82,
    recommendation: "Bundle Offer",
  },
  {
    id: "SKU-1003",
    product: "Bread (Large)",
    category: "Bakery",
    stock: 25,
    expiry: "2025-10-07",
    daysLeft: 1,
    risk: 98,
    recommendation: "Clearance Sale",
  },
  {
    id: "SKU-1004",
    product: "Orange Juice 1L",
    category: "Drinks",
    stock: 80,
    expiry: "2025-10-15",
    daysLeft: 9,
    risk: 35,
    recommendation: "Monitor",
  },
];

export default function WasteExpiryPage() {
  const [filterWindow, setFilterWindow] = useState<7 | 30 | 90>(30);
  const [selected, setSelected] = useState<string | null>(null);
  const [autoApplyDiscounts, setAutoApplyDiscounts] = useState(false);

  return (
    <div className="min-h-screen p-8 relative bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white overflow-auto">
      {/* decorative blobs */}
      <div className="absolute -left-28 -top-28 w-[520px] h-[520px] bg-purple-600/18 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute -right-28 -bottom-28 w-[520px] h-[520px] bg-emerald-600/12 blur-[120px] rounded-full -z-10 animate-pulse" />

      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-emerald-300">
            Waste & Expiry Intelligence
          </h1>
          <p className="text-gray-400 mt-1">
            Predict, prevent and act on product expiry and waste using AI-driven recommendations.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setAutoApplyDiscounts((s) => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              autoApplyDiscounts
                ? "bg-emerald-600/20 text-emerald-300 border border-emerald-400/30"
                : "bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700"
            }`}
          >
            <Tag size={16} /> Auto-Apply Discounts
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition">
            <Download size={16} /> Export Report
          </button>
        </div>
      </header>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-purple-800/30 to-pink-800/20 border border-gray-800"
        >
          <div className="text-sm text-gray-300">Predicted Waste (30d)</div>
          <div className="text-2xl font-semibold">4.2%</div>
          <div className="text-xs text-gray-400 mt-1">Potential cost: $1,240</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-yellow-800/30 to-amber-800/20 border border-gray-800"
        >
          <div className="text-sm text-gray-300">Items Near Expiry</div>
          <div className="text-2xl font-semibold">4 SKUs</div>
          <div className="text-xs text-gray-400 mt-1">Within next 7 days</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-800/30 to-cyan-800/20 border border-gray-800"
        >
          <div className="text-sm text-gray-300">Loss Prevented (YTD)</div>
          <div className="text-2xl font-semibold">$12,300</div>
          <div className="text-xs text-gray-400 mt-1">If recommendations applied</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800/30 to-teal-700/20 border border-gray-800"
        >
          <div className="text-sm text-gray-300">AI Accuracy</div>
          <div className="text-2xl font-semibold">89%</div>
          <div className="text-xs text-gray-400 mt-1">Model confidence</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Chart & controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Waste Forecast (Next 30 days)</h2>
                <div className="text-sm text-gray-400">Predicted vs Actual waste — hover for details</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">Window</div>
                {[7, 30, 90].map((w) => (
                  <button
                    key={w}
                    onClick={() => setFilterWindow(w as 7 | 30 | 90)}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                      filterWindow === w ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {w}d
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wasteTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="day" tick={{ fill: "#9CA3AF" }} />
                  <YAxis tick={{ fill: "#9CA3AF" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17,24,39,0.95)",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  />
                  <Line type="monotone" dataKey="actual" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={3} dot={false} strokeDasharray="6 6" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition flex items-center gap-2">
                <Bot size={16} /> Regenerate Insights
              </button>
              <button className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition flex items-center gap-2">
                <FileText size={16} /> Generate Expiry Report
              </button>
              <button className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition flex items-center gap-2">
                <Package size={16} /> Hold Reorders
              </button>
            </div>
          </div>

          {/* Near-expiry table */}
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Near-Expiry Items</h3>
                <div className="text-sm text-gray-400">Items predicted at risk — take action</div>
              </div>
              <div className="text-sm text-gray-400">Total: {nearExpiry.length}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs text-gray-400 bg-gray-900/30">
                  <tr>
                    <th className="py-2 px-3 text-left">Product</th>
                    <th className="py-2 px-3 text-center">Category</th>
                    <th className="py-2 px-3 text-center">Stock</th>
                    <th className="py-2 px-3 text-center">Expiry</th>
                    <th className="py-2 px-3 text-center">Days left</th>
                    <th className="py-2 px-3 text-center">Risk</th>
                    <th className="py-2 px-3 text-center">Recommendation</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {nearExpiry.map((n) => {
                    const riskColor =
                      n.daysLeft <= 2 ? "bg-rose-900/30 text-rose-300" : n.daysLeft <= 5 ? "bg-amber-900/30 text-amber-300" : "bg-emerald-900/30 text-emerald-300";
                    return (
                      <tr key={n.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition">
                        <td className="py-3 px-3">{n.product}</td>
                        <td className="py-3 px-3 text-center">{n.category}</td>
                        <td className="py-3 px-3 text-center">{n.stock}</td>
                        <td className="py-3 px-3 text-center">{n.expiry}</td>
                        <td className="py-3 px-3 text-center">{n.daysLeft}</td>
                        <td className={`py-3 px-3 text-center ${riskColor}`}>{n.risk}%</td>
                        <td className="py-3 px-3 text-center text-sm">{n.recommendation}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelected(n.id)}
                              className="px-3 py-1 rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-400/20 text-xs hover:bg-emerald-600/30 transition"
                            >
                              Apply
                            </button>
                            <button className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-200 text-xs hover:bg-gray-700 transition">
                              Ignore
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Insights & Actions */}
        <aside className="space-y-6">
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow w-full">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">AI Insights</h4>
                <div className="text-xs text-gray-400">Key signals from predictive models</div>
              </div>
              <div className="text-sm text-gray-400">Updated: 2m ago</div>
            </div>

            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <AlertTriangle className="text-amber-300 mt-1" />
                <div>
                  <div className="font-medium">Dairy spike</div>
                  <div className="text-xs text-gray-400">Dairy category waste +12% last week — recommend bulk discount.</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Clock className="text-blue-300 mt-1" />
                <div>
                  <div className="font-medium">Weekend demand</div>
                  <div className="text-xs text-gray-400">Push promotions for snacks Friday–Sunday to lower expiry risk.</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <DollarSign className="text-emerald-300 mt-1" />
                <div>
                  <div className="font-medium">Discount ROI</div>
                  <div className="text-xs text-gray-400">Applying 10–20% discounts on high-risk items typically recovers ~60% of value.</div>
                </div>
              </li>
            </ul>

            <div className="mt-4">
              <button className="w-full px-4 py-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition flex items-center gap-2 justify-center">
                <Bot size={16} /> Run Preventive Actions
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow w-full">
            <h4 className="font-semibold mb-2">Recommendations Log</h4>
            <div className="text-sm text-gray-300 space-y-2 max-h-44 overflow-auto">
              <div className="p-2 rounded bg-gray-900/40 border border-gray-800">
                <div className="text-xs text-gray-400">10:34 • Auto-discount applied</div>
                <div>Applied 15% discount to Yogurt (SKU-1002)</div>
              </div>
              <div className="p-2 rounded bg-gray-900/40 border border-gray-800">
                <div className="text-xs text-gray-400">09:12 • Recommendation</div>
                <div>Hold reorder for Orange Juice — low risk next 14 days</div>
              </div>
            </div>
            <div className="mt-3">
              <button className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 text-sm">Export Log</button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow w-full">
            <h4 className="font-semibold mb-2">Quick Actions</h4>
            <div className="flex flex-col gap-2">
              <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">Apply Suggested Discounts</button>
              <button className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700">Pause Reorders</button>
              <button className="px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">Create Bundle Offer</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Selected item modal (simple) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-50"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
            <div className="relative w-full max-w-2xl bg-gray-900/95 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Apply Recommendation</h3>
                  <div className="text-sm text-gray-400">{nearExpiry.find((n) => n.id === selected)?.product}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-200">✕</button>
              </div>

              <div className="grid gap-3 md:grid-cols-3 mb-4">
                <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                  <div className="text-xs text-gray-400">Stock</div>
                  <div className="font-semibold text-lg">{nearExpiry.find((n) => n.id === selected)?.stock}</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                  <div className="text-xs text-gray-400">Days Left</div>
                  <div className="font-semibold text-lg">{nearExpiry.find((n) => n.id === selected)?.daysLeft}</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                  <div className="text-xs text-gray-400">AI Risk</div>
                  <div className="font-semibold text-lg">{nearExpiry.find((n) => n.id === selected)?.risk}%</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-300 mb-2">Recommended action</div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30">Apply Discount</button>
                  <button className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">Create Bundle</button>
                  <button className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">Ignore</button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">Cancel</button>
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">Confirm</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
