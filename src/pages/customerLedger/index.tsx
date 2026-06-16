import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { deliveryService } from '@/services/dataService';
import type { DeliveryOrder } from '@/types/production';

const statusMap: Record<string, string> = {
  pending: '待配送',
  delivering: '配送中',
  delivered: '已送达'
};

const statusClassMap: Record<string, string> = {
  pending: 'pending',
  delivering: 'inProgress',
  delivered: 'completed'
};

const CustomerLedgerPage = () => {
  const router = useRouter();
  const customer = router.params.customer || '';
  const [ledger, setLedger] = useState<any>(null);

  const loadData = useCallback(() => {
    const data = deliveryService.getCustomerLedger(decodeURIComponent(customer));
    setLedger(data);
  }, [customer]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateIncome = (order: DeliveryOrder) => {
    Taro.showModal({
      title: '生成收入',
      content: `确定将该订单生成收入记录吗？`,
      success: (res) => {
        if (res.confirm) {
          deliveryService.generateIncome(order);
          loadData();
          Taro.showToast({ title: '已生成', icon: 'success' });
        }
      }
    });
  };

  if (!ledger) {
    return (
      <View className={styles.pageContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.backBtn} onClick={() => Taro.navigateBack()}>← 返回</Text>
        <Text className={styles.headerTitle}>{ledger.customer}</Text>
        <Text className={styles.headerDesc}>客户账本</Text>
        <View className={styles.summaryGrid}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{ledger.totalOrders}</Text>
            <Text className={styles.summaryLabel}>总订单</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>¥{ledger.totalAmount.toFixed(2)}</Text>
            <Text className={styles.summaryLabel}>总金额</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue income}>¥{ledger.generatedIncome.toFixed(2)}</Text>
            <Text className={styles.summaryLabel}>已入账</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue pending}>¥{ledger.pendingIncome.toFixed(2)}</Text>
            <Text className={styles.summaryLabel}>未入账</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>订单统计</Text>
          <View className={styles.statsRow}>
            <View className={styles.statsItem}>
              <Text className={styles.statsNum}>{ledger.pendingOrders}</Text>
              <Text className={styles.statsLabel}>待配送</Text>
            </View>
            <View className={styles.statsItem}>
              <Text className={styles.statsNum}>{ledger.deliveringOrders}</Text>
              <Text className={styles.statsLabel}>配送中</Text>
            </View>
            <View className={styles.statsItem}>
              <Text className={styles.statsNum}>{ledger.deliveredOrders}</Text>
              <Text className={styles.statsLabel}>已送达</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>历史订单</Text>
            <Text className={styles.sectionCount}>共{ledger.orders.length}单</Text>
          </View>
          <View className={styles.orderList}>
            {ledger.orders.map((order: DeliveryOrder) => {
              const totalAmount = order.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
              return (
                <View key={order.id} className={styles.orderCard}>
                  <View className={styles.orderHeader}>
                    <View className={styles.orderDate}>
                      <Text className={styles.orderDateText}>{order.deliveryDate}</Text>
                      <Text className={styles.orderTime}>{order.deliveryTime}</Text>
                    </View>
                    <Text className={`${styles.statusTag} ${styles[statusClassMap[order.status]]}`}>
                      {statusMap[order.status]}
                    </Text>
                  </View>
                  <View className={styles.orderItems}>
                    {order.items.map((item, idx) => (
                      <Text key={idx} className={styles.orderItem}>
                        {item.product} {item.quantity}{item.unit}
                      </Text>
                    ))}
                  </View>
                  <View className={styles.orderFooter}>
                    <View className={styles.orderAmount}>
                      <Text className={styles.amountLabel}>金额</Text>
                      <Text className={styles.amountValue}>¥{totalAmount.toFixed(2)}</Text>
                    </View>
                    {order.status === 'delivered' && !order.incomeGenerated && (
                      <Text
                        className={styles.generateBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateIncome(order);
                        }}
                      >
                        生成收入
                      </Text>
                    )}
                    {order.incomeGenerated && (
                      <Text className={styles.incomeTag}>已入账</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CustomerLedgerPage;
