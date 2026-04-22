"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Pill,
  LogOut,
  MoreHorizontal,
  FilePlus,
  User,
  ListChecks,
  Inbox,
} from "lucide-react";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

/**
 * MAIN MENU CONFIG
 */
const menuItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Inbox", path: "/doctorinbox", icon: Inbox, showBadge: true },
  { label: "New Case", path: "/cases", icon: FilePlus },
  // { label: "Repertorization", path: "/repertorize", icon: ListChecks },
  { label: "Rubrics", path: "/rubrics", icon: ClipboardList },
  { label: "Medicines", path: "/medicines", icon: Pill },
  { label: "Profile", path: "/doctorprofile", icon: User },
];

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  /**
   * FETCH INBOX COUNTS
   */
  const fetchInboxCounts = async () => {
    try {
      const response = await fetch(`${API_BASE}/doctor/inbox/?limit=1`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.counts?.unread || 0);
          setPendingCount(data.counts?.pending || 0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch inbox counts:", error);
    }
  };

  /**
   * FETCH COUNTS ON MOUNT AND PERIODICALLY
   */
  useEffect(() => {
    fetchInboxCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchInboxCounts, 30000);

    return () => clearInterval(interval);
  }, []);

  /**
   * LOGOUT HANDLER (matches AdminSidebar behavior)
   */
  const handleLogout = async () => {
    console.log("Doctor logout clicked");

    // 1️⃣ Clear frontend auth state
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    localStorage.removeItem("roleTimestamp");

    try {
      // 2️⃣ Call backend logout endpoint
      await fetch("https://homo-backend-sumy.onrender.com/homeopathy/doctor/logout/", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }

    // 3️⃣ Force full app reset
    window.location.href = "/";
  };

  // Calculate total notifications (unread + pending)
  const totalNotifications = unreadCount + pendingCount;

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-300 flex-col z-50">
        {/* LOGO */}
        <div
          onClick={() => router.push("/")}
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
            const showNotificationBadge =
              item.showBadge && totalNotifications > 0;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition relative
                  ${
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <div className="relative">
                  <Icon size={20} />
                  {showNotificationBadge && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalNotifications > 99 ? "99+" : totalNotifications}
                    </span>
                  )}
                </div>
                {item.label}
                {showNotificationBadge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalNotifications > 99 ? "99+" : totalNotifications}
                  </span>
                )}
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

      {/* ================= MOBILE NAVIGATION ================= */}
      <div className="md:hidden">
        {showMoreMenu && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-30"
            onClick={() => setShowMoreMenu(false)}
          />
        )}

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-4 gap-1 px-1 py-2">
            {/* Show first 3 items: Home, Inbox, New Case */}
            {menuItems.slice(0, 3).map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              const showNotificationBadge =
                item.showBadge && totalNotifications > 0;

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="flex flex-col items-center justify-center py-2 px-1 relative"
                >
                  <div className="relative">
                    <Icon
                      size={24}
                      className={isActive ? "text-black" : "text-gray-500"}
                    />
                    {showNotificationBadge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {totalNotifications > 9 ? "9+" : totalNotifications}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium ${
                      isActive ? "text-black" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* MORE MENU */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex flex-col items-center justify-center py-2 px-1 w-full"
              >
                <MoreHorizontal size={24} className="text-gray-500" />
                <span className="text-xs mt-1 font-medium text-gray-500">
                  More
                </span>
              </button>

              {showMoreMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    {menuItems.slice(3).map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.path;

                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            router.push(item.path);
                            setShowMoreMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
                            isActive
                              ? "bg-gray-100 text-black"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <Icon size={20} />
                          {item.label}
                        </button>
                      );
                    })}

                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={20} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
