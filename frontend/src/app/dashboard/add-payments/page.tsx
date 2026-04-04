"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Package, Truck, AlertTriangle, Brain } from "lucide-react";

export default function AutoReorder() {
  const [autoApprove, setAutoApprove] = useState(true);

  const forecast = [
    { product: "Milk", stock: 12, runout: "1.5 Days", order: 50, cost: 800, status: "Auto-Order" },
    { product: "Bread", stock: 24, runout: "2 Days", order: 30, cost: 400, status: "Pending" },
    { product: "Juice Pack", stock: 10, runout: "0.8 Days", order: 60, cost: 900, status: "Ordered" },
  ];

  const alerts = [
    { icon: AlertTriangle, text: "Milk stock will run out in 1.2 days — Auto-order triggered.", color: "text-yellow-400" },
    { icon: Brain, text: "Demand for Juice Pack expected to increase by 15% this weekend.", color: "text-purple-400" },
    { icon: Truck, text: "Supplier ‘DairyCo’ delayed 2 deliveries this week — Reliability: 72%.", color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#020205] via-[#060a12] to-[#0a0f1c] text-gray-100">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Link href="/dashboard">
            <span className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer">
              AI Dashboard
            </span>
          </Link>
          <ChevronRight className="w-8 h-8 text-gray-500" />
          <span className="text-white">Auto-Reorder</span>
        </h1>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[75vh]">
        {/* Left Panel: AI Forecast Summary */}
        <div className="col-span-12 lg:col-span-4">
          <div className="w-full h-full backdrop-blur-xl bg-gray-900/60 border border-blue-500/30 rounded-2xl p-6 sticky top-20 flex flex-col shadow-xl">
            <h2 className="font-semibold text-lg mb-4 text-blue-300">AI Forecast Summary</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600/20">
                <div className="text-2xl font-semibold text-blue-300">3</div>
                <div className="text-xs text-gray-400 mt-1">Predicted Stockouts</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-600/20">
                <div className="text-2xl font-semibold text-emerald-300">5%</div>
                <div className="text-xs text-gray-400 mt-1">Overstock Risk</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-600/20">
                <div className="text-2xl font-semibold text-indigo-300">2.3 Days</div>
                <div className="text-xs text-gray-400 mt-1">Avg. Restock Time</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-600/20">
                <div className="text-2xl font-semibold text-cyan-300">4</div>
                <div className="text-xs text-gray-400 mt-1">Auto Orders This Week</div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 animate-pulse-slow">
              <div className="text-xs uppercase tracking-wide text-blue-400 mb-2">AI Insight</div>
              <div className="text-sm">
                System predicts <span className="text-purple-300">Milk</span> and{" "}
                <span className="text-blue-300">Bread</span> will run out in 2 days.
              </div>
            </div>

            <div className="flex gap-2 mt-auto pt-6">
              <button className="px-4 py-2 rounded-lg border border-blue-500/40 text-blue-300 hover:bg-blue-500/20 transition">
                Generate Forecast
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition">
                View Report
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Reorder Table + Alerts */}
        <div className="col-span-12 lg:col-span-8">
          <div className="h-full backdrop-blur-xl bg-gray-900/70 rounded-2xl border border-gray-800 shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-blue-300">Smart Auto-Reorder</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Auto-Approve Orders</span>
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={() => setAutoApprove(!autoApprove)}
                  className="accent-blue-500 w-4 h-4"
                />
              </div>
            </div>

            {/* Reorder Table */}
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2 px-3">Product</th>
                    <th className="py-2 px-3">Stock Left</th>
                    <th className="py-2 px-3">Run-out (Days)</th>
                    <th className="py-2 px-3">Order Qty</th>
                    <th className="py-2 px-3">Cost</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((item, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/40 transition">
                      <td className="py-3 px-3">{item.product}</td>
                      <td className="text-center px-3">{item.stock}</td>
                      <td className="text-center px-3">{item.runout}</td>
                      <td className="text-center px-3">{item.order}</td>
                      <td className="text-center px-3">${item.cost}</td>
                      <td className="text-center px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.status === "Auto-Order"
                              ? "bg-blue-900/40 text-blue-300"
                              : item.status === "Ordered"
                              ? "bg-green-900/40 text-green-300"
                              : "bg-yellow-900/40 text-yellow-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Supplier Orders Timeline */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-gray-800/70 to-gray-900/70 border border-gray-700">
              <h3 className="font-semibold text-blue-300 mb-3">Supplier Orders Timeline</h3>
              <ul className="space-y-3 text-sm">
                <li>📦 <b>Milk</b> → 50 units — Ordered to <span className="text-blue-300">DairyCo</span> — ETA: 2 days</li>
                <li>📦 <b>Bread</b> → 30 units — Auto Approved — ETA: Tomorrow</li>
                <li>📦 <b>Juice Pack</b> → 60 units — Awaiting Supplier Confirmation</li>
              </ul>
            </div>

            {/* Smart Alerts & Insights */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30">
              <h3 className="font-semibold text-blue-300 mb-3">Smart Alerts & Insights</h3>
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2 text-sm ${a.color}`}>
                    <a.icon className="w-4 h-4 mt-0.5" />
                    <span>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-2 mt-4">
              <button className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition">
                Back
              </button>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition">
                  Sync Suppliers
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg shadow hover:opacity-90 transition">
                  Confirm Reorders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
