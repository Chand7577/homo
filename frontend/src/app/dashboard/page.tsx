"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Clock3,
  Users,
  Truck,
  Brain,
  Bot,
  Send,
  Bell,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const demandData = [
  { day: "Mon", demand: 85 },
  { day: "Tue", demand: 88 },
  { day: "Wed", demand: 92 },
  { day: "Thu", demand: 90 },
  { day: "Fri", demand: 95 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6 rounded-md bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Cosmic Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,153,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(0,149,255,0.15),transparent_40%)] pointer-events-none"></div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 relative z-10">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          AI Dashboard
        </h1>
        <p className="text-sm text-gray-400">Powered by Orbyt AI</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 relative z-10">
        {[
          { title: "Forecast Accuracy", value: "96%" },
          { title: "Predicted Stockouts", value: "3 Products" },
          { title: "Waste Risk", value: "₦120,000", danger: true },
          { title: "Peak Hour", value: "4:30 PM - 6:00 PM" },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-emerald-400/30 transition"
          >
            <h2 className="text-sm text-gray-400">{card.title}</h2>
            <p
              className={`text-2xl font-bold ${
                card.danger ? "text-red-400" : "text-white"
              }`}
            >
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Side → AI Modules */}
        <div className="space-y-8">
          {/* AI Modules / Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-emerald-300">
              AI Modules
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { href: "/dashboard/add-student", icon: Package, label: "Inventory mng AI", color: "emerald" },
                { href: "/dashboard/add-payments", icon: Truck, label: "Auto-Reorder", color: "blue" },
                { href: "/dashboard/assign-teacher", icon: DollarSign, label: "Dynamic Pricing", color: "yellow" },
                { href: "/dashboard/timetable", icon: Brain, label: "Waste Forecast", color: "purple" },
              ].map(({ href, icon: Icon, label, color }, idx) => (
                <Link key={idx} href={href}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-xl flex flex-col items-center backdrop-blur-lg bg-white/5 border border-white/10 hover:border-emerald-400/30 transition"
                  >
                    <Icon className={`w-8 h-8 text-${color}-400 mb-2`} />
                    <span className="font-medium text-sm text-gray-200">
                      {label}
                    </span>
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>

          {/* Inventory Demand Forecast */}
          <div className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-md font-semibold text-emerald-300">
                Inventory Demand Forecast
              </h2>
              <span className="text-sm text-gray-400">
                Confidence: <span className="font-medium text-cyan-400">92%</span>
              </span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandData}>
                  <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <YAxis domain={[80, 100]} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17,25,40,0.9)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#22d3ee" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Smart Alerts */}
          <div className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold mb-4 text-emerald-300">
              Smart Alerts
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg flex items-center gap-2">
                <AlertTriangle size={16} /> 5 products nearing expiry
              </li>
              <li className="p-3 bg-blue-500/10 text-blue-400 rounded-lg flex items-center gap-2">
                <Truck size={16} /> Supplier delay detected for "Fresh Milk"
              </li>
              <li className="p-3 bg-red-500/10 text-red-400 rounded-lg flex items-center gap-2">
                <TrendingUp size={16} /> Unusual demand surge in "Bottled Water"
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side → AI Assistant */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-cyan-300">
              <Bot size={18} /> AI Assistant
            </h2>

            {/* Chat Header */}
            <div className="grid grid-cols-4 gap-4 mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="col-span-3 flex items-center">
                <Image
                  src="/images/profile-pic.jpg"
                  alt="Profile Picture"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <span className="font-medium text-sm mx-3 text-gray-300">
                  Manager (You)
                </span>
              </div>
              <div className="col-span-1 flex gap-2 justify-end">
                <button className="p-2 hover:bg-white/10 rounded-full">
                  <Bell className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full">
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 bg-black/30 rounded-lg p-4 text-sm text-gray-400 border border-white/10 overflow-y-auto">
              <p className="mb-2 text-emerald-300">AI:</p>
              <p>“Hello! Based on today’s data, I recommend reordering ‘Peak Cola’ — stock will run out in 2 days.”</p>
              <p className="mt-4 text-emerald-300">You:</p>
              <p>“Approve reorder and check supplier reliability.”</p>
            </div>

            {/* Input */}
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder="Ask the AI Assistant..."
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition flex items-center justify-center">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
