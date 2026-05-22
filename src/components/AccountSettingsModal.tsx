import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Image, Upload, Check, AlertCircle, Camera, Trash2 } from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email: string; fullName: string; avatarUrl?: string } | null;
  onUpdateAccount: (updatedUser: { fullName: string; avatarUrl?: string }) => void;
}

const PRESET_AVATARS = [
  { id: 'preset-1', name: 'Faiz', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'preset-2', name: 'Sophia', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'preset-3', name: 'Chong', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'preset-4', name: 'Sarah', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'preset-5', name: 'Kevin', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&h=150&q=80' },
  { id: 'preset-6', name: 'Daniel', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80' },
];

export default function AccountSettingsModal({ isOpen, onClose, user, onUpdateAccount }: AccountSettingsModalProps) {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  // Handle local image file picker and convert to base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file PNG/JPG');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB restriction for localStorage sizing
      setErrorMsg('Image size must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setErrorMsg('');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading selected image');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      setErrorMsg('Please enter a valid HTTP image url or Data URL');
      return;
    }
    setAvatarUrl(trimmed);
    setCustomUrlInput('');
    setErrorMsg('');
  };

  const handleClearAvatar = () => {
    setAvatarUrl('');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMsg('Full name is required');
      return;
    }

    onUpdateAccount({
      fullName: trimmedName,
      avatarUrl: avatarUrl || undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glass */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          id="account-settings-backdrop"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 p-6 space-y-5"
          id="account-settings-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
                <User size={18} />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Account Profile Settings</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Set your profile nickname and display picture</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition"
              id="btn-close-account-settings"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display profile preview & remove buttons */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Current profile preview"
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                    {fullName ? fullName[0].toUpperCase() : 'U'}
                  </span>
                )}
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleClearAvatar}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 text-white hover:bg-rose-600 rounded-lg shadow-sm transition shrink-0 cursor-pointer"
                    title="Remove custom photo"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {fullName || 'Your Nickname'}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {avatarUrl ? 'Custom photo is active' : 'Initial letter avatar active'} • {user.email}
                </p>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleClearAvatar}
                    className="text-[10px] text-rose-500 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    Reset display to default letter
                  </button>
                )}
              </div>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-100 dark:border-red-900/30 font-semibold" id="account-settings-err-banner">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Nickname and email input */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your nickname or full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-805 text-slate-800 dark:text-white placeholder-slate-400 border border-slate-100 dark:border-slate-750 focus:ring-1 focus:ring-indigo-500 text-xs font-bold"
                  maxLength={30}
                  id="input-account-fullname"
                />
              </div>

              {/* Select Avatar presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Choose Preset Avatar</label>
                <div className="grid grid-cols-6 gap-2 pt-0.5">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = avatarUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(preset.url);
                          setErrorMsg('');
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition ${
                          isSelected 
                            ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 scale-105' 
                            : 'border-transparent opacity-85 hover:opacity-100 hover:scale-102 hover:border-slate-200 dark:hover:border-slate-800'
                        }`}
                        title={`Select preset ${preset.name}`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name}
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/25 flex items-center justify-center">
                            <span className="p-0.5 bg-indigo-600 rounded-full text-white">
                              <Check size={8} className="stroke-[4]" />
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload image file / Drag and Drop Area */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Upload Profile Picture</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-500'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Camera size={18} className="text-slate-400 dark:text-slate-500" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Drag & drop image here or click
                    </span>
                    <span className="text-[9px] text-slate-400">
                      Supports JPG, PNG (Max size: 2MB)
                    </span>
                  </div>
                </div>
              </div>

              {/* Web URL Area */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Or Paste Custom Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/mypicture.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-805 text-slate-800 dark:text-white placeholder-slate-400 border border-slate-100 dark:border-slate-750 focus:ring-1 focus:ring-indigo-500 text-[11px] font-medium"
                    id="input-account-url"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-slate-150 dark:border-slate-800 font-semibold">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                id="btn-account-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[1.8] py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl active:scale-95 transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                id="btn-account-save"
              >
                <Check size={14} className="stroke-[3]" />
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
