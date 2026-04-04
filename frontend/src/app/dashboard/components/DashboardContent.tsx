"use client";

import Image from "next/image";
import {
  Plus,
  Users,
  Wallet,
  UserPlus,
  CalendarCog,
  AlertTriangle,
  Timer,
  TrendingDown,
  Bot,
  Bell,
  Settings,
  Send,
} from "lucide-react";

export default function DashboardContent() {
  return (
    <>
      {/* KPI Cards */}
      <div className="bg-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl ">
          <h2 className="text-gray-500 text-sm">Total Students</h2>
          <p className="text-2xl font-bold text-gray-800">1,245</p>
        </div>
        <div className="bg-white p-6 rounded-xl">
          <h2 className="text-gray-500 text-sm">Active Teachers</h2>
          <p className="text-2xl font-bold text-gray-800">78</p>
        </div>
        <div className="bg-white p-6 rounded-xl ">
          <h2 className="text-gray-500 text-sm">Revenue (This Month)</h2>
          <p className="text-2xl font-bold text-gray-800">₦4,560,000</p>
        </div>
        <div className="bg-white p-6 rounded-xl ">
          <h2 className="text-gray-500 text-sm">Outstanding Fees</h2>
          <p className="text-2xl font-bold text-red-600">₦850,000</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className=" grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side → Quick Actions + Smart Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Add Student */}
              <button className="bg-white p-4 rounded-lg text-sm flex flex-col items-center hover:shadow-md transition">
                <Users size={32} className="text-green-600 mb-2" />
                <span className="font-medium">Add Student</span>
                <span className="mt-2 flex items-center gap-1 text-green-700 text-xs bg-green-100 px-2 py-1 rounded">
                  <Plus size={12} /> New
                </span>
              </button>

              {/* Add Payment */}
              <button className="bg-white p-4 rounded-lg  text-sm flex flex-col items-center hover:shadow-md transition">
                <Wallet size={32} className="text-blue-600 mb-2" />
                <span className="font-medium">Add Payment</span>
                <span className="mt-2 flex items-center gap-1 text-blue-700 text-xs bg-blue-100 px-2 py-1 rounded">
                  <Plus size={12} /> New
                </span>
              </button>

              {/* Add Staff */}
              <button className="bg-white p-4 rounded-lg text-sm flex flex-col items-center hover:shadow-md transition">
                <UserPlus size={32} className="text-purple-600 mb-2" />
                <span className="font-medium">Add Staff</span>
                <span className="mt-2 flex items-center gap-1 text-purple-700 text-xs bg-purple-100 px-2 py-1 rounded">
                  <Plus size={12} /> New
                </span>
              </button>

              {/* Configure Timetable */}
              <button className="bg-white p-4 rounded-lg  text-sm flex flex-col items-center hover:shadow-md transition">
                <CalendarCog size={32} className="text-yellow-600 mb-2" />
                <span className="font-medium"> Timetable</span>
                <span className="mt-2 flex items-center gap-1 text-yellow-700 text-xs bg-yellow-100 px-2 py-1 rounded">
                  <Plus size={12} /> Setup
                </span>
              </button>
            </div>
          </div>

          {/* Smart Alerts */}
          <div className="bg-white p-6 rounded-xl ">
            <h2 className="text-lg font-semibold mb-4">Smart Alerts</h2>
            <ul className="space-y-3 text-sm">
              <li className="p-3 bg-yellow-50 text-yellow-700 rounded-lg flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-600" />
                20 students at risk of failing
              </li>
              <li className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                <Timer size={16} className="text-red-600" />
                15% fees overdue
              </li>
              <li className="p-3 bg-orange-50 text-orange-700 rounded-lg flex items-center gap-2">
                <TrendingDown size={16} className="text-orange-600" />
                2 teachers with low performance ratings
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side → AI Assistant */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bot size={18} /> AI Assistant
            </h2>

            {/* Chat Header */}
            <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="col-span-3 flex items-center">
                <Image
                  src="/images/profile-pic.jpg"
                  alt="Profile Picture"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <span className="font-medium text-gray-800 text-sm mx-3 mt-1">
                  Admin User
                </span>
              </div>
              <div className="col-span-1 flex gap-2 justify-end">
                <button className="p-2 hover:bg-gray-200 rounded-full">
                  <Bell className="w-4 h-4 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full">
                  <Settings className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Chat Body Placeholder */}
            <div className="flex-1 bg-blue-50 rounded-lg p-4 text-sm text-gray-500">
              <p>No messages yet. Start a conversation 👇</p>
            </div>

            {/* Input at Bottom */}
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                placeholder='Ask: "Me Anything"'
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-black transition flex items-center justify-center">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
