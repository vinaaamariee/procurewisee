'use server';

import { prisma } from '@/lib/prisma';

export interface SearchResultItem {
  id: number;
  title: string;
  subtitle: string;
  link: string;
}

export interface GroupedSearchResults {
  products: SearchResultItem[];
  purchaseRequests: SearchResultItem[];
  ppmps: SearchResultItem[];
  purchaseOrders: SearchResultItem[];
  rfqs: SearchResultItem[];
  suppliers: SearchResultItem[];
  departments: SearchResultItem[];
}

export async function globalSearchAction(query: string) {
  if (!query || query.trim().length < 2) {
    return { success: true, results: {} as GroupedSearchResults };
  }

  const cleanQuery = query.trim();

  try {
    const [products, prs, ppmps, pos, rfqs, suppliers, departments] = await Promise.all([
      // Catalog Products — field: name, description
      prisma.catalogProduct.findMany({
        where: {
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { description: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      // Purchase Requests — fields: prNumber, department
      prisma.purchaseRequest.findMany({
        where: {
          OR: [
            { prNumber: { contains: cleanQuery, mode: 'insensitive' } },
            { department: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      // PPMPs — fields: projectTitle, ppmpNumber, department
      prisma.ppmp.findMany({
        where: {
          OR: [
            { projectTitle: { contains: cleanQuery, mode: 'insensitive' } },
            { ppmpNumber: { contains: cleanQuery, mode: 'insensitive' } },
            { department: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      // Purchase Orders — field: poNumber
      prisma.purchaseOrder.findMany({
        where: {
          OR: [
            { poNumber: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        include: { supplier: true },
        take: 5,
      }),
      // RFQs — fields: rfqNumber, title
      prisma.requestForQuote.findMany({
        where: {
          OR: [
            { rfqNumber: { contains: cleanQuery, mode: 'insensitive' } },
            { title: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      // Suppliers — fields: companyName, contactPerson
      prisma.supplier.findMany({
        where: {
          OR: [
            { companyName: { contains: cleanQuery, mode: 'insensitive' } },
            { contactPerson: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      // Departments — field: department
      prisma.departmentBudget.findMany({
        where: {
          OR: [
            { department: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
    ]);

    const results: GroupedSearchResults = {
      products: products.map(p => ({
        id: p.id,
        title: p.name,
        subtitle: `Est. Cost: ₱${Number(p.estimatedUnitCost).toLocaleString()}`,
        link: `/catalog/${p.id}`
      })),
      purchaseRequests: prs.map(p => ({
        id: p.id,
        title: p.prNumber,
        subtitle: `${p.department} — ${p.status}`,
        link: `/dashboard/officer/pr/${p.id}`
      })),
      ppmps: ppmps.map(p => ({
        id: p.id,
        title: p.projectTitle,
        subtitle: `${p.ppmpNumber} · ${p.department} — ${p.status}`,
        link: `/dashboard/end-user/ppmp`
      })),
      purchaseOrders: pos.map(p => ({
        id: p.id,
        title: p.poNumber,
        subtitle: `${p.supplier.companyName} — ₱${Number(p.totalCost).toLocaleString()}`,
        link: `/dashboard/officer/po/${p.id}`
      })),
      rfqs: rfqs.map(r => ({
        id: r.id,
        title: r.rfqNumber,
        subtitle: `${r.title} — ${r.status}`,
        link: `/dashboard/officer/rfq/${r.id}`
      })),
      suppliers: suppliers.map(s => ({
        id: s.id,
        title: s.companyName,
        subtitle: `Contact: ${s.contactPerson || 'N/A'}`,
        link: `/dashboard/supplier-profiles`
      })),
      departments: departments.map(d => ({
        id: d.id,
        title: d.department,
        subtitle: `Budget: ₱${Number(d.allocatedBudget).toLocaleString()}`,
        link: `/dashboard/end-user`
      })),
    };

    return { success: true, results };
  } catch (error: any) {
    console.error('Error executing global search:', error);
    return { success: false, error: error.message || 'Search execution failed.' };
  }
}
