// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Inbox,
  Send,
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  X,
  ChevronRight,
  ChevronDown,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  MoreVertical,
  RefreshCw,
  XCircle,
  Video,
  Info,
  Circle,
  Check,
  ChevronUp,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

const GRADE_COLORS = [
  "", 
  "bg-slate-100 text-slate-600", 
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700", 
  "bg-violet-100 text-violet-800", 
  "bg-amber-100 text-amber-700"
];

const DoctorInbox = () => {
  // State
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageThread, setMessageThread] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [repertoryResult, setRepertoryResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = "auto") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom only on initial load or thread change
  useEffect(() => {
    if (messageThread.length > 0 && !threadLoading) {
      scrollToBottom();
    }
  }, [selectedMessage?.id, threadLoading]);

  // UI State
  const [showSearch, setShowSearch] = useState(false);
  const [showPatientInfo, setShowPatientInfo] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Fetch inbox messages
  const fetchInbox = async (page = 1, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`${API_BASE}/doctor/inbox/?${params}`, {
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
        setUnreadCount(data.counts?.unread || 0);
        setPendingCount(data.counts?.pending || 0);
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (err) {
      if (showSpinner) setError(err.message || "Failed to load inbox");
      console.error("Error fetching inbox:", err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Fetch message thread
  const fetchMessageThread = async (messageId, showSpinner = true) => {
    if (showSpinner) setThreadLoading(true);

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
      if (showSpinner) setThreadLoading(false);
    }
  };

  // Select message and load thread
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setReplyText("");
    setShowPatientInfo(false);
    setMobileShowThread(true);
    fetchMessageThread(message.id);

    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      await fetch(`${API_BASE}/messages/${messageId}/mark-read/`, {
        method: "POST",
        credentials: "include",
      });

      setMessages(
        messages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                is_read: true,
                status: msg.status === "pending" ? "read" : msg.status,
              }
            : msg,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage((prev) => ({
          ...prev,
          is_read: true,
          status: prev.status === "pending" ? "read" : prev.status,
        }));
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Send reply to patient
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert("Please enter a message");
      return;
    }

    setSendingReply(true);

    try {
      const response = await fetch(
        `${API_BASE}/doctor/messages/${selectedMessage.id}/reply/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: replyText,
            status: "replied",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      const data = await response.json();

      if (data.success) {
        setReplyText("");
        await fetchMessageThread(selectedMessage.id);

        setMessages(
          messages.map((msg) =>
            msg.id === selectedMessage.id
              ? {
                  ...msg,
                  status: "replied",
                  reply_count: (msg.reply_count || 0) + 1,
                }
              : msg,
          ),
        );

        setSelectedMessage((prev) => ({
          ...prev,
          status: "replied",
          reply_count: (prev.reply_count || 0) + 1,
        }));
        
        // Use timeout to ensure DOM has updated
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    } catch (err) {
      alert("Failed to send reply. Please try again.");
      console.error("Error sending reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  // Update message status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedMessage) return;

    setUpdatingStatus(true);

    try {
      const response = await fetch(
        `${API_BASE}/doctor/messages/${selectedMessage.id}/reply/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Status updated to ${newStatus}`,
            status: newStatus,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setMessages(
        messages.map((msg) =>
          msg.id === selectedMessage.id ? { ...msg, status: newStatus } : msg,
        ),
      );

      setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      setShowStatusMenu(false);

      await fetchMessageThread(selectedMessage.id);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAnalyzeSymptoms = async (chapterId = null) => {
    if (!selectedMessage) return;
    const text = selectedMessage.problem_description || selectedMessage.message;
    if (!text) return;

    setAnalyzing(true);
    setRepertoryResult(null);
    try {
      // Use the advanced repertorize endpoint to get the full table data
      const response = await fetch(
        `${API_BASE}/doctor/rubrics/repertorize/`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            chapter_id: chapterId, 
            symptoms: [text], // Pass the whole text as one symptom for context
            top_n: 3 
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRepertoryResult(data);
          
          // Also update the message's matched rubrics for persistence if needed
          const topRubrics = data.top_rubrics.map(r => ({
            id: r.id,
            name: r.name,
            full_path: r.full_path,
            medicines: r.medicines
          }));

          setSelectedMessage((prev) => ({
            ...prev,
            matched_rubrics: topRubrics,
          }));

          setMessages((prev) =>
            prev.map((m) =>
              m.id === selectedMessage.id
                ? { ...m, matched_rubrics: topRubrics }
                : m,
            ),
          );
        }
      }
    } catch (e) {
      console.error("Analysis failed:", e);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    // Fetch chapters for analysis
    fetch(`${API_BASE}/doctor/rubrics/chapters/`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setChapters(d.chapters || []); })
      .catch(err => console.error("Failed to load chapters", err));
  }, [statusFilter]);

  // Polling for live updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Refresh inbox list
      fetchInbox(currentPage, false); // Add 'silent' parameter to avoid loading spinners

      // Refresh active thread if one is selected
      if (selectedMessage) {
        fetchMessageThread(selectedMessage.id, false);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, [selectedMessage, currentPage, statusFilter]);

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      msg.patient_name?.toLowerCase().includes(query) ||
      msg.message?.toLowerCase().includes(query) ||
      msg.sender?.email?.toLowerCase().includes(query) ||
      msg.specialty?.toLowerCase().includes(query) ||
      msg.patient_phone?.toLowerCase().includes(query)
    );
  });

  // Status badge configuration
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-500",
        icon: Clock,
      },
      read: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-500",
        icon: Mail,
      },
      replied: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
      },
      cancelled: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        dot: "bg-rose-500",
        icon: XCircle,
      },
    };

    return configs[status] || configs.pending;
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

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
          border: 2px solid #e2e8f0;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1e293b;
        }

        .custom-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: #475569 #e2e8f0;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.15s ease-out;
        }

        .message-bubble {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="w-10 h-10 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Inbox</h1>
                <p className="text-sm text-slate-500">
                  {unreadCount > 0 && `${unreadCount} unread • `}
                  {messages.length} total messages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  showSearch
                    ? "bg-teal-50 text-teal-600"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => fetchInbox(currentPage)}
                className="w-10 h-10 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all duration-200 text-slate-600"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full">
            {/* Messages List */}
            <div className={`lg:col-span-5 xl:col-span-4 bg-white border-r border-slate-200 flex flex-col ${mobileShowThread ? 'hidden lg:flex' : 'flex'}`}>
              {/* Search */}
              {showSearch && (
                <div className="p-4 border-b border-slate-200 animate-slide-in">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-slate-200 rounded-lg p-1 transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar">
                  {[
                    { value: "all", label: "All", count: messages.length },
                    { value: "pending", label: "Pending", count: pendingCount },
                    { value: "replied", label: "Replied" },
                    { value: "cancelled", label: "Cancelled" },
                  ].map((filter) => {
                    const isActive = statusFilter === filter.value;
                    return (
                      <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                          isActive
                            ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {filter.label}
                        {filter.count !== undefined && (
                          <span
                            className={`ml-2 ${isActive ? "text-white/80" : "text-slate-500"}`}
                          >
                            {filter.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Messages List Area */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2">
                      {error}
                    </h3>
                    <button
                      onClick={() => fetchInbox()}
                      className="mt-4 px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Inbox className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2">
                      No Messages
                    </h3>
                    <p className="text-sm text-slate-500">
                      {searchQuery
                        ? "No messages match your search"
                        : "Your inbox is empty"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredMessages.map((message) => {
                      const statusConfig = getStatusConfig(message.status);
                      const isSelected = selectedMessage?.id === message.id;
                      const StatusIcon = statusConfig.icon;

                      return (
                        <button
                          key={message.id}
                          onClick={() => handleSelectMessage(message)}
                          className={`w-full px-5 py-4 text-left transition-all duration-200 ${
                            isSelected
                              ? "bg-teal-50 border-l-4 border-l-teal-600"
                              : "hover:bg-slate-50 border-l-4 border-l-transparent"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? "bg-teal-600"
                                  : "bg-gradient-to-br from-blue-500 to-teal-500"
                              } shadow-lg`}
                            >
                              <span className="text-white text-sm font-bold">
                                {message.patient_name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "P"}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Header */}
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-slate-900 truncate">
                                  {message.patient_name}
                                </h3>
                                <span className="text-xs text-slate-500 flex-shrink-0">
                                  {formatDate(message.created_at)}
                                </span>
                              </div>

                              {/* Message Preview */}
                              <p className="text-sm text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                                {message.message}
                              </p>

                              {/* Meta */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <div
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusConfig.bg}`}
                                >
                                  <StatusIcon
                                    className={`w-3.5 h-3.5 ${statusConfig.text}`}
                                  />
                                  <span
                                    className={`text-xs font-medium ${statusConfig.text} capitalize`}
                                  >
                                    {message.status}
                                  </span>
                                </div>

                                {message.matched_rubrics?.length > 0 && (
                                  <div 
                                    className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md"
                                    title="Automatic clinical rubrics available"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold">SYMPTOMS</span>
                                  </div>
                                )}

                                {message.reply_count > 0 && (
                                  <div className="inline-flex items-center gap-1 text-slate-500">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">
                                      {message.reply_count}
                                    </span>
                                  </div>
                                )}

                                {!message.is_read && (
                                  <div className="w-2 h-2 bg-teal-600 rounded-full" />
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
                <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
                  <button
                    onClick={() => fetchInbox(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => fetchInbox(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Message Detail / Thread */}
            <div className={`lg:col-span-7 xl:col-span-8 bg-slate-50 flex flex-col ${!mobileShowThread ? 'hidden lg:flex' : 'flex'}`}>
              {selectedMessage ? (
                <>
                  {/* Compact Thread Header */}
                  <div className="bg-white border-b border-slate-200 shadow-sm">
                    <div className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setMobileShowThread(false)}
                            className="lg:hidden w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600 mr-1"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">
                              {selectedMessage.patient_name
                                ?.charAt(0)
                                ?.toUpperCase() || "P"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-slate-900 truncate">
                              {selectedMessage.patient_name}
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="truncate">
                                {selectedMessage.sender?.email}
                              </span>
                              {selectedMessage.patient_phone && (
                                <>
                                  <span>•</span>
                                  <span>{selectedMessage.patient_phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {(() => {
                            const config = getStatusConfig(
                              selectedMessage.status,
                            );
                            const StatusIcon = config.icon;
                            return (
                              <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${config.bg}`}
                              >
                                <StatusIcon
                                  className={`w-3.5 h-3.5 ${config.text}`}
                                />
                                <span
                                  className={`text-xs font-semibold ${config.text} capitalize`}
                                >
                                  {selectedMessage.status}
                                </span>
                              </div>
                            );
                          })()}

                          <button
                            onClick={() => setShowPatientInfo(!showPatientInfo)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              showPatientInfo
                                ? "bg-teal-50 text-teal-600"
                                : "hover:bg-slate-100 text-slate-600"
                            }`}
                          >
                            {showPatientInfo ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => setShowStatusMenu(!showStatusMenu)}
                              className="w-9 h-9 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-all text-slate-600"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {showStatusMenu && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setShowStatusMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-20 animate-slide-in">
                                  <div className="px-3 py-2 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                      Update Status
                                    </p>
                                  </div>
                                  {[
                                    {
                                      status: "replied",
                                      label: "Mark as Replied",
                                      icon: CheckCircle2,
                                      color: "text-emerald-600",
                                    },
                                    {
                                      status: "cancelled",
                                      label: "Cancel",
                                      icon: XCircle,
                                      color: "text-rose-600",
                                    },
                                  ].map((item) => {
                                    const ItemIcon = item.icon;
                                    return (
                                      <button
                                        key={item.status}
                                        onClick={() =>
                                          handleUpdateStatus(item.status)
                                        }
                                        disabled={
                                          updatingStatus ||
                                          selectedMessage.status === item.status
                                        }
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        <ItemIcon
                                          className={`w-5 h-5 ${item.color}`}
                                        />
                                        <span className="text-sm font-medium text-slate-700">
                                          {item.label}
                                        </span>
                                        {selectedMessage.status ===
                                          item.status && (
                                          <Check className="w-4 h-4 text-teal-600 ml-auto" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>


                    {showPatientInfo && (
                      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-teal-50 border-t border-slate-200 animate-slide-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          {/* Key info in compact cards */}
                          {selectedMessage.sub_specialty && (
                            <div className="p-3 bg-white rounded-lg flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 font-medium">
                                  Consultation
                                </p>
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {selectedMessage.sub_specialty}
                                </p>
                              </div>
                            </div>
                          )}

                          {selectedMessage.appointment_date && (
                            <div className="p-3 bg-white rounded-lg flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 font-medium">
                                  Date & Time
                                </p>
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {new Date(
                                    selectedMessage.appointment_date,
                                  ).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                  {selectedMessage.appointment_time &&
                                    ` • ${selectedMessage.appointment_time}`}
                                </p>
                              </div>
                            </div>
                          )}

                          {selectedMessage.appointment_type && (
                            <div className="p-3 bg-white rounded-lg flex items-center gap-2">
                              {selectedMessage.appointment_type === "online" ? (
                                <Video className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <Building className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 font-medium">
                                  Type
                                </p>
                                <p className="text-sm font-semibold text-slate-900 capitalize truncate">
                                  {selectedMessage.appointment_type}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Matched Rubrics Section */}
                        {selectedMessage.matched_rubrics?.length > 0 && (
                          <div className="bg-white/60 p-4 rounded-xl border border-teal-100">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Patient-Submitted Rubrics (Extracted)
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedMessage.matched_rubrics.map((rubric) => (
                                <div
                                  key={rubric.id}
                                  className="group relative px-3 py-1.5 bg-white border border-teal-100 rounded-lg shadow-sm hover:border-teal-300 transition-all cursor-default"
                                >
                                  <span className="text-xs font-medium text-slate-700">
                                    {rubric.name}
                                  </span>
                                  {/* Tooltip for full path */}
                                  <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-30">
                                    <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-xl">
                                      {rubric.full_path}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="mt-4 text-[10px] text-slate-500 italic">
                                * These rubrics were automatically suggested based on the patient's description.
                              </p>
                          </div>
                        )}
                        
                        {/* Problem Description if not visible elsewhere */}
                        {selectedMessage.problem_description && (
                          <div className="mt-4 p-4 bg-white/40 rounded-xl border border-slate-100">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                              Detailed Symptom Description
                            </h3>
                            <p className="text-sm text-slate-700 leading-relaxed italic">
                              "{selectedMessage.problem_description}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CLINICAL ANALYSIS AREA */}
                  {selectedMessage && (
                    <div className="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4 overflow-y-auto max-h-[500px]">
                      {repertoryResult ? (
                        <div className="space-y-6 fade-in">
                          {/* Analysis Header */}
                          <div className="flex items-center justify-between bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">Clinical Analysis Complete</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setRepertoryResult(null)}
                                className="text-[10px] font-bold text-emerald-700 hover:underline"
                              >
                                Re-analyze with different chapter
                              </button>
                              <Link
                                href={`/repertorize?rubrics=${repertoryResult.top_rubrics.map(r => r.id).join(",")}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-[10px] font-black hover:bg-emerald-700 transition-all"
                              >
                                <TrendingUp className="w-3 h-3" />
                                FULL CHART
                              </Link>
                            </div>
                          </div>

                          {/* ─── REPERTORIZATION TABLE ─── */}
                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                              <Table2 className="w-3.5 h-3.5 text-slate-500" />
                              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Symptom Mapping Table</h3>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50/50">
                                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Symptom</th>
                                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Clinical Rubrics</th>
                                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">Top Remedies</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {repertoryResult.symptoms_breakdown.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                      <td className="px-4 py-3 align-top">
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-bold rounded-md">
                                          <Tag className="w-3 h-3" />
                                          {row.symptom}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 align-top">
                                        <div className="flex flex-col gap-1.5">
                                          {row.rubrics.map(rb => (
                                            <div key={rb.id} className="group relative">
                                              <div className="flex items-start gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-md">
                                                <FlaskConical className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                  <p className="text-[10px] font-bold text-slate-700 leading-tight">{rb.name}</p>
                                                  <p className="text-[8px] text-slate-400 mt-0.5 truncate max-w-[150px]">{rb.full_path}</p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 align-top">
                                        <div className="flex flex-wrap gap-1">
                                          {/* Flatten and deduplicate medicines for this symptom */}
                                          {Array.from(new Set(row.rubrics.flatMap(r => r.medicines.map(m => JSON.stringify(m)))))
                                            .map(mStr => JSON.parse(mStr))
                                            .sort((a,b) => b.grade - a.grade)
                                            .slice(0, 6)
                                            .map((med, mi) => (
                                              <span key={mi} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${GRADE_COLORS[med.grade] || "bg-slate-100"}`}>
                                                {med.name}
                                                <span className="opacity-60">G{med.grade}</span>
                                              </span>
                                            ))}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* ─── BOTTOM GRIDS: Top Rubrics & Medicine Chart ─── */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Top 3 Rubrics Summary */}
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Top Matched Rubrics</h3>
                              </div>
                              <div className="p-3 space-y-3">
                                {repertoryResult.top_rubrics.map((rb, i) => (
                                  <div key={rb.id} className="flex items-start gap-3 p-2 bg-slate-50/50 rounded-lg">
                                    <span className="text-xs font-black text-slate-300">#{i+1}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-bold text-slate-800 leading-tight">{rb.name}</p>
                                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">{rb.full_path}</p>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {rb.medicines.slice(0, 4).map((med, mi) => (
                                          <span key={mi} className={`px-1 py-0.5 rounded text-[8px] font-bold ${GRADE_COLORS[med.grade]}`}>
                                            {med.name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Medicine Chart */}
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5 text-violet-500" />
                                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Remedy Indicator Chart</h3>
                              </div>
                              <div className="p-3 space-y-2">
                                {repertoryResult.medicine_chart.slice(0, 5).map((med, i) => {
                                  const maxScore = repertoryResult.medicine_chart[0].score;
                                  const pct = (med.score / maxScore) * 100;
                                  return (
                                    <div key={i} className="space-y-1">
                                      <div className="flex justify-between text-[9px] font-bold">
                                        <span className="text-slate-700">{med.name}</span>
                                        <span className="text-slate-400">{med.occurrences} matches</span>
                                      </div>
                                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-1000"
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {/* Analysis Initial State / Chapter Selection */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-teal-600" />
                              <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Intelligent Clinical Analysis</h3>
                            </div>
                            <div className="text-[10px] text-slate-400 italic">Extract clinical rubrics from patient symptoms</div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-end gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex-1 w-full space-y-2">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Optional: Select Body Chapter</label>
                              <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <select 
                                  value={selectedChapterId || ""} 
                                  onChange={(e) => setSelectedChapterId(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none"
                                >
                                  <option value="">All Chapters (Full Repertory Search)</option>
                                  {chapters.map(ch => (
                                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleAnalyzeSymptoms(selectedChapterId)}
                              disabled={analyzing}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3F856C] text-white rounded-lg text-[11px] font-black hover:bg-[#35735E] shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                              {analyzing ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                              ) : (
                                <><Sparkles className="w-3.5 h-3.5" /> Start Analysis</>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Thread Area */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 min-h-0 overflow-y-scroll custom-scrollbar px-6 py-6 overscroll-contain"
                  >
                    {threadLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                      </div>
                    ) : messageThread.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">
                          No messages in this thread
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-4xl mx-auto">
                        {messageThread.map((msg) => {
                          const isFromDoctor =
                            msg.sender.user_type === "doctor";

                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isFromDoctor ? "justify-end" : "justify-start"} message-bubble`}
                            >
                              <div
                                className={`max-w-[75%] ${
                                  isFromDoctor
                                    ? "bg-teal-600 text-white"
                                    : "bg-white text-slate-900 shadow-md"
                                } rounded-2xl px-4 py-3`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`text-xs font-bold ${
                                      isFromDoctor
                                        ? "text-white/90"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {msg.sender.name}
                                  </span>
                                </div>

                                <p
                                  className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                    isFromDoctor
                                      ? "text-white"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {msg.message}
                                </p>

                                <div className="flex items-center justify-end gap-1.5 mt-2">
                                  <span
                                    className={`text-xs ${
                                      isFromDoctor
                                        ? "text-white/70"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {formatDate(msg.created_at)}
                                  </span>
                                  {msg.is_read && isFromDoctor && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Reply Input */}
                  <div className="bg-white border-t border-slate-200 px-6 py-4">
                    <div className="flex items-end gap-3 max-w-4xl mx-auto">
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => {
                            setReplyText(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                          }}
                          placeholder="Type your message..."
                          rows={1}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none text-sm transition-all custom-scrollbar"
                          style={{
                            maxHeight: "120px",
                            minHeight: "48px",
                          }}
                          disabled={sendingReply}
                        />
                      </div>

                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sendingReply}
                        className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center hover:bg-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-600/30"
                      >
                        {sendingReply ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Empty State
                <div className="flex items-center justify-center h-full">
                  <div className="text-center px-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <MessageCircle className="w-12 h-12 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Select a Conversation
                    </h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      Choose a message from the list to view the conversation
                      and respond to your patients
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorInbox;
