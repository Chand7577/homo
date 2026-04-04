"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function InventoryAI() {
  const [tab, setTab] = useState("Auto-Reorder");

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
          <span className="text-white">Inventory AI</span>
        </h1>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[75vh]">
        {/* Left Summary Panel */}
        <div className="col-span-12 lg:col-span-4">
          <div className="w-full h-full backdrop-blur-xl bg-gray-900/60 border rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-blue-300">Inventory Overview</span>
            </div>

            <div className="flex flex-col gap-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600/20">
                  <div className="text-2xl font-semibold text-blue-300">3</div>
                  <div className="text-xs text-gray-400 mt-1">Predicted Stockouts</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-600/20">
                  <div className="text-2xl font-semibold text-emerald-300">2%</div>
                  <div className="text-xs text-gray-400 mt-1">Forecasted Waste</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-600/20">
                  <div className="text-2xl font-semibold text-indigo-300">$245k</div>
                  <div className="text-xs text-gray-400 mt-1">Active Discounts</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-600/20">
                  <div className="text-2xl font-semibold text-cyan-300">95%</div>
                  <div className="text-xs text-gray-400 mt-1">Supplier Accuracy</div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 animate-pulse-slow">
                <div className="text-xs uppercase tracking-wide text-blue-400 mb-2">
                  AI Insight
                </div>
                <div className="text-sm">
                  System predicts <span className="text-purple-300">Milk</span> and <span className="text-blue-300">Bread</span> will run out in 2 days.
                </div>
              </div>

              {/* Smart Actions */}
              <div className="flex gap-2 mt-auto">
                <button className="px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition">
                  Generate Forecast
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition">
                  View AI Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right AI Tabs */}
        <div className="col-span-12 lg:col-span-8">
          <div className="h-full rounded-2xl backdrop-blur-xl bg-gray-900/70 shadow-2xl p-6 flex flex-col border border-gray-800">
            {/* Tab Selector */}
            <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
              {["Auto-Reorder", "Dynamic Pricing", "Waste Forecast"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                    tab === t
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "text-gray-400 hover:text-blue-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* AI Content Area */}
            <div className="flex-1 overflow-y-auto pr-2">
              {tab === "Auto-Reorder" && (
                <div className="space-y-6">
                  <h2 className="font-semibold text-lg text-blue-300">Smart Auto-Reorder</h2>
                  <p className="text-gray-400 text-sm">
                    AI monitors stock and automatically triggers supplier orders when predicted levels drop below safe threshold.
                  </p>
                  <div className="rounded-xl border border-gray-700 bg-gray-800/50 overflow-hidden">
                    <table className="w-full text-sm table-auto">
                      <thead className="bg-gray-800/70 text-gray-400 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left py-3 px-4">Product</th>
                          <th className="text-center py-3 px-4">Stock</th>
                          <th className="text-center py-3 px-4">Days Left</th>
                          <th className="text-center py-3 px-4">Reorder</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        <tr className="border-t border-gray-700">
                          <td className="py-3 px-4">Bread</td>
                          <td className="text-center py-3 px-4">24</td>
                          <td className="text-center py-3 px-4">2</td>
                          <td className="text-center py-3 px-4">
                            <span className="px-2 py-1 rounded bg-blue-900/40 text-blue-300 text-xs">Scheduled</span>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-700">
                          <td className="py-3 px-4">Milk</td>
                          <td className="text-center py-3 px-4">12</td>
                          <td className="text-center py-3 px-4">1</td>
                          <td className="text-center py-3 px-4">
                            <span className="px-2 py-1 rounded bg-purple-900/40 text-purple-300 text-xs">Urgent</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === "Dynamic Pricing" && (
                <div className="space-y-6">
                  <h2 className="font-semibold text-lg text-blue-300">Dynamic Pricing</h2>
                  <p className="text-gray-400 text-sm">
                    AI automatically adjusts prices for slow-moving or near-expiry products to maximize sales and minimize loss.
                  </p>
                  <div className="rounded-xl border border-gray-700 bg-gray-800/50 overflow-hidden">
                    <table className="w-full text-sm table-auto">
                      <thead className="bg-gray-800/70 text-gray-400 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left py-3 px-4">Product</th>
                          <th className="text-center py-3 px-4">Current Price</th>
                          <th className="text-center py-3 px-4">Suggested</th>
                          <th className="text-center py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        <tr className="border-t border-gray-700">
                          <td className="py-3 px-4">Cereal</td>
                          <td className="text-center py-3 px-4">$2,000</td>
                          <td className="text-center py-3 px-4">$1,800</td>
                          <td className="text-center py-3 px-4">
                            <button className="text-blue-400 hover:text-blue-300 text-xs">Apply</button>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-700">
                          <td className="py-3 px-4">Juice Pack</td>
                          <td className="text-center py-3 px-4">$1,500</td>
                          <td className="text-center py-3 px-4">$1,200</td>
                          <td className="text-center py-3 px-4">
                            <button className="text-blue-400 hover:text-blue-300 text-xs">Apply</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === "Waste Forecast" && (
                <div className="space-y-6">
                  <h2 className="font-semibold text-lg text-blue-300">Waste Forecast</h2>
                  <p className="text-gray-400 text-sm">
                    AI predicts items likely to expire soon and recommends proactive discounting or restock adjustments.
                  </p>
                  <div className="rounded-xl border border-gray-700 bg-gray-800/50 overflow-hidden">
                    <table className="w-full text-sm table-auto">
                      <thead className="bg-gray-800/70 text-gray-400 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left py-3 px-4">Product</th>
                          <th className="text-center py-3 px-4">Days to Expiry</th>
                          <th className="text-center py-3 px-4">Predicted Waste</th>
                          <th className="text-center py-3 px-4">Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        <tr className="border-t border-gray-700">
                          <td className="py-3 px-4">Yogurt</td>
                          <td className="text-center py-3 px-4">3</td>
                          <td className="text-center py-3 px-4">25%</td>
                          <td className="text-center py-3 px-4">
                            <span className="text-purple-300 text-xs">Discount 15%</span>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-700">
                          <td className="py-3 px-4">Butter</td>
                          <td className="text-center py-3 px-4">5</td>
                          <td className="text-center py-3 px-4">10%</td>
                          <td className="text-center py-3 px-4">
                            <span className="text-purple-300 text-xs">Bundle Offer</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
