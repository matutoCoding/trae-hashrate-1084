import { storage, generateId, getTodayDate, getNowTime } from '@/utils/storage';
import {
  BatchRecord,
  SoakingRecord,
  GrindingRecord,
  BoilingRecord,
  CoagulatingRecord,
  PressingRecord,
  MarinatingRecord,
  FryingRecord,
  DeliveryOrder,
  DeliveryItem,
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
  BATCH: 'batch_records',
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
  INITIALIZED: 'data_initialized_v2'
};

const initializeData = () => {
  const initialized = storage.get<boolean>(STORAGE_KEYS.INITIALIZED, false);
  if (!initialized) {
    console.log('[DataService] 初始化默认数据');
    storage.set(STORAGE_KEYS.BATCH, []);
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

export const batchService = {
  getAll(): BatchRecord[] {
    return storage.get<BatchRecord[]>(STORAGE_KEYS.BATCH, []);
  },

  add(data: Omit<BatchRecord, 'id'>): BatchRecord {
    const records = this.getAll();
    const newRecord: BatchRecord = { ...data, id: generateId('batch') };
    records.unshift(newRecord);
    storage.set(STORAGE_KEYS.BATCH, records);
    return newRecord;
  },

  update(id: string, data: Partial<BatchRecord>): BatchRecord | null {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...data };
    storage.set(STORAGE_KEYS.BATCH, records);
    return records[index];
  },

  remove(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    storage.set(STORAGE_KEYS.BATCH, filtered);
    return filtered.length < records.length;
  },

  getById(id: string): BatchRecord | null {
    return this.getAll().find(r => r.id === id) || null;
  },

  getActive(): BatchRecord[] {
    return this.getAll().filter(r => r.status === 'active');
  },

  generateBatchNo(): string {
    const today = getTodayDate().replace(/-/g, '');
    const existing = this.getAll().filter(r => r.batchNo.startsWith(today));
    const seq = String(existing.length + 1).padStart(3, '0');
    return `PC${today}${seq}`;
  },

  getBatchDetail(id: string) {
    const batch = this.getById(id);
    if (!batch) return null;

    const soaking = batch.soakingId
      ? storage.get<SoakingRecord[]>(STORAGE_KEYS.SOAKING, []).find(r => r.id === batch.soakingId)
      : undefined;
    const grinding = batch.grindingId
      ? storage.get<GrindingRecord[]>(STORAGE_KEYS.GRINDING, []).find(r => r.id === batch.grindingId)
      : undefined;
    const coagulating = batch.coagulatingId
      ? storage.get<CoagulatingRecord[]>(STORAGE_KEYS.COAGULATING, []).find(r => r.id === batch.coagulatingId)
      : undefined;
    const pressing = batch.pressingId
      ? storage.get<PressingRecord[]>(STORAGE_KEYS.PRESSING, []).find(r => r.id === batch.pressingId)
      : undefined;
    const marinating = batch.marinatingId
      ? storage.get<MarinatingRecord[]>(STORAGE_KEYS.MARINATING, []).find(r => r.id === batch.marinatingId)
      : undefined;
    const frying = batch.fryingId
      ? storage.get<FryingRecord[]>(STORAGE_KEYS.FRYING, []).find(r => r.id === batch.fryingId)
      : undefined;

    let yieldRate = 0;
    if (pressing && batch.beanWeight > 0) {
      yieldRate = (pressing.pressWeight / batch.beanWeight) * 100;
    }

    return {
      batch,
      soaking,
      grinding,
      coagulating,
      pressing,
      marinating,
      frying,
      yieldRate
    };
  }
};

function createCrudService<T extends { id: string }>(storageKey: string, idPrefix: string) {
  return {
    getAll(): T[] {
      return storage.get<T[]>(storageKey, []);
    },
    add(data: Omit<T, 'id'>): T {
      const records = this.getAll();
      const newRecord = { ...data, id: generateId(idPrefix) } as T;
      records.unshift(newRecord);
      storage.set(storageKey, records);
      return newRecord;
    },
    update(id: string, data: Partial<T>): T | null {
      const records = this.getAll();
      const index = records.findIndex(r => r.id === id);
      if (index === -1) return null;
      records[index] = { ...records[index], ...data };
      storage.set(storageKey, records);
      return records[index];
    },
    remove(id: string): boolean {
      const records = this.getAll();
      const filtered = records.filter(r => r.id !== id);
      storage.set(storageKey, filtered);
      return filtered.length < records.length;
    }
  };
}

export const soakingService = {
  ...createCrudService<SoakingRecord>(STORAGE_KEYS.SOAKING, 's'),

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

export const grindingService = {
  ...createCrudService<GrindingRecord>(STORAGE_KEYS.GRINDING, 'g'),

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

export const boilingService = {
  ...createCrudService<BoilingRecord>(STORAGE_KEYS.BOILING, 'b'),

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

export const coagulatingService = {
  ...createCrudService<CoagulatingRecord>(STORAGE_KEYS.COAGULATING, 'c'),

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

export const pressingService = {
  ...createCrudService<PressingRecord>(STORAGE_KEYS.PRESSING, 'p'),

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
      totalWeight: todayRecords.reduce((sum, r) => sum + r.pressWeight, 0),
      inProgress: todayRecords.filter(r => r.status === 'in_progress').length,
      completed: todayRecords.filter(r => r.status === 'completed').length
    };
  }
};

export const marinatingService = {
  ...createCrudService<MarinatingRecord>(STORAGE_KEYS.MARINATING, 'm'),

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

export const fryingService = {
  ...createCrudService<FryingRecord>(STORAGE_KEYS.FRYING, 'f'),

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

export const deliveryService = {
  ...createCrudService<DeliveryOrder>(STORAGE_KEYS.DELIVERY, 'd'),

  getTodayStats() {
    const records = this.getAll();
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.deliveryDate === today);
    return {
      totalOrders: todayRecords.length,
      totalQuantity: todayRecords.reduce((sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0), 0),
      totalAmount: todayRecords.reduce((sum, r) => sum + r.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0),
      pending: todayRecords.filter(r => r.status === 'pending').length,
      delivering: todayRecords.filter(r => r.status === 'delivering').length,
      delivered: todayRecords.filter(r => r.status === 'delivered').length
    };
  },

  generateIncome(order: DeliveryOrder): AccountingRecord | null {
    if (order.incomeGenerated) return null;
    const totalAmount = order.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    if (totalAmount <= 0) return null;
    const itemDesc = order.items.map(i => `${i.product}${i.quantity}${i.unit}`).join('、');
    const record = accountingService.add({
      type: 'income',
      category: '配送收入',
      amount: totalAmount,
      date: order.deliveryDate,
      createdAt: Date.now(),
      description: `${order.customer} - ${itemDesc}`,
      note: `订单号: ${order.id}`,
      sourceId: order.id
    });
    deliveryService.update(order.id, { incomeGenerated: true });
    return record;
  }
};

export const accountingService = {
  ...createCrudService<AccountingRecord>(STORAGE_KEYS.ACCOUNTING, 'a'),

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

export const dashboardService = {
  getTodayDashboard() {
    const soakingStats = soakingService.getTodayStats();
    const pressingStats = pressingService.getTodayStats();
    const deliveryStats = deliveryService.getTodayStats();
    const accountingStats = accountingService.getTodayStats();
    const marinatingStats = marinatingService.getTodayStats();
    const fryingStats = fryingService.getTodayStats();

    return {
      date: getTodayDate(),
      beanUsed: soakingStats.totalWeight,
      totalOutput: pressingStats.totalWeight + marinatingStats.totalAmount + fryingStats.totalAmount,
      tofuProduced: pressingStats.tofuAmount,
      driedTofuProduced: pressingStats.driedTofuAmount,
      tofuPuffProduced: fryingStats.totalAmount,
      deliveryOrders: deliveryStats.totalOrders,
      deliveryQuantity: deliveryStats.totalQuantity,
      totalIncome: accountingStats.totalIncome,
      totalExpense: accountingStats.totalExpense,
      netProfit: accountingStats.netProfit
    };
  }
};

export const statsService = {
  getDailyStats(): DailyStats {
    const dashboard = dashboardService.getTodayDashboard();
    return {
      date: dashboard.date,
      beanUsed: dashboard.beanUsed,
      tofuProduced: dashboard.tofuProduced,
      driedTofuProduced: dashboard.driedTofuProduced,
      tofuPuffProduced: dashboard.tofuPuffProduced,
      deliveryOrders: dashboard.deliveryOrders,
      totalIncome: dashboard.totalIncome,
      totalExpense: dashboard.totalExpense,
      netProfit: dashboard.netProfit
    };
  }
};

export { getTodayDate, getNowTime };
