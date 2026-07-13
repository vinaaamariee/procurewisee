"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import { createPoFromAwardAction } from "@/app/actions/po";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "0.5rem" }}>
        <button
          onClick={() => setActiveTab("registry")}
          style={{
            padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none",
            background: activeTab === "registry" ? theme.crimson : "transparent",
            color: activeTab === "registry" ? "#fff" : theme.textMuted,
            fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          📄 Purchase Orders Registry ({pos.length})
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          style={{
            padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none",
            background: activeTab === "queue" ? theme.crimson : "transparent",
            color: activeTab === "queue" ? "#fff" : theme.textMuted,
            fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          ⏳ Approved Awards Queue ({awards.length})
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626", fontSize: "0.8rem", fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", fontSize: "0.8rem", fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {activeTab === "queue" ? (
        /* Queue Tab: Bid opening awards awaiting PO */
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
          boxShadow: theme.shadow
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1.5rem" }}>Awarded RFQ Bids (Pending PO drafting)</h2>
          {awards.length === 0 ? (
            <EmptyState
              preset="rfq"
              title="No Pending RFQ Awards"
              description="All awarded RFQ bids have already been converted to Purchase Orders, or the Administrative Approver hasn't approved any canvas recommendations yet."
              compact
            />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {awards.map((award) => (
                <div
                  key={award.id}
                  style={{
                    padding: "1.5rem", borderRadius: "1rem", border: `1px solid ${theme.glassBorder}`,
                    backgroundColor: theme.glassBg, display: "flex", flexDirection: "column", gap: "1rem",
                    boxShadow: theme.shadow
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.65rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700 }}>RFQ Reference</span>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>{award.canvas.rfq.rfqNumber}</h3>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: theme.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{award.canvas.rfq.title}</p>
                  </div>

                  <div style={{ borderTop: `1px solid ${theme.glassBorder}`, paddingTop: "0.75rem" }}>
                    <span style={{ fontSize: "0.65rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: 700 }}>Awarded Supplier</span>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: theme.crimson }}>{award.supplier.companyName}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: `1px solid ${theme.glassBorder}`, paddingTop: "0.75rem" }}>
                    <div>
                      <span style={{ display: "block", fontSize: "0.65rem", color: theme.textMuted }}>Total Amount</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: 800, color: theme.textMain }}>₱{Number(award.supplierQuote.totalQuotedAmount).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleDraftPo(award.id)}
                      disabled={isProcessing}
                      style={{
                        padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none",
                        background: `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`, color: "#fff",
                        fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                      }}
                    >
                      ✏️ Draft PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Registry Tab: PO Grid Listing */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Search bar */}
          <div style={{
            background: theme.glassBg,
            border: `1px solid ${theme.glassBorder}`,
            borderRadius: "1rem",
            padding: "1rem 1.5rem",
            boxShadow: theme.shadow
          }}>
            <input
              type="text"
              placeholder="Search by PO number, supplier company name, or RFQ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 1rem",
                borderRadius: "0.75rem",
                border: `1px solid ${theme.glassBorder}`,
                background: "rgba(255,255,255,0.05)",
                color: theme.textMain,
                fontSize: "0.875rem",
                outline: "none"
              }}
            />
          </div>

          {filteredPos.length === 0 ? (
            <EmptyState
              preset="purchase-orders"
              title="No Purchase Orders Found"
              description={search ? `No purchase orders match "${search}". Try a different search term.` : "No purchase orders have been drafted yet. Start by converting an awarded RFQ bid into a PO."}
              action={search ? { label: '✕ Clear Search', onClick: () => setSearch('') } : undefined}
            />
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem"
            }}>
              {filteredPos.map((po) => {
                return (
                  <Link
                    href={`/dashboard/officer/po/${po.id}`}
                    key={po.id}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      padding: "1.5rem",
                      borderRadius: "1.25rem",
                      background: theme.glassBg,
                      border: `1px solid ${theme.glassBorder}`,
                      boxShadow: theme.shadow,
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      outline: "none"
                    }}
                    className="hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: `1px solid ${theme.glassBorder}`, paddingBottom: "0.75rem" }}>
                      {/* Supplier Avatar Initials (Fallback) */}
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "rgba(126, 25, 27, 0.08)", color: theme.crimson,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.85rem", fontWeight: 800, flexShrink: 0,
                        border: "1.5px solid rgba(126, 25, 27, 0.15)"
                      }}>
                        {getSupplierInitials(po.supplier.companyName)}
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                        <span style={{ fontWeight: 800, fontSize: "1.05rem", color: theme.crimson }}>{po.poNumber}</span>
                        <span style={{ fontSize: "0.72rem", color: theme.textMuted }}>
                          Issued: {new Date(po.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      <span style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        backgroundColor: po.status === "Approved" ? "rgba(16, 185, 129, 0.1)" : "rgba(107, 114, 128, 0.1)",
                        color: po.status === "Approved" ? "#10b981" : "#6b7280",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap"
                      }}>
                        {po.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.9rem", fontWeight: 800, color: theme.textMain, marginTop: "0.25rem" }}>
                      🏢 {po.supplier.companyName}
                    </div>

                    <div style={{ fontSize: "0.8rem", color: theme.textMuted, display: "flex", flexDirection: "column", gap: "0.15rem", marginTop: "0.25rem" }}>
                      <span>📅 <strong>Delivery Schedule:</strong></span>
                      <span style={{ fontStyle: "italic", color: theme.textMain, fontSize: "0.78rem" }}>
                        {po.deliveryTerms || "Not specified / Standard schedule"}
                      </span>
                    </div>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: `1px solid ${theme.glassBorder}`,
                      paddingTop: "0.75rem",
                      marginTop: "0.5rem",
                      fontSize: "0.75rem",
                      color: theme.textMuted
                    }}>
                      <span>Linked RFQ: <strong>{po.rfq?.rfqNumber || "—"}</strong></span>
                      <span style={{ fontWeight: 900, color: theme.textMain, fontSize: "0.95rem" }}>
                        ₱{Number(po.totalCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
