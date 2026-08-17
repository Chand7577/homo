"use client";

import { motion } from "framer-motion";
import { Shield, Database, WifiOff, Palette, Building2 } from "lucide-react";

export default function SystemConfigurationPage() {
  return (
    <section className="relative min-h-screen overflow-hidden p-10 bg-gradient-to-b from-[#07101a] via-[#04050a] to-[#020205] text-white">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,#0d1b2a_1px,transparent_1px),linear-gradient(#0d1b2a_1px,transparent_1px)] bg-[size:40px_40px] animate-[gridMove_20s_linear_infinite]"></div>

      {/* Floating Blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-600/30 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>

      {/* Page Title */}
      <header className="relative z-10 text-center mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_20px_#7c4dff]">
          System & Configuration
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Manage global settings, access control, and system behavior across the
          school platform.
        </p>
      </header>

      {/* Config Cards Grid */}
      <motion.div
        className="grid md:grid-cols-2 gap-8 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Card Component */}
        <GlassCard
          icon={<Building2 className="w-6 h-6 text-cyan-400" />}
          title="Multi-Campus Management"
          description="Switch between campuses, manage campus-specific settings, and generate combined reports across branches."
          action="Manage Campuses"
          color="from-cyan-500 to-blue-600"
        />

        <GlassCard
          icon={<Shield className="w-6 h-6 text-green-400" />}
          title="Roles & Permissions"
          description="Define what teachers, accountants, parents, and other stakeholders can see and do in the system."
          action="Configure Permissions"
          color="from-green-500 to-emerald-600"
        />

        <GlassCard
          icon={<Database className="w-6 h-6 text-purple-400" />}
          title="Backup & Recovery"
          description="Secure cloud backups with offline export options. Restore previous states when needed."
          action="Backup Now"
          secondaryAction="Restore Backup"
          color="from-purple-500 to-pink-600"
        />

        <GlassCard
          icon={<WifiOff className="w-6 h-6 text-orange-400" />}
          title="Offline & Low-Data Mode"
          description="Optimize for rural/low-bandwidth environments by enabling lightweight operations."
          action="Toggle Low-Data Mode"
          color="from-orange-500 to-yellow-600"
        />

        <GlassCard
          icon={<Palette className="w-6 h-6 text-pink-400" />}
          title="Branding"
          description="Customize school branding: logos, report card templates, certificates, and app theme colors."
          action="Customize Branding"
          color="from-pink-500 to-rose-600"
        />
      </motion.div>
    </section>
  );
}

/* GlassCard Component */
function GlassCard({ icon, title, description, action, secondaryAction, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, rotateY: 3, rotateX: 3 }}
      className="relative group p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-transform"
    >
      {/* Aurora Sweep */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -inset-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[aurora_4s_linear_infinite]"></div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      <p className="text-gray-400 mb-4">{description}</p>
      <div className="flex gap-3">
        <button
          className={`px-4 py-2 rounded-lg bg-gradient-to-r ${color} text-white font-medium shadow-md hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]`}
        >
          {action}
        </button>
        {secondaryAction && (
          <button className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600">
            {secondaryAction}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* Animations */
const styles = `
@keyframes blob {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
.animate-blob { animation: blob 8s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }

@keyframes gridMove {
  0% { background-position: 0px 0px; }
  100% { background-position: 40px 40px; }
}
@keyframes aurora {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerHTML = styles;
  document.head.appendChild(styleSheet);
}
