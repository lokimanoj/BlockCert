
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  User,
  Mail,
  Lock,
  Phone,
  BookOpen,
  Building2,
  Hash,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

interface Institution {
  _id: string;
  institutionName: string;
  institutionCode: string;
}

export default function StudentRegister() {
  const router = useRouter();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    studentName: "",
    registerNumber: "",
    email: "",
    phone: "",
    department: "",
    course: "",
    batch: "",
    institutionId: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/students/approved-institutions"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load institutions."
          );
        }

        setInstitutions(data.institutions || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load institutions."
        );
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        "http://localhost:5000/api/auth/register/student",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentName: form.studentName.trim(),
            registerNumber: form.registerNumber.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            department: form.department.trim(),
            course: form.course.trim(),
            batch: form.batch.trim(),
            institutionId: form.institutionId,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Student registration failed."
        );
      }

      setSuccess(
        "Registration successful! You can now log in using your email and password."
      );

      setForm({
        studentName: "",
        registerNumber: "",
        email: "",
        phone: "",
        department: "",
        course: "",
        batch: "",
        institutionId: "",
        password: "",
        confirmPassword: "",
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
    "w-full border border-slate-300 rounded-lg py-3 px-4 pl-11 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100";

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-2xl">

        {/* Left panel */}
        <div className="bg-indigo-950 text-white p-10 md:p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-indigo-500 p-3 rounded-xl">
                <ShieldCheck size={30} />
              </div>
              <span className="text-2xl font-bold">
                BlockCert
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-5">
              Your Academic Journey Starts Here.
            </h1>

            <p className="text-indigo-100 leading-7">
              Create your secure student account and access
              your academic certificates whenever you need them.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" />
                <span className="text-indigo-100">
                  Secure student registration
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" />
                <span className="text-indigo-100">
                  Digital academic certificates
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" />
                <span className="text-indigo-100">
                  Easy certificate verification
                </span>
              </div>
            </div>
          </div>

          <p className="mt-12 text-sm text-indigo-200">
            © 2026 BlockCert. All rights reserved.
          </p>
        </div>

        {/* Right panel */}
        <div className="p-8 md:p-12">
          <div className="mb-7">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-5">
              <GraduationCap size={30} />
            </div>

            <h2 className="text-3xl font-bold text-slate-900">
              Student Registration
            </h2>

            <p className="text-slate-500 mt-2">
              Create your BlockCert student account.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Student name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Student Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />
                <input
                  name="studentName"
                  value={form.studentName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Register number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Register Number
              </label>
              <div className="relative">
                <Hash
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />
                <input
                  name="registerNumber"
                  value={form.registerNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter your register number"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
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
                <Phone
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Department
              </label>
              <div className="relative">
                <BookOpen
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Computer Science"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Course
              </label>
              <div className="relative">
                <GraduationCap
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />
                <input
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  required
                  placeholder="e.g. M.Tech Full Stack"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Batch */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Batch
              </label>
              <div className="relative">
                <BookOpen
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />
                <input
                  name="batch"
                  value={form.batch}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 2025-2027"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Institution dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Institution
              </label>

              <div className="relative">
                <Building2
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />

                <select
                  name="institutionId"
                  value={form.institutionId}
                  onChange={handleChange}
                  required
                  disabled={loadingInstitutions || institutions.length === 0}
                  className={inputClass}
                >
                  <option value="">
                    {loadingInstitutions
                      ? "Loading institutions..."
                      : institutions.length === 0
                      ? "No approved institutions available"
                      : "Select your institution"}
                  </option>

                  {institutions.map((institution) => (
                    <option
                      key={institution._id}
                      value={institution._id}
                    >
                      {institution.institutionName} (
                      {institution.institutionCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
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
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={19}
                />

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

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
                {success}

                <button
                  type="button"
                  onClick={() => router.push("/student/login")}
                  className="block mt-2 font-semibold underline"
                >
                  Go to Student Login
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || loadingInstitutions || institutions.length === 0}
              className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? "Creating Account..." : "Create Student Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/student/login"
              className="text-indigo-700 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>

          <Link
            href="/"
            className="block text-center text-indigo-700 hover:underline mt-5 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
