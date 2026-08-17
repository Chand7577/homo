"use client";

import { motion } from "framer-motion";
import {
  Brain,
  RefreshCcw,
  AlertTriangle,
  DollarSign,
  Package,
  Plus,
  LineChart,
  Settings,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

export default function InventoryAI() {
  const [openChat, setOpenChat] = useState(false);

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white overflow-hidden p-8">
      {/* Floating Gradient Blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/30 blur-[150px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/30 blur-[150px] rounded-full -z-10 animate-pulse" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Inventory Command Center
        </h1>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-md hover:scale-105 transition">
            <Plus size={18} /> Add Product
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition">
            <RefreshCcw size={18} /> Sync Suppliers
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-600/30 transition">
            <Brain size={18} /> Generate AI Forecast
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Stock Value", value: "$184,200", color: "from-blue-600 to-purple-500" },
          { label: "Near Depletion", value: "12 Items", color: "from-rose-600 to-red-500" },
          { label: "Predicted Stockouts (7d)", value: "8 SKUs", color: "from-amber-500 to-yellow-400" },
          { label: "Waste Risk", value: "6.3%", color: "from-green-500 to-emerald-400" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg shadow-black/20`}
          >
            <p className="text-sm text-gray-100/90">{stat.label}</p>
            <h3 className="text-2xl font-semibold">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* AI Insight Cards */}
      <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6 mb-10">
        {[
          {
            icon: LineChart,
            title: "Demand Surge Detected",
            desc: "Laptop chargers trending +18% this week.",
            color: "text-blue-400",
          },
          {
            icon: AlertTriangle,
            title: "Overstock Warning",
            desc: "Phone cases exceeding safe stock by 25%.",
            color: "text-yellow-400",
          },
          {
            icon: DollarSign,
            title: "Dynamic Discount Suggested",
            desc: "10% markdown may boost slow-moving goods.",
            color: "text-green-400",
          },
          {
            icon: Brain,
            title: "AI Reorder Active",
            desc: "7 SKUs reordered automatically this cycle.",
            color: "text-purple-400",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 backdrop-blur-lg shadow-md"
          >
            <card.icon className={`${card.color} w-6 h-6 mb-3`} />
            <h3 className="font-semibold text-lg">{card.title}</h3>
            <p className="text-gray-400 text-sm">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Forecast Table */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="text-blue-400" /> Smart Reorder Overview
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Predicted Need</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">AI Auto-Order</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["iPhone Cable", 22, 100, "Prestige", "✅", "Reordering"],
                ["Flash Drive", 10, 80, "TechWorld", "❌", "Low Stock"],
                ["HDMI Cable", 50, 60, "CyberTech", "✅", "Stable"],
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-800/50 hover:bg-gray-800/40 transition"
                >
                  {row.map((cell, j) => (
                    <td key={j} className="py-3 px-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Floating AI Chat */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full shadow-lg shadow-purple-700/40"
        onClick={() => setOpenChat(!openChat)}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      <motion.div
        initial={{ x: 400 }}
        animate={{ x: openChat ? 0 : 400 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed bottom-0 right-0 w-80 h-96 bg-gray-900/80 border border-gray-800 rounded-tl-2xl p-4 shadow-xl backdrop-blur-lg"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Brain className="text-purple-400" /> Inventory AI
          </h3>
          <button onClick={() => setOpenChat(false)} className="text-gray-400 hover:text-gray-200">
            ✕
          </button>
        </div>
        <div className="text-gray-400 text-sm space-y-2 overflow-y-auto h-[80%]">
          <p>👋 Hello! I’ve analyzed your stock levels.</p>
          <p>💡 Recommendation: Reorder USB Drives within 48 hours.</p>
          <p>⚠️ 3 products are trending toward expiry. Apply markdowns?</p>
        </div>
      </motion.div>
    </div>
  );
}
