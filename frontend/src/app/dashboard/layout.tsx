"use client";

import { useState } from "react";
import Image from "next/image";
import "../globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Clock,
  Settings,
  Bot,
  ClipboardList,
  DollarSign,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Search,
  Download,
  Rocket,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const navItems = [
    { name: "Dashboard", icon: Home, href: "/dashboard" },
    { name: "Inventory", icon: Package, href: "/dashboard/inventory" },
    { name: "Suppliers", icon: ClipboardList, href: "/dashboard/suppliers" },
    { name: "Sales", icon: ShoppingCart, href: "/dashboard/sales" },
    { name: "Staff", icon: Users, href: "/dashboard/staff" },
    { name: "Customers", icon: DollarSign, href: "/dashboard/customers" },
    { name: "Waste & Expiry", icon: BarChart3, href: "/dashboard/waste" },
    { name: "Analytics", icon: Clock, href: "/dashboard/analytics" },
    { name: "Automation", icon: Settings, href: "/dashboard/automation" },
    { name: "Alerts & AI", icon: Bot, href: "/dashboard/alerts" },
    { name: "Shelf Vision", icon: Eye, href: "/dashboard/vision" },
    { name: "Communication", icon: MessageSquare, href: "/dashboard/communication" },
  ];

  const isActive = (href: string) => {
    const normalize = (str: string) => str.replace(/\/+$/, "");
    return normalize(pathname) === normalize(href);
  };

  return (
    <section className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0f172a] text-gray-100 relative">
      {/* Sidebar */}
      <aside className="hidden sm:flex flex-col gap-6 
        bg-white/5 backdrop-blur-xl border-r border-white/10 
        w-60 p-4 items-start fixed top-0 left-0 h-full z-20">
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <Image
            src="/images/logo-removebg-preview.png"
            alt="Orbyt AI Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-lg font-semibold tracking-wide bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Orbyt AI
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 w-full">
          {navItems.map(({ name, icon: Icon, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg w-full transition-all 
                  ${
                    active
                      ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-blue-400" : ""}`} />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 sm:ml-60 flex flex-col">
        {/* Header */}
        <header className="p-4 sm:p-6 border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-10">
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 sm:gap-2">
            {/* Search */}
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search anything..."
                className="px-10 py-3 rounded-xl w-full bg-white/10 text-gray-100 
                  placeholder-gray-400 focus:ring-2 focus:ring-blue-500 border border-white/10"
              />
            </div>

            {/* Spacer */}
            <div className="col-span-1 hidden sm:block"></div>

            {/* Actions */}
            <div className="col-span-1 flex justify-end items-center gap-4 mt-3 sm:mt-0">
              {[Download, Rocket, Settings].map((Icon, i) => (
                <button
                  key={i}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-300 hover:text-blue-400"
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
              <Image
                src="/images/profile-pic.jpg"
                alt="Profile"
                width={36}
                height={36}
                className="object-cover rounded-full border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 pb-20">{children}</main>
      </div>

      {/* Mobile Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white/10 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-2 z-30">
        {navItems.slice(0, 3).map(({ name, icon: Icon, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={name}
              href={href}
              className={`relative flex flex-col items-center text-xs transition px-3 py-1 rounded-md 
                ${
                  active
                    ? "text-blue-400 font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
            >
              {active && (
                <span className="absolute -top-2 w-8 h-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              )}
              <Icon className={`w-6 h-6 mb-1 ${active ? "text-blue-400" : "text-gray-500"}`} />
              <span>{name}</span>
            </Link>
          );
        })}

        {/* More */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`relative flex flex-col items-center text-xs transition px-3 py-1 rounded-md 
            ${
              showMore
                ? "text-blue-400 font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
        >
          {showMore && (
            <span className="absolute -top-2 w-8 h-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
          )}
          <MoreHorizontal className={`w-6 h-6 mb-1 ${showMore ? "text-blue-400" : "text-gray-500"}`} />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile More Menu */}
      {showMore && (
        <div className="sm:hidden fixed bottom-14 left-0 w-full bg-white/10 backdrop-blur-xl border-t border-white/10 shadow-lg z-40">
          <nav className="flex flex-col divide-y divide-white/5">
            {navItems.slice(3).map(({ name, icon: Icon, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={name}
                  href={href}
                  onClick={() => setShowMore(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition 
                    ${
                      active
                        ? "text-blue-400 font-semibold bg-white/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-blue-400" : "text-gray-500"}`} />
                  <span>{name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </section>
  );
}
