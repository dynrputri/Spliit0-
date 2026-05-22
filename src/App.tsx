import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Sun, 
  Moon, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Scale, 
  CheckCircle, 
  PieChart, 
  Sparkles, 
  ArrowUpRight, 
  UserPlus, 
  PiggyBank,
  FolderPlus,
  Compass,
  Users,
  LogOut,
  QrCode,
  Trash2,
  AlertTriangle,
  User,
  Database
} from 'lucide-react';
import { Member, Expense, Group, CategorySpec } from './types';
import { INITIAL_GROUPS, CATEGORIES } from './data/mockData';
import { calculateGroupStats } from './utils/stats';
import { calculateSettlements } from './utils/settlement';
import AddExpenseModal from './components/AddExpenseModal';
import CreateGroupModal from './components/CreateGroupModal';
import ExpenseFeed from './components/ExpenseFeed';
import MemberBalances, { AVATAR_COLORS } from './components/MemberBalances';
import SettlementEngine from './components/SettlementEngine';
import AuthScreen from './components/AuthScreen';
import PaymentSettingsModal from './components/PaymentSettingsModal';
import GroupInviteModal, { getGroupInviteCode } from './components/GroupInviteModal';
import JoinGroupModal from './components/JoinGroupModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import { isSupabaseConfigured } from './lib/supabaseClient';


export default function App() {
  // Authentication State
  const [user, setUser] = useState<{ email: string; fullName: string; avatarUrl?: string } | null>(() => {
    const saved = localStorage.getItem('spliit_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Multi-group Database State
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('spliit_groups_multi');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    const saved = localStorage.getItem('spliit_active_group_id');
    return saved || 'grp-ss15';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('spliit_theme');
    return saved === 'dark';
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isLeaveValidationOpen, setIsLeaveValidationOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem('spliit_groups_multi', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('spliit_active_group_id', activeGroupId);
  }, [activeGroupId]);

  useEffect(() => {
    localStorage.setItem('spliit_theme', darkMode ? 'dark' : 'light');
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Show status toasts
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Get active group data computed references
  const [isPaymentSettingsOpen, setIsPaymentSettingsOpen] = useState(false);
  const [youPaymentSettings, setYouPaymentSettings] = useState<{
    bankName: string;
    duitNowId: string;
    qrCodeDataUrl: string | null;
  }>(() => {
    const saved = localStorage.getItem('spliit_you_payments');
    if (saved) return JSON.parse(saved);
    return {
      bankName: 'Maybank',
      duitNowId: '+6012-3456789',
      qrCodeDataUrl: null
    };
  });

  // Sync payment settings with local storage
  useEffect(() => {
    localStorage.setItem('spliit_you_payments', JSON.stringify(youPaymentSettings));
  }, [youPaymentSettings]);

  // Compute whether there are groups left
  const hasGroups = groups.length > 0;
  const activeGroup = hasGroups 
    ? (groups.find(g => g.id === activeGroupId) || groups[0]) 
    : null;

  const members = activeGroup
    ? activeGroup.members.map(member => {
        if (member.id === 'you') {
          return {
            ...member,
            name: user ? user.fullName : member.name,
            avatarUrl: user?.avatarUrl,
            bankName: youPaymentSettings.bankName,
            duitNowId: youPaymentSettings.duitNowId,
            qrCodeDataUrl: youPaymentSettings.qrCodeDataUrl || undefined
          };
        } else {
          // Inferred default Malaysian bank for other preset mock group members
          let bankName = 'TNG eWallet';
          if (member.duitNowId?.includes('maybank')) bankName = 'Maybank';
          else if (member.duitNowId?.includes('cimb')) bankName = 'CIMB Bank';
          else if (member.duitNowId?.includes('public')) bankName = 'Public Bank';
          else if (member.id === 'ali') bankName = 'Maybank';
          else if (member.id === 'bala') bankName = 'CIMB Bank';
          else if (member.id === 'chong') bankName = 'TNG eWallet';

          return {
            ...member,
            bankName,
            duitNowId: member.duitNowId || '012-345 6789'
          };
        }
      })
    : [];

  const expenses = activeGroup ? activeGroup.expenses : [];

  // Handles adding an expense to the active group
  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    const newId = `exp-${Date.now()}`;
    const newExpense: Expense = {
      ...newExpenseData,
      id: newId
    };
    setGroups(prev => prev.map(g => {
      if (g.id === activeGroupId) {
        return {
          ...g,
          expenses: [newExpense, ...g.expenses]
        };
      }
      return g;
    }));
    triggerToast(`Added "${newExpenseData.title}" successfully!`);
  };

  // Handles updating/editing an existing expense in the active group
  const handleUpdateExpense = (updatedExpense: Expense) => {
    setGroups(prev => prev.map(g => {
      if (g.id === activeGroupId) {
        return {
          ...g,
          expenses: g.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
        };
      }
      return g;
    }));
    triggerToast(`Updated "${updatedExpense.title}" successfully!`);
    setExpenseToEdit(null);
  };

  // Handles deleting an expense from the active group - now triggers confirmation modal
  const handleDeleteExpense = (id: string) => {
    setExpenseToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  // Performs actual deletion on user confirmation
  const handleConfirmDeleteExpense = () => {
    if (!expenseToDeleteId) return;
    const id = expenseToDeleteId;
    setGroups(prev => prev.map(g => {
      if (g.id === activeGroupId) {
        const exp = g.expenses.find(e => e.id === id);
        if (exp) {
          triggerToast(`Removed expense "${exp.title}"`);
        }
        return {
          ...g,
          expenses: g.expenses.filter(e => e.id !== id)
        };
      }
      return g;
    }));
    setIsDeleteConfirmOpen(false);
    setExpenseToDeleteId(null);
  };

  // Handles adding a member to the active group
  const handleAddMember = (name: string) => {
    const colorIndex = members.length % AVATAR_COLORS.length;
    const colorClass = AVATAR_COLORS[colorIndex];
    const newMember: Member = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color: colorClass,
      duitNowId: Math.random() > 0.4 
        ? `01${Math.floor(Math.random() * 8 + 1)}-${Math.floor(Math.random() * 89999 + 10000)}` 
        : undefined
    };
    setGroups(prev => prev.map(g => {
      if (g.id === activeGroupId) {
        return {
          ...g,
          members: [...g.members, newMember]
        };
      }
      return g;
    }));
    triggerToast(`Added ${name} directly!`);
  };

  // Handles removing a member from the active group
  const handleRemoveMember = (id: string) => {
    // Check if they owe money or are owed overall in this group
    const balances: Record<string, number> = {};
    members.forEach(m => { balances[m.id] = 0; });
    expenses.forEach(expense => {
      if (balances[expense.paidBy] !== undefined) balances[expense.paidBy] += expense.amount;
      expense.splits.forEach(split => {
        if (balances[split.memberId] !== undefined) balances[split.memberId] -= split.amount;
      });
    });

    const bal = balances[id] || 0;
    if (Math.abs(bal) > 0.05) {
      triggerToast(`Cannot remove ${members.find(m => m.id === id)?.name || id} until they are settled (Balance: RM ${bal.toFixed(2)})`);
      return;
    }

    const memberName = members.find(m => m.id === id)?.name || id;
    setGroups(prev => prev.map(g => {
      if (g.id === activeGroupId) {
        return {
          ...g,
          members: g.members.filter(m => m.id !== id),
          expenses: g.expenses.map(exp => ({
            ...exp,
            splits: exp.splits.filter(s => s.memberId !== id)
          }))
        };
      }
      return g;
    }));
    triggerToast(`Removed member ${memberName}`);
  };

  // Safe manual transaction register settlements
  const handleSettleDebt = (fromId: string, toId: string, amount: number) => {
    const fromName = members.find(m => m.id === fromId)?.name || fromId;
    const toName = members.find(m => m.id === toId)?.name || toId;

    const newSettlementExpense: Expense = {
      id: `exp-settle-${Date.now()}`,
      title: `Settled RM ${amount.toFixed(2)} to ${toId === 'you' ? 'You' : toName.split(' ')[0]}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      category: 'other',
      paidBy: fromId,
      splitType: 'exact',
      splits: members.map(m => ({
        memberId: m.id,
        amount: m.id === toId ? amount : 0,
        value: m.id === toId ? amount : 0
      }))
    };

    setGroups(prev => prev.map(g => {
      if (g.id === activeGroupId) {
        return {
          ...g,
          expenses: [newSettlementExpense, ...g.expenses]
        };
      }
      return g;
    }));
    triggerToast(`Debt settled: ${fromName.split(' ')[0]} paid ${toName.split(' ')[0]} RM ${amount.toFixed(2)}`);
  };

  // Creates a new group & Switches focus on completion
  const handleCreateGroup = (newGroupData: { name: string; description: string; icon: string; initialMemberNames: string[] }) => {
    const newId = `grp-${Date.now()}`;
    const newMembers: Member[] = [
      { id: 'you', name: 'You', color: 'bg-teal-600 text-white', duitNowId: '+6012-3456789' }
    ];

    newGroupData.initialMemberNames.forEach((name, idx) => {
      const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
      newMembers.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        color: colorClass,
        duitNowId: Math.random() > 0.4 
          ? `01${Math.floor(Math.random() * 8 + 1)}-${Math.floor(Math.random() * 89999 + 10000)}` 
          : `duitnow@maybank`
      });
    });

    const newGroup: Group = {
      id: newId,
      name: `${newGroupData.name} ${newGroupData.icon}`,
      description: newGroupData.description,
      icon: newGroupData.icon,
      members: newMembers,
      expenses: []
    };

    setGroups(prev => [newGroup, ...prev]);
    setActiveGroupId(newId);
    triggerToast(`Created group "${newGroupData.name}"!`);
  };

  // Leave Group helper validations & confirmation updates
  const handleLeaveGroupClick = () => {
    if (!activeGroup) return;

    // Critical Business Rule: Check current net standing in this specific group only.
    // If balance is NOT zero (RM 0.00), prevent them from leaving.
    // We treat values between -0.01 and 0.01 as zero to avoid floating point issues.
    const isSettled = Math.abs(stats.netBalance) < 0.01;

    if (!isSettled) {
      setIsLeaveValidationOpen(true);
    } else {
      setIsLeaveConfirmOpen(true);
    }
  };

  const handleConfirmLeaveGroup = () => {
    if (!activeGroup) return;

    const targetGroupId = activeGroupId;
    const targetGroupName = activeGroup.name;

    // Remove the current user's ID/Profile from that group's participant list
    // Save updated state so the change persists on reload
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(g => {
        if (g.id === targetGroupId) {
          return {
            ...g,
            members: g.members.filter(m => m.id !== 'you')
          };
        }
        return g;
      });

      // Filter out any groups where the user 'you' is no longer a member
      const groupsSelfRemaining = updatedGroups.filter(g => g.members.some(m => m.id === 'you'));

      // Automatically redirect the user back to their first available group, or display empty landing if none
      if (groupsSelfRemaining.length > 0) {
        setActiveGroupId(groupsSelfRemaining[0].id);
      } else {
        setActiveGroupId('');
      }

      return groupsSelfRemaining;
    });

    triggerToast(`Left group "${targetGroupName}" successfully!`);
    setIsLeaveConfirmOpen(false);
  };

  // Performs actual logout on user confirmation
  const handleConfirmLogout = () => {
    setUser(null);
    localStorage.removeItem('spliit_auth_user');
    triggerToast('Logged out successfully');
    setIsLogoutConfirmOpen(false);
  };

  // Performs actual account profile updates
  const handleUpdateAccount = (updatedUser: { fullName: string; avatarUrl?: string }) => {
    if (!user) return;
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('spliit_auth_user', JSON.stringify(newUser));
  };

  // Join a group with a 6-digit invite code
  const handleJoinGroup = (code: string) => {
    const uppercaseCode = code.toUpperCase().replace(/\s+/g, '');
    
    // 1. Look for a group in our active list that matches this code
    const matchingActiveGroup = groups.find(g => {
      const groupCode = getGroupInviteCode(g).toUpperCase().replace(/\s+/g, '');
      return groupCode === uppercaseCode;
    });

    if (matchingActiveGroup) {
      setActiveGroupId(matchingActiveGroup.id);
      triggerToast(`Switched to active group "${matchingActiveGroup.name}"!`);
      return;
    }

    // 2. Specific mock test code "ROOM3A" -> "Apartment 3A Roomies"
    if (uppercaseCode === 'ROOM3A') {
      const apartment3aId = 'grp-apartment-3a';
      const apartmentExists = groups.some(g => g.id === apartment3aId);
      
      if (apartmentExists) {
        setActiveGroupId(apartment3aId);
        triggerToast('Switched to "Apartment 3A Roomies"!');
        return;
      }

      const mockApartmentGroup: Group = {
        id: apartment3aId,
        name: 'Apartment 3A Roomies 🏢',
        description: 'Shared house rental bills, Astro Tv, and cleaning items.',
        icon: '🏢',
        members: [
          { id: 'you', name: 'You', color: 'bg-teal-600 text-white', duitNowId: '+6012-3456789' },
          { id: 'daniel', name: 'Daniel Tan', color: 'bg-indigo-500 text-white', duitNowId: 'daniel@maybank' },
          { id: 'siti', name: 'Siti Aminah', color: 'bg-purple-500 text-white', duitNowId: 'siti@cimb' },
          { id: 'raj', name: 'Raj Kumar', color: 'bg-rose-500 text-white', duitNowId: 'raj@public' }
        ],
        expenses: [
          {
            id: 'exp-apt-1',
            title: 'May House Rent 🏠',
            amount: 1800.00,
            date: '2026-05-01',
            category: 'housing',
            paidBy: 'daniel',
            splitType: 'equal',
            splits: [
              { memberId: 'you', amount: 450.00 },
              { memberId: 'daniel', amount: 450.00 },
              { memberId: 'siti', amount: 450.00 },
              { memberId: 'raj', amount: 450.00 }
            ]
          },
          {
            id: 'exp-apt-2',
            title: 'Mamak Friday Roti Supper',
            amount: 48.00,
            date: '2026-05-15',
            category: 'food',
            paidBy: 'you',
            splitType: 'equal',
            splits: [
              { memberId: 'you', amount: 12.00 },
              { memberId: 'daniel', amount: 12.00 },
              { memberId: 'siti', amount: 12.00 },
              { memberId: 'raj', amount: 12.00 }
            ]
          }
        ]
      };

      setGroups(prev => [mockApartmentGroup, ...prev]);
      setActiveGroupId(apartment3aId);
      triggerToast('Joined "Apartment 3A Roomies 🏢" via code ROOM3A!');
      return;
    }

    // 3. For any other code, synthesize a gorgeous realistic group
    const formattedCode = `${uppercaseCode.slice(0, 3)} ${uppercaseCode.slice(3, 6)}`;
    const customGroup: Group = {
      id: `grp-code-${uppercaseCode.toLowerCase()}`,
      name: `Roomies Space ${uppercaseCode} 🚪`,
      description: `Instantly created and synchronized via invite code ${formattedCode}.`,
      icon: '🚪',
      members: [
        { id: 'you', name: 'You', color: 'bg-teal-600 text-white', duitNowId: '+6012-3456789' },
        { id: 'ali', name: 'Ali', color: 'bg-indigo-500 text-white', duitNowId: 'ali@maybank' },
        { id: 'sarah', name: 'Sarah', color: 'bg-purple-500 text-white', duitNowId: 'sarah@public' }
      ],
      expenses: []
    };

    setGroups(prev => [customGroup, ...prev]);
    setActiveGroupId(customGroup.id);
    triggerToast(`Joined "Roomies Space ${uppercaseCode}" via code!`);
  };

  // Render registration authentication landing if not logged in
  if (!user) {
    return (
      <>
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold"
            >
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AuthScreen onLogin={setUser} triggerToast={triggerToast} />
      </>
    );
  }

  // Active statistics
  const stats = calculateGroupStats(members, expenses);
  const totalSettles = calculateSettlements(members, expenses).length;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 pb-16" id="spliit-app-root">
      
      {/* Dynamic Toast banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 dark:bg-white dark:border-white text-white dark:text-slate-950 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold"
            id="toast-notification"
          >
            <Sparkles size={14} className="text-emerald-400 dark:text-indigo-600 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 border-b border-slate-200/50 dark:border-slate-850">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-black text-white tracking-widest text-lg shadow-md shadow-indigo-100 dark:shadow-none">
              S
            </span>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white uppercase">Spliit</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Account Settings button */}
            <button
              onClick={() => setIsAccountSettingsOpen(true)}
              className="p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold flex items-center gap-1.5 text-xs cursor-pointer"
              title="Edit Profile Settings (Name & Profile Picture)"
              id="btn-trigger-account-settings"
            >
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.fullName} 
                  className="w-5 h-5 rounded-md object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-5 h-5 rounded-md bg-teal-600 text-white font-black text-[9px] flex items-center justify-center">
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </span>
              )}
              <span className="hidden md:inline text-slate-700 dark:text-slate-300">My Profile</span>
            </button>

            {/* Payment Settings button */}
            <button
              onClick={() => setIsPaymentSettingsOpen(true)}
              className="p-2 px-3 rounded-xl border border-emerald-500/10 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-990/30 transition-all font-semibold flex items-center gap-1.5 text-xs cursor-pointer"
              title="Malaysian Payment Details & QR Settings"
              id="btn-trigger-payment-settings"
            >
              <QrCode size={14} className="text-emerald-500 animate-pulse" />
              <span className="hidden md:inline">QR Pay Settings</span>
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-805 border border-slate-200/60 dark:border-slate-750 text-slate-606 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Toggle theme mode"
              id="btn-toggle-theme"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Logout button */}
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 hover:text-rose-600 transition cursor-pointer"
              title="Sign Out"
              id="btn-logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Grid Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-7">
        
        {/* Simple Welcome Greeting Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.fullName} 
                className="w-11 h-11 rounded-2xl object-cover ring-4 ring-indigo-500/15"
                referrerPolicy="no-referrer"
                id="welcome-user-avatar"
              />
            ) : (
              <span className="w-11 h-11 rounded-2xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md animate-none" id="welcome-user-initials">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs text-slate-850 dark:text-white font-bold flex items-center gap-1">
                <span>Welcome back,</span>
                <strong className="text-slate-950 dark:text-white font-black">{user.fullName}</strong>
                <span className="text-amber-500">✨</span>
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate leading-tight">
                Active cashout account: <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{youPaymentSettings.bankName} ({youPaymentSettings.duitNowId})</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 font-bold self-end md:self-auto">
            <button
              onClick={() => setIsAccountSettingsOpen(true)}
              className="flex-1 md:flex-none px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/45 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 rounded-xl text-xs transition border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900 flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn-edit-account-welcome"
            >
              <User size={12} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setIsPaymentSettingsOpen(true)}
              className="flex-1 md:flex-none px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/45 text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 rounded-xl text-xs transition border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900 flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn-modify-qr-welcome"
            >
              <QrCode size={12} className="text-emerald-500 animate-pulse" />
              <span>Modify QR Pay</span>
            </button>
          </div>
        </div>


        {!hasGroups ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-3xl p-8 sm:p-12 shadow-sm text-center max-w-lg mx-auto space-y-6 flex flex-col items-center justify-center relative overflow-hidden" id="no-groups-landing-panel">
            <span className="text-4xl">🚪</span>
            <div className="space-y-2">
              <h3 className="text-base font-bold bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">No active bill pools</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                You are currently not a member of any shared expense groups. Create a fresh group or join an existing roomies pool using a 6-digit invite code below!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3.5 w-full">
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-2xl cursor-pointer transition shadow-sm flex items-center justify-center gap-1.5"
                id="btn-landing-create"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Create a Group</span>
              </button>
              <button
                onClick={() => setIsJoinGroupOpen(true)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-2xl cursor-pointer transition shadow-sm flex items-center justify-center gap-1.5"
                id="btn-landing-join"
              >
                <span>🚪 Join with Code</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            
            {/* LEFT COLUMN: Groups selection sidebar */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Compass size={14} className="text-indigo-500" />
                  Your Groups ({groups.length})
                </h3>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsCreateGroupOpen(true)}
                    className="text-xs font-black text-emerald-605 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    id="btn-trigger-add-group"
                  >
                    <Plus size={11} className="stroke-[3]" />
                    <span>Create</span>
                  </button>
                  <span className="text-slate-200 dark:text-slate-800 text-[10px]">|</span>
                  <button
                    onClick={() => setIsJoinGroupOpen(true)}
                    className="text-xs font-black text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    id="btn-trigger-join-group"
                  >
                    <span>🚪 Join</span>
                  </button>
                </div>
              </div>

              {/* Group buttons ribbon */}
              <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-visible pb-1.5 lg:pb-0 snap-x scrollbar-none">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setActiveGroupId(g.id);
                      triggerToast(`Switched back to: ${g.name}`);
                    }}
                    className={`shrink-0 lg:shrink text-left p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-xs border relative snap-start w-[210px] lg:w-full ${
                      activeGroupId === g.id
                        ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-800 dark:border-slate-705 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-850/20 border-transparent'
                    }`}
                    id={`btn-group-row-${g.id}`}
                  >
                    <span className="text-2xl shrink-0 p-1 bg-white/10 dark:bg-slate-900/45 rounded-md">{g.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold truncate">{g.name}</h4>
                      <p className={`text-[10px] truncate mt-0.5 ${activeGroupId === g.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {g.description}
                      </p>
                    </div>
                    {activeGroupId === g.id && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-lg" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* MAIN DASHBOARD BLOCK COLUMN */}
          <div className="lg:col-span-9 space-y-7">
            
            {/* Active Group Hero Header with Invite button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-3xl p-5 shadow-xs" id="active-group-header-panel">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl p-2 bg-slate-50 dark:bg-slate-805 rounded-2xl shrink-0 shadow-sm">{activeGroup.icon}</span>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">
                    Active Expense Group
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {activeGroup.name}
                  </h2>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none shrink-0"
                  id="btn-active-group-invite"
                >
                  <UserPlus size={14} className="stroke-[2.5]" />
                  <span>Invite Friends</span>
                </button>
                <button
                  type="button"
                  onClick={handleLeaveGroupClick}
                  className="px-3 py-2.5 hover:bg-rose-50 hover:text-red-500 dark:hover:bg-rose-950/20 dark:hover:text-red-400 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border border-slate-100 hover:border-red-150 dark:border-slate-800 dark:hover:border-slate-700"
                  id="btn-active-group-leave"
                  title="Leave this group"
                >
                  <LogOut size={13} className="stroke-[2.5]" />
                  <span>Leave Group</span>
                </button>
              </div>
            </div>
            
            {/* UPPER BANNER / HERO PANEL: Dynamic Balance overview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              
              {/* Owed/Owe Net Balance Card */}
              <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 p-6 rounded-3xl flex flex-col justify-between shadow-xs relative overflow-hidden" id="hero-balance-card">
                {/* Subtle glow circles */}
                <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl opacity-20 ${
                  stats.netBalance > 0.01 
                    ? 'bg-emerald-500' 
                    : stats.netBalance < -0.01 
                    ? 'bg-rose-500' 
                    : 'bg-indigo-505'
                }`} />

                <div className="space-y-1 relative z-10">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Scale size={13} className="text-indigo-400 animate-pulse" />
                    Our Balance in Group
                  </span>
                  
                  <div className="pt-2">
                    <AnimatePresence mode="wait">
                      {stats.netBalance > 0.01 ? (
                        <motion.div
                          key="owed"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-1"
                        >
                          <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                            +RM {stats.netBalance.toFixed(2)}
                          </h2>
                          <p className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
                            <TrendingUp size={13} />
                            You are owed overall by this group
                          </p>
                        </motion.div>
                      ) : stats.netBalance < -0.01 ? (
                        <motion.div
                          key="owe"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-1"
                        >
                          <h2 className="text-3xl sm:text-4xl font-extrabold text-rose-500 dark:text-red-400 tracking-tight font-mono">
                            -RM {Math.abs(stats.netBalance).toFixed(2)}
                          </h2>
                          <p className="text-[11px] font-semibold text-rose-550 dark:text-rose-400 flex items-center gap-1">
                            <TrendingDown size={13} />
                            You owe outstanding debts
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="settled"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-1"
                        >
                          <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-450 tracking-tight font-mono">
                            RM 0.00
                          </h2>
                          <p className="text-[11px] font-semibold text-indigo-550 dark:text-indigo-400 flex items-center gap-1">
                            <CheckCircle size={13} />
                            You are fully settled here!
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Quick Action Add Expense triggers */}
                <div className="mt-8 relative z-10 flex gap-2">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 dark:hover:shadow-none hover:scale-[1.01] active:scale-[0.99] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-semibold"
                    id="btn-hero-add-expense"
                  >
                    <Plus size={16} className="stroke-[3]" />
                    Add Expense
                  </button>
                </div>
              </div>

              {/* Metric breakdowns column */}
              <div className="md:col-span-7 grid grid-cols-3 gap-2.5 sm:gap-4 items-stretch font-semibold">
                {/* Total Spent */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 truncate">
                      <PiggyBank size={11} className="shrink-0" />
                      <span className="truncate">Spent</span>
                    </span>
                    <h3 className="text-xs sm:text-sm md:text-lg font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-1.5 font-mono truncate">
                      RM {stats.totalGroupSpent.toFixed(0)}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 leading-relaxed hidden md:block">
                    Total amount spent in active group splits.
                  </p>
                </div>

                {/* Your paid contribution */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 truncate">
                      <ArrowUpRight size={11} className="text-emerald-500 shrink-0" />
                      <span className="truncate">Paid</span>
                    </span>
                    <h3 className="text-xs sm:text-sm md:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1.5 font-mono truncate">
                      RM {stats.yourPaidAmount.toFixed(0)}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 leading-relaxed hidden md:block">
                    Personal out-of-pocket payments made by you.
                  </p>
                </div>

                {/* Your calculated individual share */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[8px] sm:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1 truncate">
                      <Scale size={11} className="text-indigo-400 shrink-0" />
                      <span className="truncate">Share</span>
                    </span>
                    <h3 className="text-xs sm:text-sm md:text-lg font-bold text-slate-855 dark:text-slate-350 mt-0.5 sm:mt-1.5 font-mono truncate">
                      RM {stats.yourActualShare.toFixed(0)}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 leading-relaxed hidden md:block">
                    Your personal footprint consumed here.
                  </p>
                </div>
              </div>

            </div>

            {/* LOWER DIVISION / TWO COLUMNS INTERACTIVE AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              
              {/* LEFT AREA: Chronological Activity and category breakdowns */}
              <div className="lg:col-span-7 space-y-7">
                {/* Expense activity feed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                        <Scale size={15} className="text-indigo-500" />
                        Transactions Feed
                      </h3>
                      <p className="text-[11px] text-slate-405 mt-0.5">Chronological record of expenditure</p>
                    </div>

                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      Showing {expenses.length} splits
                    </div>
                  </div>

                  <ExpenseFeed 
                    expenses={expenses}
                    members={members}
                    onDeleteExpense={handleDeleteExpense}
                    onEditExpense={(expense) => {
                      setExpenseToEdit(expense);
                      setIsAddModalOpen(true);
                    }}
                  />
                </div>
              </div>

              {/* RIGHT AREA: Member list, optimal engine, dynamic visualizers */}
              <div className="lg:col-span-5 space-y-7">
                
                {/* Group balances & edit roster */}
                <MemberBalances 
                  members={members}
                  expenses={expenses}
                  onAddMember={handleAddMember}
                  onRemoveMember={handleRemoveMember}
                  onTriggerInvite={() => setIsInviteModalOpen(true)}
                />

                {/* Smart optimal settlement computation math recommended engine */}
                <SettlementEngine 
                  members={members}
                  expenses={expenses}
                  onSettleDebt={handleSettleDebt}
                  triggerToast={triggerToast}
                />

                {/* Category consumption distribution */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 p-5 rounded-2xl shadow-xs space-y-4" id="category-report-panel">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <PieChart size={15} className="text-violet-500" />
                      Category Footprint
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Weighted distribution of spent allocations</p>
                  </div>

                  {expenses.length === 0 ? (
                    <div className="text-center py-5 text-[11px] text-slate-400 font-semibold italic">
                      No transactions recorded yet in this pool.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {Object.entries(CATEGORIES).map(([key, spec]) => {
                        const amount = stats.categoryShares[key] || 0;
                        const pct = stats.totalGroupSpent > 0 ? (amount / stats.totalGroupSpent) * 100 : 0;
                        
                        return (
                          <div key={key} className="space-y-1.5" id={`category-progress-${key}`}>
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-350">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">{spec.icon}</span>
                                <span>{spec.name}</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-slate-900 dark:text-slate-200">
                                <span>RM {amount.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400 font-bold">({pct.toFixed(0)}%)</span>
                              </div>
                            </div>

                            {/* Progress Bar background channel */}
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-emerald-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      </main>

      {/* Add expense modal form render */}
      <AddExpenseModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setExpenseToEdit(null);
        }}
        members={members}
        onAddExpense={handleAddExpense}
        expenseToEdit={expenseToEdit}
        onUpdateExpense={handleUpdateExpense}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      {/* Group Invite System Modal */}
      <GroupInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        group={activeGroup || INITIAL_GROUPS[0]}
        triggerToast={triggerToast}
      />

      {/* Join Group with Code Modal */}
      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
        onJoinGroup={handleJoinGroup}
        triggerToast={triggerToast}
      />

      {/* Malaysian DuitNow / QR payment profile configuration */}
      <PaymentSettingsModal
        isOpen={isPaymentSettingsOpen}
        onClose={() => setIsPaymentSettingsOpen(false)}
        currentSettings={youPaymentSettings}
        onSave={setYouPaymentSettings}
        triggerToast={triggerToast}
      />

      {/* Leave Group Validation Error Modal */}
      <AnimatePresence>
        {isLeaveValidationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLeaveValidationOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              id="leave-validation-backdrop"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 p-6 space-y-4"
              id="leave-validation-modal"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
                  <Scale size={20} className="animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Settlement Required</h3>
                  <p className="text-[10px] text-slate-400">Balance must be settled before leaving</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                <p>
                  You cannot leave <strong className="text-slate-800 dark:text-white">"{activeGroup?.name}"</strong> yet because your active net standing is not fully settled.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center font-mono">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Your Balance:</span>
                  <span className={`font-bold text-xs ${stats.netBalance > 0.01 ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}`}>
                    RM {stats.netBalance.toFixed(2)}
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  {stats.netBalance > 0.01 
                    ? "Other group members still owe you money. Please use the settlements helper to receive payouts before exiting."
                    : "You still owe money to other members in this group. Please reimburse them and log the settlement to clear your account."
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLeaveValidationOpen(false)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold text-xs rounded-xl active:scale-95 transition cursor-pointer"
                id="btn-leave-validation-close"
              >
                Understood, Settle First
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leave Group Confirmation Modal */}
      <AnimatePresence>
        {isLeaveConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLeaveConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              id="leave-confirm-backdrop"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 p-6 space-y-4"
              id="leave-confirm-modal"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <span className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                  <LogOut size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave Group?</h3>
                  <p className="text-[10px] text-rose-500">Destructive operation</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to leave <strong className="text-slate-800 dark:text-white">"{activeGroup?.name}"</strong>? You will lose access to the expense history and settlements for this group.
              </p>

              <div className="flex gap-2.5 pt-1 font-semibold">
                <button
                  type="button"
                  onClick={() => setIsLeaveConfirmOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  id="btn-leave-confirm-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLeaveGroup}
                  className="flex-[1.5] py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl active:scale-95 transition shadow-sm cursor-pointer"
                  id="btn-confirm-leave-group"
                >
                  Yes, Leave Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Expense Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setExpenseToDeleteId(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              id="delete-confirm-backdrop"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 p-6 space-y-4"
              id="delete-confirm-modal"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <span className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                  <Trash2 size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Expense?</h3>
                  <p className="text-[10px] text-rose-500 font-semibold">Keep split accounts tidy</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete the expense <strong className="text-slate-800 dark:text-white">"{activeGroup?.expenses.find(e => e.id === expenseToDeleteId)?.title || 'this expense'}"</strong>? This will permanently remove its record and re-calculate all participants' outstanding balances.
              </p>

              <div className="flex gap-2.5 pt-1 font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setExpenseToDeleteId(null);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  id="btn-delete-confirm-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteExpense}
                  className="flex-[1.5] py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl active:scale-95 transition shadow-sm cursor-pointer"
                  id="btn-confirm-delete-expense"
                >
                  Yes, Delete Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              id="logout-confirm-backdrop"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 p-6 space-y-4"
              id="logout-confirm-modal"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sign Out?</h3>
                  <p className="text-[10px] text-amber-500 font-semibold">Exit modern workspace</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to log out? Your group information details and custom pay presets will remain cached safely on this local device.
              </p>

              <div className="flex gap-2.5 pt-1 font-semibold">
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  id="btn-logout-confirm-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="flex-[1.5] py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl active:scale-95 transition shadow-sm cursor-pointer"
                  id="btn-confirm-logout"
                >
                  Yes, Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AccountSettingsModal 
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        user={user}
        onUpdateAccount={handleUpdateAccount}
      />
    </div>
  );
}
