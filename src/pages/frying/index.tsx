import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import RecordItem from '@/components/RecordItem';
import { marinatingRecords, fryingRecords } from '@/data/mockData';

const tabs = [
  { key: 'marinating', label: '卤水卤制', icon: '🍲' },
  { key: 'frying', label: '油炸', icon: '🍤' }
];

const FryingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('marinating');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleAdd = () => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  };

  const handleRefresh = useCallback(() => {
    Taro.showLoading({ title: '刷新中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const renderMarinatingContent = () => {
    const totalAmount = marinatingRecords.reduce((sum, r) => sum + r.amount, 0);
    const inProgress = marinatingRecords.filter(r => r.status === 'in_progress').length;
    const completed = marinatingRecords.filter(r => r.status === 'completed').length;

    return (
      <>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>今日卤制概览</Text>
          <View className={styles.summaryStats}>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{totalAmount}斤</Text>
              <Text className={styles.summaryLabel}>总产量</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{inProgress}</Text>
              <Text className={styles.summaryLabel}>卤制中</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{completed}</Text>
              <Text className={styles.summaryLabel}>已完成</Text>
            </View>
          </View>
        </View>

        <View className={styles.recipeCard}>
          <Text className={styles.recipeTitle}>
            🍲 五香卤水配方
          </Text>
          <View className={styles.recipeContent}>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>八角</Text>
              <Text className={styles.recipeValue}>10g</Text>
            </View>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>桂皮</Text>
              <Text className={styles.recipeValue}>8g</Text>
            </View>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>香叶</Text>
              <Text className={styles.recipeValue}>5g</Text>
            </View>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>花椒</Text>
              <Text className={styles.recipeValue}>6g</Text>
            </View>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>生抽</Text>
              <Text className={styles.recipeValue}>100ml</Text>
            </View>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>老抽</Text>
              <Text className={styles.recipeValue}>50ml</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>卤制记录</Text>
          <Text className={styles.addBtn} onClick={handleAdd}>+ 新增</Text>
        </View>

        <View className={styles.recordList}>
          {marinatingRecords.map(record => (
            <RecordItem
              key={record.id}
              title={`${record.marinadeType} - ${record.amount}斤`}
              status={record.status}
              infoItems={[
                { label: '卤制时间', value: `${record.duration}分钟` },
                { label: '卤温', value: `${record.temperature}℃` },
                { label: '开始时间', value: record.startTime.split(' ')[1] }
              ]}
              note={record.note}
              operator={record.operator}
            />
          ))}
        </View>
      </>
    );
  };

  const renderFryingContent = () => {
    const totalAmount = fryingRecords.reduce((sum, r) => sum + r.amount, 0);
    const inProgress = fryingRecords.filter(r => r.status === 'in_progress').length;
    const completed = fryingRecords.filter(r => r.status === 'completed').length;

    const productMap: Record<string, string> = {
      tofu_puff: '油豆腐',
      fried_dried_tofu: '炸豆干'
    };

    return (
      <>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>今日油炸概览</Text>
          <View className={styles.summaryStats}>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{totalAmount}斤</Text>
              <Text className={styles.summaryLabel}>总产量</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{inProgress}</Text>
              <Text className={styles.summaryLabel}>油炸中</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{completed}</Text>
              <Text className={styles.summaryLabel}>已完成</Text>
            </View>
          </View>
        </View>

        <View className={styles.recipeCard}>
          <Text className={styles.recipeTitle}>
            🍳 油炸要点
          </Text>
          <View className={styles.recipeContent}>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>油豆腐油温</Text>
              <Text className={styles.recipeValue}>180℃</Text>
            </View>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>炸豆干油温</Text>
              <Text className={styles.recipeValue}>160℃</Text>
            </View>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>油炸时间</Text>
              <Text className={styles.recipeValue}>8-10分钟</Text>
            </View>
            <View className={styles.recipeItem}>
              <Text className={styles.recipeLabel}>用油量</Text>
              <Text className={styles.recipeValue}>每批约5斤</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>油炸记录</Text>
          <Text className={styles.addBtn} onClick={handleAdd}>+ 新增</Text>
        </View>

        <View className={styles.recordList}>
          {fryingRecords.map(record => (
            <RecordItem
              key={record.id}
              title={`${productMap[record.productType]} - ${record.amount}斤`}
              status={record.status}
              infoItems={[
                { label: '油炸时间', value: `${record.duration}分钟` },
                { label: '油温', value: `${record.oilTemperature}℃` },
                { label: '食用油', value: record.oilType }
              ]}
              note={record.note}
              operator={record.operator}
            />
          ))}
        </View>
      </>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'marinating':
        return renderMarinatingContent();
      case 'frying':
        return renderFryingContent();
      default:
        return null;
    }
  };

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.tabBar}>
        {tabs.map(tab => (
          <Text
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.icon} {tab.label}
          </Text>
        ))}
      </View>

      <View className={styles.content}>
        {renderContent()}
      </View>
    </ScrollView>
  );
};

export default FryingPage;
