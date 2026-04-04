// @ts-nocheck
"use client";

import { Shield, User, Mail } from "lucide-react";

const AdminProfile = () => {
  const profileData = {
    fullName: "Admin User",
    email: "admin@homeopathy.com",
    role: "System Administrator",
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Profile
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Account information
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center">
                  <Shield className="w-10 h-10 text-gray-900" />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">
                    {profileData.fullName}
                  </h2>
                  <p className="text-sm text-white/80">
                    {profileData.email}
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                    {profileData.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">
                    {profileData.fullName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">
                    {profileData.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="font-semibold text-gray-900">
                    System Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;
