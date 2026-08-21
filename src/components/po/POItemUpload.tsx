"use client";

import React, { useRef, useState, useCallback } from "react";
import * as XLSX from "xlsx";

export interface ParsedPoItem {
  description: string;
  brand?: string | null;
  specification?: string | null;
  unit?: string | null;
  stockNo?: string | null;
  quantity: number;
  unitPrice: number;
}

interface ParseError {
  row: number;
  column: string;
  message: string;
}

interface POItemUploadProps {
  onItemsParsed: (items: ParsedPoItem[]) => void;
  disabled?: boolean;
}

const REQUIRED_COLUMNS = ["Description", "Unit", "Quantity", "Unit Cost"];
const OPTIONAL_COLUMNS = ["Brand", "Specification", "Stock No", "Remarks"];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

// Generate and download a .xlsx template
function downloadTemplate() {
  const wb = XLSX.utils.book_new();
  const headers = ALL_COLUMNS;
  const example = [
    ["Office Supplies — A4 Bond Paper", "Bundle", 10, 250.0, "Navigator", "80gsm", "ST-001", ""],
    ["Ballpen (Blue)", "Box", 5, 120.0, "Pilot", "", "", ""],
  ];
  const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);

  // Column widths
  ws["!cols"] = [
    { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "PO Items");
  XLSX.writeFile(wb, "PO_Items_Template.xlsx");
}

// Download error report as .xlsx
function downloadErrorReport(errors: ParseError[]) {
  const wb = XLSX.utils.book_new();
  const rows = [["Row", "Column", "Error"], ...errors.map(e => [e.row, e.column, e.message])];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 6 }, { wch: 18 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws, "Errors");
  XLSX.writeFile(wb, "PO_Upload_Errors.xlsx");
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

export default function POItemUpload({ onItemsParsed, disabled }: POItemUploadProps) {
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
          const descCol = findColumn(headers, ["description", "item description", "item name"]);
          const unitCol = findColumn(headers, ["unit", "uom"]);
          const qtyCol = findColumn(headers, ["quantity", "qty"]);
          const priceCol = findColumn(headers, ["unit cost", "unit price", "price", "cost"]);
          const brandCol = findColumn(headers, ["brand"]);
          const specCol = findColumn(headers, ["specification", "specifications", "spec", "specs"]);
          const stockCol = findColumn(headers, ["stock no", "stock number", "property no", "stock/property no"]);

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
          const validItems: ParsedPoItem[] = [];
          const errors: ParseError[] = [];

          dataRows.forEach((row, i) => {
            const rowNum = i + 2;
            const desc = row[descCol]?.toString().trim();
            const unit = row[unitCol]?.toString().trim();
            const qty = Number(row[qtyCol]);
            const price = Number(row[priceCol]);

            if (!desc) {
              errors.push({ row: rowNum, column: "Description", message: "Description is required." });
              return;
            }
            if (!unit) {
              errors.push({ row: rowNum, column: "Unit", message: "Unit is required." });
              return;
            }
            if (!qty || isNaN(qty) || qty <= 0) {
              errors.push({ row: rowNum, column: "Quantity", message: `Quantity must be a positive number (got: ${row[qtyCol]}).` });
              return;
            }
            if (isNaN(price) || price < 0) {
              errors.push({ row: rowNum, column: "Unit Cost", message: `Unit Cost must be a non-negative number (got: ${row[priceCol]}).` });
              return;
            }

            validItems.push({
              description: desc,
              unit,
              quantity: qty,
              unitPrice: price,
              brand: brandCol !== -1 ? row[brandCol]?.toString().trim() || null : null,
              specification: specCol !== -1 ? row[specCol]?.toString().trim() || null : null,
              stockNo: stockCol !== -1 ? row[stockCol]?.toString().trim() || null : null,
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
          setSummary({ total: 0, success: 0, invalid: 1, errors: [{ row: 0, column: "—", message: err.message || "Failed to parse file." }] });
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [onItemsParsed]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-secondary,#f8f9fa)] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--text-primary)]">📥 Upload PO Items</span>
          <span className="text-xs text-[var(--text-muted)]">.xlsx or .csv</span>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
        >
          ⬇️ Download Template
        </button>
      </div>

      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? "border-[var(--accent)] bg-[var(--accent-glass)]" : "border-[var(--border)] hover:border-[var(--accent)]"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
        />
        {isParsing ? (
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Parsing file…
          </div>
        ) : fileName ? (
          <div className="text-sm text-[var(--text-primary)] font-medium">📄 {fileName}</div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl">📂</div>
            <p className="text-sm text-[var(--text-muted)]">
              Drag & drop or <span className="text-[var(--accent)] font-semibold">browse</span> to upload
            </p>
            <p className="text-xs text-[var(--text-muted)]">Required columns: Description, Unit, Quantity, Unit Cost</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className={`rounded-lg border p-3 space-y-2 text-xs ${
          summary.invalid > 0 ? "border-[var(--border-accent)] bg-[var(--secondary-dim)]" : "border-[var(--border-accent)] bg-[var(--accent-glass)]"
        }`}>
          <div className="flex items-center gap-4 font-semibold">
            <span>📊 {summary.total} Items Parsed</span>
            <span className="text-[var(--accent)]">✅ {summary.success} Successful</span>
            {summary.invalid > 0 && (
              <span className="text-[var(--secondary)]">⚠️ {summary.invalid} Invalid</span>
            )}
          </div>
          {summary.errors.length > 0 && (
            <div className="space-y-1">
              {summary.errors.slice(0, 3).map((err, i) => (
                <div key={i} className="text-[var(--secondary)]">
                  Row {err.row} [{err.column}]: {err.message}
                </div>
              ))}
              {summary.errors.length > 3 && (
                <div className="text-[var(--secondary)]">…and {summary.errors.length - 3} more errors</div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); downloadErrorReport(summary.errors); }}
                className="mt-1 text-xs font-semibold text-[var(--secondary)] underline"
              >
                ⬇️ Download Error Report
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
