"use client";

import { useState, useEffect, useRef } from "react";
import {
  LineChart as ReLineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  LineChart,
  PieChart,
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { easeOut } from "framer-motion";

/**
 * ReportsPage — upgraded with:
 * - Dark gradient backdrop
 * - Animated/blurred tech-orbs with parallax (mousemove)
 * - Animated grid background
 * - Glass cards with aurora sweep (pseudo-element)
 * - Framer Motion + AnimatePresence for card entry
 * - Counters with glowing gradient text
 * - Micro-interactions: tilt on hover + glow/pulse on buttons
 */

export default function ReportsPage() {
  // loading simulation
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // counters
  const [counters, setCounters] = useState({ schools: 0, students: 0, uptime: 0 });
  useEffect(() => {
    const dur = 1400;
    const start = Date.now();
    const from = { schools: 0, students: 0, uptime: 0 };
    const to = { schools: 20, students: 1_000_000, uptime: 99.9 };
    let raf = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / dur);
      setCounters({
        schools: Math.floor(from.schools + (to.schools - from.schools) * t),
        students: Math.floor(from.students + (to.students - from.students) * t),
        uptime: +(from.uptime + (to.uptime - from.uptime) * t).toFixed(1),
      });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Parallax motion values (for blobs & subtle card motion)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  // Transforms for layers
  const orb1X = useTransform(mouseX, [0, 1], [-40, 40]);
  const orb1Y = useTransform(mouseY, [0, 1], [-40, 40]);
  const orb2X = useTransform(mouseX, [0, 1], [40, -40]);
  const orb2Y = useTransform(mouseY, [0, 1], [20, -20]);
  const gridX = useTransform(mouseX, [0, 1], [-10, 10]);
  const gridY = useTransform(mouseY, [0, 1], [-10, 10]);

  // Chart dummy data
  const academicData = [
    { month: "Jan", avg: 65 },
    { month: "Feb", avg: 72 },
    { month: "Mar", avg: 70 },
    { month: "Apr", avg: 75 },
    { month: "May", avg: 80 },
  ];
  const teacherData = [
    { teacher: "A", performance: 85 },
    { teacher: "B", performance: 72 },
    { teacher: "C", performance: 68 },
    { teacher: "D", performance: 90 },
  ];
  const dropoutData = [
    { month: "Jan", risk: 10 },
    { month: "Feb", risk: 15 },
    { month: "Mar", risk: 8 },
    { month: "Apr", risk: 12 },
    { month: "May", risk: 7 },
  ];
  const financeData = [
    { month: "Jan", revenue: 4000, expenses: 2400 },
    { month: "Feb", revenue: 3000, expenses: 1398 },
    { month: "Mar", revenue: 2000, expenses: 980 },
    { month: "Apr", revenue: 2780, expenses: 3908 },
    { month: "May", revenue: 1890, expenses: 4800 },
  ];
  const resourceData = [
    { name: "Classrooms", value: 40 },
    { name: "Labs", value: 25 },
    { name: "Library", value: 20 },
    { name: "Sports", value: 15 },
  ];
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  // spinner
  const Spinner = () => (
    <div className="flex items-center justify-center h-40">
      <div className="w-10 h-10 border-4 border-white/20 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cardVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: easeOut } },
};


  // handler to normalize mouse coords to 0..1
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={onMouseMove}
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #07101a 0%, #04050a 50%, #020205 100%)",
        color: "white",
      }}
    >
      {/* Animated grid background (Tron floor) */}
      <motion.div
        style={{ x: gridX, y: gridY }}
        className="absolute inset-0 pointer-events-none -z-20"
      >
        <div className="absolute inset-0 opacity-10" aria-hidden>
          <div className="w-full h-full bg-[linear-gradient(180deg,#0000_0,#0000_40%,rgba(255,255,255,0.01)_60%)]" />
        </div>

        <div
          className="absolute inset-0 bg-repeat -z-10"
          style={{
            backgroundImage:
              "linear-gradient(transparent 0 95%, rgba(124,77,255,0.03) 95%), linear-gradient(90deg, transparent 0 95%, rgba(0,240,255,0.02) 95%)",
            backgroundSize: "40px 40px, 40px 40px",
            opacity: 0.12,
            animation: "gridMove 12s linear infinite",
          }}
        />
      </motion.div>

      {/* Orbs / Tech blobs (parallax) */}
      <motion.div
        style={{ x: orb1X, y: orb1Y }}
        className="absolute -left-40 -top-36 w-96 h-96 rounded-full blur-3xl bg-gradient-to-tr from-[#00f0ff]/30 via-[#7c4dff]/25 to-[#00ff7a]/12 opacity-80 pointer-events-none -z-10 animate-blob"
      />
      <motion.div
        style={{ x: orb2X, y: orb2Y }}
        className="absolute right-[-6rem] bottom-[-6rem] w-80 h-80 rounded-full blur-2xl bg-gradient-to-br from-[#ff4dff]/20 via-[#00f0ff]/20 to-[#ffd24d]/10 opacity-70 pointer-events-none -z-10 animate-blob animation-delay-2000"
      />

      {/* Page header + counters */}
      <header className="relative z-10 mb-6">
        <h1 className="text-4xl font-extrabold leading-tight mb-3"
            style={{
              background:
                "linear-gradient(90deg, #00f0ff, #7c4dff)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: "0 0 18px rgba(124,77,255,0.18)",
            }}
        >
          <span style={{ WebkitTextStroke: "0.6px rgba(124,77,255,0.12)" }}>
            Analytics & Reports
          </span>
          <div className="text-sm mt-1 text-gray-300">AI-Powered insights for academics, staff & finance</div>
        </h1>

        {/* Counters */}
        <div className="mt-6 flex gap-4 flex-wrap">
          <motion.div
            variants={cardVariants}
            initial="enter"
            animate="center"
            className="glass-card p-4 rounded-2xl border border-white/8 backdrop-blur-md shadow-neon-primary min-w-[180px]"
            whileHover={{ scale: 1.02, rotateX: 1 }}
            style={{ perspective: 800 }}
          >
            <div className="text-sm text-slate-300">Schools</div>
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-[0_0_18px_rgba(99,102,241,0.22)]">
              {counters.schools}+
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="enter"
            animate="center"
            className="glass-card p-4 rounded-2xl border border-white/8 backdrop-blur-md shadow-neon-primary min-w-[220px]"
            whileHover={{ scale: 1.02, rotateX: 1 }}
            style={{ perspective: 800 }}
          >
            <div className="text-sm text-slate-300">Students</div>
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ffd36b] to-[#7ef9ff] drop-shadow-[0_0_18px_rgba(249,115,22,0.18)]">
              {counters.students.toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="enter"
            animate="center"
            className="glass-card p-4 rounded-2xl border border-white/8 backdrop-blur-md shadow-neon-primary min-w-[180px]"
            whileHover={{ scale: 1.02, rotateX: 1 }}
            style={{ perspective: 800 }}
          >
            <div className="text-sm text-slate-300">Uptime</div>
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#a0ffb8] to-[#7ef9ff] drop-shadow-[0_0_18px_rgba(160,255,184,0.16)]">
              {counters.uptime}%
            </div>
          </motion.div>
        </div>
      </header>

      {/* Chart cards (AnimatePresence) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mt-6">
        <AnimatePresence mode="popLayout">
          {/* Academic Trends */}
          <motion.article
            key="academic"
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="glass-card p-6 rounded-2xl border border-white/8 backdrop-blur-md shadow-lg hover:shadow-[0_10px_40px_rgba(59,130,246,0.12)] transform-gpu transition"
            whileHover={{ rotateY: 4, rotateX: 2, scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-lg">Academic Trends</h3>
            </div>
            {loading ? (
              <Spinner />
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={academicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.6)" }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.6)" }} />
                    <Tooltip contentStyle={{ background: "#0b1320" }} />
                    <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* aurora sweep pseudo-element injected via style tag below */}
          </motion.article>

          {/* Teacher Performance */}
          <motion.article
            key="teachers"
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="glass-card p-6 rounded-2xl border border-white/8 backdrop-blur-md shadow-lg hover:shadow-[0_10px_40px_rgba(16,185,129,0.08)] transform-gpu transition"
            whileHover={{ rotateY: -4, rotateX: 2, scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-lg">Teacher Performance</h3>
            </div>
            {loading ? (
              <Spinner />
            ) : (
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teacherData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="teacher" tick={{ fill: "rgba(255,255,255,0.6)" }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.6)" }} />
                    <Tooltip contentStyle={{ background: "#0b1320" }} />
                    <Bar dataKey="performance" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.article>

          {/* Dropout */}
          <motion.article
            key="dropout"
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="glass-card p-6 rounded-2xl border border-white/8 backdrop-blur-md shadow-lg hover:shadow-[0_10px_40px_rgba(239,68,68,0.08)] transform-gpu transition col-span-1 lg:col-span-2"
            whileHover={{ rotateY: 2, rotateX: -2, scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-lg">Dropout & Absenteeism Prediction</h3>
            </div>
            {loading ? (
              <Spinner />
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={dropoutData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.6)" }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.6)" }} />
                    <Tooltip contentStyle={{ background: "#0b1320" }} />
                    <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.article>

          {/* Financial Analytics */}
          <motion.article
            key="finance"
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="glass-card p-6 rounded-2xl border border-white/8 backdrop-blur-md shadow-lg hover:shadow-[0_10px_40px_rgba(124,77,255,0.06)] transform-gpu transition"
            whileHover={{ rotateY: -3, rotateX: 3, scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <LineChart className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-lg">Financial Analytics</h3>
            </div>
            {loading ? (
              <Spinner />
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={financeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.6)" }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.6)" }} />
                    <Tooltip contentStyle={{ background: "#0b1320" }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.article>

          {/* Resource Utilization (pie) */}
          <motion.article
            key="resources"
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="glass-card p-6 rounded-2xl border border-white/8 backdrop-blur-md shadow-lg hover:shadow-[0_10px_40px_rgba(245,158,11,0.06)] transform-gpu transition"
            whileHover={{ rotateY: 3, rotateX: -1, scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-5 h-5 text-orange-400" />
              <h3 className="font-semibold text-lg">Resource Utilization</h3>
            </div>
            {loading ? (
              <Spinner />
            ) : (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={resourceData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {resourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0b1320" }} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      </div>

      {/* Inline styles for grid animation + aurora sweep + utility classes */}
      <style jsx>{`
        /* subtle grid motion */
        @keyframes gridMove {
          0% { background-position: 0px 0px, 0px 0px; }
          50% { background-position: 20px 20px, -20px -20px; }
          100% { background-position: 0px 0px, 0px 0px; }
        }

        /* glass-card utility used above */
        .glass-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          position: relative;
          overflow: hidden;
        }

        /* aurora sweep: before pseudo element on cards */
        .glass-card:before {
          content: "";
          position: absolute;
          top: -40%;
          left: -30%;
          width: 160%;
          height: 220%;
          transform: rotate(25deg);
          background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          mix-blend-mode: overlay;
          opacity: 0;
          transition: opacity 0.6s ease, transform 0.6s ease;
          pointer-events: none;
        }
        .glass-card:hover:before {
          opacity: 0.25;
          transform: rotate(25deg) translateX(10%);
        }

        /* neon shadow util */
        .shadow-neon-primary {
          box-shadow: 0 12px 36px rgba(124,77,255,0.08), 0 0 40px rgba(126,249,255,0.03);
        }

        /* animate-blob (reused from your theme) */
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </section>
  );
}
