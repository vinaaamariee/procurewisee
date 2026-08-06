"use client";

import React, { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { Search, PackageCheck, Truck, ReceiptText } from "lucide-react";

interface PoReceipt {
  id: number;
  receiptNumber: string;
  dateReceived: string;
  deliveryStatus: string;
  receivedBy: string;
}

export interface PoRow {
  id: number;
  poNumber: string;
  supplierName: string;
  prNumber: string | null;
  office: string | null;
  totalCost: number;
  status: string;
  dateOfDelivery: string | null;
  createdAt: string;
  receipts: PoReceipt[];
}

export interface ReceiptRow {
  id: number;
  receiptNumber: string;
  poNumber: string | null;
  supplierName: string;
  dateReceived: string;
  deliveryStatus: string;
  receivedBy: string;
}

interface DeliveriesClientProps {
  initialPos: PoRow[];
  initialReceipts: ReceiptRow[];
}

export default function DeliveriesClient({ initialPos, initialReceipts }: DeliveriesClientProps) {
  const [tab, setTab] = useState<"pos" | "receipts">("pos");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const counts = useMemo(() => {
    return {
      pending: initialPos.filter((p) => ["Draft", "PendingApproval", "Approved", "SentToSupplier"].includes(p.status)).length,
      partial: initialPos.filter((p) => p.status === "PartiallyDelivered").length,
      delivered: initialPos.filter((p) => ["Delivered", "Completed"].includes(p.status)).length,
      receipts: initialReceipts.length,
    };
  }, [initialPos, initialReceipts]);

  const filteredPos = useMemo(() => {
    return initialPos.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.poNumber.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        (p.prNumber || "").toLowerCase().includes(q) ||
        (p.office || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && !["Delivered", "Completed"].includes(p.status)) ||
        (statusFilter === "delivered" && ["Delivered", "Completed"].includes(p.status)) ||
        p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialPos, search, statusFilter]);

  const filteredReceipts = useMemo(() => {
    return initialReceipts.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.receiptNumber.toLowerCase().includes(q) ||
        (r.poNumber || "").toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q) ||
        r.receivedBy.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.deliveryStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialReceipts, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {(
          [
            { label: "Pending Delivery", value: counts.pending, cls: "text-amber-700 dark:text-amber-300", Icon: Truck },
            { label: "Partial Deliveries", value: counts.partial, cls: "text-blue-700 dark:text-blue-300", Icon: PackageCheck },
            { label: "Delivered", value: counts.delivered, cls: "text-emerald-700 dark:text-emerald-300", Icon: PackageCheck },
            { label: "Acknowledgement Receipts", value: counts.receipts, cls: "text-primary", Icon: ReceiptText },
          ] as const
        ).map((s) => (
          <div key={s.label} className="rounded-md border border-base-300 bg-base-100 p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/65 block">{s.label}</span>
              <span className={`text-2xl font-bold font-display ${s.cls}`}>{s.value}</span>
            </div>
            <s.Icon className={`h-8 w-8 ${s.cls}`} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-base-300">
        {(
          [
            { key: "pos", label: "Purchase Orders" },
            { key: "receipts", label: "Acknowledgement Receipts" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-base-content/40" />
            <input
              type="text"
              placeholder={tab === "pos" ? "Search PO, supplier, PR reference, office..." : "Search receipt, PO, supplier..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full input pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-base-content/60">Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select select-sm border-base-300 bg-base-100 font-medium">
              <option value="all">All Statuses</option>
              {tab === "pos" ? (
                <>
                  <option value="pending">Pending Delivery</option>
                  <option value="PartiallyDelivered">Partially Delivered</option>
                  <option value="delivered">Delivered / Completed</option>
                </>
              ) : (
                <>
                  <option value="PartialDelivery">Partial Delivery</option>
                  <option value="CompleteDelivery">Complete Delivery</option>
                  <option value="RejectedDelivery">Rejected Delivery</option>
                  <option value="ReturnedDelivery">Returned Delivery</option>
                  <option value="ReplacementDelivery">Replacement Delivery</option>
                </>
              )}
            </select>
          </div>
        </div>
      </Card>

      {/* PO Delivery Table */}
      {tab === "pos" ? (
        filteredPos.length === 0 ? (
          <EmptyState
            preset="purchase-orders"
            title="No Purchase Orders Found"
            description="No purchase orders match your search or filter criteria."
            action={{
              label: "Clear Filters",
              onClick: () => {
                setSearch("");
                setStatusFilter("all");
              },
            }}
          />
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">PO No.</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3">PR Ref.</th>
                    <th className="py-2.5 px-3">Office</th>
                    <th className="py-2.5 px-3">Expected Delivery</th>
                    <th className="py-2.5 px-3">Receipts</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {filteredPos.map((po) => (
                    <tr key={po.id} className="hover:bg-base-200/30">
                      <td className="py-3 px-3 font-bold text-primary">{po.poNumber}</td>
                      <td className="py-3 px-3 text-base-content/80 font-medium">{po.supplierName}</td>
                      <td className="py-3 px-3 text-base-content/70">{po.prNumber || "—"}</td>
                      <td className="py-3 px-3 text-base-content/70">{po.office || "—"}</td>
                      <td className="py-3 px-3 text-base-content/70">
                        {po.dateOfDelivery
                          ? new Date(po.dateOfDelivery).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="py-3 px-3">
                        {po.receipts.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {po.receipts.map((r) => (
                              <span key={r.id} className="px-1.5 py-0.5 rounded bg-base-200 text-[10px] font-bold text-base-content/70">
                                {r.receiptNumber}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-base-content/40">No receipt</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-base-content">
                        ₱{po.totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3"><StatusBadge status={po.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : filteredReceipts.length === 0 ? (
        <EmptyState
          preset="purchase-orders"
          title="No Acknowledgement Receipts Found"
          description="No receipts match your search or filter criteria."
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSearch("");
              setStatusFilter("all");
            },
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Receipt No.</th>
                  <th className="py-2.5 px-3">PO No.</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Date Received</th>
                  <th className="py-2.5 px-3">Received By</th>
                  <th className="py-2.5 px-3">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-base-200/30">
                    <td className="py-3 px-3 font-bold text-primary">{r.receiptNumber}</td>
                    <td className="py-3 px-3 text-base-content/80 font-medium">{r.poNumber || "—"}</td>
                    <td className="py-3 px-3 text-base-content/70">{r.supplierName}</td>
                    <td className="py-3 px-3 text-base-content/70">
                      {new Date(r.dateReceived).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-3 text-base-content/70">{r.receivedBy}</td>
                    <td className="py-3 px-3"><StatusBadge status={r.deliveryStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
