// @ts-nocheck

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FaComments, FaPlay } from "react-icons/fa";
import { usePathname } from "next/navigation";

type Message = {
  from: "bot" | "user";
  text: string;
  metadata?: {
    model_used?: string;
    tokens_used?: number;
    source?: string;
  };
};

const HomeopathyChat: React.FC = () => {
  const pathname = usePathname();
  const isInboxPage = pathname === "/doctorinbox";
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "👋 Hello Doctor! I'm your HomeoCase Assistant. How can I help you navigate the system today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsChatOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isChatOpen ? "hidden" : "auto";
  }, [isChatOpen]);

  // Function to format text with **bold** and bullet points
  const formatMessage = (text: string) => {
    // Split by lines to handle each line separately
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Check if line starts with bullet point
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('✓') || line.trim().startsWith('✅');
      
      // Process bold text **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      
      const formattedLine = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Remove the ** and make it bold
          const boldText = part.slice(2, -2);
          return <strong key={partIndex} className="font-bold">{boldText}</strong>;
        }
        return part;
      });

      return (
        <div key={lineIndex} className={isBullet ? "ml-2" : ""}>
          {formattedLine}
        </div>
      );
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("https://gessdemnbackend.onrender.com/gessdemn/homeopathy/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, session_id: sessionId }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      let aiReply: string;
      let metadata: Message["metadata"] | undefined;

      if (data.status === "success") {
        if (typeof data.reply === "string") aiReply = data.reply;
        else if (data.reply?.response) {
          aiReply = data.reply.response;
          metadata = data.reply.metadata;
        } else if (data.response) {
          aiReply = data.response;
          metadata = data.metadata;
        } else {
          aiReply = "⚠️ Unexpected response format. Please try again.";
        }
      } else {
        aiReply = data.message || "⚠️ Unable to get a response. Please try again.";
      }

      setMessages((prev) => [...prev, { from: "bot", text: aiReply, metadata }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { from: "bot", text: "⚠️ I'm experiencing connectivity issues. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button — hidden on doctor inbox to avoid overlapping reply button */}
      {!isInboxPage && (
      <motion.button
        drag
        dragMomentum={false}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 text-white p-4 rounded-full shadow-xl hover:scale-110 transition"
        style={{ backgroundColor: '#3F856C' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d6150'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3F856C'}
      >
        <FaComments size={22} />
      </motion.button>
      )}

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/10 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsChatOpen(false)}
          >
            <motion.div
              drag
              dragMomentum={false}
              className="relative flex flex-col bg-white/95 shadow-xl w-[95%] max-w-4xl h-[90vh] rounded-3xl overflow-hidden border border-gray-300"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div 
                className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 text-white rounded-t-3xl shadow-md cursor-grab"
                style={{ backgroundColor: '#3F856C' }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://res.cloudinary.com/dvt1wv1dy/image/upload/v1768980964/id_rglqbg.png"
                    alt="HomeoCase Logo"
                    className="w-9 h-9 bg-white rounded-full border-2 border-green-200 object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-base">HomeoCase Assistant</h3>
                    <p className="text-xs" style={{ color: '#d0e8df' }}>System Navigation & Support</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)} 
                  className="hover:text-white transition"
                  style={{ color: '#d0e8df' }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Chat Body */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl px-4 py-3 text-sm shadow max-w-[80%] break-words ${
                        msg.from === "user"
                          ? "text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                      style={msg.from === "user" ? { backgroundColor: '#3F856C' } : {}}
                    >
                      {msg.from === "bot" ? formatMessage(msg.text) : msg.text}
                    </motion.div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-3 text-sm italic animate-pulse bg-white text-gray-500 border border-gray-200">
                      Assistant is typing...
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="sticky bottom-0 flex items-center gap-2 border-t border-gray-200 px-3 py-3 bg-white">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about rubrics, remedies, or system features..."
                  className="flex-1 px-4 py-2 text-sm rounded-full border border-gray-300 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#3F856C' }}
                  onFocus={(e) => e.target.style.borderColor = '#3F856C'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  className="text-white p-3 rounded-full hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3F856C' }}
                  onMouseEnter={(e) => !isTyping && input.trim() && (e.currentTarget.style.backgroundColor = '#2d6150')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3F856C'}
                >
                  <FaPlay size={14} />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex gap-2 flex-wrap">
                <button
                  onClick={() => setInput("How do I start a new case?")}
                  className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full transition text-gray-700"
                  style={{ hover: { backgroundColor: '#e8f4f0', borderColor: '#3F856C' } }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e8f4f0';
                    e.currentTarget.style.borderColor = '#3F856C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  Start New Case
                </button>
                <button
                  onClick={() => setInput("How do I select rubrics?")}
                  className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full transition text-gray-700"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e8f4f0';
                    e.currentTarget.style.borderColor = '#3F856C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  Select Rubrics
                </button>
                <button
                  onClick={() => setInput("What remedies are available?")}
                  className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full transition text-gray-700"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e8f4f0';
                    e.currentTarget.style.borderColor = '#3F856C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  View Remedies
                </button>
                <button
                  onClick={() => setInput("How do I save a case?")}
                  className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full transition text-gray-700"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e8f4f0';
                    e.currentTarget.style.borderColor = '#3F856C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  Save Case
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomeopathyChat;
