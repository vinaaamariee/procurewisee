'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createRfqAction } from '@/app/actions/rfq';

interface AppItem {
  id: number;
  papCode: string;
  projectTitle: string;
  generalDescription: string;
  estimatedBudget: number;
}

interface CatalogProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
  estimatedUnitCost: number;
}

interface ItemRow {
  id: string;
  itemNumber: string;
  particulars: string;
  quantity: number;
  unit: string;
  appItemId: number | null;
  productId: number | null;
}

interface RfqCreationFormProps {
  appItems: AppItem[];
  catalogProducts: CatalogProduct[];
}

export default function RfqCreationForm({ appItems, catalogProducts }: RfqCreationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 1. Initial State
  const initialRfqNumber = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(100 + Math.random() * 900); // 3 digit random
    return `${year}${month}-GAS1-${random}`;
  };

  const getDefaultDeadlineDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 7 calendar days
    return date.toISOString().split('T')[0];
  };

  const [rfqNumber, setRfqNumber] = useState(initialRfqNumber());
  const [title, setTitle] = useState('');
  const [approvedBudget, setApprovedBudget] = useState<number | ''>('');
  const [deadlineDate, setDeadlineDate] = useState(getDefaultDeadlineDate());
  const [status, setStatus] = useState<'Draft' | 'Published'>('Published');

  const [items, setItems] = useState<ItemRow[]>([
    {
      id: 'initial-item-1',
      itemNumber: '001',
      particulars: '',
      quantity: 1,
      unit: 'pcs',
      appItemId: null,
      productId: null,
    },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to get formatted sequence (e.g. "001", "002")
  const getSequentialNumber = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  // 2. Add/Remove/Modify Items
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        itemNumber: getSequentialNumber(prev.length),
        particulars: '',
        quantity: 1,
        unit: 'pcs',
        appItemId: null,
        productId: null,
      },
    ]);
  };

  const handleDeleteItem = (id: string) => {
    if (items.length === 1) {
      setErrorMsg('An RFQ must have at least one line item.');
      return;
    }
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return filtered.map((item, index) => ({
        ...item,
        itemNumber: getSequentialNumber(index),
      }));
    });
  };

  const handleItemFieldChange = (id: string, field: keyof ItemRow, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // If linking an APP Item, automatically pre-fill particulars
        if (field === 'appItemId') {
          const appItemVal = value ? parseInt(value) : null;
          const matchedAppItem = appItems.find((a) => a.id === appItemVal);
          return {
            ...item,
            appItemId: appItemVal,
            particulars: matchedAppItem ? matchedAppItem.generalDescription : item.particulars,
          };
        }

        // If linking a Catalog Product, pre-fill name/specs and unit
        if (field === 'productId') {
          const prodVal = value ? parseInt(value) : null;
          const matchedProduct = catalogProducts.find((p) => p.id === prodVal);
          return {
            ...item,
            productId: prodVal,
            particulars: matchedProduct
              ? `${matchedProduct.name} - SKU: ${matchedProduct.sku} (${matchedProduct.description})`
              : item.particulars,
            unit: matchedProduct ? matchedProduct.unitOfMeasure : item.unit,
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  // 3. Form Submission
  const handleSubmit = (e: React.FormEvent, submitStatus?: 'Draft' | 'Published') => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const activeStatus = submitStatus || status;

    if (!rfqNumber.trim()) {
      setErrorMsg('Please enter an RFQ reference number.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter an RFQ title.');
      return;
    }
    if (!approvedBudget || approvedBudget <= 0) {
      setErrorMsg('Please enter a valid Approved Budget for the Contract (ABC).');
      return;
    }
    if (!deadlineDate) {
      setErrorMsg('Please select a submission deadline.');
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.particulars.trim()) {
        setErrorMsg(`Item ${item.itemNumber} particulars / description cannot be empty.`);
        return;
      }
      if (item.quantity <= 0) {
        setErrorMsg(`Item ${item.itemNumber} quantity must be 1 or more.`);
        return;
      }
      if (!item.unit.trim()) {
        setErrorMsg(`Item ${item.itemNumber} unit (e.g. pcs, ream) is required.`);
        return;
      }
    }

    startTransition(async () => {
      const res = await createRfqAction({
        rfqNumber,
        title,
        approvedBudgetContract: Number(approvedBudget),
        deadlineDate,
        status: activeStatus,
        items: items.map((item) => ({
          itemNumber: item.itemNumber,
          particulars: item.particulars,
          quantity: item.quantity,
          unit: item.unit,
          appItemId: item.appItemId,
          productId: item.productId,
        })),
      });

      if (res.success) {
        setSuccessMsg(
          activeStatus === 'Published'
            ? 'RFQ successfully published and sent to suppliers!'
            : 'RFQ draft saved successfully!'
        );
        setTimeout(() => {
          router.push('/dashboard/officer');
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Failed to create RFQ.');
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Alert Banners */}
      {errorMsg && (
        <div style={{
          padding: '1rem', borderRadius: 12,
          background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444', fontSize: '0.875rem', fontWeight: 500
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '1rem', borderRadius: 12,
          background: 'var(--green-dim)', border: '1px solid var(--border)',
          color: 'var(--green)', fontSize: '0.875rem', fontWeight: 500
        }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Main Glass Form */}
      <form onSubmit={(e) => handleSubmit(e)} style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '2rem',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        
        {/* official header styling */}
        <div style={{
          textAlign: 'center',
          borderBottom: '2px solid var(--border)',
          paddingBottom: '1.5rem',
          color: 'var(--text-primary)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🏛️</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>BATANES STATE COLLEGE</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Washington Ave., San Antonio, Basco, Batanes</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, marginTop: '0.2rem' }}>PROCUREMENT UNIT</div>
            </div>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', letterSpacing: '1px', color: 'var(--secondary)' }}>
            CREATE REQUEST FOR PRICE QUOTATION
          </h2>
        </div>

        {/* Form Fields Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}>
          {/* RFQ Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>RFQ Ref No. *</label>
            <input
              type="text"
              required
              value={rfqNumber}
              onChange={(e) => setRfqNumber(e.target.value)}
              placeholder="e.g. 2606-GAS1-185"
              style={{
                padding: '0.6rem 0.8rem', borderRadius: 8,
                background: 'var(--bg-deep)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Title / Subject of Solicitation *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Procurement of Sticker Wrap with Print"
              style={{
                padding: '0.6rem 0.8rem', borderRadius: 8,
                background: 'var(--bg-deep)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Approved Budget Contract */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Approved Budget for the Contract (ABC) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>₱</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={approvedBudget}
                onChange={(e) => setApprovedBudget(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                style={{
                  width: '100%', padding: '0.6rem 0.8rem 0.6rem 1.8rem', borderRadius: 8,
                  background: 'var(--bg-deep)', border: '1px solid var(--border)',
                  color: 'var(--green)', fontSize: '0.85rem', fontWeight: 700,
                }}
              />
            </div>
          </div>

          {/* Deadline Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Submission Deadline *</label>
            <input
              type="date"
              required
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              style={{
                padding: '0.6rem 0.8rem', borderRadius: 8,
                background: 'var(--bg-deep)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.85rem'
              }}
            />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Defaults to 7 calendar days</span>
          </div>
        </div>

        {/* Dynamic Line Items Section */}
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '0.3px' }}>Solicited Line Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              style={{
                padding: '0.4rem 0.8rem', borderRadius: 6,
                background: 'var(--accent-glass)', border: '1px solid var(--border)',
                color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              + Add Item Row
            </button>
          </div>

          {/* Line Items Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left', width: '70px' }}>Item #</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', width: '220px' }}>Link APP Item (Optional)</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', width: '220px' }}>Product Catalog (Optional)</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Particulars / Description Specification *</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', width: '90px' }}>Qty *</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', width: '100px' }}>Unit *</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                    
                    {/* Item Number */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <input
                        type="text"
                        readOnly
                        value={item.itemNumber}
                        style={{
                          width: '100%', padding: '0.4rem', borderRadius: 6,
                          background: 'var(--bg-dark)', border: 'none',
                          color: 'var(--accent)', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem'
                        }}
                      />
                    </td>
 
                    {/* APP Item selector */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <select
                        value={item.appItemId || ''}
                        onChange={(e) => handleItemFieldChange(item.id, 'appItemId', e.target.value)}
                        style={{
                          width: '100%', padding: '0.4rem', borderRadius: 6,
                          background: 'var(--bg-deep)', border: '1px solid var(--border)',
                          color: 'var(--text-primary)', fontSize: '0.8rem', maxWidth: '220px'
                        }}
                      >
                        <option value="" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>-- Select APP Item --</option>
                        {appItems.map((a) => (
                          <option key={a.id} value={a.id} style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
                            [{a.papCode}] {a.projectTitle} (₱{Number(a.estimatedBudget).toLocaleString('en-PH')})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Catalog Product selector */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <select
                        value={item.productId || ''}
                        onChange={(e) => handleItemFieldChange(item.id, 'productId', e.target.value)}
                        style={{
                          width: '100%', padding: '0.4rem', borderRadius: 6,
                          background: 'var(--bg-deep)', border: '1px solid var(--border)',
                          color: 'var(--text-primary)', fontSize: '0.8rem', maxWidth: '220px'
                        }}
                      >
                        <option value="" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>-- Select Catalog Product --</option>
                        {catalogProducts.map((p) => (
                          <option key={p.id} value={p.id} style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
                            [{p.sku}] {p.name} (₱{Number(p.estimatedUnitCost).toLocaleString('en-PH')})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Particulars */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <textarea
                        required
                        rows={2}
                        value={item.particulars}
                        onChange={(e) => handleItemFieldChange(item.id, 'particulars', e.target.value)}
                        placeholder="Describe the item specifications exactly..."
                        style={{
                          width: '100%', padding: '0.4rem 0.6rem', borderRadius: 6,
                          background: 'var(--bg-deep)', border: '1px solid var(--border)',
                          color: 'var(--text-primary)', fontSize: '0.82rem', resize: 'vertical', fontFamily: 'sans-serif'
                        }}
                      />
                    </td>

                    {/* Qty */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemFieldChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        style={{
                          width: '100%', padding: '0.4rem', borderRadius: 6,
                          background: 'var(--bg-deep)', border: '1px solid var(--border)',
                          color: 'var(--text-primary)', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem'
                        }}
                      />
                    </td>

                    {/* Unit */}
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <input
                        type="text"
                        required
                        value={item.unit}
                        onChange={(e) => handleItemFieldChange(item.id, 'unit', e.target.value)}
                        placeholder="pcs, ream..."
                        list="unit-suggestions"
                        style={{
                          width: '100%', padding: '0.4rem', borderRadius: 6,
                          background: 'var(--bg-deep)', border: '1px solid var(--border)',
                          color: 'var(--text-primary)', fontSize: '0.82rem'
                        }}
                      />
                      <datalist id="unit-suggestions">
                        <option value="pcs" />
                        <option value="ream" />
                        <option value="box" />
                        <option value="pack" />
                        <option value="unit" />
                        <option value="set" />
                        <option value="roll" />
                        <option value="lot" />
                      </datalist>
                    </td>

                    {/* Delete Action */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={items.length === 1}
                        style={{
                          padding: '0.4rem', borderRadius: 6,
                          background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
                          color: '#ef4444', fontSize: '0.75rem', cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                          opacity: items.length === 1 ? 0.4 : 1, transition: 'all 0.2s'
                        }}
                        title="Delete this row"
                      >
                        🗑️
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          marginTop: '1rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            * Denotes a required field
          </span>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => router.push('/dashboard/officer')}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: 8,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            {/* Save Draft Button */}
            <button
              type="button"
              disabled={isPending}
              onClick={(e) => handleSubmit(e, 'Draft')}
              style={{
                padding: '0.6rem 1.5rem', borderRadius: 8,
                background: 'var(--bg-dark)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: isPending ? 0.5 : 1,
              }}
            >
              Save as Draft
            </button>

            {/* Publish Solicitation Button */}
            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '0.6rem 2rem', borderRadius: 8,
                background: 'var(--accent)', border: 'none',
                color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px var(--accent-glass)',
                transition: 'all 0.2s',
                opacity: isPending ? 0.5 : 1,
              }}
            >
              {isPending ? 'Processing...' : 'Publish Solicitation'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
