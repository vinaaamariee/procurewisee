'use client';

import React from 'react';

export interface CatalogProductOption {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
}

export interface PRItemRow {
  id: string;
  stockNo: string;
  unit: string;
  description: string;
  brand?: string;
  quantity: number;
  estimatedUnitCost: number;
  estimatedCost: number;
  productId?: number | null;
  specification?: string;
}

interface PRItemsTableProps {
  items: PRItemRow[];
  setItems?: React.Dispatch<React.SetStateAction<PRItemRow[]>>;
  catalogProducts?: CatalogProductOption[];
  isReadOnly?: boolean;
}

export default function PRItemsTable({
  items,
  setItems,
  catalogProducts = [],
  isReadOnly = false,
}: PRItemsTableProps) {
  const getSequentialStockNo = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const handleAddItem = () => {
    if (!setItems) return;
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        stockNo: getSequentialStockNo(prev.length),
        unit: 'pcs',
        description: '',
        quantity: 1,
        estimatedUnitCost: 0,
        estimatedCost: 0,
        productId: null,
      },
    ]);
  };

  const handleDeleteItem = (id: string) => {
    if (!setItems) return;
    if (items.length === 1) return;
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return filtered.map((item, index) => ({
        ...item,
        stockNo: getSequentialStockNo(index),
      }));
    });
  };

  const handleItemFieldChange = (id: string, field: keyof PRItemRow, value: any) => {
    if (!setItems) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // If linking a Catalog Product, pre-fill description, unit, and unit cost
        if (field === 'productId') {
          const prodVal = value ? parseInt(value) : null;
          const matchedProduct = catalogProducts.find((p) => p.id === prodVal);
          const unitCost = item.estimatedUnitCost;
          const description = matchedProduct
            ? `${matchedProduct.name} - ${matchedProduct.description}`
            : item.description;
          const unit = matchedProduct ? matchedProduct.unitOfMeasure : item.unit;

          return {
            ...item,
            productId: prodVal,
            description,
            unit,
            estimatedUnitCost: unitCost,
            estimatedCost: item.quantity * unitCost,
          };
        }

        // Recalculate total cost if quantity or unit cost changes
        if (field === 'quantity') {
          const qty = parseInt(value) || 0;
          return {
            ...item,
            quantity: qty,
            estimatedCost: qty * item.estimatedUnitCost,
          };
        }

        if (field === 'estimatedUnitCost') {
          const cost = parseFloat(value) || 0;
          return {
            ...item,
            estimatedUnitCost: cost,
            estimatedCost: item.quantity * cost,
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  // Grand Total Calculation
  const grandTotal = items.reduce((sum, item) => sum + (item.estimatedCost || (item.quantity * item.estimatedUnitCost)), 0);

  return (
    <div className="pr-items-section my-2.5 font-serif space-y-2 break-inside-avoid" style={{pageBreakInside: 'avoid'}}>
      {/* Table Header Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-sans">
          Requisitioned Items & Estimated Schedule
        </h3>
        {!isReadOnly && setItems && (
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 text-xs font-sans font-bold text-[var(--accent)] hover:underline bg-[var(--secondary-dim)] border border-[var(--border-accent)] px-2.5 py-1 rounded print:hidden"
          >
            <span>+ Add Item Row</span>
          </button>
        )}
      </div>

      {/* Official Bordered Table */}
      <div className="overflow-x-auto border border-[var(--text-primary)]">
        <table className="w-full border-collapse text-xs table-fixed">
          <colgroup>
            <col style={{width: '7%'}} />
            <col style={{width: '8%'}} />
            <col />
            <col style={{width: '10%'}} />
            <col style={{width: '12%'}} />
            <col style={{width: '13%'}} />
            {!isReadOnly && <col style={{width: '5%'}} />}
          </colgroup>
          <thead>
            <tr className="bg-[var(--secondary-dim)] border-b border-[var(--text-primary)] text-[var(--text-primary)] font-bold uppercase text-[11px] font-sans">
              <th className="border-r border-[var(--text-primary)] p-1.5 text-center">
                Stock / Property No.
              </th>
              <th className="border-r border-[var(--text-primary)] p-1.5 text-center">Unit</th>
              <th className="border-r border-[var(--text-primary)] p-1.5 text-left">
                Item Description / Technical Specifications
              </th>
              <th className="border-r border-[var(--text-primary)] p-1.5 text-center">Quantity</th>
              <th className="border-r border-[var(--text-primary)] p-1.5 text-right">
                Unit Cost (₱)
              </th>
              <th className="border-r border-[var(--text-primary)] p-1.5 text-right">
                Total Cost (₱)
              </th>
              {!isReadOnly && <th className="p-1.5 text-center print:hidden">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.map((item, index) => {
              const lineTotal = item.estimatedCost || (item.quantity * item.estimatedUnitCost);

              return (
                <tr key={item.id || index} className="hover:bg-[var(--surface-hover)]">
                  {/* Stock / Property No */}
                  <td className="border-r border-[var(--border)] p-1.5 text-center font-semibold text-[var(--text-primary)] align-top">
                    {isReadOnly ? (
                      item.stockNo
                    ) : (
                      <input
                        type="text"
                        value={item.stockNo}
                        onChange={(e) => handleItemFieldChange(item.id, 'stockNo', e.target.value)}
                        className="w-full text-center font-semibold bg-[var(--secondary-dim)] border border-[var(--border)] rounded p-1 text-xs"
                      />
                    )}
                  </td>

                  {/* Unit */}
                  <td className="border-r border-[var(--border)] p-1.5 text-center align-top">
                    {isReadOnly ? (
                      item.unit
                    ) : (
                      <input
                        type="text"
                        required
                        value={item.unit}
                        onChange={(e) => handleItemFieldChange(item.id, 'unit', e.target.value)}
                        placeholder="pcs, reams"
                        className="w-full text-center bg-[var(--secondary-dim)] border border-[var(--border)] rounded p-1 text-xs"
                      />
                    )}
                  </td>

                  {/* Item Description */}
                  <td className="border-r border-[var(--border)] p-1.5 align-top space-y-1.5">
                    {!isReadOnly && catalogProducts.length > 0 && (
                      <select
                        value={item.productId || ''}
                        onChange={(e) => handleItemFieldChange(item.id, 'productId', e.target.value)}
                        className="w-full text-[11px] p-1 border border-[var(--border)] rounded bg-[var(--surface)] text-[var(--text-primary)] print:hidden"
                      >
                        <option value="">-- Autocomplete from Product Catalog (Optional) --</option>
                        {catalogProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.sku}] {p.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {isReadOnly ? (
                      <div className="whitespace-pre-wrap leading-relaxed text-[var(--text-primary)] font-serif">
                        {item.description}
                      </div>
                    ) : (
                      <textarea
                        required
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleItemFieldChange(item.id, 'description', e.target.value)}
                        placeholder="Detailed item description and technical specifications..."
                        className="w-full p-1.5 text-xs bg-[var(--secondary-dim)] border border-[var(--border)] rounded font-serif text-[var(--text-primary)] resize-y"
                      />
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="border-r border-[var(--border)] p-1.5 text-center align-top">
                    {isReadOnly ? (
                      item.quantity
                    ) : (
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemFieldChange(item.id, 'quantity', e.target.value)}
                        className="w-full text-center font-semibold bg-[var(--secondary-dim)] border border-[var(--border)] rounded p-1 text-xs"
                      />
                    )}
                  </td>

                  {/* Unit Cost */}
                  <td className="border-r border-[var(--border)] p-1.5 text-right align-top">
                    {isReadOnly ? (
                      `₱ ${item.estimatedUnitCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={item.estimatedUnitCost || ''}
                        onChange={(e) => handleItemFieldChange(item.id, 'estimatedUnitCost', e.target.value)}
                        placeholder="0.00"
                        className="w-full text-right font-semibold bg-[var(--secondary-dim)] border border-[var(--border)] rounded p-1 text-xs"
                      />
                    )}
                  </td>

                  {/* Total Cost (Read-Only) */}
                  <td className="border-r border-[var(--border)] p-1.5 text-right font-bold text-[var(--text-primary)] align-top">
                    ₱ {lineTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Action Column */}
                  {!isReadOnly && (
                    <td className="p-1.5 text-center align-top print:hidden">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={items.length === 1}
                        title="Delete item row"
                        className={`p-1 rounded text-[var(--accent)] hover:bg-[var(--accent-glass)] ${
                          items.length === 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Grand Total Footer Row */}
            <tr className="bg-[var(--secondary-dim)] border-t-2 border-[var(--text-primary)] font-bold font-sans text-xs">
              <td colSpan={5} className="border-r border-[var(--text-primary)] p-2 text-right uppercase tracking-wider text-[var(--text-primary)]">
                Grand Total / Estimated Total Cost:
              </td>
              <td className="p-2 text-right text-[#7B1E1E] text-sm">
                ₱ {grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </td>
              {!isReadOnly && <td className="print:hidden"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
