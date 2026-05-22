import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, DollarSign, Tag, User, Percent, Clipboard, CheckCircle2, AlertCircle, Camera, Loader2, Sparkles, Plus, Trash2, Upload, FileText } from 'lucide-react';
import { Member, Expense, SplitType, Split } from '../types';
import { CATEGORIES } from '../data/mockData';
import Avatar from './Avatar';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  expenseToEdit?: Expense | null;
  onUpdateExpense?: (expense: Expense) => void;
}

const DUMMY_SCANS = [
  { title: "Village Park Nasi Lemak 🍛", amount: "65.40", category: "food", receiptUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=80" },
  { title: "Shell Ron95 Fuel 🚗", amount: "124.50", category: "transport", receiptUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80" },
  { title: "SS15 Bubble Milk Tea 🧋", amount: "42.05", category: "food", receiptUrl: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=400&q=80" },
  { title: "Unifi Gigabit Broadband 🏠", amount: "159.00", category: "housing", receiptUrl: "" },
  { title: "TGV Cinemas Movie & Popcorn 🍿", amount: "84.00", category: "entertainment", receiptUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80" },
  { title: "Mydin Store Groceries 🧼", amount: "112.50", category: "other", receiptUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80" }
];

export default function AddExpenseModal({ isOpen, onClose, members, onAddExpense, expenseToEdit = null, onUpdateExpense }: AddExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState('you');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  
  // Custom split values per member
  // For 'exact': stores exact amount string
  // For 'percentage': stores percentage string
  // For 'equal': stores boolean string indicating participation (e.g., 'true', 'false')
  const [splitInputs, setSplitInputs] = useState<Record<string, string>>({});
  
  // Track checking/unchecking members for the 'equal' split mode
  const [participatingMembers, setParticipatingMembers] = useState<Record<string, boolean>>({});

  // Itemized split state variables
  interface ItemizedItem {
    id: string;
    name: string;
    price: number;
    assignedMemberIds: string[];
  }
  const [itemizedItems, setItemizedItems] = useState<ItemizedItem[]>([]);
  const [isBillUploading, setIsBillUploading] = useState(false);
  const [serviceChargeActive, setServiceChargeActive] = useState(true);
  const [sstActive, setSstActive] = useState(true);
  const [customServiceChargeRate, setCustomServiceChargeRate] = useState<number>(10);
  const [customSstRate, setCustomSstRate] = useState<number>(6);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // When modal is opened/members change, reset the split input setups
  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setTitle(expenseToEdit.title);
        setAmountStr(expenseToEdit.amount.toString());
        setDate(expenseToEdit.date);
        setCategory(expenseToEdit.category);
        setPaidBy(expenseToEdit.paidBy);
        setSplitType(expenseToEdit.splitType);
        setReceiptUrl(expenseToEdit.receiptUrl);
        setIsScanning(false);

        // Load split inputs and participation states depending on split type
        const pMembers: Record<string, boolean> = {};
        const inputs: Record<string, string> = {};

        members.forEach(m => {
          const split = expenseToEdit.splits?.find(s => s.memberId === m.id);
          pMembers[m.id] = split ? split.amount > 0 : false;
          
          if (expenseToEdit.splitType === 'exact') {
            inputs[m.id] = split ? (split.value !== undefined ? split.value.toString() : split.amount.toString()) : '';
          } else if (expenseToEdit.splitType === 'percentage') {
            inputs[m.id] = split ? (split.value !== undefined ? split.value.toString() : '') : '';
          } else {
            inputs[m.id] = '';
          }
        });

        // Fallback for partition: if no splits are active, make everyone active
        const hasActivePartObj = Object.values(pMembers).some(Boolean);
        if (!hasActivePartObj) {
          members.forEach(m => {
            pMembers[m.id] = true;
          });
        }

        setParticipatingMembers(pMembers);
        setSplitInputs(inputs);

        // Itemized states loaded safely
        if (expenseToEdit.splitType === 'itemized' && expenseToEdit.itemizedItems) {
          setItemizedItems(expenseToEdit.itemizedItems);
          setServiceChargeActive(expenseToEdit.serviceChargeActive ?? true);
          setSstActive(expenseToEdit.sstActive ?? true);
          setCustomServiceChargeRate(expenseToEdit.customServiceChargeRate ?? 10);
          setCustomSstRate(expenseToEdit.customSstRate ?? 6);
        } else {
          setItemizedItems([]);
          setServiceChargeActive(true);
          setSstActive(true);
          setCustomServiceChargeRate(10);
          setCustomSstRate(6);
        }

        setNewItemName('');
        setNewItemPrice('');
        setDragActive(false);

      } else {
        // DEFAULT/ADD MODE RESET
        const initialPart: Record<string, boolean> = {};
        const initialInputs: Record<string, string> = {};
        
        members.forEach(m => {
          initialPart[m.id] = true;
          initialInputs[m.id] = '';
        });
        
        setParticipatingMembers(initialPart);
        setSplitInputs(initialInputs);
        
        setTitle('');
        setAmountStr('');
        setCategory('food');
        setPaidBy('you');
        setSplitType('equal');
        setReceiptUrl(undefined);
        setIsScanning(false);
        setDate(new Date().toISOString().split('T')[0]);

        // Reset itemized states
        setItemizedItems([]);
        setIsBillUploading(false);
        setServiceChargeActive(true);
        setSstActive(true);
        setCustomServiceChargeRate(10);
        setCustomSstRate(6);
        setNewItemName('');
        setNewItemPrice('');
        setDragActive(false);
      }
    }
  }, [isOpen, members, expenseToEdit]);

  // Calculations for Itemized Split
  const itemizedSubtotal = itemizedItems.reduce((sum, item) => sum + item.price, 0);

  const calculatedServiceCharge = serviceChargeActive 
    ? Math.round(itemizedSubtotal * (customServiceChargeRate / 100) * 100) / 100 
    : 0;

  const calculatedSst = sstActive 
    ? Math.round(itemizedSubtotal * (customSstRate / 100) * 100) / 100 
    : 0;

  const itemizedTotalAmount = Math.round((itemizedSubtotal + calculatedServiceCharge + calculatedSst) * 100) / 100;

  // Recalculate automatic default inputs if amount changes
  const rawParsedAmount = parseFloat(amountStr) || 0;
  const parsedAmount = splitType === 'itemized' ? itemizedTotalAmount : rawParsedAmount;

  // Let's analyze split validity
  const getSplitValidation = () => {
    if (splitType === 'itemized') {
      if (itemizedItems.length === 0) {
        return { isValid: false, message: 'Please upload a receipt or add items' };
      }
      return { isValid: true, message: `Itemized balance calculated! Total: RM ${itemizedTotalAmount.toFixed(2)}` };
    }

    if (parsedAmount <= 0) {
      return { isValid: false, message: 'Please enter a valid amount' };
    }

    if (splitType === 'equal') {
      const activeCount = Object.values(participatingMembers).filter(Boolean).length;
      if (activeCount === 0) {
        return { isValid: false, message: 'Select at least one member to split with' };
      }
      return { isValid: true, message: 'Splitting equally' };
    }

    if (splitType === 'exact') {
      let sum = 0;
      members.forEach(m => {
        sum += parseFloat(splitInputs[m.id]) || 0;
      });
      // round to 2 decimals to match
      const roundedSum = Math.round(sum * 100) / 100;
      const roundedTotal = Math.round(parsedAmount * 100) / 100;
      const diff = roundedTotal - roundedSum;

      if (Math.abs(diff) > 0.01) {
        return { 
          isValid: false, 
          message: diff > 0 
            ? `Under-split: RM ${diff.toFixed(2)} left to allocate` 
            : `Over-split: Allocated RM ${Math.abs(diff).toFixed(2)} too much` 
        };
      }
      return { isValid: true, message: 'Exact splits balance successfully!' };
    }

    if (splitType === 'percentage') {
      let percentSum = 0;
      members.forEach(m => {
        percentSum += parseFloat(splitInputs[m.id]) || 0;
      });
      const roundedPercent = Math.round(percentSum * 100) / 100;
      const diff = 100 - roundedPercent;

      if (Math.abs(diff) > 0.01) {
        return { 
          isValid: false, 
          message: diff > 0 
            ? `Needs ${diff.toFixed(1)}% more to reach 100%` 
            : `Over 100% by ${Math.abs(diff).toFixed(1)}%` 
        };
      }
      return { isValid: true, message: 'Percentage splits total 100%!' };
    }

    return { isValid: false, message: 'Configuration error' };
  };

  const validation = getSplitValidation();

  // Populate equal values for display or initialization
  const handleSplitTypeChange = (type: SplitType) => {
    setSplitType(type);
    const newInputs: Record<string, string> = {};
    if (type === 'percentage') {
      // Split percentage equally
      const share = (100 / members.length).toFixed(1);
      members.forEach(m => {
        newInputs[m.id] = share;
      });
    } else if (type === 'exact') {
      // Split amount equally
      const share = (parsedAmount / members.length).toFixed(2);
      members.forEach(m => {
        newInputs[m.id] = parsedAmount > 0 ? share : '';
      });
    }
    setSplitInputs(newInputs);
  };

  const handleInputChange = (memberId: string, val: string) => {
    setSplitInputs(prev => ({
      ...prev,
      [memberId]: val
    }));
  };

  const toggleParticipation = (memberId: string) => {
    setParticipatingMembers(prev => {
      const updated = { ...prev, [memberId]: !prev[memberId] };
      // Count active
      const activeCount = Object.values(updated).filter(Boolean).length;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || parsedAmount <= 0 || !validation.isValid) return;

    let finalSplits: Split[] = [];

    if (splitType === 'equal') {
      const activeMembers = members.filter(m => participatingMembers[m.id]);
      const baseShare = Math.floor((parsedAmount / activeMembers.length) * 100) / 100;
      let remainingPennies = Math.round((parsedAmount - (baseShare * activeMembers.length)) * 100) / 100;

      members.forEach((m) => {
        if (participatingMembers[m.id]) {
          let memberShare = baseShare;
          if (remainingPennies > 0.005) {
            memberShare += 0.01;
            remainingPennies -= 0.01;
          }
          finalSplits.push({ memberId: m.id, amount: Math.round(memberShare * 100) / 100 });
        } else {
          finalSplits.push({ memberId: m.id, amount: 0 });
        }
      });
    } else if (splitType === 'exact') {
      members.forEach((m) => {
        const val = parseFloat(splitInputs[m.id]) || 0;
        finalSplits.push({ memberId: m.id, amount: val, value: val });
      });
    } else if (splitType === 'percentage') {
      members.forEach((m) => {
        const percent = parseFloat(splitInputs[m.id]) || 0;
        const calcAmt = Math.round((parsedAmount * (percent / 100)) * 100) / 100;
        finalSplits.push({ memberId: m.id, amount: calcAmt, value: percent });
      });
    } else if (splitType === 'itemized') {
      // 1. Calculate each member's base sum of order
      const memberBaseSums: Record<string, number> = {};
      members.forEach(m => {
        memberBaseSums[m.id] = 0;
      });

      itemizedItems.forEach(item => {
        if (item.assignedMemberIds.length > 0) {
          const splitPrice = item.price / item.assignedMemberIds.length;
          item.assignedMemberIds.forEach(mId => {
            if (memberBaseSums[mId] !== undefined) {
              memberBaseSums[mId] += splitPrice;
            }
          });
        } else {
          // If no one is assigned, split equally among all members by default to prevent loss
          const splitPrice = item.price / members.length;
          members.forEach(m => {
            memberBaseSums[m.id] += splitPrice;
          });
        }
      });

      // 2. Proportionately distribute fees (service charge + sst)
      const totalFees = calculatedServiceCharge + calculatedSst;
      
      members.forEach(m => {
        const baseShare = memberBaseSums[m.id];
        let totalMemberShare = baseShare;
        if (itemizedSubtotal > 0) {
          const proportion = baseShare / itemizedSubtotal;
          totalMemberShare += proportion * totalFees;
        }
        finalSplits.push({
          memberId: m.id,
          amount: Math.round(totalMemberShare * 100) / 100,
          value: Math.round(baseShare * 100) / 100
        });
      });
      
      // Penny-balancing pass
      const splitsSum = finalSplits.reduce((sum, s) => sum + s.amount, 0);
      const diff = Math.round((itemizedTotalAmount - splitsSum) * 100) / 100;
      if (Math.abs(diff) > 0.005 && finalSplits.length > 0) {
        const maxSplit = finalSplits.reduce((max, s) => s.amount > max.amount ? s : max, finalSplits[0]);
        maxSplit.amount = Math.round((maxSplit.amount + diff) * 100) / 100;
      }
    }

    const finalExpenseData = {
      title: title.trim(),
      amount: parsedAmount,
      date,
      category,
      paidBy,
      splitType,
      splits: finalSplits,
      receiptUrl,
      ...(splitType === 'itemized' ? {
        itemizedItems,
        serviceChargeActive,
        sstActive,
        customServiceChargeRate,
        customSstRate
      } : {})
    };

    if (expenseToEdit) {
      onUpdateExpense?.({
        ...finalExpenseData,
        id: expenseToEdit.id
      });
    } else {
      onAddExpense(finalExpenseData);
    }

    onClose();
  };

  const handleScanReceipt = () => {
    setIsScanning(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * DUMMY_SCANS.length);
      const scan = DUMMY_SCANS[idx];
      setTitle(scan.title);
      setAmountStr(scan.amount);
      setCategory(scan.category);
      setReceiptUrl(scan.receiptUrl || undefined);
      setIsScanning(false);
      
      // Reset splits to equal split dynamically
      const amt = parseFloat(scan.amount) || 0;
      const initialPart: Record<string, boolean> = {};
      const initialInputs: Record<string, string> = {};
      members.forEach(m => {
        initialPart[m.id] = true;
        initialInputs[m.id] = '';
      });
      setParticipatingMembers(initialPart);
      setSplitInputs(initialInputs);
      setSplitType('equal');
    }, 1000);
  };

  const handleDistributeEqually = () => {
    if (parsedAmount <= 0) return;
    if (splitType === 'exact') {
      const share = (parsedAmount / members.length).toFixed(2);
      const newInputs: Record<string, string> = {};
      members.forEach(m => {
        newInputs[m.id] = share;
      });
      setSplitInputs(newInputs);
    } else if (splitType === 'percentage') {
      const share = (100 / members.length).toFixed(1);
      const newInputs: Record<string, string> = {};
      members.forEach(m => {
        newInputs[m.id] = share;
      });
      setSplitInputs(newInputs);
    }
  };

  const simulateOcrBillUpload = () => {
    setIsBillUploading(true);
    setTimeout(() => {
      const mockItems = [
        {
          id: 'item-1',
          name: 'Nasi Lemak Ayam Goreng 🍛',
          price: 18.90,
          assignedMemberIds: members.map(m => m.id)
        },
        {
          id: 'item-2',
          name: 'Teh Tarik Kaw 🧋',
          price: 4.50,
          assignedMemberIds: members.map(m => m.id)
        },
        {
          id: 'item-3',
          name: 'Roti Canai Double 🍞',
          price: 5.00,
          assignedMemberIds: members.map(m => m.id)
        }
      ];
      setItemizedItems(mockItems);
      setIsBillUploading(false);
      if (!title.trim()) {
        setTitle('Mamak Bill Split 🍽️');
      }
    }, 1500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateOcrBillUpload();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateOcrBillUpload();
    }
  };

  const handleAddManualItem = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    const price = parseFloat(newItemPrice) || 0;
    if (price <= 0) return;
    
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName.trim(),
      price: price,
      assignedMemberIds: members.map(m => m.id)
    };
    
    setItemizedItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleDeleteItem = (itemId: string) => {
    setItemizedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const toggleMemberToItem = (itemId: string, memberId: string) => {
    setItemizedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const alreadyAssigned = item.assignedMemberIds.includes(memberId);
        const newAssignments = alreadyAssigned
          ? item.assignedMemberIds.filter(id => id !== memberId)
          : [...item.assignedMemberIds, memberId];
        return {
          ...item,
          assignedMemberIds: newAssignments
        };
      }
      return item;
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            id="modal-backdrop"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col"
            id="add-expense-modal"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-500">
                    <DollarSign size={18} className="stroke-[2.5]" />
                  </span>
                  {expenseToEdit ? 'Edit Expense' : 'Add Expense'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Split expenses easily with anyone in your group</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                id="btn-close-modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Receipt Scan Simulator */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-500/25 dark:border-emerald-500/35 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Camera size={16} className={isScanning ? "animate-spin" : ""} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      Smart Client Scan
                      <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold font-mono">INTELLIGENT</span>
                    </h4>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">Mock-analyse receipts & auto-sort category</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleScanReceipt}
                  disabled={isScanning}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-2 rounded-xl active:scale-95 transition-all shadow-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Reading...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} className="text-emerald-100" />
                      <span>Auto Scan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Row 1: Title and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    What was it for?
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Clipboard size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sushi Dinner"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all text-ellipsis"
                      id="input-expense-title"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                    <span>How much?</span>
                    {splitType === 'itemized' && (
                      <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse font-sans">Auto-calculated</span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">RM</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={splitType === 'itemized' ? (itemizedTotalAmount > 0 ? itemizedTotalAmount.toFixed(2) : '') : amountStr}
                      onChange={e => setAmountStr(e.target.value)}
                      disabled={splitType === 'itemized'}
                      className={`w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all text-ellipsis font-mono font-medium ${
                        splitType === 'itemized' ? 'opacity-90 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20' : ''
                      }`}
                      id="input-expense-amount"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Category and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Category
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Tag size={16} />
                    </span>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all appearance-none cursor-pointer"
                      id="select-expense-category"
                    >
                      {Object.entries(CATEGORIES).map(([key, spec]) => (
                        <option key={key} value={key} className="dark:bg-slate-900">
                          {spec.icon} {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Date
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Calendar size={16} />
                    </span>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all"
                      id="input-expense-date"
                    />
                  </div>
                </div>
              </div>

              {/* Paid By Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Who paid?
                </label>
                <div className="flex flex-wrap gap-2">
                  {members.map(member => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setPaidBy(member.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                        paidBy === member.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                      id={`btn-paid-by-${member.id}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${member.color}`} />
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split options toggle */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Split Option
                    </label>
                    
                    {(splitType === 'exact' || splitType === 'percentage') && parsedAmount > 0 && (
                      <button
                        type="button"
                        onClick={handleDistributeEqually}
                        className="text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline transition"
                        id="btn-distribute-equally"
                      >
                        Split Equally
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleSplitTypeChange('equal')}
                      className={`py-1.5 rounded-lg text-[11px] font-medium text-center transition-all ${
                        splitType === 'equal'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      id="btn-split-equal"
                    >
                      Equally
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSplitTypeChange('exact')}
                      className={`py-1.5 rounded-lg text-[11px] font-medium text-center transition-all ${
                        splitType === 'exact'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      id="btn-split-exact"
                    >
                      Exact
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSplitTypeChange('percentage')}
                      className={`py-1.5 rounded-lg text-[11px] font-medium text-center transition-all ${
                        splitType === 'percentage'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      id="btn-split-percentage"
                    >
                      % Percent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSplitTypeChange('itemized')}
                      className={`py-1.5 rounded-lg text-[11px] font-medium text-center transition-all flex items-center justify-center gap-1 ${
                        splitType === 'itemized'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                      id="btn-split-itemized"
                    >
                      <Sparkles size={11} className={splitType === 'itemized' ? 'animate-pulse' : ''} />
                      Itemized
                    </button>
                  </div>
                </div>

                {/* Subform based on selection */}
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 space-y-3">
                  <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    {splitType === 'equal' ? 'SELECT WHO PARTICIPATES' : splitType === 'itemized' ? 'ITEMIZED ASSIGNMENTS' : 'ALLOCATE SHARES'}
                  </div>

                  {splitType === 'equal' && (
                    <div className="space-y-2">
                      {members.map(member => (
                        <div
                          key={member.id}
                          onClick={() => toggleParticipation(member.id)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
                          id={`participation-row-${member.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar name={member.name} avatarUrl={member.avatarUrl} color={member.color} size="sm" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {member.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {participatingMembers[member.id] && parsedAmount > 0 && (
                              <span className="text-xs font-mono font-medium text-slate-400">
                                RM {(parsedAmount / Object.values(participatingMembers).filter(Boolean).length).toFixed(2)}
                              </span>
                            )}
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              participatingMembers[member.id]
                                ? 'border-indigo-500 bg-indigo-500 text-white'
                               : 'border-slate-300 dark:border-slate-700'
                            }`}>
                              {participatingMembers[member.id] && <X size={12} className="stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {splitType === 'exact' && (
                    <div className="space-y-3.5">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={member.name} avatarUrl={member.avatarUrl} color={member.color} size="sm" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                              {member.name}
                            </span>
                          </div>
                          
                          <div className="relative w-36">
                            <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">RM</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={splitInputs[member.id] || ''}
                              onChange={e => handleInputChange(member.id, e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border-none rounded-lg text-right font-mono text-slate-800 dark:text-white"
                              id={`input-exact-${member.id}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {splitType === 'percentage' && (
                    <div className="space-y-3.5">
                      {members.map(member => {
                        const pct = parseFloat(splitInputs[member.id]) || 0;
                        const dollarEquiv = Math.round((parsedAmount * (pct / 100)) * 100) / 100;
                        return (
                          <div key={member.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Avatar name={member.name} avatarUrl={member.avatarUrl} color={member.color} size="sm" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                                {member.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {parsedAmount > 0 && (
                                <span className="text-xs font-mono text-slate-400">
                                  RM {dollarEquiv.toFixed(2)}
                                </span>
                              )}
                              <div className="relative w-24">
                                <span className="absolute right-3 top-2 text-slate-400 text-xs font-semibold">%</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="0"
                                  value={splitInputs[member.id] || ''}
                                  onChange={e => handleInputChange(member.id, e.target.value)}
                                  className="w-full pl-3 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border-none rounded-lg text-right font-mono text-slate-800 dark:text-white"
                                  id={`input-percent-${member.id}`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {splitType === 'itemized' && (
                    <div className="space-y-4">
                      {/* Upload / OCR zone if list is empty */}
                      {itemizedItems.length === 0 && !isBillUploading && (
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative ${
                            dragActive 
                              ? 'border-emerald-500 bg-emerald-500/10' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-100/30 dark:bg-slate-900/10'
                          }`}
                        >
                          <input 
                            type="file" 
                            id="receipt-file-upload" 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                            accept="image/*"
                            onChange={handleFileInput}
                          />
                          <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                          <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Drag & Drop Receipt or Browse</span>
                          <span className="block text-[10px] text-slate-400 mt-1">Accepts images for simulated instant scanning</span>
                        </div>
                      )}

                      {isBillUploading && (
                        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-6 text-center animate-pulse flex flex-col items-center justify-center space-y-3">
                          <Loader2 size={24} className="animate-spin text-emerald-500" />
                          <div>
                            <span className="block text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Scanning receipt items...</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Simulating AI OCR text extraction</span>
                          </div>
                        </div>
                      )}

                      {/* Items checklist header and re-scan */}
                      {itemizedItems.length > 0 && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receipt Items List</span>
                          <button
                            type="button"
                            onClick={simulateOcrBillUpload}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md font-semibold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Upload size={10} />
                            Re-Scan Bill
                          </button>
                        </div>
                      )}

                      {/* Interactive Items Table */}
                      {itemizedItems.length > 0 && (
                        <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/40">
                          {itemizedItems.map((item) => {
                            const itemSharePrice = item.assignedMemberIds.length > 0 ? item.price / item.assignedMemberIds.length : item.price;
                            return (
                              <div key={item.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 overflow-hidden text-ellipsis whitespace-nowrap block">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded shrink-0">
                                      RM {item.price.toFixed(2)}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {item.assignedMemberIds.length === 0 ? (
                                      <span className="text-amber-500 font-medium">⚠️ No one assigned (default splits equally)</span>
                                    ) : (
                                      <span>RM {itemSharePrice.toFixed(2)} each ({item.assignedMemberIds.length} split)</span>
                                    )}
                                  </p>
                                </div>

                                {/* Multi-select Friend Avatars */}
                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                  <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-900/40 p-1 rounded-lg border border-slate-100 dark:border-slate-800/50">
                                    {members.map(member => {
                                      const isAssigned = item.assignedMemberIds.includes(member.id);
                                      return (
                                        <button
                                          key={member.id}
                                          type="button"
                                          title={`Toggle ${member.name}`}
                                          onClick={() => toggleMemberToItem(item.id, member.id)}
                                          className={`w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center transition-all overflow-hidden relative shrink-0 ${
                                            isAssigned 
                                              ? 'ring-2 ring-indigo-500/60 scale-105' 
                                              : 'opacity-50 hover:opacity-100'
                                          }`}
                                        >
                                          <Avatar name={member.name} avatarUrl={member.avatarUrl} color={member.color} size="sm" />
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                                    title="Delete Item"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Manual Add Line */}
                      {itemizedItems.length > 0 && (
                        <div className="pt-2.5 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/40">
                          <input
                            type="text"
                            placeholder="Add item name..."
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-xs placeholder-slate-400 border-none dark:text-white focus:ring-1 focus:ring-indigo-500/20"
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddManualItem())}
                          />
                          <div className="relative w-24">
                            <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-bold font-mono">RM</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={newItemPrice}
                              onChange={e => setNewItemPrice(e.target.value)}
                              className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-xs font-mono text-right border-none dark:text-white focus:ring-1 focus:ring-indigo-500/20"
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddManualItem())}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddManualItem}
                            disabled={!newItemName.trim() || !newItemPrice.trim()}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 rounded-lg text-white font-bold transition cursor-pointer shrink-0"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}

                      {/* Taxes and restaurant charges */}
                      {itemizedItems.length > 0 && (
                        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            {/* Service Charge (10%) */}
                            <div className="flex items-center justify-between sm:justify-start gap-4 flex-1 select-none">
                              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                                <input
                                  type="checkbox"
                                  checked={serviceChargeActive}
                                  onChange={e => setServiceChargeActive(e.target.checked)}
                                  className="rounded text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-700"
                                />
                                <span className="font-semibold">Service Charge</span>
                              </label>
                              {serviceChargeActive && (
                                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded px-1.5 py-0.5 border border-slate-100 dark:border-slate-800">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={customServiceChargeRate}
                                    onChange={e => setCustomServiceChargeRate(parseInt(e.target.value) || 0)}
                                    className="w-8 border-none p-0 text-center text-xs font-mono font-medium focus:ring-0 bg-transparent text-slate-700 dark:text-slate-300"
                                  />
                                  <span className="text-[10px] text-slate-400 font-bold">%</span>
                                </div>
                              )}
                            </div>

                            {/* SST / Tax (6%) */}
                            <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-1 select-none">
                              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                                <input
                                  type="checkbox"
                                  checked={sstActive}
                                  onChange={e => setSstActive(e.target.checked)}
                                  className="rounded text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-700"
                                />
                                <span className="font-semibold">SST Govt Tax</span>
                              </label>
                              {sstActive && (
                                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded px-1.5 py-0.5 border border-slate-100 dark:border-slate-800">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={customSstRate}
                                    onChange={e => setCustomSstRate(parseInt(e.target.value) || 0)}
                                    className="w-8 border-none p-0 text-center text-xs font-mono font-medium focus:ring-0 bg-transparent text-slate-700 dark:text-slate-300"
                                  />
                                  <span className="text-[10px] text-slate-400 font-bold">%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Summary Panel */}
                      {itemizedItems.length > 0 && (
                        <div className="mt-3 bg-gradient-to-br from-indigo-500/[0.02] to-teal-500/[0.02] dark:from-indigo-950/10 dark:to-teal-950/10 border border-indigo-500/10 dark:border-indigo-500/20 rounded-xl p-3 space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-405 dark:text-slate-400 uppercase tracking-wider border-b border-dashed border-slate-200 dark:border-slate-800 pb-1.5">
                            <span>Invoice Billing</span>
                            <span className="text-indigo-500 dark:text-indigo-400 font-extrabold font-sans">RM Weight Allocations</span>
                          </div>

                          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span className="font-mono font-medium">RM {itemizedSubtotal.toFixed(2)}</span>
                            </div>
                            {(serviceChargeActive || sstActive) && (
                              <div className="flex justify-between text-[11px] text-slate-400">
                                <span>
                                  Service Charge ({customServiceChargeRate}%) + Gov SST ({customSstRate}%):
                                </span>
                                <span className="font-mono font-medium">
                                  + RM {(calculatedServiceCharge + calculatedSst).toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between font-extrabold text-slate-900 dark:text-white pt-1.5 border-t border-slate-150 dark:border-slate-800 text-xs">
                              <span>Final Total To Save:</span>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                RM {itemizedTotalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Individual Breakdown */}
                          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                            <div className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">
                              Individual Breakdown (Tax weights inclusive)
                            </div>
                            {members.map(member => {
                              let baseSum = 0;
                              itemizedItems.forEach(item => {
                                if (item.assignedMemberIds.length > 0) {
                                  if (item.assignedMemberIds.includes(member.id)) {
                                    baseSum += item.price / item.assignedMemberIds.length;
                                  }
                                } else {
                                  baseSum += item.price / members.length;
                                }
                              });

                              const proportion = itemizedSubtotal > 0 ? baseSum / itemizedSubtotal : 0;
                              const memberFees = proportion * (calculatedServiceCharge + calculatedSst);
                              const memberTotal = baseSum + memberFees;

                              if (memberTotal <= 0) return null;

                              return (
                                <div key={member.id} className="flex justify-between items-center py-0.5 text-slate-700 dark:text-slate-300">
                                  <span className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${member.color}`} />
                                    <span>{member.name}</span>
                                  </span>
                                  <span className="font-mono font-semibold">
                                    RM {memberTotal.toFixed(2)}{' '}
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">
                                      (Base {baseSum.toFixed(2)} + Tax {memberFees.toFixed(2)})
                                    </span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Validation message banner */}
                <div className={`p-3 rounded-xl flex items-center gap-2.5 text-xs transition-all ${
                  validation.isValid
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                }`}>
                  {validation.isValid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span className="font-medium">{validation.message}</span>
                </div>
              </div>
            </form>

            {/* Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-900/60 font-medium">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                id="btn-cancel-modal"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!title.trim() || parsedAmount <= 0 || !validation.isValid}
                onClick={handleSubmit}
                className={`flex-[1.5] py-2.5 rounded-xl text-sm shadow-sm transition-all text-white font-semibold flex items-center justify-center gap-1.5 ${
                  title.trim() && parsedAmount > 0 && validation.isValid
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none cursor-pointer'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed'
                }`}
                id="btn-add-expense-submit"
              >
                {expenseToEdit ? 'Save Changes' : 'Add Expense'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
