'use client';

import React from 'react';

export interface AppItem {
  id: number;
  papCode: string;
  projectTitle: string;
  generalDescription: string;
  estimatedBudget: number;
}

export interface CatalogProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  unitOfMeasure: string;
}

export interface ItemRow {
  id: string;
  itemNumber: string;
  particulars: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  appItemId?: number | null;
  productId?: number | null;
}

interface RFQItemsTableProps {
  items: ItemRow[];
  setItems?: React.Dispatch<React.SetStateAction<ItemRow[]>>;
  appItems?: AppItem[];
  catalogProducts?: CatalogProduct[];
  isReadOnly?: boolean;
}

export default function RFQItemsTable({
  items,
  setItems,
  appItems = [],
  catalogProducts = [],
  isReadOnly = false,
}: RFQItemsTableProps) {
  const getSequentialNumber = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const handleAddItem = () => {
    if (!setItems) return;
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        itemNumber: getSequentialNumber(prev.length),
        particulars: '',
        quantity: 1,
        unit: 'pcs',
        unitCost: 0,
        totalCost: 0,
        appItemId: null,
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
        itemNumber: getSequentialNumber(index),
      }));
    });
  };

  const handleItemFieldChange = (id: string, field: keyof ItemRow, value: any) => {
    if (!setItems) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // Linking APP Item pre-fills particulars
        if (field === 'appItemId') {
          const appItemVal = value ? parseInt(value) : null;
          const matchedAppItem = appItems.find((a) => a.id === appItemVal);
          return {
            ...item,
            appItemId: appItemVal,
            particulars: matchedAppItem ? matchedAppItem.generalDescription : item.particulars,
          };
        }

        // Linking Catalog Product pre-fills name/specs, unit, and unit cost
        if (field === 'productId') {
          const prodVal = value ? parseInt(value) : null;
          const matchedProduct = catalogProducts.find((p) => p.id === prodVal);
          const newUnitCost = item.unitCost || 0;
          return {
            ...item,
            productId: prodVal,
            particulars: matchedProduct
              ? `${matchedProduct.name} - SKU: ${matchedProduct.sku} (${matchedProduct.description})`
              : item.particulars,
            unit: matchedProduct ? matchedProduct.unitOfMeasure : item.unit,
            unitCost: newUnitCost,
            totalCost: item.quantity * newUnitCost,
          };
        }

        // Recalculate total cost if qty or unitCost changes
        if (field === 'quantity') {
          const qty = parseInt(value) || 0;
          return {
            ...item,
            quantity: qty,
            totalCost: qty * (item.unitCost || 0),
          };
        }

        if (field === 'unitCost') {
          const cost = parseFloat(value) || 0;
          return {
            ...item,
            unitCost: cost,
            totalCost: item.quantity * cost,
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  // Grand Total Calculation
  const grandTotal = items.reduce((sum, item) => {
    const cost = item.totalCost || (item.quantity * (item.unitCost || 0));
    return sum + cost;
  }, 0);

  return (
    <div className="my-4 font-serif space-y-2">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-sans">
          Itemized Specifications & Price Schedule
        </h3>
        {!isReadOnly && setItems && (
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 text-xs font-sans font-bold text-[#800000] hover:underline bg-[var(--secondary-dim)] border border-[var(--border-accent)] px-2.5 py-1 rounded print:hidden"
          >
            <span>+ Add Line Item</span>
          </button>
        )}
      </div>

      {/* Official Bordered Table */}
      <div className="overflow-x-auto border border-gray-900">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-900 text-gray-900 font-bold uppercase text-[11px] font-sans">
              <th className="border-r border-gray-900 p-2 text-center w-12">Item No.</th>
              <th className="border-r border-gray-900 p-2 text-center w-16">Qty</th>
              <th className="border-r border-gray-900 p-2 text-center w-20">Unit</th>
              <th className="border-r border-gray-900 p-2 text-left">
                Item Description / Technical Specifications
              </th>
              <th className="border-r border-gray-900 p-2 text-right w-28">
                Unit Cost (₱)
              </th>
              <th className="border-r border-gray-900 p-2 text-right w-32">
                Total Cost (₱)
              </th>
              {!isReadOnly && <th className="p-2 text-center w-10 print:hidden">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.map((item, index) => {
              const lineTotal = item.totalCost || (item.quantity * (item.unitCost || 0));

              return (
                <tr key={item.id || index} className="hover:bg-gray-50/50">
                  {/* Item Number */}
                  <td className="border-r border-gray-800 p-2 text-center font-bold text-gray-900 align-top">
                    {item.itemNumber}
                  </td>

                  {/* Quantity */}
                  <td className="border-r border-gray-800 p-2 text-center align-top">
                    {isReadOnly ? (
                      item.quantity
                    ) : (
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemFieldChange(item.id, 'quantity', e.target.value)}
                        className="w-full text-center font-semibold bg-[var(--secondary-dim)]/50 border border-gray-300 rounded p-1 text-xs"
                      />
                    )}
                  </td>

                  {/* Unit */}
                  <td className="border-r border-gray-800 p-2 text-center align-top">
                    {isReadOnly ? (
                      item.unit
                    ) : (
                      <input
                        type="text"
                        required
                        value={item.unit}
                        onChange={(e) => handleItemFieldChange(item.id, 'unit', e.target.value)}
                        placeholder="pcs, reams"
                        className="w-full text-center bg-[var(--secondary-dim)]/50 border border-gray-300 rounded p-1 text-xs"
                      />
                    )}
                  </td>

                  {/* Particulars / Specifications */}
                  <td className="border-r border-gray-800 p-2 align-top space-y-1.5">
                    {!isReadOnly && (appItems.length > 0 || catalogProducts.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 print:hidden">
                        {appItems.length > 0 && (
                          <select
                            value={item.appItemId || ''}
                            onChange={(e) => handleItemFieldChange(item.id, 'appItemId', e.target.value)}
                            className="w-full text-[11px] p-1 border border-gray-300 rounded bg-white text-gray-700"
                          >
                            <option value="">-- Link APP Item (Optional) --</option>
                            {appItems.map((a) => (
                              <option key={a.id} value={a.id}>
                                [{a.papCode}] {a.projectTitle} (₱{Number(a.estimatedBudget).toLocaleString('en-PH')})
                              </option>
                            ))}
                          </select>
                        )}
                        {catalogProducts.length > 0 && (
                          <select
                            value={item.productId || ''}
                            onChange={(e) => handleItemFieldChange(item.id, 'productId', e.target.value)}
                            className="w-full text-[11px] p-1 border border-gray-300 rounded bg-white text-gray-700"
                          >
                            <option value="">-- Link Product Catalog (Optional) --</option>
                            {catalogProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.sku}] {p.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {isReadOnly ? (
                      <div className="whitespace-pre-wrap leading-relaxed text-gray-900 font-serif">
                        {item.particulars}
                      </div>
                    ) : (
                      <textarea
                        required
                        rows={2}
                        value={item.particulars}
                        onChange={(e) => handleItemFieldChange(item.id, 'particulars', e.target.value)}
                        placeholder="Detailed item particulars and specifications..."
                        className="w-full p-1.5 text-xs bg-[var(--secondary-dim)]/50 border border-gray-300 rounded font-serif text-gray-900 resize-y"
                      />
                    )}
                  </td>

                  {/* Unit Cost */}
                  <td className="border-r border-gray-800 p-2 text-right align-top">
                    {isReadOnly ? (
                      item.unitCost ? `₱ ${item.unitCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost || ''}
                        onChange={(e) => handleItemFieldChange(item.id, 'unitCost', e.target.value)}
                        placeholder="0.00"
                        className="w-full text-right font-semibold bg-[var(--secondary-dim)]/50 border border-gray-300 rounded p-1 text-xs"
                      />
                    )}
                  </td>

                  {/* Total Cost */}
                  <td className="border-r border-gray-800 p-2 text-right font-bold text-gray-900 align-top">
                    ₱ {lineTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Delete Action */}
                  {!isReadOnly && (
                    <td className="p-2 text-center align-top print:hidden">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={items.length === 1}
                        title="Delete line item"
                        className={`p-1 rounded text-[var(--accent)] hover:bg-[var(--accent-glass)] ${items.length === 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
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
            <tr className="bg-gray-100 border-t-2 border-gray-900 font-bold font-sans text-xs">
              <td colSpan={4} className="border-r border-gray-900 p-2.5 text-right uppercase tracking-wider text-gray-950">
                Grand Total / Approved Budget Total:
              </td>
              <td colSpan={2} className="p-2.5 text-right text-[#800000] text-sm">
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
