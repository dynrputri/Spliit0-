import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2, Users, Sparkles, Send } from 'lucide-react';
import { Group } from '../types';

interface GroupInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  triggerToast: (msg: string) => void;
}

// Stable hash utility to compute a beautiful 6-digit numeric code for any group
export const getGroupInviteCode = (group: Group): string => {
  // If we already have a custom mockup code for the predefined apartment group, return it
  if (group.id === 'grp-apartment-3a') {
    return 'ROOM3A';
  }
  
  // Stable hash based on group ID
  let hash = 0;
  for (let i = 0; i < group.id.length; i++) {
    hash = group.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const codeNum = Math.abs(hash) % 900000 + 100000; // Generate a standard 6 digit code
  const codeStr = codeNum.toString();
  return `${codeStr.slice(0, 3)} ${codeStr.slice(3, 6)}`;
};

export default function GroupInviteModal({ isOpen, onClose, group, triggerToast }: GroupInviteModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Clean name without trailing emojis if any
  const cleanName = group.name.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();

  // Primary shareable URL based on the group.id
  const shareUrl = `spliit.app/join/${group.id}`;

  // Unique 6-character/digit code
  const rawInviteCode = getGroupInviteCode(group);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopiedLink(true);
        triggerToast("Copied invitation link to clipboard!");
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link via clipboard API: ", err);
        // Fallback alert/toast
        triggerToast("An error occurred copying the link.");
      });
  };

  const handleCopyCode = () => {
    // Strip space when copying code
    const baseCode = rawInviteCode.replace(/\s+/g, '');
    navigator.clipboard.writeText(baseCode)
      .then(() => {
        setCopiedCode(true);
        triggerToast("Copied invite code to clipboard!");
        setTimeout(() => setCopiedCode(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy code: ", err);
      });
  };

  const handleShareWhatsApp = () => {
    const whatsappMessage = `Wey, join our group '${cleanName}' on Spliit to track our bills! Click here: ${shareUrl}`;
    const encMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs"
        />

        {/* Modal Sheet body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full relative z-10 overflow-hidden"
          id="group-invite-modal"
        >
          {/* Accent decoration ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

          {/* Close button top-right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Icon Header */}
          <div className="flex items-center gap-3.5 mb-5 pt-2">
            <span className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-550 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Users size={18} />
            </span>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                GROUP COOPERATIVE
              </p>
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[240px]">
                Invite to {cleanName}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Share this group with your friends so they can view splits, upload bills, and settle their Malaysian DuitNow payments effortlessly!
          </p>

          <div className="space-y-5">
            {/* Option A: Share Link */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-405 dark:text-slate-400 uppercase tracking-widest block font-mono">
                Option A: Copy Invite Link
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-50 dark:bg-slate-805 text-xs text-slate-600 dark:text-slate-350 border-none rounded-xl px-3.5 py-2.5 font-mono select-all focus:ring-0 outline-hidden"
                  id="invite-link-input"
                />
                
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 select-none cursor-pointer border ${
                    copiedLink
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-750 border-transparent shadow-sm'
                  }`}
                  id="btn-copy-invite-link"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp CTA */}
              <button
                onClick={handleShareWhatsApp}
                className="w-full mt-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-500/5"
                id="btn-share-whatsapp-cta"
              >
                <Share2 size={13} className="text-white/80" />
                <span>Share to WhatsApp</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center text-center my-3">
              <div className="flex-1 border-t border-slate-100 dark:border-slate-800" />
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                or use invite code
              </span>
              <div className="flex-1 border-t border-slate-100 dark:border-slate-800" />
            </div>

            {/* Option B: Invite Code */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-405 dark:text-slate-400 uppercase tracking-widest block font-mono">
                Option B: Unique Group Invite Code
              </label>

              <div className="bg-slate-50 dark:bg-slate-805/40 border border-slate-200/40 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black font-mono tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-300">
                    {rawInviteCode}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Simply enter this Code on join page</p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center text-xs cursor-pointer ${
                    copiedCode
                      ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 border-slate-200/50 dark:border-slate-750 text-slate-500 dark:text-slate-400'
                  }`}
                  title="Copy Invite Code"
                  id="btn-copy-invite-code"
                >
                  {copiedCode ? <Check size={14} className="stroke-[3]" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
