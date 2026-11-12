import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export const AdminLoginView: React.FC = () => {
  const { t, language, setLanguage, loginAdmin, adminAccount } = useApp();

  const [email, setEmail] = useState(adminAccount?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError(t.auth.errorFillAll);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginAdmin({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res.success) {
        setError(res.error || t.auth.errorInvalidCredentials);
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-8 text-slate-800 flex flex-col justify-center">
      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPasswordModal(false)}
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            setError(null);
          }}
        />
      )}

      {/* Top Brand Logo */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#FF8A00] text-white font-black text-3xl shadow-xl shadow-orange-500/25 mb-3">
          H
        </div>
        <h1 className="text-2xl font-black text-[#102A43] tracking-tight">
          HUBAAL SHOP
        </h1>
        <p className="text-xs text-[#FF8A00] font-bold uppercase tracking-wider mt-0.5">
          {adminAccount?.businessName || t.subtitle}
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        {/* Title Header with Language Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-[#102A43]">
              {t.auth.adminLoginTitle}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              {t.auth.adminLoginSubtitle}
            </p>
          </div>

          {/* Quick Language Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-[10px] font-bold shrink-0">
            <button
              type="button"
              onClick={() => setLanguage('so')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'so' ? 'bg-[#102A43] text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              SO
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                language === 'en' ? 'bg-[#102A43] text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Public Registration Locked Badge */}
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="leading-tight text-[10.5px]">
            {t.auth.registrationClosed}
          </span>
        </div>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {/* Gmail Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.gmail}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.gmailPlaceholder}
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                {t.auth.password}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#FF8A00] hover:underline font-semibold flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? t.auth.hidePassword : t.auth.showPassword}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all font-medium"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-xs font-bold text-[#FF8A00] hover:text-[#d97300] hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.auth.forgotPassword}</span>
            </button>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-black text-white bg-[#FF8A00] hover:bg-[#e67c00] active:scale-[0.98] transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 text-xs tracking-wider uppercase disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? '...' : t.auth.loginButton}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-[10px] text-slate-400">
        <p>HUBAAL SHOP &copy; 2026 &bull; Customer Debt Management System</p>
      </div>
    </div>
  );
};
