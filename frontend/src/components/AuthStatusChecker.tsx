"use client";

import { useState, useEffect } from "react";

import { API_BASE } from "@/config";

interface User {
  id: number;
  email: string;
  full_name?: string;
}

export default function AuthStatusChecker() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    
    try {
      // First check localStorage for user data
      const storedUser = localStorage.getItem('user');
      
      // Then verify with backend
      const res = await fetch(`${API_BASE}/check-auth/`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsLoggedIn(true);
          setUser(data.user);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        // If backend check fails, fallback to localStorage
        if (storedUser) {
          setIsLoggedIn(true);
          setUser(JSON.parse(storedUser));
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Fallback to localStorage on network error
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setIsLoggedIn(true);
        setUser(JSON.parse(storedUser));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear local state regardless of API response
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('user');
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-100 rounded-2xl shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-3 border-gray-300 border-t-black rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn && user) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-800">Logged In</h3>
              <p className="text-green-700 text-sm mt-1">
                {user.full_name || user.email}
              </p>
              <p className="text-green-600 text-xs mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition transform hover:scale-105 shadow-md"
          >
            Logout
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-600 font-medium">User ID</p>
              <p className="text-green-800 font-semibold">{user.id}</p>
            </div>
            <div>
              <p className="text-green-600 font-medium">Status</p>
              <p className="text-green-800 font-semibold">Active</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800">Not Logged In</h3>
            <p className="text-red-600 text-sm mt-1">
              Please login to access your account
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition transform hover:scale-105 shadow-md"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
