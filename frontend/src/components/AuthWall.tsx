"use client";

import { User, Package, Heart, Trophy } from "lucide-react";

export default function AuthWall({ onLogin }: { onLogin?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 px-6">

      {/* Icon */}
      <div className="p-6 bg-white rounded-2xl shadow-lg mb-6">
        <User className="w-12 h-12 text-[hsl(158,64%,26%)]" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        You're not logged in
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-center max-w-sm mb-6">
        Login to manage your account, track orders, earn loyalty points, and access rewards.
      </p>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white px-3 py-2 rounded-xl shadow text-center text-sm">
          <Package className="w-5 h-5 mx-auto text-[hsl(158,64%,26%)] mb-1" />
          Orders
        </div>

        <div className="bg-white px-3 py-2 rounded-xl shadow text-center text-sm">
          <Heart className="w-5 h-5 mx-auto text-[hsl(158,64%,26%)] mb-1" />
          Wishlist
        </div>

        <div className="bg-white px-3 py-2 rounded-xl shadow text-center text-sm">
          <Trophy className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
          Rewards
        </div>
      </div>

      {/* Login Button */}
      <button
        onClick={onLogin}
        className="w-full max-w-sm bg-[hsl(158,64%,26%)] text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-[hsl(158,64%,30%)] transition"
      >
        Login / Create Account
      </button>

      {/* Continue Shopping */}
      <button className="mt-3 text-[hsl(158,64%,26%)] font-medium hover:underline">
        Continue Shopping
      </button>
    </div>
  );
}
