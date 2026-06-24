"use client";

import React, { useState } from "react";
import { saveWorkflowConfigAction } from "@/app/actions/workflow";

interface WorkflowStep {
  role: string;
  level: number;
  action: string;
  parallel?: boolean;
  escalationDays?: number;
}

interface WorkflowConfig {
  id: number;
  moduleName: string;
  steps: any; // parsed JSON steps array
  isActive: boolean;
}

interface WorkflowsBuilderClientProps {
  initialConfigs: WorkflowConfig[];
}

const MODULES = ["PR", "PPMP", "PO"];
const ROLES = ["End User", "Procurement Officer", "Administrative Approver", "Supplier"];

export default function WorkflowsBuilderClient({ initialConfigs }: WorkflowsBuilderClientProps) {
  const [configs, setConfigs] = useState<WorkflowConfig[]>(initialConfigs);
  const [selectedModule, setSelectedModule] = useState<string>("PR");
  
  // Current active config
  const activeConfig = configs.find(c => c.moduleName === selectedModule) || {
    id: 0,
    moduleName: selectedModule,
    steps: [],
    isActive: true
  };

  const steps = Array.isArray(activeConfig.steps) ? (activeConfig.steps as unknown as WorkflowStep[]) : [];

  // Form states for adding/editing steps
  const [newStepRole, setNewStepRole] = useState("Administrative Approver");
  const [newStepAction, setNewStepAction] = useState("Approve");
  const [newStepLevel, setNewStepLevel] = useState(1);
  const [escalationDays, setEscalationDays] = useState(3);
  const [parallel, setParallel] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveWorkflow = async (updatedSteps: WorkflowStep[]) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await saveWorkflowConfigAction({
        moduleName: selectedModule,
        steps: updatedSteps,
        isActive: activeConfig.isActive
      });

      if (res.success && res.config) {
        setConfigs(prev => {
          const exists = prev.some(c => c.moduleName === selectedModule);
          if (exists) {
            return prev.map(c => c.moduleName === selectedModule ? (res.config as any) : c);
          } else {
            return [...prev, (res.config as any)];
          }
        });
        setSuccessMsg(`Workflow configuration for ${selectedModule} saved successfully.`);
      } else {
        setErrorMsg(res.error || "Failed to save workflow configuration.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddStep = () => {
    // Add step and sort by level
    const newStep: WorkflowStep = {
      role: newStepRole,
      level: Number(newStepLevel),
      action: newStepAction,
      parallel,
      escalationDays: Number(escalationDays)
    };

    const updatedSteps = [...steps, newStep].sort((a, b) => a.level - b.level);
    handleSaveWorkflow(updatedSteps);
  };

  const handleDeleteStep = (indexToDelete: number) => {
    const updatedSteps = steps.filter((_, idx) => idx !== indexToDelete);
    handleSaveWorkflow(updatedSteps);
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
      
      {/* Sidebar: Module Selection & Step Adder */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} className="lg:col-span-1">
        
        {/* Module Picker */}
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
          boxShadow: theme.shadow
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, marginBottom: "1rem" }}>Target Module</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {MODULES.map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModule(mod)}
                style={{
                  width: "100%", padding: "0.75rem", borderRadius: "0.75rem",
                  border: selectedModule === mod ? `1.5px solid ${theme.crimson}` : "1px solid rgba(0,0,0,0.06)",
                  background: selectedModule === mod ? "rgba(126, 25, 27, 0.04)" : "#fff",
                  color: selectedModule === mod ? theme.crimson : theme.textMain,
                  fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s"
                }}
              >
                {mod === "PR" && "Purchase Request (PR)"}
                {mod === "PPMP" && "Project Planning (PPMP)"}
                {mod === "PO" && "Purchase Order (PO)"}
              </button>
            ))}
          </div>
        </div>

        {/* Step Adder Form */}
        <div style={{
          background: theme.glassBg, backdropFilter: "blur(20px)",
          border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "1.5rem",
          boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1rem"
        }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: theme.textMain }}>Add Approval Step</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Approving Role</label>
            <select
              value={newStepRole}
              onChange={(e) => setNewStepRole(e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem", background: "#fff" }}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Hierarchy Level</label>
              <input
                type="number"
                min={1}
                max={10}
                value={newStepLevel}
                onChange={(e) => setNewStepLevel(parseInt(e.target.value) || 1)}
                style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Escalation Days</label>
              <input
                type="number"
                min={1}
                value={escalationDays}
                onChange={(e) => setEscalationDays(parseInt(e.target.value) || 3)}
                style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 800, color: theme.textMuted, textTransform: "uppercase" }}>Action Name</label>
            <input
              type="text"
              value={newStepAction}
              onChange={(e) => setNewStepAction(e.target.value)}
              placeholder="e.g. Audit, Review, Verify, Approve"
              style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(0,0,0,0.12)", fontSize: "0.8rem" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.25rem 0" }}>
            <input
              type="checkbox"
              id="parallel"
              checked={parallel}
              onChange={(e) => setParallel(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="parallel" style={{ fontSize: "0.78rem", fontWeight: 600, color: theme.textMain, cursor: "pointer" }}>
              Parallel Verification Check
            </label>
          </div>

          <button
            onClick={handleAddStep}
            disabled={isProcessing}
            style={{
              padding: "0.6rem", borderRadius: "0.5rem", border: "none",
              background: theme.crimson, color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
              marginTop: "0.5rem"
            }}
          >
            ➕ Add Gate to Sequence
          </button>
        </div>
      </div>

      {/* Main View: Interactive Approval Sequence Visualizer */}
      <div style={{
        background: theme.glassBg, backdropFilter: "blur(20px)",
        border: `1px solid ${theme.glassBorder}`, borderRadius: "1.25rem", padding: "2rem",
        boxShadow: theme.shadow, display: "flex", flexDirection: "column", gap: "1.5rem"
      }} className="lg:col-span-2">
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: theme.textMain, margin: 0 }}>
            {selectedModule} Workflow Approval Sequence
          </h2>
          <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.82rem", color: theme.textMuted }}>
            Steps are processed sequentially based on the hierarchy level. Dragging is simulated through level values.
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

        {/* Visual Flow Timeline */}
        {steps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: theme.textMuted, border: "2px dashed rgba(0,0,0,0.06)", borderRadius: "1rem" }}>
            No approval steps configured. Add steps from the sidebar to establish a routing workflow.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {steps.map((step, index) => (
              <div
                key={index}
                style={{
                  display: "flex", alignItems: "center", justifyBetween: "center", justifyContent: "space-between",
                  padding: "1rem 1.25rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.01)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {/* Level Badge */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.crimson}, ${theme.gold})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: "0.85rem"
                  }}>
                    L{step.level}
                  </div>

                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: theme.textMain }}>{step.role}</span>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.15rem", fontSize: "0.72rem", color: theme.textMuted }}>
                      <span>Action: <strong>{step.action}</strong></span>
                      <span>•</span>
                      <span>Escalation: {step.escalationDays || 3} days</span>
                      {step.parallel && (
                        <>
                          <span>•</span>
                          <span style={{ color: "#3b82f6", fontWeight: 700 }}>Parallel Verification</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteStep(index)}
                  disabled={isProcessing}
                  style={{
                    padding: "0.35rem 0.75rem", borderRadius: "0.35rem", border: "none",
                    background: "rgba(239, 68, 68, 0.08)", color: "#ef4444",
                    fontWeight: 700, fontSize: "0.72rem", cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
