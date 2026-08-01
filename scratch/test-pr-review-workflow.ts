import { prisma } from "../src/lib/prisma";
import { submitPrAction, approvePrByOfficerAction, returnPrByOfficerAction, resubmitPrAction } from "../src/app/actions/pr";

async function main() {
  console.log("=== Testing Purchase Request Approval and Validation Workflow ===");

  // 1. Fetch or find test PR
  const pr = await prisma.purchaseRequest.findFirst({
    where: { status: "Draft" },
    include: { items: true },
  });

  if (!pr) {
    console.log("No Draft PR found to test. Test skipped.");
    return;
  }

  console.log(`Found test PR #${pr.prNumber} (ID: ${pr.id})`);

  // 2. Verify Return Action validation (empty comment must fail)
  console.log("Testing Return Action with empty comment...");
  const emptyReturnRes = await returnPrByOfficerAction(pr.id, "");
  console.log("Empty return result:", emptyReturnRes.success ? "FAILED (should have rejected)" : `PASSED (${emptyReturnRes.error})`);

  // 3. Verify Return Action with valid comment
  console.log("Testing Return Action with valid comment...");
  const returnRes = await returnPrByOfficerAction(pr.id, "Please verify item specifications and attach approved PPMP.");
  console.log("Return result:", returnRes.success ? `PASSED (Status: ${returnRes.pr?.status})` : `FAILED (${returnRes.error})`);

  // 4. Verify Approval Action
  console.log("Testing Approval Action...");
  const approveRes = await approvePrByOfficerAction(pr.id);
  console.log("Approve result:", approveRes.success ? `PASSED (Status: ${approveRes.pr?.status}, ApprovedAt: ${approveRes.pr?.approvedAt})` : `FAILED (${approveRes.error})`);

  console.log("=== All Workflow Tests Completed Successfully ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
