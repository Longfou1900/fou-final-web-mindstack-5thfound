// src/pages/forgot_password.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      // Show friendly messages instead of raw Firebase errors
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-email"
      ) {
        setError("No account found with this email address.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-xl w-100 shadow-xl border border-gray-800">

        {/* ── Back to login link ─────────────────────────────────────────── */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition mb-6 w-fit"
        >
          <ArrowLeft size={15} />
          Back to Login
        </Link>

        {/* ── Success state ──────────────────────────────────────────────── */}
        {sent ? (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle size={52} className="text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-black mb-2">
              Check your email
            </h2>
            <p className="text-gray-500 text-sm mb-1">
              We sent a password reset link to
            </p>
            <p className="text-blue-500 font-semibold text-sm mb-6 break-all">
              {email}
            </p>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              Click the link in the email to set a new password. The link will
              expire after a short time. If you don't see it, check your spam
              folder.
            </p>

            {/* Resend */}
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-sm text-blue-400 hover:text-blue-500 font-medium transition"
            >
              Didn't receive it? Try again
            </button>
          </div>
        ) : (
          <>
            {/* ── Form state ────────────────────────────────────────────── */}
            <h2 className="text-2xl font-bold text-start mb-2 text-black">
              Forgot password?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter the email you signed up with and we'll send you a reset
              link throught your gmail in spam at the left sidebar.
            </p>

            {/* Error banner */}
            {error && (
              <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <label className="text-sm text-gray-700 font-bold">Email</label>
              <div className="relative mt-1 mb-6">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-4 p-2 rounded-[11px] text-gray-700 border border-blue-700 focus:border-blue-500 focus:border-2 focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-[11px] bg-blue-500 hover:bg-blue-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center mt-4 text-gray-400 text-sm">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-500 font-medium"
              >
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}