"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Repeat,
  DollarSign,
  Trash2,
  UserCheck,
  BarChart3,
  Package,
  Settings,
  Play,
  Clock,
  FileText,
  Download,
  Zap,
} from "lucide-react";

/**
 * AutomationPage.tsx
 * - Automation Control Center (dark glassmorphic theme)
 * - Module cards grid, timeline of events, settings, and logs
 * - Tailwind + Framer Motion + lucide-react
 *
 * Drop into a Next.js route (e.g. app/dashboard/automation/page.tsx)
 */

type Module = {
  id: string;
  title: string;
  desc: string;
  icon: any;
  active: boolean;
  lastRun: string;
  status: "Active" | "Idle" | "Error";
};

const initialModules: Module[] = [
  {
    id: "auto-reorder",
    title: "Auto-Reorder System",
    desc: "Detects low inventory and places supplier orders automatically.",
    icon: Package,
    active: true,
    lastRun: "2m ago",
    status: "Active",
  },
  {
    id: "dynamic-pricing",
    title: "Dynamic Pricing Engine",
    desc: "Adjusts prices for slow-moving / near-expiry items.",
    icon: DollarSign,
    active: true,
    lastRun: "5m ago",
    status: "Active",
  },
  {
    id: "waste-forecast",
    title: "Waste Forecast",
    desc: "Predicts items likely to expire and recommends actions.",
    icon: Trash2,
    active: true,
    lastRun: "10m ago",
    status: "Active",
  },
  {
    id: "customer-insights",
    title: "Customer Insight Engine",
    desc: "Sends personalized offers based on purchase behavior.",
    icon: UserCheck,
    active: true,
    lastRun: "1h ago",
    status: "Active",
  },
  {
    id: "supplier-monitor",
    title: "Supplier Reliability Monitor",
    desc: "Scores suppliers and flags delivery risks.",
    icon: BarChart3,
    active: true,
    lastRun: "30m ago",
    status: "Active",
  },
  {
    id: "queue-manager",
    title: "Queue & Checkout Automations",
    desc: "Opens lanes and enables self-checkout suggestions.",
    icon: Repeat,
    active: false,
    lastRun: "3h ago",
    status: "Idle",
  },
];

const initialTimeline = [
  { time: "Just now", text: "Auto-Reorder placed ORD-2045 for Milk (50 units)" },
  { time: "5m ago", text: "Dynamic Pricing applied 10% discount to Yogurt" },
  { time: "10m ago", text: "Waste Forecast flagged Bread as urgent (1 day left)" },
  { time: "30m ago", text: "Supplier Monitor downgraded DairyCo to 72% reliability" },
];

export default function AutomationPage() {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoRunAll, setAutoRunAll] = useState<boolean>(false);
  const [pollInterval, setPollInterval] = useState<number>(30); // minutes
  const [logs] = useState([
    "2025-10-01 09:12 • ORD-2041 placed • Prestige Foods",
    "2025-10-01 08:55 • 15% discount applied • Yogurt",
    "2025-09-30 18:02 • Supplier rating updated • CyberTech 90%",
  ]);

  function toggleModule(id: string) {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, active: !m.active, status: !m.active ? "Active" : "Idle", lastRun: "just now" } : m
      )
    );
    pushTimeline(`Toggled module ${id} ${modules.find((m) => m.id === id)?.active ? "off" : "on"}`);
  }

  function runModuleNow(id: string) {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, lastRun: "just now", status: "Active" } : m)));
    pushTimeline(`Manual run: ${modules.find((m) => m.id === id)?.title}`);
  }

  function runAll() {
    setModules((prev) => prev.map((m) => ({ ...m, lastRun: "just now", status: m.active ? "Active" : "Idle" })));
    setAutoRunAll(true);
    pushTimeline("Manual run: All active automations triggered");
    setTimeout(() => setAutoRunAll(false), 1500);
  }

  function pushTimeline(text: string) {
    setTimeline((t) => [{ time: "Just now", text }, ...t].slice(0, 50));
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white overflow-auto relative">
      {/* decorative orbs */}
      <div className="absolute left-0 top-0 w-[520px] h-[520px] bg-purple-600/18 blur-[120px] rounded-full -z-10" />
      <div className="absolute right-0 bottom-0 w-[520px] h-[520px] bg-emerald-600/12 blur-[120px] rounded-full -z-10" />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-emerald-300">
            Automation Control Center
          </h1>
          <p className="text-gray-400 mt-1">Manage and monitor all automation modules — toggle, configure, and run workflows.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={runAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${autoRunAll ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"}`}
          >
            <Play size={16} /> Run All
          </button>

          <button
            onClick={() => setSettingsOpen((s) => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition"
          >
            <Settings size={16} /> Settings
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition">
            <FileText size={16} /> View Logs
          </button>
        </div>
      </header>

      {/* Modules grid + timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules grid (span 2 on large) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700">
                    <m.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{m.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${m.status === "Active" ? "text-emerald-300" : m.status === "Error" ? "text-rose-400" : "text-gray-300"}`}>
                          {m.status}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Last: {m.lastRun}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.active}
                        onChange={() => toggleModule(m.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 transition-colors" />
                      <span className="ml-3 text-sm text-gray-300">{m.active ? "ON" : "OFF"}</span>
                    </label>

                    <button
                      onClick={() => runModuleNow(m.id)}
                      className="px-3 py-1 rounded-md bg-amber-600/20 text-amber-300 border border-amber-500/25 text-sm hover:bg-amber-600/30 transition"
                    >
                      Run Now
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => pushModuleNote(m.id)}
                      className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:bg-gray-700 transition"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => emergencyStop(m.id)}
                      className="px-3 py-1 rounded-md bg-rose-600/20 text-rose-300 border border-rose-500/25 text-sm hover:bg-rose-600/30 transition"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Workflow timeline */}
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Workflow Timeline</h3>
              <div className="text-xs text-gray-400">Recent activity</div>
            </div>

            <ul className="space-y-3 text-sm text-gray-300">
              {timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-xs text-gray-400">{t.time}</div>
                    <div>{t.text}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setTimeline((t) => [{ time: "Just now", text: "Manual sweep: validated all automations" }, ...t].slice(0, 50));
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                Sweep Now
              </button>
              <button
                onClick={() => {
                  // export timeline as simple log download (client-side)
                  const blob = new Blob([timeline.map((i) => `${i.time} • ${i.text}`).join("\n")], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `automation-timeline-${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition"
              >
                <Download size={14} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Settings & Logs */}
        <aside className="space-y-6">
          {/* Quick status */}
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold">Automation Status</h4>
                <div className="text-xs text-gray-400">Overview of active automations</div>
              </div>
              <div className="text-sm text-emerald-300">{modules.filter((m) => m.active).length} Active</div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-300">
              <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-800">
                <div className="text-xs text-gray-400">Next Poll</div>
                <div className="font-semibold">{pollInterval}m</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-800">
                <div className="text-xs text-gray-400">Last Sweep</div>
                <div className="font-semibold">7m ago</div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Automation Settings</h4>
              <div className="text-xs text-gray-400">Global controls</div>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-gray-400">Auto-run interval (minutes)</div>
              <input
                type="range"
                min={5}
                max={120}
                value={pollInterval}
                onChange={(e) => setPollInterval(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-300 flex items-center justify-between">
                <span>{pollInterval} min</span>
                <button
                  onClick={() => {
                    setPollInterval(30);
                    pushTimeline("Reset poll interval to 30m");
                  }}
                  className="text-xs px-2 py-1 bg-gray-800 rounded-md border border-gray-700"
                >
                  Reset
                </button>
              </div>

              <div className="mt-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={autoRunAll} onChange={() => setAutoRunAll((s) => !s)} className="w-4 h-4" />
                  <span className="text-sm text-gray-300">Auto-run enabled</span>
                </label>
                <div className="text-xs text-gray-400 mt-2">When enabled, modules run automatically at set intervals.</div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    // simulate saving settings
                    pushTimeline("Saved automation settings");
                    setSettingsOpen(false);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setPollInterval(30);
                    setAutoRunAll(false);
                    pushTimeline("Reverted automation settings");
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                >
                  Revert
                </button>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Recent Logs</h4>
              <button
                onClick={() => {
                  // download logs (mock)
                  const blob = new Blob([logs.join("\n")], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `automation-logs-${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs px-2 py-1 rounded-md bg-gray-800 border border-gray-700"
              >
                Export
              </button>
            </div>

            <div className="text-sm text-gray-300 space-y-2 max-h-48 overflow-auto">
              {logs.map((l, i) => (
                <div key={i} className="text-xs text-gray-400">{l}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  // helpers inside component scope:

  function emergencyStop(id: string) {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, active: false, status: "Error", lastRun: "stopped" } : m)));
    pushTimeline(`Emergency stop: ${id}`);
  }

  function pushModuleNote(id: string) {
    const module = modules.find((m) => m.id === id);
    pushTimeline(`Opened details: ${module?.title}`);
  }
}
