import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, FolderPlus, Tag, FileText, Sparkles, UserPlus } from 'lucide-react';
import { Group, Member } from '../types';
import { AVATAR_COLORS } from './MemberBalances';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (group: { name: string; description: string; icon: string; initialMemberNames: string[] }) => void;
}

const EMOJI_OPTIONS = ['🏠', '🚗', '🍛', '🍿', '💻', '🌴', '✈️', '🎓', '⚡', '📦', '🚲', '🍕'];

export default function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏠');
  const [membersText, setMembersText] = useState(''); // Comma-separated names

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Parse comma-separated names
    const names = membersText
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    onCreateGroup({
      name: name.trim(),
      description: description.trim() || 'A fresh Spliit bill group.',
      icon: selectedIcon,
      initialMemberNames: names
    });

    // Reset form
    setName('');
    setDescription('');
    setSelectedIcon('🏠');
    setMembersText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            id="create-group-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
            id="create-group-modal"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-500">
                    <FolderPlus size={18} />
                  </span>
                  Create Expense Group
                </h3>
                <p className="text-xs text-slate-400 mt-1">Start a fresh pool of shared expenses & members</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Group Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Group Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SS15 Housemates, Tokyo Trip 2026"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                />
              </div>

              {/* Group Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Shared grocery, bills, petrol"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                />
              </div>

              {/* Icon Emojis List Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choose Icon Indicator</label>
                <div className="grid grid-cols-6 gap-2.5">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setSelectedIcon(em)}
                      className={`h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        selectedIcon === em
                          ? 'bg-emerald-500 text-white shadow-md scale-105 ring-2 ring-emerald-500/40'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comma-separated peers list */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  <span>Initial Group Members</span>
                  <span className="text-[9px] text-slate-400 normal-case font-normal">(comma-separated)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400"><UserPlus size={15} /></span>
                  <input
                    type="text"
                    placeholder="e.g. Ali, Chong, Bala, Sarah"
                    value={membersText}
                    onChange={e => setMembersText(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                  Note: <strong>You</strong> are automatically included as a primary administrator/member.
                </p>
              </div>

              {/* Actions submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl active:scale-95 transition shadow-lg shadow-emerald-950/10 font-semibold flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={13} className="text-emerald-100" />
                  <span>Create & Launch Group</span>
                </button>
              </div>

            </form>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
