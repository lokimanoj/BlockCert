
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  GraduationCap,
  Award,
  FileCheck,
  LogOut,
  User,
  FileText,
  RefreshCw,
  ExternalLink,
  Hash,
  Blocks,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Copy,
  XCircle,
} from "lucide-react";

interface StudentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface BlockchainTransaction {
  transactionHash: string;
  blockNumber: number | null;
  walletAddress: string;
  contractAddress: string;
  network: string;
  transactionType: "ISSUE" | "REVOKE" | "VERIFY";
  transactionStatus: "PENDING" | "SUCCESS" | "FAILED";
  timestamp: string;
  documentHash: string;
}

interface Certificate {
  _id: string;
  certificateId: string;
  certificateTitle: string;
  course: string;
  department: string;
  issueDate: string;
  expiryDate?: string | null;
  fileName?: string;
  fileUrl?: string;
  documentHash: string;
  qrCodeData?: string;
  status: "Issued" | "Revoked";
  revokedAt?: string | null;
  revocationReason?: string;
  institution?: {
    institutionName: string;
    institutionCode: string;
  };
  student?: {
    studentName: string;
    registerNumber: string;
    email: string;
    department: string;
    course: string;
  };
  blockchainTransaction?: BlockchainTransaction | null;
}

export default function StudentDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificateLoading, setCertificateLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedHash, setCopiedHash] = useState("");
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  const loadCertificates = useCallback(async (token: string) => {
    setCertificateLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/student/my-certificates",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load certificates."
        );
      }

      setCertificates(
        Array.isArray(data.certificates) ? data.certificates : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your certificates."
      );
    } finally {
      setCertificateLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("blockcert_token");
    const savedUser = localStorage.getItem("blockcert_user");

    if (!token || !savedUser) {
      router.replace("/student/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (parsedUser.role !== "student") {
        router.replace("/student/login");
        return;
      }

      setUser(parsedUser);
      void loadCertificates(token);
      setLoading(false);
    } catch {
      localStorage.removeItem("blockcert_token");
      localStorage.removeItem("blockcert_user");
      router.replace("/student/login");
      setLoading(false);
    }
  }, [router, loadCertificates]);

  const handleLogout = () => {
    localStorage.removeItem("blockcert_token");
    localStorage.removeItem("blockcert_user");
    router.replace("/student/login");
  };

  const handleRefresh = () => {
    const token = localStorage.getItem("blockcert_token");

    if (token) {
      void loadCertificates(token);
    } else {
      router.replace("/student/login");
    }
  };

  const getCertificateUrl = (fileUrl?: string) => {
    if (!fileUrl) return "";

    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }

    return `http://localhost:5000${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string | null) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN");
  };

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      window.setTimeout(() => setCopiedHash(""), 2000);
    } catch {
      window.alert("Unable to copy. Please select and copy the hash manually.");
    }
  };

  const totalCertificates = certificates.length;

  const issuedCertificates = certificates.filter(
    (certificate) => certificate.status === "Issued"
  ).length;

  const revokedCertificates = certificates.filter(
    (certificate) => certificate.status === "Revoked"
  ).length;

  const blockchainRecorded = certificates.filter(
    (certificate) =>
      certificate.blockchainTransaction?.transactionStatus === "SUCCESS"
  ).length;

  const studentProfile = certificates.find(
    (certificate) => certificate.student
  )?.student;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 animate-spin text-indigo-600" size={32} />
          <p className="font-medium text-slate-600">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-700 p-2.5 text-white">
              <ShieldCheck size={27} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                BlockCert
              </h1>
              <p className="text-xs text-slate-500">
                Secure Student Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-500">Student Account</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8">
        {/* WELCOME */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-800 p-8 text-white shadow-lg md:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-sm font-medium text-indigo-200">
                Welcome to your student portal
              </p>

              <h2 className="text-3xl font-bold md:text-4xl">
                Hello, {user.name}!
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">
                Access your academic achievements, view your digital
                certificates and check their blockchain verification records.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-indigo-100">
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  <GraduationCap className="mr-1 inline" size={16} />
                  Student Portal
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  <ShieldCheck className="mr-1 inline" size={16} />
                  Blockchain Secured
                </span>
              </div>
            </div>

            <div className="hidden rounded-2xl bg-white/10 p-6 md:block">
              <Award size={65} className="text-indigo-100" />
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Dashboard Overview
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Your certificate information at a glance.
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={certificateLoading}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={certificateLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Certificates"
              value={certificateLoading ? "..." : totalCertificates}
              description="All certificates assigned to you"
              icon={<Award size={24} />}
              color="indigo"
            />

            <StatCard
              title="Active Certificates"
              value={certificateLoading ? "..." : issuedCertificates}
              description="Currently issued certificates"
              icon={<CheckCircle2 size={24} />}
              color="green"
            />

            <StatCard
              title="Revoked Certificates"
              value={certificateLoading ? "..." : revokedCertificates}
              description="Certificates marked as revoked"
              icon={<XCircle size={24} />}
              color="red"
            />

            <StatCard
              title="Blockchain Recorded"
              value={certificateLoading ? "..." : blockchainRecorded}
              description="Successful blockchain transactions"
              icon={<Blocks size={24} />}
              color="blue"
            />
          </div>
        </section>

        {/* CERTIFICATES */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                <FileText size={24} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  My Certificates
                </h3>
                <p className="text-sm text-slate-500">
                  Your academic certificates and verification details.
                </p>
              </div>
            </div>
          </div>

          {certificateLoading ? (
            <div className="py-12 text-center">
              <RefreshCw
                className="mx-auto mb-3 animate-spin text-indigo-600"
                size={32}
              />
              <p className="text-sm text-slate-500">
                Loading certificates...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 font-semibold text-red-700">
                <AlertCircle size={20} />
                Unable to load certificates
              </div>

              <p className="mt-2 text-sm text-red-600">{error}</p>

              <button
                onClick={handleRefresh}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-14 text-center">
              <FileText size={50} className="mx-auto mb-4 text-slate-300" />

              <h4 className="font-bold text-slate-700">
                No Certificates Yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Your institution has not issued any certificates to your
                account yet. Once issued, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {certificates.map((certificate) => {
                const transaction = certificate.blockchainTransaction;
                const transactionSuccessful =
                  transaction?.transactionStatus === "SUCCESS";

                const qrValue =
                  certificate.qrCodeData || certificate.certificateId;

                return (
                  <article
                    key={certificate._id}
                    className="overflow-hidden rounded-xl border border-slate-200 transition hover:border-indigo-300 hover:shadow-md"
                  >
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col justify-between gap-5 lg:flex-row">
                        <div className="flex min-w-0 gap-4">
                          <div className="h-fit rounded-xl bg-indigo-50 p-3 text-indigo-700">
                            <FileText size={28} />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-lg font-bold text-slate-900">
                              {certificate.certificateTitle}
                            </h4>

                            <p className="mt-1 break-all text-xs text-slate-500">
                              Certificate ID: {certificate.certificateId}
                            </p>

                            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                              <InfoItem
                                label="Course"
                                value={certificate.course}
                              />

                              <InfoItem
                                label="Department"
                                value={certificate.department}
                              />

                              <InfoItem
                                label="Issue Date"
                                value={formatDate(certificate.issueDate)}
                              />

                              <InfoItem
                                label="Expiry Date"
                                value={
                                  certificate.expiryDate
                                    ? formatDate(certificate.expiryDate)
                                    : "No expiry date"
                                }
                              />

                              <InfoItem
                                label="Institution"
                                value={
                                  certificate.institution?.institutionName ||
                                  "Not available"
                                }
                              />

                              <InfoItem
                                label="Institution Code"
                                value={
                                  certificate.institution?.institutionCode ||
                                  "Not available"
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-row flex-wrap items-start gap-3 lg:flex-col lg:items-end">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                              certificate.status === "Issued"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {certificate.status === "Issued"
                              ? "ACTIVE"
                              : "REVOKED"}
                          </span>

                          {certificate.fileUrl && (
                            <a
                              href={getCertificateUrl(certificate.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800"
                            >
                              View PDF
                              <ExternalLink size={16} />
                            </a>
                          )}

                          <button
                            onClick={() => setSelectedCertificate(certificate)}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* BLOCKCHAIN SUMMARY */}
                      <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">
                            Blockchain Status
                          </p>

                          <p
                            className={`mt-2 flex items-center gap-2 text-sm font-bold ${
                              transactionSuccessful
                                ? "text-green-700"
                                : "text-orange-600"
                            }`}
                          >
                            {transactionSuccessful ? (
                              <CheckCircle2 size={17} />
                            ) : (
                              <AlertCircle size={17} />
                            )}

                            {transaction?.transactionStatus ||
                              "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-500">
                            Block Number
                          </p>
                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {transaction?.blockNumber ?? "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-500">
                            Network
                          </p>
                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {transaction?.network || "Not available"}
                          </p>
                        </div>
                      </div>

                      {/* DOCUMENT HASH */}
                      <div className="mt-4 rounded-xl border border-slate-200 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Hash size={17} className="text-indigo-600" />
                          <p className="text-xs font-bold text-slate-600">
                            SHA-256 DOCUMENT HASH
                          </p>
                        </div>

                        <p className="break-all font-mono text-xs leading-6 text-slate-600">
                          {certificate.documentHash || "Not available"}
                        </p>

                        {certificate.documentHash && (
                          <button
                            onClick={() =>
                              void copyHash(certificate.documentHash)
                            }
                            className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-700 hover:underline"
                          >
                            <Copy size={14} />
                            {copiedHash === certificate.documentHash
                              ? "Copied!"
                              : "Copy Document Hash"}
                          </button>
                        )}
                      </div>

                      {/* TRANSACTION HASH */}
                      {transaction && (
                        <div className="mt-4 rounded-xl border border-slate-200 p-4">
                          <p className="mb-2 text-xs font-bold text-slate-600">
                            BLOCKCHAIN TRANSACTION HASH
                          </p>

                          <p className="break-all font-mono text-xs leading-6 text-slate-600">
                            {transaction.transactionHash || "Not available"}
                          </p>

                          {transaction.transactionHash && (
                            <button
                              onClick={() =>
                                void copyHash(transaction.transactionHash)
                              }
                              className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-700 hover:underline"
                            >
                              <Copy size={14} />
                              {copiedHash === transaction.transactionHash
                                ? "Copied!"
                                : "Copy Transaction Hash"}
                            </button>
                          )}
                        </div>
                      )}

                      {/* REVOCATION DETAILS */}
                      {certificate.status === "Revoked" && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                          <div className="flex items-center gap-2 font-bold text-red-700">
                            <AlertCircle size={19} />
                            Certificate Revocation Details
                          </div>

                          <p className="mt-3 text-sm text-red-700">
                            <strong>Revoked on:</strong>{" "}
                            {formatDateTime(certificate.revokedAt)}
                          </p>

                          <p className="mt-2 break-words text-sm text-red-700">
                            <strong>Reason:</strong>{" "}
                            {certificate.revocationReason ||
                              "No reason provided"}
                          </p>
                        </div>
                      )}

                      {/* QR CODE */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4">
                        <div>
                          <p className="font-bold text-slate-800">
                            Certificate QR Code
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Scan the code to read its certificate reference.
                          </p>
                        </div>

                        <div className="rounded-lg bg-white p-3">
                          <QRCodeSVG
                            value={qrValue}
                            size={105}
                            level="H"
                            includeMargin
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* PROFILE */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <User size={24} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Student Account Information
              </h3>
              <p className="text-sm text-slate-500">
                Your registered account details.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Student Name" value={studentProfile?.studentName || user.name} />
            <InfoItem label="Email Address" value={studentProfile?.email || user.email} />
            <InfoItem label="Register Number" value={studentProfile?.registerNumber || "Not available"} />
            <InfoItem label="Department" value={studentProfile?.department || "Not available"} />
            <InfoItem label="Course" value={studentProfile?.course || "Not available"} />
            <InfoItem label="Account Type" value="Student" />
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm font-semibold text-green-700">
            <ShieldCheck size={19} />
            Your student account is authenticated.
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pb-5 text-center text-xs text-slate-400">
          BlockCert © 2026 | Blockchain-Based Secure Academic Certificate Verification
        </footer>
      </section>

      {/* CERTIFICATE DETAILS MODAL */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
          onClick={() => setSelectedCertificate(null)}
        >
          <div
            className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Certificate Details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Complete certificate information.
                </p>
              </div>

              <button
                onClick={() => setSelectedCertificate(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close certificate details"
              >
                <XCircle size={23} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <InfoItem
                label="Certificate Title"
                value={selectedCertificate.certificateTitle}
              />

              <InfoItem
                label="Certificate ID"
                value={selectedCertificate.certificateId}
              />

              <InfoItem
                label="Issue Date"
                value={formatDate(selectedCertificate.issueDate)}
              />

              <InfoItem
                label="Status"
                value={selectedCertificate.status}
              />

              <InfoItem
                label="Institution"
                value={
                  selectedCertificate.institution?.institutionName ||
                  "Not available"
                }
              />

              <InfoItem
                label="Blockchain Transaction"
                value={
                  selectedCertificate.blockchainTransaction?.transactionHash ||
                  "Not available"
                }
              />

              <InfoItem
                label="Block Number"
                value={
                  selectedCertificate.blockchainTransaction?.blockNumber?.toString() ||
                  "Not available"
                }
              />

              <InfoItem
                label="Transaction Date"
                value={formatDateTime(
                  selectedCertificate.blockchainTransaction?.timestamp
                )}
              />

              <InfoItem
                label="Wallet Address"
                value={
                  selectedCertificate.blockchainTransaction?.walletAddress ||
                  "Not available"
                }
              />

              <InfoItem
                label="Smart Contract Address"
                value={
                  selectedCertificate.blockchainTransaction?.contractAddress ||
                  "Not available"
                }
              />

              <InfoItem
                label="Document Hash"
                value={selectedCertificate.documentHash || "Not available"}
              />
            </div>

            {selectedCertificate.fileUrl && (
              <a
                href={getCertificateUrl(selectedCertificate.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800"
              >
                Open Certificate PDF
                <ExternalLink size={17} />
              </a>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: "indigo" | "green" | "red" | "blue";
}) {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className={`rounded-lg p-3 ${colors[color]}`}>{icon}</div>
      </div>

      <h3 className="mt-5 text-3xl font-bold text-slate-900">{value}</h3>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}
