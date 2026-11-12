import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Trash2,
  CheckCircle2,
  User,
  Phone,
  FileText,
  DollarSign,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { parseQuantity } from '../utils/quantityParser';

interface ProductRow {
  id: string;
  productName: string;
  quantity: string;
  unitPrice: string;
}

interface NewDebtViewProps {
  onDebtSaved?: (customerId: string) => void;
}

export const NewDebtView: React.FC<NewDebtViewProps> = ({ onDebtSaved }) => {
  const { t, customers, recordDebtTransaction, getCustomerBalance } = useApp();

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Products Table Rows (minimum 1 initial row)
  const [products, setProducts] = useState<ProductRow[]>([
    { id: 'row-1', productName: '', quantity: '1', unitPrice: '' },
  ]);

  // Notes
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // When selecting existing customer
  const handleSelectExistingCustomer = (id: string) => {
    setSelectedCustomerId(id);
    if (!id) {
      setCustomerName('');
      setCustomerPhone('');
      return;
    }
    const cust = customers.find((c) => c.id === id);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phoneNumber || '');
    }
  };

  // Add Product Row
  const handleAddRow = () => {
    setProducts((prev) => [
      ...prev,
      { id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, productName: '', quantity: '1', unitPrice: '' },
    ]);
  };

  // Remove Product Row (must keep at least 1)
  const handleRemoveRow = (id: string) => {
    if (products.length <= 1) {
      // Clear the single row instead of removing
      setProducts([{ id: 'row-1', productName: '', quantity: '1', unitPrice: '' }]);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Update Product Row Field
  const handleUpdateField = (id: string, field: keyof ProductRow, val: string) => {
    setErrorMsg(null);
    setProducts((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: val } : row))
    );
  };

  // Calculate live line subtotals & grand total
  // The Price field represents the TOTAL price for the entire quantity entered, NOT price per unit.
  // Do NOT multiply Quantity × Price. Subtotal for row = Price entered by the user.
  const lineSubtotals = products.map((row) => {
    const price = parseFloat(row.unitPrice);
    return !isNaN(price) && price >= 0 ? Math.round(price * 100) / 100 : 0;
  });

  const totalDebt = lineSubtotals.reduce((acc, sub) => acc + sub, 0);

  // Selected customer current balance
  const activeCustomerBalance = selectedCustomerId
    ? getCustomerBalance(selectedCustomerId)
    : 0;

  // Handle Save
  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate Customer Name
    const finalName = customerName.trim();
    if (!finalName) {
      setErrorMsg(t.newDebt.fillRequiredError);
      return;
    }

    // Validate Products: must have at least one valid product row with valid quantity and price
    const validItems: Array<{ productName: string; quantity: string | number; unitPrice: number }> = [];
    for (const row of products) {
      const name = row.productName.trim();
      const qtyStr = row.quantity.trim();
      const price = parseFloat(row.unitPrice);

      if (name && qtyStr && !isNaN(price) && price >= 0) {
        validItems.push({
          productName: name,
          quantity: qtyStr,
          unitPrice: Math.round(price * 100) / 100,
        });
      }
    }

    if (validItems.length === 0) {
      setErrorMsg(t.newDebt.fillRequiredError);
      return;
    }

    // Save Debt Transaction
    const savedTx = recordDebtTransaction({
      customerId: selectedCustomerId || undefined,
      customerName: finalName,
      customerPhone: customerPhone.trim() || undefined,
      items: validItems,
      notes: notes.trim() || undefined,
    });

    setSuccessMsg(t.newDebt.saveSuccess);

    // Reset Form
    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setProducts([{ id: 'row-1', productName: '', quantity: '1', unitPrice: '' }]);

    setTimeout(() => {
      setSuccessMsg(null);
      if (onDebtSaved) {
        onDebtSaved(savedTx.customerId);
      }
    }, 2000);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Alert */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#102A43]">
          {t.newDebt.title}
        </h1>
        <p className="text-[11px] text-slate-500">{t.newDebt.subtitle}</p>
      </div>

      <form onSubmit={handleSaveDebt} className="space-y-4">
        {/* Section 1: Customer Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <User className="w-4 h-4 text-[#FF8A00]" />
              <span>{t.newDebt.customerSection}</span>
            </h2>
            {selectedCustomerId && (
              <span className="text-xs font-semibold text-slate-500">
                Haraagii hore: <strong className="text-[#FF8A00] font-mono">${activeCustomerBalance.toFixed(2)}</strong>
              </span>
            )}
          </div>

          {/* Quick Existing Customer Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t.newDebt.selectExisting}
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleSelectExistingCustomer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
            >
              <option value="">{t.newDebt.selectPlaceholder}</option>
              {customers
                .filter((c) => c.isActive)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phoneNumber ? `(${c.phoneNumber})` : ''} - Haraaga: ${getCustomerBalance(c.id).toFixed(2)}
                  </option>
                ))}
            </select>
          </div>

          {/* Customer Name & Phone Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.newDebt.customerNameReq}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmed / Axmed Daahir"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (selectedCustomerId) setSelectedCustomerId('');
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.newDebt.customerPhone}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="e.g. 0612345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Products Taken On Credit (Flexible Multiple Product Rows) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FF8A00]" />
                <span>{t.newDebt.productsSection}</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.newDebt.productNote}</p>
            </div>

            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#FF8A00] bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newDebt.addProductRow}</span>
            </button>
          </div>

          {/* Desktop Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-[11px] font-semibold text-slate-400 px-2 pb-1">
            <div className="col-span-5">{t.newDebt.productName} *</div>
            <div className="col-span-2 text-right">{t.newDebt.quantity} *</div>
            <div className="col-span-2 text-right">{t.newDebt.unitPrice} *</div>
            <div className="col-span-2 text-right">{t.newDebt.subtotal}</div>
            <div className="col-span-1 text-center">Ficil</div>
          </div>

          {/* Dynamic Product Rows */}
          <div className="space-y-3">
            {products.map((row, idx) => {
              const subtotal = lineSubtotals[idx] || 0;
              return (
                <div
                  key={row.id}
                  className="bg-slate-50/70 p-3 sm:p-2 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center"
                >
                  {/* Product Name (Free Text) */}
                  <div className="sm:col-span-5">
                    <label className="block sm:hidden text-[10px] font-semibold text-slate-500 mb-0.5">
                      {t.newDebt.productName}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.newDebt.productNamePlaceholder}
                      value={row.productName}
                      onChange={(e) => handleUpdateField(row.id, 'productName', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                    />
                  </div>

                  {/* Quantity (Number or Name/Unit: e.g. "2", "2 kartoon", "1 kiilo", "5 xabbo", "badh") */}
                  <div className="sm:col-span-2">
                    <label className="block sm:hidden text-[10px] font-semibold text-slate-500 mb-0.5">
                      {t.newDebt.quantity}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2 ama 1 kartoon"
                      value={row.quantity}
                      onChange={(e) => handleUpdateField(row.id, 'quantity', e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                    />
                  </div>

                  {/* Price (USD) (Manual Number) */}
                  <div className="sm:col-span-2">
                    <label className="block sm:hidden text-[10px] font-semibold text-slate-500 mb-0.5">
                      {t.newDebt.unitPrice}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        placeholder="0.00"
                        value={row.unitPrice}
                        onChange={(e) => handleUpdateField(row.id, 'unitPrice', e.target.value)}
                        className="w-full pl-6 pr-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-right font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                      />
                    </div>
                  </div>

                  {/* Row Total (Price entered by user) */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end">
                    <span className="sm:hidden text-xs font-semibold text-slate-500">Isu-geyn:</span>
                    <span className="text-xs font-mono font-extrabold text-[#102A43] tabular-nums sm:pr-1">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <div className="sm:col-span-1 flex justify-end sm:justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="text-slate-300 hover:text-rose-500 p-1.5 transition-colors"
                      title={t.newDebt.removeRow}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Another Row Button */}
          <button
            type="button"
            onClick={handleAddRow}
            className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-[#FF8A00] rounded-xl text-xs font-bold text-slate-600 hover:text-[#FF8A00] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newDebt.addProductRow}</span>
          </button>
        </div>

        {/* Section 3: Notes & Grand Total Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.newDebt.notes}
            </label>
            <textarea
              rows={2}
              placeholder={t.newDebt.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
            />
          </div>

          {/* Grand Total Calculation Strip */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 font-bold block">{t.newDebt.totalDebtAmount}</span>
              <span className="text-[11px] text-slate-400">
                {products.filter((p) => p.productName.trim()).length} nooc oo alaab ah
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FF8A00] font-mono tabular-nums">
                ${totalDebt.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Prominent SAVE DEBT Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#FF8A00] hover:bg-[#E67A00] active:scale-[0.99] text-white text-sm font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t.newDebt.saveDebtButton}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
