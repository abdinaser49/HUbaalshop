import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import {
  Search,
  UserPlus,
  Phone,
  Calendar,
  CreditCard,
  PlusCircle,
  RotateCcw,
  Printer,
  ChevronRight,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
} from 'lucide-react';

interface CustomersViewProps {
  initialCustomerId?: string | null;
  onOpenNewDebtForCustomer: (customer: Customer) => void;
  onOpenPaymentForCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  initialCustomerId,
  onOpenNewDebtForCustomer,
  onOpenPaymentForCustomer,
}) => {
  const {
    t,
    customers,
    addCustomer,
    updateCustomer,
    getCustomerBalance,
    getCustomerTotalDebt,
    getCustomerTotalPaid,
    getCustomerDebtTransactions,
    getCustomerPayments,
    getCustomerLedger,
    reverseTransaction,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    initialCustomerId || (customers[0]?.id ?? null)
  );
  const [viewMode, setViewMode] = useState<'list' | 'detail'>(
    initialCustomerId ? 'detail' : 'list'
  );

  const [profileTab, setProfileTab] = useState<'debts' | 'payments' | 'ledger'>('debts');

  // Add/Edit Customer Modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    notes: '',
  });

  // Reversal Modal
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [reversalTarget, setReversalTarget] = useState<{ type: 'debt' | 'payment'; id: string } | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filter Customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.isActive &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phoneNumber.includes(searchQuery))
  );

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || filteredCustomers[0];
  const activeBalance = activeCustomer ? getCustomerBalance(activeCustomer.id) : 0;
  const activeTotalDebt = activeCustomer ? getCustomerTotalDebt(activeCustomer.id) : 0;
  const activeTotalPaid = activeCustomer ? getCustomerTotalPaid(activeCustomer.id) : 0;
  const activeDebtTransactions = activeCustomer ? getCustomerDebtTransactions(activeCustomer.id) : [];
  const activePayments = activeCustomer ? getCustomerPayments(activeCustomer.id) : [];
  const activeLedger = activeCustomer ? getCustomerLedger(activeCustomer.id) : [];

  // Handlers
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setCustomerForm({ name: '', phoneNumber: '', address: '', notes: '' });
    setShowCustomerModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      phoneNumber: c.phoneNumber,
      address: c.address || '',
      notes: c.notes || '',
    });
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: customerForm.name.trim(),
        phoneNumber: customerForm.phoneNumber.trim(),
        address: customerForm.address.trim(),
        notes: customerForm.notes.trim(),
      });
      showToast('Xogta macmiilka waa la cusboonaysiiyey.');
    } else {
      const created = addCustomer({
        name: customerForm.name.trim(),
        phoneNumber: customerForm.phoneNumber.trim(),
        address: customerForm.address.trim(),
        notes: customerForm.notes.trim(),
        openingBalance: 0,
        isActive: true,
      });
      setSelectedCustomerId(created.id);
      showToast('Macmiilka cusub si guul leh ayaa loo diiwaangeliyey.');
    }

    setShowCustomerModal(false);
  };

  const handleExecuteReversal = () => {
    if (!reversalTarget || !reversalReason.trim()) return;
    reverseTransaction(reversalTarget.type, reversalTarget.id, reversalReason);
    setShowReversalModal(false);
    setReversalTarget(null);
    setReversalReason('');
    showToast('Dhaqdhaqaaqa si guul leh ayaa loo celiyey (Reversed).');
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-[#102A43] text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#FF8A00]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Mobile Mode Switcher */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {viewMode === 'detail' && activeCustomer ? (
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[#102A43] font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF8A00]" />
              <span>Liiska Macaamiisha</span>
            </button>
          ) : (
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#102A43]">
                {t.customers.title}
              </h1>
              <p className="text-[11px] text-slate-500">{t.customers.subtitle}</p>
            </div>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#102A43] hover:bg-[#1E3A5F] rounded-xl shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4 text-[#FF8A00]" />
            <span>{t.customers.addNewCustomer}</span>
          </button>
        </div>

        {/* Mobile Segmented Switcher */}
        {activeCustomer && (
          <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('list')}
              className={`py-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#102A43] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Liiska ({filteredCustomers.length})
            </button>
            <button
              onClick={() => setViewMode('detail')}
              className={`py-1.5 rounded-lg transition-all truncate px-2 ${
                viewMode === 'detail'
                  ? 'bg-white text-[#102A43] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {activeCustomer.name}
            </button>
          </div>
        )}
      </div>

      {/* View 1: Customer List */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.customers.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]"
            />
          </div>

          {/* Customer Cards List */}
          <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto pr-1">
            {filteredCustomers.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">{t.customers.noCustomers}</p>
            ) : (
              filteredCustomers.map((cust) => {
                const bal = getCustomerBalance(cust.id);
                const isSelected = activeCustomer?.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomerId(cust.id);
                      setViewMode('detail');
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-50 border border-slate-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xs font-bold text-[#102A43] truncate">{cust.name}</h2>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{cust.phoneNumber || 'Taleefan la\'aan'}</span>
                          <span>·</span>
                          <span>{new Date(cust.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <div className="text-right">
                          <span
                            className={`text-xs font-extrabold font-mono tabular-nums block ${
                              bal > 0 ? 'text-[#FF8A00]' : 'text-emerald-600'
                            }`}
                          >
                            ${bal.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {bal > 0 ? 'Haraaga' : 'Cleared'}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* View 2: Active Customer Profile & Itemized Debt History */}
      {viewMode === 'detail' && (
        <div className="space-y-4">
          {activeCustomer ? (
            <>
              {/* Customer Profile Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#102A43]">{activeCustomer.name}</h2>
                      <button
                        onClick={() => handleOpenEdit(activeCustomer)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title={t.customers.editCustomer}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {activeCustomer.phoneNumber || 'Taleefan la\'aan'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {t.customerProfile.registeredOn} {new Date(activeCustomer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions for this Customer */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenNewDebtForCustomer(activeCustomer)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF8A00] hover:bg-[#E67A00] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{t.customerProfile.addDebtForCust}</span>
                    </button>
                    <button
                      onClick={() => onOpenPaymentForCustomer(activeCustomer)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#102A43] hover:bg-[#1E3A5F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.customerProfile.recordPaymentForCust}</span>
                    </button>
                    <button
                      onClick={handlePrintStatement}
                      className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                      title={t.customerProfile.printStatement}
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3 Metric Badges */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {t.customerProfile.totalDebt}
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 font-mono tabular-nums mt-0.5 block">
                      ${activeTotalDebt.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                    <span className="text-[11px] text-emerald-800 font-medium block">
                      {t.customerProfile.totalPaid}
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700 font-mono tabular-nums mt-0.5 block">
                      ${activeTotalPaid.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-100">
                    <span className="text-[11px] text-orange-900 font-medium block">
                      {t.customerProfile.currentBalance}
                    </span>
                    <span className="text-base font-extrabold text-[#FF8A00] font-mono tabular-nums mt-0.5 block">
                      ${activeBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Segmented Tabs: Debts History, Payments History, Full Ledger */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <button
                    onClick={() => setProfileTab('debts')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                      profileTab === 'debts'
                        ? 'bg-[#102A43] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.customerProfile.debtHistory} ({activeDebtTransactions.length})
                  </button>
                  <button
                    onClick={() => setProfileTab('payments')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                      profileTab === 'payments'
                        ? 'bg-[#102A43] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.customerProfile.paymentHistory} ({activePayments.length})
                  </button>
                  <button
                    onClick={() => setProfileTab('ledger')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                      profileTab === 'ledger'
                        ? 'bg-[#102A43] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.customerProfile.fullLedger} ({activeLedger.length})
                  </button>
                </div>

                {/* Tab 1: Itemized Debt Transactions */}
                {profileTab === 'debts' && (
                  <div className="space-y-3">
                    {activeDebtTransactions.length === 0 ? (
                      <p className="text-xs text-slate-400 py-10 text-center">{t.customerProfile.noDebts}</p>
                    ) : (
                      activeDebtTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60">
                            <div>
                              <span className="font-mono font-bold text-[#102A43]">{tx.transactionNumber}</span>
                              <span className="text-[11px] text-slate-400 ml-2">
                                {new Date(tx.createdAt).toLocaleDateString()} · By {tx.userName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-[#FF8A00] font-mono tabular-nums">
                                ${tx.totalAmount.toFixed(2)}
                              </span>
                              <button
                                onClick={() => {
                                  setReversalTarget({ type: 'debt', id: tx.id });
                                  setShowReversalModal(true);
                                }}
                                className="text-[10px] text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded transition-colors"
                              >
                                Celi
                              </button>
                            </div>
                          </div>

                          {/* Itemized Products Sub-Table */}
                          <div className="space-y-1 text-xs">
                            {tx.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-slate-700">
                                <span>
                                  • <strong className="text-slate-800">{item.productName}</strong>
                                  <span className="text-slate-500 text-[11px] ml-1">
                                    (Tirada: {item.quantity})
                                  </span>
                                </span>
                                <span className="font-mono tabular-nums font-semibold text-slate-800">
                                  ${item.subtotal.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {tx.notes && (
                            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/50">
                              Note: {tx.notes}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 2: Payments History */}
                {profileTab === 'payments' && (
                  <div className="space-y-3">
                    {activePayments.length === 0 ? (
                      <p className="text-xs text-slate-400 py-10 text-center">{t.customerProfile.noPayments}</p>
                    ) : (
                      activePayments.map((p) => (
                        <div
                          key={p.id}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-[#102A43]">{p.paymentNumber}</span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              {p.paymentDate} · {p.paymentMethod.toUpperCase()}
                            </span>
                            {p.referenceNumber && (
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                Ref: {p.referenceNumber}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-extrabold text-sm text-emerald-600 tabular-nums">
                              -${p.amount.toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                setReversalTarget({ type: 'payment', id: p.id });
                                setShowReversalModal(true);
                              }}
                              className="text-[10px] text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded transition-colors"
                            >
                              Celi
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 3: Full Ledger Statement */}
                {profileTab === 'ledger' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-[11px]">
                          <th className="pb-2 font-medium">Date</th>
                          <th className="pb-2 font-medium">Description</th>
                          <th className="pb-2 font-medium text-right text-[#FF8A00]">Charge (+)</th>
                          <th className="pb-2 font-medium text-right text-emerald-600">Paid (-)</th>
                          <th className="pb-2 font-medium text-right text-[#102A43]">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeLedger.map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50">
                            <td className="py-2.5 text-slate-500 whitespace-nowrap text-[11px]">
                              {new Date(e.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 text-slate-800 font-medium pr-2">
                              {e.description}
                            </td>
                            <td className="py-2.5 text-right font-mono font-semibold text-[#FF8A00] tabular-nums">
                              {e.chargeAmount > 0 ? `+$${e.chargeAmount.toFixed(2)}` : '—'}
                            </td>
                            <td className="py-2.5 text-right font-mono font-semibold text-emerald-600 tabular-nums">
                              {e.paymentAmount > 0 ? `-$${e.paymentAmount.toFixed(2)}` : '—'}
                            </td>
                            <td className="py-2.5 text-right font-mono font-extrabold text-[#102A43] tabular-nums">
                              ${e.runningBalance.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Dooro macmiil si aad u aragto xisaabtiisa.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add or Edit Customer */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#102A43]">
                {editingCustomer ? t.customers.editCustomer : t.customers.addNewCustomer}
              </h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Magaca Macmiilka *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Axmed Daahir"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Taleefanka Macmiilka
                </label>
                <input
                  type="tel"
                  placeholder="061XXXXXXX"
                  value={customerForm.phoneNumber}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, phoneNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cinwaanka (Address)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hodan, Taleex"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faallo / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Xog dheeraad ah..."
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#FF8A00] hover:bg-[#E67A00] rounded-xl shadow-xs"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reversal Confirmation */}
      {showReversalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-sm font-bold text-[#102A43]">Celi Dhaqdhaqaaq (Reversal)</h3>
              </div>
              <button
                onClick={() => setShowReversalModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600">
                Dhaqdhaqaaqa lama tirtiri doono, balse waxaa lagu dari doonaa qoraal celineed sugan.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sababta Celinta *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Geli sababta loo celinayo..."
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReversalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReversal}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  Xaqiiji Celinta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
