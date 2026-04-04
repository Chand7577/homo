"use client";

import { useState } from "react";
import { ChevronRight, Brain, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DynamicPricing() {
  const [pricingData, setPricingData] = useState([
    { id: 1, product: "Samsung 55” TV", current: 350, suggested: 339, confidence: 92 },
    { id: 2, product: "HP Laptop", current: 620, suggested: 609, confidence: 88 },
    { id: 3, product: "Bluetooth Speaker", current: 80, suggested: 77, confidence: 90 },
    { id: 4, product: "iPhone 14 Case", current: 25, suggested: 27, confidence: 70 },
  ]);

  const handleApply = (id: number) => {
    setPricingData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, current: item.suggested } : item
      )
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-950 via-black to-blue-950 text-gray-100">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Link href="/dashboard">
            <span className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer">
      AI Dahboard
            </span>
          </Link>
          <ChevronRight className="w-7 h-7 text-gray-500" />
          <span className="text-white">Dynamic Pricing</span>
        </h1>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT PANEL - AI INSIGHTS */}
        <div className="col-span-12 lg:col-span-4">
          <div className="w-full h-full backdrop-blur-xl bg-gray-900/70 border border-blue-500/30 rounded-2xl p-6 flex flex-col shadow-xl">
            <h2 className="font-semibold text-lg mb-4 text-blue-300 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" /> AI Pricing Insights
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Avg Margin</span>
                <span className="text-green-400 font-medium">24%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AI Target Margin</span>
                <span className="text-blue-400 font-medium">27%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Predicted Revenue Impact</span>
                <span className="text-yellow-400 font-medium">+12.5%</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 animate-pulse-slow">
              <div className="text-xs uppercase tracking-wide text-blue-400 mb-2">
                AI Suggestion
              </div>
              <div className="text-sm">
                “Lowering TV prices by <span className='text-yellow-300 font-semibold'>3%</span> may
                increase total sales by <span className='text-green-400 font-semibold'>18%</span>
                this week. Consider small markdowns on slow-moving stock.”
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button className="w-full py-3 rounded-lg border border-blue-500/40 text-blue-300 hover:bg-blue-500/20 transition">
                View Forecast Report
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - PRICING TABLE */}
        <div className="col-span-12 lg:col-span-8">
          <div className="h-full backdrop-blur-xl bg-gray-900/80 rounded-2xl border border-gray-800 shadow-2xl p-6 flex flex-col">
            <h2 className="font-semibold text-lg text-blue-300 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" /> Product Price Adjustments
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-950/40 text-gray-300">
                    <th className="py-3 px-4 text-left">Product</th>
                    <th className="py-3 px-4 text-left">Current ($)</th>
                    <th className="py-3 px-4 text-left">AI Suggested ($)</th>
                    <th className="py-3 px-4 text-left">Confidence</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-800 hover:bg-gray-800/40 transition"
                    >
                      <td className="py-3 px-4">{item.product}</td>
                      <td className="py-3 px-4 text-gray-200">${item.current.toFixed(2)}</td>
                      <td className="py-3 px-4 text-blue-300 font-medium">
                        ${item.suggested.toFixed(2)}{" "}
                        <span className="text-xs text-gray-500">
                          ({item.suggested < item.current ? "-" : "+"}
                          {Math.abs(((item.suggested - item.current) / item.current) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-yellow-400">{item.confidence}%</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleApply(item.id)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs hover:opacity-90 transition"
                        >
                          Apply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-400">AI Summary</div>
                <div className="text-gray-100 mt-1 text-sm">
                  4 products analyzed. 3 suggested price reductions may increase weekly revenue by
                  approximately <span className="text-green-400 font-semibold">12%</span>.
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
