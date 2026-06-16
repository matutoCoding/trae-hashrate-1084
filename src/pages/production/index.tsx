import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import RecordItem from '@/components/RecordItem';
import {
  soakingRecords,
  grindingRecords,
  boilingRecords,
  coagulatingRecords,
  pressingRecords
} from '@/data/mockData';

const tabs = [
  { key: 'soaking', label: '黄豆浸泡', icon: '🫘' },
  { key: 'grinding', label: '磨浆煮浆', icon: '⚙️' },
  { key: 'coagulating', label: '点浆凝固', icon: '🧊' },
  { key: 'pressing', label: '压制成型', icon: '📦' }
];

const ProductionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('soaking');

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

  const renderSoakingContent = () => {
    const totalBean = soakingRecords.reduce((sum, r) => sum + r.beanWeight, 0);
    const inProgress = soakingRecords.filter(r => r.status === 'in_progress').length;
    const completed = soakingRecords.filter(r => r.status === 'completed').length;

    return (
      <>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>今日泡豆概览</Text>
          <View className={styles.summaryStats}>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{totalBean}kg</Text>
              <Text className={styles.summaryLabel}>总用豆量</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{inProgress}</Text>
              <Text className={styles.summaryLabel}>进行中</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{completed}</Text>
              <Text className={styles.summaryLabel}>已完成</Text>
            </View>
          </View>
        </View>

        <View className={styles.recordList}>
          {soakingRecords.map(record => (
            <RecordItem
              key={record.id}
              title={`${record.beanType} - ${record.beanWeight}kg`}
              status={record.status}
              infoItems={[
                { label: '开始时间', value: record.startTime.split(' ')[1] },
                { label: '预计时长', value: `${record.expectedDuration}h` },
                { label: '水温', value: `${record.waterTemperature || '--'}℃` }
              ]}
              note={record.note}
              operator={record.operator}
              onClick={handleAdd}
            />
          ))}
        </View>
      </>
    );
  };

  const renderGrindingContent = () => {
    const totalGrind = grindingRecords.reduce((sum, r) => sum + r.beanWeight, 0);
    const totalMilk = grindingRecords.reduce((sum, r) => sum + (r.soyMilkAmount || 0), 0);

    return (
      <>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>今日磨浆概览</Text>
          <View className={styles.summaryStats}>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{totalGrind}kg</Text>
              <Text className={styles.summaryLabel}>磨豆量</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{totalMilk}斤</Text>
              <Text className={styles.summaryLabel}>豆浆量</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{boilingRecords.length}</Text>
              <Text className={styles.summaryLabel}>煮浆批次</Text>
            </View>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>磨浆记录</Text>
          <Text className={styles.addBtn} onClick={handleAdd}>+ 新增</Text>
        </View>

        <View className={styles.recordList}>
          {grindingRecords.map(record => (
            <RecordItem
              key={record.id}
              title={`第${record.id.slice(1)}批 - ${record.beanWeight}kg`}
              status={record.status}
              infoItems={[
                { label: '加水量', value: `${record.waterAmount}斤` },
                { label: '磨浆次数', value: `${record.grindCount}遍` },
                { label: '过滤方式', value: record.filterType }
              ]}
              note={record.note}
              operator={record.operator}
            />
          ))}
        </View>

        <View className={styles.sectionHeader} style={{ marginTop: 32 }}>
          <Text className={styles.sectionTitle}>煮浆记录</Text>
          <Text className={styles.addBtn} onClick={handleAdd}>+ 新增</Text>
        </View>

        <View className={styles.recordList}>
          {boilingRecords.map(record => (
            <RecordItem
              key={record.id}
              title={`煮浆 - ${record.soyMilkAmount}斤`}
              status={record.status}
              infoItems={[
                { label: '煮沸时间', value: `${record.boilingDuration}分钟` },
                { label: '温度', value: `${record.temperature}℃` },
                { label: '消泡剂', value: record.antiFoamUsed ? `${record.antiFoamAmount}g` : '未使用' }
              ]}
              note={record.note}
              operator={record.operator}
            />
          ))}
        </View>
      </>
    );
  };

  const renderCoagulatingContent = () => {
    const totalMilk = coagulatingRecords.reduce((sum, r) => sum + r.soyMilkAmount, 0);
    const brineCount = coagulatingRecords.filter(r => r.coagulantType === 'brine').length;
    const gypsumCount = coagulatingRecords.filter(r => r.coagulantType === 'gypsum').length;

    return (
      <>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>今日点浆概览</Text>
          <View className={styles.summaryStats}>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{totalMilk}斤</Text>
              <Text className={styles.summaryLabel}>总豆浆量</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{brineCount}</Text>
              <Text className={styles.summaryLabel}>盐卤点浆</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{gypsumCount}</Text>
              <Text className={styles.summaryLabel}>石膏点浆</Text>
            </View>
          </View>
        </View>

        <View className={styles.recordList}>
          {coagulatingRecords.map(record => (
            <RecordItem
              key={record.id}
              title={`${record.coagulantType === 'brine' ? '盐卤' : '石膏'}点浆 - ${record.soyMilkAmount}斤`}
              status={record.status}
              infoItems={[
                { label: '凝固剂用量', value: `${record.coagulantAmount}g` },
                { label: '蹲脑时间', value: `${record.restingDuration}分钟` },
                { label: '豆浆温度', value: `${record.temperature}℃` }
              ]}
              note={record.note}
              operator={record.operator}
            />
          ))}
        </View>
      </>
    );
  };

  const renderPressingContent = () => {
    const tofuCount = pressingRecords.filter(r => r.productType === 'tofu').length;
    const driedTofu = pressingRecords.filter(r => r.productType === 'dried_tofu').length;
    const tofuSkin = pressingRecords.filter(r => r.productType === 'tofu_skin').length;

    const productMap: Record<string, string> = {
      tofu: '嫩豆腐',
      tofu_pudding: '豆腐脑',
      dried_tofu: '豆干',
      tofu_skin: '千张'
    };

    return (
      <>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>今日成型概览</Text>
          <View className={styles.summaryStats}>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{tofuCount}</Text>
              <Text className={styles.summaryLabel}>豆腐</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{driedTofu}</Text>
              <Text className={styles.summaryLabel}>豆干</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.summaryValue}>{tofuSkin}</Text>
              <Text className={styles.summaryLabel}>千张</Text>
            </View>
          </View>
        </View>

        <View className={styles.recordList}>
          {pressingRecords.map(record => (
            <RecordItem
              key={record.id}
              title={`${productMap[record.productType]} - ${record.amount}斤`}
              status={record.status}
              infoItems={[
                { label: '压制时间', value: `${record.pressDuration}分钟` },
                { label: '压制重量', value: `${record.pressWeight}kg` },
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

  const renderContent = () => {
    switch (activeTab) {
      case 'soaking':
        return renderSoakingContent();
      case 'grinding':
        return renderGrindingContent();
      case 'coagulating':
        return renderCoagulatingContent();
      case 'pressing':
        return renderPressingContent();
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
      <ScrollView scrollX className={styles.tabBar}>
        {tabs.map(tab => (
          <Text
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.icon} {tab.label}
          </Text>
        ))}
      </ScrollView>

      <View className={styles.content}>
        {renderContent()}
      </View>
    </ScrollView>
  );
};

export default ProductionPage;
