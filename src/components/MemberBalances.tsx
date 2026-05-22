import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, X, AlertOctagon, Sparkles, UserPlus } from 'lucide-react';
import { Member, Expense } from '../types';
import { calculateBalances } from '../utils/settlement';
import Avatar from './Avatar';

interface MemberBalancesProps {
  members: Member[];
  expenses: Expense[];
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
  onTriggerInvite: () => void;
}

const AVATAR_COLORS = [
  'bg-emerald-500 text-white',
  'bg-indigo-500 text-white',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-amber-500 text-white',
  'bg-sky-500 text-white',
  'bg-rose-500 text-white',
  'bg-teal-500 text-white'
];

export default function MemberBalances({ members, expenses, onAddMember, onRemoveMember, onTriggerInvite }: MemberBalancesProps) {
  const [newMemberName, setNewMemberName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const balances = calculateBalances(members, expenses);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMemberName.trim();
    if (!trimmed) return;

    if (members.some(m => m.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('A member with this name already exists.');
      return;
    }

    onAddMember(trimmed);
    setNewMemberName('');
    setIsAdding(false);
    setErrorMsg('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 shadow-sm space-y-4" id="member-balances-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs sm:text-sm">
          <Users size={16} className="text-emerald-500" />
          <span>Group Members</span>
          <span className="ml-1 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono normal-case">
            {members.length}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          {!isAdding && (
            <button
              onClick={() => {
                setIsAdding(true);
                setErrorMsg('');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-650 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1 hover:underline transition-all cursor-pointer"
              id="btn-show-add-member"
            >
              <Plus size={13} className="stroke-[2.5]" />
              Add Friend
            </button>
          )}

          <button
            onClick={onTriggerInvite}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-350 flex items-center gap-1 hover:underline transition-all cursor-pointer"
            id="btn-invite-members"
          >
            <UserPlus size={13} />
            Invite Friends
          </button>
        </div>
      </div>

      {/* Inline Adding form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onSubmit={handleSubmit}
            className="overflow-hidden space-y-2 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-850"
            id="form-add-member"
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Marcus)"
                value={newMemberName}
                onChange={e => {
                  setNewMemberName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border-none rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 font-medium"
                maxLength={20}
                required
                id="input-new-member-name"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                id="btn-submit-member"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg text-xs"
                id="btn-cancel-add-member"
              >
                <X size={14} />
              </button>
            </div>
            {errorMsg && (
              <p className="text-[10px] text-red-500 font-medium flex items-center gap-1.5">
                <AlertOctagon size={11} />
                {errorMsg}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>

      {/* Member roster */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
        {members.map((member) => {
          const bal = balances[member.id] || 0;
          
          let balanceLabel = '';
          let textClass = 'text-slate-500';
          let bgPillClass = 'bg-slate-50 dark:bg-slate-900/60';

          if (bal > 0.01) {
            balanceLabel = `is owed RM ${bal.toFixed(2)}`;
            textClass = 'text-emerald-500 font-bold';
            bgPillClass = 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
          } else if (bal < -0.01) {
            balanceLabel = `owes RM ${Math.abs(bal).toFixed(2)}`;
            textClass = 'text-coral-500 dark:text-orange-400 font-semibold text-rose-500'; // terracotta warning color
            bgPillClass = 'bg-rose-500/10 text-rose-600 dark:bg-red-950/20 dark:text-red-400';
          } else {
            balanceLabel = 'Fully settled';
            textClass = 'text-slate-400 dark:text-slate-600';
            bgPillClass = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500';
          }

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors group"
              id={`member-row-${member.id}`}
            >
              {/* Member profile info */}
              <div className="flex items-center gap-3">
                <Avatar 
                  name={member.id === 'you' ? 'You' : member.name} 
                  avatarUrl={member.avatarUrl} 
                  color={member.color} 
                  size="md" 
                />
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {member.id === 'you' ? 'You' : member.name}
                  </span>
                </div>
              </div>

              {/* Balance or control actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 text-[11px] rounded-full font-semibold ${bgPillClass}`}>
                  {balanceLabel}
                </span>

                {bal < -0.01 && (
                  <button
                    onClick={() => {
                      const textMsg = `Hi ${member.name}! Just a friendly reminder from Spliit that you owe RM ${Math.abs(bal).toFixed(2)} in our group. Settle up here: ${window.location.origin}`;
                      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/25 dark:text-emerald-300 transition-all text-[10px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title={`Remind ${member.name} via WhatsApp`}
                    id={`btn-whatsapp-${member.id}`}
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 2c-5.523 0-10 4.477-10 10a9.957 9.957 0 001.574 5.34l-1.614 5.907 6.047-1.586a9.932 9.932 0 005.141 1.416c5.523 0 10-4.477 10-10a10 10 0 00-10-10zm5.69 13.1c-.244.688-1.22 1.259-1.688 1.309-.459.049-.9.23-2.83-.531-2.47-1-4.04-3.52-4.16-3.69-.123-.169-1.009-1.34-1.009-2.559s.639-1.82 1.009-2.189c.123-.109.32-.169.459-.169s.287-.01.41.01c.123.01.287-.049.451.34s.533 1.309.582 1.41a.36.36 0 01-.033.36c-.1.12-.213.25-.331.38-.119.12-.25.26-.109.5.141.24 1.159 1.91 2.49 3.09 1.16 1.03 2.131 1.35 2.43 1.48s.459.049.631-.141c.169-.19.74-.86.931-1.159.201-.3.393-.25.631-.15s1.511.709 1.77 1.03c.25.12.393.18.44.25.1.13-.1.76-.34 1.45z"/>
                    </svg>
                    <span>Remind</span>
                  </button>
                )}

                {/* Don't allow deleting "You" */}
                {member.id !== 'you' && (
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="p-1 px-1.5 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-805 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                    title={`Remove ${member.name}`}
                    id={`btn-remove-member-${member.id}`}
                  >
                    <X size={12} className="stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export { AVATAR_COLORS };
