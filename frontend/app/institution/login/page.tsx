
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

export default function InstitutionLogin() {
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
            role: "institution",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("blockcert_token", data.token);
      localStorage.setItem("blockcert_user", JSON.stringify(data.user));

      router.replace("/institution/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-2xl">

        <div className="bg-blue-950 text-white p-10 md:p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-blue-500 p-3 rounded-xl">
                <ShieldCheck size={30} />
              </div>
              <span className="text-2xl font-bold">BlockCert</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-5">
              Secure Academic Certificate Verification
            </h1>

            <p className="text-blue-100 leading-7">
              Manage academic certificates, issue verified credentials
              and maintain trustworthy digital records using blockchain
              technology.
            </p>
          </div>

          <div className="mt-12 text-sm text-blue-200">
            © 2026 BlockCert. All rights reserved.
          </div>
        </div>

        <div className="p-8 md:p-14 flex flex-col justify-center">
          <div className="mb-8">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-5">
              <Building2 size={28} />
            </div>

            <h2 className="text-3xl font-bold text-slate-900">
              Institution Login
            </h2>

            <p className="text-slate-500 mt-2">
              Sign in to your institution account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Official Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={19} />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter institution email"
                  className="w-full border border-slate-300 rounded-lg py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-slate-300 rounded-lg py-3 pl-11 pr-12 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-slate-500">
            Don't have an institution account?
            <Link
              href="/institution/register"
              className="block mt-2 text-blue-700 font-semibold hover:underline"
            >
              Register Your Institution →
            </Link>
          </div>

          <Link
            href="/"
            className="text-center text-blue-700 hover:underline mt-6 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
