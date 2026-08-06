"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import * as XLSX from "xlsx";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";

interface ReportsData {
  pmrs: {
    id: number;
    pmrNumber: string;
    prNumber: string | null;
    office: string;
    fundSource: string | null;
    totalCost: number;
    dateReceived: string;
    verificationDate: string | null;
    verifiedBy: string | null;
    stage: string;
    status: string;
  }[];
  pos: {
    id: number;
    poNumber: string;
    supplierName: string;
    prNumber: string | null;
    office: string | null;
    totalCost: number;
    status: string;
    createdAt: string;
    dateOfDelivery: string | null;
  }[];
  rfqs: {
    id: number;
    rfqNumber: string;
    title: string;
    status: string;
    budget: number;
    deadlineDate: string | null;
    createdAt: string;
    prNumber: string | null;
    quoteCount: number;
  }[];
}

interface ReportTable {
  title: string;
  headers: string[];
  rows: (string | number | null)[][];
}

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtMoney = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

function downloadCsv(filename: string, headers: string[], rows: (string | number | null)[][]) {
  const escape = (v: string | number | null) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(","), ...rows.map((r) => r.map(escape).join(","))];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportExcel(filename: string, sheetName: string, headers: string[], rows: (string | number | null)[][]) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows.map((r) => r.map((v) => (v === null ? "" : v)))]);
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 14) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function exportPdf(title: string, headers: string[], rows: (string | number | null)[][]) {
  const esc = (v: string | number | null) => {
    const s = v === null || v === undefined ? "" : String(v);
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  const head = headers.map((h) => `<th>${esc(h)}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
    .join("");
  const html = `<!doctype html><html><head><title>${esc(title)}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Times New Roman',serif;color:#000;padding:20mm}
      h1{text-align:center;font-size:18px;text-transform:uppercase;margin-bottom:4px}
      .sub{text-align:center;font-size:11px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
      th,td{border:1px solid #000;padding:5px 6px;text-align:left;vertical-align:top}
      th{background:#eee;font-weight:bold}
      td.r,th.r{text-align:right}
      @page{size:A4 portrait;margin:0}
      @media print{body{padding:0}}
    </style></head>
    <body>
      <h1>Batanes State College</h1>
      <div class="sub">${esc(title)} · Generated ${new Date().toLocaleString("en-PH")}</div>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    </body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.onload = () => {
    w.focus();
    w.print();
  };
}

export default function ReportsClient({ data }: { data: ReportsData }) {
  const [tab, setTab] = useState("pmr");

  const reports: Record<string, ReportTable> = useMemo(() => {
    const pmrRows = data.pmrs.map((p) => [
      p.pmrNumber,
      p.prNumber || "—",
      p.office,
      p.fundSource || "—",
      fmtDate(p.dateReceived),
      fmtDate(p.verificationDate),
      p.verifiedBy || "—",
      p.stage,
      p.status,
      fmtMoney(p.totalCost),
    ]);

    const rfqRows = data.rfqs.map((r) => [
      r.rfqNumber,
      r.title,
      r.prNumber || "—",
      r.status,
      r.quoteCount,
      fmtDate(r.deadlineDate),
      fmtDate(r.createdAt),
      fmtMoney(r.budget),
    ]);

    const bacRows = data.rfqs
      .filter((r) => r.status === "Published" || r.status === "Closed")
      .map((r) => [
        r.rfqNumber,
        r.title,
        r.prNumber || "—",
        r.status,
        fmtDate(r.deadlineDate),
        fmtDate(r.createdAt),
      ]);

    const noticeRows = data.rfqs
      .filter((r) => r.status === "Evaluated")
      .map((r) => [
        r.rfqNumber,
        r.title,
        r.prNumber || "—",
        r.status,
        fmtDate(r.createdAt),
        fmtMoney(r.budget),
      ]);

    const poRows = data.pos.map((p) => [
      p.poNumber,
      p.prNumber || "—",
      p.supplierName,
      p.office || "—",
      p.status,
      fmtDate(p.createdAt),
      fmtDate(p.dateOfDelivery),
      fmtMoney(p.totalCost),
    ]);

    return {
      pmr: {
        title: "Procurement Monitoring Record Report",
        headers: ["PMR No.", "PR No.", "Office", "Fund Source", "Date Received", "Verification Date", "Verified By", "Stage", "Status", "Amount"],
        rows: pmrRows,
      },
      rfq: {
        title: "RFQ Preparation Report",
        headers: ["RFQ No.", "Title", "PR No.", "Status", "Quotes", "Deadline", "Date Created", "Budget (₱)"],
        rows: rfqRows,
      },
      bac: {
        title: "BAC Transmittal Report",
        headers: ["RFQ No.", "Title", "PR No.", "Status", "Deadline", "Date Created"],
        rows: bacRows,
      },
      notices: {
        title: "Letter of Notice Report",
        headers: ["RFQ No.", "Title", "PR No.", "Status", "Date Created", "Amount"],
        rows: noticeRows,
      },
      po: {
        title: "Purchase Order Report",
        headers: ["PO No.", "PR No.", "Supplier", "Office", "Status", "Date Created", "Date of Delivery", "Amount"],
        rows: poRows,
      },
    };
  }, [data]);

  const tabs = [
    { key: "pmr", label: "PMR Report" },
    { key: "rfq", label: "RFQ Preparation" },
    { key: "bac", label: "BAC Transmittal" },
    { key: "notices", label: "Letter of Notice" },
    { key: "po", label: "Purchase Order" },
  ];

  const active = reports[tab];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-base-300">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-base-content/60 hover:text-base-content"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Report card */}
      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-base-200">
          <div>
            <h3 className="text-base font-bold text-base-content">{active.title}</h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              {active.rows.length.toLocaleString()} record{active.rows.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadCsv(active.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), active.headers, active.rows)}
              disabled={active.rows.length === 0}
              className="btn btn-sm btn-outline border-base-300 text-xs font-bold flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => exportExcel(active.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), active.title.slice(0, 31), active.headers, active.rows)}
              disabled={active.rows.length === 0}
              className="btn btn-sm btn-outline border-base-300 text-xs font-bold flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            <button
              type="button"
              onClick={() => exportPdf(active.title, active.headers, active.rows)}
              disabled={active.rows.length === 0}
              className="btn btn-sm btn-primary text-white text-xs font-bold flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {active.rows.length === 0 ? (
          <div className="p-10">
            <EmptyState
              preset="purchase-requests"
              title="No Records"
              description={`No data is available for the ${active.title}.`}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-base-300 bg-base-200 text-base-content/85 uppercase text-[10px] font-bold">
                  {active.headers.map((h) => (
                    <th key={h} className="py-2.5 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {active.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-base-200/30">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-3 px-3 text-base-content/75">
                        {cell === null ? "—" : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: "/dashboard/officer/pmr", label: "Procurement Monitoring Record" },
          { href: "/dashboard/officer/rfq", label: "Request for Quotation" },
          { href: "/dashboard/officer/transmittals", label: "BAC Transmittals" },
          { href: "/dashboard/officer/notices", label: "Letters of Notice" },
          { href: "/dashboard/officer/po", label: "Purchase Orders" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="btn btn-sm btn-ghost rounded-md text-xs font-bold border border-base-300">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
