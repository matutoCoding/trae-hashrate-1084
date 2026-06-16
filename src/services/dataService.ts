import { storage, generateId, getTodayDate, getNowTime } from '@/utils/storage';
import {
  SoakingRecord,
  GrindingRecord,
  BoilingRecord,
  CoagulatingRecord,
  PressingRecord,
  MarinatingRecord,
  FryingRecord,
  DeliveryOrder,
  AccountingRecord,
  DailyStats
} from '@/types/production';
import {
  soakingRecords as defaultSoaking,
  grindingRecords as defaultGrinding,
  boilingRecords as defaultBoiling,
  coagulatingRecords as defaultCoagulating,
  pressingRecords as defaultPressing,
  marinatingRecords as defaultMarinating,
  fryingRecords as defaultFrying,
  deliveryOrders as defaultDelivery,
  accountingRecords as defaultAccounting,
  dailyStats as defaultStats
} from '@/data/mockData';

const STORAGE_KEYS = {
  SOAKING: 'soaking_records',
  GRINDING: 'grinding_records',
  BOILING: 'boiling_records',
  COAGULATING: 'coagulating_records',
  PRESSING: 'pressing_records',
  MARINATING: 'marinating_records',
  FRYING: 'frying_records',
  DELIVERY: 'delivery_orders',
  ACCOUNTING: 'accounting_records',
  STATS: 'daily_stats',
  INITIALIZED: 'data_initialized'
};

const initializeData = () => {
  const initialized = storage.get<boolean>(STORAGE_KEYS.INITIALIZED, false);
  if (!initialized) {
    console.log('[DataService] 初始化默认数据');
    storage.set(STORAGE_KEYS.SOAKING, defaultSoaking);
    storage.set(STORAGE_KEYS.GRINDING, defaultGrinding);
    storage.set(STORAGE_KEYS.BOILING, defaultBoiling);
    storage.set(STORAGE_KEYS.COAGULATING, defaultCoagulating);
    storage.set(STORAGE_KEYS.PRESSING, defaultPressing);
    storage.set(STORAGE_KEYS.MARINATING, defaultMarinating);
    storage.set(STORAGE_KEYS.FRYING, defaultFrying);
    storage.set(STORAGE_KEYS.DELIVERY, defaultDelivery);
    storage.set(STORAGE_KEYS.ACCOUNTING, defaultAccounting);
    storage.set(STORAGE_KEYS.STATS, defaultStats);
    storage.set(STORAGE_KEYS.INITIALIZED, true);
  }
};

initializeData();

// 黄豆浸泡
export const soakingService = {
  getAll(): SoakingRecord[] {
    return storage.get<SoakingRecord[]>(STORAGE_KEYS.SOAKING, []);
  },

  add(data: Omit<SoakingRecord, 'id' | 'status'>): SoakingRecord {
    const records = this.getAll();
    const newRecord: SoakingRecord = {
      ...data,
      id: generateId('s'),
      status: 'pending'
    };
    records.unshift(newRecord);
    storage.set(STORAGE_KEYS.SOAKING, records);
    console.log('[SoakingService] 新增记录:', newRecord);
    return newRecord;
  },

  update(id: string, data: Partial<SoakingRecord>): SoakingRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.SOAKING, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.SOAKING, filtered);
    return filtered.length < records.length;
  },

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.startTime.startsWith(today));
    return {
      total: todayRecords.length,
      totalWeight: todayRecords.reduce((sum, r) => sum + r.beanWeight, 0),
      inProgress: todayRecords.filter(r => r.status === 'in_progress').length,
      completed: todayRecords.filter(r => r.status === 'completed').length
    };
  }
};

// 磨浆
export const grindingService = {
  getAll(): GrindingRecord[] {
    return storage.get<GrindingRecord[]>(STORAGE_KEYS.GRINDING, []);
  },

  add(data: Omit<GrindingRecord, 'id' | 'status'>): GrindingRecord {
    const records = this.getAll();
    const newRecord: GrindingRecord = {
      ...data,
      id: generateId('g'),
      status: 'pending'
    };
    records.unshift(newRecord);
    storage.set(STORAGE_KEYS.GRINDING, records);
    console.log('[GrindingService] 新增记录:', newRecord);
    return newRecord;
  },

  update(id: string, data: Partial<GrindingRecord>): GrindingRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.GRINDING, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.GRINDING, filtered);
    return filtered.length < records.length;
  },

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.startTime.startsWith(today));
    return {
      total: todayRecords.length,
      totalBean: todayRecords.reduce((sum, r) => sum + r.beanWeight, 0),
      totalMilk: todayRecords.reduce((sum, r) => sum + (r.soyMilkAmount || 0), 0),
      inProgress: todayRecords.filter(r => r.status === 'in_progress').length,
      completed: todayRecords.filter(r => r.status === 'completed').length
    };
  }
};

// 煮浆
export const boilingService = {
  getAll(): BoilingRecord[] {
    return storage.get<BoilingRecord[]>(STORAGE_KEYS.BOILING, []);
  },

  add(data: Omit<BoilingRecord, 'id' | 'status'>): BoilingRecord {
    const records = this.getAll();
    const newRecord: BoilingRecord = {
      ...data,
      id: generateId('b'),
      status: 'pending'
    };
    records.unshift(newRecord);
    storage.set(STORAGE_KEYS.BOILING, records);
    console.log('[BoilingService] 新增记录:', newRecord);
    return newRecord;
  },

  update(id: string, data: Partial<BoilingRecord>): BoilingRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.BOILING, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.BOILING, filtered);
    return filtered.length < records.length;
  },

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.startTime.startsWith(today));
    return {
      total: todayRecords.length,
      totalMilk: todayRecords.reduce((sum, r) => sum + r.soyMilkAmount, 0),
      inProgress: todayRecords.filter(r => r.status === 'in_progress').length,
      completed: todayRecords.filter(r => r.status === 'completed').length
    };
  }
};

// 点浆凝固
export const coagulatingService = {
  getAll(): CoagulatingRecord[] {
    return storage.get<CoagulatingRecord[]>(STORAGE_KEYS.COAGULATING, []);
  },

  add(data: Omit<CoagulatingRecord, 'id' | 'status'>): CoagulatingRecord {
    const records = this.getAll();
    const newRecord: CoagulatingRecord = {
      ...data,
      id: generateId('c'),
      status: 'pending'
    };
    records.unshift(newRecord);
    storage.set(STORAGE_KEYS.COAGULATING, records);
    console.log('[CoagulatingService] 新增记录:', newRecord);
    return newRecord;
  },

  update(id: string, data: Partial<CoagulatingRecord>): CoagulatingRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.COAGULATING, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.COAGULATING, filtered);
    return filtered.length < records.length;
  },

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.startTime.startsWith(today));
    return {
      total: todayRecords.length,
      totalMilk: todayRecords.reduce((sum, r) => sum + r.soyMilkAmount, 0),
      brineCount: todayRecords.filter(r => r.coagulantType === 'brine').length,
      gypsumCount: todayRecords.filter(r => r.coagulantType === 'gypsum').length,
      inProgress: todayRecords.filter(r => r.status === 'in_progress').length,
      completed: todayRecords.filter(r => r.status === 'completed').length
    };
  }
};

// 压制成型
export const pressingService = {
  getAll(): PressingRecord[] {
    return storage.get<PressingRecord[]>(STORAGE_KEYS.PRESSING, []);
  },

  add(data: Omit<PressingRecord, 'id' | 'status'>): PressingRecord {
    const records = this.getAll();
    const newRecord: PressingRecord = {
      ...data,
      id: generateId('p'),
      status: 'pending'
    };
    records.unshift(newRecord);
    storage.set(STORAGE_KEYS.PRESSING, records);
    console.log('[PressingService] 新增记录:', newRecord);
    return newRecord;
  },

  update(id: string, data: Partial<PressingRecord>): PressingRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.PRESSING, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.PRESSING, filtered);
    return filtered.length < records.length;
  },

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.startTime.startsWith(today));
    const productMap: Record<string, number> = {};
    todayRecords.forEach(r => {
      productMap[r.productType] = (productMap[r.productType] || 0) + r.amount;
    });
    return {
      total: todayRecords.length,
      products: productMap,
      tofuAmount: productMap['tofu'] || 0,
      driedTofuAmount: productMap['dried_tofu'] || 0,
      tofuSkinAmount: productMap['tofu_skin'] || 0,
      inProgress: todayRecords.filter(r => r.status === 'in_progress').length,
      completed: todayRecords.filter(r => r.status === 'completed').length
    };
  }
};

// 卤制
export const marinatingService = {
  getAll(): MarinatingRecord[] {
    return storage.get<MarinatingRecord[]>(STORAGE_KEYS.MARINATING, []);
  },

  add(data: Omit<MarinatingRecord, 'id' | 'status'>): MarinatingRecord {
    const records = this.getAll();
    const newRecord: MarinatingRecord = {
      ...data,
      id: generateId('m'),
      status: 'pending'
    };
    records.unshift(newRecord);
    storage.set(STORAGE_KEYS.MARINATING, records);
    console.log('[MarinatingService] 新增记录:', newRecord);
    return newRecord;
  },

  update(id: string, data: Partial<MarinatingRecord>): MarinatingRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.MARINATING, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.MARINATING, filtered);
    return filtered.length < records.length;
  },

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.startTime.startsWith(today));
    return {
      total: todayRecords.length,
      totalAmount: todayRecords.reduce((sum, r) => sum + r.amount, 0),
      inProgress: todayRecords.filter(r => r.status === 'in_progress').length,
      completed: todayRecords.filter(r => r.status === 'completed').length
    };
  }
};

// 油炸
export const fryingService = {
  getAll(): FryingRecord[] {
    return storage.get<FryingRecord[]>(STORAGE_KEYS.FRYING, []);
  },

  add(data: Omit<FryingRecord, 'id' | 'status'>): FryingRecord {
    const records = this.getAll();
    const newRecord: FryingRecord = {
      ...data,
      id: generateId('f'),
      status: 'pending'
    };
    records.unshift(newRecord);
    storage.set(STORAGE_KEYS.FRYING, records);
    console.log('[FryingService] 新增记录:', newRecord);
    return newRecord;
  },

  update(id: string, data: Partial<FryingRecord>): FryingRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.FRYING, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.FRYING, filtered);
    return filtered.length < records.length;
  },

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.startTime.startsWith(today));
    return {
      total: todayRecords.length,
      totalAmount: todayRecords.reduce((sum, r) => sum + r.amount, 0),
      inProgress: todayRecords.filter(r => r.status === 'in_progress').length,
      completed: todayRecords.filter(r => r.status === 'completed').length
    };
  }
};

// 配送订单
export const deliveryService = {
  getAll(): DeliveryOrder[] {
    return storage.get<DeliveryOrder[]>(STORAGE_KEYS.DELIVERY, []);
  },

  add(data: Omit<DeliveryOrder, 'id'>): DeliveryOrder {
    const records = this.getAll();
    const newOrder: DeliveryOrder = {
      ...data,
      status: data.status || 'pending',
      id: generateId('d')
    };
    records.unshift(newOrder);
    storage.set(STORAGE_KEYS.DELIVERY, records);
    console.log('[DeliveryService] 新增订单:', newOrder);
    return newOrder;
  },

  update(id: string, data: Partial<DeliveryOrder>): DeliveryOrder | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.DELIVERY, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.DELIVERY, filtered);
    return filtered.length < records.length;
  },

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.deliveryDate === today);
    return {
      totalOrders: todayRecords.length,
      totalQuantity: todayRecords.reduce((sum, r) => sum + r.quantity, 0),
      pending: todayRecords.filter(r => r.status === 'pending').length,
      delivering: todayRecords.filter(r => r.status === 'delivering').length,
      delivered: todayRecords.filter(r => r.status === 'delivered').length
    };
  }
};

// 收支记账
export const accountingService = {
  getAll(): AccountingRecord[] {
    return storage.get<AccountingRecord[]>(STORAGE_KEYS.ACCOUNTING, []);
  },

  add(data: Omit<AccountingRecord, 'id'>): AccountingRecord {
    const records = this.getAll();
    const newRecord: AccountingRecord = {
      ...data,
      id: generateId('a')
    };
    records.unshift(newRecord);
    storage.set(STORAGE_KEYS.ACCOUNTING, records);
    console.log('[AccountingService] 新增记录:', newRecord);
    return newRecord;
  },

  update(id: string, data: Partial<AccountingRecord>): AccountingRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.ACCOUNTING, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.ACCOUNTING, filtered);
    return filtered.length < records.length;
  },

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.date === today);
    const incomeRecords = todayRecords.filter(r => r.type === 'income');
    const expenseRecords = todayRecords.filter(r => r.type === 'expense');

    const incomeByCategory = new Map<string, number>();
    incomeRecords.forEach(r => {
      incomeByCategory.set(r.category, (incomeByCategory.get(r.category) || 0) + r.amount);
    });

    const expenseByCategory = new Map<string, number>();
    expenseRecords.forEach(r => {
      expenseByCategory.set(r.category, (expenseByCategory.get(r.category) || 0) + r.amount);
    });

    const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = expenseRecords.reduce((sum, r) => sum + r.amount, 0);

    return {
      date: today,
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      incomeCount: incomeRecords.length,
      expenseCount: expenseRecords.length,
      incomeByCategory: Object.fromEntries(incomeByCategory),
      expenseByCategory: Object.fromEntries(expenseByCategory)
    };
  },

  getTodaySummary() {
    const stats = this.getTodayStats();
    return {
      totalIncome: stats.totalIncome,
      totalExpense: stats.totalExpense,
      netProfit: stats.netProfit
    };
  },

  getCategorySummary() {
    const stats = this.getTodayStats();
    const income = Object.entries(stats.incomeByCategory).map(([category, amount]) => ({
      category,
      amount
    }));
    const expense = Object.entries(stats.expenseByCategory).map(([category, amount]) => ({
      category,
      amount
    }));
    return { income, expense };
  }
};

// 每日统计
export const statsService = {
  getDailyStats(): DailyStats {
    const soakingStats = soakingService.getTodayStats();
    const pressingStats = pressingService.getTodayStats();
    const deliveryStats = deliveryService.getTodayStats();
    const accountingStats = accountingService.getTodayStats();

    return {
      date: getTodayDate(),
      beanUsed: soakingStats.totalWeight,
      tofuProduced: pressingStats.tofuAmount,
      driedTofuProduced: pressingStats.driedTofuAmount,
      tofuPuffProduced: fryingService.getTodayStats().totalAmount,
      deliveryOrders: deliveryStats.totalOrders,
      totalIncome: accountingStats.totalIncome,
      totalExpense: accountingStats.totalExpense,
      netProfit: accountingStats.netProfit
    };
  }
};

export { getTodayDate, getNowTime };
