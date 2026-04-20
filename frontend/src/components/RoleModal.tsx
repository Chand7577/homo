import { useState } from "react";
import {
  Shield,
  Stethoscope,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import PatientSignupModal from "./PatientSignupModal";

type UserRole = "admin" | "doctor" | "customer";

interface RoleModalProps {
  onSelect: (role: UserRole) => void;
}

const API_BASE = "https://homo-backend-sumy.onrender.com/homeopathy";

export default function RoleModal({ onSelect }: RoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // OTP Stage
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required ");
      return;
    }
    console.log(form.password, form.email);

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Send OTP based on role
      let endpoint = "";
      if (selectedRole === "admin") {
        endpoint = `${API_BASE}/admin/send-otp/`;
      } else if (selectedRole === "doctor") {
        endpoint = `${API_BASE}/doctor/send-otp/`;
      } else if (selectedRole === "customer") {
        endpoint = `${API_BASE}/patient/send-otp/`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        setSuccess(
          data.message ||
            "OTP sent to your email. Check your terminal/console for the OTP code.",
        );
        setOtpStage(true);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Verify OTP based on role
      let endpoint = "";
      if (selectedRole === "admin") {
        endpoint = `${API_BASE}/admin/verify-otp/`;
      } else if (selectedRole === "doctor") {
        endpoint = `${API_BASE}/doctor/verify-otp/`;
      } else if (selectedRole === "customer") {
        endpoint = `${API_BASE}/patient/verify-otp/`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          otp: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
      } else {
        setVerified(true);
        setSuccess("Login successful!");

        // Save to localStorage BEFORE calling onSelect
        localStorage.setItem("userRole", selectedRole!);
        localStorage.setItem("roleTimestamp", Date.now().toString());
        localStorage.setItem(
          "user",
          JSON.stringify(data.admin || data.doctor || data.patient),
        );

        // Wait a bit to ensure localStorage is written, then call onSelect
        // Parent (RootLayout) will handle the navigation
        setTimeout(() => {
          onSelect(selectedRole!);
        }, 500);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let endpoint = "";
      if (selectedRole === "admin") {
        endpoint = `${API_BASE}/admin/send-otp/`;
      } else if (selectedRole === "doctor") {
        endpoint = `${API_BASE}/doctor/send-otp/`;
      } else if (selectedRole === "customer") {
        endpoint = `${API_BASE}/patient/send-otp/`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
      } else {
        setSuccess("OTP resent successfully! Check your terminal/console.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      if (otpStage) {
        handleVerifyOtp();
      } else {
        handleLogin();
      }
    }
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
    setSuccess(
      "Account created successfully! Please log in with your credentials.",
    );
    // Auto-select patient role after signup
    setSelectedRole("customer");
  };

  const roles = [
    {
      id: "admin" as UserRole,
      label: "Admin",
      icon: Shield,
      description: "Manage system data and settings",
    },
    {
      id: "doctor" as UserRole,
      label: "Doctor",
      icon: Stethoscope,
      description: "Access professional repertory tools",
    },
    {
      id: "customer" as UserRole,
      label: "Patient",
      icon: User,
      description: "Find remedies for your symptoms",
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 p-3 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dvt1wv1dy/image/upload/v1768980964/id_rglqbg.png"
                  alt="Homeopathic Logo"
                  className="h-20 w-auto sm:h-30 sm:w-auto object-contain"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Welcome Back
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {verified
                  ? "Login successful!"
                  : otpStage
                    ? "Verify your identity"
                    : "Select your role and sign in to continue"}
              </p>
            </div>

            {/* Verified State */}
            {verified ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center animate-bounce">
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Welcome aboard!
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Taking you to your dashboard...
                </p>
              </div>
            ) : otpStage ? (
              /* OTP Verification Stage */
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#3F856C] to-black rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
                    <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
                    Verify your email
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    We sent a code to{" "}
                    <span className="font-semibold">{form.email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Enter 6-digit code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    onKeyPress={handleKeyPress}
                    maxLength={6}
                    placeholder="000000"
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl text-center text-xl sm:text-2xl tracking-widest font-bold focus:border-gray-900 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold hover:bg-black active:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Verifying..."
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </button>

                {/* Error/Success Messages */}
                {error && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl text-red-900 text-xs sm:text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl text-green-900 text-xs sm:text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setOtpStage(false);
                      setOtp("");
                      setError("");
                      setSuccess("");
                    }}
                    className="flex-1 text-gray-600 text-xs sm:text-sm py-2 hover:text-gray-900 transition-colors font-medium"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="flex-1 text-gray-900 text-xs sm:text-sm py-2 hover:text-gray-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            ) : selectedRole ? (
              /* Login Form */
              <>
                {/* Selected Role Display */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {(() => {
                        const role = roles.find((r) => r.id === selectedRole);
                        const Icon = role?.icon || Shield;
                        return (
                          <>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Signing in as
                              </p>
                              <p className="font-semibold text-sm sm:text-base text-gray-900">
                                {role?.label}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRole(null);
                        setForm({ email: "", password: "" });
                        setError("");
                        setSuccess("");
                      }}
                      className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium px-2 py-1 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Login Form */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="your@email.com"
                      className="w-full p-3 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-gray-900 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                      className="w-full p-3 sm:p-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-gray-900 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <a
                      href="#"
                      className="text-gray-900 font-semibold hover:underline"
                    >
                      Forgot?
                    </a>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold hover:bg-black active:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      "Authenticating..."
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </button>

                  {/* Patient Signup Link */}
                  {selectedRole === "customer" && (
                    <div className="text-center pt-2 border-t border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Don't have an account?{" "}
                        <button
                          onClick={() => setShowSignup(true)}
                          className="text-gray-900 font-semibold hover:underline active:text-gray-700"
                        >
                          Sign up here
                        </button>
                      </p>
                    </div>
                  )}
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl text-red-900 text-xs sm:text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl text-green-900 text-xs sm:text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Security Notice */}
                <div className="mt-4 sm:mt-6 text-center text-xs text-gray-500 pt-3 sm:pt-4 border-t border-gray-200">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Your connection is secure and encrypted
                </div>
              </>
            ) : (
              /* Role Selection */
              <div className="space-y-2 sm:space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 active:bg-gray-100 active:border-gray-900 transition-all text-left group touch-manipulation"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 group-hover:bg-gray-900 group-active:bg-gray-900 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-white group-active:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5">
                            {role.label}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                            {role.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-gray-900 group-active:text-gray-900 transition-colors flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Signup Modal */}
      {showSignup && (
        <PatientSignupModal
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
          onSuccess={handleSignupSuccess}
        />
      )}
    </>
  );
}
