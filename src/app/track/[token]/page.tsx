import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface TrackingPageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

export default async function RequisitionTrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;

  // Retrieve requisition, items, and status transitions including reviewer details
  const requisition = await prisma.requisition.findUnique({
    where: { secureToken: token },
    include: {
      items: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: {
          changedBy: true,
        },
      },
    },
  });

  if (!requisition) {
    notFound();
  }

  const itemsTotal = requisition.items.reduce(
    (sum, item) => sum + (Number(item.estimatedUnitPrice) * item.quantity), 0
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending":
        return { label: "Under PO Review", bg: "bg-amber-100 text-amber-800 border-amber-25" };
      case "Approved":
        return { label: "Approved by PO", bg: "bg-green-100 text-green-800 border-green-25" };
      case "Rejected":
        return { label: "Needs Revision (Rejected)", bg: "bg-red-100 text-red-800 border-red-25" };
      case "Completed":
        return { label: "Canvass Completed", bg: "bg-indigo-100 text-indigo-800 border-indigo-25" };
      default:
        return { label: status, bg: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  const statusConfig = getStatusConfig(requisition.status);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-[#E7E5E0] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/end-user" className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#7e191b] to-[#ca8a04] flex items-center justify-center text-white font-black text-xs">
              PW
            </Link>
            <div>
              <h1 className="text-lg font-black text-[#7e191b]">ProcureWise Tracking</h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Batanes State College</p>
            </div>
          </div>
          <Link 
            href="/end-user" 
            className="text-xs font-bold text-[#7e191b] border border-[#7e191b]/30 rounded-lg px-3 py-1.5 hover:bg-[#7e191b]/5 transition"
          >
            ← Back to Catalog
          </Link>
        </div>
      </header>

      {/* Main Track Section */}
      <main className="max-w-[900px] mx-auto px-6 py-10 space-y-8 flex-1 w-full">
        {/* Tracking Header */}
        <section className="bg-white border border-[#E7E5E0] rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Requisition Tracking Code</span>
            <h2 className="text-3xl font-black text-gray-900 font-mono tracking-tight mt-1">{requisition.trackingCode}</h2>
            <div className="flex gap-2.5 items-center mt-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusConfig.bg}`}>
                {statusConfig.label}
              </span>
              {requisition.rejectionCount > 0 && (
                <span className="text-xs font-bold bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full">
                  Rejections: {requisition.rejectionCount}
                </span>
              )}
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 space-y-2 text-xs text-gray-500">
            <p><strong>Requester Name:</strong> {requisition.requesterName}</p>
            <p><strong>Department/Unit:</strong> {requisition.department}</p>
            <p><strong>Date Submitted:</strong> {new Date(requisition.createdAt).toLocaleDateString("en-PH", { dateStyle: "long" })}</p>
          </div>
        </section>

        {/* Process History Logs */}
        <section className="bg-white border border-[#E7E5E0] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#7e191b] border-b pb-3 mb-6">Status Log & Rejection Remarks</h3>

          <div className="relative border-l-2 border-gray-200 pl-6 ml-3 space-y-6">
            {requisition.statusHistory.map((historyItem, idx) => (
              <div key={historyItem.id} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${
                  idx === 0 
                    ? historyItem.status === 'Rejected' ? 'bg-red-600 border-red-200 animate-pulse' : 'bg-[#ca8a04] border-yellow-200 animate-pulse'
                    : 'bg-gray-300 border-white'
                }`} />
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">
                      Request marked as {getStatusConfig(historyItem.status).label}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {new Date(historyItem.createdAt).toLocaleString("en-PH")}
                    </span>
                  </div>
                  {historyItem.remarks && (
                    <div className={`mt-2 text-xs p-3 rounded-lg border leading-relaxed ${
                      historyItem.status === 'Rejected' 
                        ? 'bg-red-50 text-red-800 border-red-100' 
                        : 'bg-gray-50 text-gray-700 border-gray-100'
                    }`}>
                      <strong>Remarks:</strong> {historyItem.remarks}
                      {historyItem.changedBy && (
                        <p className="text-[9px] text-gray-400 mt-1 border-t pt-1.5">
                          Action by: {historyItem.changedBy.fullName} ({historyItem.changedBy.role})
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Items List */}
        <section className="bg-white border border-[#E7E5E0] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Items Requested</h3>
          </div>
          
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-4">Item Specifications</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4 text-right">Estimated Unit Price</th>
                <th className="p-4 text-right">Estimated Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requisition.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{item.productName}</p>
                    {item.brandPreference && <span className="text-[10px] text-gray-400">Pref: {item.brandPreference}</span>}
                  </td>
                  <td className="p-4 text-center font-semibold text-gray-700">{item.quantity}</td>
                  <td className="p-4 text-right text-gray-600">₱{Number(item.estimatedUnitPrice).toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-gray-900">₱{(Number(item.estimatedUnitPrice) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={3} className="p-4 text-right text-[#7e191b] uppercase">Estimated Grand Total Value</td>
                <td className="p-4 text-right text-base text-[#7e191b] font-black">₱{itemsTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
