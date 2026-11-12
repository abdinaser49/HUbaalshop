import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  CreditCard,
  FileBarChart2,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useApp();

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'customers', label: t.nav.customers, icon: Users },
    { id: 'new_debt', label: t.nav.newDebt, icon: PlusCircle, isPrimary: true },
    { id: 'payments', label: t.nav.payments, icon: CreditCard },
    { id: 'reports', label: t.nav.reports, icon: FileBarChart2 },
  ];

  return (
    <nav aria-label="Mobile Bottom Navigation" className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg shrink-0 z-30">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-colors relative ${
                item.isPrimary
                  ? 'text-[#FF8A00]'
                  : isActive
                  ? 'text-[#102A43]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {item.isPrimary ? (
                <div className="w-10 h-10 -mt-3.5 rounded-full bg-[#FF8A00] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transform active:scale-95 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              )}
              <span
                className={`text-[10px] font-semibold tracking-tight truncate max-w-[66px] ${
                  item.isPrimary
                    ? 'mt-1 text-[#FF8A00] font-bold'
                    : isActive
                    ? 'font-bold text-[#102A43]'
                    : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
