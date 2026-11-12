import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Scale,
  TrendingUp,
  DollarSign,
  PlusCircle,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewDebt: () => void;
  onOpenPayment: () => void;
  onSelectCustomer: (customerId: string) => void;
  onViewAllCustomers: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewDebt,
  onOpenPayment,
  onSelectCustomer,
  onViewAllCustomers,
}) => {
  const {
    t,
    currentShop,
    customers,
    debtTransactions,
    payments,
    getCustomerBalance,
  } = useApp();

  // 1. Total Outstanding Debt (Sum of all customer balances)
  const totalOutstandingDebt = useMemo(() => {
    return customers.reduce((acc, c) => acc + getCustomerBalance(c.id), 0);
  }, [customers, getCustomerBalance]);

  // 2. Today's New Debts
  const todayNewDebts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return debtTransactions
      .filter((d) => !d.isReversed && d.createdAt.startsWith(todayStr))
      .reduce((acc, d) => acc + d.totalAmount, 0);
  }, [debtTransactions]);

  // 3. Total Payments Received
  const totalPaymentsReceived = useMemo(() => {
    return payments
      .filter((p) => !p.isReversed)
      .reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  // 4. Customers with Outstanding Balances
  const debtors = useMemo(() => {
    return customers
      .map((c) => ({
        ...c,
        balance: getCustomerBalance(c.id),
      }))
      .filter((c) => c.balance > 0)
      .sort((a, b) => b.balance - a.balance);
  }, [customers, getCustomerBalance]);

  // 5. Recent Transactions (Debts + Payments merged & sorted)
  const recentTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'debt' | 'payment';
      title: string;
      customerName: string;
      customerId: string;
      amount: number;
      date: string;
      txNumber: string;
      userName: string;
    }> = [];

    debtTransactions.slice(0, 8).forEach((d) => {
      list.push({
        id: d.id,
        type: 'debt',
        title: d.items.map((i) => i.productName).join(', '),
        customerName: d.customerName,
        customerId: d.customerId,
        amount: d.totalAmount,
        date: d.createdAt,
        txNumber: d.transactionNumber,
        userName: d.userName,
      });
    });

    payments.slice(0, 8).forEach((p) => {
      list.push({
        id: p.id,
        type: 'payment',
        title: `Lacag Bixin (${p.paymentMethod.toUpperCase()})`,
        customerName: p.customerName,
        customerId: p.customerId,
        amount: p.amount,
        date: p.createdAt,
        txNumber: p.paymentNumber,
        userName: p.userName,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [debtTransactions, payments]);

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Store Scope */}
      <div className="space-y-2.5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#102A43]">
            {t.dashboard.title}
          </h1>
          <p className="text-[11px] text-slate-500">
            {currentShop.name} · {currentShop.code} · {t.dashboard.subtitle}
          </p>
        </div>

        {/* Quick Action Mobile Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenNewDebt}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#FF8A00] hover:bg-[#E67A00] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.dashboard.quickNewDebt}</span>
          </button>
          <button
            onClick={onOpenPayment}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#102A43] hover:bg-[#1E3A5F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>{t.dashboard.quickPayment}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (2x2 Cards for Mobile) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Outstanding Debt */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{t.dashboard.totalOutstandingDebt}</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF8A00] flex items-center justify-center shrink-0">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-extrabold text-[#FF8A00] tabular-nums font-mono block">
              ${totalOutstandingDebt.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {debtors.length} {t.dashboard.activeDebtors}
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{t.dashboard.totalCustomers}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-extrabold text-[#102A43] tabular-nums font-mono block">
              {customers.length}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {debtors.length > 0 ? `${debtors.length} deyn qaba` : 'Deyn ma qabaan'}
          </p>
        </div>

        {/* Today's New Debts */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{t.dashboard.todayNewDebts}</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-extrabold text-amber-700 tabular-nums font-mono block">
              ${todayNewDebts.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Deyn cusub maanta</p>
        </div>

        {/* Total Payments Received */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{t.dashboard.totalPaymentsReceived}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-lg font-extrabold text-emerald-700 tabular-nums font-mono block">
              ${totalPaymentsReceived.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{payments.length} lacag bixin</p>
        </div>
      </div>

      {/* Mobile Stacked Sections */}
      <div className="space-y-4">
        {/* Customers with Outstanding Debt */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#102A43]">{t.dashboard.activeDebtors}</h2>
              <p className="text-[11px] text-slate-400">Guji macmiilka si aad u aragto xisaab-xirka</p>
            </div>
            <button
              onClick={onViewAllCustomers}
              className="text-xs font-semibold text-[#FF8A00] hover:underline"
            >
              {t.dashboard.viewAllCustomers}
            </button>
          </div>

          {debtors.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center">{t.dashboard.allCleared}</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1">
              {debtors.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => onSelectCustomer(cust.id)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div>
                    <h3 className="text-xs font-bold text-[#102A43]">{cust.name}</h3>
                    <p className="text-[11px] text-slate-500">{cust.phoneNumber || 'Taleefan la\'aan'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#FF8A00] font-mono tabular-nums block">
                        ${cust.balance.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">Haraaga Deynta</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Debt Activity Feed Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#102A43]">{t.dashboard.recentTransactions}</h2>
              <p className="text-[11px] text-slate-400">Deyn cusub iyo lacag bixinta dhowaan la qabtay</p>
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center">{t.dashboard.noRecentActivity}</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => onSelectCustomer(tx.customerId)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'debt'
                          ? 'bg-orange-50 text-[#FF8A00]'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {tx.type === 'debt' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#102A43] truncate">{tx.customerName}</h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        {tx.txNumber} · {tx.title}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span
                      className={`text-xs font-extrabold font-mono tabular-nums ${
                        tx.type === 'debt' ? 'text-[#FF8A00]' : 'text-emerald-600'
                      }`}
                    >
                      {tx.type === 'debt' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(tx.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
