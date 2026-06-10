'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { submitQuoteAction } from '@/app/actions/quote-actions';

interface RfqItem {
  id: number;
  itemNumber: string;
  particulars: string;
  quantity: number;
  unit: string;
}

interface RfqDetails {
  id: number;
  rfqNumber: string;
  title: string;
  approvedBudgetContract: string | number;
  deadlineDate: string;
}

interface QuoteSubmissionFormProps {
  rfq: RfqDetails;
  rfqItems: RfqItem[];
  supplierId: number;
  existingQuote?: {
    offeredDeliveryDays: number;
    totalQuotedAmount: number;
    quoteDetails: Array<{
      rfqItemId: number;
      unitPrice: number;
      isAvailable: boolean;
    }>;
  } | null;
}

export default function QuoteSubmissionForm({
  rfq,
  rfqItems,
  supplierId,
  existingQuote,
}: QuoteSubmissionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deliveryDays, setDeliveryDays] = useState<number | ''>(
    existingQuote?.offeredDeliveryDays ?? 30
  );
  
  const initialPrices = rfqItems.reduce((acc, item) => {
    const matched = existingQuote?.quoteDetails.find((d) => d.rfqItemId === item.id);
    acc[item.id] = {
      unitPrice: matched?.isAvailable ? String(matched.unitPrice) : '',
      isAvailable: matched ? matched.isAvailable : true,
    };
    return acc;
  }, {} as Record<number, { unitPrice: string; isAvailable: boolean }>);

  const [prices, setPrices] = useState(initialPrices);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live total quoted amount calculation
  const totalQuotedAmount = rfqItems.reduce((acc, item) => {
    const entry = prices[item.id];
    if (entry && entry.isAvailable && entry.unitPrice) {
      return acc + item.quantity * (parseFloat(entry.unitPrice) || 0);
    }
    return acc;
  }, 0);

  const handlePriceChange = (itemId: number, value: string) => {
    setPrices((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        unitPrice: value.replace(/[^0-9.]/g, ''), // Numeric only
      },
    }));
  };

  const handleAvailabilityToggle = (itemId: number, available: boolean) => {
    setPrices((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isAvailable: available,
        unitPrice: available ? prev[itemId].unitPrice : '',
      },
    }));
  };

  // Option B: Download Excel Template
  const downloadExcelTemplate = () => {
    const headers = [
      ['Batanes State College — Request for Price Quotation'],
      [`RFQ Number: ${rfq.rfqNumber}`],
      [`RFQ Title: ${rfq.title}`],
      [],
      ['RFQ Item ID (Do Not Edit)', 'Item #', 'Qty', 'Unit', 'Particular', 'Unit Price (PHP)', 'Available (Yes/No)']
    ];

    const rows = rfqItems.map((item) => [
      item.id,
      item.itemNumber,
      item.quantity,
      item.unit,
      item.particulars,
      prices[item.id]?.unitPrice || '',
      prices[item.id]?.isAvailable ? 'Yes' : 'No'
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    
    // Set column widths for better design
    ws['!cols'] = [
      { wch: 25 }, // ID
      { wch: 10 }, // Item #
      { wch: 10 }, // Qty
      { wch: 10 }, // Unit
      { wch: 45 }, // Particular
      { wch: 20 }, // Price
      { wch: 20 }  // Available
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RFQ Quotation Sheet');
    XLSX.writeFile(wb, `RFQ-${rfq.rfqNumber}-Template.xlsx`);
  };

  // Option B: Upload Excel Sheet
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to array of arrays
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        
        // Find row where headers start
        const headerRowIndex = data.findIndex(
          (row) => row && row[0] && String(row[0]).includes('RFQ Item ID')
        );

        if (headerRowIndex === -1) {
          throw new Error('Invalid template format. Header row not found.');
        }

        const dataRows = data.slice(headerRowIndex + 1);
        const updatedPrices = { ...prices };

        let parsedCount = 0;

        dataRows.forEach((row) => {
          if (!row || row.length === 0) return;
          const itemId = parseInt(row[0]);
          if (isNaN(itemId)) return;

          // Verify this item belongs to our RFQ
          if (rfqItems.some((item) => item.id === itemId)) {
            const unitPriceVal = String(row[5] || '').trim();
            const availableVal = String(row[6] || '').trim().toLowerCase();

            const isAvailable = availableVal !== 'no' && availableVal !== 'none';
            const cleanPrice = isAvailable ? unitPriceVal.replace(/[^0-9.]/g, '') : '';

            updatedPrices[itemId] = {
              unitPrice: cleanPrice,
              isAvailable,
            };
            parsedCount++;
          }
        });

        if (parsedCount === 0) {
          throw new Error('No valid items found matching this RFQ.');
        }

        setPrices(updatedPrices);
        setSuccessMsg(`Successfully parsed ${parsedCount} items from spreadsheet!`);
        setErrorMsg(null);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error parsing Excel file. Please use the downloaded template.');
        setSuccessMsg(null);
      }
    };

    reader.readAsBinaryString(file);
    if (e.target) e.target.value = ''; // Reset file input
  };

  // Submit quote
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate that at least one item has price
    const quoteDetails = rfqItems.map((item) => {
      const entry = prices[item.id];
      const priceVal = parseFloat(entry?.unitPrice || '0') || 0;
      return {
        rfqItemId: item.id,
        unitPrice: priceVal,
        isAvailable: entry?.isAvailable ?? true,
      };
    });

    const hasPricing = quoteDetails.some((d) => d.isAvailable && d.unitPrice > 0);
    if (!hasPricing) {
      setErrorMsg('Please enter a valid price for at least one item.');
      return;
    }

    startTransition(async () => {
      const res = await submitQuoteAction({
        rfqId: rfq.id,
        supplierId,
        offeredDeliveryDays: parseInt(String(deliveryDays)) || 30,
        quoteDetails,
      });

      if (res.success) {
        setSuccessMsg('Your quotation has been successfully submitted!');
        setTimeout(() => {
          router.push('/dashboard/supplier');
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Failed to submit quote.');
      }
    });
  };

  const limitBudget = parseFloat(String(rfq.approvedBudgetContract));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Alert Notifications */}
      {errorMsg && (
        <div style={{
          padding: '1rem', borderRadius: 12,
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', fontSize: '0.875rem', fontWeight: 500
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '1rem', borderRadius: 12,
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          color: '#34d399', fontSize: '0.875rem', fontWeight: 500
        }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} style={{
        background: 'rgba(15,23,42,0.65)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '2rem',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        
        {/* Paper style header block */}
        <div style={{
          textAlign: 'center',
          borderBottom: '2px solid rgba(255,255,255,0.08)',
          paddingBottom: '1.5rem',
          color: '#f8fafc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🏛️</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>BATANES STATE COLLEGE</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Washington Ave., San Antonio, Basco, Batanes</div>
              <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, marginTop: '0.2rem' }}>PROCUREMENT UNIT</div>
            </div>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', letterSpacing: '1px', color: '#38bdf8' }}>
            REQUEST FOR PRICE QUOTATION
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
            <div>RFQ Ref #: <span style={{ color: '#818cf8', fontWeight: 600 }}>{rfq.rfqNumber}</span></div>
            <div>Date: {new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Procurement Guidelines */}
        <div style={{
          padding: '1.25rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 12,
          fontSize: '0.8rem',
          color: '#94a3b8',
          lineHeight: 1.6,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div>• Please offer your best and final price for the item/s listed below.</div>
          <div>• <strong>Price Evaluation Mode</strong>: The default mode shall be on a <strong>LOT BASIS</strong> (otherwise item-by-item).</div>
          <div>• <strong>Limit Budget (ABC)</strong>: <span style={{ color: '#f43f5e', fontWeight: 700 }}>₱{limitBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>. Quotes above this limit may be automatically disqualified.</div>
          <div>• In case an item is unavailable or out of stock, toggle availability to <strong>No (None)</strong>.</div>
        </div>

        {/* Options Toolbar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.03)',
          padding: '1rem',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>Excel Integration</h3>
            <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>Download template to edit offline, then re-upload.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={downloadExcelTemplate}
              style={{
                padding: '0.5rem 1rem', borderRadius: 8,
                background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)',
                color: '#38bdf8', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}
            >
              📥 Download Template
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '0.5rem 1rem', borderRadius: 8,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#34d399', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}
            >
              📤 Upload Completed Excel
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleExcelUpload}
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Pricing Form Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Item #</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Particular / Specification</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>Qty</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>Unit</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, width: '150px' }}>Unit Price (₱)</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, width: '150px' }}>Total (₱)</th>
              </tr>
            </thead>
            <tbody>
              {rfqItems.map((item) => {
                const entry = prices[item.id] || { unitPrice: '', isAvailable: true };
                const qty = item.quantity;
                const unitPriceFloat = parseFloat(entry.unitPrice) || 0;
                const rowTotal = entry.isAvailable ? qty * unitPriceFloat : 0;

                return (
                  <tr key={item.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: entry.isAvailable ? 'transparent' : 'rgba(239,68,68,0.02)',
                    color: entry.isAvailable ? '#f1f5f9' : '#64748b',
                    transition: 'all 0.2s'
                  }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#818cf8' }}>{item.itemNumber}</td>
                    <td style={{ padding: '1rem', maxWidth: '300px' }}>
                      <div style={{ fontWeight: 600 }}>{item.particulars}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{qty}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>{item.unit}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleAvailabilityToggle(item.id, !entry.isAvailable)}
                        style={{
                          padding: '0.25rem 0.5rem', borderRadius: 6,
                          background: entry.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${entry.isAvailable ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          color: entry.isAvailable ? '#34d399' : '#f87171',
                          fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        {entry.isAvailable ? 'Available' : 'None'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <input
                        type="text"
                        placeholder={entry.isAvailable ? '0.00' : 'None'}
                        disabled={!entry.isAvailable}
                        value={entry.unitPrice}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        style={{
                          width: '100%', padding: '0.4rem 0.65rem', borderRadius: 6,
                          background: entry.isAvailable ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${entry.isAvailable ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                          color: '#f8fafc', textAlign: 'right', fontSize: '0.85rem', fontFamily: 'monospace',
                        }}
                      />
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: entry.isAvailable ? '#34d399' : '#475569' }}>
                      {entry.isAvailable ? `₱${rowTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr style={{ background: 'rgba(255,255,255,0.01)', fontWeight: 800 }}>
                <td colSpan={6} style={{ padding: '1.25rem 1rem', textAlign: 'right', fontSize: '0.9rem', color: '#f1f5f9' }}>
                  Total Bid Amount:
                </td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontSize: '1rem', color: totalQuotedAmount > limitBudget ? '#f43f5e' : '#34d399', fontFamily: 'monospace' }}>
                  ₱{totalQuotedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {totalQuotedAmount > limitBudget && (
                    <div style={{ fontSize: '0.65rem', color: '#f43f5e', fontWeight: 600, marginTop: '0.25rem' }}>
                      Exceeds ABC Budget Limit!
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commitment Options Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.5rem',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
              Offered Delivery Days
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                min={1}
                required
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(parseInt(e.target.value) || '')}
                style={{
                  width: '100px', padding: '0.5rem', borderRadius: 8,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f8fafc', textAlign: 'center', fontWeight: 700
                }}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Calendar Days</span>
            </div>
            <p style={{ fontSize: '0.68rem', color: '#475569', marginTop: '0.4rem' }}>
              Standard RFQ request is 30 calendar days. Faster delivery scores higher in MCDM.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'right' }}>
              By submitting, you certify that prices are final and terms are accepted.
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => router.push('/dashboard/supplier')}
                style={{
                  padding: '0.6rem 1.5rem', borderRadius: 8,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || totalQuotedAmount > limitBudget}
                style={{
                  padding: '0.6rem 2rem', borderRadius: 8,
                  background: 'linear-gradient(135deg,#6366f1,#38bdf8)', border: 'none',
                  color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
                  opacity: (isPending || totalQuotedAmount > limitBudget) ? 0.5 : 1,
                  cursor: (isPending || totalQuotedAmount > limitBudget) ? 'not-allowed' : 'pointer'
                }}
              >
                {isPending ? 'Submitting Quote...' : 'Submit Quotation'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
