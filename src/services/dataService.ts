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
    const existing = this.getAll().filter(r => r.batchNo.startsWith(`PC${today}`));
    let maxSeq = 0;
    existing.forEach(r => {
      const seqStr = r.batchNo.slice(`PC${today}`.length);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    });
    const seq = String(maxSeq + 1).padStart(3, '0');
    return `PC${today}${seq}`;
  },

  getBatchProgress(batch: BatchRecord): { currentStep: string; stepIndex: number; totalSteps: number } {
    const steps = ['soaking', 'grinding', 'coagulating', 'pressing', 'marinating', 'frying'];
    const stepNames = ['黄豆浸泡', '磨浆', '点浆凝固', '压制成型', '卤制', '油炸'];
    let currentStep = '待开始';
    let stepIndex = -1;

    for (let i = steps.length - 1; i >= 0; i--) {
      const stepKey = steps[i] as keyof BatchRecord;
      if (batch[stepKey]) {
        stepIndex = i;
        currentStep = stepNames[i];
        break;
      }
    }

    return { currentStep, stepIndex, totalSteps: steps.length };
  },

  getActiveWithProgress(): (BatchRecord & { currentStep: string; stepIndex: number })[] {
    const active = this.getActive();
    return active.map(batch => {
      const progress = this.getBatchProgress(batch);
      return { ...batch, currentStep: progress.currentStep, stepIndex: progress.stepIndex };
    });
  },

  completeBatch(id: string): BatchRecord | null {
    return this.update(id, { status: 'completed' });
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

    const beanWeightKg = batch.beanWeight;
    const soyMilkKg = grinding?.soyMilkAmount ? grinding.soyMilkAmount * 0.5 : 0;
    const okaraKg = grinding?.okaraAmount ? grinding.okaraAmount * 0.5 : 0;
    const pressWeightKg = pressing?.pressWeight || 0;
    const marinatingAmountKg = marinating?.amount ? marinating.amount * 0.5 : 0;
    const fryingAmountKg = frying?.amount ? frying.amount * 0.5 : 0;

    let yieldRate = 0;
    if (pressing && batch.beanWeight > 0) {
      yieldRate = (pressing.pressWeight / batch.beanWeight) * 100;
    }

    const weightLoss = {
      beanToMilk: beanWeightKg > 0 && soyMilkKg > 0 ? soyMilkKg - beanWeightKg : 0,
      milkToPress: soyMilkKg > 0 && pressWeightKg > 0 ? soyMilkKg - pressWeightKg : 0,
      pressToMarinade: pressWeightKg > 0 && marinatingAmountKg > 0 ? pressWeightKg - marinatingAmountKg : 0,
      marinadeToFry: marinatingAmountKg > 0 && fryingAmountKg > 0 ? marinatingAmountKg - fryingAmountKg : 0,
      finalProduct: fryingAmountKg > 0 ? fryingAmountKg : (marinatingAmountKg > 0 ? marinatingAmountKg : pressWeightKg)
    };

    return {
      batch,
      soaking,
      grinding,
      coagulating,
      pressing,
      marinating,
      frying,
      yieldRate,
      weights: {
        beanWeightKg,
        soyMilkKg,
        okaraKg,
        pressWeightKg,
        marinatingAmountKg,
        fryingAmountKg,
        ...weightLoss
      }
    };
  }
};

function createCrudService<T extends { id: string; status?: string }>(storageKey: string, idPrefix: string) {
  return {
    getAll(): T[] {
      return storage.get<T[]>(storageKey, []);
    },
    add(data: Omit<T, 'id'>): T {
      const records = this.getAll();
      const baseRecord: any = { ...data, id: generateId(idPrefix) };
      if (baseRecord.status === undefined || baseRecord.status === null) {
        baseRecord.status = 'pending';
      }
      const newRecord = baseRecord as T;
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

  addWithBatch(data: Omit<SoakingRecord, 'id' | 'batchId'>): { soaking: SoakingRecord; batch: BatchRecord } {
    const newSoaking = this.add(data);
    const newBatch = batchService.add({
      batchNo: batchService.generateBatchNo(),
      beanType: data.beanType,
      beanWeight: data.beanWeight,
      createdAt: getNowTime(),
      status: 'active',
      soakingId: newSoaking.id
    });
    this.update(newSoaking.id, { batchId: newBatch.id });
    const updatedSoaking = this.getById(newSoaking.id)!;
    return { soaking: updatedSoaking, batch: newBatch };
  },

  getById(id: string): SoakingRecord | null {
    return this.getAll().find(r => r.id === id) || null;
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

export const grindingService = {
  ...createCrudService<GrindingRecord>(STORAGE_KEYS.GRINDING, 'g'),

  add(data: Omit<GrindingRecord, 'id'>): GrindingRecord {
    const newRecord = createCrudService<GrindingRecord>(STORAGE_KEYS.GRINDING, 'g').add(data);
    if (data.batchId) {
      batchService.update(data.batchId, { grindingId: newRecord.id });
    }
    return newRecord;
  },

  getById(id: string): GrindingRecord | null {
    return this.getAll().find(r => r.id === id) || null;
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

  add(data: Omit<CoagulatingRecord, 'id'>): CoagulatingRecord {
    const newRecord = createCrudService<CoagulatingRecord>(STORAGE_KEYS.COAGULATING, 'c').add(data);
    if (data.batchId) {
      batchService.update(data.batchId, { coagulatingId: newRecord.id });
    }
    return newRecord;
  },

  getById(id: string): CoagulatingRecord | null {
    return this.getAll().find(r => r.id === id) || null;
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

export const pressingService = {
  ...createCrudService<PressingRecord>(STORAGE_KEYS.PRESSING, 'p'),

  add(data: Omit<PressingRecord, 'id'>): PressingRecord {
    const newRecord = createCrudService<PressingRecord>(STORAGE_KEYS.PRESSING, 'p').add(data);
    if (data.batchId) {
      batchService.update(data.batchId, { pressingId: newRecord.id });
    }
    return newRecord;
  },

  getById(id: string): PressingRecord | null {
    return this.getAll().find(r => r.id === id) || null;
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
      totalWeight: todayRecords.reduce((sum, r) => sum + r.pressWeight, 0),
      inProgress: todayRecords.filter(r => r.status === 'in_progress').length,
      completed: todayRecords.filter(r => r.status === 'completed').length
    };
  }
};

export const marinatingService = {
  ...createCrudService<MarinatingRecord>(STORAGE_KEYS.MARINATING, 'm'),

  add(data: Omit<MarinatingRecord, 'id'>): MarinatingRecord {
    const newRecord = createCrudService<MarinatingRecord>(STORAGE_KEYS.MARINATING, 'm').add(data);
    if (data.batchId) {
      batchService.update(data.batchId, { marinatingId: newRecord.id });
    }
    return newRecord;
  },

  getById(id: string): MarinatingRecord | null {
    return this.getAll().find(r => r.id === id) || null;
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

export const fryingService = {
  ...createCrudService<FryingRecord>(STORAGE_KEYS.FRYING, 'f'),

  add(data: Omit<FryingRecord, 'id'>): FryingRecord {
    const newRecord = createCrudService<FryingRecord>(STORAGE_KEYS.FRYING, 'f').add(data);
    if (data.batchId) {
      batchService.update(data.batchId, { fryingId: newRecord.id });
    }
    return newRecord;
  },

  getById(id: string): FryingRecord | null {
    return this.getAll().find(r => r.id === id) || null;
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
  },

  getCustomers(): string[] {
    const orders = this.getAll();
    const customerSet = new Set<string>();
    orders.forEach(o => customerSet.add(o.customer));
    return Array.from(customerSet).sort();
  },

  getCustomerOrders(customer: string): DeliveryOrder[] {
    return this.getAll()
      .filter(o => o.customer === customer)
      .sort((a, b) => {
        const dateA = `${a.deliveryDate} ${a.deliveryTime}`;
        const dateB = `${b.deliveryDate} ${b.deliveryTime}`;
        return dateB.localeCompare(dateA);
      });
  },

  getCustomerLedger(customer: string) {
    const orders = this.getCustomerOrders(customer);
    const totalOrders = orders.length;
    const totalQuantity = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    const totalAmount = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);

    const generatedIncome = orders
      .filter(o => o.incomeGenerated)
      .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);

    const pendingIncome = orders
      .filter(o => o.status === 'delivered' && !o.incomeGenerated)
      .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveringOrders = orders.filter(o => o.status === 'delivering').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    return {
      customer,
      totalOrders,
      totalQuantity,
      totalAmount,
      generatedIncome,
      pendingIncome,
      pendingOrders,
      deliveringOrders,
      deliveredOrders,
      orders
    };
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
