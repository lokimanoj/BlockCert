
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Hash,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

export default function InstitutionRegister() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    institutionName: "",
    institutionCode: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register/institution",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            institutionName: form.institutionName.trim(),
            institutionCode: form.institutionCode.trim().toUpperCase(),
            phone: form.phone.trim(),
            address: form.address.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Institution registration failed."
        );
      }

      setSuccess(
        "Institution registered successfully! Your account is pending administrator approval."
      );

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        institutionName: "",
        institutionCode: "",
        phone: "",
        address: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-slate-300 rounded-lg py-3 pl-11 pr-4 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-2xl">

        {/* Left panel */}
        <div className="bg-blue-950 text-white p-10 md:p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-blue-500 p-3 rounded-xl">
                <ShieldCheck size={30} />
              </div>
              <span className="text-2xl font-bold">
                BlockCert
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-5">
              Bring Your Academic Credentials Into the Digital Future.
            </h1>

            <p className="text-blue-100 leading-7">
              Register your institution to issue, manage and
              securely verify academic certificates through
              the BlockCert platform.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" />
                <span className="text-blue-100">
                  Secure certificate management
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" />
                <span className="text-blue-100">
                  Digital student records
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" />
                <span className="text-blue-100">
                  Certificate authenticity verification
                </span>
              </div>
            </div>
          </div>

          <p className="mt-12 text-sm text-blue-200">
            © 2026 BlockCert. All rights reserved.
          </p>
        </div>

        {/* Right panel */}
        <div className="p-8 md:p-12">
          <div className="mb-7">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-5">
              <Building2 size={30} />
            </div>

            <h2 className="text-3xl font-bold text-slate-900">
              Institution Registration
            </h2>

            <p className="text-slate-500 mt-2">
              Register your institution with BlockCert.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Institution name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Institution Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 text-slate-400" size={19} />
                <input
                  name="institutionName"
                  value={form.institutionName}
                  onChange={handleChange}
                  required
                  placeholder="Enter institution name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Institution code */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Institution Code
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3.5 text-slate-400" size={19} />
                <input
                  name="institutionCode"
                  value={form.institutionCode}
                  onChange={handleChange}
                  required
                  placeholder="e.g. ABC001"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Contact person */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contact Person Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={19} />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter administrator name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Official Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={19} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter official email"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-slate-400" size={19} />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Institution Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-slate-400" size={19} />
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Enter complete institution address"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={19} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Create a password"
                  className={inputClass}
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

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={19} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
                {success}
                <button
                  type="button"
                  onClick={() => router.push("/institution/login")}
                  className="block mt-2 font-semibold underline"
                >
                  Go to Institution Login
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Registering..." : "Register Institution"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already registered?{" "}
            <Link
              href="/institution/login"
              className="text-blue-700 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>

          <Link
            href="/"
            className="block text-center text-blue-700 hover:underline mt-5 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
