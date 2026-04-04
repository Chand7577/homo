// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { LogOut, AlertCircle, X } from 'lucide-react';

const Logout = () => {
  const [showModal, setShowModal] = useState(true);

  const handleLogout = () => {
    // Handle logout logic here
    console.log('User logged out');
    // Redirect to login page
  };

  const handleCancel = () => {
    setShowModal(false);
    // Redirect back to dashboard
    console.log('Logout cancelled');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      {/* Logout Modal */}
      {showModal && (
        <div className="relative z-50 bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
          {/* Close Button */}
          <button 
            onClick={handleCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <LogOut className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Title and Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Logout</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to log out of your admin account?
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-yellow-800">
                  Make sure all your work is saved. Any unsaved changes will be lost.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button 
              onClick={handleCancel}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>

          {/* Session Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>Current Session</p>
              <p className="font-medium text-gray-700">Admin User • Lagos, Nigeria</p>
              <p>Logged in: 8 hours ago</p>
            </div>
          </div>
        </div>
      )}

      {/* Alternative: Full Page Logout Confirmation */}
      {!showModal && (
        <div className="relative z-50 text-center">
          <div className="bg-white rounded-lg shadow-xl p-12 max-w-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Successfully Logged Out</h2>
            <p className="text-gray-600 mb-8">
              You have been safely logged out of the Homeopathy Admin Panel.
            </p>
            <button className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              Return to Login
            </button>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
    </div>
  );
};

export default Logout;
