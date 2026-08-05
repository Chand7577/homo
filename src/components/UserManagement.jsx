import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Clock, Search, Filter, 
  Eye, Mail, Phone, User, AlertTriangle, Shield,
  Calendar, Award, Stethoscope, Trash2
} from 'lucide-react';
import { authService } from '../services/authService';
import { formatDateTime, formatDateShort } from '../utils/dateFormatter';

export default function UserManagement({ lang = 'en' }) {
  const t = (en, hi) => lang === 'en' ? en : hi;
  
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [userToReject, setUserToReject] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [allUsersResponse, pendingResponse] = await Promise.all([
        authService.getAllUsers(),
        authService.getPendingRegistrations()
      ]);

      if (allUsersResponse.success) {
        setUsers(allUsersResponse.users);
      }
      if (pendingResponse.success) {
        setPendingUsers(pendingResponse.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: 'approving' }));
    try {
      const response = await authService.approveUser(userId);
      if (response.success) {
        await fetchUsers(); // Refresh data
        // Show success message or notification
      }
    } catch (error) {
      console.error('Failed to approve user:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleRejectUser = async () => {
    if (!userToReject) return;
    
    setActionLoading(prev => ({ ...prev, [userToReject._id]: 'rejecting' }));
    try {
      const response = await authService.rejectUser(userToReject._id, rejectReason);
      if (response.success) {
        await fetchUsers(); // Refresh data
        setShowRejectModal(false);
        setRejectReason('');
        setUserToReject(null);
      }
    } catch (error) {
      console.error('Failed to reject user:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userToReject._id]: null }));
    }
  };

  const openRejectModal = (user) => {
    setUserToReject(user);
    setShowRejectModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (!user) return;
    if (user.email === 'admin@gmail.com') {
      alert(t('Primary admin account cannot be deleted.', 'मुख्य एडमिन खाता हटाया नहीं जा सकता।'));
      return;
    }
    if (!window.confirm(t(`Are you sure you want to permanently delete ${user.name}?`, `क्या आप वाकई ${user.name} को स्थायी रूप से हटाना चाहते हैं?`))) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [user._id]: 'deleting' }));
    try {
      const response = await authService.deleteUser(user._id);
      if (response.success) {
        await fetchUsers(); // Refresh data
      } else {
        alert(response.message || t('Failed to delete user', 'उपयोगकर्ता हटाने में विफल'));
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.message || t('Failed to delete user', 'उपयोगकर्ता हटाने में विफल'));
    } finally {
      setActionLoading(prev => ({ ...prev, [user._id]: null }));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone || '').includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredPendingUsers = pendingUsers.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone || '').includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Suspended': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return Shield;
      case 'Core Team': return Users;
      case 'External Doctor': return Stethoscope;
      case 'Patient': return User;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-emerald-600';
      case 'Core Team': return 'bg-blue-600';
      case 'External Doctor': return 'bg-indigo-600';
      case 'Patient': return 'bg-[#062E6F]';
      default: return 'bg-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#062E6F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">{t('Loading users...', 'उपयोगकर्ता लोड हो रहे हैं...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#062E6F]" />
            {t('User Management', 'उपयोगकर्ता प्रबंधन')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('Manage doctor registrations and user accounts', 'डॉक्टर पंजीकरण और उपयोगकर्ता खातों का प्रबंधन करें')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="surface p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t('Pending Approval', 'अनुमोदन लंबित')}
            </p>
            <p className="text-xl font-bold text-slate-800">{pendingUsers.length}</p>
          </div>
        </div>
        <div className="surface p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t('Approved Users', 'अनुमोदित उपयोगकर्ता')}
            </p>
            <p className="text-xl font-bold text-slate-800">{users.filter(u => u.status === 'Approved').length}</p>
          </div>
        </div>
        <div className="surface p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t('Total Users', 'कुल उपयोगकर्ता')}
            </p>
            <p className="text-xl font-bold text-slate-800">{users.length}</p>
          </div>
        </div>
        <div className="surface p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t('Active Doctors', 'सक्रिय डॉक्टर')}
            </p>
            <p className="text-xl font-bold text-slate-800">
              {users.filter(u => u.status === 'Approved' && ['Admin', 'Core Team', 'External Doctor'].includes(u.role)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pending'
                ? 'border-[#062E6F] text-[#062E6F]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {t('Pending Approvals', 'लंबित अनुमोदन')}
            {pendingUsers.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-[#062E6F] text-[#062E6F]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {t('All Users', 'सभी उपयोगकर्ता')}
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('Search by name, email, or phone...', 'नाम, ईमेल या फोन से खोजें...')}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30 appearance-none"
          >
            <option value="all">{t('All Roles', 'सभी भूमिकाएं')}</option>
            <option value="Admin">{t('Admin', 'व्यवस्थापक')}</option>
            <option value="Core Team">{t('Core Team', 'मुख्य टीम')}</option>
            <option value="External Doctor">{t('External Doctor', 'बाहरी डॉक्टर')}</option>
            <option value="Patient">{t('Patient', 'मरीज़')}</option>
          </select>
        </div>
      </div>

      {/* User Lists */}
      <div className="surface overflow-hidden">
        {activeTab === 'pending' ? (
          <div className="space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              {t('Pending Registrations', 'लंबित पंजीकरण')} ({filteredPendingUsers.length})
            </h3>
            
            {filteredPendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  {t('All caught up!', 'सब अप-टू-डेट है!')}
                </h3>
                <p className="text-slate-500">
                  {t('No pending registrations to review', 'समीक्षा के लिए कोई लंबित पंजीकरण नहीं')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPendingUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const isLoading = actionLoading[user._id];
                  
                  return (
                    <div key={user._id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getRoleColor(user.role)} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                            {(user.name || '?').split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase()}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="text-base sm:text-lg font-semibold text-slate-800 truncate">{user.name}</h4>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} text-white w-fit`}>
                                <RoleIcon className="h-3 w-3" />
                                {user.role}
                              </div>
                            </div>
                            
                            <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
                                <span className="font-mono">{user.phone}</span>
                              </div>
                              {user.specialization && (
                                <div className="flex items-center gap-2">
                                  <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
                                  <span className="truncate">{user.specialization}</span>
                                </div>
                              )}
                              {user.registrationNumber && (
                                <div className="flex items-center gap-2">
                                  <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                                  <span className="font-mono text-emerald-700 font-semibold">{user.registrationNumber}</span>
                                  <span className="text-[9px] sm:text-[10px] bg-emerald-50 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                                    {t('Reg #', 'रजिस्ट्रेशन #')}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
                                <span>{t('Requested on', 'दिनांक')} {formatDateTime(user.requestedAt, false, lang)}</span>
                              </div>
                            </div>
                            
                            {(user.experience || user.qualifications || user.registrationNumber) && (
                              <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs sm:text-sm space-y-1">
                                {user.registrationNumber && (
                                  <p className="text-emerald-700 font-bold">
                                    <strong>{t('Registration #:', 'पंजीकरण #:')}</strong> 
                                    <span className="font-mono ml-1">{user.registrationNumber}</span>
                                  </p>
                                )}
                                {user.experience && (
                                  <p><strong>{t('Experience:', 'अनुभव:')}</strong> {user.experience}</p>
                                )}
                                {user.qualifications && (
                                  <p><strong>{t('Qualifications:', 'योग्यताएं:')}</strong> {user.qualifications}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveUser(user._id)}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                          >
                            {isLoading === 'approving' ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">{t('Approve', 'अनुमोदन')}</span>
                          </button>
                          <button
                            onClick={() => openRejectModal(user)}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                          >
                            {isLoading === 'rejecting' ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">{t('Reject', 'अस्वीकार')}</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-medium rounded-lg transition-colors min-h-[44px]"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('View', 'देखें')}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                          >
                            {isLoading === 'deleting' ? (
                              <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">{t('Delete', 'हटाएं')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-5">{t('User', 'उपयोगकर्ता')}</th>
                  <th className="py-3 px-5">{t('Role', 'भूमिका')}</th>
                  <th className="py-3 px-5">{t('Status', 'स्थिति')}</th>
                  <th className="py-3 px-5">{t('Contact', 'संपर्क')}</th>
                  <th className="py-3 px-5">{t('Joined', 'शामिल हुए')}</th>
                  <th className="py-3 px-5">{t('Actions', 'कार्रवाई')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-700 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getRoleColor(user.role)} text-white flex items-center justify-center font-bold text-xs`}>
                          {(user.name || '?').split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} text-white`}>
                          <RoleIcon className="h-3 w-3" />
                          {user.role}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        <div>{user.phone}</div>
                        <div className="text-xs text-slate-400">{user.specialization}</div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {formatDateTime(user.createdAt, false, lang)}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-[#062E6F] hover:text-[#042050] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={t('View user', 'उपयोगकर्ता देखें')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {user.email !== 'admin@gmail.com' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={actionLoading[user._id]}
                              className="text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title={t('Delete user', 'उपयोगकर्ता हटाएं')}
                            >
                              {actionLoading[user._id] === 'deleting' ? (
                                <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-4 p-4">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                
                return (
                  <div key={user._id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm overflow-hidden">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full ${getRoleColor(user.role)} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                          {(user.name || '?').split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <h4 className="font-semibold text-slate-800 text-sm truncate">{user.name}</h4>
                          <span className="text-xs text-slate-500 block truncate">{user.email}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap shrink-0 ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center border-t border-slate-100 pt-2 text-xs">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getRoleColor(user.role)} text-white`}>
                        <RoleIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{user.role}</span>
                      </div>
                      <span className="text-slate-400 text-[10px] whitespace-nowrap">
                        {t('Joined:', 'शामिल:')} {formatDateShort(user.createdAt, lang)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg space-y-1 overflow-hidden">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-slate-400 font-medium whitespace-nowrap shrink-0">{t('Phone:', 'फोन:')}</span>
                        <span className="font-mono break-all flex-1">{user.phone}</span>
                      </div>
                      {user.specialization && (
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="text-slate-400 font-medium whitespace-nowrap shrink-0">{t('Spec:', 'विशेषज्ञता:')}</span>
                          <span className="break-words flex-1">{user.specialization}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 border-t border-slate-100 pt-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-bold text-xs min-h-[44px]"
                      >
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        <span className="whitespace-nowrap">{t('View Detail', 'विवरण देखें')}</span>
                      </button>
                      {user.email !== 'admin@gmail.com' && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={actionLoading[user._id]}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-xs min-h-[44px]"
                        >
                          {actionLoading[user._id] === 'deleting' ? (
                            <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span className="whitespace-nowrap">{t('Delete', 'हटाएं')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && userToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                {t('Reject Registration', 'पंजीकरण अस्वीकार करें')}
              </h3>
            </div>
            
            <p className="text-slate-600 mb-4">
              {t('Are you sure you want to reject', 'क्या आप वाकई अस्वीकार करना चाहते हैं')} <strong>{userToReject.name}</strong>{t('\'s registration?', ' का पंजीकरण?')}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('Reason for rejection (optional)', 'अस्वीकार करने का कारण (वैकल्पिक)')}
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('Provide a reason for rejection...', 'अस्वीकार करने का कारण दें...')}
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#062E6F]/30"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setUserToReject(null);
                }}
                className="flex-1 border border-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {t('Cancel', 'रद्द करें')}
              </button>
              <button
                onClick={handleRejectUser}
                disabled={actionLoading[userToReject._id]}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading[userToReject._id] && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {t('Reject', 'अस्वीकार')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white md:rounded-xl p-6 w-full md:max-w-md h-full md:h-auto overflow-y-auto flex flex-col justify-between md:justify-start">
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {t('User Profile', 'उपयोगकर्ता प्रोफ़ाइल')}
                </h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center text-center gap-2 mb-6">
                <div className={`w-16 h-16 rounded-full ${getRoleColor(selectedUser.role)} text-white flex items-center justify-center font-bold text-xl`}>
                  {(selectedUser.name || '?').split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{selectedUser.name}</h4>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleColor(selectedUser.role)} text-white`}>
                    {selectedUser.role}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                  <span className="text-slate-400 font-medium">{t('Phone Number', 'फ़ोन नंबर')}</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedUser.phone}</span>
                </div>
                {selectedUser.specialization && (
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-400 font-medium">{t('Specialization', 'विशेषज्ञता')}</span>
                    <span className="text-slate-800 font-semibold">{selectedUser.specialization}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pb-1">
                  <span className="text-slate-400 font-medium">{t('Date Joined', 'शामिल होने की तिथि')}</span>
                  <span className="text-slate-800 font-semibold">
                    {formatDateTime(selectedUser.createdAt, false, lang)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="w-full md:w-auto bg-[#062E6F] hover:bg-[#042050] text-white font-bold py-2.5 px-6 rounded-lg transition-colors min-h-[44px] flex items-center justify-center"
              >
                {t('Close', 'बंद करें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}