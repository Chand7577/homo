// @ts-nocheck
"use client";

import { API_BASE } from "@/config";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Stethoscope,
  Users,
  Database,
  User,
  LogOut,
  UploadCloud
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Rubrics & Medicines", path: "/admin/repertory", icon: BookOpen },
  { label: "Manage Doctors", path: "/admin/doctors", icon: Stethoscope },
  { label: "Manage Patients", path: "/admin/patients", icon: Users },
  { label: "Data Backup", path: "/admin/backup", icon: Database },
  { label: "Import Data", path: "/admin/import", icon: UploadCloud },
  { label: "Profile", path: "/admin/profile", icon: User },
];

const AdminSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    console.log("Logout clicked!");

    // Clear local storage first
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    localStorage.removeItem("roleTimestamp");

    try {
      // Call backend logout endpoint
      const res = await fetch(
        `${API_BASE}/admin/logout/`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      // Optional: check JSON response
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        console.log("Logout response:", data);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }

    // Force full page reload and navigate to homepage
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-300 flex-col z-50">
        {/* LOGO */}
        <div
          onClick={() => router.push("/admin/dashboard")}
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
          {menuItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
              >
                <Icon
                  size={24}
                  className={`transition-colors ${isActive ? "text-black" : "text-gray-500"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs mt-1 font-medium transition-colors ${isActive ? "text-black" : "text-gray-500"}`}
                >
                  {item.label.split(" ")[0]}
                </span>
              </button>
            );
          })}

          {/* More menu (Profile) */}
          <button
            onClick={() => router.push("/admin/profile")}
            className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
          >
            <User
              size={24}
              className={`transition-colors ${pathname === "/admin/profile" ? "text-black" : "text-gray-500"}`}
              strokeWidth={pathname === "/admin/profile" ? 2.5 : 2}
            />
            <span
              className={`text-xs mt-1 font-medium transition-colors ${pathname === "/admin/profile" ? "text-black" : "text-gray-500"}`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default AdminSidebar;
