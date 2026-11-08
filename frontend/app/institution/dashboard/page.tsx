
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  Files,
  ShieldCheck,
  Users,
  Link2,
  UploadCloud,
  Search,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Hash,
  FileCheck2,
  ArrowRight,
  Trash2,
  QrCode,
  Download,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type BlockchainDetails = {
  transactionHash: string;
  blockNumber: number | null;
  walletAddress: string;
  contractAddress: string;
  transactionType: "ISSUE" | "REVOKE" | "VERIFY";
  transactionStatus: "PENDING" | "SUCCESS" | "FAILED";
  network: string;
};

type Certificate = {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  email: string;
  department: string;
  course: string;
  issueDate: string;
  hash: string;
  fileName: string;
  fileUrl: string;
  qrCodeData: string;
  status: "Issued" | "Revoked";
  blockchainTransaction?: BlockchainDetails | null;
};

type ApiCertificate = {
  _id: string;
  certificateId: string;
  student: {
    _id: string;
    studentName: string;
    registerNumber: string;
    email: string;
    department: string;
    course: string;
  };
  certificateTitle: string;
  course: string;
  department: string;
  issueDate: string;
  fileName: string;
  fileUrl: string;
  documentHash: string;
  qrCodeData?: string;
  status: "Issued" | "Revoked";
  blockchainTransaction?: BlockchainDetails | null;
};
type BlockchainTransaction = {
  _id: string;
  certificateId: string;
  transactionHash: string;
  blockNumber: number;
  walletAddress: string;
  contractAddress: string;
  network: string;
  transactionType: "ISSUE" | "REVOKE" | "VERIFY";
  transactionStatus: "PENDING" | "SUCCESS" | "FAILED";
  timestamp: string;
  documentHash: string;
};

type Student = {
  _id: string;
  studentName: string;
  registerNumber: string;
  email: string;
  phone?: string;
  department: string;
  course: string;
  batch?: string;
  isActive: boolean;
  createdAt?: string;
};

export default function Home() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certificatesError, setCertificatesError] = useState("");
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [selectedLifecycleCertificateId, setSelectedLifecycleCertificateId] =
  useState("");
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState("");

  // Students are fetched from the authenticated backend API.
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [searchId, setSearchId] = useState("");
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verification, setVerification] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [revokingId, setRevokingId] = useState("");
  const [issuedCertificate, setIssuedCertificate] =
    useState<Certificate | null>(null);
  const [selectedQrCertificate, setSelectedQrCertificate] =
    useState<Certificate | null>(null);
  const [message, setMessage] = useState("");

  // QR codes must open the public verification page, not merely contain a certificate ID.
  // Using the current origin also supports a LAN hostname/IP when the app is opened that way.
  function getCertificateVerificationUrl(certificateId: string) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    return `${origin}/verify?id=${encodeURIComponent(certificateId)}`;
  }

  function downloadQrCode(svgId: string, certificateId: string) {
    const svg = document.getElementById(svgId);

    if (!svg) {
      window.alert("QR code is not available to download.");
      return;
    }

    const serializer = new XMLSerializer();
    const svgText = serializer.serializeToString(svg);
    const blob = new Blob([svgText], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${certificateId}-verification-QR.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Revoke after the browser has had a chance to start the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  useEffect(() => {
    const token = localStorage.getItem("blockcert_token");
    const savedUser = localStorage.getItem("blockcert_user");

    if (!token || !savedUser) {
      router.replace("/institution/login");
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (user.role !== "institution") {
        router.replace("/student/dashboard");
        return;
      }

      setAuthChecked(true);
      void fetchInstitutionCertificates();
      void fetchInstitutionStudents();
      setLoaded(true);
    } catch {
      localStorage.removeItem("blockcert_token");
      localStorage.removeItem("blockcert_user");
      router.replace("/institution/login");
    }
  }, [router]);

  function mapApiCertificate(item: ApiCertificate): Certificate {
    return {
      id: item.certificateId,
      studentId: item.student?._id || "",
      studentName: item.student?.studentName || "Unknown student",
      registerNumber: item.student?.registerNumber || "—",
      email: item.student?.email || "",
      department: item.department,
      course: item.course,
      issueDate: new Date(item.issueDate).toLocaleDateString("en-IN"),
      hash: item.documentHash,
      fileName: item.fileName,
      fileUrl: item.fileUrl,
      qrCodeData: getCertificateVerificationUrl(item.certificateId),
      status: item.status,
      blockchainTransaction: item.blockchainTransaction || null,
    };
  }

  async function fetchInstitutionCertificates() {
    const token = localStorage.getItem("blockcert_token");

    if (!token) {
      setCertificatesError("Your login session was not found. Please sign in again.");
      setCertificates([]);
      return;
    }

    setCertificatesLoading(true);
    setCertificatesError("");

    try {
      const response = await fetch("http://localhost:5000/api/certificates/institution", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to fetch certificates.");
      const records: ApiCertificate[] = Array.isArray(data.certificates) ? data.certificates : [];
      setCertificates(records.map(mapApiCertificate));
    } catch (error) {
      setCertificatesError(error instanceof Error ? error.message : "Unable to load certificates.");
    } finally {
      setCertificatesLoading(false);
    }
  }
  async function fetchInstitutionTransactionHistory() {
  const token = localStorage.getItem("blockcert_token");

  if (!token) {
    setTransactionsError("Login session not found. Please sign in again.");
    setTransactions([]);
    return;
  }

  setTransactionsLoading(true);
  setTransactionsError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/certificates/institution/transactions",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to fetch transactions.");
    }

    setTransactions(
      Array.isArray(data.transactions) ? data.transactions : []
    );
  } catch (error) {
    setTransactionsError(
      error instanceof Error
        ? error.message
        : "Unable to load transaction history."
    );
  } finally {
    setTransactionsLoading(false);
  }
}
  async function copyTransactionHash(hash: string) {
    try {
      await navigator.clipboard.writeText(hash);
      window.alert("Transaction hash copied successfully!");
    } catch {
      window.alert("Unable to copy transaction hash.");
    }
  }

  async function fetchInstitutionStudents() {
    const token = localStorage.getItem("blockcert_token");

    if (!token) {
      setStudentsError("Your login session was not found. Please sign in again.");
      setStudents([]);
      return;
    }

    setStudentsLoading(true);
    setStudentsError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/students/institution",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch students.");
      }

      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (error) {
      setStudentsError(
        error instanceof Error
          ? error.message
          : "Unable to load students from the server."
      );
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }

  const filteredStudents = students.filter((student) => {
    const search = studentSearch.trim().toLowerCase();

    if (!search) return true;

    return [
      student.studentName,
      student.registerNumber,
      student.email,
      student.department,
      student.course,
      student.batch || "",
    ].some((value) => value.toLowerCase().includes(search));
  });

  async function generateHash(file: File) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function handleIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIssuedCertificate(null);

    if (!selectedStudentId) {
      setMessage("Please select a registered student.");
      return;
    }
    if (!selectedFile) {
      setMessage("Please upload a PDF certificate.");
      return;
    }
    if (selectedFile.type !== "application/pdf" || !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setMessage("Only PDF files are accepted.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("Please upload a PDF smaller than 5 MB.");
      return;
    }

    const token = localStorage.getItem("blockcert_token");
    if (!token) {
      setMessage("Your login session was not found. Please sign in again.");
      return;
    }

    setIsIssuing(true);
    try {
      const formData = new FormData();
      formData.append("studentId", selectedStudentId);
      formData.append("certificateTitle", `${course} Certificate`);
      formData.append("course", course);
      formData.append("department", department);
      formData.append("certificate", selectedFile);

      const response = await fetch("http://localhost:5000/api/certificates/issue", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to issue certificate.");

      const apiCertificate = data.certificate as ApiCertificate;
      const certificate: Certificate = {
        id: apiCertificate.certificateId,
        studentId: selectedStudentId,
        studentName,
        registerNumber,
        email,
        department,
        course,
        issueDate: new Date(apiCertificate.issueDate).toLocaleDateString("en-IN"),
        hash: apiCertificate.documentHash,
        fileName: apiCertificate.fileName,
        fileUrl: apiCertificate.fileUrl,
        qrCodeData: getCertificateVerificationUrl(apiCertificate.certificateId),
        status: apiCertificate.status,
        blockchainTransaction: apiCertificate.blockchainTransaction || null,
      };

      setIssuedCertificate(certificate);
      setSelectedStudentId("");
      setStudentName("");
      setRegisterNumber("");
      setEmail("");
      setDepartment("");
      setCourse("");
      setSelectedFile(null);
      const fileInput = document.getElementById("certificateFile") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      setMessage("Certificate issued successfully. Its document hash has been recorded on the blockchain and the certificate is saved in MongoDB.");
      await fetchInstitutionCertificates();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to issue certificate.");
    } finally {
      setIsIssuing(false);
    }
  }

  
async function handleVerify(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setVerification("");

  const certificateId = searchId.trim();

  if (!certificateId) {
    setVerification("NOT_FOUND");
    return;
  }

  if (verifyFile) {
    if (
      verifyFile.type !== "application/pdf" ||
      !verifyFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setVerification("INVALID_FILE");
      return;
    }

    if (verifyFile.size > 5 * 1024 * 1024) {
      setVerification("INVALID_FILE");
      return;
    }
  }

  try {
    const formData = new FormData();
    formData.append("certificateId", certificateId);

    if (verifyFile) {
      formData.append("certificate", verifyFile);
    }

    const response = await fetch(
      "http://localhost:5000/api/certificates/verify",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.status) {
      setVerification(data.status);
    } else if (response.status === 404) {
      setVerification("NOT_FOUND");
    } else {
      setVerification("ERROR");
    }
  } catch (error) {
    console.error("Certificate verification failed:", error);
    setVerification("ERROR");
  }
}
  async function revokeCertificate(certificateId: string) {
    const enteredReason = window.prompt(
      "Enter the reason for revoking this certificate:"
    );

    if (enteredReason === null) return;

    const revocationReason = enteredReason.trim();
    if (!revocationReason) {
      window.alert("Please enter a reason before revoking the certificate.");
      return;
    }

    if (!window.confirm(
      `Are you sure you want to revoke certificate ${certificateId}? This action cannot be undone.`
    )) return;

    const token = localStorage.getItem("blockcert_token");
    if (!token) {
      window.alert("Your login session was not found. Please sign in again.");
      router.replace("/institution/login");
      return;
    }

    setRevokingId(certificateId);
    try {
      const response = await fetch(
        "http://localhost:5000/api/certificates/revoke",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ certificateId, revocationReason }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to revoke certificate.");
      }

      await fetchInstitutionCertificates();
      window.alert("Certificate revoked successfully.");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to revoke certificate."
      );
    } finally {
      setRevokingId("");
    }
  }
  const selectedLifecycleCertificate = certificates.find(
  (item) => item.id === selectedLifecycleCertificateId
);

const selectedLifecycleTransactions = transactions.filter(
  (item) => item.certificateId === selectedLifecycleCertificateId
);

const hasIssueTransaction = selectedLifecycleTransactions.some(
  (item) =>
    item.transactionType === "ISSUE" &&
    item.transactionStatus === "SUCCESS"
);

const hasRevokeTransaction = selectedLifecycleTransactions.some(
  (item) =>
    item.transactionType === "REVOKE" &&
    item.transactionStatus === "SUCCESS"
);
  const total = certificates.length;
  const issued = certificates.filter(
    (item) => item.status === "Issued"
  ).length;
  const revoked = certificates.filter(
    (item) => item.status === "Revoked"
  ).length;

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Issue Certificate", icon: FilePlus2 },
    { name: "All Certificates", icon: Files },
    { name: "Verify Certificate", icon: ShieldCheck },
    { name: "Students", icon: Users },
    { name: "Blockchain Records", icon: Link2 },
  ];

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-blue-700">
          Checking institution access...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="flex w-64 shrink-0 flex-col bg-slate-950 p-5 text-white">
          <div className="mb-10">
            <h1 className="text-2xl font-bold">
              BlockCert<span className="text-blue-400">.</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Blockchain Certificate System
            </p>
          </div>

          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          <nav className="flex flex-col gap-2">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActivePage(item.name);
                    setMessage("");
                    setVerification("");
                    setIssuedCertificate(null);

                    if (item.name === "Students" || item.name === "Issue Certificate") {
                      if (item.name === "Students") setStudentSearch("");
                      void fetchInstitutionStudents();
                    }
                    if (item.name === "All Certificates" || item.name === "Dashboard" || item.name === "Blockchain Records") {
                      void fetchInstitutionCertificates();
                    }
                    if (item.name === "Blockchain Records") {
                      void fetchInstitutionTransactionHistory();
}
                  }}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
                    activePage === item.name
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-xl bg-slate-900 p-4">
            <p className="text-sm font-semibold">Blockchain Network</p>
            <p className="mt-2 text-xs text-green-400">
              ● Local development mode
            </p>
            <p className="mt-2 text-xs text-green-400">
              Connected to local Hardhat network
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1 p-5 md:p-8">

          {/* HEADER */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Institution Administration
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {activePage}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage and verify academic certificates securely.
              </p>
            </div>

            <div className="flex items-center gap-4">
  <div className="rounded-xl border bg-white px-5 py-3 shadow-sm">
    <p className="font-semibold">Administrator</p>
    <p className="text-xs text-slate-500">Institution Admin</p>
  </div>

  <button
    onClick={() => {
      localStorage.removeItem("blockcert_token");
      localStorage.removeItem("blockcert_user");
      router.replace("/institution/login");
    }}
    className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
  >
    Logout
  </button>
</div>
          </header>

          {/* DASHBOARD */}
          {activePage === "Dashboard" && (
            <>
              <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: "Total Certificates",
                    value: total,
                    icon: Files,
                  },
                  {
                    title: "Active Certificates",
                    value: issued,
                    icon: ShieldCheck,
                  },
                  {
                    title: "Registered Students",
                    value: students.length,
                    icon: GraduationCap,
                  },
                  {
                    title: "Revoked Certificates",
                    value: revoked,
                    icon: AlertCircle,
                  },
                ].map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.title}
                      className="rounded-xl border bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                          {stat.title}
                        </p>
                        <Icon className="text-blue-600" size={23} />
                      </div>
                      <h3 className="mt-4 text-3xl font-bold">
                        {loaded ? stat.value : "..."}
                      </h3>
                      <p className="mt-2 text-xs text-slate-400">
                        Live application data
                      </p>
                    </div>
                  );
                })}
              </section>

              <section className="mt-8 rounded-xl bg-blue-700 p-7 text-white">
                <h3 className="text-xl font-bold">
                  Secure Certificate Management
                </h3>
                <p className="mt-2 max-w-xl text-sm text-blue-100">
                  Issue academic certificates, generate unique QR codes
                  and check certificate authenticity.
                </p>
                <button
                  onClick={() => setActivePage("Issue Certificate")}
                  className="mt-5 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700"
                >
                  + Issue New Certificate
                </button>
              </section>

              <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">
                  Recent Certificates
                </h3>
                <p className="mb-5 text-sm text-slate-500">
                  Recently issued academic certificates
                </p>

                <CertificateTable
                  certificates={certificates.slice(0, 5)}
                  onRevoke={revokeCertificate}
                  onViewQr={setSelectedQrCertificate}
                  revokingId={revokingId}
                />

                {certificates.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No certificates found in MongoDB. Start by issuing your first certificate.
                  </p>
                )}
              </section>
            </>
          )}

          {/* ISSUE CERTIFICATE */}
          {activePage === "Issue Certificate" && (
            <section className="mx-auto max-w-4xl rounded-xl border bg-white p-6 shadow-sm md:p-8">
              <div className="mb-7">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
                    <FilePlus2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      Issue New Certificate
                    </h3>
                    <p className="text-sm text-slate-500">
                      Enter student details and upload the certificate PDF.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleIssue} className="space-y-6">

                <div>
                  <h4 className="mb-4 font-semibold">
                    Student Information
                  </h4>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FormField label="Select Registered Student">
                        <select
                          required
                          value={selectedStudentId}
                          onChange={(e) => {
                            const selected = students.find((item) => item._id === e.target.value);
                            setSelectedStudentId(e.target.value);
                            setStudentName(selected?.studentName || "");
                            setRegisterNumber(selected?.registerNumber || "");
                            setEmail(selected?.email || "");
                            setDepartment(selected?.department || "");
                            setCourse(selected?.course || "");
                          }}
                          className="form-input"
                        >
                          <option value="">Choose a student</option>
                          {students.filter((item) => item.isActive).map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.studentName} — {item.registerNumber}
                            </option>
                          ))}
                        </select>
                        {studentsLoading && <p className="mt-2 text-xs text-slate-500">Loading registered students...</p>}
                        {studentsError && <p className="mt-2 text-xs text-red-600">{studentsError}</p>}
                        {!studentsLoading && students.length === 0 && !studentsError && (
                          <p className="mt-2 text-xs text-amber-600">No registered students found. Register a student first.</p>
                        )}
                      </FormField>
                    </div>

                    <FormField label="Student Full Name">
                      <input readOnly value={studentName} placeholder="Selected student name" className="form-input bg-slate-50" />
                    </FormField>
                    <FormField label="Register Number">
                      <input readOnly value={registerNumber} placeholder="Register number" className="form-input bg-slate-50" />
                    </FormField>
                    <FormField label="Email Address">
                      <input readOnly value={email} placeholder="Student email" className="form-input bg-slate-50" />
                    </FormField>
                    <FormField label="Department">
                      <input readOnly value={department} placeholder="Department" className="form-input bg-slate-50" />
                    </FormField>
                    <div className="md:col-span-2">
                      <FormField label="Course / Degree">
                        <input readOnly value={course} placeholder="Course" className="form-input bg-slate-50" />
                      </FormField>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="mb-4 font-semibold">
                    Upload Certificate
                  </h4>

                  <label
                    htmlFor="certificateFile"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center hover:border-blue-500"
                  >
                    <UploadCloud size={38} className="text-blue-600" />
                    <p className="mt-3 font-semibold">
                      Click to upload certificate PDF
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      PDF format only · Maximum size 5 MB
                    </p>
                    <input
                      id="certificateFile"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>

                  {selectedFile && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                      <FileCheck2 size={19} />
                      {selectedFile.name}
                    </div>
                  )}
                </div>

                {message && (
                  <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                    {message}
                  </p>
                )}

                <button
                  disabled={isIssuing}
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isIssuing ? "Uploading and Issuing..." : "Issue Certificate"}
                  <ArrowRight size={18} />
                </button>
              </form>

              {issuedCertificate && (
                <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 size={23} />
                    <h3 className="font-bold">
                      Certificate Issued Successfully!
                    </h3>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div className="space-y-3 text-sm">
                      <p>
                        <strong>Certificate ID:</strong>
                        <br />
                        {issuedCertificate.id}
                      </p>
                      <p>
                        <strong>Student:</strong>
                        <br />
                        {issuedCertificate.studentName}
                      </p>
                      <p>
                        <strong>SHA-256 Hash:</strong>
                        <br />
                        <span className="break-all text-xs">
                          {issuedCertificate.hash}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-lg bg-white p-4">
                      <QRCodeSVG
                        id="newly-issued-certificate-qr"
                        value={issuedCertificate.qrCodeData}
                        size={170}
                        level="H"
                        includeMargin
                      />
                      <p className="mt-3 text-xs font-semibold">
                        Scan to Verify Certificate
                      </p>
                      <p className="mt-1 break-all text-center text-xs text-slate-500">
                        {issuedCertificate.id}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          downloadQrCode(
                            "newly-issued-certificate-qr",
                            issuedCertificate.id
                          )
                        }
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        <Download size={15} />
                        Download QR
                      </button>
                      <a
                        href={issuedCertificate.qrCodeData}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 text-xs font-semibold text-blue-700 hover:underline"
                      >
                        Open verification page
                      </a>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-green-700">
                    Certificate details are saved in MongoDB and the SHA-256 hash is recorded on the local blockchain.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* ALL CERTIFICATES */}
          {activePage === "All Certificates" && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-bold">
                All Certificates
              </h3>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">Manage all certificates saved in MongoDB.</p>
                <button type="button" onClick={() => void fetchInstitutionCertificates()} disabled={certificatesLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {certificatesLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              {certificatesError && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{certificatesError}</p>}

              <CertificateTable
                certificates={certificates}
                onRevoke={revokeCertificate}
                onViewQr={setSelectedQrCertificate}
                revokingId={revokingId}
              />

              {certificates.length === 0 && (
                <p className="py-10 text-center text-slate-400">
                  No certificates available.
                </p>
              )}
            </section>
          )}

          {/* VERIFY CERTIFICATE */}
          {activePage === "Verify Certificate" && (
            <section className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow-sm md:p-8">
              <div className="mb-7 text-center">
                <ShieldCheck
                  size={48}
                  className="mx-auto text-blue-600"
                />
                <h3 className="mt-3 text-xl font-bold">
                  Verify Academic Certificate
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Enter a Certificate ID and optionally upload its PDF.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5">
                <FormField label="Certificate ID">
                  <input
                    required
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Example: BC-123456789"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Upload certificate PDF (optional)">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) =>
                      setVerifyFile(e.target.files?.[0] || null)
                    }
                    className="block w-full rounded-lg border p-3 text-sm"
                  />
                </FormField>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <Search size={18} />
                  Verify Certificate
                </button>
              </form>

              
{verification && (
  <div className="mt-6 rounded-xl border p-5">
    {verification === "AUTHENTIC" && (
      <div className="text-green-700">
        <CheckCircle2 size={30} />
        <h3 className="mt-2 text-lg font-bold">
          Certificate Authentic
        </h3>
        <p className="mt-1 text-sm">
          The uploaded certificate matches the original document hash
          and is verified on the blockchain.
        </p>
      </div>
    )}

    {verification === "TAMPERED" && (
      <div className="text-red-700">
        <AlertCircle size={30} />
        <h3 className="mt-2 text-lg font-bold">
          Tampering Detected!
        </h3>
        <p className="mt-1 text-sm">
          The uploaded PDF does not match the original certificate hash.
          The document may have been modified.
        </p>
      </div>
    )}

    {verification === "NOT_FOUND" && (
      <div className="text-red-700">
        <AlertCircle size={30} />
        <h3 className="font-bold">Certificate Not Found</h3>
        <p className="text-sm">
          No matching certificate ID exists in the institution records.
        </p>
      </div>
    )}

    {verification === "REVOKED" && (
      <div className="text-red-700">
        <AlertCircle size={30} />
        <h3 className="font-bold">Certificate Revoked</h3>
        <p className="mt-1 text-sm">
          This certificate has been revoked and is no longer valid.
        </p>
      </div>
    )}

    {verification === "NOT_ON_BLOCKCHAIN" && (
      <div className="text-orange-700">
        <AlertCircle size={30} />
        <h3 className="font-bold">Blockchain Record Not Found</h3>
        <p className="mt-1 text-sm">
          This certificate does not have a matching blockchain registration.
        </p>
      </div>
    )}

    {verification === "BLOCKCHAIN_MISMATCH" && (
      <div className="text-red-700">
        <AlertCircle size={30} />
        <h3 className="font-bold">Blockchain Verification Failed</h3>
        <p className="mt-1 text-sm">
          The certificate details do not match the blockchain record.
        </p>
      </div>
    )}

    {verification === "INVALID_FILE" && (
      <div className="text-red-700">
        <AlertCircle size={24} />
        <p className="mt-2 font-semibold">
          Invalid PDF File
        </p>
        <p className="text-sm">
          Please upload a valid PDF file smaller than 5 MB.
        </p>
      </div>
    )}

    {verification === "ERROR" && (
      <div className="text-red-700">
        <AlertCircle size={24} />
        <p className="mt-2 font-semibold">
          Verification Failed
        </p>
        <p className="text-sm">
          Unable to verify the certificate. Check that the backend server is running.
        </p>
      </div>
    )}
  </div>
)}

            </section>
          )}

          {/* STUDENTS */}
          {activePage === "Students" && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Registered Students</h3>
                  <p className="text-sm text-slate-500">
                    Students registered with your institution in MongoDB.
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  Total Students: {students.length}
                </div>
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="search"
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Search by name, register number, email or course"
                    className="form-input pl-10"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void fetchInstitutionStudents()}
                  disabled={studentsLoading}
                  className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {studentsLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {studentsError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {studentsError}
                </div>
              )}

              {studentsLoading ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  Loading students from MongoDB...
                </p>
              ) : studentsError ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Check your institution login and backend server, then select Refresh.
                </p>
              ) : filteredStudents.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  {students.length === 0
                    ? "No students are registered with this institution yet."
                    : "No students match your search."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="border-b bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Register Number</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Course</th>
                        <th className="p-3">Batch</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student._id} className="border-b last:border-0">
                          <td className="p-3 font-medium text-slate-800">
                            {student.studentName}
                          </td>
                          <td className="p-3">{student.registerNumber}</td>
                          <td className="p-3">{student.email}</td>
                          <td className="p-3">{student.department}</td>
                          <td className="p-3">{student.course}</td>
                          <td className="p-3">{student.batch || "—"}</td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                student.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {student.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* BLOCKCHAIN RECORDS */}
          {activePage === "Blockchain Records" && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mt-5 rounded-lg border bg-white p-4">
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Select Certificate to View Lifecycle
  </label>

  <select
    value={selectedLifecycleCertificateId}
    onChange={(e) => setSelectedLifecycleCertificateId(e.target.value)}
    className="w-full rounded-lg border p-3 text-sm outline-none focus:border-blue-500"
  >
    <option value="">Choose a certificate</option>

    {certificates.map((certificate) => (
      <option key={certificate.id} value={certificate.id}>
        {certificate.id} — {certificate.status}
      </option>
    ))}
  </select>
</div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Link2 className="text-blue-600" size={26} />
                  <div>
                    <h3 className="text-lg font-bold">Blockchain Records</h3>
                    <p className="text-sm text-slate-500">
                      Complete ISSUE, REVOKE and VERIFY transaction history.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => void fetchInstitutionTransactionHistory()}
                  disabled={transactionsLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {transactionsLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
                            <div className="mt-6 rounded-xl border bg-slate-50 p-5">
  <h4 className="mb-2 font-bold text-slate-800">
    Certificate Lifecycle
  </h4>

  {!selectedLifecycleCertificate ? (
    <p className="mt-4 text-sm text-slate-500">
      Select a certificate above to view its lifecycle.
    </p>
  ) : (
    <>
      <p className="mb-5 break-all text-xs text-slate-500">
        Certificate ID: {selectedLifecycleCertificate.id}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`rounded-lg px-4 py-3 text-center ${
            hasIssueTransaction
              ? "bg-green-100 text-green-700"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          <p className="text-sm font-bold">
            1. Certificate Created
          </p>
          <p className="mt-1 text-xs">
            {hasIssueTransaction ? "ISSUE recorded successfully" : "Not recorded"}
          </p>
        </div>

        <ArrowRight className="text-slate-400" size={22} />

        <div
          className={`rounded-lg px-4 py-3 text-center ${
            hasIssueTransaction
              ? "bg-green-100 text-green-700"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          <p className="text-sm font-bold">
            2. Blockchain Issued
          </p>
          <p className="mt-1 text-xs">
            {hasIssueTransaction ? "Blockchain transaction confirmed" : "Awaiting ISSUE transaction"}
          </p>
        </div>

        <ArrowRight className="text-slate-400" size={22} />

        <div
          className={`rounded-lg px-4 py-3 text-center ${
            hasRevokeTransaction
              ? "bg-red-100 text-red-700"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          <p className="text-sm font-bold">
            3. Certificate Revoked
          </p>
          <p className="mt-1 text-xs">
            {hasRevokeTransaction ? "REVOKE recorded successfully" : "Not revoked"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold">
        Current Certificate Status:{" "}
        <span
          className={
            selectedLifecycleCertificate.status === "Revoked"
              ? "text-red-600"
              : "text-green-600"
          }
        >
          {selectedLifecycleCertificate.status}
        </span>
      </p>
    </>
  )}
</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-slate-500">Total Transactions</p>
                  <h3 className="mt-2 text-2xl font-bold">{transactions.length}</h3>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-slate-500">Successful</p>
                  <h3 className="mt-2 text-2xl font-bold text-green-700">
                    {transactions.filter((item) => item.transactionStatus === "SUCCESS").length}
                  </h3>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-slate-500">Failed</p>
                  <h3 className="mt-2 text-2xl font-bold text-red-700">
                    {transactions.filter((item) => item.transactionStatus === "FAILED").length}
                  </h3>
                </div>
              </div>

              {transactionsError && (
                <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {transactionsError}
                </p>
              )}

              {transactionsLoading ? (
                <p className="py-10 text-center text-slate-500">
                  Loading blockchain transactions...
                </p>
              ) : transactions.length === 0 ? (
                <p className="py-10 text-center text-slate-400">
                  No blockchain transactions found.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {transactions.map((item) => (
                    <div key={item._id} className="rounded-xl border p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500">Certificate ID</p>
                          <p className="mt-1 break-all font-semibold">{item.certificateId}</p>
                        </div>

                        <div className="flex gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.transactionType === "ISSUE"
                              ? "bg-blue-100 text-blue-700"
                              : item.transactionType === "REVOKE"
                              ? "bg-red-100 text-red-700"
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {item.transactionType}
                          </span>

                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.transactionStatus === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : item.transactionStatus === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {item.transactionStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Block Number</p>
                          <p className="mt-1">{item.blockNumber ?? "—"}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-500">Network</p>
                          <p className="mt-1">{item.network || "Localhost"}</p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-slate-500">Transaction Hash</p>
                          <button type="button"
                          onClick={() => void copyTransactionHash(item.transactionHash)}
                           className="mt-1 break-all text-left text-xs text-blue-600 hover:underline"
                            title="Click to copy transaction hash"
>
                            {item.transactionHash || "Not available"}
                          </button>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-slate-500">Wallet Address</p>
                          <p className="mt-1 break-all text-xs">{item.walletAddress || "Not available"}</p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-slate-500">Contract Address</p>
                          <p className="mt-1 break-all text-xs">{item.contractAddress || "Not available"}</p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-slate-500">Document SHA-256</p>
                          <p className="mt-1 break-all text-xs">{item.documentHash || "Not available"}</p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-slate-500">Transaction Date</p>
                          <p className="mt-1">
                            {item.timestamp
                              ? new Date(item.timestamp).toLocaleString("en-IN")
                              : "Not available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}


          {/* SAVED CERTIFICATE QR CODE */}
          {selectedQrCertificate && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="saved-qr-title"
              onClick={() => setSelectedQrCertificate(null)}
            >
              <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 id="saved-qr-title" className="text-lg font-bold text-slate-900">
                      Certificate QR Code
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Scan this code to open the public verification page
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedQrCertificate(null)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Close QR code"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-6 flex justify-center rounded-xl border bg-white p-5">
                  <QRCodeSVG
                    id="saved-certificate-qr"
                    value={getCertificateVerificationUrl(selectedQrCertificate.id)}
                    size={220}
                    level="H"
                    includeMargin
                  />
                </div>

                <p className="mt-4 break-all text-center text-sm font-semibold text-slate-800">
                  {selectedQrCertificate.id}
                </p>
                <p className="mt-1 text-center text-xs text-slate-500">
                  {selectedQrCertificate.studentName}
                </p>
                <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
                  {getCertificateVerificationUrl(selectedQrCertificate.id)}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    downloadQrCode(
                      "saved-certificate-qr",
                      selectedQrCertificate.id
                    )
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Download size={18} />
                  Download QR Code
                </button>
              </div>
            </div>
          )}

          <footer className="mt-10 text-center text-xs text-slate-400">
            BlockCert © 2026 | Blockchain-Based Certificate Verification
          </footer>
        </main>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function CertificateTable({
  certificates,
  onRevoke,
  onViewQr,
  revokingId,
}: {
  certificates: Certificate[];
  onRevoke: (id: string) => void | Promise<void>;
  onViewQr: (certificate: Certificate) => void;
  revokingId: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">
        <thead>
          <tr className="border-b text-slate-500">
            <th className="p-3">Certificate ID</th>
            <th className="p-3">Student</th>
            <th className="p-3">Course</th>
            <th className="p-3">Issue Date</th>
            <th className="p-3">Blockchain</th>
            <th className="p-3">Block</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="p-3 font-medium">{item.id}</td>
              <td className="p-3">{item.studentName}</td>
              <td className="p-3">{item.course}</td>
              <td className="p-3">{item.issueDate}</td>
              <td className="p-3">
                {item.blockchainTransaction?.transactionStatus === "SUCCESS" ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Recorded</span>
                ) : (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">Unavailable</span>
                )}
              </td>
              <td className="p-3">{item.blockchainTransaction?.blockNumber ?? "—"}</td>
              <td className="p-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "Issued"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onViewQr(item)}
                    title="View or download certificate QR code"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <QrCode size={17} />
                    <span className="text-xs font-semibold">View QR</span>
                  </button>
                  {item.status === "Issued" && (
                    <button
                      type="button"
                      onClick={() => void onRevoke(item.id)}
                      disabled={revokingId === item.id}
                      title="Revoke certificate"
                      className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {revokingId === item.id ? (
                        <span className="text-xs font-semibold">...</span>
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
