export type SplitType = 'equal' | 'exact' | 'percentage' | 'itemized';

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string; // Tailwind bg color class for avatar or border
  duitNowId?: string; // For simulating quick banking transfers
  bankName?: string;  // Bank name e.g., Maybank, TNG eWallet
  qrCodeDataUrl?: string; // base64 URL or uploaded QR Code image file source
}

export interface Split {
  memberId: string;
  amount: number;      // Calculated amount of currency assigned to this member
  value?: number;      // Original value entered if exact amount/percentage
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;       // ISO string or YYYY-MM-DD
  category: string;   // Food, Rent, Entertainment, Transport, Utilities, Other
  paidBy: string;     // memberId who paid the expense
  splitType: SplitType;
  splits: Split[];    // Array of split percentages or amounts per member
  receiptUrl?: string; // Simulated link to receipt image
  itemizedItems?: {
    id: string;
    name: string;
    price: number;
    assignedMemberIds: string[];
  }[];
  serviceChargeActive?: boolean;
  sstActive?: boolean;
  customServiceChargeRate?: number;
  customSstRate?: number;
}

export interface Group {
  id: string;
  name: string;
  icon: string;       // Emoji or avatar
  description: string;
  members: Member[];
  expenses: Expense[];
}

export interface Settlement {
  id: string;
  from: string;       // memberId debtor
  to: string;         // memberId creditor
  amount: number;     // amount to pay
}

export interface CategorySpec {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}
