'use server';

import { prisma } from '@/lib/prisma';

export interface ActivityItem {
  id: number;
  icon: string;
  title: string;
  description: string;
  userName: string;
  userInitials: string;
  timestamp: string;
  relativeTime: string;
  category: 'pr' | 'rfq' | 'po' | 'quote' | 'evaluation' | 'general';
}

const ACTION_MAP: Record<string, { icon: string; title: string; category: ActivityItem['category'] }> = {
  // Purchase Requests
  PR_SUBMITTED:    { icon: '📋', title: 'Purchase Request Submitted',   category: 'pr' },
  PR_APPROVED:     { icon: '✅', title: 'Purchase Request Approved',     category: 'pr' },
  PR_RETURNED:     { icon: '↩️', title: 'Purchase Request Returned',     category: 'pr' },
  PR_REJECTED:     { icon: '❌', title: 'Purchase Request Rejected',     category: 'pr' },
  PR_RECEIVED:     { icon: '📥', title: 'Purchase Request Received',     category: 'pr' },
  // RFQs
  RFQ_PUBLISHED:   { icon: '📣', title: 'RFQ Published',                category: 'rfq' },
  RFQ_CLOSED:      { icon: '🔒', title: 'RFQ Closed',                   category: 'rfq' },
  RFQ_AWARDED:     { icon: '🏆', title: 'RFQ Awarded',                  category: 'rfq' },
  // Purchase Orders
  PO_GENERATED:    { icon: '📦', title: 'Purchase Order Generated',      category: 'po' },
  PO_PRINTED:      { icon: '🖨️', title: 'Purchase Order Printed',        category: 'po' },
  PO_APPROVED:     { icon: '✅', title: 'Purchase Order Approved',       category: 'po' },
  // Supplier Quotes
  QUOTE_SUBMITTED: { icon: '💬', title: 'Supplier Quote Submitted',     category: 'quote' },
  QUOTE_REVIEWED:  { icon: '🔍', title: 'Supplier Quote Reviewed',      category: 'quote' },
  // Evaluations
  EVALUATION_SUBMITTED: { icon: '⭐', title: 'Supplier Evaluation Submitted', category: 'evaluation' },
  // Fallback for any other action
  INSERT:          { icon: '➕', title: 'Record Created',               category: 'general' },
  UPDATE:          { icon: '✏️', title: 'Record Updated',               category: 'general' },
  DELETE:          { icon: '🗑️', title: 'Record Deleted',               category: 'general' },
};

function resolveAction(actionType: string, tableAffected: string) {
  // Try exact match first
  if (ACTION_MAP[actionType]) return ACTION_MAP[actionType];

  // Derive from table + generic action
  const table = tableAffected.toLowerCase();
  if (table.includes('purchase_request')) {
    if (actionType === 'INSERT') return { icon: '📋', title: 'Purchase Request Submitted', category: 'pr' as const };
    if (actionType === 'UPDATE') return { icon: '📝', title: 'Purchase Request Updated',  category: 'pr' as const };
  }
  if (table.includes('request_for_quote') || table.includes('rfq')) {
    if (actionType === 'INSERT') return { icon: '📣', title: 'RFQ Created',     category: 'rfq' as const };
    if (actionType === 'UPDATE') return { icon: '🔔', title: 'RFQ Updated',     category: 'rfq' as const };
  }
  if (table.includes('purchase_order')) {
    if (actionType === 'INSERT') return { icon: '📦', title: 'Purchase Order Generated', category: 'po' as const };
    if (actionType === 'UPDATE') return { icon: '🖨️', title: 'Purchase Order Updated',   category: 'po' as const };
  }
  if (table.includes('supplier_quote')) {
    return { icon: '💬', title: 'Supplier Quote Added', category: 'quote' as const };
  }
  if (table.includes('evaluation') || table.includes('scorecard')) {
    return { icon: '⭐', title: 'Evaluation Submitted', category: 'evaluation' as const };
  }

  // Final fallback
  return ACTION_MAP[actionType] ?? { icon: '🔔', title: actionType, category: 'general' as const };
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export async function getRecentActivity(limit: number = 12): Promise<ActivityItem[]> {
  const logs = await prisma.auditTrail.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: {
      user: { select: { fullName: true, username: true } },
    },
  });

  return logs.map(log => {
    const resolved = resolveAction(log.actionType, log.tableAffected);

    // Derive description from newState JSON when available
    let description = `Action on ${log.tableAffected.replace(/_/g, ' ')} #${log.recordId}`;
    if (log.newState && typeof log.newState === 'object') {
      const s = log.newState as Record<string, unknown>;
      const candidate = s.prNumber ?? s.poNumber ?? s.rfqNumber ?? s.ppmpNumber ?? s.companyName ?? s.purpose ?? s.title;
      if (candidate) description = String(candidate);
    }

    const fullName = log.user?.fullName ?? log.user?.username ?? 'System';

    return {
      id: log.id,
      icon: resolved.icon,
      title: resolved.title,
      description,
      userName: fullName,
      userInitials: initials(fullName),
      timestamp: log.timestamp.toLocaleString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      relativeTime: getRelativeTime(log.timestamp),
      category: resolved.category,
    };
  });
}
