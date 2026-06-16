import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { deliveryOrders, dailyStats } from '@/data/mockData';

const statusMap: Record<string, { text: string; className: string }> = {
  pending: { text: '待配送', className: 'pending' },
  delivering: { text: '配送中', className: 'delivering' },
  completed: { text: '已完成', className: 'completed' }
};

const DeliveryPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleRefresh = useCallback(() => {
    Taro.showLoading({ title: '刷新中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const handleAddOrder = () => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

  const handleOrderClick = (orderId: string) => {
    console.log('[Delivery] 查看订单详情:', orderId);
    Taro.showToast({
      title: '订单详情开发中',
      icon: 'none'
    });
  };

  const filteredOrders = filterStatus === 'all'
    ? deliveryOrders
    : deliveryOrders.filter(o => o.status === filterStatus);

  const totalOrders = deliveryOrders.length;
  const deliveringOrders = deliveryOrders.filter(o => o.status === 'delivering').length;
  const completedOrders = deliveryOrders.filter(o => o.status === 'completed').length;

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>早市配送排单</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{totalOrders}</Text>
            <Text className={styles.statLabel}>总订单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{deliveringOrders}</Text>
            <Text className={styles.statLabel}>配送中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{completedOrders}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.productionSummary}>
          <Text className={styles.summaryTitle}>📊 今日产量统计</Text>
          <View className={styles.productionGrid}>
            <View className={styles.productionItem}>
              <Text className={styles.productionValue}>{dailyStats.tofuProduced}斤</Text>
              <Text className={styles.productionLabel}>豆腐</Text>
            </View>
            <View className={styles.productionItem}>
              <Text className={styles.productionValue}>{dailyStats.driedTofuProduced}斤</Text>
              <Text className={styles.productionLabel}>豆干</Text>
            </View>
            <View className={styles.productionItem}>
              <Text className={styles.productionValue}>{dailyStats.tofuPuffProduced}斤</Text>
              <Text className={styles.productionLabel}>油豆腐</Text>
            </View>
            <View className={styles.productionItem}>
              <Text className={styles.productionValue}>{dailyStats.beanUsed}kg</Text>
              <Text className={styles.productionLabel}>用豆量</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>配送订单</Text>
          <Text className={styles.addBtn} onClick={handleAddOrder}>+ 新增</Text>
        </View>

        <View className={styles.filterBar}>
          {['all', 'pending', 'delivering', 'completed'].map(status => (
            <Text
              key={status}
              className={`${styles.filterTag} ${filterStatus === status ? styles.filterActive : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? '全部' : statusMap[status]?.text}
            </Text>
          ))}
        </View>

        {filteredOrders.map(order => (
          <View
            key={order.id}
            className={styles.orderCard}
            onClick={() => handleOrderClick(order.id)}
          >
            <View className={styles.orderHeader}>
              <View className={styles.customerInfo}>
                <Text className={styles.customerName}>{order.customerName}</Text>
                <Text className={styles.customerAddress}>
                  📍 {order.address}
                </Text>
              </View>
              <Text className={`${styles.orderStatus} ${styles[statusMap[order.status]?.className]}`}>
                {statusMap[order.status]?.text}
              </Text>
            </View>

            <View className={styles.orderItems}>
              {order.items.map((item, index) => (
                <View key={index} className={styles.orderItem}>
                  <Text className={styles.itemName}>{item.productName}</Text>
                  <Text className={styles.itemQty}>
                    {item.quantity} {item.unit} · ¥{item.price}/{item.unit}
                  </Text>
                </View>
              ))}
            </View>

            {order.note && (
              <Text className={styles.orderNote}>备注: {order.note}</Text>
            )}

            <View className={styles.orderFooter}>
              <Text className={styles.deliveryTime}>
                ⏰ 配送时间: {order.deliveryTime.split(' ')[1]}
              </Text>
              <Text className={styles.orderAmount}>¥{order.totalAmount}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default DeliveryPage;
