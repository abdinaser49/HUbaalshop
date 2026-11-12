/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { CustomersView } from './components/CustomersView';
import { NewDebtView } from './components/NewDebtView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { SuperAdminView } from './components/SuperAdminView';
import { AdminRegistrationView } from './components/AdminRegistrationView';
import { AdminLoginView } from './components/AdminLoginView';
import { useApp } from './context/AppContext';
import { Customer } from './types';
import { Wifi, Battery } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isInitialAdminRegistered } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCustomerIdForPayment, setSelectedCustomerIdForPayment] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenNewDebt = () => {
    setActiveTab('new_debt');
  };

  const handleOpenPayment = () => {
    setSelectedCustomerIdForPayment(null);
    setActiveTab('payments');
  };

  const handleOpenNewDebtForCustomer = (_customer: Customer) => {
    setActiveTab('new_debt');
  };

  const handleOpenPaymentForCustomer = (customer: Customer) => {
    setSelectedCustomerIdForPayment(customer.id);
    setActiveTab('payments');
  };

  const handleSelectCustomerFromDashboard = (customerId: string) => {
    setSelectedCustomerIdForPayment(customerId);
    setActiveTab('customers');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center sm:py-4 sm:px-2 selection:bg-[#FF8A00] selection:text-white">
      {/* Mobile Smartphone Frame Container */}
      <div className="w-full max-w-[430px] h-[100dvh] sm:h-[880px] sm:max-h-[94vh] bg-[#F5F7FA] text-[#172B4D] flex flex-col relative sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden">
        
        {/* Native Mobile Smartphone Status Bar */}
        <div className="bg-[#102A43] text-white px-5 pt-2 pb-1 flex items-center justify-between text-xs select-none shrink-0 border-b border-[#14324f]">
          {/* Time */}
          <span className="font-semibold tracking-tight text-[11px] font-mono w-10">
            {currentTime}
          </span>

          {/* Dynamic Island / Speaker Pill */}
          <div className="w-20 h-4 bg-slate-950/80 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
          </div>

          {/* Icons: 5G, Wi-Fi, Battery */}
          <div className="flex items-center gap-1.5 w-12 justify-end text-slate-300">
            <span className="text-[10px] font-bold tracking-tight">5G</span>
            <Wifi className="w-3 h-3 text-slate-300" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Screen Content */}
        {!isAuthenticated ? (
          <div className="flex-1 w-full overflow-y-auto flex flex-col bg-[#F5F7FA]">
            {!isInitialAdminRegistered ? (
              <AdminRegistrationView />
            ) : (
              <AdminLoginView />
            )}
          </div>
        ) : (
          <>
            {/* Compact Mobile Top App Bar */}
            <Header
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenNewDebt={handleOpenNewDebt}
            />

            {/* Main Mobile Screen View Area (Scrollable within Phone) */}
            <main className="flex-1 w-full overflow-y-auto px-3.5 pt-3 pb-6 overscroll-contain">
              {activeTab === 'dashboard' && (
                <DashboardView
                  onOpenNewDebt={handleOpenNewDebt}
                  onOpenPayment={handleOpenPayment}
                  onSelectCustomer={handleSelectCustomerFromDashboard}
                  onViewAllCustomers={() => setActiveTab('customers')}
                />
              )}
              {activeTab === 'customers' && (
                <CustomersView
                  initialCustomerId={selectedCustomerIdForPayment}
                  onOpenNewDebtForCustomer={handleOpenNewDebtForCustomer}
                  onOpenPaymentForCustomer={handleOpenPaymentForCustomer}
                />
              )}
              {activeTab === 'new_debt' && (
                <NewDebtView
                  onDebtSaved={(customerId) => {
                    setSelectedCustomerIdForPayment(customerId);
                    setActiveTab('customers');
                  }}
                />
              )}
              {activeTab === 'payments' && (
                <PaymentsView initialCustomerId={selectedCustomerIdForPayment} />
              )}
              {activeTab === 'reports' && <ReportsView />}
              {activeTab === 'super_admin' && <SuperAdminView />}
            </main>

            {/* Native Mobile Bottom Navigation Bar (5 Items) */}
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </>
        )}

        {/* Mobile Phone Home Indicator Bar */}
        <div className="bg-white/95 pb-1 pt-0.5 flex justify-center shrink-0">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
