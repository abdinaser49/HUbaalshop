import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileBarChart2,
  Printer,
  Calendar,
  Scale,
  DollarSign,
  TrendingUp,
  Search,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    t,
    currentShop,
    customers,
    debtTransactions,
    payments,
    getCustomerBalance,
    getCustomerTotalDebt,
    getCustomerTotalPaid,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'today' | 'yesterday' | '7days' | 'month' | 'all'>('month');
  const [reportTab, setReportTab] = useState<'debtors' | 'new_debts' | 'collections'>('debtors');
  const [searchFilter, setSearchFilter] = useState('');

  // Time-filtered transactions
  const filteredNewDebts = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 3600 * 1000;
    const startOf7Days = startOfToday - 7 * 24 * 3600 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return debtTransactions.filter((d) => {
      if (d.isReversed) return false;
      const t = new Date(d.createdAt).getTime();
      if (timeRange === 'today') return t >= startOfToday;
      if (timeRange === 'yesterday') return t >= startOfYesterday && t < startOfToday;
      if (timeRange === '7days') return t >= startOf7Days;
      if (timeRange === 'month') return t >= startOfMonth;
      return true;
    });
  }, [debtTransactions, timeRange]);

  const filteredPayments = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 3600 * 1000;
    const startOf7Days = startOfToday - 7 * 24 * 3600 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return payments.filter((p) => {
      if (p.isReversed) return false;
      const t = new Date(p.createdAt).getTime();
      if (timeRange === 'today') return t >= startOfToday;
      if (timeRange === 'yesterday') return t >= startOfYesterday && t < startOfToday;
      if (timeRange === '7days') return t >= startOf7Days;
      if (timeRange === 'month') return t >= startOfMonth;
      return true;
    });
  }, [payments, timeRange]);

  // Overall Outstanding Debt
  const totalOutstanding = useMemo(() => {
    return customers.reduce((acc, c) => acc + getCustomerBalance(c.id), 0);
  }, [customers, getCustomerBalance]);

  const totalPeriodNewDebt = filteredNewDebts.reduce((acc, d) => acc + d.totalAmount, 0);
  const totalPeriodPayments = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  // Customer Debt Balances
  const customerDebtList = useMemo(() => {
    return customers
      .map((c) => ({
        ...c,
        totalDebt: getCustomerTotalDebt(c.id),
        totalPaid: getCustomerTotalPaid(c.id),
        balance: getCustomerBalance(c.id),
      }))
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          c.phoneNumber.includes(searchFilter);
        return matchesSearch;
      })
      .sort((a, b) => b.balance - a.balance);
  }, [customers, getCustomerTotalDebt, getCustomerTotalPaid, getCustomerBalance, searchFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header and Print PDF */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#102A43]">
              {t.reports.title}
            </h1>
            <p className="text-[11px] text-slate-500">
              {currentShop.name} · {t.reports.subtitle}
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#FF8A00] hover:bg-[#E67A00] rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>{t.reports.printReport}</span>
          </button>
        </div>

        {/* Timeframe Filter Tabs (Mobile Scroll) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5 shrink-0" />
          <button
            onClick={() => setTimeRange('today')}
            className={`px-2 py-1 font-semibold rounded-lg shrink-0 ${
              timeRange === 'today' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            {t.reports.filterToday}
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-2 py-1 font-semibold rounded-lg shrink-0 ${
              timeRange === '7days' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            {t.reports.filter7Days}
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-2 py-1 font-semibold rounded-lg shrink-0 ${
              timeRange === 'month' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            {t.reports.filterMonth}
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-2 py-1 font-semibold rounded-lg shrink-0 ${
              timeRange === 'all' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            {t.reports.filterAll}
          </button>
        </div>
      </div>

      {/* 3 Metric Cards for Mobile */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="col-span-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">{t.reports.totalOutstanding}</span>
            <span className="text-xl font-extrabold text-[#FF8A00] font-mono tabular-nums block mt-0.5">
              ${totalOutstanding.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">Guud ahaan dukaanka</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF8A00] flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{t.reports.totalNewDebtsPeriod}</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-base font-extrabold text-[#102A43] font-mono tabular-nums block mt-1">
            ${totalPeriodNewDebt.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{filteredNewDebts.length} cusub</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{t.reports.totalCollectedPeriod}</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-base font-extrabold text-emerald-700 font-mono tabular-nums block mt-1">
            ${totalPeriodPayments.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{filteredPayments.length} bixin</span>
        </div>
      </div>

      {/* Report Segment Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        <button
          onClick={() => setReportTab('debtors')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            reportTab === 'debtors'
              ? 'bg-[#102A43] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t.reports.debtAgingReport} ({customerDebtList.filter((c) => c.balance > 0).length})
        </button>
        <button
          onClick={() => setReportTab('new_debts')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            reportTab === 'new_debts'
              ? 'bg-[#102A43] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Diiwaanka Deymaha ({filteredNewDebts.length})
        </button>
        <button
          onClick={() => setReportTab('collections')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            reportTab === 'collections'
              ? 'bg-[#102A43] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t.reports.paymentsReport} ({filteredPayments.length})
        </button>
      </div>

      {/* Tab 1: Customer Debt Balances & Aging Statement */}
      {reportTab === 'debtors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              {t.reports.debtAgingReport}
            </h3>
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Raadi macmiil..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[11px]">
                  <th className="py-3 px-4 font-semibold">{t.reports.customerNameCol}</th>
                  <th className="py-3 px-4 font-semibold">{t.reports.phoneCol}</th>
                  <th className="py-3 px-4 font-semibold text-right">{t.reports.totalDebtCol}</th>
                  <th className="py-3 px-4 font-semibold text-right">{t.reports.totalPaidCol}</th>
                  <th className="py-3 px-4 font-semibold text-right">{t.reports.balanceCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerDebtList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-[#102A43]">{c.name}</td>
                    <td className="py-3 px-4 text-slate-600">{c.phoneNumber || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                      ${c.totalDebt.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 tabular-nums">
                      ${c.totalPaid.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-[#FF8A00] tabular-nums">
                      ${c.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: New Debts Log */}
      {reportTab === 'new_debts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[11px]">
                <th className="py-3 px-4 font-semibold">Tx Number</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Products</th>
                <th className="py-3 px-4 font-semibold text-right">Total Debt ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNewDebts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-[#102A43]">{d.transactionNumber}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{d.customerName}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {d.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#FF8A00] tabular-nums">
                    ${d.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Payment Collections Log */}
      {reportTab === 'collections' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[11px]">
                <th className="py-3 px-4 font-semibold">Receipt No</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold">Ref / TxID</th>
                <th className="py-3 px-4 font-semibold text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-[#102A43]">{p.paymentNumber}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{p.paymentDate}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{p.customerName}</td>
                  <td className="py-3 px-4 text-slate-600 uppercase">{p.paymentMethod}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{p.referenceNumber || '—'}</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700 tabular-nums">
                    ${p.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
