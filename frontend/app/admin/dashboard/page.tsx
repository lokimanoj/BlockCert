"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  LayoutDashboard,
  Users,
  Power,
  Search,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Blocks,
  Hash,
} from "lucide-react";

const API = "http://localhost:5000/api";

type Institution = {
  _id: string;
  institutionName: string;
  institutionCode: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  rejectionReason?: string;
};

type AdminCertificate = {
  _id: string;
  certificateId: string;
  title: string;
  course: string;
  department: string;
  issueDate: string;
  expiryDate?: string | null;
  documentHash: string;
  status: "Issued" | "Revoked";
  revokedAt?: string | null;
  revocationReason?: string;
  student?: {
    name?: string;
    studentName?: string;
    registerNumber?: string;
    email?: string;
  } | string | null;
  institution?: {
    institutionName?: string;
    institutionCode?: string;
    email?: string;
  } | string | null;
  blockchainTransaction?: {
    transactionHash?: string;
    blockNumber?: number;
    network?: string;
    transactionStatus?: string;
  } | string | null;
};

type BlockchainTransaction = {
  _id?: string;
  transactionHash?: string;
  certificateId?: string;
  blockNumber?: number;
  walletAddress?: string;
  contractAddress?: string;
  network?: string;
  transactionType?: string;
  transactionStatus?: string;
  timestamp?: string;
  createdAt?: string;
  certificate?: {
    certificateId?: string;
    status?: string;
    course?: string;
    department?: string;
    issueDate?: string;
  } | string;
};

type FilterType =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "inactive";

type ViewType = "dashboard" | "institutions" | "certificates" | "blockchain";

export default function AdminDashboard() {
  const router = useRouter();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [transactionError, setTransactionError] = useState("");
  const [adminName, setAdminName] = useState("System Admin");

  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);

  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [certificateSearch, setCertificateSearch] = useState("");
  const [selectedCertificate, setSelectedCertificate] =
    useState<AdminCertificate | null>(null);

  // Fetch institutions
  const fetchInstitutions = useCallback(async () => {
    
    const token = localStorage.getItem("blockcert_token");
    const storedUser = localStorage.getItem("blockcert_user");

    if (!token || !storedUser) {
      router.replace("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "admin") {
        router.replace("/");
        return;
      }

      setAdminName(user.name || "System Admin");

      const response = await fetch(`${API}/admin/institutions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("blockcert_token");
          localStorage.removeItem("blockcert_user");
          router.replace("/admin/login");
          return;
        }

        throw new Error(data.message || "Unable to load institutions");
      }

      setInstitutions(data.institutions || []);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch blockchain transactions
  const fetchTransactions = useCallback(async () => {
    const token = localStorage.getItem("blockcert_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setTransactionLoading(true);
      setTransactionError("");

      const response = await fetch(
        `${API}/admin/blockchain-transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load blockchain records"
        );
      }

      setTransactions(data.transactions || data.records || []);
    } catch (err) {
      setTransactionError(
        err instanceof Error
          ? err.message
          : "Unable to load blockchain records"
      );
    } finally {
      setTransactionLoading(false);
    }
  }, [router]);

  // Fetch all certificates for administrator
  const fetchCertificates = useCallback(async () => {
    const token = localStorage.getItem("blockcert_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setCertificateLoading(true);
      setCertificateError("");

      const response = await fetch(`${API}/admin/certificates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load certificates");
      }

      setCertificates(data.certificates || []);
    } catch (err) {
      setCertificateError(
        err instanceof Error ? err.message : "Unable to load certificates"
      );
    } finally {
      setCertificateLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchInstitutions();
    fetchTransactions();
    fetchCertificates();
  }, [fetchInstitutions, fetchTransactions, fetchCertificates]);
  // Approve or reject an institution
  const handleInstitutionAction = async (
    institutionId: string,
    action: "approve" | "reject"
  ) => {
    const token = localStorage.getItem("blockcert_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    let rejectionReason = "";

    if (action === "reject") {
      const reason = window.prompt(
        "Enter the reason for rejecting this institution:"
      );

      if (reason === null) return;

      rejectionReason = reason.trim();

      if (!rejectionReason) {
        window.alert("Please provide a rejection reason.");
        return;
      }

      if (
        !window.confirm(
          "Are you sure you want to reject this institution?"
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          "Approve this institution registration?"
        )
      ) {
        return;
      }
    }

    try {
      setActionId(institutionId);

      const response = await fetch(
        `${API}/admin/institutions/${institutionId}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body:
            action === "reject"
              ? JSON.stringify({ rejectionReason })
              : JSON.stringify({}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Action failed");
      }

      window.alert(data.message);
      await fetchInstitutions();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setActionId("");
    }
  };

  // Activate or deactivate an institution
  const handleToggleStatus = async (
    institution: Institution
  ) => {
    const token = localStorage.getItem("blockcert_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const newStatus = !institution.isActive;

    const confirmed = window.confirm(
      newStatus
        ? `Activate ${institution.institutionName}?`
        : `Deactivate ${institution.institutionName}?`
    );

    if (!confirmed) return;

    try {
      setActionId(institution._id);

      const response = await fetch(
        `${API}/admin/institutions/${institution._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      window.alert(data.message);
      await fetchInstitutions();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setActionId("");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("blockcert_token");
    localStorage.removeItem("blockcert_user");
    router.replace("/admin/login");
  };

  // Institution statistics
  const pendingCount = institutions.filter(
    (item) => !item.isApproved && item.isActive
  ).length;

  const approvedCount = institutions.filter(
    (item) => item.isApproved && item.isActive
  ).length;

  const rejectedCount = institutions.filter(
    (item) => !item.isApproved && !item.isActive
  ).length;

  const inactiveCount = institutions.filter(
    (item) => item.isApproved && !item.isActive
  ).length;

  const successfulTransactions = transactions.filter(
    (item) =>
      (item.transactionStatus || "").toUpperCase() === "SUCCESS"
  ).length;

  // Search and filter institutions
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((item) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        item.institutionName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.institutionCode.toLowerCase().includes(query);

      let matchesFilter = true;

      switch (filter) {
        case "pending":
          matchesFilter = !item.isApproved && item.isActive;
          break;

        case "approved":
          matchesFilter = item.isApproved && item.isActive;
          break;

        case "rejected":
          matchesFilter = !item.isApproved && !item.isActive;
          break;

        case "inactive":
          matchesFilter = item.isApproved && !item.isActive;
          break;

        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [institutions, search, filter]);

  const filteredCertificates = certificates.filter((certificate) => {
    const query = certificateSearch.trim().toLowerCase();
    const student =
      typeof certificate.student === "object" && certificate.student
        ? certificate.student.name || certificate.student.studentName || certificate.student.registerNumber || ""
        : certificate.student || "";
    const institution =
      typeof certificate.institution === "object" && certificate.institution
        ? certificate.institution.institutionName || ""
        : certificate.institution || "";
    return (
      certificate.certificateId.toLowerCase().includes(query) ||
      (certificate.title || "").toLowerCase().includes(query) ||
      (certificate.course || "").toLowerCase().includes(query) ||
      String(student).toLowerCase().includes(query) ||
      String(institution).toLowerCase().includes(query)
    );
  });

  const issuedCertificateCount = certificates.filter(
    (certificate) => certificate.status === "Issued"
  ).length;
  const revokedCertificateCount = certificates.filter(
    (certificate) => certificate.status === "Revoked"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <RefreshCw className="mr-3 animate-spin" />
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-900 p-6 md:block">
        <div className="mb-12 flex items-center gap-3">
          <ShieldCheck className="text-blue-400" size={32} />

          <div>
            <h1 className="text-xl font-bold">BlockCert</h1>
            <p className="text-xs text-slate-400">
              Admin Portal
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <SidebarButton
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
            icon={<LayoutDashboard size={19} />}
          >
            Dashboard
          </SidebarButton>

          <SidebarButton
            active={activeView === "institutions"}
            onClick={() => setActiveView("institutions")}
            icon={<Building2 size={19} />}
          >
            Institutions
          </SidebarButton>

          <SidebarButton
            active={activeView === "certificates"}
            onClick={() => {
              setActiveView("certificates");
              fetchCertificates();
            }}
            icon={<Hash size={19} />}
          >
            Certificates
          </SidebarButton>

          <SidebarButton
            active={activeView === "blockchain"}
            onClick={() => {
              setActiveView("blockchain");
              fetchTransactions();
            }}
            icon={<Blocks size={19} />}
          >
            Blockchain Records
          </SidebarButton>
        </div>

        <button
          onClick={handleLogout}
          className="absolute bottom-8 left-6 flex items-center gap-3 text-sm text-red-400 hover:text-red-300"
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="px-5 py-8 md:ml-64 md:px-10">

        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              System Administration
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              {activeView === "dashboard"
                ? "Admin Dashboard"
                : activeView === "institutions"
                ? "Institution Management"
                : activeView === "certificates"
                ? "Certificate Management"
                : "Blockchain Records"}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Welcome, {adminName}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setLoading(true);
                fetchInstitutions();
                fetchTransactions();
                fetchCertificates();
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm hover:bg-slate-800"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-500"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Dashboard */}
        {activeView === "dashboard" && (
          <>
            <section className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Institutions"
                value={institutions.length}
                icon={<Building2 size={23} />}
              />

              <StatCard
                title="Pending Approvals"
                value={pendingCount}
                icon={<Clock size={23} />}
              />

              <StatCard
                title="Approved / Active"
                value={approvedCount}
                icon={<CheckCircle size={23} />}
              />

              <StatCard
                title="Rejected Institutions"
                value={rejectedCount}
                icon={<XCircle size={23} />}
              />
            </section>

            <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Institution Overview
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Manage registrations and institution access.
                  </p>
                </div>

                <button
                  onClick={() => setActiveView("institutions")}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
                >
                  Manage Institutions
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <SummaryCard
                  label="Pending"
                  value={pendingCount}
                />

                <SummaryCard
                  label="Inactive"
                  value={inactiveCount}
                />

                <SummaryCard
                  label="Approved"
                  value={approvedCount}
                />
              </div>

              <div className="mt-7 border-t border-slate-800 pt-6">
                <p className="text-sm text-slate-400">
                  You currently manage {institutions.length} registered
                  institutions in BlockCert.
                </p>
              </div>
            </section>

            {/* Blockchain overview */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold">
                    <Blocks className="text-blue-400" />
                    Blockchain Overview
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    View certificate-related blockchain transactions.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveView("blockchain");
                    fetchTransactions();
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
                >
                  View Blockchain Records
                </button>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <SummaryCard
                  label="Total Transactions"
                  value={transactions.length}
                />

                <SummaryCard
                  label="Successful Transactions"
                  value={successfulTransactions}
                />
              </div>
            </section>
          </>
        )}

        {/* Institution management */}
        {activeView === "institutions" && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">
                    Institution Management
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Search, review and manage registered institutions.
                  </p>
                </div>

                <button
                  onClick={() => setActiveView("dashboard")}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
                >
                  <ArrowLeft size={16} />
                  Dashboard
                </button>
              </div>

              {/* Search */}
              <div className="mt-6 flex items-center rounded-xl border border-slate-700 bg-slate-950 px-4">
                <Search size={19} className="text-slate-500" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search institution name, email or code..."
                  className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-slate-500"
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-slate-400 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="mt-5 flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All"],
                    ["pending", "Pending"],
                    ["approved", "Approved"],
                    ["rejected", "Rejected"],
                    ["inactive", "Inactive"],
                  ] as [FilterType, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      filter === value
                        ? "bg-blue-600 text-white"
                        : "border border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Showing {filteredInstitutions.length} of{" "}
                {institutions.length} institutions
              </p>
            </div>

            {/* Institution table */}
            {filteredInstitutions.length === 0 ? (
              <div className="p-12 text-center">
                <Users
                  className="mx-auto mb-4 text-slate-500"
                  size={40}
                />

                <h4 className="font-semibold">
                  No matching institutions
                </h4>

                <p className="mt-2 text-sm text-slate-400">
                  Try changing your search or status filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="bg-slate-950/70 text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Institution</th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInstitutions.map((institution) => {
                      const pending =
                        !institution.isApproved &&
                        institution.isActive;

                      const approved = institution.isApproved;
                      const busy = actionId === institution._id;

                      return (
                        <tr
                          key={institution._id}
                          className="border-t border-slate-800 hover:bg-slate-800/40"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold">
                              {institution.institutionName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {institution.phone}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-slate-300">
                            {institution.institutionCode}
                          </td>

                          <td className="px-6 py-5 text-slate-300">
                            {institution.email}
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge institution={institution} />
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  setSelectedInstitution(institution)
                                }
                                className="flex items-center gap-1 rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/10"
                              >
                                <Eye size={14} />
                                Details
                              </button>

                              {pending ? (
                                <>
                                  <button
                                    disabled={busy}
                                    onClick={() =>
                                      handleInstitutionAction(
                                        institution._id,
                                        "approve"
                                      )
                                    }
                                    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold hover:bg-green-500 disabled:opacity-50"
                                  >
                                    {busy ? "Updating..." : "Approve"}
                                  </button>

                                  <button
                                    disabled={busy}
                                    onClick={() =>
                                      handleInstitutionAction(
                                        institution._id,
                                        "reject"
                                      )
                                    }
                                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold hover:bg-red-500 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : approved ? (
                                <button
                                  disabled={busy}
                                  onClick={() =>
                                    handleToggleStatus(institution)
                                  }
                                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                                    institution.isActive
                                      ? "bg-orange-600 hover:bg-orange-500"
                                      : "bg-green-600 hover:bg-green-500"
                                  }`}
                                >
                                  <Power size={13} />

                                  {busy
                                    ? "Updating..."
                                    : institution.isActive
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>
                              ) : (
                                <span className="px-2 py-2 text-xs text-slate-500">
                                  No action
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Certificate management */}
        {activeView === "certificates" && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">All Certificates</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    View certificates issued through BlockCert and their current status.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView("dashboard")}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
                >
                  <ArrowLeft size={16} /> Dashboard
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Total Certificates" value={certificates.length} />
                <SummaryCard label="Issued" value={issuedCertificateCount} />
                <SummaryCard label="Revoked" value={revokedCertificateCount} />
              </div>

              <div className="mt-6 flex items-center rounded-xl border border-slate-700 bg-slate-950 px-4">
                <Search size={19} className="text-slate-500" />
                <input
                  value={certificateSearch}
                  onChange={(event) => setCertificateSearch(event.target.value)}
                  placeholder="Search certificate ID, title, course, student or institution..."
                  className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-slate-500"
                />
                {certificateSearch && (
                  <button onClick={() => setCertificateSearch("")} aria-label="Clear search">
                    <X size={17} />
                  </button>
                )}
              </div>
            </div>

            {certificateError && (
              <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {certificateError}
              </div>
            )}

            {certificateLoading ? (
              <div className="flex items-center justify-center gap-3 p-12 text-slate-400">
                <RefreshCw className="animate-spin" size={18} />
                Loading certificates...
              </div>
            ) : filteredCertificates.length === 0 ? (
              <div className="p-12 text-center">
                <Hash className="mx-auto mb-4 text-slate-500" size={40} />
                <h4 className="font-semibold">No certificates found</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Certificates will appear here after they are issued.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-950/70 text-slate-400">
                    <tr>
                      <th className="px-5 py-4">Certificate ID</th>
                      <th className="px-5 py-4">Title</th>
                      <th className="px-5 py-4">Course</th>
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Institution</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificates.map((certificate) => {
                      const student =
                        typeof certificate.student === "object" && certificate.student
                          ? certificate.student.name || certificate.student.studentName || certificate.student.registerNumber || "—"
                          : certificate.student || "—";
                      const institution =
                        typeof certificate.institution === "object" && certificate.institution
                          ? certificate.institution.institutionName || "—"
                          : certificate.institution || "—";
                      return (
                        <tr key={certificate._id} className="border-t border-slate-800 hover:bg-slate-800/40">
                          <td className="px-5 py-4 font-mono text-xs text-slate-300">{certificate.certificateId}</td>
                          <td className="px-5 py-4 font-medium">{certificate.title || "—"}</td>
                          <td className="px-5 py-4 text-slate-300">{certificate.course || "—"}</td>
                          <td className="px-5 py-4 text-slate-300">{student}</td>
                          <td className="px-5 py-4 text-slate-300">{institution}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              certificate.status === "Issued"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}>
                              {certificate.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => setSelectedCertificate(certificate)}
                              className="flex items-center gap-1 rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/10"
                            >
                              <Eye size={14} /> Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Blockchain records */}
        {activeView === "blockchain" && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900">

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <Blocks className="text-blue-400" />
                  Blockchain Transaction Records
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  View the transaction history recorded by BlockCert.
                </p>
              </div>

              <button
                onClick={() => fetchTransactions()}
                disabled={transactionLoading}
                className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={transactionLoading ? "animate-spin" : ""}
                />
                Refresh Records
              </button>
            </div>

            <div className="grid gap-4 border-b border-slate-800 p-6 sm:grid-cols-3">
              <SummaryCard
                label="Total Transactions"
                value={transactions.length}
              />

              <SummaryCard
                label="Successful"
                value={successfulTransactions}
              />

              <SummaryCard
                label="Other Status"
                value={transactions.length - successfulTransactions}
              />
            </div>

            {transactionError && (
              <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {transactionError}
              </div>
            )}

            {transactionLoading ? (
              <div className="flex items-center justify-center gap-3 p-12 text-slate-400">
                <RefreshCw className="animate-spin" size={18} />
                Loading blockchain records...
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <Blocks
                  className="mx-auto mb-4 text-slate-500"
                  size={40}
                />

                <h4 className="font-semibold">
                  No blockchain transactions found
                </h4>

                <p className="mt-2 text-sm text-slate-400">
                  Transaction records will appear here after certificates
                  are issued or revoked.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-950/70 text-slate-400">
                    <tr>
                      <th className="px-5 py-4">Certificate ID</th>
                      <th className="px-5 py-4">Transaction</th>
                      <th className="px-5 py-4">Block</th>
                      <th className="px-5 py-4">Transaction Hash</th>
                      <th className="px-5 py-4">Network</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction, index) => {
                      const certificateId =
                        transaction.certificateId ||
                        (typeof transaction.certificate === "object"
                          ? transaction.certificate?.certificateId
                          : transaction.certificate) ||
                        "—";

                      const txStatus = (
                        transaction.transactionStatus || "UNKNOWN"
                      ).toUpperCase();

                      const txType = (
                        transaction.transactionType || "TRANSACTION"
                      ).toUpperCase();

                      const dateValue =
                        transaction.timestamp || transaction.createdAt;

                      return (
                        <tr
                          key={
                            transaction._id ||
                            transaction.transactionHash ||
                            index
                          }
                          className="border-t border-slate-800 hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4 font-medium text-slate-200">
                            {certificateId}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                              {txType}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {transaction.blockNumber ?? "—"}
                          </td>

                          <td className="px-5 py-4">
                            {transaction.transactionHash ? (
                              <span
                                className="font-mono text-xs text-slate-400"
                                title={transaction.transactionHash}
                              >
                                {`${transaction.transactionHash.slice(
                                  0,
                                  12
                                )}...${transaction.transactionHash.slice(-8)}`}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {transaction.network || "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                txStatus === "SUCCESS"
                                  ? "bg-green-500/10 text-green-400"
                                  : txStatus === "FAILED"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-yellow-500/10 text-yellow-300"
                              }`}
                            >
                              {txStatus}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-400">
                            {dateValue
                              ? new Date(dateValue).toLocaleString("en-IN")
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <footer className="mt-10 text-center text-xs text-slate-600">
          BlockCert System Administration Portal © 2026
        </footer>
      </main>

      {/* Institution details popup */}
      {selectedInstitution && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedInstitution(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Building2 size={25} />
                </div>

                <h3 className="text-xl font-bold">
                  Institution Details
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Complete registration information
                </p>
              </div>

              <button
                onClick={() => setSelectedInstitution(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-slate-950 p-4">
              <h4 className="text-lg font-bold">
                {selectedInstitution.institutionName}
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                Institution Code: {selectedInstitution.institutionCode}
              </p>

              <div className="mt-3">
                <StatusBadge institution={selectedInstitution} />
              </div>
            </div>

            <div className="space-y-4">
              <DetailRow
                icon={<Mail size={18} />}
                label="Email Address"
                value={selectedInstitution.email}
              />

              <DetailRow
                icon={<Phone size={18} />}
                label="Phone Number"
                value={selectedInstitution.phone}
              />

              <DetailRow
                icon={<MapPin size={18} />}
                label="Address"
                value={selectedInstitution.address}
              />

              {selectedInstitution.rejectionReason && (
                <DetailRow
                  icon={<XCircle size={18} />}
                  label="Rejection Reason"
                  value={selectedInstitution.rejectionReason}
                />
              )}

              {selectedInstitution.website && (
                <DetailRow
                  icon={<Building2 size={18} />}
                  label="Website"
                  value={selectedInstitution.website}
                />
              )}

              <DetailRow
                icon={<Calendar size={18} />}
                label="Registration Date"
                value={new Date(
                  selectedInstitution.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
            </div>

            <button
              onClick={() => setSelectedInstitution(null)}
              className="mt-7 w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Certificate details popup */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedCertificate(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Hash size={25} />
                </div>
                <h3 className="text-xl font-bold">Certificate Details</h3>
                <p className="mt-1 break-all text-sm text-slate-400">
                  {selectedCertificate.certificateId}
                </p>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close certificate details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={<Hash size={18} />} label="Certificate ID" value={selectedCertificate.certificateId || "—"} />
              <DetailRow icon={<Building2 size={18} />} label="Certificate Title" value={selectedCertificate.title || "—"} />
              <DetailRow icon={<Users size={18} />} label="Course" value={selectedCertificate.course || "—"} />
              <DetailRow icon={<Building2 size={18} />} label="Department" value={selectedCertificate.department || "—"} />
              <DetailRow icon={<Calendar size={18} />} label="Issue Date" value={selectedCertificate.issueDate ? new Date(selectedCertificate.issueDate).toLocaleDateString("en-IN") : "—"} />
              <DetailRow icon={<Calendar size={18} />} label="Expiry Date" value={selectedCertificate.expiryDate ? new Date(selectedCertificate.expiryDate).toLocaleDateString("en-IN") : "No expiry"} />
              <DetailRow icon={<CheckCircle size={18} />} label="Status" value={selectedCertificate.status || "—"} />
              <DetailRow icon={<Hash size={18} />} label="Document Hash" value={selectedCertificate.documentHash || "—"} />
            </div>

            {selectedCertificate.revocationReason && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-xs text-red-300">Revocation reason</p>
                <p className="mt-1 text-sm text-slate-200">{selectedCertificate.revocationReason}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedCertificate(null)}
              className="mt-7 w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sidebar button
function SidebarButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm ${
        active
          ? "bg-blue-600/15 text-blue-400"
          : "text-slate-400 hover:bg-slate-800"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// Institution status badge
function StatusBadge({
  institution,
}: {
  institution: Institution;
}) {
  let label = "Rejected";
  let style = "bg-red-500/10 text-red-400";

  if (institution.isApproved && institution.isActive) {
    label = "Approved / Active";
    style = "bg-green-500/10 text-green-400";
  } else if (institution.isApproved && !institution.isActive) {
    label = "Deactivated";
    style = "bg-orange-500/10 text-orange-400";
  } else if (!institution.isApproved && institution.isActive) {
    label = "Pending";
    style = "bg-yellow-500/10 text-yellow-400";
  }

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

// Dashboard statistic card
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-2 text-3xl font-bold">{value}</h3>
    </div>
  );
}

// Summary card
function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

// Institution detail row
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 text-blue-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="break-words text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
}