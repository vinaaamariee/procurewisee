"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import { createPoFromAwardAction } from "@/app/actions/po";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Search, FileText, ArrowRight, Filter } from "lucide-react";
import { statusBadgeClass } from "@/lib/status-tone";

interface Supplier {
  id: number;
  companyName: string;
  businessAddress: string;
  tin: string | null;
}

interface Rfq {
  id: number;
  rfqNumber: string;
  title: string;
}

interface Canvas {
  id: number;
  rfqId: number;
  rfq: Rfq;
}

interface Quote {
  id: number;
  totalQuotedAmount: any;
}

interface Recommendation {
  id: number;
  supplierId: number;
  supplier: Supplier;
  supplierQuote: Quote;
  canvas: Canvas;
  compositeMcdmScore: any;
  rankPosition: number;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplier: { companyName: string };
  rfq: { rfqNumber: string } | null;
  totalCost: any;
  status: string;
  createdAt: Date | string;
  deliveryTerms?: string | null;
}

const ALL_STATUSES = ["All", "Draft", "Pending Approval", "Approved", "Sent to Supplier", "Partially Delivered", "Delivered", "Completed", "Cancelled", "Closed"];

function PoStatusBadge({ status }: { status: string }) {
  const cls = statusBadgeClass(status);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${cls}`}>
      {status}
    </span>
  );
}

function getSupplierInitials(name: string) {
  if (!name) return "SP";
  return name.split(/\s+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

interface PoDraftingClientProps {
  pendingAwards: Recommendation[];
  initialPos: PurchaseOrder[];
}

export default function PoDraftingClient({ pendingAwards, initialPos }: PoDraftingClientProps) {
  const router = useRouter();
  const [pos] = useState<PurchaseOrder[]>(initialPos);
  const [awards, setAwards] = useState<Recommendation[]>(pendingAwards);
  const [activeTab, setActiveTab] = useState<"registry" | "queue">("registry");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDraftPo = async (recId: number) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await createPoFromAwardAction(recId);
      if (res.success && res.po) {
        setSuccessMsg("Draft Purchase Order created. Redirecting…");
        setAwards(prev => prev.filter(a => a.id !== recId));
        router.push(`/dashboard/officer/po/${res.po.id}`);
      } else {
        setErrorMsg(res.error || "Failed to create Purchase Order.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: pos.length };
    for (const po of pos) {
      counts[po.status] = (counts[po.status] || 0) + 1;
    }
    return counts;
  }, [pos]);

  const filteredPos = useMemo(() => {
    return pos.filter(po => {
      const matchStatus = statusFilter === "All" || po.status === statusFilter;
      const searchLower = search.toLowerCase();
      const matchSearch =
        !search ||
        po.poNumber.toLowerCase().includes(searchLower) ||
        po.supplier.companyName.toLowerCase().includes(searchLower) ||
        (po.rfq?.rfqNumber.toLowerCase().includes(searchLower) ?? false);
      return matchStatus && matchSearch;
    });
  }, [pos, search, statusFilter]);

  // Only show tabs that have data or are "All"
  const activeStatuses = ALL_STATUSES.filter(s => s === "All" || (statusCounts[s] ?? 0) > 0);

  return (
    <div className="space-y-6">

      {/* Top tabs: PO Registry | Pending Awards */}
      <div className="flex gap-3 border-b border-[var(--border)] pb-3">
        <button
          onClick={() => setActiveTab("registry")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === "registry"
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          Purchase Orders ({pos.length})
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition relative ${
            activeTab === "queue"
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          Approved Awards ({awards.length})
          {awards.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--secondary-dim)]0 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {awards.length}
            </span>
          )}
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <Card className="p-4 border-[var(--border-accent)] bg-[var(--accent-glass)] dark:bg-[var(--accent-glass)]">
          <span className="text-sm font-semibold text-[var(--accent)]">⚠ {errorMsg}</span>
        </Card>
      )}
      {successMsg && (
        <Card className="p-4 border-[var(--border-accent)] bg-[var(--accent-glass)] dark:bg-[var(--accent-glass)]">
          <span className="text-sm font-semibold text-[var(--accent)]">✅ {successMsg}</span>
        </Card>
      )}

      {/* ── QUEUE TAB ── */}
      {activeTab === "queue" ? (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
            Awarded RFQs Pending PO Drafting
          </h2>
          {awards.length === 0 ? (
            <EmptyState
              preset="rfq"
              title="No Pending RFQ Awards"
              description="All awarded RFQs have been converted to Purchase Orders."
              compact
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {awards.map(award => (
                <Card key={award.id} className="p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-[var(--text-muted)]">RFQ Reference</span>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{award.canvas.rfq.rfqNumber}</h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{award.canvas.rfq.title}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Awarded Supplier</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-7 w-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                          {getSupplierInitials(award.supplier.companyName)}
                        </div>
                        <div className="text-sm font-semibold text-[var(--accent)]">{award.supplier.companyName}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                      <div>
                        <span className="text-xs text-[var(--text-muted)]">Total Amount</span>
                        <div className="text-sm font-bold">
                          ₱{Number(award.supplierQuote.totalQuotedAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDraftPo(award.id)}
                        disabled={isProcessing}
                        className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                      >
                        Draft PO <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <>
          {/* ── REGISTRY TAB ── */}

          {/* Search + Filter bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search PO number, supplier, or RFQ…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  {activeStatuses.map(s => (
                    <option key={s} value={s}>
                      {s} {s !== "All" && statusCounts[s] ? `(${statusCounts[s]})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            {activeStatuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                  statusFilter === s
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {s} {statusCounts[s] ? `· ${statusCounts[s]}` : ""}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filteredPos.length === 0 ? (
            <EmptyState
              preset="purchase-orders"
              title="No Purchase Orders Found"
              description="No purchase orders match your filters. Try adjusting the status filter or search."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPos.map(po => (
                <Link key={po.id} href={`/dashboard/officer/po/${po.id}`} className="group">
                  <Card className="p-5 transition hover:-translate-y-1 hover:shadow-md h-full">
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-[var(--accent)] font-mono">{po.poNumber}</span>
                        <PoStatusBadge status={po.status} />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-xs font-black flex-shrink-0">
                          {getSupplierInitials(po.supplier.companyName)}
                        </div>
                        <div className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">
                          {po.supplier.companyName}
                        </div>
                      </div>

                      {po.rfq && (
                        <div className="text-xs text-[var(--text-muted)]">
                          RFQ: <span className="font-semibold text-[var(--text-primary)]">{po.rfq.rfqNumber}</span>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3">
                        <div className="text-xs text-[var(--text-muted)]">
                          {new Date(po.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                          ₱{Number(po.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
