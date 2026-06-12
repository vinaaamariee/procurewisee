'use client';

import { useState, useTransition } from 'react';
import { createCatalogProduct, updateCatalogProduct, deleteCatalogProduct } from '@/app/actions/catalog';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
  estimatedUnitCost: number;
  isActive: boolean;
}

interface CatalogManagerProps {
  products: Product[];
}

export default function CatalogManager({ products }: CatalogManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('pcs');
  const [estimatedUnitCost, setEstimatedUnitCost] = useState<number | ''>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingProduct(null);
    setSku('');
    setName('');
    setCategory('');
    setDescription('');
    setUnitOfMeasure('pcs');
    setEstimatedUnitCost('');
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProduct(p);
    setSku(p.sku);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description);
    setUnitOfMeasure(p.unitOfMeasure);
    setEstimatedUnitCost(p.estimatedUnitCost);
    setErrorMsg(null);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!sku.trim() || !name.trim() || !category.trim() || !unitOfMeasure.trim() || estimatedUnitCost === '') {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    startTransition(async () => {
      let res;
      if (editingProduct) {
        res = await updateCatalogProduct(editingProduct.id, {
          sku,
          name,
          category,
          description,
          unitOfMeasure,
          estimatedUnitCost: Number(estimatedUnitCost),
        });
      } else {
        res = await createCatalogProduct({
          sku,
          name,
          category,
          description,
          unitOfMeasure,
          estimatedUnitCost: Number(estimatedUnitCost),
        });
      }

      if (res.success) {
        setSuccessMsg(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        setTimeout(() => {
          setIsFormOpen(false);
          setSuccessMsg(null);
          router.refresh();
        }, 1000);
      } else {
        setErrorMsg(res.error || 'Failed to save product.');
      }
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Are you sure you want to deactivate "${name}" from the product catalog?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCatalogProduct(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || 'Failed to delete product.');
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Action panel */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={openAddForm}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: 8,
            background: 'var(--accent)',
            border: 'none',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px var(--accent-glass)',
            transition: 'all 0.2s',
          }}
        >
          ➕ Add Catalog Item
        </button>
      </div>

      {/* CRUD Form Drawer / Card */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '2rem',
          backdropFilter: 'blur(16px)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            {editingProduct ? `✏️ Edit Product: ${editingProduct.sku}` : '➕ Add New Catalog Product'}
          </h3>

          {errorMsg && (
            <div style={{ padding: '0.75rem', borderRadius: 8, background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.8rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '0.75rem', borderRadius: 8, background: 'var(--green-dim)', border: '1px solid var(--border)', color: 'var(--green)', fontSize: '0.8rem' }}>
              ✅ {successMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* SKU */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>SKU / Product Code *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. PAP-A4-002"
                style={{ padding: '0.5rem', borderRadius: 6, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>

            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paper A4 Premium"
                style={{ padding: '0.5rem', borderRadius: 6, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>

            {/* Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Category *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Office Supplies"
                style={{ padding: '0.5rem', borderRadius: 6, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>

            {/* Unit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Unit of Measure *</label>
              <input
                type="text"
                required
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                placeholder="e.g. ream, box, unit"
                style={{ padding: '0.5rem', borderRadius: 6, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>

            {/* Estimated Unit Cost */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Estimated Unit Cost (₱) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={estimatedUnitCost}
                onChange={(e) => setEstimatedUnitCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                style={{ padding: '0.5rem', borderRadius: 6, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--green)', fontSize: '0.85rem', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Product Specifications / Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe standard product dimensions, specifications, material, etc..."
              style={{ padding: '0.5rem', borderRadius: 6, background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', fontFamily: 'sans-serif' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              style={{ padding: '0.5rem 1.25rem', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{ padding: '0.5rem 1.75rem', borderRadius: 6, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}
            >
              {isPending ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      )}

      {/* Catalog Table */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '1.5rem',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', width: '120px' }}>SKU</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', width: '140px' }}>Category</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left' }}>Product Name</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '80px' }}>Unit</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', width: '130px' }}>Est. Cost</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', opacity: p.isActive ? 1 : 0.4 }}>
                  <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                    <code>{p.sku}</code>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, background: 'var(--bg-dark)', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {p.unitOfMeasure}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--green)' }}>
                    ₱{Number(p.estimatedUnitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditForm(p)}
                        style={{ padding: '0.3rem 0.6rem', borderRadius: 6, background: 'var(--accent-glass)', border: '1px solid var(--border)', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={!p.isActive}
                        style={{ padding: '0.3rem 0.6rem', borderRadius: 6, background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.75rem', cursor: p.isActive ? 'pointer' : 'not-allowed', opacity: p.isActive ? 1 : 0.5 }}
                      >
                        🗑️ Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
