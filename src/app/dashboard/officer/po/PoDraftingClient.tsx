"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import { createPoFromAwardAction } from "@/app/actions/po";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { Search, FileText, Clock, ArrowRight } from "lucide-react";

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
  supplier: {
    companyName: string;
  };
  rfq: {
    rfqNumber: string;
  } | null;
  totalCost: any;
  status: string;
  createdAt: Date | string;
  deliveryTerms?: string | null;
}

function getSupplierInitials(name: string) {
  if (!name) return "SP";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
        setSuccessMsg(`Draft Purchase Order created successfully. Redirecting...`);
        setAwards(prev => prev.filter(a => a.id !== recId));
        // Redirect to PO details page immediately
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

  const theme = {
    crimson: "var(--accent)",
    gold: "var(--accent-light)",
    goldDark: "var(--accent)",
    textMain: "var(--text-primary)",
    textMuted: "var(--text-muted)",
    glassBg: "var(--surface)",
    glassBorder: "var(--border)",
    shadow: "var(--shadow-card)",
  };

  const filteredPos = pos.filter((po) => {
    return (
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (po.rfq && po.rfq.rfqNumber.toLowerCase().includes(search.toLowerCase()))
    );
  });

 return (
  <div className="space-y-8">
    
    {/* Tabs */}
    <div className="flex gap-4 border-b border-[var(--border)] pb-3">
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
        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
          activeTab === "queue"
            ? "bg-[var(--accent)] text-white"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
      >
        Approved Awards ({awards.length})
      </button>
    </div>

    {/* Alerts */}
    {errorMsg && (
      <Card className="p-4 border-red-500/20 bg-red-50 dark:bg-red-900/20">
        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
          ⚠ {errorMsg}
        </span>
      </Card>
    )}

    {successMsg && (
      <Card className="p-4 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/20">
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          ✅ {successMsg}
        </span>
      </Card>
    )}

    {/* QUEUE TAB */}
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
            {awards.map((award) => (
              <Card
                key={award.id}
                className="p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)]">
                      RFQ Reference
                    </span>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {award.canvas.rfq.rfqNumber}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                      {award.canvas.rfq.title}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase text-[var(--text-muted)]">
                      Awarded Supplier
                    </span>
                    <div className="text-sm font-semibold text-[var(--accent)]">
                      {award.supplier.companyName}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">
                        Total Amount
                      </span>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        ₱
                        {Number(
                          award.supplierQuote.totalQuotedAmount
                        ).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDraftPo(award.id)}
                      disabled={isProcessing}
                      className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                    >
                      Draft PO
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
        {/* Search */}
        <Card className="p-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search PO number, supplier, or RFQ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </Card>

        {/* Registry Grid */}
        {filteredPos.length === 0 ? (
          <EmptyState
            preset="purchase-orders"
            title="No Purchase Orders Found"
            description="No purchase orders match your search criteria."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPos.map((po) => (
              <Link
                key={po.id}
                href={`/dashboard/officer/po/${po.id}`}
                className="group"
              >
                <Card className="p-6 transition hover:-translate-y-1 hover:shadow-md">
                  <div className="space-y-4">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[var(--accent)]">
                        {po.poNumber}
                      </span>
                      <StatusBadge status={po.status} />
                    </div>

                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {po.supplier.companyName}
                    </div>

                    <div className="text-xs text-[var(--text-muted)]">
                      Delivery:{" "}
                      <span className="font-medium text-[var(--text-primary)]">
                        {po.deliveryTerms || "Standard schedule"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
                      <span>
                        RFQ:{" "}
                        <strong>{po.rfq?.rfqNumber || "—"}</strong>
                      </span>
                      <span className="font-bold text-sm text-[var(--text-primary)]">
                        ₱
                        {Number(po.totalCost).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
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
