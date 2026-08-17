"use client";

import { useState } from "react";
import { Bell, Brain, CheckCircle, AlertTriangle, Clock, TrendingUp, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function AlertsAIPage() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello 👋 I'm Orbyt AI — monitoring your inventory and predicting trends in real time." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }, { sender: "ai", text: "I'm processing that request... 🔍" }]);
    setInput("");
  };

  const alerts = [
    { id: 1, type: "Low Stock", message: "Product A is below minimum threshold (15 left).", icon: AlertTriangle, color: "text-yellow-400" },
    { id: 2, type: "Sales Spike", message: "Unusual spike in Product B sales (+38% in 24h).", icon: TrendingUp, color: "text-emerald-400" },
    { id: 3, type: "Expiry Alert", message: "10 units of Product C will expire in 5 days.", icon: Clock, color: "text-red-400" },
  ];

  const aiSuggestions = [
    { title: "Restock Advice", desc: "Product A will likely sell out within 3 days. Reorder now to avoid stockout." },
    { title: "Dynamic Pricing", desc: "Increase Product B price by 4% — high demand forecasted next week." },
    { title: "Waste Reduction", desc: "Redistribute Product C to high-turnover outlets to reduce expiry risk." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#0b1120] to-[#05070e] p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Alerts & AI Assistant</h1>
          <p className="text-gray-400 text-sm">Monitor live alerts and get AI-powered recommendations instantly.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm hover:bg-white/20 transition">
            Clear All Alerts
          </button>
          <button className="px-4 py-2 bg-emerald-600 rounded-xl text-sm hover:bg-emerald-700 transition">
            AI Settings
          </button>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Alerts Feed */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="col-span-1 bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-blue-400 w-5 h-5" />
            <h2 className="text-lg font-semibold">Live Alerts</h2>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition">
                <alert.icon className={`${alert.color} w-5 h-5 mt-1`} />
                <div>
                  <h4 className="text-sm font-semibold">{alert.type}</h4>
                  <p className="text-gray-400 text-sm">{alert.message}</p>
                </div>
                <button className="ml-auto text-emerald-400 hover:text-emerald-500">
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Center - AI Insights */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="col-span-1 bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="text-emerald-400 w-5 h-5" />
            <h2 className="text-lg font-semibold">AI Insights</h2>
          </div>

          <div className="space-y-4">
            {aiSuggestions.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-[#0f1b2e] to-[#0c1423] p-4 rounded-xl border border-white/10"
              >
                <h3 className="font-semibold text-emerald-300">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right - AI Chat Assistant */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="col-span-1 bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="text-blue-400 w-5 h-5" />
            <h2 className="text-lg font-semibold">Ask AI</h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[80%] ${
                    msg.sender === "ai"
                      ? "bg-blue-900/30 text-blue-200"
                      : "bg-emerald-700 text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white/10 border border-white/10 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleSend}
              className="bg-emerald-600 p-2 rounded-xl hover:bg-emerald-700 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
