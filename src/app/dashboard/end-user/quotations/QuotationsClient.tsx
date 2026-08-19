"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
} from "lucide-react";

interface QuotationSupplier {
  id: number;
  supplierId: number;
  supplierName: string;
  responseStatus: string;
  hasResponse: boolean;
  responseDate: string | null;
  quotationNumber: string | null;
  totalAmount: number;
}

interface PreCanvassInfo {
  id: number;
  preCanvassNumber: string;
  status: string;
  suppliers: QuotationSupplier[];
  hasAbstract: boolean;
}

interface PrInfo {
  id: number;
  prNumber: string;
  department: string;
  status: string;
  totalCost: number;
  preCanvass: PreCanvassInfo | null;
}

interface QuotationsClientProps {
  prs: PrInfo[];
}

export default function QuotationsClient({ prs }: QuotationsClientProps) {
  const [selectedPrId, setSelectedPrId] = useState<number | null>(
    prs.length > 0 ? prs[0].id : null
  );

  const selectedPr = prs.find((pr) => pr.id === selectedPrId);
  const respondingCount = selectedPr?.preCanvass?.suppliers.filter((s) => s.hasResponse).length || 0;
  const totalSuppliers = selectedPr?.preCanvass?.suppliers.length || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* PR List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-base-content uppercase tracking-wider">Purchase Requests</h2>
        {prs.length === 0 ? (
          <div className="text-center py-12 bg-base-100 rounded-2xl border border-base-300">
            <FileText className="h-10 w-10 mx-auto text-base-content/20 mb-3" />
            <p className="text-sm text-base-content/60">No active Purchase Requests.</p>
          </div>
        ) : (
          prs.map((pr) => {
            const responding = pr.preCanvass?.suppliers.filter((s) => s.hasResponse).length || 0;
            const total = pr.preCanvass?.suppliers.length || 0;
            return (
              <button
                key={pr.id}
                onClick={() => setSelectedPrId(pr.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedPrId === pr.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-base-300 bg-base-100 hover:bg-base-200/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-primary">{pr.prNumber}</span>
                  {total > 0 && responding >= 3 ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : total > 0 ? (
                    <Clock className="h-4 w-4 text-warning" />
                  ) : (
                    <XCircle className="h-4 w-4 text-base-content/30" />
                  )}
                </div>
                <p className="text-xs text-base-content/60">{pr.department}</p>
                {total > 0 && (
                  <p className="text-[11px] font-bold text-base-content/70 mt-1">
                    {responding}/{total} quotations
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Quotation Detail */}
      <div className="lg:col-span-2">
        {selectedPr ? (
          <div className="bg-base-100 border border-base-300 rounded-2xl p-6 space-y-5">
            <div className="border-b border-base-300 pb-4">
              <h2 className="text-lg font-extrabold text-primary">{selectedPr.prNumber}</h2>
              <p className="text-xs text-base-content/60 mt-1">{selectedPr.department}</p>
            </div>

            {selectedPr.preCanvass ? (
              <>
                {/* AOQ Status Summary */}
                <div className="p-4 rounded-xl bg-base-200 border border-base-300">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-base-content uppercase tracking-wider">Pre-Canvass / AOQ</p>
                      <p className="text-sm font-bold text-base-content mt-0.5">{selectedPr.preCanvass.preCanvassNumber}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      respondingCount >= 3
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-warning/10 text-warning border border-warning/20"
                    }`}>
                      {respondingCount} of 3 quotations
                    </span>
                  </div>
                  {respondingCount < 3 && (
                    <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      <p className="text-xs text-base-content/70">
                        Three supplier quotations are required before this procurement package can be submitted to the Procurement Office.
                      </p>
                    </div>
                  )}
                </div>

                {/* Supplier Cards */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50">Supplier Responses</h3>
                  {selectedPr.preCanvass.suppliers.map((supplier, index) => (
                    <div
                      key={supplier.id}
                      className={`p-4 rounded-xl border transition-all ${
                        supplier.hasResponse
                          ? "border-success/30 bg-success/5"
                          : "border-base-300 bg-base-200/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            supplier.hasResponse
                              ? "bg-success/10 text-success"
                              : "bg-base-300 text-base-content/50"
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-base-content/50" />
                              <span className="text-sm font-bold text-base-content">{supplier.supplierName}</span>
                            </div>
                            {supplier.hasResponse ? (
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                  <span className="text-success font-bold">Quotation Submitted</span>
                                </div>
                                {supplier.quotationNumber && (
                                  <p className="text-[11px] text-base-content/60">
                                    Ref: {supplier.quotationNumber}
                                  </p>
                                )}
                                {supplier.responseDate && (
                                  <p className="text-[11px] text-base-content/60">
                                    Received: {new Date(supplier.responseDate).toLocaleDateString("en-PH", { dateStyle: "medium" })}
                                  </p>
                                )}
                                {supplier.totalAmount > 0 && (
                                  <p className="text-xs font-bold text-base-content">
                                    Quoted Total: ₱{supplier.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="mt-2 flex items-center gap-2 text-xs text-base-content/50">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Awaiting response</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          supplier.hasResponse
                            ? "bg-success/10 text-success"
                            : supplier.responseStatus === "Invited"
                            ? "bg-info/10 text-info"
                            : "bg-base-300 text-base-content/50"
                        }`}>
                          {supplier.hasResponse ? "Submitted" : supplier.responseStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPr.preCanvass.hasAbstract && (
                  <div className="p-3 rounded-xl bg-info/10 border border-info/20 text-info text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    AOQ Abstract has been generated for this Pre-Canvass.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 mx-auto text-base-content/20 mb-3" />
                <p className="text-sm font-medium text-base-content/60">No Pre-Canvass initiated for this PR.</p>
                <p className="text-xs text-base-content/40 mt-1">
                  The Procurement Office will initiate the pre-canvass process after verifying your Purchase Request.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-base-100 rounded-2xl border border-base-300">
            <Building2 className="h-12 w-12 mx-auto text-base-content/20 mb-3" />
            <p className="text-sm font-medium text-base-content/60">Select a Purchase Request to view quotation status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
