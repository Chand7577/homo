"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function WasteForecast() {
  const [view, setView] = useState("Overview");

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
          <ChevronRightIcon className="w-8 h-8 text-gray-500" />
          <span className="text-white">Waste Forecast</span>
        </h1>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[75vh]">
        {/* Left Summary Panel */}
        <div className="col-span-12 lg:col-span-4">
          <div className="w-full h-full backdrop-blur-xl bg-gray-900/60 border rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-blue-300">Waste Overview</span>
            </div>

            <div className="flex flex-col gap-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-600/20">
                  <div className="text-2xl font-semibold text-purple-300">2%</div>
                  <div className="text-xs text-gray-400 mt-1">Predicted Waste Rate</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-900/30 to-rose-900/30 border border-red-600/20">
                  <div className="text-2xl font-semibold text-rose-300">12</div>
                  <div className="text-xs text-gray-400 mt-1">Items Near Expiry</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-600/20">
                  <div className="text-2xl font-semibold text-blue-300">$1.2k</div>
                  <div className="text-xs text-gray-400 mt-1">Loss Prevented</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-600/20">
                  <div className="text-2xl font-semibold text-emerald-300">87%</div>
                  <div className="text-xs text-gray-400 mt-1">Accuracy Rate</div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 animate-pulse-slow">
                <div className="text-xs uppercase tracking-wide text-purple-400 mb-2">
                  AI Insight
                </div>
                <div className="text-sm">
                  System predicts <span className="text-pink-300">Yogurt</span> and <span className="text-blue-300">Butter</span> may expire within 5 days.
                </div>
              </div>

              {/* Smart Actions */}
              <div className="flex gap-2 mt-auto">
                <button className="px-4 py-2 rounded-lg text-sm font-medium border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition">
                  Generate Forecast
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition">
                  View AI Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Detail Tabs */}
        <div className="col-span-12 lg:col-span-8">
          <div className="h-full rounded-2xl backdrop-blur-xl bg-gray-900/70 shadow-2xl p-6 flex flex-col border border-gray-800">
            {/* Tab Selector */}
            <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
              {["Overview", "At-Risk Items", "Recommendations"].map((t) => (
                <button
                  key={t}
                  onClick={() => setView(t)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                    view === t
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                      : "text-gray-400 hover:text-purple-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* AI Content Area */}
            <div className="flex-1 overflow-y-auto pr-2">
              {view === "Overview" && (
                <div className="space-y-6">
                  <h2 className="font-semibold text-lg text-purple-300">AI Waste Overview</h2>
                  <p className="text-gray-400 text-sm">
                    The AI system tracks expiry trends, spoilage risk, and turnover speed across all products. Forecasts update daily to reduce waste and increase profitability.
                  </p>
                  <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                    <ul className="space-y-3 text-sm text-gray-300">
                      <li>• Average shelf-life utilization: <span className="text-purple-300">76%</span></li>
                      <li>• Peak spoilage category: <span className="text-blue-300">Dairy Products</span></li>
                      <li>• Daily savings potential: <span className="text-emerald-300">$85</span></li>
                    </ul>
                  </div>
                </div>
              )}

              {view === "At-Risk Items" && (
                <div className="space-y-6">
                  <h2 className="font-semibold text-lg text-purple-300">Items at Risk</h2>
                  <p className="text-gray-400 text-sm">
                    These items are approaching expiry or have declining demand. Apply AI-driven actions to prevent waste.
                  </p>
                  <div className="rounded-xl border border-gray-700 bg-gray-800/50 overflow-hidden">
                    <table className="w-full text-sm table-auto">
                      <thead className="bg-gray-800/70 text-gray-400 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left py-3 px-4">Product</th>
                          <th className="text-center py-3 px-4">Days to Expiry</th>
                          <th className="text-center py-3 px-4">Waste Risk</th>
                          <th className="text-center py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        <tr className="border-t border-gray-700">
                          <td className="py-3 px-4">Yogurt</td>
                          <td className="text-center py-3 px-4">3</td>
                          <td className="text-center py-3 px-4">High</td>
                          <td className="text-center py-3 px-4">
                            <span className="px-2 py-1 rounded bg-rose-900/40 text-rose-300 text-xs">Discount 15%</span>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-700">
                          <td className="py-3 px-4">Butter</td>
                          <td className="text-center py-3 px-4">5</td>
                          <td className="text-center py-3 px-4">Medium</td>
                          <td className="text-center py-3 px-4">
                            <span className="px-2 py-1 rounded bg-blue-900/40 text-blue-300 text-xs">Bundle Offer</span>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-700">
                          <td className="py-3 px-4">Fruit Juice</td>
                          <td className="text-center py-3 px-4">6</td>
                          <td className="text-center py-3 px-4">Low</td>
                          <td className="text-center py-3 px-4">
                            <span className="px-2 py-1 rounded bg-emerald-900/40 text-emerald-300 text-xs">Monitor</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {view === "Recommendations" && (
                <div className="space-y-6">
                  <h2 className="font-semibold text-lg text-purple-300">AI Recommendations</h2>
                  <p className="text-gray-400 text-sm">
                    Suggested next actions based on your inventory forecast and expiry trends.
                  </p>
                  <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 space-y-3 text-sm text-gray-300">
                    <div>• Apply <span className="text-pink-300">10–15% discounts</span> on all dairy items expiring within 5 days.</div>
                    <div>• Reorder smaller batches for <span className="text-blue-300">low-demand categories</span> to minimize future waste.</div>
                    <div>• Increase shelf visibility for <span className="text-emerald-300">vegetable items</span> approaching expiry.</div>
                    <div>• Enable “Smart Rotation” feature to automatically reprioritize shelf placement based on expiry date.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
