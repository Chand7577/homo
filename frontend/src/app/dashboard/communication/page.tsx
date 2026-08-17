"use client";

import { useState } from "react";
import {
  MessageCircle,
  Bell,
  Send,
  Users,
  Bot,
  AlertTriangle,
  Volume2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [message, setMessage] = useState("");

  const tabs = [
    { id: "inbox", label: "Inbox", icon: MessageCircle },
    { id: "announcements", label: "Announcements", icon: Volume2 },
    { id: "alerts", label: "AI Alerts", icon: AlertTriangle },
  ];

  const messages = [
    {
      id: 1,
      sender: "John Doe",
      role: "Inventory Manager",
      message: "Shelf A1 restock completed.",
      time: "10:12 AM",
    },
    {
      id: 2,
      sender: "AI Assistant",
      role: "System Bot",
      message: "Detected low stock on Aisle 4 (Accessories).",
      time: "09:48 AM",
    },
  ];

  const announcements = [
    {
      id: 1,
      title: "System Maintenance",
      content:
        "Savrix AI backend will undergo maintenance tonight from 11:00 PM to 1:00 AM.",
      time: "Today, 8:00 AM",
    },
    {
      id: 2,
      title: "New Supplier Partnership",
      content:
        "We’ve partnered with QuickShip Logistics for faster delivery processing.",
      time: "Yesterday, 5:15 PM",
    },
  ];

  const alerts = [
    {
      id: 1,
      level: "High",
      message: "Camera 3 offline for over 15 minutes.",
      time: "10:21 AM",
    },
    {
      id: 2,
      level: "Medium",
      message: "Delayed supplier shipment for Order #4523.",
      time: "09:40 AM",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#090d17] to-[#05070d] text-white p-8 relative overflow-hidden">
      {/* Floating Gradient Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/30 blur-[160px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/30 blur-[160px] rounded-full -z-10 animate-pulse" />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="text-blue-400" /> Communication Center
          </h1>
          <p className="text-gray-400 text-sm">
            Manage messages, AI announcements, and automated alerts.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 rounded-xl shadow-lg shadow-blue-800/40 hover:scale-105 transition">
          <Send size={16} /> New Message
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 pb-3 px-3 font-medium transition ${
              activeTab === id
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6"
      >
        {activeTab === "inbox" && (
          <div className="flex flex-col h-[500px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#0f1b2e]/80 border border-white/10 p-4 rounded-xl"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-blue-300">
                      {msg.sender}
                    </span>
                    <span className="text-gray-500 text-xs">{msg.time}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{msg.message}</p>
                  <span className="text-gray-500 text-xs italic">
                    {msg.role}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-3 mt-auto">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[#0d1425] border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                disabled={!message.trim()}
                onClick={() => setMessage("")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-xl flex items-center gap-2 text-sm hover:scale-105 transition disabled:opacity-50"
              >
                <Send size={16} /> Send
              </button>
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="space-y-4">
            {announcements.map((a) => (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.02 }}
                className="bg-[#0f1b2f]/60 border border-white/10 p-5 rounded-xl"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-blue-300">{a.title}</h3>
                  <span className="text-xs text-gray-500">{a.time}</span>
                </div>
                <p className="text-gray-400 text-sm">{a.content}</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border ${
                  alert.level === "High"
                    ? "border-red-500/30 bg-red-900/20"
                    : "border-yellow-500/30 bg-yellow-900/20"
                }`}
              >
                <div className="flex justify-between">
                  <span>{alert.message}</span>
                  <span className="text-gray-400 text-xs">{alert.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Footer Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-xl flex items-center gap-3"
      >
        <Bot className="text-blue-400 w-6 h-6" />
        <p className="text-sm text-gray-300">
          <span className="text-blue-400 font-semibold">Orbyt AI:</span> “I’ve
          summarized 3 new alerts and updated staff communication priority
          channels.”
        </p>
      </motion.div>
    </div>
  );
}
