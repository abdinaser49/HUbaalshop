import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  RotateCcw,
  Trash2,
  Sparkles,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface ResetDataModalProps {
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({ onClose, onSuccess }) => {
  const { t, resetAllData } = useApp();
  const [resetMode, setResetMode] = useState<'demo' | 'clear'>('demo');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExecuteReset = () => {
    if (!confirmCheckbox) return;

    setIsProcessing(true);
    setTimeout(() => {
      resetAllData(resetMode);
      setIsProcessing(false);
      const msg =
        resetMode === 'demo'
          ? t.reset.successDemo
          : t.reset.successClear;
      if (onSuccess) {
        onSuccess(msg);
      }
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#102A43]">
                {t.reset.title}
              </h3>
              <p className="text-[11px] text-slate-400">HUBAAL SHOP Data Administration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-rose-800">Digtooni Muhiim ah</span>
            <p className="text-[11px] leading-relaxed text-rose-700">
              {t.reset.warning}
            </p>
          </div>
        </div>

        {/* Mode Selection Options */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Dooro Nooca Dib u Dejinta (Select Reset Mode):
          </label>

          {/* Option 1: Reset to Demo Data */}
          <div
            onClick={() => setResetMode('demo')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              resetMode === 'demo'
                ? 'bg-amber-50/50 border-[#FF8A00] ring-1 ring-[#FF8A00]'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <input
              type="radio"
              name="resetMode"
              checked={resetMode === 'demo'}
              onChange={() => setResetMode('demo')}
              className="mt-1 text-[#FF8A00] focus:ring-[#FF8A00]"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#102A43]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>{t.reset.optionDemoTitle}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                {t.reset.optionDemoDesc}
              </p>
            </div>
          </div>

          {/* Option 2: Clear All Data (Start Fresh) */}
          <div
            onClick={() => setResetMode('clear')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              resetMode === 'clear'
                ? 'bg-rose-50/50 border-rose-500 ring-1 ring-rose-500'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <input
              type="radio"
              name="resetMode"
              checked={resetMode === 'clear'}
              onChange={() => setResetMode('clear')}
              className="mt-1 text-rose-600 focus:ring-rose-500"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{t.reset.optionClearTitle}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                {t.reset.optionClearDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
            <input
              type="checkbox"
              checked={confirmCheckbox}
              onChange={(e) => setConfirmCheckbox(e.target.checked)}
              className="mt-0.5 rounded text-[#102A43] focus:ring-slate-800"
            />
            <span className="font-semibold text-slate-700">
              Waan xaqiijinayaa inaan doonayo dib u dejinta xogta dukaanka.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            disabled={!confirmCheckbox || isProcessing}
            onClick={handleExecuteReset}
            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-2 ${
              confirmCheckbox && !isProcessing
                ? 'bg-rose-600 hover:bg-rose-700 active:scale-98'
                : 'bg-slate-300 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isProcessing ? 'Fadlan sug...' : t.reset.confirmButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
