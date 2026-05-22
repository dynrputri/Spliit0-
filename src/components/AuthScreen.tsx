import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, User, LogIn, Compass, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: { email: string; fullName: string }) => void;
  triggerToast: (msg: string) => void;
}

export default function AuthScreen({ onLogin, triggerToast }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !fullName)) {
      triggerToast('Please fill out all required fields');
      return;
    }

    setIsLoading(true);
    // Simulate loading for sleek experience
    setTimeout(() => {
      setIsLoading(false);
      const user = {
        email: email.trim(),
        fullName: isLogin ? (email.split('@')[0] || 'User') : fullName.trim()
      };
      onLogin(user);
      triggerToast(isLogin ? `Welcome back, ${user.fullName}!` : `Account created! Welcome, ${user.fullName}`);
    }, 1000);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const guestUser = {
        email: 'guest.user@spliit.my',
        fullName: 'Guest'
      };
      onLogin(guestUser);
      triggerToast('Logged in as Guest');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 overflow-hidden relative font-sans text-slate-100">
      
      {/* Decorative Gradient Blobs */}
      <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logo and Tagline */}
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 items-center justify-center font-black text-white text-2xl tracking-widest shadow-xl shadow-indigo-950/40 mx-auto"
          >
            S
          </motion.div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-black tracking-tight text-white uppercase mt-2">SPLIIT</h1>
            <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-1">
              Fintech-Chic Bill Splitting & Shared Expense Tracker
            </p>
          </motion.div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.25 }}
          className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6"
        >
          <div className="flex border-b border-slate-800 pb-4">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative ${
                isLogin 
                  ? 'text-white border-indigo-500 font-extrabold' 
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative ${
                !isLogin 
                  ? 'text-white border-indigo-500 font-extrabold' 
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500"><User size={15} /></span>
                  <input
                    type="text"
                    required={!isLogin}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ahmad Faiz"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 text-white transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500"><Mail size={15} /></span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 text-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500"><Lock size={15} /></span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/60 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 text-white transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/30 font-semibold"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-white rounded-full animate-spin shrink-0" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <LogIn size={14} />
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Guest Account Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-bold uppercase tracking-widest">or experience instantly</span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
            id="btn-guest-login"
          >
            <Compass size={14} className="text-emerald-500" />
            <span>Login as Guest</span>
            <ArrowRight size={12} className="text-slate-500 inline-block" />
          </button>
        </motion.div>

        {/* Info label banner footer */}
        <p className="text-[10px] text-center text-slate-600 font-bold tracking-wider uppercase">
          SECURE 256-BIT LOCAL RECOVERY ACTIVATED
        </p>

      </div>
    </div>
  );
}
