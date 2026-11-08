
"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Search,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type VerificationResult = {
  status: string;
  message: string;
  certificate?: {
    certificateId: string;
    certificateTitle: string;
    course: string;
    department: string;
    issueDate: string;
    fileName: string;
    documentHash: string;
    status: string;
    student?: {
      studentName: string;
      registerNumber: string;
      department: string;
      course: string;
    };
  };
};

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verifyCertificate(id: string, selectedFile?: File | null) {
    if (!id.trim()) {
      setError("Please enter a certificate ID.");
      return;
    }

    if (selectedFile && selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setError("PDF size must be below 5 MB.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("certificateId", id.trim());

      if (selectedFile) {
        formData.append("certificate", selectedFile);
      }

      const response = await fetch(
        "http://localhost:5000/api/certificates/verify",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok && response.status !== 404) {
        throw new Error(data.message || "Verification failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  // Automatically verify when a QR code opens /verify?id=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scannedId = params.get("id");

    if (scannedId) {
      setCertificateId(scannedId);
      void verifyCertificate(scannedId);
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void verifyCertificate(certificateId, file);
  }

  const isAuthentic = result?.status === "AUTHENTIC";
  const isRejected =
    result?.status === "TAMPERED" ||
    result?.status === "REVOKED" ||
    result?.status === "BLOCKCHAIN_MISMATCH" ||
    result?.status === "NOT_ON_BLOCKCHAIN" ||
    result?.status === "NOT_FOUND";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <ShieldCheck size={34} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            BlockCert Verification
          </h1>

          <p className="mt-3 text-slate-600">
            Verify academic certificates securely using blockchain.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-9">
          <h2 className="mb-2 text-xl font-bold text-slate-900">
            Verify Your Certificate
          </h2>

          <p className="mb-7 text-sm text-slate-500">
            Scan a certificate QR code or enter its Certificate ID manually.
            Upload the PDF to check for document tampering.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Certificate ID
              </label>

              <input
                required
                type="text"
                value={certificateId}
                onChange={(event) => setCertificateId(event.target.value)}
                placeholder="Enter Certificate ID"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Upload Certificate PDF (Optional)
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center hover:border-blue-500">
                <Upload size={30} className="mb-3 text-blue-600" />

                <span className="font-semibold text-slate-800">
                  Click to upload PDF
                </span>

                <span className="mt-2 text-xs text-slate-500">
                  PDF only · Maximum size 5 MB
                </span>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(event) =>
                    setFile(event.target.files?.[0] || null)
                  }
                />
              </label>

              {file && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                  <FileText size={18} />
                  <span className="break-all">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-auto text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={19} />
                  Verifying...
                </>
              ) : (
                <>
                  <Search size={19} />
                  Verify Certificate
                </>
              )}
            </button>
          </form>
        </section>

        {result && (
          <section
            className={`mt-7 rounded-2xl border p-6 ${
              isAuthentic
                ? "border-green-200 bg-green-50"
                : isRejected
                  ? "border-red-200 bg-red-50"
                  : "border-yellow-200 bg-yellow-50"
            }`}
          >
            <div className="mb-5 flex items-center gap-3">
              {isAuthentic ? (
                <CheckCircle className="text-green-600" size={32} />
              ) : isRejected ? (
                <XCircle className="text-red-600" size={32} />
              ) : (
                <AlertTriangle className="text-yellow-600" size={32} />
              )}

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {result.status === "AUTHENTIC"
                    ? "Certificate Is Authentic"
                    : result.status === "TAMPERED"
                      ? "Tampered Certificate Detected"
                      : result.status === "REVOKED"
                        ? "Certificate Revoked"
                        : result.status === "BLOCKCHAIN_MISMATCH"
                          ? "Blockchain Mismatch"
                          : result.status === "NOT_ON_BLOCKCHAIN"
                            ? "Blockchain Record Missing"
                            : result.status === "NOT_FOUND"
                              ? "Certificate Not Found"
                              : "Verification Result"}
                </h2>

                <p className="mt-1 text-sm text-slate-700">
                  {result.message}
                </p>
              </div>
            </div>

            {result.certificate && (
              <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
                <Info label="Certificate ID" value={result.certificate.certificateId} />
                <Info label="Student Name" value={result.certificate.student?.studentName || "N/A"} />
                <Info label="Register Number" value={result.certificate.student?.registerNumber || "N/A"} />
                <Info label="Certificate Title" value={result.certificate.certificateTitle} />
                <Info label="Course" value={result.certificate.course} />
                <Info label="Department" value={result.certificate.department} />
                <Info
                  label="Issue Date"
                  value={new Date(result.certificate.issueDate).toLocaleDateString("en-IN")}
                />
                <Info label="Certificate Status" value={result.certificate.status} />

                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-500">
                    SHA-256 Document Hash
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {result.certificate.documentHash}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="mt-10 text-center text-sm text-slate-400">
          BlockCert © 2026 | Blockchain-Based Certificate Verification
        </footer>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-900">
        {value || "N/A"}
      </p>
    </div>
  );
}
