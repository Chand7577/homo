// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserCircle,
  Star,
  Calendar,
  MapPin,
  Clock,
  MessageSquare,
  Phone,
  X,
  Check,
  Video,
  Building,
  Mail,
  Award,
  Briefcase,
  Loader2,
  AlertCircle,
  Stethoscope,
  Shield,
  Sparkles,
} from "lucide-react";

// API Configuration
const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

// API Functions
const doctorAPI = {
  getAllDoctors: async (doctorClass?: string) => {
    const params = new URLSearchParams();
    if (doctorClass) params.append("doctor_class", doctorClass);

    const response = await fetch(
      `${API_BASE}/public/doctors/?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (!response.ok) throw new Error("Failed to fetch doctors");
    return response.json();
  },

  sendMessage: async (
    doctorId: number,
    message: string,
    patientName: string,
    patientPhone: string,
  ) => {
    const response = await fetch(
      `${API_BASE}/doctor/${doctorId}/send-message/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message,
          patient_name: patientName,
          patient_phone: patientPhone,
        }),
      },
    );
    if (!response.ok) throw new Error("Failed to send message");
    return response.json();
  },
};

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  registration_number: string;
  experience_years: number;
  doctor_class?: string;
  bio?: string;
  profile_image?: string;
  created_at: string;
}

interface DoctorCounts {
  all: number;
  doctor_jp_nautiyal: number;
  core_team: number;
  individual: number;
}

const DoctorPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [counts, setCounts] = useState<DoctorCounts>({
    all: 0,
    doctor_jp_nautiyal: 0,
    core_team: 0,
    individual: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [problemText, setProblemText] = useState("");
  const [appointmentType, setAppointmentType] = useState("online");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [selectedType]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      const classFilter = selectedType === "all" ? undefined : selectedType;
      const data = await doctorAPI.getAllDoctors(classFilter);

      if (data.doctors) {
        setDoctors(data.doctors);
        if (data.counts) {
          setCounts(data.counts);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load doctors");
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowProblemModal(true);
  };

  const handleProblemSubmit = () => {
    if (problemText.trim() && patientName.trim() && patientPhone.trim()) {
      setShowProblemModal(false);
      setShowAppointmentModal(true);
    }
  };

  const handleAppointmentBook = async () => {
    if (appointmentDate && appointmentTime && selectedDoctor) {
      setSendingMessage(true);

      try {
        const message = `
New Appointment Request:
Patient: ${patientName}
Phone: ${patientPhone}
Date: ${new Date(appointmentDate).toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
Time: ${appointmentTime}
Type: ${appointmentType}

Problem Description:
${problemText}
        `.trim();

        const whatsappMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${selectedDoctor.phone.replace(/\D/g, "")}?text=${whatsappMessage}`;

        window.open(whatsappUrl, "_blank");

        setShowAppointmentModal(false);
        setShowSuccessModal(true);
      } catch (err: any) {
        alert("Failed to send appointment request. Please try again.");
        console.error("Error booking appointment:", err);
      } finally {
        setSendingMessage(false);
      }
    }
  };

  const handleWhatsAppContact = () => {
    if (selectedDoctor) {
      const message = encodeURIComponent(
        `Hello Dr. ${selectedDoctor.name}, I would like to discuss my appointment.`,
      );
      window.open(
        `https://wa.me/${selectedDoctor.phone.replace(/\D/g, "")}?text=${message}`,
        "_blank",
      );
    }
  };

  const handleCallDoctor = (doctor: Doctor) => {
    const phoneNumber = doctor.phone.replace(/\D/g, "");
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmailDoctor = (doctor: Doctor) => {
    const subject = encodeURIComponent("Appointment Inquiry");
    const body = encodeURIComponent(
      `Dear Dr. ${doctor.name},\n\nI would like to inquire about booking an appointment.\n\nBest regards,\n${patientName || "[Your Name]"}`,
    );
    window.location.href = `mailto:${doctor.email}?subject=${subject}&body=${body}`;
  };

  const getDoctorClassBadge = (doctorClass?: string) => {
    const badges = {
      doctor_jp_nautiyal: {
        text: "Dr. JP Nautiyal",
        bg: "bg-gradient-to-r from-purple-500 to-purple-600",
        icon: <Shield className="w-3 h-3" />,
      },
      core_team: {
        text: "Core Team",
        bg: "bg-gradient-to-r from-blue-500 to-blue-600",
        icon: <Star className="w-3 h-3" />,
      },
      individual: {
        text: "Individual",
        bg: "bg-gradient-to-r from-green-500 to-green-600",
        icon: <UserCircle className="w-3 h-3" />,
      },
    };

    return badges[doctorClass] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-[#3F856C] animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#3F856C]/20 rounded-full mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading our expert doctors...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border-2 border-red-200 p-8 max-w-md w-full shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Unable to Load Doctors
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={fetchDoctors}
            className="w-full py-3 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-[#3F856C] via-[#35735E] to-[#2d6350] border-b border-white/10 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Find Your Doctor
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                Connect with {counts.all} expert homeopathic specialists
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Doctor Type Filter with Different Colors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#3F856C]" />
            <h2 className="text-xl font-bold text-gray-900">
              Choose Your Specialist
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* All Doctors - Teal */}
            <button
              onClick={() => setSelectedType("all")}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                selectedType === "all"
                  ? "border-teal-500 shadow-lg shadow-teal-500/20 scale-[1.02]"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  selectedType === "all"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-5"
                } bg-gradient-to-br from-teal-400 to-teal-600`}
              />

              <div className="relative p-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                    selectedType === "all"
                      ? "bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg"
                      : "bg-teal-50 group-hover:bg-teal-100"
                  }`}
                >
                  <Users
                    className={`w-7 h-7 ${selectedType === "all" ? "text-white" : "text-teal-600"}`}
                  />
                </div>
                <div className="text-left">
                  <h3
                    className={`font-bold text-lg mb-1 ${
                      selectedType === "all" ? "text-teal-600" : "text-gray-900"
                    }`}
                  >
                    All Doctors
                  </h3>
                  <p className="text-sm text-gray-600">
                    Browse {counts.all} specialists
                  </p>
                </div>
              </div>
            </button>

            {/* Dr. JP Nautiyal - Purple */}
            <button
              onClick={() => setSelectedType("doctor_jp_nautiyal")}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                selectedType === "doctor_jp_nautiyal"
                  ? "border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  selectedType === "doctor_jp_nautiyal"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-5"
                } bg-gradient-to-br from-purple-400 to-purple-600`}
              />

              <div className="relative p-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                    selectedType === "doctor_jp_nautiyal"
                      ? "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg"
                      : "bg-purple-50 group-hover:bg-purple-100"
                  }`}
                >
                  <Shield
                    className={`w-7 h-7 ${selectedType === "doctor_jp_nautiyal" ? "text-white" : "text-purple-600"}`}
                  />
                </div>
                <div className="text-left">
                  <h3
                    className={`font-bold text-lg mb-1 ${
                      selectedType === "doctor_jp_nautiyal"
                        ? "text-purple-600"
                        : "text-gray-900"
                    }`}
                  >
                    Dr. JP Nautiyal
                  </h3>
                  <p className="text-sm text-gray-600">
                    {counts.doctor_jp_nautiyal} specialist
                    {counts.doctor_jp_nautiyal !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </button>

            {/* Core Team - Blue */}
            <button
              onClick={() => setSelectedType("core_team")}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                selectedType === "core_team"
                  ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  selectedType === "core_team"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-5"
                } bg-gradient-to-br from-blue-400 to-blue-600`}
              />

              <div className="relative p-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                    selectedType === "core_team"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
                      : "bg-blue-50 group-hover:bg-blue-100"
                  }`}
                >
                  <Star
                    className={`w-7 h-7 ${selectedType === "core_team" ? "text-white" : "text-blue-600"}`}
                  />
                </div>
                <div className="text-left">
                  <h3
                    className={`font-bold text-lg mb-1 ${
                      selectedType === "core_team"
                        ? "text-blue-600"
                        : "text-gray-900"
                    }`}
                  >
                    Core Team
                  </h3>
                  <p className="text-sm text-gray-600">
                    {counts.core_team} expert{counts.core_team !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </button>

            {/* Individual - Green */}
            <button
              onClick={() => setSelectedType("individual")}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                selectedType === "individual"
                  ? "border-green-500 shadow-lg shadow-green-500/20 scale-[1.02]"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  selectedType === "individual"
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-5"
                } bg-gradient-to-br from-green-400 to-green-600`}
              />

              <div className="relative p-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                    selectedType === "individual"
                      ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg"
                      : "bg-green-50 group-hover:bg-green-100"
                  }`}
                >
                  <UserCircle
                    className={`w-7 h-7 ${selectedType === "individual" ? "text-white" : "text-green-600"}`}
                  />
                </div>
                <div className="text-left">
                  <h3
                    className={`font-bold text-lg mb-1 ${
                      selectedType === "individual"
                        ? "text-green-600"
                        : "text-gray-900"
                    }`}
                  >
                    Individual
                  </h3>
                  <p className="text-sm text-gray-600">
                    {counts.individual} practitioner
                    {counts.individual !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Premium Doctors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {doctors.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-16 text-center shadow-xl">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Doctors Available
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              There are currently no doctors in this category. Please check back
              later or try another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => {
              const badge = getDoctorClassBadge(doctor.doctor_class);

              return (
                <div
                  key={doctor.id}
                  className="group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Doctor Header with Image */}
                  <div className="relative h-32 bg-gradient-to-br from-[#3F856C] to-[#2d6350] p-6">
                    <div className="absolute top-4 right-4">
                      {badge && (
                        <div
                          className={`${badge.bg} text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg`}
                        >
                          {badge.icon}
                          {badge.text}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    {/* Profile Image */}
                    <div className="flex justify-center -mt-16 mb-4">
                      {doctor.profile_image ? (
                        <img
                          src={doctor.profile_image}
                          alt={doctor.name}
                          className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-xl flex items-center justify-center">
                          <Stethoscope className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-xl text-gray-900 mb-1">
                        Dr. {doctor.name}
                      </h3>
                      <p className="text-[#3F856C] font-semibold text-sm mb-2">
                        {doctor.specialization}
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{doctor.experience_years} Years</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>{doctor.qualification}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio Preview */}
                    {doctor.bio && (
                      <p className="text-xs text-gray-600 text-center mb-4 line-clamp-2 px-2">
                        {doctor.bio}
                      </p>
                    )}

                    {/* Registration */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <p className="text-xs text-gray-500 text-center">
                        Reg. No:{" "}
                        <span className="font-bold text-gray-700">
                          {doctor.registration_number}
                        </span>
                      </p>
                    </div>

                    {/* Quick Contact Actions */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <button
                        onClick={() => handleCallDoctor(doctor)}
                        className="group/btn flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-all hover:scale-105"
                        title="Call Doctor"
                      >
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform shadow-sm">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-[10px] text-green-700 font-semibold">
                          Call
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          handleWhatsAppContact();
                        }}
                        className="group/btn flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-all hover:scale-105"
                        title="WhatsApp"
                      >
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform shadow-sm">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-[10px] text-green-700 font-semibold">
                          WhatsApp
                        </span>
                      </button>

                      <button
                        onClick={() => handleEmailDoctor(doctor)}
                        className="group/btn flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all hover:scale-105"
                        title="Email"
                      >
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform shadow-sm">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-[10px] text-blue-700 font-semibold">
                          Email
                        </span>
                      </button>
                    </div>

                    {/* Book Appointment Button */}
                    <button
                      onClick={() => handleDoctorSelect(doctor)}
                      className="w-full bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Book Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Problem Description Modal */}
      {showProblemModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setShowProblemModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProblemModal(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              {selectedDoctor.profile_image ? (
                <img
                  src={selectedDoctor.profile_image}
                  alt={selectedDoctor.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3F856C] to-[#2d6350] flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900 text-xl">
                  Dr. {selectedDoctor.name}
                </h3>
                <p className="text-[#3F856C] font-medium">
                  {selectedDoctor.specialization}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Your Phone Number *
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Describe Your Problem *
                </label>
                <textarea
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="Please describe your symptoms and concerns in detail..."
                  className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none resize-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This information helps the doctor prepare for your
                  consultation
                </p>
              </div>
            </div>

            <button
              onClick={handleProblemSubmit}
              disabled={
                !problemText.trim() ||
                !patientName.trim() ||
                !patientPhone.trim()
              }
              className="w-full mt-6 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              Continue to Book Appointment
            </button>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {showAppointmentModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setShowAppointmentModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-gray-100">
            <button
              onClick={() => setShowAppointmentModal(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Book Your Appointment
            </h2>

            {/* Appointment Type */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Consultation Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAppointmentType("online")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                    appointmentType === "online"
                      ? "border-[#3F856C] bg-[#3F856C]/5 shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      appointmentType === "online"
                        ? "bg-[#3F856C]"
                        : "bg-gray-100"
                    }`}
                  >
                    <Video
                      className={`w-6 h-6 ${appointmentType === "online" ? "text-white" : "text-gray-600"}`}
                    />
                  </div>
                  <span
                    className={`font-bold ${appointmentType === "online" ? "text-[#3F856C]" : "text-gray-700"}`}
                  >
                    Online
                  </span>
                </button>

                <button
                  onClick={() => setAppointmentType("offline")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                    appointmentType === "offline"
                      ? "border-[#3F856C] bg-[#3F856C]/5 shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      appointmentType === "offline"
                        ? "bg-[#3F856C]"
                        : "bg-gray-100"
                    }`}
                  >
                    <Building
                      className={`w-6 h-6 ${appointmentType === "offline" ? "text-white" : "text-gray-600"}`}
                    />
                  </div>
                  <span
                    className={`font-bold ${appointmentType === "offline" ? "text-[#3F856C]" : "text-gray-700"}`}
                  >
                    In-Person
                  </span>
                </button>
              </div>
            </div>

            {/* Date and Time */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Time
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none transition-colors"
                >
                  <option value="">Choose a time slot</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-100">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Doctor's Contact:</strong> {selectedDoctor.phone}
              </p>
              <p className="text-xs text-gray-600">
                Your appointment request will be sent via WhatsApp
              </p>
            </div>

            <button
              onClick={handleAppointmentBook}
              disabled={!appointmentDate || !appointmentTime || sendingMessage}
              className="w-full bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sendingMessage ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Check className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Request Sent Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your appointment request has been sent to Dr.{" "}
              {selectedDoctor.name}
            </p>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-6 text-left border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#3F856C]" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {new Date(appointmentDate).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#3F856C]" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {appointmentTime}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4 text-[#3F856C]" />
                  </div>
                  <span className="text-gray-700 font-medium capitalize">
                    {appointmentType}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleWhatsAppContact}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-3"
            >
              <MessageSquare className="w-5 h-5" />
              Follow Up on WhatsApp
            </button>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedDoctor(null);
                setProblemText("");
                setAppointmentDate("");
                setAppointmentTime("");
                setPatientName("");
                setPatientPhone("");
              }}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Done
            </button>

            <p className="text-xs text-gray-500 mt-4">
              The doctor will confirm your appointment via WhatsApp or phone
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPage;
