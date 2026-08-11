"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import * as XLSX from "xlsx";
import {
  FileDown,
  FileSpreadsheet,
  Printer,
  Search,
  ClipboardList,
  FileText,
  Send,
  Bell,
  ShoppingCart,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const fmtMoney = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null)[][]
) {
  const escape = (v: string | number | null) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(","), ...rows.map((r) => r.map(escape).join(","))];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | null)[][]
) {
  const ws = XLSX.utils.aoa_to_sheet([
    headers,
    ...rows.map((r) => r.map((v) => (v === null ? "" : v))),
  ]);
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 14) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function exportPdf(
  title: string,
  headers: string[],
  rows: (string | number | null)[][]
) {
  const esc = (v: string | number | null) => {
    const s = v === null || v === undefined ? "" : String(v);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
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
      @page{size:A4 landscape;margin:0}
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

/* ─────────────────────────────────────────────
   PMR Live Table
───────────────────────────────────────────── */
function PmrTable({ pmrs }: { pmrs: ReportsData["pmrs"] }) {
  const [q, setQ] = useState("");
  const filtered = pmrs.filter((p) => {
    const s = q.toLowerCase();
    return (
      !s ||
      p.pmrNumber.toLowerCase().includes(s) ||
      (p.prNumber ?? "").toLowerCase().includes(s) ||
      p.office.toLowerCase().includes(s) ||
      (p.fundSource ?? "").toLowerCase().includes(s) ||
      p.stage.toLowerCase().includes(s) ||
      (p.verifiedBy ?? "").toLowerCase().includes(s)
    );
  });

  const csvRows = filtered.map((p) => [
    p.pmrNumber,
    p.prNumber ?? "—",
    p.office,
    p.fundSource ?? "—",
    fmtDate(p.dateReceived),
    fmtDate(p.verificationDate),
    p.verifiedBy ?? "—",
    p.stage,
    p.status,
    fmtMoney(p.totalCost),
  ]);
  const headers = [
    "PMR No.",
    "PR No.",
    "Office",
    "Fund Source",
    "Date Received",
    "Verification Date",
    "Verified By",
    "Stage",
    "Status",
    "Amount",
  ];

  return (
    <div className="space-y-4">
      <SearchExportBar
        q={q}
        setQ={setQ}
        count={filtered.length}
        total={pmrs.length}
        onCsv={() => downloadCsv("pmr-report", headers, csvRows)}
        onExcel={() => exportExcel("pmr-report", "PMR Report", headers, csvRows)}
        onPdf={() => exportPdf("Procurement Monitoring Record Report", headers, csvRows)}
      />
      {filtered.length === 0 ? (
        <EmptyState preset="purchase-requests" title="No PMR Records" description="No records match your search." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-base-300 bg-base-200 text-base-content/80 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">PMR No.</th>
                <th className="py-2.5 px-3 whitespace-nowrap">PR No.</th>
                <th className="py-2.5 px-3">Office</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Fund Source</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date Received</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Verified</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Verified By</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-base-200/30 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-bold text-primary">{p.pmrNumber}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-base-content/70">
                    {p.prNumber ?? "—"}
                  </td>
                  <td className="py-3 px-3 font-medium text-base-content max-w-[160px]">
                    <div className="truncate">{p.office}</div>
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {p.fundSource ?? "—"}
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {fmtDate(p.dateReceived)}
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {fmtDate(p.verificationDate)}
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {p.verifiedBy ?? "—"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-base-200 border border-base-300 text-base-content/80 uppercase tracking-wide">
                      {p.stage}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-base-content whitespace-nowrap">
                    {fmtMoney(p.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RFQ Live Table
───────────────────────────────────────────── */
function RfqTable({ rfqs }: { rfqs: ReportsData["rfqs"] }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = rfqs.filter((r) => {
    const s = q.toLowerCase();
    const matchQ =
      !s ||
      r.rfqNumber.toLowerCase().includes(s) ||
      r.title.toLowerCase().includes(s) ||
      (r.prNumber ?? "").toLowerCase().includes(s);
    const matchStatus =
      statusFilter === "all" || r.status === statusFilter;
    return matchQ && matchStatus;
  });

  const headers = [
    "RFQ No.",
    "Title",
    "PR No.",
    "Status",
    "Quotes",
    "Deadline",
    "Date Created",
    "Budget",
  ];
  const csvRows = filtered.map((r) => [
    r.rfqNumber,
    r.title,
    r.prNumber ?? "—",
    r.status,
    r.quoteCount,
    fmtDate(r.deadlineDate),
    fmtDate(r.createdAt),
    fmtMoney(r.budget),
  ]);

  const statuses = Array.from(new Set(rfqs.map((r) => r.status)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchExportBar
          q={q}
          setQ={setQ}
          count={filtered.length}
          total={rfqs.length}
          onCsv={() => downloadCsv("rfq-report", headers, csvRows)}
          onExcel={() => exportExcel("rfq-report", "RFQ Report", headers, csvRows)}
          onPdf={() => exportPdf("RFQ Preparation Report", headers, csvRows)}
          extra={
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-sm border-base-300 bg-base-100 font-medium text-xs"
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          }
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState preset="purchase-requests" title="No RFQs Found" description="No RFQs match your filter." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-base-300 bg-base-200 text-base-content/80 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">RFQ No.</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3 whitespace-nowrap">PR No.</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Quotes</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Deadline</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Created</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-base-200/30 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <Link
                      href={`/dashboard/officer/rfq/${r.id}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {r.rfqNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-base-content max-w-[220px]">
                    <div className="line-clamp-2 leading-relaxed">{r.title}</div>
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {r.prNumber ?? "—"}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {r.quoteCount}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {fmtDate(r.deadlineDate)}
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {fmtDate(r.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-base-content whitespace-nowrap">
                    {fmtMoney(r.budget)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BAC Transmittal Live Table
───────────────────────────────────────────── */
function BacTable({ rfqs }: { rfqs: ReportsData["rfqs"] }) {
  const [q, setQ] = useState("");
  const bac = rfqs.filter(
    (r) => r.status === "Published" || r.status === "Closed"
  );
  const filtered = bac.filter((r) => {
    const s = q.toLowerCase();
    return (
      !s ||
      r.rfqNumber.toLowerCase().includes(s) ||
      r.title.toLowerCase().includes(s) ||
      (r.prNumber ?? "").toLowerCase().includes(s)
    );
  });

  const headers = ["RFQ No.", "Title", "PR No.", "Status", "Deadline", "Date Created"];
  const csvRows = filtered.map((r) => [
    r.rfqNumber,
    r.title,
    r.prNumber ?? "—",
    r.status,
    fmtDate(r.deadlineDate),
    fmtDate(r.createdAt),
  ]);

  return (
    <div className="space-y-4">
      <SearchExportBar
        q={q}
        setQ={setQ}
        count={filtered.length}
        total={bac.length}
        onCsv={() => downloadCsv("bac-transmittal", headers, csvRows)}
        onExcel={() => exportExcel("bac-transmittal", "BAC Transmittal", headers, csvRows)}
        onPdf={() => exportPdf("BAC Transmittal Report", headers, csvRows)}
      />
      {filtered.length === 0 ? (
        <EmptyState preset="purchase-requests" title="No BAC Transmittals" description="No solicitations are currently in Published or Closed state." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-base-300 bg-base-200 text-base-content/80 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">RFQ No.</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3 whitespace-nowrap">PR No.</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Deadline</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Created</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-base-200/30 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <Link
                      href={`/dashboard/officer/rfq/${r.id}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {r.rfqNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-base-content max-w-[220px]">
                    <div className="line-clamp-2">{r.title}</div>
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {r.prNumber ?? "—"}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {fmtDate(r.deadlineDate)}
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {fmtDate(r.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Link
                      href={`/dashboard/officer/rfq/${r.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Letter of Notice Live Table
───────────────────────────────────────────── */
function NoticesTable({ rfqs }: { rfqs: ReportsData["rfqs"] }) {
  const [q, setQ] = useState("");
  const notices = rfqs.filter((r) => r.status === "Evaluated");
  const filtered = notices.filter((r) => {
    const s = q.toLowerCase();
    return (
      !s ||
      r.rfqNumber.toLowerCase().includes(s) ||
      r.title.toLowerCase().includes(s) ||
      (r.prNumber ?? "").toLowerCase().includes(s)
    );
  });

  const headers = ["RFQ No.", "Title", "PR No.", "Status", "Date Evaluated", "Budget"];
  const csvRows = filtered.map((r) => [
    r.rfqNumber,
    r.title,
    r.prNumber ?? "—",
    r.status,
    fmtDate(r.createdAt),
    fmtMoney(r.budget),
  ]);

  return (
    <div className="space-y-4">
      <SearchExportBar
        q={q}
        setQ={setQ}
        count={filtered.length}
        total={notices.length}
        onCsv={() => downloadCsv("letter-of-notice", headers, csvRows)}
        onExcel={() => exportExcel("letter-of-notice", "Letters of Notice", headers, csvRows)}
        onPdf={() => exportPdf("Letter of Notice Report", headers, csvRows)}
      />
      {filtered.length === 0 ? (
        <EmptyState preset="purchase-requests" title="No Notices" description="No evaluated RFQs available for notices." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-base-300 bg-base-200 text-base-content/80 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">RFQ No.</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3 whitespace-nowrap">PR No.</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date Evaluated</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Budget</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-base-200/30 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <Link
                      href={`/dashboard/officer/rfq/${r.id}`}
                      className="font-bold text-primary hover:underline"
                    >
                      {r.rfqNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-base-content max-w-[220px]">
                    <div className="line-clamp-2">{r.title}</div>
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {r.prNumber ?? "—"}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {fmtDate(r.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-base-content whitespace-nowrap">
                    {fmtMoney(r.budget)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Link
                      href={`/dashboard/officer/rfq/${r.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Purchase Order Live Table
───────────────────────────────────────────── */
function PoTable({ pos }: { pos: ReportsData["pos"] }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = pos.filter((p) => {
    const s = q.toLowerCase();
    const matchQ =
      !s ||
      p.poNumber.toLowerCase().includes(s) ||
      p.supplierName.toLowerCase().includes(s) ||
      (p.prNumber ?? "").toLowerCase().includes(s) ||
      (p.office ?? "").toLowerCase().includes(s);
    const matchStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchQ && matchStatus;
  });

  const statuses = Array.from(new Set(pos.map((p) => p.status)));
  const headers = [
    "PO No.",
    "PR No.",
    "Supplier",
    "Office",
    "Status",
    "Date Created",
    "Delivery Date",
    "Amount",
  ];
  const csvRows = filtered.map((p) => [
    p.poNumber,
    p.prNumber ?? "—",
    p.supplierName,
    p.office ?? "—",
    p.status,
    fmtDate(p.createdAt),
    fmtDate(p.dateOfDelivery),
    fmtMoney(p.totalCost),
  ]);

  return (
    <div className="space-y-4">
      <SearchExportBar
        q={q}
        setQ={setQ}
        count={filtered.length}
        total={pos.length}
        onCsv={() => downloadCsv("purchase-order-report", headers, csvRows)}
        onExcel={() => exportExcel("purchase-order-report", "PO Report", headers, csvRows)}
        onPdf={() => exportPdf("Purchase Order Report", headers, csvRows)}
        extra={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-sm border-base-300 bg-base-100 font-medium text-xs"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
      />
      {filtered.length === 0 ? (
        <EmptyState preset="purchase-requests" title="No Purchase Orders" description="No POs match your search." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-base-300 bg-base-200 text-base-content/80 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">PO No.</th>
                <th className="py-2.5 px-3 whitespace-nowrap">PR No.</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3">Office</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Created</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Delivery Date</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-base-200/30 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-bold text-primary">{p.poNumber}</span>
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {p.prNumber ?? "—"}
                  </td>
                  <td className="py-3 px-3 font-medium text-base-content max-w-[160px]">
                    <div className="truncate">{p.supplierName}</div>
                  </td>
                  <td className="py-3 px-3 text-base-content/70 max-w-[140px]">
                    <div className="truncate">{p.office ?? "—"}</div>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {fmtDate(p.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-base-content/70 whitespace-nowrap">
                    {fmtDate(p.dateOfDelivery)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-base-content whitespace-nowrap">
                    {fmtMoney(p.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared Search + Export Bar
───────────────────────────────────────────── */
function SearchExportBar({
  q,
  setQ,
  count,
  total,
  onCsv,
  onExcel,
  onPdf,
  extra,
}: {
  q: string;
  setQ: (v: string) => void;
  count: number;
  total: number;
  onCsv: () => void;
  onExcel: () => void;
  onPdf: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-base-content/40" />
          <input
            type="text"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input input-sm pl-8 w-52"
          />
        </div>
        {extra}
        <span className="text-xs text-base-content/50 font-medium">
          {count === total
            ? `${total} record${total !== 1 ? "s" : ""}`
            : `${count} of ${total}`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCsv}
          disabled={count === 0}
          className="btn btn-sm btn-ghost border border-base-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
        >
          <FileDown className="h-3.5 w-3.5" />
          CSV
        </button>
        <button
          type="button"
          onClick={onExcel}
          disabled={count === 0}
          className="btn btn-sm btn-ghost border border-base-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Excel
        </button>
        <button
          type="button"
          onClick={onPdf}
          disabled={count === 0}
          className="btn btn-sm btn-primary text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
        >
          <Printer className="h-3.5 w-3.5" />
          Print PDF
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Root Component
───────────────────────────────────────────── */
const tabs = [
  {
    key: "pmr",
    label: "PMR",
    fullLabel: "Procurement Monitoring Record",
    icon: ClipboardList,
  },
  {
    key: "rfq",
    label: "RFQ",
    fullLabel: "RFQ Preparation",
    icon: FileText,
  },
  {
    key: "bac",
    label: "BAC Transmittal",
    fullLabel: "BAC Transmittal",
    icon: Send,
  },
  {
    key: "notices",
    label: "Letters of Notice",
    fullLabel: "Letters of Notice",
    icon: Bell,
  },
  {
    key: "po",
    label: "Purchase Order",
    fullLabel: "Purchase Order",
    icon: ShoppingCart,
  },
];

export default function ReportsClient({ data }: { data: ReportsData }) {
  const [tab, setTab] = useState("pmr");
  const activeTab = tabs.find((t) => t.key === tab)!;

  const counts: Record<string, number> = useMemo(
    () => ({
      pmr: data.pmrs.length,
      rfq: data.rfqs.length,
      bac: data.rfqs.filter(
        (r) => r.status === "Published" || r.status === "Closed"
      ).length,
      notices: data.rfqs.filter((r) => r.status === "Evaluated").length,
      po: data.pos.length,
    }),
    [data]
  );

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-base-300">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/60 hover:text-base-content"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
              {counts[t.key] > 0 && (
                <span
                  className={`ml-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    tab === t.key
                      ? "bg-primary text-white"
                      : "bg-base-300 text-base-content/60"
                  }`}
                >
                  {counts[t.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Report Card */}
      <Card className="p-0 overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-4 border-b border-base-200">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50">
            Live Report
          </span>
          <h3 className="text-base font-bold text-base-content mt-0.5">
            {activeTab.fullLabel}
          </h3>
        </div>

        {/* Table body */}
        <div className="p-5 space-y-4">
          {tab === "pmr" && <PmrTable pmrs={data.pmrs} />}
          {tab === "rfq" && <RfqTable rfqs={data.rfqs} />}
          {tab === "bac" && <BacTable rfqs={data.rfqs} />}
          {tab === "notices" && <NoticesTable rfqs={data.rfqs} />}
          {tab === "po" && <PoTable pos={data.pos} />}
        </div>
      </Card>

      {/* Quick navigation links */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: "/dashboard/officer/pmr", label: "→ PMR Registry" },
          { href: "/dashboard/officer/rfq", label: "→ RFQ Management" },
          { href: "/dashboard/officer/transmittals", label: "→ BAC Transmittals" },
          { href: "/dashboard/officer/notices", label: "→ Letters of Notice" },
          { href: "/dashboard/officer/po", label: "→ Purchase Orders" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="btn btn-sm btn-ghost rounded-md text-xs font-bold border border-base-300"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
