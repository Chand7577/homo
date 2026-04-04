"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Package,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsDashboard() {
  const [revenueData] = useState([
    { name: "Mon", actual: 4200, forecast: 4000 },
    { name: "Tue", actual: 4800, forecast: 4600 },
    { name: "Wed", actual: 5000, forecast: 4800 },
    { name: "Thu", actual: 5300, forecast: 5100 },
    { name: "Fri", actual: 6000, forecast: 5700 },
    { name: "Sat", actual: 7500, forecast: 7200 },
  ]);

  const [productData] = useState([
    { name: "Phones", value: 300 },
    { name: "Laptops", value: 250 },
    { name: "Accessories", value: 200 },
    { name: "Tablets", value: 150 },
  ]);

  const [customerData] = useState([
    { name: "Returning", value: 72 },
    { name: "New", value: 28 },
  ]);

  const COLORS = ["#6366f1", "#22d3ee", "#8b5cf6", "#10b981"];

  const alerts = [
    { icon: AlertTriangle, text: "⚠️ Milk stock may finish in 2 days", color: "text-yellow-400" },
    { icon: TrendingUp, text: "💰 Laptop category sales +24%", color: "text-green-400" },
    { icon: Activity, text: "🧾 Churn risk rising among Bronze-tier customers", color: "text-red-400" },
    { icon: Package, text: "📦 Supplier delivery rate improved 8%", color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-700/30 blur-[150px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-700/30 blur-[150px] rounded-full -z-10 animate-pulse" />

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI Analytics Dashboard
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium shadow-lg"
        >
          Refresh Data
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total Revenue" value="$52,300" icon={DollarSign} trend="+12%" color="text-green-400" />
        <KpiCard title="Profit Margin" value="28%" icon={TrendingUp} trend="+4%" color="text-green-400" />
        <KpiCard title="Avg Order Value" value="$86" icon={Activity} trend="+2.1%" color="text-blue-400" />
        <KpiCard title="Predicted Growth" value="+15%" icon={Brain} trend="Forecast" color="text-purple-400" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Forecast */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Sales & Revenue Forecast</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#111827", borderRadius: "10px" }} />
              <Line type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={3} />
              <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Breakdown */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Customer Behavior Insights</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={customerData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                {customerData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-gray-400 text-sm text-center mt-4">
            72% of total sales are from returning customers
          </p>
        </div>
      </div>

      {/* Product Performance & Supplier Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Performance */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Product Performance</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#111827", borderRadius: "10px" }} />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Supplier Health */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Inventory & Supplier Health</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <HealthCard title="Stock Health" value="89%" color="text-green-400" />
            <HealthCard title="Reorder Efficiency" value="98%" color="text-blue-400" />
            <HealthCard title="Top Supplier" value="Orbyt (9.6/10)" color="text-purple-400" />
          </div>
        </div>
      </div>

      {/* Smart Alerts */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-300">Smart Alerts</h2>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {alerts.map(({ icon: Icon, text, color }, i) => (
            <div key={i} className="flex items-center gap-3 text-sm bg-gray-800/60 p-3 rounded-xl border border-gray-700/50">
              <Icon size={16} className={color} />
              <span className={color}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 p-6 rounded-2xl text-center shadow-lg"
      >
        <p className="text-sm text-gray-300">
          🧠 <span className="text-blue-400 font-medium">Savrix AI Insight:</span> Revenue ↑14%, Churn ↓6%, Supplier
          Reliability ↑9%. AI predicts strong weekend performance 🚀
        </p>
      </motion.div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 shadow-lg"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm text-gray-400">{title}</h3>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className={`text-xs mt-1 ${color}`}>{trend}</p>
    </motion.div>
  );
}

function HealthCard({ title, value, color }: any) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
      <p className="text-gray-400 text-xs">{title}</p>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
    </div>
  );
}
