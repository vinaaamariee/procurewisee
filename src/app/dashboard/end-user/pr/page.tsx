import { requireRole } from "@/lib/auth/get-user-profile";
import { prisma } from "@/lib/prisma";
import PrTrackerClient from "./PrTrackerClient";

export const metadata = { title: "Purchase Request Tracker — ProcureWise" };

export default async function PrTrackerPage() {
  const { profile } = await requireRole("End User");

  // Fetch all Purchase Requests prepared by this user
  const prs = await prisma.purchaseRequest.findMany({
    where: {
      requestedById: profile.id
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      ppmp: true,
      assignedOfficer: true,
      requestedBy: true,
      statusHistory: {
        include: {
          changedBy: true
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" }}>
            Purchase Request Tracker
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280", margin: "0.5rem 0 0 0" }}>
            Track procurement status, assigned officers, and submit digital Purchase Requests.
          </p>
        </div>
        <a
          href="/dashboard/end-user/pr/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#7B1E1E] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#922424] transition shrink-0"
        >
          + New Purchase Request
        </a>
      </div>

      <PrTrackerClient initialPrs={prs as any} />
    </div >
  );
}
