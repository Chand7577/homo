// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  Send,
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Stethoscope,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  X,
  ChevronRight,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  MoreVertical,
  Trash2,
  Archive,
  Star,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

const PatientInbox = () => {
  // State
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageThread, setMessageThread] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch inbox messages
  const fetchInbox = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`${API_BASE}/patient/inbox/?${params}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to view your inbox");
        }
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
        setUnreadCount(data.unread_count || 0);
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (err) {
      setError(err.message || "Failed to load inbox");
      console.error("Error fetching inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch message thread
  const fetchMessageThread = async (messageId) => {
    setThreadLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/messages/${messageId}/thread/`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to fetch thread");

      const data = await response.json();

      if (data.success) {
        setMessageThread(data.thread || []);
      }
    } catch (err) {
      console.error("Error fetching thread:", err);
    } finally {
      setThreadLoading(false);
    }
  };

  // Select message and load thread
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setShowAppointmentDetails(false);
    fetchMessageThread(message.id);
    setShowMobileThread(true); // Show modal on mobile

    // Mark as read
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  // Close mobile thread
  const handleCloseMobileThread = () => {
    setShowMobileThread(false);
    setTimeout(() => {
      setSelectedMessage(null);
    }, 300);
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      await fetch(`${API_BASE}/messages/${messageId}/mark-read/`, {
        method: "POST",
        credentials: "include",
      });

      // Update local state
      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: true } : msg,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchInbox();
  }, [statusFilter]);

  // Filter messages by search
  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      msg.doctor?.name?.toLowerCase().includes(query) ||
      msg.message?.toLowerCase().includes(query) ||
      msg.subject?.toLowerCase().includes(query) ||
      msg.specialty?.toLowerCase().includes(query)
    );
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      pending: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        icon: <Clock className="w-3 h-3" />,
      },
      read: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: <Mail className="w-3 h-3" />,
      },
      replied: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: <CheckCircle2 className="w-3 h-3" />,
      },
      cancelled: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: <X className="w-3 h-3" />,
      },
    };

    return styles[status] || styles.pending;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-in forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        /* Mobile modal overlay */
        .mobile-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 50;
          animation: fadeIn 0.2s ease-out;
        }

        .mobile-modal-content {
          position: fixed;
          inset: 0;
          background: white;
          z-index: 51;
          animation: slideUp 0.3s ease-out;
        }

        .mobile-modal-content.closing {
          animation: slideDown 0.3s ease-in forwards;
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#3F856C] via-[#35735E] to-[#2d6350] text-white sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 md:py-6">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => window.history.back()}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
                  <Inbox className="w-6 h-6 md:w-8 md:h-8" />
                  My Inbox
                </h1>
                <p className="text-white/80 text-xs md:text-sm mt-1">
                  {unreadCount > 0
                    ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                    : "All caught up!"}
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchInbox(currentPage)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
              {/* Search & Filters */}
              <div className="p-4 border-b border-gray-100 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {[
                    {
                      value: "all",
                      label: "All",
                      icon: <Inbox className="w-4 h-4" />,
                    },
                    {
                      value: "pending",
                      label: "Pending",
                      icon: <Clock className="w-4 h-4" />,
                    },
                    {
                      value: "replied",
                      label: "Replied",
                      icon: <CheckCircle2 className="w-4 h-4" />,
                    },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                        statusFilter === filter.value
                          ? "bg-[#3F856C] text-white shadow-md"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {filter.icon}
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages List */}
              <div className="overflow-y-auto max-h-[calc(100vh-360px)] md:max-h-[calc(100vh-320px)] custom-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[#3F856C] animate-spin" />
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={() => fetchInbox()}
                      className="px-4 py-2 bg-[#3F856C] text-white rounded-lg hover:bg-[#35735E] transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-8 text-center">
                    <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      No Messages
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {searchQuery
                        ? "No messages match your search"
                        : "Your inbox is empty"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMessages.map((message) => {
                      const statusBadge = getStatusBadge(message.status);

                      return (
                        <button
                          key={message.id}
                          onClick={() => handleSelectMessage(message)}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-all relative ${
                            selectedMessage?.id === message.id
                              ? "bg-[#3F856C]/5 border-l-4 border-[#3F856C]"
                              : ""
                          } ${!message.is_read ? "bg-blue-50/30" : ""}`}
                        >
                          {/* Unread indicator */}
                          {!message.is_read && (
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#3F856C] rounded-full" />
                          )}

                          <div className="flex items-start gap-3 ml-2">
                            {/* Doctor Avatar */}
                            {message.doctor?.profile_image ? (
                              <img
                                src={message.doctor.profile_image}
                                alt={message.doctor.name}
                                className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3F856C] to-[#35735E] flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-white" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3
                                  className={`font-bold text-sm truncate ${!message.is_read ? "text-gray-900" : "text-gray-700"}`}
                                >
                                  Dr. {message.doctor?.name}
                                </h3>
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {formatDate(message.created_at)}
                                </span>
                              </div>

                              <p className="text-xs text-gray-600 mb-2 truncate">
                                {message.doctor?.specialization}
                              </p>

                              {message.sub_specialty && (
                                <div className="flex items-center gap-1 mb-2">
                                  <FileText className="w-3 h-3 text-[#3F856C]" />
                                  <span className="text-xs text-gray-700 font-medium truncate">
                                    {message.sub_specialty}
                                  </span>
                                </div>
                              )}

                              <p
                                className={`text-sm line-clamp-2 mb-2 ${!message.is_read ? "font-medium text-gray-900" : "text-gray-600"}`}
                              >
                                {message.message}
                              </p>

                              <div className="flex items-center gap-2">
                                <div
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${statusBadge.bg} ${statusBadge.border}`}
                                >
                                  {statusBadge.icon}
                                  <span
                                    className={`text-xs font-semibold ${statusBadge.text} capitalize`}
                                  >
                                    {message.status}
                                  </span>
                                </div>

                                {message.reply_count > 0 && (
                                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg border border-blue-200">
                                    <MessageCircle className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-700">
                                      {message.reply_count}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => fetchInbox(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchInbox(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-[#3F856C] text-white rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#35735E] transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Message Thread / Detail View */}
          <div className="hidden lg:block lg:col-span-7 xl:col-span-8">
            {selectedMessage ? (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
                {/* Thread Header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start gap-4">
                    {selectedMessage.doctor?.profile_image ? (
                      <img
                        src={selectedMessage.doctor.profile_image}
                        alt={selectedMessage.doctor.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-[#3F856C]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3F856C] to-[#35735E] flex items-center justify-center">
                        <Stethoscope className="w-7 h-7 text-white" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-gray-900 mb-1">
                        Dr. {selectedMessage.doctor?.name}
                      </h2>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedMessage.doctor?.specialization}
                      </p>

                      {/* Status Badge */}
                      {(() => {
                        const badge = getStatusBadge(selectedMessage.status);
                        return (
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${badge.bg} ${badge.border}`}
                          >
                            {badge.icon}
                            <span
                              className={`text-xs font-semibold ${badge.text} capitalize`}
                            >
                              {selectedMessage.status}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <button
                      onClick={() =>
                        setShowAppointmentDetails(!showAppointmentDetails)
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showAppointmentDetails ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Appointment Details - Collapsible */}
                  {showAppointmentDetails &&
                    selectedMessage.appointment_date && (
                      <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                            <Calendar className="w-4 h-4 text-[#3F856C]" />
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(
                                selectedMessage.appointment_date,
                              ).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {selectedMessage.appointment_time && (
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                              <Clock className="w-4 h-4 text-[#3F856C]" />
                              <span className="text-sm font-medium text-gray-900">
                                {selectedMessage.appointment_time}
                              </span>
                            </div>
                          )}

                          {selectedMessage.appointment_type && (
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                              {selectedMessage.appointment_type === "online" ? (
                                <MessageCircle className="w-4 h-4 text-[#3F856C]" />
                              ) : (
                                <Building className="w-4 h-4 text-[#3F856C]" />
                              )}
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {selectedMessage.appointment_type}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Thread Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                  {threadLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[#3F856C] animate-spin" />
                    </div>
                  ) : messageThread.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">
                        No messages in this thread
                      </p>
                    </div>
                  ) : (
                    messageThread.map((msg, index) => {
                      const isFromPatient = msg.sender.user_type === "patient";

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isFromPatient ? "justify-end" : "justify-start"} animate-fade-in`}
                        >
                          <div
                            className={`max-w-[75%] ${
                              isFromPatient
                                ? "bg-gradient-to-br from-[#3F856C] to-[#35735E] text-white"
                                : "bg-gray-50 text-gray-900 border-2 border-gray-200"
                            } rounded-2xl p-4 shadow-md`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <User
                                className={`w-4 h-4 ${isFromPatient ? "text-white/80" : "text-gray-500"}`}
                              />
                              <span
                                className={`text-xs font-semibold ${isFromPatient ? "text-white/90" : "text-gray-600"}`}
                              >
                                {msg.sender.name}
                              </span>
                              <span
                                className={`text-xs ${isFromPatient ? "text-white/70" : "text-gray-500"}`}
                              >
                                {formatDate(msg.created_at)}
                              </span>
                            </div>

                            <p
                              className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                isFromPatient ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {msg.message}
                            </p>

                            {msg.is_read && (
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/20">
                                <CheckCircle2
                                  className={`w-3 h-3 ${isFromPatient ? "text-white/70" : "text-green-600"}`}
                                />
                                <span
                                  className={`text-xs ${isFromPatient ? "text-white/70" : "text-gray-500"}`}
                                >
                                  Read{" "}
                                  {msg.read_at ? formatDate(msg.read_at) : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Input - Disabled */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                    <div className="flex items-center gap-3 text-gray-500">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm">
                        The doctor will reply to your message via email or call
                        you directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Select a Message
                  </h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Choose a conversation from the list to view the full message
                    thread and details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Full-Screen Modal for Message Thread */}
      {showMobileThread && selectedMessage && (
        <>
          <div
            className="mobile-modal-overlay lg:hidden"
            onClick={handleCloseMobileThread}
          />
          <div className="mobile-modal-content lg:hidden flex flex-col">
            {/* Mobile Header */}
            <div className="bg-gradient-to-r from-[#3F856C] via-[#35735E] to-[#2d6350] text-white p-4 shadow-lg flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseMobileThread}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {selectedMessage.doctor?.profile_image ? (
                  <img
                    src={selectedMessage.doctor.profile_image}
                    alt={selectedMessage.doctor.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold truncate">
                    Dr. {selectedMessage.doctor?.name}
                  </h2>
                  <p className="text-xs text-white/80 truncate">
                    {selectedMessage.doctor?.specialization}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowAppointmentDetails(!showAppointmentDetails)
                  }
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                >
                  {showAppointmentDetails ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-3">
                {(() => {
                  const badge = getStatusBadge(selectedMessage.status);
                  return (
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${badge.bg} ${badge.border}`}
                    >
                      {badge.icon}
                      <span
                        className={`text-xs font-semibold ${badge.text} capitalize`}
                      >
                        {selectedMessage.status}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Mobile Appointment Details - Collapsible */}
              {showAppointmentDetails && selectedMessage.appointment_date && (
                <div className="mt-3 pt-3 border-t border-white/20 animate-fade-in">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-white" />
                      <span className="text-sm font-medium text-white">
                        {new Date(
                          selectedMessage.appointment_date,
                        ).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {selectedMessage.appointment_time && (
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4 text-white" />
                        <span className="text-sm font-medium text-white">
                          {selectedMessage.appointment_time}
                        </span>
                      </div>
                    )}

                    {selectedMessage.appointment_type && (
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                        {selectedMessage.appointment_type === "online" ? (
                          <MessageCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Building className="w-4 h-4 text-white" />
                        )}
                        <span className="text-sm font-medium text-white capitalize">
                          {selectedMessage.appointment_type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Thread Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
              {threadLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#3F856C] animate-spin" />
                </div>
              ) : messageThread.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No messages in this thread</p>
                </div>
              ) : (
                messageThread.map((msg) => {
                  const isFromPatient = msg.sender.user_type === "patient";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isFromPatient ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          isFromPatient
                            ? "bg-gradient-to-br from-[#3F856C] to-[#35735E] text-white"
                            : "bg-white text-gray-900 border-2 border-gray-200"
                        } rounded-2xl p-3.5 shadow-md`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User
                            className={`w-3.5 h-3.5 ${isFromPatient ? "text-white/80" : "text-gray-500"}`}
                          />
                          <span
                            className={`text-xs font-semibold ${isFromPatient ? "text-white/90" : "text-gray-600"}`}
                          >
                            {msg.sender.name}
                          </span>
                          <span
                            className={`text-xs ${isFromPatient ? "text-white/70" : "text-gray-500"}`}
                          >
                            {formatDate(msg.created_at)}
                          </span>
                        </div>

                        <p
                          className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            isFromPatient ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {msg.message}
                        </p>

                        {msg.is_read && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/20">
                            <CheckCircle2
                              className={`w-3 h-3 ${isFromPatient ? "text-white/70" : "text-green-600"}`}
                            />
                            <span
                              className={`text-xs ${isFromPatient ? "text-white/70" : "text-gray-500"}`}
                            >
                              Read {msg.read_at ? formatDate(msg.read_at) : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mobile Reply Info */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-3">
                <div className="flex items-start gap-3 text-gray-600">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">
                    The doctor will reply to your message via email or call you
                    directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientInbox;
