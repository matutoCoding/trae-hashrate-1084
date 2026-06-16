import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import {
  deliveryService,
  getNowTime
} from '@/services/dataService';
import type { DeliveryOrder } from '@/types/production';

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

const productOptions = [
  { key: '嫩豆腐', label: '嫩豆腐' },
  { key: '老豆腐', label: '老豆腐' },
  { key: '豆干', label: '豆干' },
  { key: '千张', label: '千张' },
  { key: '油豆腐', label: '油豆腐' },
  { key: '豆腐脑', label: '豆腐脑' }
];

const customerOptions = [
  '张记早点铺',
  '李记豆腐店',
  '王大妈菜市场',
  '周记早餐',
  '刘记食堂',
  '陈氏豆制品'
];

const DeliveryPage: React.FC = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    customer: '',
    product: '嫩豆腐',
    quantity: '',
    deliveryDate: '',
    deliveryTime: '',
    address: '',
    contact: '',
    phone: '',
    note: ''
  });

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
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setFormData({
      customer: '',
      product: '嫩豆腐',
      quantity: '',
      deliveryDate: dateStr,
      deliveryTime: '07:00',
      address: '',
      contact: '',
      phone: '',
      note: ''
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.customer || !formData.quantity) {
      Taro.showToast({ title: '请填写客户和数量', icon: 'none' });
      return;
    }

    deliveryService.add({
      customer: formData.customer,
      product: formData.product,
      quantity: Number(formData.quantity),
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime,
      address: formData.address,
      contact: formData.contact,
      phone: formData.phone,
      note: formData.note
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleUpdateStatus = (id: string, status: string) => {
    deliveryService.update(id, { status: status as any });
    loadData();
    Taro.showToast({ title: '状态已更新', icon: 'success' });
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
            <Text className={styles.statValue}>{stats.totalQuantity}斤</Text>
            <Text className={styles.statLabel}>总配送量</Text>
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
                  <View className={styles.orderInfoRow}>
                    <Text className={styles.orderInfoLabel}>商品:</Text>
                    <Text className={styles.orderInfoValue}>{order.product}</Text>
                  </View>
                  <View className={styles.orderInfoRow}>
                    <Text className={styles.orderInfoLabel}>数量:</Text>
                    <Text className={styles.orderInfoValue}>{order.quantity}斤</Text>
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
                    <>
                      <Text
                        className={`${styles.actionBtn} ${styles.primary}`}
                        onClick={() => handleUpdateStatus(order.id, 'delivering')}
                      >
                        开始配送
                      </Text>
                    </>
                  )}
                  {order.status === 'delivering' && (
                    <>
                      <Text
                        className={`${styles.actionBtn} ${styles.success}`}
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      >
                        确认送达
                      </Text>
                    </>
                  )}
                  {order.status === 'delivered' && null}
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
                      className={`${styles.quickOption} ${formData.customer === c ? styles.active : ''}`}
                      onClick={() => setFormData({ ...formData, customer: c })}
                    >
                      {c}
                    </Text>
                  ))}
                </View>
                <Input
                  className={styles.formInput}
                  value={formData.customer}
                  onInput={e => setFormData({ ...formData, customer: e.detail.value })}
                  placeholder="或手动输入客户名称"
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>商品</Text>
                <View className={styles.formRadioGroup}>
                  {productOptions.map(opt => (
                    <Text
                      key={opt.key}
                      className={`${styles.formRadioItem} ${formData.product === opt.key ? styles.active : ''}`}
                      onClick={() => setFormData({ ...formData, product: opt.key })}
                    >
                      {opt.label}
                    </Text>
                  ))}
                </View>
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>数量 (斤)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.quantity}
                      onInput={e => setFormData({ ...formData, quantity: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>送达时间</Text>
                    <Input
                      className={styles.formInput}
                      value={formData.deliveryTime}
                      onInput={e => setFormData({ ...formData, deliveryTime: e.detail.value })}
                      placeholder="HH:mm"
                    />
                  </View>
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>送达日期</Text>
                <Input
                  className={styles.formInput}
                  value={formData.deliveryDate}
                  onInput={e => setFormData({ ...formData, deliveryDate: e.detail.value })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>配送地址</Text>
                <Input
                  className={styles.formInput}
                  value={formData.address}
                  onInput={e => setFormData({ ...formData, address: e.detail.value })}
                  placeholder="请输入地址"
                />
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>联系人</Text>
                    <Input
                      className={styles.formInput}
                      value={formData.contact}
                      onInput={e => setFormData({ ...formData, contact: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>联系电话</Text>
                    <Input
                      type="number"
                      className={styles.formInput}
                      value={formData.phone}
                      onInput={e => setFormData({ ...formData, phone: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>备注</Text>
                <Textarea
                  className={styles.formTextarea}
                  value={formData.note}
                  onInput={e => setFormData({ ...formData, note: e.detail.value })}
                  placeholder="请输入备注信息"
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
