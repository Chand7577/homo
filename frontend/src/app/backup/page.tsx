// @ts-nocheck
"use client";

import { useState } from 'react';
import { 
  Database,
  Download,
  Clock,
  CheckCircle,
  FileText,
  HardDrive,
  Calendar,
  RefreshCw,
  Trash2,
  Eye,
  ChevronRight,
  Archive,
  Settings,
  Info,
  Zap
} from 'lucide-react';

const BackupManagement = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  const backupHistory = [
    { 
      id: 1, 
      name: 'Full_Database_Backup_2026_01_24.sql',
      size: '45.2 MB',
      date: '24 Jan 2026, 10:30 AM',
      time: '2 hours ago',
      type: 'Full Backup',
      status: 'success',
      records: 12847,
      duration: '2m 34s'
    },
    { 
      id: 2, 
      name: 'Rubrics_Backup_2026_01_23.sql',
      size: '12.5 MB',
      date: '23 Jan 2026, 03:15 PM',
      time: '1 day ago',
      type: 'Partial Backup',
      status: 'success',
      records: 1247,
      duration: '45s'
    },
    { 
      id: 3, 
      name: 'Medicines_Backup_2026_01_23.sql',
      size: '3.8 MB',
      date: '23 Jan 2026, 03:00 PM',
      time: '1 day ago',
      type: 'Partial Backup',
      status: 'success',
      records: 356,
      duration: '28s'
    },
  ];

  const startBackup = (type) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 md:px-8 py-3 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">Backup</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1 truncate">Secure your data with backups</p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 ml-2">
            <button className="hidden md:flex px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button 
              onClick={() => startBackup('full')}
              disabled={isProcessing}
              className="px-2 md:px-4 py-2 md:py-2.5 bg-gray-900 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-black transition-colors flex items-center gap-1.5 md:gap-2 shadow-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Create Backup</span>
                  <span className="sm:hidden">Backup</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 md:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-8">
          {[
            { label: 'Total Backups', value: '24', badge: 'Active', icon: Database, color: 'bg-gray-900' },
            { label: 'Storage Used', value: '1.2 GB', icon: HardDrive, color: 'bg-[#3F856C]' },
            { label: 'Last Backup', value: '2h', icon: Clock, color: 'bg-gray-700' },
            { label: 'Success Rate', value: '100%', icon: CheckCircle, color: 'bg-gray-600' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className={`${stat.color} w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center`}>
                    <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  {stat.badge && (
                    <span className="text-xs font-bold text-[#3F856C] bg-green-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-0.5 md:mb-1 truncate">{stat.label}</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8">
          <button 
            onClick={() => startBackup('full')}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-white hover:shadow-2xl transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Full Database</h3>
            <p className="text-xs md:text-sm text-gray-400 line-clamp-2">Complete backup of all data</p>
            <div className="mt-2 md:mt-4 text-xs text-gray-500">
              ~45 MB • 2-3 min
            </div>
          </button>

          <button 
            onClick={() => startBackup('rubrics')}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-gray-200 hover:border-gray-900 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Rubrics Only</h3>
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2">Rubrics & modalities</p>
            <div className="mt-2 md:mt-4 text-xs text-gray-500">
              ~12 MB • 45 sec
            </div>
          </button>

          <button 
            onClick={() => startBackup('medicines')}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-gray-200 hover:border-gray-900 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                <Archive className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Medicines & Grades</h3>
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2">Medicines with mappings</p>
            <div className="mt-2 md:mt-4 text-xs text-gray-500">
              ~4 MB • 30 sec
            </div>
          </button>
        </div>

        {/* Auto Backup Settings */}
        <div className="bg-gradient-to-br from-[#3F856C] to-[#2d6050] rounded-xl md:rounded-2xl p-4 md:p-8 mb-4 md:mb-8 text-white">
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
            <div className="flex items-start gap-3 md:gap-4 flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Zap className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Automatic Backup</h3>
                <p className="text-green-100 text-xs md:text-sm mb-2 md:mb-4">
                  Daily at 2:00 AM. Stored securely for 30 days.
                </p>
                <div className="flex flex-wrap items-center gap-2 md:gap-6 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>Daily 2AM</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>30-day</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold transition-all w-full md:w-auto ${
                autoBackupEnabled 
                  ? 'bg-white text-[#3F856C]' 
                  : 'bg-white/20 text-white'
              }`}
            >
              {autoBackupEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-3 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-gray-900">Backup History</h3>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 truncate">All database backups</p>
            </div>
            <button className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5 md:gap-2 ml-2">
              <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{backup.name}</p>
                    <p className="text-xs text-gray-500">{backup.time}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0 ${
                    backup.type === 'Full Backup' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {backup.type === 'Full Backup' ? 'Full' : 'Partial'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{backup.size}</span>
                    <span>•</span>
                    <span>{backup.records.toLocaleString()} records</span>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-gray-500 hover:text-[#3F856C] hover:bg-green-50 rounded-lg transition-colors">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Backup Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Size</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Records</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {backupHistory.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{backup.name}</p>
                          <p className="text-xs text-gray-500">{backup.time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                        backup.type === 'Full Backup' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {backup.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {backup.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{backup.size}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{backup.records.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#3F856C]" />
                        <span className="text-sm font-semibold text-[#3F856C]">Success</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-[#3F856C] hover:bg-green-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 md:p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs md:text-sm text-gray-600">Showing 3 of 24</p>
            <button className="text-xs md:text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1">
              Load More
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl md:rounded-2xl p-3 md:p-6 mt-4 md:mt-8">
          <div className="flex items-start gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-bold text-blue-900 mb-1 md:mb-2">Backup Best Practices</p>
              <ul className="text-xs md:text-sm text-blue-800 space-y-0.5 md:space-y-1">
                <li>• Regular backups ensure data safety</li>
                <li>• Store backups in multiple locations</li>
                <li className="hidden md:list-item">• Test restoration periodically</li>
                <li>• Keep at least 30 days of history</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BackupManagement;
