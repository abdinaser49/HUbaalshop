import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Store,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  Phone,
  MapPin,
  X,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { ResetDataModal } from './ResetDataModal';

export const SuperAdminView: React.FC = () => {
  const {
    t,
    shops,
    currentShop,
    setCurrentShopId,
    createShop,
    toggleShopActive,
    auditLogs,
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newShop, setNewShop] = useState({
    name: '',
    code: '',
    address: '',
    phoneNumber: '',
    currency: 'USD',
    allowNegativeStock: false,
    isActive: true,
    ownerName: '',
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShop.name.trim() || !newShop.code.trim()) return;

    createShop({
      ...newShop,
      code: newShop.code.toUpperCase().trim(),
    });

    setShowCreateModal(false);
    setNewShop({
      name: '',
      code: '',
      address: '',
      phoneNumber: '',
      currency: 'USD',
      allowNegativeStock: false,
      isActive: true,
      ownerName: '',
    });
    showToast('Dukaan cusub si guul leh ayaa loo furay!');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-[#102A43] text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#FF8A00]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-[#FF8A00]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#102A43]">
              {t.superAdmin.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Maamulka guud ee dhammaan laamaha iyo xarumaha dukaanka HUBAAL SHOP
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-[#102A43] hover:bg-[#1E3A5F] rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FF8A00]" />
          <span>{t.superAdmin.createShop}</span>
        </button>
      </div>

      {/* Active Scope Card */}
      <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs text-amber-800 font-medium block">
            {t.superAdmin.currentlyManaging}
          </span>
          <span className="text-base font-extrabold text-[#102A43] block mt-0.5">
            {currentShop.name} ({currentShop.code})
          </span>
          <span className="text-[11px] text-slate-500">{currentShop.address}</span>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-white/80 px-3 py-1.5 rounded-xl">
          Multi-Store RLS Active
        </span>
      </div>

      {/* All Shops Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#102A43]">{t.superAdmin.allShops}</h2>
        <div className="grid grid-cols-1 gap-3">
          {shops.map((shop) => {
            const isCurrent = shop.id === currentShop.id;
            return (
              <div
                key={shop.id}
                className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-[#FF8A00] ring-1 ring-[#FF8A00]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {shop.code}
                    </span>
                    <button
                      onClick={() => toggleShopActive(shop.id)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                        shop.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {shop.isActive ? t.superAdmin.active : t.superAdmin.inactive}
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-[#102A43] mt-2">{shop.name}</h3>
                  <div className="text-xs text-slate-500 space-y-1 mt-2">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{shop.phoneNumber}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 pt-1">Owner: {shop.ownerName}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Created {new Date(shop.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentShopId(shop.id);
                      showToast(`Dukaanka waxaa loo beddelay: ${shop.name}`);
                    }}
                    disabled={isCurrent}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-[#102A43] hover:bg-[#FF8A00] text-white'
                    }`}
                  >
                    {isCurrent ? 'Dukaanka Hadda' : t.superAdmin.switchShop}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#102A43]">{t.superAdmin.auditLogs}</h2>
          <span className="text-xs text-slate-400">{auditLogs.length} logged events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                <th className="py-2.5 font-semibold">Timestamp</th>
                <th className="py-2.5 font-semibold">User</th>
                <th className="py-2.5 font-semibold">Action</th>
                <th className="py-2.5 font-semibold">Entity</th>
                <th className="py-2.5 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No security events recorded.
                  </td>
                </tr>
              ) : (
                auditLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2 text-slate-700 font-medium">{log.userName}</td>
                    <td className="py-2">
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2 text-slate-500">{log.entityName}</td>
                    <td className="py-2 text-slate-600 truncate max-w-xs">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Reset All Data */}
      <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-rose-700">
              <RotateCcw className="w-4 h-4" />
              <h2 className="text-sm font-bold">Dib u Dejinta Guud ee Xogta (System Factory Reset)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dib ugu celi xogtii tijaabada ahayd ama tirtir dhammaan macaamiisha iyo deymaha si aad dukaanka uga bilowdo eber cusub.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Dib u Deji Xogta</span>
          </button>
        </div>
      </div>

      {/* Modal: Reset Data */}
      {showResetModal && (
        <ResetDataModal
          onClose={() => setShowResetModal(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Modal: Create Shop */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#102A43]">
                {t.superAdmin.createShop}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.superAdmin.shopName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hubaal Mart (Yaqshiid Branch)"
                  value={newShop.name}
                  onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.superAdmin.shopCode} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="HB-YAQSHIID"
                    value={newShop.code}
                    onChange={(e) => setNewShop({ ...newShop, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.superAdmin.ownerName}
                  </label>
                  <input
                    type="text"
                    placeholder="Magaca Milkiilaha"
                    value={newShop.ownerName}
                    onChange={(e) => setNewShop({ ...newShop, ownerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.superAdmin.shopAddress}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mogadishu, Somalia"
                  value={newShop.address}
                  onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.superAdmin.shopPhone}
                </label>
                <input
                  type="tel"
                  placeholder="+252 61 XXX XXXX"
                  value={newShop.phoneNumber}
                  onChange={(e) => setNewShop({ ...newShop, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#FF8A00] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
    </div>
  );
};
