
"use client";

import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  Building2,
  ScanSearch,
  FileCheck2,
  LockKeyhole,
  QrCode,
  Fingerprint,
  ArrowRight,
  CheckCircle2,
  Menu,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Secure Certificates",
      description:
        "Store academic certificate records securely with digital verification.",
    },
    {
      icon: Fingerprint,
      title: "Tampering Detection",
      description:
        "Use SHA-256 document hashing to detect changes in certificate files.",
    },
    {
      icon: QrCode,
      title: "QR Code Verification",
      description:
        "Verify certificates easily using their unique certificate IDs and QR codes.",
    },
    {
      icon: LockKeyhole,
      title: "Role-Based Access",
      description:
        "Separate access for institutions and students with authenticated accounts.",
    },
  ];

  const steps = [
    "Institution registers and gets approved",
    "Institution registers students",
    "Institution issues academic certificates",
    "Certificate hash and QR code are generated",
    "Anyone can verify certificate authenticity",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white">
              <ShieldCheck size={27} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                BlockCert<span className="text-blue-600">.</span>
              </h1>
              <p className="text-xs text-slate-500">
                Secure Academic Credentials
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#home" className="hover:text-blue-600">Home</a>
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600">
              How It Works
            </a>
            <Link href="/verify" className="hover:text-blue-600">
              Verify Certificate
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/student/login"
              className="hidden rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 sm:block"
            >
              Student Login
            </Link>
            <Link
              href="/institution/login"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Institution Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="relative overflow-hidden bg-slate-950">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
              <ShieldCheck size={17} />
              Digital Academic Certificate Platform
            </div>

            <h2 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Secure Your
              <span className="block text-blue-400">
                Academic Future.
              </span>
            </h2>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              BlockCert is a digital academic certificate management
              and verification platform designed to protect academic
              records and detect certificate tampering.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 font-semibold text-white hover:bg-blue-700"
              >
                Verify Certificate
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/institution/register"
                className="rounded-lg border border-slate-500 px-6 py-3.5 font-semibold text-white hover:bg-white/10"
              >
                Register Institution
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="text-green-400" size={18} />
                Secure Records
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="text-green-400" size={18} />
                QR Verification
              </span>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    Digital Credential
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    Academic Certificate
                  </h3>
                </div>
                <div className="rounded-xl bg-blue-500/20 p-3 text-blue-300">
                  <FileCheck2 size={30} />
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-blue-400/20 bg-slate-900 p-6">
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-blue-500/20 p-5 text-blue-400">
                    <GraduationCap size={55} />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Digital Academic Record
                  </p>
                  <h4 className="mt-2 text-2xl font-bold text-white">
                    Verified Credentials
                  </h4>
                  <p className="mt-2 text-sm text-slate-400">
                    Secure certificate management
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-green-500/10 py-3 text-sm font-semibold text-green-400">
                  <ShieldCheck size={19} />
                  Verification Ready
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <Fingerprint className="text-blue-400" size={22} />
                  <p className="mt-2 text-sm font-semibold text-white">
                    SHA-256 Hash
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Document integrity
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <QrCode className="text-blue-400" size={22} />
                  <p className="mt-2 text-sm font-semibold text-white">
                    QR Code
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Quick verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold text-blue-600">OUR FEATURES</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
              Making Academic Records More Secure
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              Reliable digital tools for issuing, managing and
              verifying academic certificates.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="inline-flex rounded-xl bg-blue-100 p-3 text-blue-700">
                    <Icon size={27} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="font-semibold text-blue-600">SIMPLE PROCESS</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
              How BlockCert Works
            </h2>
            <p className="mt-4 text-slate-500">
              A simple process for secure academic certificate management.
            </p>
          </div>

          <div className="mt-12 space-y-5">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {index + 1}
                </div>
                <p className="font-semibold text-slate-800">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-blue-700 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Verify Your Academic Certificate
          </h2>
          <p className="mt-5 leading-7 text-blue-100">
            Check certificate authenticity and detect modified
            documents using the BlockCert verification platform.
          </p>
          <Link
            href="/verify"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 font-bold text-blue-700 hover:bg-blue-50"
          >
            Verify Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 px-6 py-10 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
          <div>
            <h3 className="text-xl font-bold text-white">
              BlockCert<span className="text-blue-500">.</span>
            </h3>
            <p className="mt-2 text-sm">
              Blockchain-Based Academic Certificate Verification
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/institution/login" className="hover:text-white">
              Institution
            </Link>
            <Link href="/student/login" className="hover:text-white">
              Student
            </Link>
            <Link href="/verify" className="hover:text-white">
              Verify
            </Link>
          </div>

          <p className="text-xs">
            © 2026 BlockCert. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
