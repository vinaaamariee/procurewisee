import 'dotenv/config';

// 1. Intercept module resolution to mock Next.js server-only modules
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id: string) {
  if (id === 'next/cache') {
    return {
      revalidatePath: () => {
        console.log('   [Mock] revalidatePath called successfully');
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

// 2. Run test using dynamic imports/requires to prevent hoisting issues
async function runTest() {
  console.log('🚀 Starting End-to-End RFQ Publishing Engine Test...\n');

  // Load modules dynamically after the require hook is established
  const { createRfqAction, publishRfq } = require('../src/app/actions/rfq');
  const { prisma } = require('../src/lib/prisma');
  const { RfqStatus } = require('@prisma/client');

  try {
    // ── Setup: Ensure we have a catalog product and an APP item to test pre-filling ──
    console.log('🔍 Fetching or creating a test catalog product...');
    let catalogProduct = await prisma.catalogProduct.findFirst({
      where: { isActive: true }
    });

    if (!catalogProduct) {
      console.log('   [Catalog] No active product found. Creating a test product...');
      catalogProduct = await prisma.catalogProduct.create({
        data: {
          sku: 'TEST-SKU-001',
          name: 'Premium Bond Paper A4',
          category: 'Office Supplies',
          description: 'High-grade paper for testing pre-fill',
          unitOfMeasure: 'ream',
          estimatedUnitCost: 250.00,
          isActive: true
        }
      });
      console.log(`   [Catalog] Created product: ${catalogProduct.name} (${catalogProduct.sku})`);
    } else {
      console.log(`   [Catalog] Found existing product: ${catalogProduct.name} (${catalogProduct.sku})`);
    }

    console.log('\n🔍 Fetching or creating a test APP item...');
    let appItem = await prisma.appItem.findFirst();
    if (!appItem) {
      console.log('   [APP] No APP item found. Creating a test item...');
      appItem = await prisma.appItem.create({
        data: {
          papCode: 'PAP-TEST-2026',
          objectCode: '5-02-03-010',
          projectTitle: 'Test Requisition FY 2026',
          endUserUnit: 'Test Unit',
          generalDescription: 'Annual test requisition description',
          sourceOfFund: 'GAA 2026',
          estimatedBudget: 50000.00,
          fyYear: 2026
        }
      });
      console.log(`   [APP] Created APP item: ${appItem.projectTitle}`);
    } else {
      console.log(`   [APP] Found existing APP item: ${appItem.projectTitle}`);
    }

    // ── Setup: Ensure we have a mock Procurement Officer UserProfile ──
    console.log('\n🔍 Fetching or creating a test Procurement Officer profile...');
    const officerId = 'test-officer-uuid-e2e';
    let officer = await prisma.userProfile.findUnique({
      where: { id: officerId }
    });

    if (!officer) {
      officer = await prisma.userProfile.create({
        data: {
          id: officerId,
          username: 'e2e_officer',
          fullName: 'E2E Testing Officer',
          email: 'e2e_officer@bsc.edu.ph',
          role: 'ProcurementOfficer',
          isActive: true
        }
      });
      console.log(`   [User] Created user profile: ${officer.fullName}`);
    } else {
      console.log(`   [User] Found existing user profile: ${officer.fullName}`);
    }

    // ── Test Step 1: Drafting an RFQ with ABC Limits and Pre-filled items ──
    const uniqueRfqNum = `RFQ-TEST-${Date.now()}`;
    const abcLimit = 25000.00;

    console.log(`\n📝 Test Step 1: Drafting a new RFQ (${uniqueRfqNum}) with ABC limit: ₱${abcLimit.toLocaleString()}...`);
    
    const draftPayload = {
      rfqNumber: uniqueRfqNum,
      title: 'E2E Test: Procurement of Standard School Supplies',
      approvedBudgetContract: abcLimit,
      deadlineDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      status: RfqStatus.Draft,
      createdById: officerId,
      items: [
        {
          itemNumber: '001',
          particulars: `Pre-filled from Catalog: ${catalogProduct.name} - ${catalogProduct.description}`,
          quantity: 20,
          unit: catalogProduct.unitOfMeasure,
          appItemId: appItem.id,
          productId: catalogProduct.id
        }
      ]
    };

    const createResult = await createRfqAction(draftPayload);
    if (!createResult.success) {
      throw new Error(`Failed to create RFQ draft: ${createResult.error}`);
    }

    const rfqId = createResult.data!.id;
    console.log(`   ✅ RFQ Draft created successfully! ID: ${rfqId}`);

    // ── Test Step 2: Verification of drafted RFQ details in database ──
    console.log('\n🔍 Test Step 2: Verifying drafted RFQ in database...');
    const dbRfq = await prisma.requestForQuote.findUnique({
      where: { id: rfqId },
      include: { items: true }
    });

    if (!dbRfq) {
      throw new Error('RFQ not found in database after creation!');
    }

    console.log(`   - Title: "${dbRfq.title}"`);
    console.log(`   - ABC Limit: ₱${Number(dbRfq.approvedBudgetContract).toLocaleString()}`);
    console.log(`   - Status: ${dbRfq.status} (Expected: Draft)`);
    console.log(`   - Total Items: ${dbRfq.items.length}`);
    
    const firstItem = dbRfq.items[0];
    console.log(`   - Item Particulars: "${firstItem.particulars}"`);
    console.log(`   - Linked Product ID: ${firstItem.productId} (Expected: ${catalogProduct.id})`);
    console.log(`   - Linked APP Item ID: ${firstItem.appItemId} (Expected: ${appItem.id})`);

    // Assertions
    if (dbRfq.status !== RfqStatus.Draft) {
      throw new Error(`Invalid status: ${dbRfq.status}. Expected Draft.`);
    }
    if (Number(dbRfq.approvedBudgetContract) !== abcLimit) {
      throw new Error(`Invalid ABC: ${dbRfq.approvedBudgetContract}. Expected ${abcLimit}.`);
    }
    if (firstItem.productId !== catalogProduct.id) {
      throw new Error(`Invalid Product ID: ${firstItem.productId}. Expected ${catalogProduct.id}.`);
    }
    if (firstItem.appItemId !== appItem.id) {
      throw new Error(`Invalid APP Item ID: ${firstItem.appItemId}. Expected ${appItem.id}.`);
    }
    console.log('   ✅ Database verification of drafted RFQ passed!');

    // ── Test Step 3: Transition RFQ Status to Published ──
    console.log(`\n🚀 Test Step 3: Transitioning RFQ #${rfqId} from Draft to Published...`);
    const publishResult = await publishRfq(rfqId);
    
    console.log(`   - New Status: ${publishResult.status} (Expected: Published)`);
    
    if (publishResult.status !== RfqStatus.Published) {
      throw new Error(`Invalid status: ${publishResult.status}. Expected Published.`);
    }
    console.log('   ✅ Status transition verification passed!');

    // ── Cleanup: Delete test records to keep database clean ──
    console.log('\n🧹 Cleaning up test RFQ records...');
    await prisma.requestForQuote.delete({
      where: { id: rfqId }
    });
    console.log('   ✅ Cleaned up successfully.');

    console.log('\n🎉 All E2E RFQ Publishing Engine tests passed successfully!');
  } catch (error) {
    console.error('\n❌ E2E Test Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
