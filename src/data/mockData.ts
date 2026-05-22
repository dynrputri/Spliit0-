import { Group, CategorySpec } from '../types';

export const CATEGORIES: Record<string, CategorySpec> = {
  food: { name: 'Food / Mamak', icon: '🍛', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400' },
  housing: { name: 'Rent / Utilities', icon: '🏠', color: 'text-sky-500', bgColor: 'bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400' },
  transport: { name: 'Petrol / Tolls', icon: '🚗', color: 'text-indigo-500', bgColor: 'bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400' },
  entertainment: { name: 'Entertainment', icon: '🍿', color: 'text-rose-500', bgColor: 'bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400' },
  utilities: { name: 'Utilities', icon: '⚡', color: 'text-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400' },
  other: { name: 'Other', icon: '📦', color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400' },
};

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'grp-ss15',
    name: 'SS15 Housemates 🏠',
    description: 'Shared house rent, utilities, and daily cooking items.',
    icon: '🏠',
    members: [
      { id: 'you', name: 'You', color: 'bg-teal-600 text-white', duitNowId: '+6012-3456789' },
      { id: 'ali', name: 'Ali', color: 'bg-indigo-500 text-white', duitNowId: 'ali@maybank' },
      { id: 'bala', name: 'Bala', color: 'bg-purple-500 text-white', duitNowId: 'bala@cimb' },
      { id: 'chong', name: 'Chong', color: 'bg-pink-500 text-white', duitNowId: '010-9887766' },
    ],
    expenses: [
      {
        id: 'exp-1',
        title: 'Balik kampung carpool',
        amount: 120.00,
        date: '2026-05-18',
        category: 'transport',
        paidBy: 'you',
        splitType: 'equal',
        splits: [
          { memberId: 'you', amount: 30.00 },
          { memberId: 'ali', amount: 30.00 },
          { memberId: 'bala', amount: 30.00 },
          { memberId: 'chong', amount: 30.00 },
        ],
        receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'exp-2',
        title: 'Nasi Kandar dinner',
        amount: 64.00,
        date: '2026-05-19',
        category: 'food',
        paidBy: 'chong',
        splitType: 'equal',
        splits: [
          { memberId: 'you', amount: 16.00 },
          { memberId: 'ali', amount: 16.00 },
          { memberId: 'bala', amount: 16.00 },
          { memberId: 'chong', amount: 16.00 },
        ],
        receiptUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'exp-3',
        title: 'Unifi Internet Bill',
        amount: 159.00,
        date: '2026-05-20',
        category: 'housing',
        paidBy: 'ali',
        splitType: 'percentage',
        splits: [
          { memberId: 'you', amount: 39.75, value: 25 },         // 25%
          { memberId: 'ali', amount: 79.50, value: 50 },         // 50%
          { memberId: 'bala', amount: 39.75, value: 25 },        // 25%
          { memberId: 'chong', amount: 0.00, value: 0 },          // 0%
        ],
      },
      {
        id: 'exp-4',
        title: 'TGV Movie tickets',
        amount: 80.00,
        date: '2026-05-21',
        category: 'entertainment',
        paidBy: 'bala',
        splitType: 'exact',
        splits: [
          { memberId: 'you', amount: 20.00, value: 20.00 },
          { memberId: 'ali', amount: 20.00, value: 20.00 },
          { memberId: 'bala', amount: 40.00, value: 40.00 },
          { memberId: 'chong', amount: 0.00, value: 0.00 },
        ],
      }
    ]
  },
  {
    id: 'grp-penang',
    name: 'Penang Roadtrip 🚗',
    description: 'Travel expenses, petrol, toll charges, and street food feast.',
    icon: '🚗',
    members: [
      { id: 'you', name: 'You', color: 'bg-teal-600 text-white', duitNowId: '+6012-3456789' },
      { id: 'ali', name: 'Ali', color: 'bg-indigo-500 text-white', duitNowId: 'ali@maybank' },
      { id: 'bala', name: 'Bala', color: 'bg-purple-500 text-white', duitNowId: 'bala@cimb' },
    ],
    expenses: [
      {
        id: 'exp-penang-1',
        title: 'Penang Bridge Toll & Petrol',
        amount: 95.00,
        date: '2026-05-15',
        category: 'transport',
        paidBy: 'ali',
        splitType: 'equal',
        splits: [
          { memberId: 'you', amount: 31.67 },
          { memberId: 'ali', amount: 31.66 },
          { memberId: 'bala', amount: 31.67 },
        ]
      },
      {
        id: 'exp-penang-2',
        title: 'Gurney Plaza Food feast',
        amount: 150.00,
        date: '2026-05-16',
        category: 'food',
        paidBy: 'you',
        splitType: 'equal',
        splits: [
          { memberId: 'you', amount: 50.00 },
          { memberId: 'ali', amount: 50.00 },
          { memberId: 'bala', amount: 50.00 },
        ],
        receiptUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  {
    id: 'grp-mamak',
    name: 'Mamak Gang 🍛',
    description: 'Late night teh tarik, roti canai, and football matches.',
    icon: '🍛',
    members: [
      { id: 'you', name: 'You', color: 'bg-teal-600 text-white', duitNowId: '+6012-3456789' },
      { id: 'chong', name: 'Chong', color: 'bg-pink-500 text-white', duitNowId: '010-9887766' },
      { id: 'sarah', name: 'Sarah Miller', color: 'bg-emerald-500 text-white', duitNowId: 'sarah@public' },
    ],
    expenses: [
      {
        id: 'exp-mamak-1',
        title: 'Teh Tarik & Maggie Goreng Double',
        amount: 36.00,
        date: '2026-05-22',
        category: 'food',
        paidBy: 'chong',
        splitType: 'equal',
        splits: [
          { memberId: 'you', amount: 12.00 },
          { memberId: 'chong', amount: 12.00 },
          { memberId: 'sarah', amount: 12.00 },
        ]
      }
    ]
  }
];
