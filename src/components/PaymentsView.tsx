import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, Payment } from '../types';
import {
  CreditCard,
  Search,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Printer,
  X,
  FileText,
} from 'lucide-react';

interface PaymentsViewProps {
  initialCustomerId?: string | null;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ initialCustomerId }) => {
  const {
    t,
    currentShop,
    customers,
    payments,
    recordPayment,
    getCustomerBalance,
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || '');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<Payment | null>(null);

  // Active customer & debt calculation
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const currentDebt = selectedCustomerId ? getCustomerBalance(selectedCustomerId) : 0;
  const payAmountNum = parseFloat(amount) || 0;
  const balanceAfter = Math.max(0, currentDebt - payAmountNum);

  // Handle Submit Payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedCustomerId) {
      setErrorMsg(t.payments.selectCustomerError);
      return;
    }

    if (payAmountNum <= 0) {
      setErrorMsg('Fadlan geli cadad lacageed oo sax ah!');
      return;
    }

    if (currentDebt <= 0) {
      setErrorMsg('Macmiilkaan deyn laguma laha!');
      return;
    }

    if (payAmountNum > currentDebt) {
      setErrorMsg(t.payments.cannotExceedDebt);
      return;
    }

    const newPayment = recordPayment({
      customerId: selectedCustomerId,
      amount: payAmountNum,
      paymentDate,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setSuccessReceipt(newPayment);

    // Reset Form
    setAmount('');
    setReferenceNumber('');
    setNotes('');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#102A43]">
          {t.payments.title}
        </h1>
        <p className="text-[11px] text-slate-500">{t.payments.subtitle}</p>
      </div>

      {/* Main Mobile Stack: Payment Form + Recent Payments */}
      <div className="space-y-4">
        {/* Payment Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitPayment} className="space-y-4">
            {/* Customer Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.payments.selectCustomer}
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
              >
                <option value="">-- Dooro Macmiilka --</option>
                {customers
                  .filter((c) => c.isActive)
                  .map((c) => {
                    const b = getCustomerBalance(c.id);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phoneNumber || 'No phone'}) - Deynta: ${b.toFixed(2)}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Debt Balance Status Pill */}
            {selectedCustomer && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 block">{t.payments.currentDebtBefore}</span>
                  <span className="text-base font-extrabold text-[#FF8A00] font-mono tabular-nums">
                    ${currentDebt.toFixed(2)}
                  </span>
                </div>
                {payAmountNum > 0 && (
                  <div className="text-right">
                    <span className="text-slate-600 block">{t.payments.balanceAfterPayment}</span>
                    <span className="text-base font-extrabold text-[#102A43] font-mono tabular-nums">
                      ${balanceAfter.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Amount & Quick Full-Pay Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  {t.payments.amountToPay}
                </label>
                {currentDebt > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(currentDebt.toString())}
                    className="text-[11px] font-bold text-[#FF8A00] hover:underline"
                  >
                    Bixi Dhammaan (${currentDebt.toFixed(2)})
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={currentDebt > 0 ? currentDebt : undefined}
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-base font-mono font-extrabold text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                />
              </div>
            </div>

            {/* Payment Date & Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.payments.paymentDate}
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.payments.paymentMethod}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
                >
                  <option value="mobile_money">{t.payments.mobileMoney}</option>
                  <option value="cash">{t.payments.cash}</option>
                  <option value="bank_transfer">{t.payments.bankTransfer}</option>
                  <option value="other">{t.payments.other}</option>
                </select>
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.payments.refNumber}
              </label>
              <input
                type="text"
                placeholder={t.payments.refPlaceholder}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
              />
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.payments.notes}
              </label>
              <input
                type="text"
                placeholder="e.g. Qeyb bixin lacag caddaan ah..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedCustomerId || currentDebt <= 0}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                selectedCustomerId && currentDebt > 0
                  ? 'bg-[#102A43] hover:bg-[#1E3A5F] text-white active:scale-99'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#FF8A00]" />
              <span>{t.payments.submitPayment}</span>
            </button>
          </form>
        </div>

        {/* Recent Payments Feed Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              Diiwaanka Lacag Bixinta (Payment Feed)
            </h3>
            <span className="text-xs text-slate-400">{payments.length} bixin</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">Weli wax lacag ah lama bixin.</p>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#102A43]">{p.customerName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {p.paymentDate} · {p.paymentMethod.toUpperCase()}
                      {p.referenceNumber ? ` · ${p.referenceNumber}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-xs text-emerald-700 tabular-nums block">
                      ${p.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">{p.paymentNumber}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold">{t.payments.paymentSuccess}</span>
              </div>
              <button
                onClick={() => setSuccessReceipt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Thermal Receipt Card */}
            <div
              id="printable-receipt"
              className="my-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl font-mono text-xs text-slate-800 space-y-3"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-300 space-y-0.5">
                <h2 className="font-extrabold text-sm text-[#102A43] tracking-wide">
                  {currentShop.name.toUpperCase()}
                </h2>
                <p className="text-[10px] text-slate-600">{currentShop.address}</p>
                <p className="text-[10px] text-slate-600">Tel: {currentShop.phoneNumber}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  RASIIDKA LACAG BIXINTA / PAYMENT RECEIPT
                </p>
              </div>

              <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt No:</span>
                  <span className="font-bold">{successReceipt.paymentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{successReceipt.paymentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-[#102A43]">{successReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span>{successReceipt.paymentMethod.toUpperCase()}</span>
                </div>
                {successReceipt.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ref / TxID:</span>
                    <span>{successReceipt.referenceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Recorded By:</span>
                  <span>{successReceipt.userName}</span>
                </div>
              </div>

              {/* Amount Paid & Remaining Balance */}
              <div className="space-y-1.5 text-[11px] pt-1">
                <div className="flex justify-between font-bold text-sm text-emerald-700">
                  <span>LACAGTA LA BIXIYEY:</span>
                  <span className="tabular-nums">${successReceipt.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#FF8A00]">
                  <span>HARAAGA DEYNTA HADDA:</span>
                  <span className="tabular-nums">
                    ${getCustomerBalance(successReceipt.customerId).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-300">
                <p>Mahadsanid! Waad ku mahadsan tahay lacag bixintaada.</p>
                <p className="text-[9px]">HUBAAL SHOP Customer Debt System</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSuccessReceipt(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t.common.close}
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#102A43] hover:bg-[#1E3A5F] rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#FF8A00]" />
                <span>Daabac / Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
