import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Search, Filter, MoreVertical, CreditCard, ChevronDown, FileText, X, ExternalLink, Edit2 } from 'lucide-react';
import { Expense, Member, CategorySpec } from '../types';
import { CATEGORIES } from '../data/mockData';

interface ExpenseFeedProps {
  expenses: Expense[];
  members: Member[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
}

export default function ExpenseFeed({ expenses, members, onDeleteExpense, onEditExpense }: ExpenseFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<{ title: string; url: string; amount: number } | null>(null);

  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id);
    return member ? member.name : id;
  };

  const getMemberColor = (id: string) => {
    const member = members.find(m => m.id === id);
    return member ? member.color : 'bg-slate-300';
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getMemberName(exp.paidBy).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4" id="expense-feed-panel">
      {/* Control Bar (Search, Filter) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3.5 top-2.5 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by title or member..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            id="search-expenses"
          />
        </div>

        {/* Categories filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800/60'
            }`}
            id="filter-cat-all"
          >
            All
          </button>
          
          {Object.entries(CATEGORIES).map(([key, spec]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800/60'
              }`}
              id={`filter-cat-${key}`}
            >
              <span>{spec.icon}</span>
              <span>{spec.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1 no-scrollbar pb-6">
        <AnimatePresence mode="popLayout">
          {filteredExpenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 p-6 flex flex-col items-center justify-center space-y-2"
              id="empty-expenses-state"
            >
              <span className="text-3xl">🏜️</span>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No transactions found</h4>
              <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                Add a new expense or clear your filters to see entries.
              </p>
            </motion.div>
          ) : (
            filteredExpenses.map((expense) => {
              const categorySpec = CATEGORIES[expense.category] || CATEGORIES.other;
              const isYouPayer = expense.paidBy === 'you';
              
              // Calculate specific share of logged in user ("you")
              const yourSplit = expense.splits.find(s => s.memberId === 'you');
              const yourOwedShare = yourSplit ? yourSplit.amount : 0;
              
              // Determine explanation text and indicators
              let shareText = '';
              let shareColor = 'text-slate-600 dark:text-slate-400';
              let isUninvolved = yourOwedShare === 0;

              if (isYouPayer) {
                const totalOwedByOthers = expense.amount - yourOwedShare;
                if (totalOwedByOthers <= 0) {
                  shareText = 'You paid for yourself only';
                  shareColor = 'text-slate-500 dark:text-slate-400';
                } else {
                  shareText = `You lent RM ${totalOwedByOthers.toFixed(2)}`;
                  shareColor = 'text-emerald-600 dark:text-emerald-400 font-semibold';
                }
              } else {
                if (isUninvolved) {
                  shareText = 'Not involved';
                  shareColor = 'text-slate-400 dark:text-slate-600 font-medium';
                } else {
                  shareText = `You owe RM ${yourOwedShare.toFixed(2)}`;
                  shareColor = 'text-amber-600 dark:text-amber-400 font-semibold';
                }
              }

              return (
                <motion.div
                  key={expense.id}
                  layoutId={`expense-${expense.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  onMouseEnter={() => setHoveredId(expense.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-all duration-200 overflow-hidden"
                  id={`expense-row-${expense.id}`}
                >
                  {/* Left: icon & text information */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Category Icon Ball */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 shadow-sm ${categorySpec.bgColor}`}>
                      {categorySpec.icon}
                    </div>

                    <div className="min-w-0 pr-2">
                      <h4 className="text-[13px] sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                        <span className="truncate">{expense.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceipt({
                              title: expense.title,
                              url: expense.receiptUrl || "",
                              amount: expense.amount
                            });
                          }}
                          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-[10px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold tracking-tight inline-flex items-center gap-1 shrink-0 transition-colors"
                          title="View receipt"
                          id={`btn-view-receipt-${expense.id}`}
                        >
                          <FileText size={10} />
                          <span className="sr-only sm:not-sr-only text-[9px]">Receipt</span>
                        </button>
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-y-0.5 gap-x-2 mt-1 font-medium">
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {expense.date}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-705">•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[150px]">
                          Paid by <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{getMemberName(expense.paidBy)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts, breakdown text and garbage delete button */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[13px] sm:text-sm font-mono font-bold text-slate-900 dark:text-white">
                        RM {expense.amount.toFixed(2)}
                      </div>
                      <div className={`text-[11px] mt-0.5 font-medium ${shareColor}`}>
                        {shareText}
                      </div>
                    </div>

                    {/* Delete and Edit action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isYouPayer && (
                        <>
                          <button
                            onClick={() => onEditExpense(expense)}
                            className="p-1 px-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 font-bold text-[10px] cursor-pointer"
                            title="Edit expense"
                            id={`btn-edit-expense-${expense.id}`}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteExpense(expense.id)}
                            className="p-2 text-slate-300 hover:text-emerald-500 focus:text-red-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete expense"
                            id={`btn-delete-expense-${expense.id}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Receipt Modal overlay */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReceipt(null)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              id="receipt-backdrop"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
              id="receipt-card"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Receipt Scan Voucher</span>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-605 transition-colors"
                  id="btn-close-receipt"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-2xl">
                  <FileText size={22} />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white">{selectedReceipt.title}</h5>
                  <p className="text-xs font-serif italic text-slate-400 mt-1">Verified Digital Scanner</p>
                </div>
                <div className="border-t border-b border-dashed border-slate-205 dark:border-slate-800 py-3.5 my-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Merchant Outlet</span>
                    <span className="text-slate-900 dark:text-white font-semibold">Verified Vendor</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-1.5">
                    <span>Status</span>
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">● Cleared</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-1.5">
                    <span>Currency</span>
                    <span className="font-mono text-slate-900 dark:text-white">MYR (RM)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-800 dark:text-slate-205 font-extrabold mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 font-mono">
                    <span>Total Amount</span>
                    <span className="text-emerald-500">RM {selectedReceipt.amount.toFixed(2)}</span>
                  </div>
                </div>
                {selectedReceipt.url ? (
                  <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800 relative group">
                    <img
                      src={selectedReceipt.url}
                      alt="receipt scan thumbnail"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <a
                        href={selectedReceipt.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 px-2.5 rounded-lg bg-white/95 text-xs font-bold text-slate-950 flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        <span>Open original</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl p-5 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
                    No image uploaded. Extracted via smart text recognition simulation.
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  Close Receipt View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
