import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/app.config';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import ktLogo from '../assets/kt-logo.jpeg';

export const LoginPage: React.FC = () => {
  const { user, login, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(isDemoMode ? 'agent@krishatech.com' : '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await login(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Login failed. Please check credentials.');
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleDemoQuickLogin = async () => {
    setIsSubmitting(true);
    const { error } = await login('agent@krishatech.com');
    setIsSubmitting(false);
    if (!error) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-left selection:bg-brand-500 selection:text-white">
      {/* Background Animated Floating Light Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-krisha-purple/20 rounded-full blur-3xl animate-pulse-subtle pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-krisha-purple rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse-subtle" />
            <img
              src={ktLogo}
              alt="Krisha Tech Logo"
              className="relative w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-white/30 shadow-2xl"
            />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">
              {APP_CONFIG.company}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Internal Lead & Sales Management System
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border border-indigo-500/20 shadow-2xl shadow-indigo-950/40">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-semibold text-white">Staff Login Portal</h2>
            </div>
            {isDemoMode && (
              <span className="text-[10px] uppercase font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@krishatech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required={!isDemoMode}
                  placeholder={isDemoMode ? 'Optional in demo mode' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Mode Button */}
          {isDemoMode && (
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDemoQuickLogin}
                className="w-full py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>One-Click Sales Agent Access (Demo)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Krisha Tech. Internal Lead & Sales Platform.</p>
        </div>
      </div>
    </div>
  );
};
