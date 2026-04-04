"use client";

import { useState } from "react";
import {
  Users,
  TrendingUp,
  UserPlus,
  AlertCircle,
  Star,
  Activity,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE"];

const segmentData = [
  { name: "Frequent Buyers", value: 45 },
  { name: "Seasonal Buyers", value: 25 },
  { name: "Dormant Users", value: 20 },
  { name: "New Signups", value: 10 },
];

const forecastData = [
  { name: "Mon", sales: 400 },
  { name: "Tue", sales: 300 },
  { name: "Wed", sales: 600 },
  { name: "Thu", sales: 800 },
  { name: "Fri", sales: 1200 },
  { name: "Sat", sales: 1000 },
  { name: "Sun", sales: 900 },
];

export default function CustomersPage() {
  const [customers] = useState([
    {
      name: "John Doe",
      total: "$1,230",
      lastPurchase: "2 days ago",
      tier: "Gold",
      nextOrder: "3 days",
      badge: "Top Spender",
    },
    {
      name: "Jane Smith",
      total: "$840",
      lastPurchase: "1 week ago",
      tier: "Silver",
      nextOrder: "5 days",
      badge: "Loyal Customer",
    },
    {
      name: "Michael Lee",
      total: "$560",
      lastPurchase: "3 weeks ago",
      tier: "Bronze",
      nextOrder: "—",
      badge: "High Retention Risk",
    },
  ]);

  return (
    <div className="p-6 text-white bg-gradient-to-br from-[#0B0F19] via-[#0A0C16] to-[#080A12] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">🧠 AI Customer Insights</h1>
        <span className="text-sm text-gray-400">
          Updated: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Total Customers</h3>
              <p className="text-2xl font-semibold">4,532</p>
            </div>
            <Users className="w-6 h-6 text-emerald-400" />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">New Signups</h3>
              <p className="text-2xl font-semibold">125</p>
            </div>
            <UserPlus className="w-6 h-6 text-blue-400" />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Active This Month</h3>
              <p className="text-2xl font-semibold">3,280</p>
            </div>
            <Activity className="w-6 h-6 text-yellow-400" />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-sm">Churn Rate</h3>
              <p className="text-2xl font-semibold">3.8%</p>
            </div>
            <AlertCircle className="w-6 h-6 text-red-400" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              Customer Segmentation
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={segmentData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Purchase Trend Forecast</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#00C49F" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-400 mt-2">
              📈 AI predicts a 12% rise in sales this week due to seasonal shopping.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-md mb-8">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-2">Customer</th>
                  <th className="p-2">Total Spent</th>
                  <th className="p-2">Last Purchase</th>
                  <th className="p-2">Loyalty Tier</th>
                  <th className="p-2">Next Order</th>
                  <th className="p-2">AI Tag</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="p-2">{c.name}</td>
                    <td className="p-2">{c.total}</td>
                    <td className="p-2">{c.lastPurchase}</td>
                    <td className="p-2">{c.tier}</td>
                    <td className="p-2">{c.nextOrder}</td>
                    <td className="p-2 text-emerald-400">{c.badge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Loyalty Insights</h3>
            <p className="text-gray-300 text-sm">
              🎯 Your <span className="text-emerald-400 font-medium">Gold-tier customers</span> contribute 60% of total revenue. Launching personalized discounts could increase retention by 15%.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" /> Smart Recommendations
            </h3>
            <ul className="text-sm text-gray-300 list-disc pl-5 space-y-2">
              <li>Offer 10% off to customers inactive for 30+ days.</li>
              <li>Send thank-you messages to the top 5% of spenders.</li>
              <li>Introduce loyalty rewards for seasonal buyers.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
