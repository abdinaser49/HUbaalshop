import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Shield,
  Wifi,
  WifiOff,
  Globe,
  RefreshCw,
  PlusCircle,
  Settings,
  X,
  RotateCcw,
  CheckCircle2,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { ResetDataModal } from './ResetDataModal';

interface HeaderProps {
  onOpenNewDebt: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewDebt, activeTab, setActiveTab }) => {
  const {
    t,
    language,
    setLanguage,
    shops,
    currentShop,
    setCurrentShopId,
    currentUser,
    setCurrentUserId,
    profiles,
    isOfflineMode,
    setIsOfflineMode,
    syncQueue,
    syncPendingQueue,
    logoutAdmin,
    adminAccount,
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#102A43] text-white border-b border-[#1E3A5F] shadow-sm">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#102A43] text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#FF8A00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reset Data Confirmation Modal */}
      {showResetModal && (
        <ResetDataModal
          onClose={() => setShowResetModal(false)}
          onSuccess={(msg) => {
            showToast(msg);
            setShowProfileMenu(false);
          }}
        />
      )}

      <div className="w-full px-3.5 h-14 flex items-center justify-between gap-2">
        {/* Zone 1: Mobile Brand Wordmark */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FF8A00] flex items-center justify-center font-extrabold text-white text-base tracking-wider shadow-xs shrink-0">
            H
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm tracking-tight text-white block leading-tight truncate">
              HUBAAL SHOP
            </span>
            <span className="text-[10px] text-slate-300 font-medium block truncate max-w-[140px]">
              {currentShop.name}
            </span>
          </div>
        </div>

        {/* Zone 2: Mobile Actions (Offline badge, Language, Settings) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Offline/Sync Indicator */}
          {isOfflineMode && (
            <button
              onClick={() => setIsOfflineMode(false)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 text-[10px] font-semibold"
              title="Offline mode active - click to reconnect"
            >
              <WifiOff className="w-3 h-3 text-amber-300" />
              <span>Offline</span>
            </button>
          )}

          {syncQueue.length > 0 && (
            <button
              onClick={syncPendingQueue}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/20 text-[#FF8A00] border border-orange-500/40 text-[10px] font-semibold animate-pulse"
              title="Sync pending items"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{syncQueue.length}</span>
            </button>
          )}

          {/* Language Toggle SO / EN */}
          <div className="flex items-center bg-[#1E3A5F] rounded-lg p-0.5 border border-white/10 text-[10px] font-bold">
            <button
              onClick={() => setLanguage('so')}
              className={`px-1.5 py-0.5 rounded ${
                language === 'so' ? 'bg-[#FF8A00] text-white' : 'text-slate-300'
              }`}
            >
              SO
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded ${
                language === 'en' ? 'bg-[#FF8A00] text-white' : 'text-slate-300'
              }`}
            >
              EN
            </button>
          </div>

          {/* Settings Drawer Button */}
          <button
            onClick={() => setShowProfileMenu(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#1E3A5F] text-slate-200 hover:text-white border border-white/10 active:scale-95 transition-all"
            title="Dejinta Dukaanka & Dib u Dejinta Xogta"
          >
            <Settings className="w-4 h-4 text-slate-200" />
          </button>
        </div>
      </div>

      {/* Profile & Shop Settings Drawer Modal */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white text-slate-800 rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in slide-in-from-bottom-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#FF8A00]" />
                <h3 className="text-sm font-bold text-[#102A43]">Dejinta Dukaanka & Xisaabta</h3>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Active Store */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dukaanka Hadda (Shop)</label>
                <select
                  value={currentShop.id}
                  onChange={(e) => setCurrentShopId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-xs"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Role */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doorka Isticmaalaha (Role)</label>
                <select
                  value={currentUser.id}
                  onChange={(e) => setCurrentUserId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-xs"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} - {t.roles[p.role]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Luuqadda (Language)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLanguage('so')}
                    className={`py-2 rounded-xl font-bold border ${
                      language === 'so'
                        ? 'bg-[#102A43] text-white border-[#102A43]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Somali (SO)
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`py-2 rounded-xl font-bold border ${
                      language === 'en'
                        ? 'bg-[#102A43] text-white border-[#102A43]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    English (EN)
                  </button>
                </div>
              </div>

              {/* Offline mode toggle */}
              <div>
                <button
                  onClick={() => setIsOfflineMode(!isOfflineMode)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between font-semibold"
                >
                  <span>{t.offline.simulateToggle}</span>
                  <span className={isOfflineMode ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {isOfflineMode ? t.offline.offline : t.offline.online}
                  </span>
                </button>
              </div>

              {/* Super Admin Quick Link */}
              {currentUser.isSuperAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('super_admin');
                    setShowProfileMenu(false);
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-white bg-[#102A43] hover:bg-[#1E3A5F]"
                >
                  {t.nav.superAdmin}
                </button>
              )}

              {/* Admin Profile Info & Logout */}
              {adminAccount && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#102A43] text-white flex items-center justify-center font-bold text-xs">
                      <UserCheck className="w-4 h-4 text-[#FF8A00]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 text-xs truncate">
                        {adminAccount.fullName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {adminAccount.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(t.auth.logoutConfirm)) {
                        logoutAdmin();
                        setShowProfileMenu(false);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 hover:border-rose-300 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold flex items-center justify-center gap-2 transition-colors text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t.auth.logout}</span>
                  </button>
                </div>
              )}

              {/* Prominent Reset All Data Section */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>{t.reset.button}</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-1">
                  Dib ugu celi xogtii tijaabada ama tirtir dhammaan
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
