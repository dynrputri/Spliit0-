import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Check, 
  Copy, 
  AlertCircle, 
  RefreshCw, 
  X, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Lock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { isSupabaseConfigured, testSupabaseConnection } from '../lib/supabaseClient';
import { SUPABASE_SQL_SCHEMA } from '../utils/supabaseSqlSchema';
import { pullFromSupabase, pushToSupabase } from '../utils/supabaseSync';
import { Group } from '../types';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onSyncComplete: (syncedGroups: Group[], message: string) => void;
}

export default function SupabaseSyncModal({ 
  isOpen, 
  onClose, 
  groups, 
  onSyncComplete 
}: SupabaseSyncModalProps) {
  const [copied, setCopied] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Checking configuration keys...');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'instructions'>('status');

  // Verify connection status on opening the modal
  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    setIsChecked(false);
    setStatusMessage('Pinging Supabase cloud endpoint...');
    
    if (!isSupabaseConfigured) {
      setIsConnected(false);
      setStatusMessage('Not configured. Local storage mode is active.');
      setIsChecked(true);
      return;
    }

    const { success, message } = await testSupabaseConnection();
    setIsConnected(success);
    setStatusMessage(message);
    setIsChecked(true);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePush = async () => {
    setActionLoading('push');
    try {
      const { success, message } = await pushToSupabase(groups);
      if (success) {
        onSyncComplete(groups, 'Uploaded current groups & transaction splits successfully!');
      } else {
        alert(`Push Sync Error: ${message}`);
      }
    } catch (err: any) {
      alert(`Error during sync push: ${err?.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePull = async () => {
    setActionLoading('pull');
    try {
      const { success, data, message } = await pullFromSupabase();
      if (success && data) {
        onSyncComplete(data, `Pulled ${data.length} groups successfully from the cloud!`);
      } else {
        alert(`Pull Sync Error: ${message}`);
      }
    } catch (err: any) {
      alert(`Error during sync pull: ${err?.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          id="supabase-modal-wrapper"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Database size={18} className="animate-pulse" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  Supabase Database Sync Engine
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Connect, deploy, and synchronize splits seamlessly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              id="btn-close-supabase-modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/10 p-2 gap-1.5">
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'status'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/55'
              }`}
            >
              Cloud Connection Status
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'schema'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/55'
              }`}
            >
              Postgres SQL Schema
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'instructions'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/55'
              }`}
            >
              Deployment Guide
            </button>
          </div>

          {/* Tab Content Panels (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'status' && (
              <div className="space-y-5">
                {/* Configuration Health Card */}
                <div className="p-5 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-slate-150 dark:border-slate-850">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      !isSupabaseConfigured 
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500' 
                        : isConnected 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' 
                          : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500'
                    }`}>
                      <Database size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Engine</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          !isSupabaseConfigured
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : isConnected
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {!isSupabaseConfigured ? 'Local Only' : isConnected ? 'Online Connected' : 'Evaluating Status'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-1 break-words">
                        {isSupabaseConfigured ? 'Supabase Database Configured' : 'Supabase Integration Ready'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 dark:text-slate-500 leading-relaxed font-medium">
                        {statusMessage}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={checkConnection}
                    disabled={!isChecked}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-all cursor-pointer active:scale-95 shrink-0"
                    title="Check Connection"
                  >
                    <RefreshCw size={14} className={!isChecked ? 'animate-spin' : ''} />
                  </button>
                </div>

                {!isSupabaseConfigured ? (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4.5 space-y-3.5">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400">Supabase API Keys Not Active Yet</h5>
                        <p className="text-[11px] text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">
                          Your app is loaded in **Offline Local Storage mode** right now. This is perfectly fine! Any expenses, settlements, and groups will stay saved on your device until you connect a Supabase project.
                        </p>
                      </div>
                    </div>
                    <div className="text-xs bg-white dark:bg-slate-900 border border-amber-500/15 p-3 rounded-xl space-y-1.5 font-mono text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                      <div># To connect, add these variables to your environment:</div>
                      <div>VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
                      <div>VITE_SUPABASE_ANON_KEY="your-anon-api-key"</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4.5">
                    <div className="flex items-start gap-3">
                      <Sparkles size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Real-time Sync Active</h5>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-500 mt-1 leading-relaxed">
                          Supabase APIs are ready! Use the sync panel below to backup or download structural data directly to/from your tables.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cloud Sync Controller Buttons */}
                <div className="space-y-3 pt-1">
                  <h5 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Database Sync Functions</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Push Button */}
                    <button
                      onClick={handlePush}
                      disabled={!isSupabaseConfigured || actionLoading !== null}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-900 transition flex flex-col items-start gap-2.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none group text-left shadow-xs"
                      title="Upload to Cloud"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center shrink-0">
                        <ArrowUp size={16} className="group-hover:translate-y-[-2px] transition-transform" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                          Push to Supabase Cloud
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">
                          Uploads local group directories, members, and custom split list records into your remote Postgres backend.
                        </p>
                      </div>
                      {actionLoading === 'push' && (
                        <span className="text-[10px] font-mono text-indigo-500 flex items-center gap-1.5 mt-1">
                          <RefreshCw size={10} className="animate-spin" /> Uploading database...
                        </span>
                      )}
                    </button>

                    {/* Pull Button */}
                    <button
                      onClick={handlePull}
                      disabled={!isSupabaseConfigured || actionLoading !== null}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-900 transition flex flex-col items-start gap-2.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none group text-left shadow-xs"
                      title="Download from Cloud"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center shrink-0">
                        <ArrowDown size={14} className="group-hover:translate-y-[2px] transition-transform" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                          Pull from Supabase Cloud
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">
                          Downloads active cloud transactions data straight into your local workspace. Overwrites local cache.
                        </p>
                      </div>
                      {actionLoading === 'pull' && (
                        <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1.5 mt-1">
                          <RefreshCw size={10} className="animate-spin" /> Pulling database...
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schema' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Postgres Schema Setup</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Run this SQL execution code inside your Supabase dashboard to provision tables</p>
                  </div>
                  <button
                    onClick={handleCopySchema}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition text-xs font-bold flex items-center gap-2 cursor-pointer text-indigo-600 dark:text-indigo-400"
                    title="Copy schema blocks"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="stroke-[3] text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[10px] sm:text-xs overflow-x-auto max-h-[350px] scrollbar-none border border-slate-800/80 leading-relaxed shadow-inner">
                    <code>{SUPABASE_SQL_SCHEMA}</code>
                  </pre>
                  <div className="absolute right-3.5 bottom-3 text-[10px] text-slate-500 font-mono uppercase bg-slate-850 px-2 py-0.5 rounded border border-slate-750">
                    SQL ddl format
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 dark:bg-slate-950/20 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
                  <AlertCircle size={14} className="indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pro-Tip:</strong> High-performance JSONB storage is structured for splits and food/drink items (receipt parsing) allowing Spliit to support extreme customization features with maximum query execution speeds on a simplified schema!
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="space-y-5">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Connect to GitHub, Codespaces & Vercel</h4>
                
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex gap-4 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-550 dark:text-indigo-400 font-black flex items-center justify-center text-xs shrink-0 select-none">1</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                        Setup Supabase Cloud Project
                        <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 inline-flex items-center gap-0.5" title="Go to Supabase website">
                          <ExternalLink size={10} />
                        </a>
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                        Create a free database project in the Supabase Cloud. From the Project Dashboard, open the <strong>SQL Editor</strong> tab, create a new query, paste our schema from the previous tab, and click <strong>Run</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-550 dark:text-indigo-400 font-black flex items-center justify-center text-xs shrink-0 select-none">2</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">Collect API Credentials</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed font-semibold">
                        Retrieve the connection URL and public Anon Key from Project Settings &gt; API.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-550 dark:text-indigo-400 font-black flex items-center justify-center text-xs shrink-0 select-none">3</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">Configure Repository Environment Keys</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                        To run the app securely matching your repo:
                      </p>
                      <ul className="list-disc list-inside text-[11px] text-slate-400 dark:text-slate-500 mt-2 space-y-1.5 pl-1.5">
                        <li>
                          <strong>GitHub Codespaces / Local DEV:</strong> Use a <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">.env</code> file with keys in your repository workspace!
                        </li>
                        <li>
                          <strong>Vercel or Netlify Deployment:</strong> Go to your Vercel Project Dashboard under <strong>Settings &gt; Environment Variables</strong>, add <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">VITE_SUPABASE_ANON_KEY</code>, then trigger a redeploy!
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              <Lock size={11} className="text-slate-400" />
              <span>Client-side secure SSL connection</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer"
              id="btn-close-supabase-modal-footer"
            >
              Back to App
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
