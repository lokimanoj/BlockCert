
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

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
            role: "admin",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed.");
      }

      if (data.user?.role !== "admin") {
        throw new Error("You are not authorized to access the Admin portal.");
      }

      localStorage.setItem("blockcert_token", data.token);
      localStorage.setItem("blockcert_user", JSON.stringify(data.user));

      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-400">
              <ShieldCheck size={36} />
            </div>

            <h1 className="text-3xl font-bold text-white">
              BlockCert
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              System Administration Portal
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300">
              <Lock size={13} />
              SECURE ADMIN ACCESS
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Admin Email
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 px-4 focus-within:border-blue-500">
                <Mail size={18} className="text-slate-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 px-4 focus-within:border-blue-500">
                <Lock size={18} className="text-slate-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In to Admin Portal"}
            </button>

          </form>

          <div className="mt-7 border-t border-slate-800 pt-6 text-center">
            <p className="text-xs leading-6 text-slate-500">
              Authorized System Administrators Only.
              <br />
              All login activities are protected.
            </p>
          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          © 2026 BlockCert. Secure Academic Certificate Verification.
        </p>

      </div>
    </main>
  );
}
