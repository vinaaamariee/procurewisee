'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  sku: string | null;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
  estimatedUnitCost: number;
}

interface CatalogBrowserProps {
  products: Product[];
  categories: string[];
  role: string;
  roleHome: string;
}

export default function CatalogBrowser({ products, categories, role, roleHome }: CatalogBrowserProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.sku ?? '').toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search and Filters panel */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '1.25rem 1.5rem',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flex: 1, gap: '1rem', flexWrap: 'wrap', minWidth: '280px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search product SKU, name, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.8rem 0.55rem 2rem',
                borderRadius: 8,
                background: 'var(--bg-deep)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 8,
              background: 'var(--bg-deep)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="All" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c} style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>{c}</option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        {role === 'Procurement Officer' && (
          <Link
            href="/dashboard/officer/catalog"
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px var(--accent-glass)',
              transition: 'all 0.2s',
            }}
          >
            ⚙️ Manage Catalog
          </Link>
        )}
      </div>

      {/* Product Table Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '1.5rem',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-card)',
      }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
            <p style={{ fontSize: '0.875rem' }}>No catalog items found matching your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', width: '120px' }}>SKU</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', width: '140px' }}>Category</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left' }}>Product Name</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left' }}>Specs / Description</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '100px' }}>Unit</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', width: '140px' }}>Est. Unit Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                      <code>{p.sku}</code>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 6,
                        background: 'var(--bg-dark)',
                        border: '1px solid var(--border)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {p.description}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {p.unitOfMeasure}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--green)', fontSize: '0.9rem' }}>
                      ₱{Number(p.estimatedUnitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
