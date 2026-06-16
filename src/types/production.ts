export type ProcessType = 'soaking' | 'grinding' | 'coagulating' | 'pressing' | 'frying' | 'marinating';

export type ProcessStatus = 'pending' | 'in_progress' | 'completed';

export interface BatchRecord {
  id: string;
  batchNo: string;
  beanType: string;
  beanWeight: number;
  createdAt: string;
  status: 'active' | 'completed';
  soakingId?: string;
  grindingId?: string;
  coagulatingId?: string;
  pressingId?: string;
  marinatingId?: string;
  fryingId?: string;
  note?: string;
}

export interface SoakingRecord {
  id: string;
  batchId?: string;
  beanType: string;
  beanWeight: number;
  startTime: string;
  expectedDuration: number;
  actualDuration?: number;
  status: ProcessStatus;
  waterTemperature?: number;
  operator: string;
  note?: string;
}

export interface GrindingRecord {
  id: string;
  batchId?: string;
  beanWeight: number;
  waterAmount: number;
  startTime: string;
  endTime?: string;
  grindCount: number;
  filterType: string;
  soyMilkAmount?: number;
  okaraAmount?: number;
  status: ProcessStatus;
  operator: string;
  note?: string;
}

export interface BoilingRecord {
  id: string;
  batchId?: string;
  soyMilkAmount: number;
  startTime: string;
  boilingDuration: number;
  temperature: number;
  antiFoamUsed: boolean;
  antiFoamAmount?: number;
  status: ProcessStatus;
  operator: string;
  note?: string;
}

export interface CoagulatingRecord {
  id: string;
  batchId?: string;
  soyMilkAmount: number;
  coagulantType: 'gypsum' | 'brine';
  coagulantAmount: number;
  startTime: string;
  restingDuration: number;
  temperature: number;
  status: ProcessStatus;
  operator: string;
  note?: string;
}

export interface PressingRecord {
  id: string;
  batchId?: string;
  productType: 'tofu' | 'tofu_pudding' | 'dried_tofu' | 'tofu_skin';
  amount: number;
  startTime: string;
  pressDuration: number;
  pressWeight: number;
  status: ProcessStatus;
  operator: string;
  note?: string;
}

export interface MarinatingRecord {
  id: string;
  batchId?: string;
  productType: 'dried_tofu' | 'tofu_puff';
  amount: number;
  marinadeType: string;
  startTime: string;
  duration: number;
  temperature: number;
  status: ProcessStatus;
  operator: string;
  note?: string;
}

export interface FryingRecord {
  id: string;
  batchId?: string;
  productType: 'tofu_puff' | 'fried_dried_tofu';
  amount: number;
  oilType: string;
  oilTemperature: number;
  startTime: string;
  duration: number;
  status: ProcessStatus;
  operator: string;
  note?: string;
}

export interface DeliveryItem {
  product: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface DeliveryOrder {
  id: string;
  customer: string;
  items: DeliveryItem[];
  deliveryDate: string;
  deliveryTime: string;
  address?: string;
  contact?: string;
  phone?: string;
  status: 'pending' | 'delivering' | 'delivered' | 'cancelled';
  incomeGenerated?: boolean;
  note?: string;
}

export interface AccountingRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  createdAt: number;
  description?: string;
  note?: string;
  sourceId?: string;
}

export interface DailyStats {
  date: string;
  beanUsed: number;
  tofuProduced: number;
  driedTofuProduced: number;
  tofuPuffProduced: number;
  deliveryOrders: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}
