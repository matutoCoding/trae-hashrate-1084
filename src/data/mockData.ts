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

// 黄豆浸泡记录
export const soakingRecords: SoakingRecord[] = [
  {
    id: 's001',
    beanType: '东北大豆',
    beanWeight: 50,
    startTime: '2024-01-15 20:00',
    expectedDuration: 10,
    actualDuration: 10.5,
    status: 'completed',
    waterTemperature: 18,
    operator: '王师傅',
    note: '冬季泡发，水温略低'
  },
  {
    id: 's002',
    beanType: '东北大豆',
    beanWeight: 60,
    startTime: '2024-01-15 22:00',
    expectedDuration: 10,
    status: 'in_progress',
    waterTemperature: 20,
    operator: '王师傅'
  },
  {
    id: 's003',
    beanType: '本地黄豆',
    beanWeight: 40,
    startTime: '2024-01-16 06:00',
    expectedDuration: 8,
    status: 'pending',
    operator: '李师傅'
  }
];

// 磨浆记录
export const grindingRecords: GrindingRecord[] = [
  {
    id: 'g001',
    beanWeight: 50,
    waterAmount: 400,
    startTime: '2024-01-16 06:30',
    endTime: '2024-01-16 07:15',
    grindCount: 2,
    filterType: '纱布过滤',
    soyMilkAmount: 380,
    okaraAmount: 60,
    status: 'completed',
    operator: '王师傅',
    note: '石磨磨浆，口感细腻'
  },
  {
    id: 'g002',
    beanWeight: 30,
    waterAmount: 240,
    startTime: '2024-01-16 08:00',
    grindCount: 2,
    filterType: '纱布过滤',
    status: 'in_progress',
    operator: '王师傅'
  }
];

// 煮浆记录
export const boilingRecords: BoilingRecord[] = [
  {
    id: 'b001',
    soyMilkAmount: 200,
    startTime: '2024-01-16 07:00',
    boilingDuration: 20,
    temperature: 100,
    antiFoamUsed: true,
    antiFoamAmount: 5,
    status: 'completed',
    operator: '王师傅',
    note: '煮沸后小火保持5分钟'
  },
  {
    id: 'b002',
    soyMilkAmount: 180,
    startTime: '2024-01-16 08:30',
    boilingDuration: 25,
    temperature: 100,
    antiFoamUsed: false,
    status: 'in_progress',
    operator: '李师傅'
  }
];

// 点浆凝固记录
export const coagulatingRecords: CoagulatingRecord[] = [
  {
    id: 'c001',
    soyMilkAmount: 200,
    coagulantType: 'brine',
    coagulantAmount: 10,
    startTime: '2024-01-16 07:40',
    restingDuration: 20,
    temperature: 85,
    status: 'completed',
    operator: '王师傅',
    note: '盐卤点浆，豆腐更劲道'
  },
  {
    id: 'c002',
    soyMilkAmount: 180,
    coagulantType: 'gypsum',
    coagulantAmount: 8,
    startTime: '2024-01-16 09:10',
    restingDuration: 25,
    temperature: 82,
    status: 'in_progress',
    operator: '李师傅',
    note: '石膏点浆，豆腐更嫩滑'
  }
];

// 压制成型记录
export const pressingRecords: PressingRecord[] = [
  {
    id: 'p001',
    productType: 'tofu',
    amount: 80,
    startTime: '2024-01-16 08:10',
    pressDuration: 40,
    pressWeight: 20,
    status: 'completed',
    operator: '王师傅',
    note: '嫩豆腐，压制时间适中'
  },
  {
    id: 'p002',
    productType: 'dried_tofu',
    amount: 30,
    startTime: '2024-01-16 09:30',
    pressDuration: 90,
    pressWeight: 30,
    status: 'in_progress',
    operator: '李师傅'
  },
  {
    id: 'p003',
    productType: 'tofu_skin',
    amount: 10,
    startTime: '2024-01-16 07:00',
    pressDuration: 30,
    pressWeight: 10,
    status: 'completed',
    operator: '王师傅'
  }
];

// 卤制记录
export const marinatingRecords: MarinatingRecord[] = [
  {
    id: 'm001',
    productType: 'dried_tofu',
    amount: 20,
    marinadeType: '五香卤水',
    startTime: '2024-01-16 10:00',
    duration: 60,
    temperature: 80,
    status: 'in_progress',
    operator: '李师傅',
    note: '五香卤豆干，小火慢卤'
  },
  {
    id: 'm002',
    productType: 'dried_tofu',
    amount: 25,
    marinadeType: '麻辣卤水',
    startTime: '2024-01-15 16:00',
    duration: 90,
    temperature: 85,
    status: 'completed',
    operator: '王师傅'
  }
];

// 油炸记录
export const fryingRecords: FryingRecord[] = [
  {
    id: 'f001',
    productType: 'tofu_puff',
    amount: 15,
    oilType: '菜籽油',
    oilTemperature: 180,
    startTime: '2024-01-16 09:00',
    duration: 10,
    status: 'completed',
    operator: '李师傅',
    note: '油豆腐，金黄色即可出锅'
  },
  {
    id: 'f002',
    productType: 'fried_dried_tofu',
    amount: 10,
    oilType: '菜籽油',
    oilTemperature: 160,
    startTime: '2024-01-16 10:30',
    duration: 8,
    status: 'in_progress',
    operator: '王师傅'
  }
];

// 配送订单
export const deliveryOrders: DeliveryOrder[] = [
  {
    id: 'd001',
    customerName: '张记早餐店',
    address: '城东路128号',
    phone: '138****1234',
    items: [
      { productName: '嫩豆腐', quantity: 20, unit: '斤', price: 3.5 },
      { productName: '豆浆', quantity: 50, unit: '杯', price: 2 }
    ],
    deliveryTime: '2024-01-16 07:30',
    status: 'completed',
    totalAmount: 170,
    note: '早上7点半前送到'
  },
  {
    id: 'd002',
    customerName: '李记饭馆',
    address: '人民路56号',
    phone: '139****5678',
    items: [
      { productName: '老豆腐', quantity: 30, unit: '斤', price: 4 },
      { productName: '油豆腐', quantity: 10, unit: '斤', price: 8 }
    ],
    deliveryTime: '2024-01-16 09:00',
    status: 'delivering',
    totalAmount: 200
  },
  {
    id: 'd003',
    customerName: '王家超市',
    address: '建设街88号',
    phone: '137****9012',
    items: [
      { productName: '五香豆干', quantity: 15, unit: '斤', price: 12 },
      { productName: '千张', quantity: 10, unit: '斤', price: 6 }
    ],
    deliveryTime: '2024-01-16 10:30',
    status: 'pending',
    totalAmount: 240,
    note: '放在收银台旁边'
  },
  {
    id: 'd004',
    customerName: '陈记早餐铺',
    address: '幸福路32号',
    phone: '136****3456',
    items: [
      { productName: '嫩豆腐', quantity: 15, unit: '斤', price: 3.5 },
      { productName: '豆腐脑', quantity: 30, unit: '碗', price: 3 }
    ],
    deliveryTime: '2024-01-16 06:30',
    status: 'completed',
    totalAmount: 142.5
  }
];

// 收支记录
export const accountingRecords: AccountingRecord[] = [
  {
    id: 'a001',
    type: 'expense',
    category: '原材料',
    amount: 280,
    date: '2024-01-16',
    description: '采购东北大豆50kg',
    operator: '王师傅'
  },
  {
    id: 'a002',
    type: 'expense',
    category: '原材料',
    amount: 45,
    date: '2024-01-16',
    description: '采购石膏粉、盐卤',
    operator: '李师傅'
  },
  {
    id: 'a003',
    type: 'expense',
    category: '能源',
    amount: 30,
    date: '2024-01-16',
    description: '今日煤气费',
    operator: '王师傅'
  },
  {
    id: 'a004',
    type: 'income',
    category: '批发收入',
    amount: 520,
    date: '2024-01-16',
    description: '张记早餐店、李记饭馆等批发',
    operator: '王师傅'
  },
  {
    id: 'a005',
    type: 'income',
    category: '零售收入',
    amount: 280,
    date: '2024-01-16',
    description: '门店零售豆腐、豆干等',
    operator: '李师傅'
  },
  {
    id: 'a006',
    type: 'income',
    category: '配送收入',
    amount: 240,
    date: '2024-01-16',
    description: '王家超市配送',
    operator: '王师傅'
  },
  {
    id: 'a007',
    type: 'expense',
    category: '人工',
    amount: 200,
    date: '2024-01-16',
    description: '今日人工成本',
    operator: '王师傅'
  }
];

// 今日统计
export const dailyStats: DailyStats = {
  date: '2024-01-16',
  beanUsed: 110,
  tofuProduced: 220,
  driedTofuProduced: 25,
  tofuPuffProduced: 15,
  deliveryOrders: 4,
  totalIncome: 1040,
  totalExpense: 555,
  netProfit: 485
};

// 产品类型映射
export const productTypeMap: Record<string, string> = {
  tofu: '嫩豆腐',
  tofu_pudding: '豆腐脑',
  dried_tofu: '豆干',
  tofu_skin: '千张',
  tofu_puff: '油豆腐',
  fried_dried_tofu: '炸豆干'
};

// 状态映射
export const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待开始', color: '#86909C' },
  in_progress: { text: '进行中', color: '#F5A623' },
  completed: { text: '已完成', color: '#4CAF50' },
  delivering: { text: '配送中', color: '#2196F3' }
};
