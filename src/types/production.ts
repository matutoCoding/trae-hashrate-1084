// 生产环节类型
export type ProcessType = 'soaking' | 'grinding' | 'coagulating' | 'pressing' | 'frying' | 'marinating';

// 生产状态
export type ProcessStatus = 'pending' | 'in_progress' | 'completed';

// 黄豆浸泡记录
export interface SoakingRecord {
  id: string;
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

// 磨浆记录
export interface GrindingRecord {
  id: string;
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

// 煮浆记录
export interface BoilingRecord {
  id: string;
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

// 点浆凝固记录
export interface CoagulatingRecord {
  id: string;
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

// 压制成型记录
export interface PressingRecord {
  id: string;
  productType: 'tofu' | 'tofu_pudding' | 'dried_tofu' | 'tofu_skin';
  amount: number;
  startTime: string;
  pressDuration: number;
  pressWeight: number;
  status: ProcessStatus;
  operator: string;
  note?: string;
}

// 卤制记录
export interface MarinatingRecord {
  id: string;
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

// 油炸记录
export interface FryingRecord {
  id: string;
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

// 配送订单
export interface DeliveryOrder {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  items: DeliveryItem[];
  deliveryTime: string;
  status: 'pending' | 'delivering' | 'completed';
  totalAmount: number;
  note?: string;
}

export interface DeliveryItem {
  productName: string;
  quantity: number;
  unit: string;
  price: number;
}

// 收支记录
export interface AccountingRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  operator: string;
}

// 今日统计
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
