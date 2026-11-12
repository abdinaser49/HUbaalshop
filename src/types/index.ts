export type UserRole = 'super_admin' | 'shop_owner' | 'manager' | 'cashier' | 'accountant';

export type Language = 'so' | 'en';

export type PaymentMethod = 'cash' | 'mobile_money' | 'bank_transfer' | 'other';

export type LedgerEntryType = 'opening_balance' | 'debt_charge' | 'payment_received' | 'reversal';

export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: UserRole;
  shopId?: string;
  isSuperAdmin: boolean;
}

export interface Shop {
  id: string;
  name: string;
  code: string;
  address: string;
  phoneNumber: string;
  currency: string;
  isActive: boolean;
  ownerName: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phoneNumber: string;
  address?: string;
  notes?: string;
  openingBalance: number;
  creditLimit?: number;
  isActive: boolean;
  createdAt: string;
}

export interface DebtItem {
  id: string;
  productName: string;
  quantity: number | string;
  unitPrice: number;
  subtotal: number;
}

export interface DebtTransaction {
  id: string;
  shopId: string;
  transactionNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  userId: string;
  userName: string;
  items: DebtItem[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  isReversed: boolean;
  reversalReason?: string;
  reversedAt?: string;
}

export interface Payment {
  id: string;
  shopId: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  userId: string;
  userName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  isReversed: boolean;
  reversalReason?: string;
  reversedAt?: string;
}

export interface CustomerLedgerEntry {
  id: string;
  shopId: string;
  customerId: string;
  userId: string;
  userName: string;
  entryType: LedgerEntryType;
  referenceId?: string;
  description: string;
  chargeAmount: number; // Increases debt
  paymentAmount: number; // Reduces debt
  runningBalance: number;
  createdAt: string;
}

export interface SyncQueueItem {
  id: string;
  idempotencyKey: string;
  shopId: string;
  operationType: 'create_debt' | 'record_payment' | 'add_customer' | 'edit_customer';
  payload: any;
  status: 'pending' | 'synced' | 'failed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  shopId?: string;
  userId: string;
  userName: string;
  action: string;
  entityName: string;
  entityId?: string;
  details: string;
  createdAt: string;
}

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  businessLocation: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  token: string;
  adminId: string;
  email: string;
  fullName: string;
  businessName: string;
  loginAt: string;
  expiresAt: string;
}
