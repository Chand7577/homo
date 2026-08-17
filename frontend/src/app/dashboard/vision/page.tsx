"use client";

import { useState } from "react";
import { Eye, Camera, AlertTriangle, CheckCircle, Package, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function ShelfVisionPage() {
  const [cameras] = useState([
    { id: 1, name: "Aisle 1 - Electronics", status: "Active", missing: 2, image: "/images/shelf1.jpg" },
    { id: 2, name: "Aisle 2 - Home Appliances", status: "Active", missing: 0, image: "/images/shelf2.jpg" },
    { id: 3, name: "Aisle 3 - Accessories", status: "Offline", missing: null, image: "/images/shelf3.jpg" },
  ]);

  const detections = [
    { id: 1, time: "09:42 AM", detail: "Detected empty space on Shelf A1 (TV Section)", severity: "warning" },
    { id: 2, time: "09:30 AM", detail: "All shelves restocked in Aisle 2", severity: "success" },
    { id: 3, time: "09:18 AM", detail: "Product misplacement detected on Shelf B4", severity: "warning" },
  ];

  const aiSuggestions = [
    { title: "Restock Shelf A1", desc: "Top 3 items are nearly sold out. Auto-notified supplier for refill." },
    { title: "Reorganize Section B4", desc: "Detected misplaced items; recommend physical check today." },
    { title: "Offline Camera Alert", desc: "Camera 3 disconnected — check network connection." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090f1d] via-[#0b1223] to-[#05070d] text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="text-blue-400 w-6 h-6" />
            Shelf Vision AI
          </h1>
          <p className="text-gray-400 text-sm">AI-powered visual monitoring of shelves in real time.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh Cameras
        </button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Camera Feeds */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-4">
            <Camera className="text-blue-400 w-5 h-5" />
            <h2 className="text-lg font-semibold">Live Shelf Cameras</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cameras.map((cam) => (
              <motion.div
                key={cam.id}
                whileHover={{ scale: 1.02 }}
                className="relative bg-[#0f1b2f] border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="absolute top-3 left-3 text-xs bg-black/50 px-2 py-1 rounded-lg">
                  {cam.name}
                </div>
                <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-lg backdrop-blur-md">
                  {cam.status === "Active" ? (
                    <span className="text-emerald-400">● Active</span>
                  ) : (
                    <span className="text-red-400">● Offline</span>
                  )}
                </div>
                <img
                  src={cam.image}
                  alt={cam.name}
                  className={`w-full h-48 object-cover ${
                    cam.status === "Offline" ? "opacity-30 grayscale" : ""
                  }`}
                />
                {cam.status === "Active" && (
                  <div className="absolute bottom-3 left-3 bg-black/40 px-3 py-1 rounded-xl text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-yellow-400" />
                  
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: AI Detections + Suggestions */}
        <div className="space-y-6">
          {/* AI Detection Logs */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-yellow-400 w-5 h-5" />
              <h2 className="text-lg font-semibold">AI Detection Log</h2>
            </div>

            <div className="space-y-4 text-sm">
              {detections.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border ${
                    log.severity === "success"
                      ? "border-emerald-500/30 bg-emerald-900/20"
                      : "border-yellow-500/30 bg-yellow-900/20"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{log.detail}</span>
                    <span className="text-gray-400 text-xs">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Suggestions */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye className="text-emerald-400 w-5 h-5" />
              <h2 className="text-lg font-semibold">AI Actions & Insights</h2>
            </div>

            <div className="space-y-4">
              {aiSuggestions.map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[#0f1b2e] to-[#0b1425] border border-white/10 p-4 rounded-xl"
                >
                  <h3 className="text-emerald-300 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {s.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
