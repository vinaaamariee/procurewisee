import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOfficer() {
  console.log('--- Testing Officer Queries ---');
  try {
    const rfqs = await supabase.from('requests_for_quote').select('status');
    console.log('requests_for_quote status query:', rfqs.error ? rfqs.error : `Success (${rfqs.data?.length} rows)`);

    const suppliers = await supabase.from('suppliers').select('id:supplier_id');
    console.log('suppliers query:', suppliers.error ? suppliers.error : `Success (${suppliers.data?.length} rows)`);

    const appItems = await supabase.from('app_items').select('id:app_item_id');
    console.log('app_items query:', appItems.error ? appItems.error : `Success (${appItems.data?.length} rows)`);

    const recent = await supabase
      .from('requests_for_quote')
      .select('id:rfq_id, rfqNumber, title, status, deadlineDate, approvedBudgetContract')
      .order('rfq_id', { ascending: false })
      .limit(5);
    console.log('recent RFQs query:', recent.error ? recent.error : `Success (${recent.data?.length} rows)`);
  } catch (e) {
    console.error('Error in testOfficer:', e);
  }
}

async function testApprover() {
  console.log('\n--- Testing Approver Queries ---');
  try {
    const canvases = await supabase.from('canvas_abstracts').select('id:canvas_id');
    console.log('canvas_abstracts query:', canvases.error ? canvases.error : `Success (${canvases.data?.length} rows)`);

    const recommendations = await supabase.from('recommendations').select('id:recomm_id, approvalStatus');
    console.log('recommendations query:', recommendations.error ? recommendations.error : `Success (${recommendations.data?.length} rows)`);

    const auditEntries = await supabase
      .from('audit_trails')
      .select('id:audit_id, action:actionType, createdAt:timestamp')
      .order('timestamp', { ascending: false })
      .limit(5);
    console.log('audit_trails query:', auditEntries.error ? auditEntries.error : `Success (${auditEntries.data?.length} rows)`);

    const pendingRecs = await supabase
      .from('recommendations')
      .select('id:recomm_id, compositeScore:compositeMcdmScore, rank:rankPosition, reasoning:justificationLog, approvalStatus, supplier:suppliers(companyName), quote:supplier_quotes(rfqId, totalQuotedAmount)')
      .eq('approvalStatus', 'Pending Review')
      .order('rankPosition', { ascending: true })
      .limit(5);
    console.log('pending recommendations query:', pendingRecs.error ? pendingRecs.error : `Success (${pendingRecs.data?.length} rows)`);
  } catch (e) {
    console.error('Error in testApprover:', e);
  }
}

async function testSupplier() {
  console.log('\n--- Testing Supplier Queries ---');
  try {
    const openRfqs = await supabase
      .from('requests_for_quote')
      .select('id:rfq_id, rfqNumber, title, approvedBudgetContract, deadlineDate, status')
      .eq('status', 'Published')
      .order('rfq_id', { ascending: false })
      .limit(6);
    console.log('open RFQs query:', openRfqs.error ? openRfqs.error : `Success (${openRfqs.data?.length} rows)`);

    const matchingSupplier = await supabase
      .from('suppliers')
      .select('id:supplier_id')
      .or(`companyName.eq."Test",contactPerson.eq."Test"`)
      .maybeSingle();
    console.log('matching supplier query:', matchingSupplier.error ? matchingSupplier.error : 'Success');
  } catch (e) {
    console.error('Error in testSupplier:', e);
  }
}

async function run() {
  await testOfficer();
  await testApprover();
  await testSupplier();
}

run();
