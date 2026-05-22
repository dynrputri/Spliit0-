import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, QrCode, Shield, CheckCircle2, DollarSign, Wallet } from 'lucide-react';
import { Member } from '../types';
import Avatar from './Avatar';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor: Member; // Debtor paying (User A)
  creditor: Member; // Creditor receiving (User B)
  amount: number;
  onConfirmPayment: () => void; // Triggered when primary action clicks
  triggerToast: (msg: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  debtor,
  creditor,
  amount,
  onConfirmPayment,
  triggerToast
}: PaymentModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [isSuccessShowing, setIsSuccessShowing] = useState(false);

  const handleCopyDuitNow = () => {
    if (!creditor.duitNowId) return;
    navigator.clipboard.writeText(creditor.duitNowId);
    setCopiedId(true);
    triggerToast(`Copied ${creditor.name}'s DuitNow ID!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleMarkAsPaid = () => {
    setIsSuccessShowing(true);
    
    // Play sound or wait for beautiful transition
    setTimeout(() => {
      onConfirmPayment();
      setIsSuccessShowing(false);
      onClose();
    }, 1800);
  };

  // Determine QR Code fallback style depending on creditor bank info
  const bank = creditor.bankName || 'Maybank';
  const getThemeColor = () => {
    const b = bank.toLowerCase();
    if (b.includes('maybank')) return { primary: 'from-amber-400 to-amber-500', text: 'text-amber-600', code: '#EAB308' };
    if (b.includes('tng') || b.includes('touch')) return { primary: 'from-blue-500 to-blue-600', text: 'text-blue-500', code: '#2563EB' };
    if (b.includes('cimb')) return { primary: 'from-red-600 to-red-700', text: 'text-red-600', code: '#DC2626' };
    if (b.includes('public')) return { primary: 'from-rose-500 to-red-600', text: 'text-rose-650', code: '#E11D48' };
    if (b.includes('rhb')) return { primary: 'from-blue-700 to-blue-800', text: 'text-blue-700', code: '#1D4ED8' };
    return { primary: 'from-emerald-500 to-teal-600', text: 'text-emerald-500', code: '#10B981' };
  };

  const themeColors = getThemeColor();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop screen filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            id="payment-modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 text-slate-800 dark:text-slate-100"
            id="payment-detail-modal"
          >
            {/* Quick success overlay */}
            <AnimatePresence>
              {isSuccessShowing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 space-y-4"
                  id="payment-success-overlay"
                >
                  <motion.div
                    initial={{ scale: 0.8, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 size={36} className="stroke-[2.5]" />
                  </motion.div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Transfer Verified!</h3>
                    <p className="text-xs text-slate-400">Updating active balance sheet logs & settlements...</p>
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    RM {amount.toFixed(2)} Settle Up
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 font-bold px-2 py-1 rounded-full text-slate-500 flex items-center gap-1 uppercase font-mono tracking-wider">
                <Shield size={10} className="text-emerald-500" /> Secure Payment Gateway
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col items-center space-y-5">
              
              {/* Payment Request details overview */}
              <div className="text-center space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">TRANSFER COMPLETED TO</p>
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <Avatar 
                    name={creditor.id === 'you' ? 'You' : creditor.name} 
                    avatarUrl={creditor.avatarUrl} 
                    color={creditor.color} 
                    size="sm" 
                  />
                  {creditor.id === 'you' ? 'You' : creditor.name}
                </h4>
                <div className="pt-2">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                    RM {amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Bank Name / DuitNow details container with custom click copy */}
              <div className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-3.5 flex items-center justify-between text-xs font-semibold">
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono block">Creditor Account details</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">{bank}</span>
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5 block truncate">{creditor.duitNowId || 'No Account ID'}</span>
                </div>

                {creditor.duitNowId && (
                  <button
                    onClick={handleCopyDuitNow}
                    type="button"
                    className="p-2 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-750 transition border border-slate-100 dark:border-slate-750 rounded-xl text-slate-500 dark:text-slate-300 relative top-1 flex items-center justify-center"
                    title="Click to copy payment ID"
                  >
                    {copiedId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                )}
              </div>

              {/* QR CODE CARD MODULE DESIGN CONTAINER */}
              <div className="relative w-full aspect-square max-w-[210px] rounded-3xl overflow-hidden bg-[#ED2224] p-3 flex flex-col items-center justify-between shadow-lg">
                
                {/* Authentic DuitNow Magenta/Pink top branding */}
                <div className="w-full flex items-center justify-between pointer-events-none">
                  {/* Mock DuitNow Text Logo logo */}
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-xs scale-90">
                    <span className="text-[10px] font-black tracking-tight text-slate-900 font-sans">Duit</span>
                    <span className="text-[10px] font-black tracking-wider text-rose-600 uppercase font-mono">Now</span>
                  </div>
                  
                  {/* eWallet/Bank indicator ribbon */}
                  <div className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[8px] font-black uppercase font-mono tracking-wider">
                    {bank.split(' ')[0]}
                  </div>
                </div>

                {/* Inner White Plate representing the QR and camera framing overlay */}
                <div className="relative w-full aspect-square bg-white rounded-2xl flex items-center justify-center p-3.5 border border-[#DE0F17]">
                  {creditor.qrCodeDataUrl ? (
                    <img
                      src={creditor.qrCodeDataUrl}
                      alt="Creditor QR Code"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* Elegant Fallback SVG QR design representation */
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-90 select-none">
                      {/* Corner Anchor Blocks 1 */}
                      <rect x="5" y="5" width="22" height="22" fill={themeColors.code} rx="2" />
                      <rect x="10" y="10" width="12" height="12" fill="white" />
                      <rect x="13" y="13" width="6" height="6" fill={themeColors.code} />

                      {/* Corner Anchor Blocks 2 */}
                      <rect x="73" y="5" width="22" height="22" fill={themeColors.code} rx="2" />
                      <rect x="78" y="10" width="12" height="12" fill="white" />
                      <rect x="81" y="13" width="6" height="6" fill={themeColors.code} />

                      {/* Corner Anchor Blocks 3 */}
                      <rect x="5" y="73" width="22" height="22" fill={themeColors.code} rx="2" />
                      <rect x="10" y="78" width="12" height="12" fill="white" />
                      <rect x="13" y="81" width="6" height="6" fill={themeColors.code} />

                      {/* Center mock logo watermark */}
                      <circle cx="50" cy="50" r="14" fill={themeColors.code} />
                      <circle cx="50" cy="50" r="11" fill="white" />
                      <path d="M47 45 L53 50 L47 55" stroke={themeColors.code} strokeWidth="3" fill="none" strokeLinecap="round" />

                      {/* Scatter QR data dust randomized mock lines */}
                      <g fill="#1E293B">
                        <rect x="35" y="10" width="4" height="4" />
                        <rect x="42" y="15" width="8" height="4" />
                        <rect x="55" y="5" width="4" height="8" />
                        <rect x="62" y="12" width="4" height="4" />

                        <rect x="15" y="35" width="8" height="4" />
                        <rect x="10" y="45" width="4" height="8" />
                        <rect x="25" y="55" width="4" height="4" />

                        <rect x="75" y="35" width="4" height="8" />
                        <rect x="85" y="45" width="8" height="4" />
                        <rect x="70" y="55" width="4" height="4" />

                        <rect x="35" y="75" width="8" height="4" />
                        <rect x="48" y="85" width="4" height="8" />
                        <rect x="58" y="75" width="8" height="4" />
                        <rect x="62" y="85" width="4" height="4" />

                        <rect x="30" y="30" width="4" height="4" />
                        <rect x="66" y="30" width="4" height="4" />
                        <rect x="30" y="66" width="4" height="4" />
                        <rect x="66" y="66" width="4" height="4" />
                      </g>
                    </svg>
                  )}

                  {/* Clean scanner overlay corner framing indicators */}
                  <div className="absolute inset-2 border-2 border-transparent border-t-emerald-500 border-l-emerald-500 rounded-lg w-4 h-4 pointer-events-none" />
                  <div className="absolute inset-2 border-2 border-transparent border-t-emerald-500 border-r-emerald-500 rounded-lg w-4 h-4 left-auto pointer-events-none" />
                  <div className="absolute inset-2 border-2 border-transparent border-b-emerald-500 border-l-emerald-500 rounded-lg w-4 h-4 top-auto pointer-events-none" />
                  <div className="absolute inset-2 border-2 border-transparent border-b-emerald-500 border-r-emerald-500 rounded-lg w-4 h-4 top-auto left-auto pointer-events-none" />
                </div>

                {/* Subtitle frame */}
                <span className="text-[8px] font-black text-white/90 uppercase tracking-widest font-mono">
                  Scan to Pay (DuitNow / eWallet)
                </span>

              </div>

              {/* Informative overlay description subtitle */}
              <div className="text-[10px] font-bold text-center text-slate-400 bg-slate-50 dark:bg-slate-950/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
                Scan with your Banking App to Pay
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-slate-105 dark:border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkAsPaid}
                className="flex-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl active:scale-95 transition flex items-center justify-center gap-1 shadow-lg shadow-emerald-950/10 cursor-pointer"
                id="btn-confirm-settlement-transferred"
              >
                <Check size={14} className="stroke-[3]" />
                <span>Mark as Paid</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
