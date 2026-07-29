"use client";

import React, { useRef, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { PRItemRow } from "./PRItemsTable";

interface PRItemUploadProps {
  onItemsParsed: (items: PRItemRow[]) => void;
  disabled?: boolean;
}

interface ParseError {
  row: number;
  column: string;
  message: string;
}

const REQUIRED_COLUMNS = ["Description", "Unit", "Quantity", "Unit Cost"];
const OPTIONAL_COLUMNS = ["Stock No", "Brand", "Specification"];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

function downloadTemplate() {
  const wb = XLSX.utils.book_new();
  const headers = ALL_COLUMNS;
  const example = [
    ["001", "pcs", "A4 Multipurpose Bond Paper (80gsm)", 10, 250.00, "Navigator", "80gsm white"],
    ["002", "boxes", "Ballpoint Pen Black 0.7mm", 5, 120.00, "Pilot", "Super Grip"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);
  ws["!cols"] = [
    { wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, "PR Line Items");
  XLSX.writeFile(wb, "PR_Items_Template.xlsx");
}

function normalizeHeader(h: string): string {
  return h?.toString().trim().toLowerCase().replace(/\s+/g, " ");
}

function findColumn(headers: string[], candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.findIndex(h => normalizeHeader(h) === c.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

export default function PRItemUpload({ onItemsParsed, disabled }: PRItemUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    success: number;
    invalid: number;
    errors: ParseError[];
  } | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const parseFile = useCallback(
    (file: File) => {
      setIsParsing(true);
      setFileName(file.name);
      setSummary(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

          if (raw.length < 2) {
            setSummary({ total: 0, success: 0, invalid: 0, errors: [{ row: 0, column: "—", message: "File is empty or has no data rows." }] });
            setIsParsing(false);
            return;
          }

          const headers = (raw[0] as string[]).map(String);
          const descCol = findColumn(headers, ["description", "item description", "particulars"]);
          const unitCol = findColumn(headers, ["unit", "uom"]);
          const qtyCol = findColumn(headers, ["quantity", "qty"]);
          const priceCol = findColumn(headers, ["unit cost", "estimated unit cost", "price", "cost"]);
          const stockCol = findColumn(headers, ["stock no", "stock number", "item no"]);
          const brandCol = findColumn(headers, ["brand"]);

          if (descCol === -1 || unitCol === -1 || qtyCol === -1 || priceCol === -1) {
            const missing = [];
            if (descCol === -1) missing.push("Description");
            if (unitCol === -1) missing.push("Unit");
            if (qtyCol === -1) missing.push("Quantity");
            if (priceCol === -1) missing.push("Unit Cost");
            setSummary({
              total: 0, success: 0, invalid: 0,
              errors: [{ row: 1, column: "Header", message: `Missing required columns: ${missing.join(", ")}` }],
            });
            setIsParsing(false);
            return;
          }

          const dataRows = raw.slice(1);
          const validItems: PRItemRow[] = [];
          const errors: ParseError[] = [];

          dataRows.forEach((row, i) => {
            const rowNum = i + 2;
            const desc = row[descCol]?.toString().trim();
            const unit = row[unitCol]?.toString().trim();
            const qty = Number(row[qtyCol]);
            const price = Number(row[priceCol]);
            const stockNo = stockCol !== -1 ? row[stockCol]?.toString().trim() : String(i + 1).padStart(3, "0");
            const brand = brandCol !== -1 ? row[brandCol]?.toString().trim() : undefined;

            if (!desc) {
              errors.push({ row: rowNum, column: "Description", message: "Item description is required." });
              return;
            }
            if (!unit) {
              errors.push({ row: rowNum, column: "Unit", message: "Unit is required." });
              return;
            }
            if (!qty || isNaN(qty) || qty <= 0) {
              errors.push({ row: rowNum, column: "Quantity", message: `Quantity must be greater than 0.` });
              return;
            }
            if (isNaN(price) || price < 0) {
              errors.push({ row: rowNum, column: "Unit Cost", message: `Estimated Unit Cost cannot be negative.` });
              return;
            }

            const itemCost = qty * price;

            validItems.push({
              id: `parsed-pr-item-${i}-${Date.now()}`,
              stockNo: stockNo || String(i + 1).padStart(3, "0"),
              unit,
              description: desc + (brand ? ` [Brand: ${brand}]` : ""),
              quantity: qty,
              estimatedUnitCost: price,
              estimatedCost: itemCost,
              productId: null,
            });
          });

          setSummary({
            total: dataRows.filter(r => r.some(c => c !== "")).length,
            success: validItems.length,
            invalid: errors.length,
            errors,
          });

          if (validItems.length > 0) {
            onItemsParsed(validItems);
          }
        } catch (err: any) {
          setSummary({ total: 0, success: 0, invalid: 1, errors: [{ row: 0, column: "—", message: err.message || "Failed to parse spreadsheet file." }] });
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [onItemsParsed]
  );

  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 space-y-3 print:hidden">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-primary)]">📥 Import Items from Spreadsheet</span>
          <span className="text-[10px] text-[var(--text-muted)]">(.xlsx or .csv)</span>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
        >
          ⬇️ Download Excel Template
        </button>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
          isDragging ? "border-[var(--accent)] bg-red-50/50" : "border-[var(--border)] hover:border-[var(--accent)]"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) parseFile(file);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) parseFile(file);
            e.target.value = "";
          }}
          disabled={disabled}
        />
        {isParsing ? (
          <div className="text-xs text-[var(--text-muted)] font-medium">Parsing line items…</div>
        ) : fileName ? (
          <div className="text-xs font-semibold text-[var(--text-primary)]">📄 {fileName}</div>
        ) : (
          <div className="text-xs text-[var(--text-muted)]">
            Drag & drop `.xlsx` / `.csv` file here or <span className="text-[var(--accent)] font-bold">browse</span>
          </div>
        )}
      </div>

      {summary && (
        <div className={`rounded-lg border p-3 text-xs space-y-1 ${
          summary.invalid > 0 ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"
        }`}>
          <div className="font-bold flex items-center gap-3">
            <span>📊 Total Items: {summary.total}</span>
            <span className="text-emerald-700">✅ Imported: {summary.success}</span>
            {summary.invalid > 0 && <span className="text-amber-700">⚠️ Invalid: {summary.invalid}</span>}
          </div>
          {summary.errors.map((err, idx) => (
            <div key={idx} className="text-amber-800 text-[11px]">
              Row {err.row} [{err.column}]: {err.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
