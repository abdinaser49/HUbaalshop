import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Shop,
  UserProfile,
  Language,
  Customer,
  CustomerLedgerEntry,
  DebtTransaction,
  DebtItem,
  Payment,
  PaymentMethod,
  SyncQueueItem,
  AuditLog,
  AdminAccount,
  AuthSession,
} from '../types';
import { translations } from '../locales/translations';
import { parseQuantity } from '../utils/quantityParser';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateSessionToken,
} from '../utils/security';

const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop-hodan-01',
    name: 'Hubaal Shop (Hodan Branch)',
    code: 'HB-HODAN',
    address: 'Taleex Street, Hodan, Mogadishu',
    phoneNumber: '+252 61 5111111',
    currency: 'USD',
    isActive: true,
    ownerName: 'Jaamac Xaashi',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'shop-waberi-02',
    name: 'Hubaal Shop (Waberi Branch)',
    code: 'HB-WABERI',
    address: 'Maka Al-Mukarama Rd, Waberi, Mogadishu',
    phoneNumber: '+252 61 5222222',
    currency: 'USD',
    isActive: true,
    ownerName: 'Cumar Nuur',
    createdAt: '2026-02-15T09:30:00Z',
  },
];

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-admin-01',
    fullName: 'Cabdirashiid (Super Admin)',
    phoneNumber: '+252 61 5000001',
    email: 'admin@hubaalshop.so',
    role: 'super_admin',
    isSuperAdmin: true,
  },
  {
    id: 'user-owner-01',
    fullName: 'Jaamac Xaashi (Milkiile)',
    phoneNumber: '+252 61 5000002',
    email: 'owner@hubaalshop.so',
    role: 'shop_owner',
    shopId: 'shop-hodan-01',
    isSuperAdmin: false,
  },
  {
    id: 'user-cashier-01',
    fullName: 'Faadumo Cali (Qasnaji)',
    phoneNumber: '+252 61 5000003',
    email: 'cashier@hubaalshop.so',
    role: 'cashier',
    shopId: 'shop-hodan-01',
    isSuperAdmin: false,
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-ahmed-01',
    shopId: 'shop-hodan-01',
    name: 'Axmed Daahir (Ahmed)',
    phoneNumber: '0612345678',
    address: 'Hodan, Laamiga Taleex',
    notes: 'Macaamiil joogto ah oo raashin qaata',
    openingBalance: 0,
    creditLimit: 500,
    isActive: true,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'cust-saynab-02',
    shopId: 'shop-hodan-01',
    name: 'Saynab Xasan Warsame',
    phoneNumber: '0618765432',
    address: 'Hodan, Seybiyaano',
    notes: 'Makhaayad Seybiyaano',
    openingBalance: 0,
    creditLimit: 800,
    isActive: true,
    createdAt: '2026-03-02T11:00:00Z',
  },
  {
    id: 'cust-maxamed-03',
    shopId: 'shop-hodan-01',
    name: 'Maxamed Shire Cilmi',
    phoneNumber: '0619988776',
    address: 'Hodan, Tarabuunka',
    notes: 'Dhisme iyo qalab',
    openingBalance: 0,
    creditLimit: 300,
    isActive: true,
    createdAt: '2026-03-03T12:00:00Z',
  },
];

const INITIAL_DEBT_TRANSACTIONS: DebtTransaction[] = [
  {
    id: 'tx-debt-01',
    shopId: 'shop-hodan-01',
    transactionNumber: 'DYN-2026-001',
    customerId: 'cust-ahmed-01',
    customerName: 'Axmed Daahir (Ahmed)',
    customerPhone: '0612345678',
    userId: 'user-owner-01',
    userName: 'Jaamac Xaashi',
    items: [
      {
        id: 'item-01',
        productName: 'Rice Basmati',
        quantity: '2 kartoon',
        unitPrice: 50,
        subtotal: 50,
      },
      {
        id: 'item-02',
        productName: 'Sugar',
        quantity: '3 kiilo',
        unitPrice: 30,
        subtotal: 30,
      },
      {
        id: 'item-03',
        productName: 'Cooking Oil',
        quantity: '1 dhalo',
        unitPrice: 15,
        subtotal: 15,
      },
    ],
    totalAmount: 95,
    notes: 'Raashin bisha lagu qaatay deyn',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    isReversed: false,
  },
  {
    id: 'tx-debt-02',
    shopId: 'shop-hodan-01',
    transactionNumber: 'DYN-2026-002',
    customerId: 'cust-saynab-02',
    customerName: 'Saynab Xasan Warsame',
    customerPhone: '0618765432',
    userId: 'user-owner-01',
    userName: 'Jaamac Xaashi',
    items: [
      {
        id: 'item-04',
        productName: 'Wheat Flour 25kg',
        quantity: '1 jawaan',
        unitPrice: 22,
        subtotal: 22,
      },
      {
        id: 'item-05',
        productName: 'Milk Powder Nido 2.5kg',
        quantity: '2 qasac',
        unitPrice: 36,
        subtotal: 36,
      },
    ],
    totalAmount: 58,
    notes: 'Alaabta makhaayadda',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    isReversed: false,
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-01',
    shopId: 'shop-hodan-01',
    paymentNumber: 'PAY-2026-001',
    customerId: 'cust-ahmed-01',
    customerName: 'Axmed Daahir (Ahmed)',
    customerPhone: '0612345678',
    userId: 'user-cashier-01',
    userName: 'Faadumo Cali',
    amount: 35,
    paymentDate: new Date(Date.now() - 20 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'mobile_money',
    referenceNumber: 'EVC-8849201',
    notes: 'Qeyb bixin deyn',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    isReversed: false,
  },
];

const INITIAL_LEDGER: CustomerLedgerEntry[] = [
  {
    id: 'ledg-01',
    shopId: 'shop-hodan-01',
    customerId: 'cust-ahmed-01',
    userId: 'user-owner-01',
    userName: 'Jaamac Xaashi',
    entryType: 'debt_charge',
    referenceId: 'tx-debt-01',
    description: 'Deyn Cusub #DYN-2026-001 (Rice, Sugar, Oil)',
    chargeAmount: 95,
    paymentAmount: 0,
    runningBalance: 95,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ledg-02',
    shopId: 'shop-hodan-01',
    customerId: 'cust-saynab-02',
    userId: 'user-owner-01',
    userName: 'Jaamac Xaashi',
    entryType: 'debt_charge',
    referenceId: 'tx-debt-02',
    description: 'Deyn Cusub #DYN-2026-002 (Flour, Milk)',
    chargeAmount: 58,
    paymentAmount: 0,
    runningBalance: 58,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ledg-03',
    shopId: 'shop-hodan-01',
    customerId: 'cust-ahmed-01',
    userId: 'user-cashier-01',
    userName: 'Faadumo Cali',
    entryType: 'payment_received',
    referenceId: 'pay-01',
    description: 'Lacag Bixin #PAY-2026-001 (EVC-8849201)',
    chargeAmount: 0,
    paymentAmount: 35,
    runningBalance: 60,
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
];

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.so;

  // Multi-Store
  shops: Shop[];
  currentShop: Shop;
  setCurrentShopId: (shopId: string) => void;
  createShop: (shopData: Omit<Shop, 'id' | 'createdAt'>) => void;
  toggleShopActive: (shopId: string) => void;

  // Users & Roles
  profiles: UserProfile[];
  currentUser: UserProfile;
  setCurrentUserId: (userId: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customerData: Omit<Customer, 'id' | 'shopId' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;

  // Customer Debt Engine
  debtTransactions: DebtTransaction[];
  recordDebtTransaction: (data: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    items: Array<{ productName: string; quantity: number | string; unitPrice: number }>;
    notes?: string;
  }) => DebtTransaction;

  payments: Payment[];
  recordPayment: (data: {
    customerId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
  }) => Payment;

  reverseTransaction: (type: 'debt' | 'payment', id: string, reason: string) => void;

  ledgerEntries: CustomerLedgerEntry[];
  getCustomerBalance: (customerId: string) => number;
  getCustomerTotalDebt: (customerId: string) => number;
  getCustomerTotalPaid: (customerId: string) => number;
  getCustomerDebtTransactions: (customerId: string) => DebtTransaction[];
  getCustomerPayments: (customerId: string) => Payment[];
  getCustomerLedger: (customerId: string) => CustomerLedgerEntry[];

  // Offline Sync
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  syncQueue: SyncQueueItem[];
  syncPendingQueue: () => void;

  // Reset All Data
  resetAllData: (mode: 'demo' | 'clear') => void;

  // Audit Logs
  auditLogs: AuditLog[];

  // Admin Authentication & Security
  adminAccount: AdminAccount | null;
  authSession: AuthSession | null;
  isAuthenticated: boolean;
  isInitialAdminRegistered: boolean;
  registerInitialAdmin: (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    businessName: string;
    businessLocation: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  recoverAdminPassword: (data: {
    email: string;
    phoneNumber: string;
    newPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('so');
  const t = translations[language];

  // Multi-Store
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('hubaal_debt_shops');
    return saved ? JSON.parse(saved) : INITIAL_SHOPS;
  });
  const [currentShopId, setCurrentShopIdState] = useState<string>(shops[0]?.id || 'shop-hodan-01');

  // Profiles
  const [profiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentUserId, setCurrentUserId] = useState<string>(INITIAL_PROFILES[0].id);

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('hubaal_debt_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // Debt Transactions
  const [debtTransactions, setDebtTransactions] = useState<DebtTransaction[]>(() => {
    const saved = localStorage.getItem('hubaal_debt_txs');
    return saved ? JSON.parse(saved) : INITIAL_DEBT_TRANSACTIONS;
  });

  // Payments
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('hubaal_debt_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  // Customer Ledger
  const [ledgerEntries, setLedgerEntries] = useState<CustomerLedgerEntry[]>(() => {
    const saved = localStorage.getItem('hubaal_debt_ledger');
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('hubaal_debt_audit');
    return saved ? JSON.parse(saved) : [];
  });

  // Offline Sync
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => {
    const saved = localStorage.getItem('hubaal_debt_sync_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Admin Account & Auth Session
  const [adminAccount, setAdminAccount] = useState<AdminAccount | null>(() => {
    try {
      const saved = localStorage.getItem('hubaal_admin_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('hubaal_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isInitialAdminRegistered = Boolean(adminAccount);
  const isAuthenticated = Boolean(
    authSession && adminAccount && authSession.adminId === adminAccount.id
  );

  // Persistence
  useEffect(() => {
    localStorage.setItem('hubaal_debt_shops', JSON.stringify(shops));
  }, [shops]);
  useEffect(() => {
    localStorage.setItem('hubaal_debt_customers', JSON.stringify(customers));
  }, [customers]);
  useEffect(() => {
    localStorage.setItem('hubaal_debt_txs', JSON.stringify(debtTransactions));
  }, [debtTransactions]);
  useEffect(() => {
    localStorage.setItem('hubaal_debt_payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem('hubaal_debt_ledger', JSON.stringify(ledgerEntries));
  }, [ledgerEntries]);
  useEffect(() => {
    localStorage.setItem('hubaal_debt_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('hubaal_debt_sync_queue', JSON.stringify(syncQueue));
  }, [syncQueue]);
  useEffect(() => {
    if (adminAccount) {
      localStorage.setItem('hubaal_admin_account', JSON.stringify(adminAccount));
    } else {
      localStorage.removeItem('hubaal_admin_account');
    }
  }, [adminAccount]);
  useEffect(() => {
    if (authSession) {
      localStorage.setItem('hubaal_auth_session', JSON.stringify(authSession));
    } else {
      localStorage.removeItem('hubaal_auth_session');
    }
  }, [authSession]);

  const currentShop = shops.find((s) => s.id === currentShopId) || shops[0];
  const currentUser = profiles.find((u) => u.id === currentUserId) || profiles[0];

  const setCurrentShopId = (id: string) => {
    setCurrentShopIdState(id);
  };

  // Safe Audit Logger
  const logAudit = (action: string, entityName: string, entityId: string, details: string) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shopId: currentShopId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      action,
      entityName,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Queue offline transactions
  const queueOffline = (operationType: SyncQueueItem['operationType'], payload: any) => {
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}`,
      idempotencyKey: `idem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      shopId: currentShopId,
      operationType,
      payload,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setSyncQueue((prev) => [...prev, item]);
  };

  // Shop-isolated customer balance calculation
  // Formula: Outstanding Balance = Opening Balance + Total Debt Charges - Total Payments
  const getCustomerBalance = (customerId: string): number => {
    const entries = ledgerEntries.filter((e) => e.customerId === customerId);
    let balance = 0;
    for (const e of entries) {
      balance += (e.chargeAmount || 0) - (e.paymentAmount || 0);
    }
    return Math.max(0, Math.round(balance * 100) / 100);
  };

  const getCustomerTotalDebt = (customerId: string): number => {
    const entries = ledgerEntries.filter((e) => e.customerId === customerId);
    let totalDebt = 0;
    for (const e of entries) {
      totalDebt += e.chargeAmount || 0;
    }
    return Math.round(totalDebt * 100) / 100;
  };

  const getCustomerTotalPaid = (customerId: string): number => {
    const entries = ledgerEntries.filter((e) => e.customerId === customerId);
    let totalPaid = 0;
    for (const e of entries) {
      totalPaid += e.paymentAmount || 0;
    }
    return Math.round(totalPaid * 100) / 100;
  };

  const getCustomerDebtTransactions = (customerId: string): DebtTransaction[] => {
    return debtTransactions
      .filter((t) => t.customerId === customerId && !t.isReversed)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getCustomerPayments = (customerId: string): Payment[] => {
    return payments
      .filter((p) => p.customerId === customerId && !p.isReversed)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getCustomerLedger = (customerId: string): CustomerLedgerEntry[] => {
    return ledgerEntries
      .filter((e) => e.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Create Shop (Super Admin)
  const createShop = (shopData: Omit<Shop, 'id' | 'createdAt'>) => {
    const newShop: Shop = {
      ...shopData,
      id: `shop-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setShops((prev) => [...prev, newShop]);
    logAudit('CREATE_SHOP', 'Shop', newShop.id, `Created shop: ${newShop.name} (${newShop.code})`);
  };

  const toggleShopActive = (shopId: string) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isActive: !s.isActive } : s))
    );
    logAudit('TOGGLE_SHOP', 'Shop', shopId, `Toggled active status for shop ${shopId}`);
  };

  // Add Customer
  const addCustomer = (customerData: Omit<Customer, 'id' | 'shopId' | 'createdAt'>): Customer => {
    const customerId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id: customerId,
      shopId: currentShopId,
      createdAt: new Date().toISOString(),
    };

    setCustomers((prev) => [...prev, newCustomer]);

    if (newCustomer.openingBalance > 0) {
      const ledgerEntry: CustomerLedgerEntry = {
        id: `ledg-${Date.now()}`,
        shopId: currentShopId,
        customerId: customerId,
        userId: currentUser.id,
        userName: currentUser.fullName,
        entryType: 'opening_balance',
        description: 'Haraagii Hore (Opening Balance)',
        chargeAmount: newCustomer.openingBalance,
        paymentAmount: 0,
        runningBalance: newCustomer.openingBalance,
        createdAt: new Date().toISOString(),
      };
      setLedgerEntries((prev) => [...prev, ledgerEntry]);
    }

    if (isOfflineMode) {
      queueOffline('add_customer', newCustomer);
    }

    logAudit('CREATE_CUSTOMER', 'Customer', customerId, `Registered customer ${newCustomer.name} (${newCustomer.phoneNumber})`);
    return newCustomer;
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...customerData } : c))
    );
    logAudit('UPDATE_CUSTOMER', 'Customer', id, `Updated customer profile`);
  };

  // Record New Debt Transaction (Deyn Cusub)
  // Highly flexible: accepts free text product names, manual quantities, and manual prices
  const recordDebtTransaction = (data: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    items: Array<{ productName: string; quantity: number | string; unitPrice: number }>;
    notes?: string;
  }): DebtTransaction => {
    const txId = `debt-${Date.now()}`;
    const txNumber = `DYN-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    // Resolve or Auto-Create Customer
    let targetCustomer: Customer | undefined;
    if (data.customerId) {
      targetCustomer = customers.find((c) => c.id === data.customerId);
    } else {
      // Find existing customer by trimmed name or phone to avoid duplicates
      targetCustomer = customers.find(
        (c) =>
          c.shopId === currentShopId &&
          (c.name.trim().toLowerCase() === data.customerName.trim().toLowerCase() ||
            (data.customerPhone && data.customerPhone.trim() !== '' && c.phoneNumber === data.customerPhone.trim()))
      );
    }

    if (!targetCustomer) {
      targetCustomer = addCustomer({
        name: data.customerName.trim(),
        phoneNumber: data.customerPhone?.trim() || '',
        openingBalance: 0,
        isActive: true,
      });
    }
    const customer = targetCustomer;

    // Process Product Items
    // The Price field represents the TOTAL price entered for the product line (NOT price per unit).
    // Do NOT multiply Quantity × Price. Line Total = Price entered by user.
    const debtItems: DebtItem[] = data.items.map((item, idx) => {
      const lineTotal = Math.round(item.unitPrice * 100) / 100;
      return {
        id: `item-${Date.now()}-${idx}`,
        productName: item.productName.trim(),
        quantity: item.quantity,
        unitPrice: lineTotal,
        subtotal: lineTotal,
      };
    });

    const totalAmount = debtItems.reduce((acc, item) => acc + item.subtotal, 0);

    const newTransaction: DebtTransaction = {
      id: txId,
      shopId: currentShopId,
      transactionNumber: txNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phoneNumber,
      userId: currentUser.id,
      userName: currentUser.fullName,
      items: debtItems,
      totalAmount,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      isReversed: false,
    };

    setDebtTransactions((prev) => [newTransaction, ...prev]);

    // Update Immutable Customer Ledger
    const currentBalance = getCustomerBalance(customer.id);
    const newBalance = currentBalance + totalAmount;

    const itemSummary = debtItems.map((i) => `${i.productName} (${i.quantity})`).slice(0, 3).join(', ');

    const ledgerEntry: CustomerLedgerEntry = {
      id: `ledg-${Date.now()}`,
      shopId: currentShopId,
      customerId: customer.id,
      userId: currentUser.id,
      userName: currentUser.fullName,
      entryType: 'debt_charge',
      referenceId: txId,
      description: `Deyn Cusub #${txNumber}: ${itemSummary}${debtItems.length > 3 ? '...' : ''}`,
      chargeAmount: totalAmount,
      paymentAmount: 0,
      runningBalance: newBalance,
      createdAt: new Date().toISOString(),
    };

    setLedgerEntries((prev) => [...prev, ledgerEntry]);

    if (isOfflineMode) {
      queueOffline('create_debt', newTransaction);
    }

    logAudit(
      'RECORD_DEBT',
      'DebtTransaction',
      txId,
      `Recorded debt #${txNumber} for ${customer.name} total $${totalAmount.toFixed(2)} (${debtItems.length} items)`
    );

    return newTransaction;
  };

  // Record Customer Debt Payment
  const recordPayment = (data: {
    customerId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
  }): Payment => {
    const payId = `pay-${Date.now()}`;
    const payNumber = `PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const customer = customers.find((c) => c.id === data.customerId);
    if (!customer) throw new Error('Customer not found');

    const newPayment: Payment = {
      id: payId,
      shopId: currentShopId,
      paymentNumber: payNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phoneNumber,
      userId: currentUser.id,
      userName: currentUser.fullName,
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      isReversed: false,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Ledger update: Payment reduces customer outstanding balance
    const currentBalance = getCustomerBalance(customer.id);
    const newBalance = Math.max(0, currentBalance - data.amount);

    const ledgerEntry: CustomerLedgerEntry = {
      id: `ledg-${Date.now()}`,
      shopId: currentShopId,
      customerId: customer.id,
      userId: currentUser.id,
      userName: currentUser.fullName,
      entryType: 'payment_received',
      referenceId: payId,
      description: `Lacag Bixin #${payNumber} (${data.paymentMethod.toUpperCase()})${
        data.referenceNumber ? ` Ref: ${data.referenceNumber}` : ''
      }`,
      chargeAmount: 0,
      paymentAmount: data.amount,
      runningBalance: newBalance,
      createdAt: new Date().toISOString(),
    };

    setLedgerEntries((prev) => [...prev, ledgerEntry]);

    if (isOfflineMode) {
      queueOffline('record_payment', newPayment);
    }

    logAudit(
      'RECORD_PAYMENT',
      'Payment',
      payId,
      `Received payment of $${data.amount.toFixed(2)} from ${customer.name} via ${data.paymentMethod}`
    );

    return newPayment;
  };

  // Reversal (Corrections with mandatory reason)
  const reverseTransaction = (type: 'debt' | 'payment', id: string, reason: string) => {
    if (type === 'debt') {
      const tx = debtTransactions.find((t) => t.id === id);
      if (!tx || tx.isReversed) return;

      setDebtTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, isReversed: true, reversalReason: reason, reversedAt: new Date().toISOString() }
            : t
        )
      );

      const curBal = getCustomerBalance(tx.customerId);
      const newBal = Math.max(0, curBal - tx.totalAmount);

      const ledgerEntry: CustomerLedgerEntry = {
        id: `ledg-rev-${Date.now()}`,
        shopId: currentShopId,
        customerId: tx.customerId,
        userId: currentUser.id,
        userName: currentUser.fullName,
        entryType: 'reversal',
        referenceId: id,
        description: `CELIS: Deyn #${tx.transactionNumber} ayaa la baabi'iyey - ${reason}`,
        chargeAmount: 0,
        paymentAmount: tx.totalAmount,
        runningBalance: newBal,
        createdAt: new Date().toISOString(),
      };

      setLedgerEntries((prev) => [...prev, ledgerEntry]);
      logAudit('REVERSE_DEBT', 'DebtTransaction', id, `Reversed debt #${tx.transactionNumber}. Reason: ${reason}`);
    } else if (type === 'payment') {
      const pay = payments.find((p) => p.id === id);
      if (!pay || pay.isReversed) return;

      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, isReversed: true, reversalReason: reason, reversedAt: new Date().toISOString() }
            : p
        )
      );

      const curBal = getCustomerBalance(pay.customerId);
      const newBal = curBal + pay.amount;

      const ledgerEntry: CustomerLedgerEntry = {
        id: `ledg-rev-${Date.now()}`,
        shopId: currentShopId,
        customerId: pay.customerId,
        userId: currentUser.id,
        userName: currentUser.fullName,
        entryType: 'reversal',
        referenceId: id,
        description: `CELIS: Lacag bixin #${pay.paymentNumber} ($${pay.amount}) ayaa la baabi'iyey - ${reason}`,
        chargeAmount: pay.amount,
        paymentAmount: 0,
        runningBalance: newBal,
        createdAt: new Date().toISOString(),
      };

      setLedgerEntries((prev) => [...prev, ledgerEntry]);
      logAudit('REVERSE_PAYMENT', 'Payment', id, `Reversed payment #${pay.paymentNumber}. Reason: ${reason}`);
    }
  };

  // Sync Queue
  const syncPendingQueue = () => {
    if (syncQueue.length === 0) return;
    setSyncQueue([]);
    logAudit('SYNC_QUEUE', 'Sync', 'batch', 'Synchronized offline queue to cloud database');
  };

  // Reset All Data
  const resetAllData = (mode: 'demo' | 'clear') => {
    if (mode === 'demo') {
      setShops(INITIAL_SHOPS);
      setCurrentShopIdState(INITIAL_SHOPS[0].id);
      setCustomers(INITIAL_CUSTOMERS);
      setDebtTransactions(INITIAL_DEBT_TRANSACTIONS);
      setPayments(INITIAL_PAYMENTS);
      setLedgerEntries(INITIAL_LEDGER);
      setSyncQueue([]);
      setAuditLogs([
        {
          id: `audit-${Date.now()}`,
          shopId: INITIAL_SHOPS[0].id,
          userId: currentUser.id,
          userName: currentUser.fullName,
          action: 'RESET_ALL_DATA_DEMO',
          entityName: 'System',
          details: 'Xogta dib ayaa loogu celiyay tijaabadii asalka ahayd (Reset to demo data)',
          createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      setCustomers([]);
      setDebtTransactions([]);
      setPayments([]);
      setLedgerEntries([]);
      setSyncQueue([]);
      setAuditLogs([
        {
          id: `audit-${Date.now()}`,
          shopId: currentShopId,
          userId: currentUser.id,
          userName: currentUser.fullName,
          action: 'RESET_ALL_DATA_CLEAR',
          entityName: 'System',
          details: 'Dhammaan macaamiisha iyo deymaha waa la tirtiray (Cleared all data)',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  // Admin Authentication Methods
  const registerInitialAdmin = async (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    businessName: string;
    businessLocation: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    // Security Rule: Allow only one initial Admin registration.
    if (adminAccount) {
      return { success: false, error: t.auth.registrationClosed };
    }

    const trimmedEmail = data.email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@gmail.com') || trimmedEmail.length < 11) {
      return { success: false, error: t.auth.errorInvalidGmail };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: t.auth.errorPasswordShort };
    }

    if (
      !data.fullName.trim() ||
      !data.phoneNumber.trim() ||
      !data.businessName.trim() ||
      !data.businessLocation.trim()
    ) {
      return { success: false, error: t.auth.errorFillAll };
    }

    const salt = generateSalt(16);
    const passwordHash = await hashPassword(data.password, salt);

    const newAdmin: AdminAccount = {
      id: `admin-${Date.now()}`,
      fullName: data.fullName.trim(),
      email: trimmedEmail,
      phoneNumber: data.phoneNumber.trim(),
      businessName: data.businessName.trim(),
      businessLocation: data.businessLocation.trim(),
      passwordHash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setAdminAccount(newAdmin);

    // Sync primary shop details with the admin's business details
    setShops((prev) => {
      if (prev.length > 0) {
        return prev.map((s, idx) =>
          idx === 0
            ? {
                ...s,
                name: newAdmin.businessName,
                address: newAdmin.businessLocation,
                phoneNumber: newAdmin.phoneNumber,
                ownerName: newAdmin.fullName,
              }
            : s
        );
      }
      return [
        {
          id: 'shop-main-01',
          name: newAdmin.businessName,
          code: 'HB-MAIN',
          address: newAdmin.businessLocation,
          phoneNumber: newAdmin.phoneNumber,
          currency: 'USD',
          isActive: true,
          ownerName: newAdmin.fullName,
          createdAt: new Date().toISOString(),
        },
      ];
    });

    // Create session token and log in
    const sessionToken = generateSessionToken();
    const session: AuthSession = {
      token: sessionToken,
      adminId: newAdmin.id,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      businessName: newAdmin.businessName,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    };
    setAuthSession(session);

    logAudit(
      'ADMIN_REGISTER',
      'AdminAccount',
      newAdmin.id,
      `Super Admin registered: ${newAdmin.fullName} (${newAdmin.email}) for ${newAdmin.businessName}`
    );

    return { success: true };
  };

  const loginAdmin = async (data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!adminAccount) {
      return { success: false, error: 'No admin account found. Please register first.' };
    }

    const trimmedEmail = data.email.trim().toLowerCase();
    if (trimmedEmail !== adminAccount.email.toLowerCase()) {
      return { success: false, error: t.auth.errorInvalidCredentials };
    }

    const isValid = await verifyPassword(
      data.password,
      adminAccount.passwordSalt,
      adminAccount.passwordHash
    );

    if (!isValid) {
      return { success: false, error: t.auth.errorInvalidCredentials };
    }

    const sessionToken = generateSessionToken();
    const session: AuthSession = {
      token: sessionToken,
      adminId: adminAccount.id,
      email: adminAccount.email,
      fullName: adminAccount.fullName,
      businessName: adminAccount.businessName,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    };

    setAuthSession(session);
    setAdminAccount((prev) => (prev ? { ...prev, lastLoginAt: new Date().toISOString() } : prev));

    logAudit(
      'ADMIN_LOGIN',
      'AdminAccount',
      adminAccount.id,
      `Super Admin logged in: ${adminAccount.email}`
    );

    return { success: true };
  };

  const logoutAdmin = () => {
    if (adminAccount) {
      logAudit(
        'ADMIN_LOGOUT',
        'AdminAccount',
        adminAccount.id,
        `Admin logged out: ${adminAccount.email}`
      );
    }
    setAuthSession(null);
  };

  const recoverAdminPassword = async (data: {
    email: string;
    phoneNumber: string;
    newPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!adminAccount) {
      return { success: false, error: 'No admin account found.' };
    }

    const cleanInputEmail = data.email.trim().toLowerCase();
    const cleanAdminEmail = adminAccount.email.trim().toLowerCase();

    const normPhone1 = data.phoneNumber.replace(/[\s\-\+\(\)]/g, '');
    const normPhone2 = adminAccount.phoneNumber.replace(/[\s\-\+\(\)]/g, '');

    const phoneMatch =
      normPhone1 === normPhone2 ||
      normPhone1.endsWith(normPhone2) ||
      normPhone2.endsWith(normPhone1);

    if (cleanInputEmail !== cleanAdminEmail || !phoneMatch) {
      return { success: false, error: t.auth.errorRecoveryMismatch };
    }

    if (!data.newPassword || data.newPassword.length < 6) {
      return { success: false, error: t.auth.errorPasswordShort };
    }

    const newSalt = generateSalt(16);
    const newHash = await hashPassword(data.newPassword, newSalt);

    setAdminAccount((prev) =>
      prev
        ? {
            ...prev,
            passwordHash: newHash,
            passwordSalt: newSalt,
          }
        : null
    );

    logAudit(
      'ADMIN_PASSWORD_RESET',
      'AdminAccount',
      adminAccount.id,
      `Admin password recovered and reset for ${adminAccount.email}`
    );

    return { success: true };
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        shops,
        currentShop,
        setCurrentShopId,
        createShop,
        toggleShopActive,
        profiles,
        currentUser,
        setCurrentUserId,
        customers: customers.filter((c) => c.shopId === currentShopId),
        addCustomer,
        updateCustomer,
        debtTransactions: debtTransactions.filter((t) => t.shopId === currentShopId),
        recordDebtTransaction,
        payments: payments.filter((p) => p.shopId === currentShopId),
        recordPayment,
        reverseTransaction,
        ledgerEntries: ledgerEntries.filter((e) => e.shopId === currentShopId),
        getCustomerBalance,
        getCustomerTotalDebt,
        getCustomerTotalPaid,
        getCustomerDebtTransactions,
        getCustomerPayments,
        getCustomerLedger,
        isOfflineMode,
        setIsOfflineMode,
        syncQueue,
        syncPendingQueue,
        resetAllData,
        auditLogs,
        adminAccount,
        authSession,
        isAuthenticated,
        isInitialAdminRegistered,
        registerInitialAdmin,
        loginAdmin,
        logoutAdmin,
        recoverAdminPassword,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
