// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Stethoscope,
  BookOpen,
  Activity,
  Calendar,
  Database,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  UserPlus,
  Pill,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";

// API Configuration
import { API_BASE } from "@/config";

const adminAPI = {
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE}/admin/dashboard/stats/`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch dashboard stats");
    return response.json();
  },

  getDoctorsStats: async () => {
    const response = await fetch(`${API_BASE}/admin/doctors/`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch doctors");
    return response.json();
  },

  getPatientsStats: async () => {
    const response = await fetch(`${API_BASE}/admin/patients/`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch patients");
    return response.json();
  },

  getRubricsStats: async () => {
    const response = await fetch(`${API_BASE}/admin/rubrics/`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch rubrics");
    return response.json();
  },

  getMedicinesStats: async () => {
    const response = await fetch(`${API_BASE}/admin/medicines/`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch medicines");
    return response.json();
  },

  getBackupStats: async () => {
    const response = await fetch(`${API_BASE}/admin/backup/stats/`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch backup stats");
    return response.json();
  },

  createBackup: async () => {
    const response = await fetch(`${API_BASE}/admin/backup/create/`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to create backup");
    return response.json();
  },
};

// StatsCard Component
interface StatsCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
}

const StatsCard = ({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color,
  bgColor,
  textColor,
}: StatsCardProps) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}
        >
          <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} ${textColor}`}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span className="text-xs font-semibold">{change}</span>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// ActivityItem Component
interface ActivityItemProps {
  type: string;
  action: string;
  name: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

const ActivityItem = ({
  action,
  name,
  time,
  icon: Icon,
  color,
}: ActivityItemProps) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-1">{action}</p>
          <p className="text-sm text-gray-600 mb-1">{name}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatTime(time)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await adminAPI.getDashboardStats();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch stats");
      }

      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupNow = async () => {
    setBackupLoading(true);

    try {
      const data = await adminAPI.createBackup();

      if (!data.success) {
        throw new Error(data.error || "Failed to create backup");
      }

      // Download the backup file
      const downloadUrl = `https://homo-backend-sumy.onrender.com/homeopathy/admin/backup/download/${data.backup.filename}/`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = data.backup.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Backup created and downloaded successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to create backup");
      console.error("Error creating backup:", err);
    } finally {
      setBackupLoading(false);
    }
  };

  const quickActions = [
    {
      label: "Add Doctor",
      icon: Stethoscope,
      color: "bg-[#3F856C] hover:bg-[#2d6350]",
      path: "/admin/doctors",
    },
    {
      label: "Add Patient",
      icon: UserPlus,
      color: "bg-blue-600 hover:bg-blue-700",
      path: "/admin/patients",
    },
    {
      label: "Add Rubric",
      icon: BookOpen,
      color: "bg-purple-600 hover:bg-purple-700",
      path: "/admin/repertory",
    },
    {
      label: "Backup Data",
      icon: Database,
      color: "bg-gray-900 hover:bg-black",
      path: "/admin/backup",
    },
  ];

  const activityIcons: any = {
    doctor: Stethoscope,
    patient: Users,
    rubric: BookOpen,
    medicine: Pill,
    backup: Database,
  };

  const activityColors: any = {
    doctor: "text-[#3F856C] bg-green-50",
    patient: "text-blue-600 bg-blue-50",
    rubric: "text-purple-600 bg-purple-50",
    medicine: "text-orange-600 bg-orange-50",
    backup: "text-gray-600 bg-gray-50",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
          <Sparkles className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Welcome to Admin Console!
          </h2>
          <p className="text-gray-500 mb-6 font-medium">
            The dashboard is initializing. You can try refreshing while the system connects to the backend services.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={fetchDashboardStats}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Dashboard
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Patients",
      value: stats?.totals?.patients?.toLocaleString() || "0",
      change: stats?.changes?.patients || "+0%",
      trend: "up" as const,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Total Doctors",
      value: stats?.totals?.doctors?.toLocaleString() || "0",
      change: stats?.changes?.doctors || "+0%",
      trend: "up" as const,
      icon: Stethoscope,
      color: "from-[#3F856C] to-[#2d6350]",
      bgColor: "bg-green-50",
      textColor: "text-[#3F856C]",
    },
    {
      label: "Total Rubrics",
      value: stats?.totals?.rubrics?.toLocaleString() || "0",
      change: stats?.changes?.rubrics || "+0",
      trend: "up" as const,
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Total Medicines",
      value: stats?.totals?.medicines?.toLocaleString() || "0",
      change: stats?.changes?.medicines || "+0",
      trend: "up" as const,
      icon: Pill,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const systemHealth = [
    {
      label: "Database",
      status: stats?.system_health?.database || "Healthy",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Server",
      status: stats?.system_health?.server || "Healthy",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "API",
      status: stats?.system_health?.api || "Healthy",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Storage",
      status: stats?.system_health?.storage || "0% Used",
      icon: AlertCircle,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Welcome back, Administrator
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardStats}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {statsCards.map((stat, idx) => (
            <StatsCard key={idx} {...stat} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Recent Activities
                  </h3>
                </div>
                <button className="text-sm font-semibold text-[#3F856C] hover:text-[#2d6350] flex items-center gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {stats?.activities && stats.activities.length > 0 ? (
                stats.activities.map((activity: any) => (
                  <ActivityItem
                    key={activity.id}
                    type={activity.type}
                    action={activity.action}
                    name={activity.name}
                    time={activity.time}
                    icon={activityIcons[activity.type]}
                    color={activityColors[activity.type]}
                  />
                ))
              ) : (
                <div className="p-12 text-center">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => router.push(action.path)}
                      className={`w-full ${action.color} text-white rounded-xl p-3 text-left flex items-center gap-3 transition-all group`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-semibold text-sm flex-1">
                        {action.label}
                      </span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                System Health
              </h3>
              <div className="space-y-3">
                {systemHealth.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm text-gray-700">
                          {item.label}
                        </span>
                      </div>
                      <span className={`text-sm font-semibold ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Last Backup */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5" />
                <h3 className="font-bold text-base">System Backup</h3>
              </div>
              <p className="text-2xl font-bold mb-2">
                {stats?.totals
                  ? `${(
                      (stats.totals.rubrics || 0) +
                      (stats.totals.medicines || 0) +
                      (stats.totals.doctors || 0) +
                      (stats.totals.patients || 0)
                    ).toLocaleString()} Records`
                  : "0 Records"}
              </p>
              <p className="text-sm text-gray-300 mb-4">Ready for backup</p>
              <button
                onClick={handleBackupNow}
                disabled={backupLoading}
                className="w-full py-2.5 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {backupLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Backup Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
