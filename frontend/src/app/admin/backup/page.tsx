// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Download,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  HardDrive,
  FileText,
  Users,
  Stethoscope,
  BookOpen,
  RefreshCw,
  Pill,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/homeopathy";

const DataBackup = () => {
  const [loading, setLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [stats, setStats] = useState({
    total_rubrics: 0,
    total_medicines: 0,
    total_grades: 0,
    total_synonyms: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastBackup, setLastBackup] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/backup/stats/`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats");
      }

      setStats(data.stats);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    setBackupProgress(0);
    setError("");
    setSuccess("");

    // Simulate progress
    const progressInterval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch(`${API_BASE}/admin/backup/create/`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create backup");
      }

      clearInterval(progressInterval);
      setBackupProgress(100);

      // Store backup info
      setLastBackup(data.backup);

      // Download the backup file
      const downloadUrl = `${API_BASE}/admin/backup/download/${data.backup.filename}/`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = data.backup.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(
        `Backup created successfully! File: ${data.backup.filename} (${data.backup.size})`,
      );

      setTimeout(() => {
        setBackupProgress(0);
      }, 2000);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || "Failed to create backup");
      console.error("Error creating backup:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !confirm(
        "Are you sure you want to restore from this backup? This will overwrite existing data.",
      )
    ) {
      event.target.value = "";
      return;
    }

    setRestoreLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("backup_file", file);

      const response = await fetch(`${API_BASE}/admin/backup/restore/`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to restore backup");
      }

      setSuccess(
        `Backup restored successfully! Restored: ${JSON.stringify(data.restored)}`,
      );

      // Refresh stats
      await fetchStats();
    } catch (err: any) {
      setError(err.message || "Failed to restore backup");
      console.error("Error restoring backup:", err);
    } finally {
      setRestoreLoading(false);
      event.target.value = "";
    }
  };

  const dataStats = [
    {
      label: "Total Rubrics",
      value: stats.total_rubrics.toLocaleString(),
      icon: BookOpen,
      color: "bg-gray-900",
    },
    {
      label: "Total Medicines",
      value: stats.total_medicines.toLocaleString(),
      icon: Pill,
      color: "bg-[#3F856C]",
    },
    {
      label: "Medicine-Rubric Links",
      value: stats.total_grades.toLocaleString(),
      icon: FileText,
      color: "bg-gray-700",
    },
    {
      label: "Total Synonyms",
      value: stats.total_synonyms.toLocaleString(),
      icon: BookOpen,
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Data Backup & Restore
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage system backups and data restoration
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:px-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 text-sm flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-xs mt-1">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleBackup}
            disabled={loading}
            className="bg-gradient-to-br from-[#3F856C] to-[#2d6350] text-white rounded-2xl p-6 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Download className="w-7 h-7 text-[#3F856C]" />
              </div>
              <RefreshCw
                className={`w-6 h-6 ${loading ? "animate-spin" : ""}`}
              />
            </div>
            <h3 className="text-lg font-bold mb-1">Create Full Backup</h3>
            <p className="text-sm text-white text-opacity-90">
              {loading
                ? "Backing up data..."
                : "Export all system data including rubrics, medicines, and grades"}
            </p>
            {loading && (
              <div className="mt-4">
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${backupProgress}%` }}
                  />
                </div>
                <p className="text-xs mt-2 text-white text-opacity-80">
                  {backupProgress}% completed
                </p>
              </div>
            )}
          </button>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                <Upload className="w-7 h-7 text-white" />
              </div>
              {restoreLoading && (
                <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Restore Backup
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {restoreLoading
                ? "Restoring data..."
                : "Import and restore data from a previous backup file"}
            </p>
            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                disabled={restoreLoading}
                className="hidden"
              />
              <span className="block w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-all text-center cursor-pointer">
                {restoreLoading ? "Restoring..." : "Choose Backup File"}
              </span>
            </label>
          </div>
        </div>

        {/* Data Statistics */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Database Overview
            </h3>
            <button
              onClick={fetchStats}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh stats"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last Backup Info */}
        {lastBackup && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Latest Backup
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-gray-900">
                    {lastBackup.filename}
                  </h4>
                  <span className="px-2.5 py-1 bg-[#3F856C] bg-opacity-10 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(lastBackup.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(lastBackup.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4" />
                    <span>{lastBackup.size}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gray-900 text-white rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-[#3F856C]" />
            </div>
            <div>
              <h4 className="font-bold mb-2">Backup Guidelines</h4>
              <ul className="text-sm space-y-1 text-white text-opacity-90">
                <li>
                  • Create regular backups before making major changes to the
                  system
                </li>
                <li>
                  • Backup files are downloaded as JSON files to your computer
                </li>
                <li>
                  • Keep multiple backup copies in different locations for
                  safety
                </li>
                <li>
                  • Test restore functionality periodically to ensure data
                  integrity
                </li>
                <li>
                  • Backup files contain all rubrics, medicines, grades,
                  synonyms, and modalities
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataBackup;
