"use client";

import React, { useState } from "react";
import { saveFormTemplateAction } from "@/app/actions/form-templates";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "currency" | "date" | "dropdown" | "checkbox" | "radio" | "file" | "signature";
  required: boolean;
  options?: string[];
}

interface FormTemplate {
  id: number;
  name: string;
  fields: any; // JSON array of FormFields
  version: number;
  notes: string | null;
  isActive: boolean;
}

interface FormTemplatesClientProps {
  initialTemplates: FormTemplate[];
}

const FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number Input" },
  { value: "currency", label: "Currency (₱)" },
  { value: "date", label: "Date Picker" },
  { value: "dropdown", label: "Dropdown Select" },
  { value: "checkbox", label: "Checkbox Check" },
  { value: "signature", label: "Digital Signature" }
];

export default function FormTemplatesClient({ initialTemplates }: FormTemplatesClientProps) {
  const [templates, setTemplates] = useState<FormTemplate[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    initialTemplates.length > 0 ? initialTemplates[0].id : null
  );

  // New Template creation form states
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateNotes, setNewTemplateNotes] = useState("");

  // Editing template fields states
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<FormField["type"]>("text");
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldOptions, setNewFieldOptions] = useState(""); // Comma separated for dropdowns

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const fields = selectedTemplate && Array.isArray(selectedTemplate.fields)
    ? (selectedTemplate.fields as unknown as FormField[])
    : [];

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await saveFormTemplateAction({
        name: newTemplateName,
        fields: [],
        notes: newTemplateNotes
      });

      if (res.success && res.template) {
        const created = res.template as unknown as FormTemplate;
        setTemplates(prev => [created, ...prev]);
        setSelectedTemplateId(created.id);
        setNewTemplateName("");
        setNewTemplateNotes("");
        setSuccessMsg(`Form template "${created.name}" created successfully.`);
      } else {
        setErrorMsg(res.error || "Failed to create form template.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddField = () => {
    if (!selectedTemplate) return;
    if (!newFieldName.trim() || !newFieldLabel.trim()) {
      setErrorMsg("Field Name and Label are required.");
      return;
    }

    const optionsArray = newFieldOptions
      ? newFieldOptions.split(",").map(o => o.trim()).filter(Boolean)
      : undefined;

    const newField: FormField = {
      name: newFieldName.replace(/\s+/g, ""), // strip spaces
      label: newFieldLabel,
      type: newFieldType,
      required: newFieldRequired,
      options: optionsArray
    };

    const updatedFields = [...fields, newField];
    handleSaveFields(updatedFields);
  };

  const handleDeleteField = (indexToDelete: number) => {
    if (!selectedTemplate) return;
    const updatedFields = fields.filter((_, idx) => idx !== indexToDelete);
    handleSaveFields(updatedFields);
  };

  const handleSaveFields = async (updatedFields: FormField[]) => {
    if (!selectedTemplate) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await saveFormTemplateAction({
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        fields: updatedFields,
        notes: selectedTemplate.notes || undefined
      });

      if (res.success && res.template) {
        const updated = res.template as unknown as FormTemplate;
        setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updated : t));
        setSuccessMsg(`Form template saved successfully. Version incremented to v${updated.version}.`);
        // Reset field adder states
        setNewFieldName("");
        setNewFieldLabel("");
        setNewFieldType("text");
        setNewFieldRequired(true);
        setNewFieldOptions("");
      } else {
        setErrorMsg(res.error || "Failed to save form template.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
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

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="lg:grid-cols-3">
      {/* Sidebar: Form List & Template Creator */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-1">
        
        {/* Template List */}
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
          boxShadow: theme.shadow, maxHeight: "350px", overflowY: "auto"
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1rem" }}>Form Templates</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {templates.map((temp) => {
              const active = temp.id === selectedTemplateId;
              return (
                <button
                  key={temp.id}
                  onClick={() => setSelectedTemplateId(temp.id)}
                  style={{
                    width: "100%", textAlign: "left", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                    border: active ? `1.5px solid ${theme.crimson}` : "1px solid rgba(0,0,0,0.06)",
                    background: active ? "rgba(126, 25, 27, 0.04)" : "#fff",
                    cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <span style={{ fontWeight: 800, color: active ? theme.crimson : theme.textMain, fontSize: "0.85rem" }}>{temp.name}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "rgba(0,0,0,0.05)", padding: "0.15rem 0.4rem", borderRadius: "0.25rem" }}>
                      v{temp.version}
                    </span>
                  </div>
                  {temp.notes && (
                    <span style={{ fontSize: "0.72rem", color: theme.textMuted, marginTop: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                      {temp.notes}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Template Creator Form */}
        <form onSubmit={handleCreateTemplate} style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
          boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1rem"
        }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: theme.textMain }}>Create Form Template</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Template Name</label>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g. Bid Solicitation Template"
              style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Description / Notes</label>
            <textarea
              value={newTemplateNotes}
              onChange={(e) => setNewTemplateNotes(e.target.value)}
              placeholder="Form version differences, targets..."
              style={{ width: "100%", height: "60px", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem", resize: "none" }}
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            style={{
              padding: "0.6rem", borderRadius: "0.5rem", border: "none",
              background: theme.crimson, color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
            }}
          >
            Create Form Master
          </button>
        </form>
      </div>

      {/* Main workspace: Fields Editor & Form Preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-2">
        {selectedTemplate ? (
          <>
            {/* Field Adder and Editor Panel */}
            <div style={{
              background: theme.glassBg, backdropFilter: "blur(20px)",
              border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
              boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1.5rem"
            }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: theme.textMain, margin: 0 }}>
                  Modify Structure: {selectedTemplate.name}
                </h2>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: theme.textMuted }}>
                  Configured Version: <strong>v{selectedTemplate.version}</strong>. Saving increments the schema version.
                </p>
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

              {/* Fields Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                      <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: theme.textMuted }}>Variable Name</th>
                      <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: theme.textMuted }}>Display Label</th>
                      <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: theme.textMuted }}>Field Type</th>
                      <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: theme.textMuted }}>Required</th>
                      <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", color: theme.textMuted }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                        <td style={{ padding: "0.75rem", fontWeight: 700, fontFamily: "monospace" }}>{field.name}</td>
                        <td style={{ padding: "0.75rem" }}>{field.label}</td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>{field.type}</td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>{field.required ? "Yes" : "No"}</td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>
                          <button
                            onClick={() => handleDeleteField(idx)}
                            disabled={isProcessing}
                            style={{ padding: "0.25rem 0.5rem", borderRadius: "0.25rem", border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 700, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {fields.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: theme.textMuted }}>
                          No fields defined in this template. Add fields below.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Field Adder Section */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Add New Field Row</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="grid grid-cols-1 md:grid-cols-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Variable Name (CamelCase)</label>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g. deliveryLeadTime"
                      style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Display Label</label>
                    <input
                      type="text"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="e.g. Delivery Lead Time"
                      style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="grid grid-cols-1 md:grid-cols-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Field Input Type</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem", background: "#fff" }}
                    >
                      {FIELD_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Dropdown Options (Comma separated)</label>
                    <input
                      type="text"
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      disabled={newFieldType !== "dropdown" && newFieldType !== "checkbox"}
                      placeholder="e.g. Yes, No, Maybe"
                      style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      id="required"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                    <label htmlFor="required" style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.textMain, cursor: "pointer" }}>
                      Required field validation
                    </label>
                  </div>

                  <button
                    onClick={handleAddField}
                    disabled={isProcessing}
                    style={{
                      padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none",
                      background: theme.crimson, color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
                    }}
                  >
                    ➕ Insert Field Row
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Live Preview Box */}
            <div style={{
              background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "1.25rem", padding: "2rem",
              boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1.5rem"
            }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>Simulated Live preview</h3>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: theme.textMuted }}>
                  This is how the custom form will render on the requisitioner or evaluator interface.
                </p>
              </div>

              <div style={{
                padding: "1.5rem", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.75rem",
                background: "var(--bg-light)", display: "flex", flexDirection: "column", gap: "1rem"
              }}>
                {fields.map((f, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: theme.textMain }}>
                      {f.label} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                    </label>
                    
                    {f.type === "text" && (
                      <input type="text" placeholder={`Enter ${f.label.toLowerCase()}...`} style={{ padding: "0.5rem", borderRadius: "0.35rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", background: "#fff" }} disabled />
                    )}
                    {f.type === "textarea" && (
                      <textarea placeholder={`Enter details...`} style={{ padding: "0.5rem", borderRadius: "0.35rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", height: "60px", background: "#fff" }} disabled />
                    )}
                    {f.type === "number" && (
                      <input type="number" style={{ width: "120px", padding: "0.5rem", borderRadius: "0.35rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", background: "#fff" }} disabled />
                    )}
                    {f.type === "currency" && (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ padding: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", borderRight: "none", background: "rgba(0,0,0,0.04)", borderRadius: "0.35rem 0 0 0.35rem", fontSize: "0.85rem" }}>₱</span>
                        <input type="number" style={{ padding: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "0 0.35rem 0.35rem 0", fontSize: "0.85rem", background: "#fff" }} disabled />
                      </div>
                    )}
                    {f.type === "date" && (
                      <input type="date" style={{ padding: "0.5rem", borderRadius: "0.35rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", background: "#fff" }} disabled />
                    )}
                    {f.type === "dropdown" && (
                      <select style={{ padding: "0.5rem", borderRadius: "0.35rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", background: "#fff" }} disabled>
                        <option value="">-- Choose Option --</option>
                        {f.options?.map((o, index) => <option key={index} value={o}>{o}</option>)}
                      </select>
                    )}
                    {f.type === "checkbox" && (
                      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        {f.options?.map((o, index) => (
                          <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <input type="checkbox" disabled />
                            <span style={{ fontSize: "0.82rem" }}>{o}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {f.type === "signature" && (
                      <div style={{ border: "1.5px dashed rgba(0,0,0,0.15)", borderRadius: "0.5rem", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted, fontSize: "0.8rem", fontStyle: "italic", background: "#fff" }}>
                        E-Signature Box Placeholder
                      </div>
                    )}
                  </div>
                ))}
                {fields.length === 0 && (
                  <div style={{ textAlign: "center", color: theme.textMuted, fontSize: "0.82rem" }}>
                    Form is empty. Add fields to visualize preview.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{
            background: theme.glassBg, backdropFilter: "blur(20px)",
            border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "4rem",
            boxShadow: theme.shadow, textAlign: "center", color: theme.textMuted
          }}>
            Select a Form Template from the sidebar to inspect its structure and build fields.
          </div>
        )}
      </div>
    </div>
  );
}
