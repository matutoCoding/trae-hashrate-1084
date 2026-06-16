import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import {
  deliveryService,
  accountingService,
  getTodayDate
} from '@/services/dataService';
import type { DeliveryOrder, DeliveryItem } from '@/types/production';

const statusTextMap: Record<string, string> = {
  pending: '待配送',
  delivering: '配送中',
  delivered: '已送达',
  cancelled: '已取消'
};

const statusColorMap: Record<string, string> = {
  pending: 'pending',
  delivering: 'delivering',
  delivered: 'delivered',
  cancelled: 'cancelled'
};

const productOptions = ['嫩豆腐', '老豆腐', '豆干', '千张', '油豆腐', '豆腐脑'];

const customerOptions = [
  '张记早点铺',
  '李记豆腐店',
  '王大妈菜市场',
  '周记早餐',
  '刘记食堂',
  '陈氏豆制品'
];

interface FormItem {
  product: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

const createEmptyItem = (): FormItem => ({
  product: '嫩豆腐',
  quantity: '',
  unit: '斤',
  unitPrice: ''
});

const DeliveryPage: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState<FormItem[]>([createEmptyItem()]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const loadData = useCallback(() => {
    let allOrders = deliveryService.getAll();
    if (filterStatus !== 'all') {
      allOrders = allOrders.filter(o => o.status === filterStatus);
    }
    setOrders(allOrders);
  }, [filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  }, [loadData]);

  const handleAdd = () => {
    const today = getTodayDate();
    setCustomer('');
    setItems([createEmptyItem()]);
    setDeliveryDate(today);
    setDeliveryTime('07:00');
    setAddress('');
    setContact('');
    setPhone('');
    setNote('');
    setShowForm(true);
  };

  const updateFormItem = (index: number, field: keyof FormItem, value: string) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItemRow = () => {
    setItems(prev => [...prev, createEmptyItem()]);
  };

  const removeItemRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!customer) {
      Taro.showToast({ title: '请填写客户名称', icon: 'none' });
      return;
    }
    const validItems = items.filter(it => it.quantity && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      Taro.showToast({ title: '请至少填写一项商品数量', icon: 'none' });
      return;
    }

    const deliveryItems: DeliveryItem[] = validItems.map(it => ({
      product: it.product,
      quantity: Number(it.quantity),
      unit: it.unit || '斤',
      unitPrice: Number(it.unitPrice) || 0
    }));

    deliveryService.add({
      customer,
      items: deliveryItems,
      deliveryDate,
      deliveryTime,
      address,
      contact,
      phone,
      note
    } as Omit<DeliveryOrder, 'id'>);

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleUpdateStatus = (id: string, status: string) => {
    deliveryService.update(id, { status: status as DeliveryOrder['status'] });
    loadData();
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  };

  const handleGenerateIncome = (order: DeliveryOrder) => {
    if (order.incomeGenerated) {
      Taro.showToast({ title: '已生成收入', icon: 'none' });
      return;
    }
    deliveryService.generateIncome(order);
    Taro.showToast({ title: '收入已生成', icon: 'success' });
    loadData();
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条配送订单吗？',
      success: (res) => {
        if (res.confirm) {
          deliveryService.remove(id);
          loadData();
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const getOrderTotal = (order: DeliveryOrder) =>
    order.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const getOrderTotalQuantity = (order: DeliveryOrder) =>
    order.items.reduce((sum, i) => sum + i.quantity, 0);

  const stats = deliveryService.getTodayStats();

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待配送' },
    { key: 'delivering', label: '配送中' },
    { key: 'delivered', label: '已送达' }
  ];

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>🚚 配送出货</Text>
        <Text className={styles.headerDesc}>早市配送排单管理</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.totalOrders}</Text>
            <Text className={styles.statLabel}>今日订单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.totalQuantity}</Text>
            <Text className={styles.statLabel}>总配送量</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>¥{stats.totalAmount}</Text>
            <Text className={styles.statLabel}>总金额</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.delivered}</Text>
            <Text className={styles.statLabel}>已送达</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>配送订单</Text>
          <Text className={styles.addBtn} onClick={handleAdd}>+ 新增</Text>
        </View>

        <View className={styles.filterBar}>
          {filters.map(f => (
            <Text
              key={f.key}
              className={`${styles.filterTag} ${filterStatus === f.key ? styles.active : ''}`}
              onClick={() => setFilterStatus(f.key)}
            >
              {f.label}
            </Text>
          ))}
        </View>

        {orders.length === 0 ? (
          <View className={styles.emptyState}>暂无订单，点击右上角新增</View>
        ) : (
          <View className={styles.orderList}>
            {orders.map(order => (
              <View key={order.id} className={styles.orderCard}>
                <View className={styles.orderHeader}>
                  <Text className={styles.orderCustomer}>{order.customer}</Text>
                  <Text className={`${styles.statusTag} ${styles[statusColorMap[order.status]]}`}>
                    {statusTextMap[order.status]}
                  </Text>
                </View>

                <View className={styles.orderInfo}>
                  {order.items.map((item, idx) => (
                    <View key={idx} className={styles.orderInfoRow}>
                      <Text className={styles.orderInfoLabel}>{item.product}:</Text>
                      <Text className={styles.orderInfoValue}>
                        {item.quantity}{item.unit} × ¥{item.unitPrice}
                      </Text>
                    </View>
                  ))}
                  <View className={styles.orderInfoRow}>
                    <Text className={styles.orderInfoLabel}>合计:</Text>
                    <Text className={styles.orderInfoValue}>
                      {getOrderTotalQuantity(order)}件 / ¥{getOrderTotal(order)}
                    </Text>
                  </View>
                  <View className={styles.orderInfoRow}>
                    <Text className={styles.orderInfoLabel}>送达时间:</Text>
                    <Text className={styles.orderInfoValue}>{order.deliveryDate} {order.deliveryTime}</Text>
                  </View>
                  {order.address && (
                    <View className={styles.orderInfoRow}>
                      <Text className={styles.orderInfoLabel}>地址:</Text>
                      <Text className={styles.orderInfoValue}>{order.address}</Text>
                    </View>
                  )}
                  {order.contact && (
                    <View className={styles.orderInfoRow}>
                      <Text className={styles.orderInfoLabel}>联系人:</Text>
                      <Text className={styles.orderInfoValue}>{order.contact} {order.phone}</Text>
                    </View>
                  )}
                </View>

                {order.note && (
                  <Text className={styles.orderNote}>备注: {order.note}</Text>
                )}

                <View className={styles.orderActions}>
                  {order.status === 'pending' && (
                    <Text
                      className={`${styles.actionBtn} ${styles.primary}`}
                      onClick={() => handleUpdateStatus(order.id, 'delivering')}
                    >
                      开始配送
                    </Text>
                  )}
                  {order.status === 'delivering' && (
                    <Text
                      className={`${styles.actionBtn} ${styles.success}`}
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    >
                      确认送达
                    </Text>
                  )}
                  {order.status === 'delivered' && !order.incomeGenerated && (
                    <Text
                      className={styles.generateBtn}
                      onClick={() => handleGenerateIncome(order)}
                    >
                      生成收入
                    </Text>
                  )}
                  {order.status === 'delivered' && order.incomeGenerated && (
                    <Text
                      className={styles.generateBtn}
                      style={{ opacity: 0.5 }}
                    >
                      已入账
                    </Text>
                  )}
                  <Text
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={() => handleDelete(order.id)}
                  >
                    删除
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {showForm && (
        <View className={styles.formOverlay} onClick={() => setShowForm(false)}>
          <View className={styles.formSheet} onClick={e => e.stopPropagation()}>
            <View className={styles.formHeader}>
              <Text className={styles.formTitle}>新增配送订单</Text>
              <Text className={styles.formClose} onClick={() => setShowForm(false)}>✕</Text>
            </View>

            <ScrollView scrollY className={styles.formBody}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>客户名称</Text>
                <View className={styles.formQuickOptions}>
                  {customerOptions.map(c => (
                    <Text
                      key={c}
                      className={`${styles.quickOption} ${customer === c ? styles.active : ''}`}
                      onClick={() => setCustomer(c)}
                    >
                      {c}
                    </Text>
                  ))}
                </View>
                <Input
                  className={styles.formInput}
                  value={customer}
                  onInput={e => setCustomer(e.detail.value)}
                  placeholder="或手动输入客户名称"
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>商品列表</Text>
                {items.map((item, idx) => (
                  <View key={idx} className={styles.itemRow}>
                    <Picker
                      mode='selector'
                      range={productOptions}
                      value={productOptions.indexOf(item.product)}
                      onChange={e => updateFormItem(idx, 'product', productOptions[Number(e.detail.value)])}
                    >
                      <View className={styles.formInput} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text>{item.product}</Text>
                        <Text style={{ color: '#999', fontSize: '22rpx' }}>▼</Text>
                      </View>
                    </Picker>
                    <Input
                      type='digit'
                      className={styles.formInput}
                      style={{ flex: 1 }}
                      value={item.quantity}
                      onInput={e => updateFormItem(idx, 'quantity', e.detail.value)}
                      placeholder='数量'
                    />
                    <Input
                      className={styles.formInput}
                      style={{ width: '80rpx', flex: 'none', textAlign: 'center' }}
                      value={item.unit}
                      onInput={e => updateFormItem(idx, 'unit', e.detail.value)}
                      placeholder='单位'
                    />
                    <Input
                      type='digit'
                      className={styles.formInput}
                      style={{ flex: 1 }}
                      value={item.unitPrice}
                      onInput={e => updateFormItem(idx, 'unitPrice', e.detail.value)}
                      placeholder='单价'
                    />
                    {items.length > 1 && (
                      <Text className={styles.itemRemove} onClick={() => removeItemRow(idx)}>✕</Text>
                    )}
                  </View>
                ))}
                <Text className={styles.addItemBtn} onClick={addItemRow}>+ 添加商品</Text>
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>送达日期</Text>
                    <Input
                      className={styles.formInput}
                      value={deliveryDate}
                      onInput={e => setDeliveryDate(e.detail.value)}
                      placeholder='YYYY-MM-DD'
                    />
                  </View>
                </View>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>送达时间</Text>
                    <Input
                      className={styles.formInput}
                      value={deliveryTime}
                      onInput={e => setDeliveryTime(e.detail.value)}
                      placeholder='HH:mm'
                    />
                  </View>
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>配送地址</Text>
                <Input
                  className={styles.formInput}
                  value={address}
                  onInput={e => setAddress(e.detail.value)}
                  placeholder='请输入地址'
                />
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>联系人</Text>
                    <Input
                      className={styles.formInput}
                      value={contact}
                      onInput={e => setContact(e.detail.value)}
                      placeholder='请输入'
                    />
                  </View>
                </View>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>联系电话</Text>
                    <Input
                      type='number'
                      className={styles.formInput}
                      value={phone}
                      onInput={e => setPhone(e.detail.value)}
                      placeholder='请输入'
                    />
                  </View>
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>备注</Text>
                <Textarea
                  className={styles.formTextarea}
                  value={note}
                  onInput={e => setNote(e.detail.value)}
                  placeholder='请输入备注信息'
                  maxlength={200}
                />
              </View>
            </ScrollView>

            <View className={styles.formFooter}>
              <Text className={`${styles.formBtn} ${styles.btnCancel}`} onClick={() => setShowForm(false)}>
                取消
              </Text>
              <Text className={`${styles.formBtn} ${styles.btnSubmit}`} onClick={handleSubmit}>
                保存
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default DeliveryPage;
