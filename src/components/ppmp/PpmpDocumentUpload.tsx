"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, X, Eye, Download, CheckCircle2 } from "lucide-react";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ALLOWED_EXTENSIONS = [".pdf", ".xlsx", ".xls"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface PpmpDocument {
  url: string;
  path: string;
  name: string;
  size: number;
  uploadedAt: string;
}

interface PpmpDocumentUploadProps {
  ppmpId?: number;
  ppmpStatus?: string;
  preparedById?: string;
  currentDocument: PpmpDocument | null;
  onDocumentChange: (doc: PpmpDocument | null) => void;
}

export default function PpmpDocumentUpload({
  ppmpId,
  ppmpStatus,
  preparedById,
  currentDocument,
  onDocumentChange,
}: PpmpDocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canModify = !ppmpId || ppmpStatus === "Draft" || ppmpStatus === "Returned";

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return "Only PDF and Excel files (.pdf, .xlsx, .xls) are allowed.";
      }
    }
    if (file.size > MAX_SIZE) {
      return `File size exceeds the 10MB limit (${formatFileSize(file.size)}).`;
    }
    return null;
  };

  const uploadToSupabase = async (file: File): Promise<PpmpDocument> => {
    const { createBrowserClient } = await import("@supabase/ssr");
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const ext = file.name.substring(file.name.lastIndexOf("."));
    if (!preparedById) throw new Error("Authenticated user information is missing.");
    const filePath = `${preparedById}/ppmp/${ppmpId || "draft"}/${crypto.randomUUID()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("ppmp-documents")
      .upload(filePath, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData, error: signedUrlError } = await supabase.storage
      .from("ppmp-documents")
      .createSignedUrl(filePath, 60 * 15);

    if (signedUrlError) {
      await supabase.storage.from("ppmp-documents").remove([filePath]);
      throw new Error(`Could not secure the uploaded document: ${signedUrlError.message}`);
    }

    return {
      url: urlData.signedUrl,
      path: filePath,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  };

  const handleFile = async (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    try {
      const doc = await uploadToSupabase(file);
      onDocumentChange(doc);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = async () => {
    if (!canModify || !currentDocument) return;
    if (confirm("Remove the uploaded PPMP document?")) {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error: removeError } = await supabase.storage
        .from("ppmp-documents")
        .remove([currentDocument.path]);
      if (removeError) {
        setError(`Remove failed: ${removeError.message}`);
        return;
      }
      onDocumentChange(null);
    }
  };

  if (currentDocument) {
    return (
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "0.75rem",
          background: "var(--bg-deep)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FileText size={16} style={{ color: "var(--accent)" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentDocument.name}
            </p>
            <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", margin: 0 }}>
              {formatFileSize(currentDocument.size)}
            </p>
          </div>
          <a
            href={currentDocument.url}
            target="_blank"
            rel="noopener noreferrer"
            title="View"
            style={{
              padding: "0.3rem",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Eye size={12} style={{ color: "var(--text-secondary)" }} />
          </a>
          <a
            href={currentDocument.url}
            download={currentDocument.name}
            title="Download"
            style={{
              padding: "0.3rem",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Download size={12} style={{ color: "var(--text-secondary)" }} />
          </a>
          {canModify && (
            <button
              type="button"
              onClick={handleRemove}
              title="Remove"
              style={{
                padding: "0.3rem",
                borderRadius: "4px",
                border: "1px solid var(--accent-glass)",
                background: "rgba(123, 30, 30, 0.05)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={12} style={{ color: "var(--accent)" }} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.xlsx,.xls"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "8px",
          padding: "1.25rem",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "rgba(123, 30, 30, 0.03)" : "transparent",
          transition: "all 0.15s",
        }}
      >
        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Uploading...</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
            <Upload size={18} style={{ color: "var(--text-muted)" }} />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0, fontWeight: 600 }}>
              Upload PPMP Document
            </p>
            <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", margin: 0 }}>
              PDF or Excel (.xlsx, .xls) — max 10MB
            </p>
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: "0.7rem", color: "var(--accent)", marginTop: "0.35rem" }}>{error}</p>
      )}
    </div>
  );
}
