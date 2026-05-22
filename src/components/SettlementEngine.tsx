import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Send, AlertCircle, ArrowUpRight, CheckCircle2, TrendingUp, Copy, QrCode } from 'lucide-react';
import { Settlement, Member, Expense } from '../types';
import { calculateSettlements } from '../utils/settlement';
import PaymentModal from './PaymentModal';
import Avatar from './Avatar';

interface SettlementEngineProps {
  members: Member[];
  expenses: Expense[];
  onSettleDebt: (fromId: string, toId: string, amount: number) => void;
  triggerToast: (msg: string) => void;
}

export default function SettlementEngine({ members, expenses, onSettleDebt, triggerToast }: SettlementEngineProps) {
  const settlements = calculateSettlements(members, expenses);
  const [activePaymentSettle, setActivePaymentSettle] = useState<Settlement | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getMember = (id: string): Member => {
    return members.find(m => m.id === id) || { id, name: id, color: 'bg-slate-500' };
  };

  const handleCopyDuitNow = (member: Member) => {
    if (!member.duitNowId) return;
    navigator.clipboard.writeText(member.duitNowId);
    setCopiedId(member.id);
    triggerToast(`Copied DuitNow ID for ${member.name}!`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleSettleClick = (settle: Settlement) => {
    // Open the premium payment modal instead of instantly settling
    setActivePaymentSettle(settle);
  };

  const handleConfirmPayment = () => {
    if (!activePaymentSettle) return;
    const settle = activePaymentSettle;

    // Trigger state settlement action
    onSettleDebt(settle.from, settle.to, settle.amount);
    setSuccessId(settle.id);

    // Clear success banner alert shortly
    setTimeout(() => {
      setSuccessId(null);
    }, 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4" id="settlement-engine-panel">
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
          <TrendingUp size={16} className="text-indigo-500" />
          Smart Settlement Engine
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Spliit calculates the absolute minimum number of peer-to-peer transactions required to clear the debts.
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {settlements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center py-7 bg-slate-50 dark:bg-slate-950/20 rounded-xl p-5 flex flex-col items-center justify-center space-y-1.5 border border-dashed border-slate-200 dark:border-slate-800"
              id="all-settled-state"
            >
              <span className="text-2xl">🎉</span>
              <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">All debts clean!</h4>
              <p className="text-[11px] text-slate-400">Everyone is fully squared up.</p>
            </motion.div>
          ) : (
            settlements.map((settle) => {
              const fromMember = getMember(settle.from);
              const toMember = getMember(settle.to);
              const isSuccess = successId === settle.id;

              return (
                <motion.div
                  key={settle.id}
                  layoutId={`settle-${settle.id}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl gap-4 w-full border border-slate-100 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition"
                  id={`settlement-row-${settle.id}`}
                >
                  {/* Left: The People Involved (Avatars & payment directions group) */}
                  <div className="flex flex-wrap items-center gap-3.5 flex-1 min-w-0">
                    {/* Debtor Avatar & Name */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Avatar 
                        name={fromMember.id === 'you' ? 'You' : fromMember.name} 
                        avatarUrl={fromMember.avatarUrl} 
                        color={fromMember.color} 
                        size="sm" 
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[85px] xs:max-w-[125px] sm:max-w-[140px]" title={fromMember.id === 'you' ? 'You' : fromMember.name}>
                        {fromMember.id === 'you' ? 'You' : fromMember.name}
                      </span>
                    </div>

                    {/* Directional Action */}
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-555 shrink-0 select-none">
                      <span className="text-[10px] font-mono font-black uppercase bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-150 dark:border-slate-750">
                        pays
                      </span>
                      <ArrowUpRight size={14} className="text-indigo-400 shrink-0" />
                    </div>

                    {/* Creditor Avatar, Name & DuitNow info block */}
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2">
                        <Avatar 
                          name={toMember.id === 'you' ? 'You' : toMember.name} 
                          avatarUrl={toMember.avatarUrl} 
                          color={toMember.color} 
                          size="sm" 
                        />
                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[85px] xs:max-w-[125px] sm:max-w-[140px]" title={toMember.id === 'you' ? 'You' : toMember.name}>
                          {toMember.id === 'you' ? 'You' : toMember.name}
                        </span>
                      </div>
                      {toMember.duitNowId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyDuitNow(toMember);
                          }}
                          className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors pointer-events-auto cursor-pointer font-mono text-left max-w-full"
                          title={`Click to copy DuitNow ID of ${toMember.name}`}
                        >
                          <Copy size={10} className="shrink-0" />
                          <span className="truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[220px]">
                            DuitNow: <strong className="font-semibold underline underline-offset-2">{copiedId === toMember.id ? 'Copied!' : toMember.duitNowId}</strong>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Action Badge details */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-0 border-slate-100 dark:border-slate-800/40 pt-3 sm:pt-0 w-full sm:w-auto">
                    <div className="flex flex-col sm:items-end justify-center min-w-[70px]">
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest sm:text-right">To Settle</span>
                      <span className="font-mono text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400" id={`settlement-amount-${settle.from}-${settle.to}`}>
                        RM {settle.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {settle.from === 'you' ? (
                        <button
                          onClick={() => handleSettleClick(settle)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95 ${
                            isSuccess
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-xs shadow-black/5'
                          }`}
                          id={`btn-settle-${settle.from}-${settle.to}`}
                        >
                          {isSuccess ? (
                            <>
                              <CheckCircle2 size={13} className="stroke-[3]" />
                              <span>Paid & Settled</span>
                            </>
                          ) : (
                            <>
                              <QrCode size={13} className="text-emerald-500 animate-pulse" />
                              <span>Settle up</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-750/50">
                          Awaiting payment
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
      
      {/* Informative tips box */}
      <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex gap-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        <AlertCircle size={15} className="indigo-600 shrink-0 text-indigo-500 mt-0.5" />
        <span>
          Clicking <strong className="text-slate-700 dark:text-slate-200 font-semibold">"Settle up"</strong> opens a Malaysian DuitNow real-time payment gateway simulation, which displays secure bank details, custom QR codes and offers interactive manual verification options.
        </span>
      </div>

      {/* Dynamic Payment Gate Modal with DuitNow styling details */}
      {activePaymentSettle && (
        <PaymentModal
          isOpen={!!activePaymentSettle}
          onClose={() => setActivePaymentSettle(null)}
          debtor={getMember(activePaymentSettle.from)}
          creditor={getMember(activePaymentSettle.to)}
          amount={activePaymentSettle.amount}
          onConfirmPayment={handleConfirmPayment}
          triggerToast={triggerToast}
        />
      )}

    </div>
  );
}
