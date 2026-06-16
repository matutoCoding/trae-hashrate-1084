import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import {
  accountingService,
  getNowTime,
  getTodayDate
} from '@/services/dataService';
import type { AccountingRecord } from '@/types/production';

const incomeCategories = [
  { key: '豆腐销售', label: '豆腐销售', icon: '🧈' },
  { key: '豆干销售', label: '豆干销售', icon: '🍢' },
  { key: '千张销售', label: '千张销售', icon: '🥞' },
  { key: '油豆腐销售', label: '油豆腐销售', icon: '🍤' },
  { key: '豆腐脑销售', label: '豆腐脑销售', icon: '🥣' },
  { key: '其他收入', label: '其他收入', icon: '💰' }
];

const expenseCategories = [
  { key: '黄豆采购', label: '黄豆采购', icon: '🌱' },
  { key: '凝固剂', label: '凝固剂', icon: '🧂' },
  { key: '食用油', label: '食用油', icon: '🫒' },
  { key: '燃料水电', label: '燃料水电', icon: '�' },
  { key: '包装材料', label: '包装材料', icon: '📦' },
  { key: '人工工资', label: '人工工资', icon: '👷' },
  { key: '设备维护', label: '设备维护', icon: '�' },
  { key: '其他支出', label: '其他支出', icon: '�' }
];

const AccountingPage: React.FC = () => {
  const [records, setRecords] = useState<AccountingRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [formType, setFormType] = useState<'income' | 'expense'>('income');

  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    date: '',
    description: '',
    note: ''
  });

  const loadData = useCallback(() => {
    let allRecords = accountingService.getAll();
    if (filterType !== 'all') {
      allRecords = allRecords.filter(r => r.type === filterType);
    }
    setRecords(allRecords.sort((a, b) => new Date(b.date + ' ' + (b.time || '')).getTime() - new Date(a.date + ' ' + (a.time || '')).getTime()));
  }, [filterType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  }, [loadData]);

  const handleAdd = (type: 'income' | 'expense') => {
    setFormType(type);
    setFormData({
      type,
      category: type === 'income' ? '豆腐销售' : '黄豆采购',
      amount: '',
      date: getTodayDate(),
      description: '',
      note: ''
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.amount || !formData.category) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    accountingService.add({
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
      note: formData.note
    });

    Taro.showToast({ title: '记账成功', icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          accountingService.remove(id);
          loadData();
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const stats = accountingService.getTodaySummary();
  const categoryStats = accountingService.getCategorySummary();

  const currentCategories = formType === 'income' ? incomeCategories : expenseCategories;

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>💰 收支记账</Text>
        <Text className={styles.headerDesc}>每日收支一目了然</Text>
        <View className={styles.statsSummary}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>今日收入</Text>
            <Text className={`${styles.summaryAmount} ${styles.income}`}>
              +{stats.totalIncome.toFixed(2)}
            </Text>
          </View>
          <View className={styles.summaryDivider} />
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>今日支出</Text>
            <Text className={`${styles.summaryAmount} ${styles.expense}`}>
              -{stats.totalExpense.toFixed(2)}
            </Text>
          </View>
          <View className={styles.summaryDivider} />
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>今日净利润</Text>
            <Text className={`${styles.summaryAmount} ${stats.netProfit >= 0 ? styles.income : styles.expense}`}>
              {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.actionBar}>
          <Text
            className={`${styles.actionBtn} ${styles.addIncome}`}
            onClick={() => handleAdd('income')}
          >
            + 记收入
          </Text>
          <Text
            className={`${styles.actionBtn} ${styles.addExpense}`}
            onClick={() => handleAdd('expense')}
          >
            + 记支出
          </Text>
        </View>

        <View className={styles.filterBar}>
          <Text
            className={`${styles.filterTag} ${filterType === 'all' ? styles.active : ''}`}
            onClick={() => setFilterType('all')}
          >
            全部
          </Text>
          <Text
            className={`${styles.filterTag} ${filterType === 'income' ? styles.activeIncome : ''}`}
            onClick={() => setFilterType('income')}
          >
            收入
          </Text>
          <Text
            className={`${styles.filterTag} ${filterType === 'expense' ? styles.activeExpense : ''}`}
            onClick={() => setFilterType('expense')}
          >
            支出
          </Text>
        </View>

        {filterType !== 'expense' && (
          <View className={styles.categorySection}>
            <Text className={styles.sectionSubtitle}>📈 收入分类</Text>
            <View className={styles.categoryList}>
              {categoryStats.income.map(cat => (
                <View key={cat.category} className={styles.categoryItem}>
                  <Text className={styles.categoryName}>
                    {incomeCategories.find(c => c.key === cat.category)?.icon || '💰'} {cat.category}
                  </Text>
                  <Text className={`${styles.categoryAmount} ${styles.income}`}>
                    +{cat.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
              {categoryStats.income.length === 0 && (
                <Text className={styles.emptyHint}>暂无收入记录</Text>
              )}
            </View>
          </View>
        )}

        {filterType !== 'income' && (
          <View className={styles.categorySection}>
            <Text className={styles.sectionSubtitle}>� 支出分类</Text>
            <View className={styles.categoryList}>
              {categoryStats.expense.map(cat => (
                <View key={cat.category} className={styles.categoryItem}>
                  <Text className={styles.categoryName}>
                    {expenseCategories.find(c => c.key === cat.category)?.icon || '💸'} {cat.category}
                  </Text>
                  <Text className={`${styles.categoryAmount} ${styles.expense}`}>
                    -{cat.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
              {categoryStats.expense.length === 0 && (
                <Text className={styles.emptyHint}>暂无支出记录</Text>
              )}
            </View>
          </View>
        )}

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {filterType === 'all' ? '全部记录' : filterType === 'income' ? '收入记录' : '支出记录'}
          </Text>
          <Text className={styles.recordCount}>共 {records.length} 条</Text>
        </View>

        {records.length === 0 ? (
          <View className={styles.emptyState}>暂无记录，点击上方按钮记账</View>
        ) : (
          <View className={styles.recordList}>
            {records.map(record => {
              const allCategories = [...incomeCategories, ...expenseCategories];
              const cat = allCategories.find(c => c.key === record.category);
              return (
                <View key={record.id} className={styles.recordCard} onClick={() => handleDelete(record.id)}>
                  <View className={styles.recordIcon}>
                    {record.type === 'income' ? '📈' : '📉'}
                  </View>
                  <View className={styles.recordInfo}>
                    <Text className={styles.recordCategory}>{record.category}</Text>
                    <Text className={styles.recordDesc}>
                      {record.description || record.category}
                    </Text>
                    <Text className={styles.recordDate}>{record.date}</Text>
                  </View>
                  <View className={styles.recordAmount}>
                    <Text className={record.type === 'income' ? styles.amountIncome : styles.amountExpense}>
                      {record.type === 'income' ? '+' : '-'}{record.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {showForm && (
        <View className={styles.formOverlay} onClick={() => setShowForm(false)}>
          <View className={styles.formSheet} onClick={e => e.stopPropagation()}>
            <View className={styles.formHeader}>
              <Text className={styles.formTitle}>
                记{formType === 'income' ? '收入' : '支出'}
              </Text>
              <Text className={styles.formClose} onClick={() => setShowForm(false)}>✕</Text>
            </View>

            <ScrollView scrollY className={styles.formBody}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>分类</Text>
                <View className={styles.categoryGrid}>
                  {currentCategories.map(cat => (
                    <Text
                      key={cat.key}
                      className={`${styles.categoryOption} ${formData.category === cat.key ? styles.active : ''}`}
                      onClick={() => setFormData({ ...formData, category: cat.key })}
                    >
                      <Text className={styles.categoryOptionIcon}>{cat.icon}</Text>
                      <Text className={styles.categoryOptionLabel}>{cat.label}</Text>
                    </Text>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>金额 (元)</Text>
                <Input
                  type="digit"
                  className={styles.formInputAmount}
                  value={formData.amount}
                  onInput={e => setFormData({ ...formData, amount: e.detail.value })}
                  placeholder="请输入金额"
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>日期</Text>
                <Input
                  className={styles.formInput}
                  value={formData.date}
                  onInput={e => setFormData({ ...formData, date: e.detail.value })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>说明</Text>
                <Input
                  className={styles.formInput}
                  value={formData.description}
                  onInput={e => setFormData({ ...formData, description: e.detail.value })}
                  placeholder="简要说明"
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>备注</Text>
                <Textarea
                  className={styles.formTextarea}
                  value={formData.note}
                  onInput={e => setFormData({ ...formData, note: e.detail.value })}
                  placeholder="补充备注信息"
                  maxlength={200}
                />
              </View>
            </ScrollView>

            <View className={styles.formFooter}>
              <Text className={`${styles.formBtn} ${styles.btnCancel}`} onClick={() => setShowForm(false)}>
                取消
              </Text>
              <Text
                className={`${styles.formBtn} ${formType === 'income' ? styles.btnIncome : styles.btnExpense}`}
                onClick={handleSubmit}
              >
                保存
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default AccountingPage;
