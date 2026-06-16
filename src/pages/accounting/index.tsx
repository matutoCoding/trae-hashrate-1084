import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { accountingRecords, dailyStats } from '@/data/mockData';

const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'income', label: '收入' },
  { key: 'expense', label: '支出' }
];

const categoryIcons: Record<string, string> = {
  '原材料': '🌾',
  '能源': '🔥',
  '人工': '👷',
  '批发收入': '📦',
  '零售收入': '🏪',
  '配送收入': '🚚',
  '其他': '📋'
};

const AccountingPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleRefresh = useCallback(() => {
    Taro.showLoading({ title: '刷新中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const handleAddRecord = () => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

  const handleRecordClick = (recordId: string) => {
    console.log('[Accounting] 查看记录详情:', recordId);
    Taro.showToast({
      title: '详情开发中',
      icon: 'none'
    });
  };

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') return accountingRecords;
    return accountingRecords.filter(r => r.type === activeFilter);
  }, [activeFilter]);

  const incomeByCategory = useMemo(() => {
    const incomeRecords = accountingRecords.filter(r => r.type === 'income');
    const categoryMap = new Map<string, number>();
    incomeRecords.forEach(r => {
      categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + r.amount);
    });
    return Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const expenseByCategory = useMemo(() => {
    const expenseRecords = accountingRecords.filter(r => r.type === 'expense');
    const categoryMap = new Map<string, number>();
    expenseRecords.forEach(r => {
      categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + r.amount);
    });
    return Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const totalIncome = dailyStats.totalIncome;
  const totalExpense = dailyStats.totalExpense;
  const netProfit = dailyStats.netProfit;

  const maxIncome = incomeByCategory.length > 0 ? incomeByCategory[0][1] : 1;
  const maxExpense = expenseByCategory.length > 0 ? expenseByCategory[0][1] : 1;

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.statsHeader}>
        <View className={styles.dateSelector}>
          <Text>📅</Text>
          <Text className={styles.dateText}>{dailyStats.date} 今日账单</Text>
        </View>

        <View className={styles.statsCards}>
          <View className={styles.statCard}>
            <Text className={styles.statLabel}>今日收入</Text>
            <View className={styles.statValue}>
              ¥{totalIncome}
            </View>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statLabel}>今日支出</Text>
            <View className={styles.statValue}>
              ¥{totalExpense}
            </View>
          </View>
        </View>

        <View className={styles.netProfitSection}>
          <Text className={styles.netLabel}>今日净利润</Text>
          <Text className={styles.netValue}>¥{netProfit}</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.categorySummary}>
          <Text className={styles.summaryTitle}>💰 收入分类</Text>
          <View className={styles.categoryList}>
            {incomeByCategory.map(([category, amount]) => (
              <View key={category} className={styles.categoryItem}>
                <View className={styles.categoryIcon}>
                  <Text>{categoryIcons[category] || '💰'}</Text>
                </View>
                <View className={styles.categoryInfo}>
                  <Text className={styles.categoryName}>{category}</Text>
                  <View className={styles.categoryBar}>
                    <View
                      className={styles.categoryFill}
                      style={{
                        width: `${(amount / maxIncome) * 100}%`,
                        backgroundColor: '#4CAF50'
                      }}
                    />
                  </View>
                </View>
                <Text className={styles.categoryAmount}>¥{amount}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.categorySummary}>
          <Text className={styles.summaryTitle}>💸 支出分类</Text>
          <View className={styles.categoryList}>
            {expenseByCategory.map(([category, amount]) => (
              <View key={category} className={styles.categoryItem}>
                <View className={styles.categoryIcon}>
                  <Text>{categoryIcons[category] || '📋'}</Text>
                </View>
                <View className={styles.categoryInfo}>
                  <Text className={styles.categoryName}>{category}</Text>
                  <View className={styles.categoryBar}>
                    <View
                      className={styles.categoryFill}
                      style={{
                        width: `${(amount / maxExpense) * 100}%`,
                        backgroundColor: '#F44336'
                      }}
                    />
                  </View>
                </View>
                <Text className={styles.categoryAmount}>¥{amount}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>收支明细</Text>
          <Text className={styles.addBtn} onClick={handleAddRecord}>+ 记账</Text>
        </View>

        <View className={styles.filterBar}>
          {filterTabs.map(tab => (
            <Text
              key={tab.key}
              className={`${styles.filterTab} ${activeFilter === tab.key ? styles.active : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
            </Text>
          ))}
        </View>

        <View className={styles.recordList}>
          {filteredRecords.map(record => (
            <View
              key={record.id}
              className={styles.recordCard}
              onClick={() => handleRecordClick(record.id)}
            >
              <View className={`${styles.recordIcon} ${styles[record.type]}`}>
                <Text>{categoryIcons[record.category] || '📋'}</Text>
              </View>
              <View className={styles.recordInfo}>
                <Text className={styles.recordCategory}>{record.category}</Text>
                <Text className={styles.recordDesc}>{record.description}</Text>
              </View>
              <View className={styles.recordRight}>
                <Text className={`${styles.recordAmount} ${styles[record.type]}`}>
                  {record.type === 'income' ? '+' : '-'}¥{record.amount}
                </Text>
                <Text className={styles.recordDate}>{record.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default AccountingPage;
