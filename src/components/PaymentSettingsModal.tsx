import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Save, Check, Copy, Sparkles, Image as ImageIcon, Trash2, ShieldCheck } from 'lucide-react';

interface PaymentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: {
    bankName: string;
    duitNowId: string;
    qrCodeDataUrl: string | null;
  };
  onSave: (settings: { bankName: string; duitNowId: string; qrCodeDataUrl: string | null }) => void;
  triggerToast: (msg: string) => void;
}

const POPULAR_MALAYSIAN_BANKS = ['Maybank', 'CIMB Bank', 'TNG eWallet', 'Public Bank', 'RHB Bank', 'Hong Leong Bank'];

export default function PaymentSettingsModal({
  isOpen,
  onClose,
  currentSettings,
  onSave,
  triggerToast
}: PaymentSettingsModalProps) {
  const [bankName, setBankName] = useState(currentSettings.bankName || 'Maybank');
  const [duitNowId, setDuitNowId] = useState(currentSettings.duitNowId || '+6012-3456789');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(currentSettings.qrCodeDataUrl);
  const [isCopying, setIsCopying] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(duitNowId);
    setIsCopying(true);
    triggerToast('DuitNow ID copied to clipboard!');
    setTimeout(() => setIsCopying(false), 2000);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast('Please upload an image file (PNG/JPEG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setQrCodeDataUrl(e.target.result);
        triggerToast('QR Code uploaded and parsed to profile!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !duitNowId.trim()) {
      triggerToast('Bank Name and DuitNow ID must not be empty.');
      return;
    }
    onSave({
      bankName: bankName.trim(),
      duitNowId: duitNowId.trim(),
      qrCodeDataUrl
    });
    onClose();
  };

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
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            id="payment-settings-backdrop"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 text-slate-800 dark:text-slate-100"
            id="payment-settings-modal"
          >
            {/* Header branding */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-transparent">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck size={18} />
                  </span>
                  DuitNow & QR Pay Profile
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure your personal payment details for settling bills</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              
              {/* Bank Selector selection pills */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Malaysian Receiving Bank / eWallet
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {POPULAR_MALAYSIAN_BANKS.map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setBankName(bank)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold tracking-tight text-center transition-all border ${
                        bankName === bank
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm font-black'
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
                
                {/* Custom input if bank not in popular */}
                <input
                  type="text"
                  placeholder="Or enter custom Bank Name"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-semibold"
                />
              </div>

              {/* DuitNow ID Settings */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  DuitNow ID / Phone / Account Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. +6012-3456789 or account number"
                      value={duitNowId}
                      onChange={e => setDuitNowId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-850 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-semibold font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center border border-transparent"
                    title="Test Copy button"
                  >
                    {isCopying ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Used by group members to instantly copy your identification id details to their banking apps.
                </p>
              </div>

              {/* QR Code Upload Drag And Drop Zone */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  DuitNow QR / TNG eWallet QR Code
                </label>

                {/* Drag Active check */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative p-5 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
                      : qrCodeDataUrl
                      ? 'border-emerald-500/30 bg-slate-50/50 dark:bg-slate-950/20 hover:border-emerald-500'
                      : 'border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/10 hover:border-slate-300 dark:hover:border-slate-750'
                  }`}
                  id="qr-upload-dropzone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {qrCodeDataUrl ? (
                    <div className="space-y-3 p-1">
                      {/* Uploaded QR Preview frame */}
                      <div className="relative inline-block mx-auto bg-white p-3.5 rounded-2xl shadow-md border border-slate-100 max-w-[130px]">
                        <img
                          src={qrCodeDataUrl}
                          alt="Custom Uploaded QR"
                          className="w-24 h-24 object-contain rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all cursor-pointer shadow"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrCodeDataUrl(null);
                            triggerToast('Custom QR Code removed. Reverted to default placeholder.');
                          }}
                          title="Remove custom QR"
                        >
                          <Trash2 size={11} />
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Custom QR Registered</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Click or drag & drop another file to replace</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 py-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300 mx-auto">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & Drop QR Code Image</p>
                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or JPEG allowed • Click to select folder</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Live Preview Box */}
              <div className="bg-slate-50 dark:bg-slate-950/20 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Live Dashboard QR Preview</span>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-750 flex items-center justify-center p-1 shrink-0">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="Preview" className="w-full h-full object-contain rounded" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-slate-300 dark:text-slate-600 flex flex-col items-center">
                        <ImageIcon size={18} />
                        <span className="text-[7px] mt-0.5 uppercase font-bold">MOCK</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{bankName || 'No bank selected'}</h5>
                    <p className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">{duitNowId || 'No ID configured'}</p>
                  </div>
                </div>
              </div>

              {/* Save Trigger Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl active:scale-95 transition shadow-lg shadow-emerald-950/10 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  id="btn-save-payment-settings"
                >
                  <Save size={14} className="text-emerald-100" />
                  <span>Save Payment Profile</span>
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
