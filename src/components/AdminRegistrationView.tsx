import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Lock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AdminRegistrationView: React.FC = () => {
  const { t, language, setLanguage, registerInitialAdmin } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessName, setBusinessName] = useState('HUBAAL SHOP');
  const [businessLocation, setBusinessLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !businessName.trim() ||
      !businessLocation.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(t.auth.errorFillAll);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@gmail.com') || cleanEmail.length < 11) {
      setError(t.auth.errorInvalidGmail);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.errorPasswordShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.errorPasswordMismatch);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerInitialAdmin({
        fullName: fullName.trim(),
        email: cleanEmail,
        phoneNumber: phoneNumber.trim(),
        businessName: businessName.trim(),
        businessLocation: businessLocation.trim(),
        password,
      });

      if (!res.success) {
        setError(res.error || 'Failed to register admin');
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating admin account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-6 text-slate-800">
      {/* Top Header Card */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FF8A00] text-white font-black text-2xl shadow-lg shadow-orange-500/20 mb-2.5">
          H
        </div>
        <h1 className="text-xl font-extrabold text-[#102A43] tracking-tight">
          HUBAAL SHOP
        </h1>
        <p className="text-xs text-[#FF8A00] font-bold uppercase tracking-wider mt-0.5">
          {t.subtitle}
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        {/* Form Title & Language Switcher */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] mb-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Admin Setup (1-Time)</span>
            </div>
            <h2 className="text-sm font-extrabold text-[#102A43] leading-snug">
              {t.auth.adminRegistrationTitle}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              {t.auth.adminRegistrationSubtitle}
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

        {/* Security Rule Notice */}
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#FF8A00] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950">Amniga Nidaamka (One-Time Setup):</span>
            <span>{t.auth.oneAdminOnly} {t.auth.registrationClosed}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.fullName}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.auth.fullNamePlaceholder}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Gmail Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.gmail}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.gmailPlaceholder}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pl-1">
              Waa inuu ahaadaa cinwaan Gmail ah (@gmail.com)
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.phone}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.auth.phonePlaceholder}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.businessName}
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={t.auth.businessNamePlaceholder}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Business Location */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t.auth.businessLocation}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={businessLocation}
                onChange={(e) => setBusinessLocation(e.target.value)}
                placeholder={t.auth.businessLocationPlaceholder}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
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
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? t.auth.hidePassword : t.auth.showPassword}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                {t.auth.confirmPassword}
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-[11px] text-[#FF8A00] hover:underline font-semibold flex items-center gap-1"
              >
                {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showConfirmPassword ? t.auth.hidePassword : t.auth.showPassword}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#FF8A00] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-black text-white bg-[#FF8A00] hover:bg-[#e67c00] active:scale-[0.98] transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 text-xs tracking-wide disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? '...' : t.auth.registerButton}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Footer security note */}
      <div className="mt-4 text-center text-[10px] text-slate-400">
        <p>HUBAAL SHOP &copy; 2026 &bull; Secure SHA-256 Auth & Encryption</p>
      </div>
    </div>
  );
};
