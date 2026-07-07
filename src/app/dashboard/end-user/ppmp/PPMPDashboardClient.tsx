"use client";

import React, { useState, useTransition } from "react";
import { ProductListItem } from "@/features/catalog/server/queries";
import PPMPMarketplace from "@/components/ppmp/PPMPMarketplace";
import PPMPDraftCart, { DraftItem } from "@/components/ppmp/PPMPDraftCart";
import {
  createPpmpAction,
  submitPpmpAction,
  deletePpmpAction,
  convertPpmpToPrAction,
} from "@/app/actions/ppmp";
import Link from "next/link";

interface PPMPDashboardClientProps {
  products: ProductListItem[];
  initialPpmps: any[];
  budgetAllocated: number;
  budgetAlreadyPlanned: number;
  department: string;
  office: string;
  userId: string;
}

type DashboardTab = "list" | "create";

export default function PPMPDashboardClient({
  products,
  initialPpmps,
  budgetAllocated,
  budgetAlreadyPlanned,
  department,
  office,
  userId,
}: PPMPDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("list");
  const [ppmps, setPpmps] = useState<any[]>(initialPpmps);
  const [cartItems, setCartItems] = useState<DraftItem[]>([]);
  const [ppmpNumber, setPpmpNumber] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [fundingSource, setFundingSource] = useState("GAA 2026");
  const [editingPpmpId, setEditingPpmpId] = useState<number | null>(null);

  const [addProductDialogItem, setAddProductDialogItem] = useState<ProductListItem | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [addSpecifications, setAddSpecifications] = useState<string>("");

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  // 1. Add item to cart
  const handleAddItem = (product: ProductListItem) => {
    setMessage("");
    setErrorMsg("");
    const existingIndex = cartItems.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          product,
          quantity: 1,
          description: product.description || "",
        },
      ]);
    }

    // Switch tab to let them see their cart/PPMP draft workspace
    // actually, keep them in Marketplace so they can continue shopping,
    // and show a notification or update cart counter.
    setMessage(`"${product.name}" added to your PPMP Draft.`);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const addProductId = urlParams.get("add_product");
      if (addProductId) {
        const pId = parseInt(addProductId, 10);
        const targetProd = products.find((p) => p.id === pId);
        if (targetProd) {
          setAddProductDialogItem(targetProd);
          setAddQuantity(1);
          setAddSpecifications(targetProd.description || "");
          setActiveTab("create");
        }
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, [products]);

  // 2. Remove item from cart
  const handleRemoveItem = (productId: number) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId));
  };

  // 3. Update item quantity
  const handleUpdateQuantity = (productId: number, qty: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  // 4. Update item description (remarks)
  const handleUpdateDescription = (productId: number, desc: string) => {
    setCartItems(
      cartItems.map((item) =>
        item.product.id === productId ? { ...item, description: desc } : item
      )
    );
  };

  // 5. Update draft metadata
  const handleUpdateMetadata = (key: string, val: any) => {
    if (key === "ppmpNumber") setPpmpNumber(val);
    if (key === "projectTitle") setProjectTitle(val);
    if (key === "fundingSource") setFundingSource(val);
  };

  // 6. Cancel draft edits
  const handleCancel = () => {
    setCartItems([]);
    setPpmpNumber("");
    setProjectTitle("");
    setEditingPpmpId(null);
    setMessage("");
    setErrorMsg("");
    setActiveTab("list");
  };

  // 7. Save Draft
  const handleSaveDraft = () => {
    setErrorMsg("");
    setMessage("");

    const currentDraftTotal = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.estimatedUnitCost,
      0
    );

    startTransition(async () => {
      const res = await createPpmpAction({
        id: editingPpmpId || undefined,
        ppmpNumber,
        projectTitle,
        department,
        office,
        fundingSource,
        fiscalYear: 2026,
        estimatedBudget: currentDraftTotal,
        preparedById: userId,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          generalDescription: item.description || item.product.name,
          quantity: item.quantity,
          estimatedUnitCost: item.product.estimatedUnitCost,
        })),
      });

      if (res.success) {
        setMessage(
          `PPMP draft "${ppmpNumber}" successfully saved.`
        );
        // Reset and redirect
        setCartItems([]);
        setPpmpNumber("");
        setProjectTitle("");
        setEditingPpmpId(null);
        setActiveTab("list");
        // Reload list
        window.location.reload();
      } else {
        setErrorMsg(res.error || "Failed to save PPMP draft.");
      }
    });
  };

  // 8. Submit Draft
  const handleSubmitPpmp = async (id: number, num: string) => {
    if (!confirm(`Are you sure you want to submit PPMP ${num} for review?`)) return;
    const res = await submitPpmpAction(id);
    if (res.success) {
      alert(`PPMP ${num} submitted successfully!`);
      window.location.reload();
    } else {
      alert(res.error || "Submission failed.");
    }
  };

  // 9. Delete Draft
  const handleDeletePpmp = async (id: number, num: string) => {
    if (!confirm(`Are you sure you want to delete PPMP draft ${num}?`)) return;
    const res = await deletePpmpAction(id);
    if (res.success) {
      alert(`PPMP ${num} successfully deleted.`);
      window.location.reload();
    } else {
      alert(res.error || "Deletion failed.");
    }
  };

  // 10. Load Draft for Editing
  const handleEditPpmp = (ppmp: any) => {
    setEditingPpmpId(ppmp.id);
    setPpmpNumber(ppmp.ppmpNumber);
    setProjectTitle(ppmp.projectTitle);
    setFundingSource(ppmp.fundingSource);
    
    // Map items
    const mappedItems: DraftItem[] = ppmp.items.map((item: any) => {
      // Find matching catalog product
      const product = products.find((p) => p.id === item.productId) || {
        id: item.productId,
        productCode: item.product?.productCode || "",
        name: item.generalDescription,
        description: item.generalDescription,
        category: { id: 0, name: "General" },
        brand: null,
        unit: item.product?.unit || { id: 0, name: "unit", abbreviation: "unit" },
        estimatedUnitCost: Number(item.estimatedUnitCost),
        imageUrl: null,
        popularity: 0,
        updatedAt: new Date(),
        lowestPrice: Number(item.estimatedUnitCost),
        availableSupplierCount: 1,
        availability: "Available" as const,
      };

      return {
        product,
        quantity: item.quantity,
        description: item.generalDescription,
      };
    });

    setCartItems(mappedItems);
    setActiveTab("create");
  };

  // 11. Convert PPMP to PR
  const handleConvertToPr = async (id: number, num: string) => {
    if (!confirm(`Are you sure you want to convert approved PPMP ${num} to a Purchase Request?`)) return;
    const res = await convertPpmpToPrAction(id);
    if (res.success) {
      alert(`Purchase Request successfully generated!`);
      window.location.reload();
    } else {
      alert(res.error || "Conversion failed.");
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", fontFamily: '"Inter", sans-serif' }}>
      
      {addProductDialogItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 250,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "1.25rem",
              maxWidth: "500px",
              width: "100%",
              padding: "2rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              fontFamily: '"Inter", sans-serif',
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Add Item to PPMP Draft
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Preselected Product: <strong>{addProductDialogItem.name}</strong>
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Product Name
                </label>
                <input
                  type="text"
                  disabled
                  value={addProductDialogItem.name}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "rgba(0,0,0,0.03)",
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    disabled
                    value={addProductDialogItem.unit.name}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "rgba(0,0,0,0.03)",
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                    Estimated Unit Cost
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`₱${addProductDialogItem.estimatedUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "rgba(0,0,0,0.03)",
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(parseInt(e.target.value) || 1)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-deep)",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                  Specifications / Remarks
                </label>
                <textarea
                  value={addSpecifications}
                  onChange={(e) => setAddSpecifications(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-deep)",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                    outline: "none",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
              <button
                type="button"
                onClick={() => setAddProductDialogItem(null)}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "rgba(0,0,0,0.04)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const existingIndex = cartItems.findIndex((item) => item.product.id === addProductDialogItem.id);
                  const validatedQty = Math.max(1, addQuantity);
                  if (existingIndex > -1) {
                    const updated = [...cartItems];
                    updated[existingIndex].quantity = validatedQty;
                    updated[existingIndex].description = addSpecifications;
                    setCartItems(updated);
                  } else {
                    setCartItems([
                      ...cartItems,
                      {
                        product: addProductDialogItem,
                        quantity: validatedQty,
                        description: addSpecifications,
                      },
                    ]);
                  }
                  setMessage(`"${addProductDialogItem.name}" added to your PPMP Draft.`);
                  setAddProductDialogItem(null);
                }}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#7e191b",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                Add to Draft Cart
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.5px" }}>
            Project Procurement Management Plan (PPMP)
          </h1>
          <p style={{ marginTop: "0.25rem", fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
            Prepare, monitor, and submit your annual procurement requirements linked to the live catalog.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("list")}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "999px",
              border: "1px solid var(--border)",
              cursor: "pointer",
              background: activeTab === "list" ? "var(--accent)" : "var(--surface)",
              color: activeTab === "list" ? "white" : "var(--text-secondary)",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            📋 Planning Logs
          </button>
          <button
            onClick={() => setActiveTab("create")}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "999px",
              border: "1px solid var(--border)",
              cursor: "pointer",
              background: activeTab === "create" ? "var(--accent)" : "var(--surface)",
              color: activeTab === "create" ? "white" : "var(--text-secondary)",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            🛒 Marketplace Planner {cartItems.length > 0 && `(${cartItems.length})`}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div style={{ padding: "1rem", borderRadius: "0.75rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#059669", fontSize: "0.85rem", fontWeight: 600 }}>
          {message}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: "1rem", borderRadius: "0.75rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", fontSize: "0.85rem", fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {/* Primary views */}
      {activeTab === "list" ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "1.25rem",
            overflow: "hidden",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", backgroundColor: "rgba(255,255,255,0.02)" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Planning Logs</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "left" }}>PPMP No</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "left" }}>Project Title</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "left" }}>Department</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>Budget Limit</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "center" }}>Workflow Timeline</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ppmps.map((ppmp) => {
                  const hasPr = ppmp.purchaseRequests && ppmp.purchaseRequests.length > 0;
                  const prRecord = hasPr ? ppmp.purchaseRequests[0] : null;

                  // Resolve Timeline index
                  let timelineStep = 0; // Draft
                  if (ppmp.status === "Submitted") timelineStep = 1;
                  else if (ppmp.status === "Returned") timelineStep = 0; // Back to draft/returned
                  else if (ppmp.status === "Approved") timelineStep = 3;
                  // If converted to PR
                  if (hasPr) timelineStep = 4;

                  return (
                    <tr key={ppmp.id} style={{ borderBottom: "1px solid var(--border)", verticalAlign: "middle" }}>
                      <td style={{ padding: "1.25rem 1.5rem", fontWeight: 700, color: "var(--accent)" }}>
                        {ppmp.ppmpNumber}
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {ppmp.projectTitle}
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem" }}>{ppmp.department}</td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>
                        ₱{Number(ppmp.estimatedBudget).toLocaleString()}
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "999px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            backgroundColor:
                              ppmp.status === "Approved"
                                ? "rgba(16, 185, 129, 0.1)"
                                : ppmp.status === "Submitted"
                                ? "rgba(220, 179, 83, 0.1)"
                                : ppmp.status === "Returned"
                                ? "rgba(239, 68, 68, 0.1)"
                                : "rgba(107, 114, 128, 0.1)",
                            color:
                              ppmp.status === "Approved"
                                ? "#059669"
                                : ppmp.status === "Submitted"
                                ? "#b88a1b"
                                : ppmp.status === "Returned"
                                ? "#ef4444"
                                : "var(--text-secondary)",
                          }}
                        >
                          {ppmp.status}
                        </span>
                      </td>

                      {/* Approval Timeline tracker */}
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.7rem", fontWeight: 700 }}>
                          <span style={{ color: timelineStep >= 0 ? "var(--accent)" : "var(--text-muted)" }}>
                            {timelineStep >= 0 ? "●" : "○"} Draft
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>→</span>
                          <span style={{ color: timelineStep >= 1 ? "var(--accent)" : "var(--text-muted)" }}>
                            {timelineStep >= 1 ? "●" : "○"} Submitted
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>→</span>
                          <span style={{ color: timelineStep >= 2 || ppmp.status === "Submitted" ? "var(--accent)" : "var(--text-muted)" }}>
                            {ppmp.status === "Submitted" ? "●" : "○"} Under Review
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>→</span>
                          <span style={{ color: timelineStep >= 3 ? "#10b981" : "var(--text-muted)" }}>
                            {timelineStep >= 3 ? "●" : "○"} Approved
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>→</span>
                          <span style={{ color: timelineStep >= 4 ? "#8b5cf6" : "var(--text-muted)" }}>
                            {timelineStep >= 4 ? "●" : "○"} Converted to PR
                          </span>
                        </div>

                        {/* Conversion Success Area */}
                        {timelineStep === 3 && (
                          <div style={{ marginTop: "0.5rem" }}>
                            <button
                              onClick={() => handleConvertToPr(ppmp.id, ppmp.ppmpNumber)}
                              style={{
                                padding: "0.25rem 0.6rem",
                                borderRadius: "6px",
                                border: "none",
                                background: "#b88a1b",
                                color: "white",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Generate Purchase Request
                            </button>
                          </div>
                        )}

                        {hasPr && prRecord && (
                          <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                              PR Generated: <strong style={{ color: "#8b5cf6" }}>{prRecord.prNumber}</strong>
                            </span>
                            <Link
                              href="/dashboard/end-user/pr"
                              style={{
                                display: "inline-block",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "4px",
                                border: "1px solid #8b5cf6",
                                color: "#8b5cf6",
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                textDecoration: "none",
                                background: "rgba(139, 92, 246, 0.05)",
                              }}
                            >
                              View Purchase Request
                            </Link>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "center" }}>
                        {(ppmp.status === "Draft" || ppmp.status === "Returned") ? (
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                            <button
                              onClick={() => handleSubmitPpmp(ppmp.id, ppmp.ppmpNumber)}
                              style={{
                                padding: "0.35rem 0.75rem",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#7e191b",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => handleEditPpmp(ppmp)}
                              style={{
                                padding: "0.35rem 0.75rem",
                                borderRadius: "6px",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--surface)",
                                color: "var(--text-primary)",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePpmp(ppmp.id, ppmp.ppmpNumber)}
                              style={{
                                padding: "0.35rem 0.75rem",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#ef4444",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                            No actions available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {ppmps.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)", fontWeight: 500 }}>
                      No Project Procurement Management Plans registered. Switch to "Marketplace Planner" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Creator Flow: Split screen containing Marketplace and active Draft Cart */
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "2rem" }} className="grid grid-cols-1 xl:grid-cols-2">
          {/* Left panel: Browsing the Marketplace */}
          <div>
            <PPMPMarketplace products={products} onAddItem={handleAddItem} />
          </div>

          {/* Right panel: Active PPMP Draft Cart */}
          <div>
            <PPMPDraftCart
              items={cartItems}
              ppmpNumber={ppmpNumber}
              projectTitle={projectTitle}
              fundingSource={fundingSource}
              department={department}
              office={office}
              budgetAllocated={budgetAllocated}
              budgetAlreadyPlanned={budgetAlreadyPlanned}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateDescription={handleUpdateDescription}
              onRemoveItem={handleRemoveItem}
              onUpdateMetadata={handleUpdateMetadata}
              onSaveDraft={handleSaveDraft}
              onCancel={handleCancel}
              isSaving={isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}
