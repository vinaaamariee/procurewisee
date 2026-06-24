"use client";

import React, { useState } from "react";

interface ReportsExporterClientProps {
  ppmps: any[];
  prs: any[];
  rfqs: any[];
  pos: any[];
  suppliers: any[];
}

export default function ReportsExporterClient({
  ppmps,
  prs,
  rfqs,
  pos,
  suppliers
}: ReportsExporterClientProps) {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Helper to trigger browser download of a CSV file
  const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
    setIsDownloading(filename);
    
    // Format headers and rows to CSV format
    const escapeCsvCell = (cell: any) => {
      if (cell === null || cell === undefined) return '""';
      const stringified = String(cell);
      if (stringified.includes(",") || stringified.includes('"') || stringified.includes("\n") || stringified.includes("\r")) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(escapeCsvCell).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setIsDownloading(null);
    }, 500);
  };

  // 1. Export PPMPs
  const handleExportPpmps = () => {
    const headers = [
      "PPMP Number",
      "Project Title",
      "Department",
      "Office",
      "Funding Source",
      "Fiscal Year",
      "Estimated Budget",
      "Status",
      "Prepared By"
    ];
    const rows = ppmps.map(p => [
      p.ppmpNumber,
      p.projectTitle,
      p.department,
      p.office,
      p.fundingSource,
      p.fiscalYear,
      p.estimatedBudget,
      p.status,
      p.preparedBy?.fullName || "—"
    ]);
    downloadCsv("ppmp_report", headers, rows);
  };

  // 2. Export Purchase Requests
  const handleExportPrs = () => {
    const headers = [
      "PR Number",
      "Tracking Number",
      "Request Date",
      "Department",
      "Office",
      "Purpose",
      "Funding Source",
      "Total Cost",
      "Status",
      "Requested By"
    ];
    const rows = prs.map(p => [
      p.prNumber,
      p.trackingNumber || "N/A",
      new Date(p.requestDate).toLocaleString(),
      p.department,
      p.office,
      p.purpose,
      p.fundingSource,
      p.totalCost,
      p.status,
      p.requestedBy?.fullName || "—"
    ]);
    downloadCsv("purchase_requests_report", headers, rows);
  };

  // 3. Export RFQs
  const handleExportRfqs = () => {
    const headers = [
      "RFQ Number",
      "Title",
      "Approved Budget Contract",
      "Deadline Date",
      "Status",
      "Created By"
    ];
    const rows = rfqs.map(r => [
      r.rfqNumber,
      r.title,
      r.approvedBudgetContract,
      new Date(r.deadlineDate).toLocaleDateString(),
      r.status,
      r.createdBy?.fullName || "—"
    ]);
    downloadCsv("rfq_report", headers, rows);
  };

  // 4. Export POs
  const handleExportPos = () => {
    const headers = [
      "PO Number",
      "Supplier",
      "RFQ Number",
      "Total Cost",
      "Delivery Terms",
      "Payment Terms",
      "Status",
      "Created Date"
    ];
    const rows = pos.map(p => [
      p.poNumber,
      p.supplier?.companyName || "—",
      p.rfq?.rfqNumber || "N/A",
      p.totalCost,
      p.deliveryTerms || "—",
      p.paymentTerms || "—",
      p.status,
      new Date(p.createdAt).toLocaleDateString()
    ]);
    downloadCsv("purchase_orders_report", headers, rows);
  };

  // 5. Export Supplier Metrics
  const handleExportSuppliers = () => {
    const headers = [
      "Company Name",
      "TIN",
      "Contact Person",
      "Contact Number",
      "Business Address",
      "Reliability Rating (1-5)",
      "Quality Compliance Rate (%)",
      "On-Time Delivery Rate (%)",
      "Total Deliveries Count",
      "Verified Status"
    ];
    const rows = suppliers.map(s => [
      s.companyName,
      s.tin || "—",
      s.contactPerson || "—",
      s.contactNumber || "—",
      s.businessAddress,
      s.reliabilityRating,
      s.qualityComplianceRate,
      s.onTimeDeliveryRate,
      s.totalDeliveriesCount,
      s.isVerified ? "Verified" : "Unverified"
    ]);
    downloadCsv("suppliers_performance_report", headers, rows);
  };

  const theme = {
    crimson: "#7e191b",
    gold: "#dcb353",
    goldDark: "#b88a1b",
    textMain: "#1f2937",
    textMuted: "#6b7280",
    glassBg: "rgba(255, 255, 255, 0.75)",
    glassBorder: "rgba(255, 255, 255, 0.95)",
    shadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
  };

  const reports = [
    {
      title: "📅 PPMP Procurement Plans",
      desc: "Annual and project procurement plans, budget allocations, scheduling, and prep statuses.",
      action: handleExportPpmps,
      filename: "ppmp_report"
    },
    {
      title: "🛒 Purchase Requests Logs",
      desc: "Submitted requisitions, estimated item costs, requesting offices, and status timelines.",
      action: handleExportPrs,
      filename: "purchase_requests_report"
    },
    {
      title: "📝 Requests for Quotation (RFQs)",
      desc: "Supplier solicitation events, budget thresholds, deadlines, and current evaluation status.",
      action: handleExportRfqs,
      filename: "rfq_report"
    },
    {
      title: "📜 Purchase Order Contracts",
      desc: "Finalized supply agreements, delivery/payment terms, suppliers awarded, and contract costs.",
      action: handleExportPos,
      filename: "purchase_orders_report"
    },
    {
      title: "🏢 Supplier Performance scorecards",
      desc: "Supplier profiles, verification status, composite reliability ratings, quality compliance and delivery rates.",
      action: handleExportSuppliers,
      filename: "suppliers_performance_report"
    }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }} className="md:grid-cols-2 lg:grid-cols-3">
      {reports.map((rep) => {
        const isCurrent = isDownloading === rep.filename;
        return (
          <div
            key={rep.filename}
            style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.75rem",
              boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1rem"
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 850, color: theme.textMain, margin: 0 }}>{rep.title}</h3>
              <p style={{ margin: "0.4rem 0 0 0", fontSize: "0.8rem", color: theme.textMuted, lineHeight: 1.4 }}>{rep.desc}</p>
            </div>
            
            <button
              onClick={rep.action}
              disabled={isDownloading !== null}
              style={{
                width: "100%", padding: "0.65rem", borderRadius: "0.75rem", border: "none",
                background: isCurrent ? "#059669" : `linear-gradient(90deg, ${theme.crimson}, ${theme.goldDark})`,
                color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                marginTop: "auto", boxShadow: "0 4px 12px rgba(126, 25, 27, 0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
              }}
            >
              {isCurrent ? "⬇️ Exporting CSV..." : "📥 Download CSV"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
