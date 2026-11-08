
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  Lock,
  Mail,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";

export default function StudentLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            role: "student",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("blockcert_token", data.token);
      localStorage.setItem(
        "blockcert_user",
        JSON.stringify(data.user)
      );

      router.replace("/student/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-2xl">

        {/* Left panel */}
        <div className="bg-indigo-950 text-white p-10 md:p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-indigo-500 p-3 rounded-xl">
                <ShieldCheck size={30} />
              </div>
              <span className="text-2xl font-bold">BlockCert</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-5">
              Your Academic Achievements, Securely Verified.
            </h1>

            <p className="text-indigo-100 leading-7">
              Access your academic certificates, check their
              authenticity and view your verified educational
              records in one secure place.
            </p>
          </div>

          <div className="mt-12 text-sm text-indigo-200">
            © 2026 BlockCert. All rights reserved.
          </div>
        </div>

        {/* Right panel */}
        <div className="p-8 md:p-14 flex flex-col justify-center">
          <div className="mb-8">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-5">
              <GraduationCap size={30} />
            </div>

            <h2 className="text-3xl font-bold text-slate-900">
              Student Login
            </h2>

            <p className="text-slate-500 mt-2">
              Sign in to access your academic certificates.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Student Email
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full border border-slate-300 rounded-lg py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-slate-300 rounded-lg py-3 pl-11 pr-12 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Student registration link */}
          <div className="mt-7 text-center text-sm text-slate-500">
            <UserRound size={17} className="inline mr-1" />
            Don't have a student account?

            <Link
              href="/student/register"
              className="block mt-2 text-indigo-700 font-semibold hover:underline"
            >
              Create Student Account →
            </Link>
          </div>

          <Link
            href="/"
            className="text-center text-indigo-700 hover:underline mt-6 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
