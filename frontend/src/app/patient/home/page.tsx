// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Filter,
  Star,
  Award,
  Shield,
  Users,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Video,
  Building,
  Calendar,
  ArrowRight,
  X,
  Check,
  ChevronDown,
  Stethoscope,
  Sparkles,
  TrendingUp,
  Loader2,
  AlertCircle,
  UserCircle,
  Briefcase,
  CheckCircle2,
  Send,
  Inbox,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/homeopathy";

// Indian Cities Data
const INDIAN_CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Bhopal",
  "Visakhapatnam",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Varanasi",
  "Srinagar",
  "Amritsar",
  "Dehradun",
  "Chandigarh",
  "Noida",
];

// Common Medical Specialties with subcategories
const MEDICAL_SPECIALTIES = {
  "Pain Management": [
    "Headache & Migraine",
    "Back Pain",
    "Joint Pain",
    "Muscle Pain",
    "Chronic Pain",
    "Post-Surgery Pain",
  ],
  "Digestive Issues": [
    "Acidity & GERD",
    "IBS",
    "Constipation",
    "Diarrhea",
    "Bloating",
    "Nausea",
  ],
  Respiratory: [
    "Asthma",
    "Chronic Cough",
    "Bronchitis",
    "Allergies",
    "Sinusitis",
    "Common Cold",
  ],
  "Skin Conditions": [
    "Eczema",
    "Psoriasis",
    "Acne",
    "Dermatitis",
    "Rashes",
    "Allergic Reactions",
  ],
  "Mental Health": [
    "Anxiety",
    "Depression",
    "Stress",
    "Insomnia",
    "Panic Attacks",
    "Mood Disorders",
  ],
  "Women's Health": [
    "Menstrual Issues",
    "PCOS",
    "Menopause",
    "Pregnancy Care",
    "Hormonal Imbalance",
    "Fertility",
  ],
  "Children's Health": [
    "Growth Issues",
    "Immunity",
    "Behavioral Issues",
    "Developmental Concerns",
    "Allergies",
    "Common Infections",
  ],
  "Chronic Conditions": [
    "Diabetes",
    "Hypertension",
    "Thyroid",
    "Arthritis",
    "Auto-immune",
    "Lifestyle Diseases",
  ],
};

const PatientHome = () => {
  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedSubSpecialty, setSelectedSubSpecialty] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [appointmentType, setAppointmentType] = useState("online");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // UI State
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  // Data State
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Booking Details
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // Inbox state
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch doctors when city or specialty changes
  useEffect(() => {
    if (currentStep === 2 && selectedCity) {
      fetchDoctors();
    }
  }, [currentStep, selectedCity]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/public/doctors/`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch doctors");

      const data = await response.json();
      if (data.doctors) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      setError(err.message || "Failed to load doctors");
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = INDIAN_CITIES.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    setCitySearch("");
  };

  const handleSpecialtySelect = (specialty, subSpecialty) => {
    setSelectedSpecialty(specialty);
    setSelectedSubSpecialty(subSpecialty);
    setShowSpecialtyModal(false);
  };

  const handleProceedToBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleBookAppointment = async () => {
    if (!appointmentDate || !appointmentTime || !patientName || !patientPhone) {
      alert("Please fill all required fields");
      return;
    }

    setSendingRequest(true);

    try {
      // Create message for API
      const messageText = `
🏥 New Appointment Request

👤 Patient Details:
Name: ${patientName}
Phone: ${patientPhone}
City: ${selectedCity}

📋 Consultation For:
${selectedSpecialty} - ${selectedSubSpecialty}
${problemDescription ? `\nDetails: ${problemDescription}` : ""}

📅 Preferred Schedule:
Date: ${new Date(appointmentDate).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
Time: ${appointmentTime}
Type: ${appointmentType === "online" ? "💻 Online Consultation" : "🏥 In-Person Visit"}

Please confirm availability.
      `.trim();

      // Send to backend
      const response = await fetch(`${API_BASE}/messages/send/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          message: messageText,
          patient_name: patientName,
          patient_phone: patientPhone,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          appointment_type: appointmentType,
          city: selectedCity,
          specialty: selectedSpecialty,
          sub_specialty: selectedSubSpecialty,
          problem_description: problemDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      setShowBookingModal(false);
      setShowSuccessModal(true);

      // Increment unread count
      setUnreadCount((prev) => prev + 1);
    } catch (err) {
      alert("Failed to send request. Please try again.");
      console.error("Booking error:", err);
    } finally {
      setSendingRequest(false);
    }
  };

  const getDoctorsByClass = (doctorClass) => {
    return doctors.filter((d) => d.doctor_class === doctorClass);
  };

  const jpNautiyalDoctors = getDoctorsByClass("doctor_jp_nautiyal");
  const coreTeamDoctors = getDoctorsByClass("core_team");
  const individualDoctors = getDoctorsByClass("individual");

  // Doctor Card Component
  const DoctorCard = ({ doctor, featured = false }) => {
    const getBadgeStyle = (doctorClass) => {
      const styles = {
        doctor_jp_nautiyal: {
          gradient: "from-purple-500 to-purple-600",
          bg: "bg-purple-50",
          text: "text-purple-700",
          border: "border-purple-200",
          icon: <Shield className="w-3 h-3" />,
        },
        core_team: {
          gradient: "from-blue-500 to-blue-600",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <Star className="w-3 h-3 fill-current" />,
        },
        individual: {
          gradient: "from-green-500 to-green-600",
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: <UserCircle className="w-3 h-3" />,
        },
      };
      return styles[doctorClass] || styles.individual;
    };

    const badge = getBadgeStyle(doctor.doctor_class);

    return (
      <div
        className={`group bg-white rounded-2xl shadow-md border-2 ${
          featured ? "border-purple-200" : "border-gray-100"
        } overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
          featured ? "ring-2 ring-purple-300" : ""
        }`}
      >
        <div className="p-5">
          {/* Profile */}
          <div className="flex items-start gap-4 mb-4">
            {doctor.profile_image ? (
              <img
                src={doctor.profile_image}
                alt={doctor.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${badge.gradient} border-4 border-white shadow-lg flex items-center justify-center`}
              >
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div
                className={`bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 ${badge.border} border w-fit mb-2`}
              >
                {badge.icon}
                <span className={`text-xs font-bold ${badge.text}`}>
                  {doctor.doctor_class === "doctor_jp_nautiyal"
                    ? "Dr. JP Nautiyal"
                    : doctor.doctor_class === "core_team"
                      ? "Core Team"
                      : "Individual"}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                Dr. {doctor.name}
              </h3>
              <p className={`font-semibold text-sm ${badge.text}`}>
                {doctor.specialization}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div
              className={`${badge.bg} rounded-xl p-2.5 border ${badge.border}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Briefcase className={`w-3.5 h-3.5 ${badge.text}`} />
                <span className="text-xs text-gray-600">Experience</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {doctor.experience_years} Years
              </p>
            </div>
            <div
              className={`${badge.bg} rounded-xl p-2.5 border ${badge.border}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Award className={`w-3.5 h-3.5 ${badge.text}`} />
                <span className="text-xs text-gray-600">Qualification</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {doctor.qualification}
              </p>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {doctor.bio}
            </p>
          )}

          {/* Registration */}
          <div className="bg-gray-50 rounded-xl p-2.5 mb-4 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Registration:{" "}
              <span className="font-bold text-gray-900">
                {doctor.registration_number}
              </span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() =>
                (window.location.href = `tel:${doctor.phone.replace(/\D/g, "")}`)
              }
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl ${badge.bg} hover:shadow-md transition-all`}
            >
              <Phone className={`w-4 h-4 ${badge.text}`} />
              <span className={`text-[10px] font-semibold ${badge.text}`}>
                Call
              </span>
            </button>
            <button
              onClick={() => {
                const msg = encodeURIComponent(
                  `Hello Dr. ${doctor.name}, I would like to book a consultation.`,
                );
                window.open(
                  `https://wa.me/${doctor.phone.replace(/\D/g, "")}?text=${msg}`,
                  "_blank",
                );
              }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl ${badge.bg} hover:shadow-md transition-all`}
            >
              <MessageSquare className={`w-4 h-4 ${badge.text}`} />
              <span className={`text-[10px] font-semibold ${badge.text}`}>
                Chat
              </span>
            </button>
            <button
              onClick={() => (window.location.href = `mailto:${doctor.email}`)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl ${badge.bg} hover:shadow-md transition-all`}
            >
              <Mail className={`w-4 h-4 ${badge.text}`} />
              <span className={`text-[10px] font-semibold ${badge.text}`}>
                Email
              </span>
            </button>
          </div>

          {/* Book Button */}
          <button
            onClick={() => handleProceedToBooking(doctor)}
            className={`w-full py-3 bg-gradient-to-r ${badge.gradient} text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group`}
          >
            <Calendar className="w-4 h-4" />
            <span>Book Consultation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#3F856C] via-[#35735E] to-[#2d6350] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stethoscope className="w-6 h-6 md:w-8 md:h-8" />
              <h1 className="text-3xl md:text-5xl font-bold">
                Expert Homeopathic Care
              </h1>
            </div>
            <p className="text-base md:text-lg text-white/90 mb-6 md:mb-8">
              Connect with certified homeopathic doctors • Online & Offline
              Consultations
            </p>

            {/* Inbox Button */}
            <button
              onClick={() => setShowInbox(true)}
              className="mb-6 inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all relative"
            >
              <Inbox className="w-5 h-5" />
              <span className="font-semibold">My Inbox</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto">
              {[
                { step: 1, label: "City & Specialty" },
                { step: 2, label: "Choose Doctor" },
                { step: 3, label: "Book Appointment" },
              ].map(({ step, label }) => (
                <div
                  key={step}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep >= step
                        ? "bg-white text-[#3F856C] shadow-lg"
                        : "bg-white/20 text-white/60"
                    }`}
                  >
                    {currentStep > step ? (
                      <Check className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      step
                    )}
                  </div>
                  <span
                    className={`text-xs md:text-sm font-medium hidden sm:block ${
                      currentStep >= step ? "text-white" : "text-white/60"
                    }`}
                  >
                    {label}
                  </span>
                  {step < 3 && (
                    <ArrowRight className="w-4 h-4 text-white/40 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: City & Specialty Selection */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 md:w-7 md:h-7 text-[#3F856C]" />
                Select Your Location & Concern
              </h2>

              {/* City Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Choose Your City *
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-[#3F856C] transition-all"
                  >
                    <span
                      className={
                        selectedCity
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      }
                    >
                      {selectedCity || "Select your city"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${showCityDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showCityDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-hidden">
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search city..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F856C]"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-60">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            onClick={() => handleCitySelect(city)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                          >
                            <span className="text-gray-900">{city}</span>
                            {selectedCity === city && (
                              <Check className="w-5 h-5 text-[#3F856C]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Specialty Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  What brings you here? *
                </label>
                <button
                  onClick={() => setShowSpecialtyModal(true)}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-left hover:border-[#3F856C] transition-all"
                >
                  {selectedSubSpecialty ? (
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedSpecialty}
                      </p>
                      <p className="font-medium text-gray-900">
                        {selectedSubSpecialty}
                      </p>
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      Select your health concern
                    </span>
                  )}
                </button>
              </div>

              {/* Optional Problem Description */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe your symptoms or concerns in detail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none resize-none"
                />
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!selectedCity || !selectedSubSpecialty}
                className="w-full py-4 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                <span>Find Doctors</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Doctor Selection */}
        {currentStep === 2 && (
          <div>
            {/* Selected Filters */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 md:p-6 mb-8">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#3F856C]" />
                  <span className="font-bold text-gray-900">
                    {selectedCity}
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-300" />
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#3F856C]" />
                  <span className="text-gray-900 text-sm md:text-base">
                    <span className="text-gray-600">{selectedSpecialty}:</span>{" "}
                    {selectedSubSpecialty}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="sm:ml-auto text-sm text-[#3F856C] hover:text-[#2d6350] font-semibold flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Change Selection
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 text-[#3F856C] animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  Finding the best doctors for you...
                </p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-3xl border-2 border-red-200 p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Unable to Load Doctors
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchDoctors}
                  className="px-6 py-3 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Dr. JP Nautiyal - Premium Section (FIXED HEIGHT) */}
                {jpNautiyalDoctors.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                      <div className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-lg">
                        <Shield className="w-4 h-4 md:w-5 md:h-5" />
                        <h2 className="text-sm md:text-lg font-bold">
                          System Default Expert
                        </h2>
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                    </div>

                    {/* FIXED: Reduced height premium card */}
                    {jpNautiyalDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="group bg-white rounded-2xl md:rounded-3xl shadow-xl border-2 md:border-4 border-purple-200 overflow-hidden hover:shadow-2xl transition-all duration-300 ring-2 md:ring-4 ring-purple-100 max-w-5xl mx-auto"
                      >
                        <div className="p-4 md:p-8 lg:p-10">
                          {/* FIXED: Responsive Profile Section with badges on top */}
                          <div className="flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-8 mb-6 md:mb-8">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                              {doctor.profile_image ? (
                                <img
                                  src={doctor.profile_image}
                                  alt={doctor.name}
                                  className="w-28 h-28 md:w-40 md:h-40 rounded-2xl md:rounded-3xl object-cover border-4 border-purple-200 shadow-2xl"
                                />
                              ) : (
                                <div className="w-28 h-28 md:w-40 md:h-40 rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 border-4 border-purple-200 shadow-2xl flex items-center justify-center">
                                  <Stethoscope className="w-14 h-14 md:w-20 md:h-20 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Doctor Info */}
                            <div className="flex-1 text-center md:text-left">
                              {/* Badges */}
                              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                                <div className="flex items-center gap-1.5 md:gap-2 bg-purple-100 px-2 md:px-4 py-1.5 md:py-2 rounded-full border border-purple-300">
                                  <Shield className="w-3 h-3 md:w-5 md:h-5 text-purple-700" />
                                  <span className="text-purple-900 font-bold text-xs md:text-sm">
                                    SYSTEM DEFAULT
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 bg-yellow-400 px-2 md:px-4 py-1.5 md:py-2 rounded-full">
                                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-900" />
                                  <span className="text-yellow-900 font-bold text-xs md:text-sm">
                                    Premium Expert
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-purple-100 px-2 md:px-3 py-1.5 md:py-2 rounded-full border border-purple-200">
                                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                                  <span className="text-purple-900 font-bold text-xs md:text-sm">
                                    5.0 Rating
                                  </span>
                                </div>
                              </div>

                              <div className="mb-4">
                                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                  Dr. {doctor.name}
                                </h3>
                                <p className="text-lg md:text-xl text-purple-600 font-semibold mb-3">
                                  {doctor.specialization}
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                                  <div className="flex items-center gap-2 bg-purple-50 px-3 md:px-4 py-2 rounded-xl border border-purple-200">
                                    <Briefcase className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                                    <span className="text-xs md:text-sm font-semibold text-purple-900">
                                      {doctor.experience_years}+ Years
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-purple-50 px-3 md:px-4 py-2 rounded-xl border border-purple-200">
                                    <Award className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                                    <span className="text-xs md:text-sm font-semibold text-purple-900">
                                      {doctor.qualification}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-purple-50 px-3 md:px-4 py-2 rounded-xl border border-purple-200">
                                    <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                                    <span className="text-xs md:text-sm font-semibold text-purple-900">
                                      1000+ Patients
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Bio */}
                              {doctor.bio && (
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl md:rounded-2xl p-4 md:p-5 mb-4 md:mb-6 border border-purple-200">
                                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                    {doctor.bio}
                                  </p>
                                </div>
                              )}

                              {/* Registration */}
                              <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-4 md:mb-6 border border-gray-200 inline-block">
                                <p className="text-xs md:text-sm text-gray-600">
                                  Registration:{" "}
                                  <span className="font-bold text-gray-900">
                                    {doctor.registration_number}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Specializations Grid */}
                          <div className="mb-6 md:mb-8">
                            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-4">
                              Areas of Expertise
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                              {[
                                "Chronic Diseases",
                                "Acute Conditions",
                                "Mental Health",
                                "Women's Health",
                                "Children's Health",
                                "Skin Disorders",
                                "Digestive Issues",
                                "Lifestyle Diseases",
                              ].map((expertise, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded-lg md:rounded-xl p-2 md:p-3 border-2 border-purple-100 hover:border-purple-300 transition-all text-center"
                                >
                                  <p className="text-xs md:text-sm font-semibold text-gray-900">
                                    {expertise}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* FIXED: Contact Actions - Responsive Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                            <button
                              onClick={() =>
                                (window.location.href = `tel:${doctor.phone.replace(/\D/g, "")}`)
                              }
                              className="flex items-center justify-center gap-2 md:gap-3 p-3 md:p-4 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 transition-all group"
                            >
                              <Phone className="w-4 h-4 md:w-5 md:h-5 text-green-600 group-hover:scale-110 transition-transform" />
                              <div className="text-left">
                                <p className="text-xs text-green-600 font-semibold">
                                  Call
                                </p>
                                <p className="text-xs md:text-sm font-bold text-green-900 hidden md:block truncate">
                                  {doctor.phone}
                                </p>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                const msg = encodeURIComponent(
                                  `Hello Dr. ${doctor.name}, I would like to book a consultation.`,
                                );
                                window.open(
                                  `https://wa.me/${doctor.phone.replace(/\D/g, "")}?text=${msg}`,
                                  "_blank",
                                );
                              }}
                              className="flex items-center justify-center gap-2 md:gap-3 p-3 md:p-4 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 transition-all group"
                            >
                              <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-green-600 group-hover:scale-110 transition-transform" />
                              <div className="text-left">
                                <p className="text-xs text-green-600 font-semibold">
                                  WhatsApp
                                </p>
                                <p className="text-xs md:text-sm font-bold text-green-900 hidden md:block">
                                  Chat
                                </p>
                              </div>
                            </button>

                            <button
                              onClick={() =>
                                (window.location.href = `mailto:${doctor.email}`)
                              }
                              className="flex items-center justify-center gap-2 md:gap-3 p-3 md:p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 transition-all group"
                            >
                              <Mail className="w-4 h-4 md:w-5 md:h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                              <div className="text-left">
                                <p className="text-xs text-blue-600 font-semibold">
                                  Email
                                </p>
                                <p className="text-xs md:text-sm font-bold text-blue-900 hidden md:block truncate max-w-[100px]">
                                  {doctor.email}
                                </p>
                              </div>
                            </button>

                            <button
                              onClick={() => handleProceedToBooking(doctor)}
                              className="flex items-center justify-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all group text-white col-span-2 md:col-span-1"
                            >
                              <Inbox className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                              <div className="text-left">
                                <p className="text-xs text-white/80 font-semibold">
                                  Send Message
                                </p>
                                <p className="text-xs md:text-sm font-bold">
                                  Book Now
                                </p>
                              </div>
                            </button>
                          </div>

                          {/* Main CTA Button */}
                          <button
                            onClick={() => handleProceedToBooking(doctor)}
                            className="w-full py-4 md:py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group"
                          >
                            <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                            <span>Book Appointment with Dr. {doctor.name}</span>
                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                          </button>

                          {/* Trust Indicators */}
                          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                              <span>Verified Expert</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                              <span>100% Confidential</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                              <span>Same Day Appointments</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Core Team Section */}
                {coreTeamDoctors.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <Star className="w-5 h-5 md:w-6 md:h-6 text-blue-600 fill-current" />
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        Core Team Specialists
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {coreTeamDoctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Practitioners Section */}
                {individualDoctors.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <UserCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        Individual Practitioners
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {individualDoctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Doctors */}
                {jpNautiyalDoctors.length === 0 &&
                  coreTeamDoctors.length === 0 &&
                  individualDoctors.length === 0 && (
                    <div className="bg-white rounded-3xl border-2 border-gray-100 p-16 text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No Doctors Available
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-6">
                        We couldn't find any doctors matching your criteria.
                        Please try different filters.
                      </p>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Change Filters
                      </button>
                    </div>
                  )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Specialty Selection Modal */}
      {showSpecialtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white p-4 md:p-6 flex items-center justify-between">
              <h3 className="text-xl md:text-2xl font-bold">
                Select Your Health Concern
              </h3>
              <button
                onClick={() => setShowSpecialtyModal(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(MEDICAL_SPECIALTIES).map(
                  ([specialty, subSpecialties]) => (
                    <div
                      key={specialty}
                      className="bg-gray-50 rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#3F856C] transition-all"
                    >
                      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4">
                        <h4 className="font-bold text-base md:text-lg">
                          {specialty}
                        </h4>
                      </div>
                      <div className="p-2">
                        {subSpecialties.map((subSpecialty) => (
                          <button
                            key={subSpecialty}
                            onClick={() =>
                              handleSpecialtySelect(specialty, subSpecialty)
                            }
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-white hover:shadow-md transition-all text-gray-700 hover:text-[#3F856C] font-medium group"
                          >
                            <span className="flex items-center justify-between">
                              {subSpecialty}
                              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white p-4 md:p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  {selectedDoctor.profile_image ? (
                    <img
                      src={selectedDoctor.profile_image}
                      alt={selectedDoctor.name}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">
                      Dr. {selectedDoctor.name}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm">
                      {selectedDoctor.specialization}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Patient Details */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4 text-base md:text-lg">
                  Your Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Type */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4 text-base md:text-lg">
                  Consultation Type
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setAppointmentType("online")}
                    className={`p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all ${
                      appointmentType === "online"
                        ? "border-[#3F856C] bg-[#3F856C]/5 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Inbox
                      className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${appointmentType === "online" ? "text-[#3F856C]" : "text-gray-400"}`}
                    />
                    <p className="font-bold text-center text-sm md:text-base">
                      Send Message
                    </p>
                    <p className="text-xs text-gray-600 text-center mt-1">
                      Via Inbox
                    </p>
                  </button>
                  <button
                    onClick={() => setAppointmentType("offline")}
                    className={`p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all ${
                      appointmentType === "offline"
                        ? "border-[#3F856C] bg-[#3F856C]/5 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Building
                      className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${appointmentType === "offline" ? "text-[#3F856C]" : "text-gray-400"}`}
                    />
                    <p className="font-bold text-center text-sm md:text-base">
                      In-Person
                    </p>
                    <p className="text-xs text-gray-600 text-center mt-1">
                      Visit clinic
                    </p>
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4 text-base md:text-lg">
                  Preferred Schedule
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Time *
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#3F856C] focus:outline-none"
                    >
                      <option value="">Select time</option>
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
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl p-4 md:p-5 mb-6 border-2 border-gray-200">
                <h5 className="font-bold text-gray-900 mb-3 text-sm md:text-base">
                  Booking Summary
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedCity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concern:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedSubSpecialty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {appointmentType === "online" ? "Via Inbox" : "In-Person"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookAppointment}
                  disabled={
                    !patientName ||
                    !patientPhone ||
                    !appointmentDate ||
                    !appointmentTime ||
                    sendingRequest
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingRequest ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Request to Inbox
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your appointment request will be sent to the doctor's inbox for
                confirmation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Request Sent!
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Your appointment request has been sent to Dr.{" "}
              {selectedDoctor.name}'s inbox. You can check your inbox for
              updates and replies.
            </p>

            <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-5 mb-6 text-left border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#3F856C]" />
                  <span className="text-xs md:text-sm text-gray-700 font-medium">
                    {new Date(appointmentDate).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-[#3F856C]" />
                  <span className="text-xs md:text-sm text-gray-700 font-medium">
                    {appointmentTime}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {appointmentType === "online" ? (
                    <Inbox className="w-4 h-4 md:w-5 md:h-5 text-[#3F856C]" />
                  ) : (
                    <Building className="w-4 h-4 md:w-5 md:h-5 text-[#3F856C]" />
                  )}
                  <span className="text-xs md:text-sm text-gray-700 font-medium capitalize">
                    {appointmentType === "online"
                      ? "Via Inbox"
                      : "In-Person Visit"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowInbox(true)}
                className="flex-1 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Inbox className="w-5 h-5" />
                View Inbox
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentStep(1);
                  setSelectedCity("");
                  setSelectedSpecialty("");
                  setSelectedSubSpecialty("");
                  setProblemDescription("");
                  setSelectedDoctor(null);
                  setPatientName("");
                  setPatientPhone("");
                  setAppointmentDate("");
                  setAppointmentTime("");
                }}
                className="flex-1 py-3 md:py-4 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHome;
