"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Clock, User, LogOut, BookOpen, Mail, Stethoscope } from "lucide-react";

import { API_BASE } from "@/config";

const menuItems = [
  { label: "Home", path: "/patient/home", icon: Home },
  // { label: "Doctor", path: "/patient/doctor", icon: Stethoscope },
  // { label: "Searches", path: "/patient/searches", icon: Search },
  { label: "Inboxes", path: "/patient/inboxes", icon: Mail },
  { label: "Resources", path: "/patient/resources", icon: BookOpen },
  { label: "Profile", path: "/patient/profile", icon: User },
];

const PatientSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    // 1. Clear frontend auth state first
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    localStorage.removeItem("roleTimestamp");

    try {
      // 2. Call backend logout to destroy the server-side session
      await fetch(`${API_BASE}/patient/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    // 3. Force full page reload so layout re-checks auth and shows the login modal
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-300 flex-col z-50">
        {/* LOGO */}
        <div
          onClick={() => router.push("/patient/home")}
          className="flex items-center gap-3 px-6 py-5 cursor-pointer border-b border-gray-300"
        >
          <img
            src="https://res.cloudinary.com/dvt1wv1dy/image/upload/v1768980964/id_rglqbg.png"
            alt="Homeopathic Logo"
            className="h-20 w-auto"
          />
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
                  ${isActive ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}
                `}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="px-4 py-4 border-t border-gray-300">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
              >
                <Icon
                  size={22}
                  className={`transition-colors ${isActive ? "text-black" : "text-gray-500"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors ${
                    isActive ? "text-black" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
          >
            <LogOut size={22} className="text-red-500" strokeWidth={2} />
            <span className="text-[10px] mt-1 font-medium text-red-500">
              Logout
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default PatientSidebar;
