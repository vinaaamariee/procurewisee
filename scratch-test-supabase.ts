import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import { PrStatus } from '@prisma/client';
import crypto from 'crypto';

async function testBudgetFlows() {
  console.log('=== STARTING BUDGET FLOW TEST ===');
  
  // 1. Setup Test Department Budget
  const testDept = 'TEST-ICT-DEPT';
  await prisma.departmentBudget.upsert({
    where: { department: testDept },
    update: { allocatedBudget: 1000000, spentBudget: 0 },
    create: { department: testDept, allocatedBudget: 1000000, spentBudget: 0 }
  });
  console.log('Reset test department budget: ICT-DEPT (1,000,000 / 0 spent).');

  // Find or create test profiles
  const approverProfile = await prisma.userProfile.findFirst({
    where: { role: 'AdministrativeApprover' }
  });
  const officerProfile = await prisma.userProfile.findFirst({
    where: { role: 'ProcurementOfficer' }
  });

  if (!approverProfile || !officerProfile) {
    throw new Error('Please run db seed first to ensure role profiles exist.');
  }

  const requesterId = approverProfile.id;
  const approverId = approverProfile.id;
  const officerId = officerProfile.id;

  // 2. Simulate PR creation (Submitted status)
  // Realigned logic: spent budget should NOT be incremented yet (budget commits only on approval/receive).
  console.log('\n--- 2. Simulating PR Creation ---');
  const prCost = 150000;
  const ref = crypto.randomBytes(4).toString('hex').toUpperCase();
  const prNumber = `PR-TEST-${ref}`;

  const pr = await prisma.$transaction(async (tx) => {
    // Check against department budgets
    const deptBudget = await tx.departmentBudget.findUnique({
      where: { department: testDept }
    });
    if (!deptBudget) throw new Error('Dept budget not found');
    const remaining = Number(deptBudget.allocatedBudget) - Number(deptBudget.spentBudget);
    if (prCost > remaining) {
      throw new Error('Budget exceeded');
    }

    const newPr = await tx.purchaseRequest.create({
      data: {
        prNumber,
        department: testDept,
        office: 'ICT Office',
        purpose: 'Buy test equipment',
        fundingSource: 'GAA',
        estimatedBudget: prCost,
        totalCost: prCost,
        status: PrStatus.Submitted,
        requestedById: requesterId,
      }
    });

    // Create status history log
    await tx.purchaseRequestStatusHistory.create({
      data: {
        purchaseRequestId: newPr.id,
        status: PrStatus.Submitted,
        remarks: 'Purchase Request created and submitted.',
        changedById: requesterId
      }
    });

    return newPr;
  });

  // Verify DB state
  let budget = await prisma.departmentBudget.findUnique({ where: { department: testDept } });
  console.log(`Submitted PR. Spent Budget: ${budget?.spentBudget} (Expected: 0)`);
  if (Number(budget?.spentBudget) !== 0) {
    throw new Error('FAILED: Spent budget should NOT change on PR creation!');
  }

  let history = await prisma.purchaseRequestStatusHistory.findMany({
    where: { purchaseRequestId: pr.id },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`Status History Count: ${history.length} (Expected: 1)`);
  console.log(`First Status: ${history[0].status} (Expected: Submitted)`);
  if (history[0].status !== 'Submitted') {
    throw new Error('FAILED: Status history should start with Submitted');
  }

  // 3. Simulate PR transitioned to UnderReview
  // Budget should NOT change. Status history should log UnderReview.
  console.log('\n--- 3. Simulating Start Review (Under Review) ---');
  await prisma.$transaction(async (tx) => {
    await tx.purchaseRequest.update({
      where: { id: pr.id },
      data: { status: PrStatus.UnderReview }
    });
    await tx.purchaseRequestStatusHistory.create({
      data: {
        purchaseRequestId: pr.id,
        status: PrStatus.UnderReview,
        remarks: 'Approver started audit review.',
        changedById: approverId
      }
    });
  });

  budget = await prisma.departmentBudget.findUnique({ where: { department: testDept } });
  console.log(`UnderReview PR. Spent Budget: ${budget?.spentBudget} (Expected: 0)`);
  if (Number(budget?.spentBudget) !== 0) {
    throw new Error('FAILED: Spent budget should NOT change on starting review!');
  }

  history = await prisma.purchaseRequestStatusHistory.findMany({
    where: { purchaseRequestId: pr.id },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`Status History Count: ${history.length} (Expected: 2)`);
  console.log(`Latest Status: ${history[history.length - 1].status} (Expected: UnderReview)`);

  // 4. Simulate return PR (ReturnedForRevision)
  // Budget should NOT change. Status history should log ReturnedForRevision.
  console.log('\n--- 4. Simulating PR Return (Returned for Revision) ---');
  await prisma.$transaction(async (tx) => {
    await tx.purchaseRequest.update({
      where: { id: pr.id },
      data: { status: PrStatus.ReturnedForRevision }
    });
    await tx.purchaseRequestStatusHistory.create({
      data: {
        purchaseRequestId: pr.id,
        status: PrStatus.ReturnedForRevision,
        remarks: 'Please revise quantity.',
        changedById: approverId
      }
    });
  });

  budget = await prisma.departmentBudget.findUnique({ where: { department: testDept } });
  console.log(`Returned PR. Spent Budget: ${budget?.spentBudget} (Expected: 0)`);
  if (Number(budget?.spentBudget) !== 0) {
    throw new Error('FAILED: Spent budget should NOT change on return!');
  }

  history = await prisma.purchaseRequestStatusHistory.findMany({
    where: { purchaseRequestId: pr.id },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`Status History Count: ${history.length} (Expected: 3)`);
  console.log(`Latest Status: ${history[history.length - 1].status} (Expected: ReturnedForRevision)`);

  // 5. Simulate resubmission (Submitted)
  // Budget should NOT change. Status history should log Submitted.
  console.log('\n--- 5. Simulating Resubmit PR (Submitted) ---');
  await prisma.$transaction(async (tx) => {
    await tx.purchaseRequest.update({
      where: { id: pr.id },
      data: { status: PrStatus.Submitted }
    });
    await tx.purchaseRequestStatusHistory.create({
      data: {
        purchaseRequestId: pr.id,
        status: PrStatus.Submitted,
        remarks: 'Resubmitted for review.',
        changedById: requesterId
      }
    });
  });

  budget = await prisma.departmentBudget.findUnique({ where: { department: testDept } });
  console.log(`Resubmitted PR. Spent Budget: ${budget?.spentBudget} (Expected: 0)`);
  if (Number(budget?.spentBudget) !== 0) {
    throw new Error('FAILED: Spent budget should NOT change on resubmit!');
  }

  // 6. Transition to UnderReview again
  await prisma.$transaction(async (tx) => {
    await tx.purchaseRequest.update({
      where: { id: pr.id },
      data: { status: PrStatus.UnderReview }
    });
  });

  // 7. Simulate approval (Approved)
  // Realigned logic: spent budget should INCREMENT by total cost inside transaction.
  console.log('\n--- 6. Simulating PR Approval (Approved) ---');
  await prisma.$transaction(async (tx) => {
    await tx.purchaseRequest.update({
      where: { id: pr.id },
      data: { status: PrStatus.Approved, approvedAt: new Date() }
    });
    
    // Commit budget: Increment spent budget
    await tx.departmentBudget.update({
      where: { department: testDept },
      data: { spentBudget: { increment: prCost } }
    });

    await tx.purchaseRequestStatusHistory.create({
      data: {
        purchaseRequestId: pr.id,
        status: PrStatus.Approved,
        remarks: 'Approved for procurement.',
        changedById: approverId
      }
    });
  });

  budget = await prisma.departmentBudget.findUnique({ where: { department: testDept } });
  console.log(`Approved PR. Spent Budget: ${budget?.spentBudget} (Expected: 150000)`);
  if (Number(budget?.spentBudget) !== prCost) {
    throw new Error(`FAILED: Spent budget should be ${prCost} after approval!`);
  }

  // 8. Simulate receiving PR (Received)
  // Realigned logic: status becomes Received, but budget was already committed at Approved,
  // so budget should remain at 150000.
  console.log('\n--- 7. Simulating PR Receiving (Received) ---');
  await prisma.$transaction(async (tx) => {
    const oldPr = await tx.purchaseRequest.findUnique({ where: { id: pr.id } });
    if (!oldPr) throw new Error('Not found');

    await tx.purchaseRequest.update({
      where: { id: pr.id },
      data: { status: PrStatus.Received, trackingNumber: `PROC-TEST-${ref}` }
    });

    // Realigned reviewPrAction budget:
    // Approved -> Received transitions should leave budget unchanged.
    if (oldPr.status !== PrStatus.Approved && oldPr.status !== PrStatus.Received) {
      await tx.departmentBudget.update({
        where: { department: testDept },
        data: { spentBudget: { increment: prCost } }
      });
    }

    await tx.purchaseRequestStatusHistory.create({
      data: {
        purchaseRequestId: pr.id,
        status: PrStatus.Received,
        remarks: 'Received by Procurement Unit.',
        changedById: officerId
      }
    });
  });

  budget = await prisma.departmentBudget.findUnique({ where: { department: testDept } });
  console.log(`Received PR. Spent Budget: ${budget?.spentBudget} (Expected: 150000)`);
  if (Number(budget?.spentBudget) !== prCost) {
    throw new Error('FAILED: Spent budget should remain 150000 after transition Approved -> Received');
  }

  // 9. Clean up test records
  console.log('\n--- Cleaning up test records ---');
  await prisma.purchaseRequestStatusHistory.deleteMany({ where: { purchaseRequestId: pr.id } });
  await prisma.purchaseRequest.delete({ where: { id: pr.id } });
  await prisma.departmentBudget.delete({ where: { department: testDept } });
  console.log('Cleanup complete.');

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

testBudgetFlows()
  .catch((err) => {
    console.error('Test failed with error:', err);
    process.exit(1);
  });
