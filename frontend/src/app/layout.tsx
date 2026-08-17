// @ts-nocheck
"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import "./globals.css";

import Sidebar from "@/components/Sidebar";
import DoctorSidebar from "@/components/DoctorSidebar";
import PatientSidebar from "@/components/PatientSidebar";
import LoadingProvider from "@/components/LoadingProvider";
import RoleModal from "@/components/RoleModal";
import { useRouter, usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type UserRole = "admin" | "doctor" | "customer" | null;

import { API_BASE } from "@/config";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>(null);
  const [showModal, setShowModal] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isFullPage = pathname?.startsWith("/comparative") || pathname?.startsWith("/rubrics");

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check localStorage first
      const savedRole = localStorage.getItem("userRole") as UserRole;
      const savedUser = localStorage.getItem("user");
      
      if (!savedRole || !savedUser) {
        // No saved session, show modal
        setShowModal(true);
        setIsAuthenticated(false);
        return;
      }

      // Verify session with backend based on role
      let endpoint = "";
      if (savedRole === "admin") {
        endpoint = `${API_BASE}/admin/check-auth/`;
      } else if (savedRole === "doctor") {
        endpoint = `${API_BASE}/doctor/check-auth/`;
      } else if (savedRole === "customer") {
        endpoint = `${API_BASE}/patient/check-auth/`;
      }

      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.authenticated) {
        // Valid session
        setRole(savedRole);
        setIsAuthenticated(true);
        setShowModal(false);
      } else {
        // AUTHENTICATION BYPASSED: Allow access even if backend says unauthenticated
        setRole(savedRole);
        setIsAuthenticated(true);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // AUTHENTICATION BYPASSED: On error, if we have a saved role, use it
      const savedRole = localStorage.getItem("userRole") as UserRole;
      if (savedRole) {
        setRole(savedRole);
        setIsAuthenticated(true);
        setShowModal(false);
      } else {
        setShowModal(true);
        setIsAuthenticated(false);
      }
    }
  };

  const handleRoleSelect = (selectedRole: Exclude<UserRole, null>) => {
    // Save to localStorage FIRST
    localStorage.setItem("userRole", selectedRole);
    localStorage.setItem("roleTimestamp", Date.now().toString());
    
    // Use window.location for reliable full page navigation after login
    if (selectedRole === "admin") {
      window.location.href = "/admin/dashboard";
    } else if (selectedRole === "doctor") {
      window.location.href = "/";
    } else if (selectedRole === "customer") {
      window.location.href = "/patient/home";
    }
  };

  const handleLogout = async () => {
    try {
      // Logout from backend
      let endpoint = "";
      if (role === "admin") {
        endpoint = `${API_BASE}/admin/logout/`;
      } else if (role === "doctor") {
        endpoint = `${API_BASE}/doctor/logout/`;
      } else if (role === "customer") {
        endpoint = `${API_BASE}/patient/logout/`;
      }

      await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      localStorage.removeItem("roleTimestamp");
      
      // Reset state
      setRole(null);
      setIsAuthenticated(false);
      setShowModal(true);
      
      // Use window.location for full page reload on logout
      window.location.href = "/";
    }
  };

  const renderSidebar = () => {
    if (role === "admin") return <Sidebar onLogout={handleLogout} />;
    if (role === "doctor") return <DoctorSidebar onLogout={handleLogout} />;
    if (role === "customer") return <PatientSidebar onLogout={handleLogout} />;
    return null;
  };

  // Don't render anything until we know authentication status
  if (showModal === null) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LoadingProvider>
          {showModal ? (
            <RoleModal onSelect={handleRoleSelect} />
          ) : (
            <div className="flex min-h-screen bg-gray-50">
              {!isFullPage && renderSidebar()}

              <main className={`flex-1 ${!isFullPage ? "md:ml-64" : ""} pb-16 md:pb-0 overflow-y-auto transition-all duration-300`}>
                {children}
              </main>
            </div>
          )}
        </LoadingProvider>
      </body>
    </html>
  );
}
