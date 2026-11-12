import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Eye, EyeOff, X, AlertCircle, Lock } from 'lucide-react';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onSuccess }) => {
  const { t, recoverAdminPassword } = useApp();

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !phoneNumber.trim() || !newPassword || !confirmPassword) {
      setError(t.auth.errorFillAll);
      return;
    }

    if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
      setError(t.auth.errorInvalidGmail);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.auth.errorPasswordShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.auth.errorPasswordMismatch);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await recoverAdminPassword({
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        newPassword,
      });

      if (!res.success) {
        setError(res.error || t.auth.errorRecoveryMismatch);
      } else {
        onSuccess(t.auth.successPasswordReset);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Error resetting password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#FF8A00] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#102A43] leading-tight">
                {t.auth.forgotPasswordTitle}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {t.auth.forgotPasswordSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.gmail}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. magacaaga@gmail.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.phone}
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0612345678"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                {t.auth.newPassword}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#FF8A00] hover:underline font-semibold flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? t.auth.hidePassword : t.auth.showPassword}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.confirmNewPassword}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-white bg-[#FF8A00] hover:bg-[#e67c00] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? '...' : t.auth.resetPasswordButton}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
