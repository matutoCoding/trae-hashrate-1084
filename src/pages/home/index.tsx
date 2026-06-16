import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatCard from '@/components/StatCard';
import ProcessStep from '@/components/ProcessStep';
import {
  dailyStats,
  soakingRecords,
  grindingRecords,
  coagulatingRecords,
  pressingRecords
} from '@/data/mockData';

const quickEntries = [
  { icon: '🫘', text: '泡豆', bg: '#64B5F6', page: 'production' },
  { icon: '⚙️', text: '磨浆', bg: '#BA68C8', page: 'production' },
  { icon: '🧊', text: '点浆', bg: '#81C784', page: 'production' },
  { icon: '📦', text: '压制', bg: '#FFB74D', page: 'production' },
  { icon: '🍲', text: '卤制', bg: '#FF8A65', page: 'frying' },
  { icon: '🍤', text: '油炸', bg: '#FFB74D', page: 'frying' },
  { icon: '🚚', text: '配送', bg: '#4FC3F7', page: 'delivery' },
  { icon: '💰', text: '记账', bg: '#AED581', page: 'accounting' }
];

const HomePage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  const handleQuickEntry = (page: string) => {
    Taro.switchTab({ url: `/pages/${page}/index` });
  };

  const getCurrentDate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekDays[now.getDay()]}`;
  };

  const inProgressSoaking = soakingRecords.filter(r => r.status === 'in_progress');
  const inProgressGrinding = grindingRecords.filter(r => r.status === 'in_progress');
  const inProgressCoagulating = coagulatingRecords.filter(r => r.status === 'in_progress');
  const inProgressPressing = pressingRecords.filter(r => r.status === 'in_progress');

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <Text className={styles.greeting}>早上好，师傅</Text>
        <Text className={styles.shopName}>豆香坊作坊</Text>
        <Text className={styles.dateText}>{getCurrentDate()} · 今日生产</Text>
      </View>

      <View className={styles.statsSection}>
        <Text className={styles.sectionTitle}>今日统计</Text>
        <View className={styles.statsGrid}>
          <StatCard
            icon="🫘"
            iconBg="rgba(100, 181, 246, 0.2)"
            label="用豆量"
            value={dailyStats.beanUsed}
            unit="kg"
            footerText="较昨日 +5kg"
            trend="up"
          />
          <StatCard
            icon="🧈"
            iconBg="rgba(245, 166, 35, 0.2)"
            label="豆腐产量"
            value={dailyStats.tofuProduced}
            unit="斤"
            footerText="较昨日 +10斤"
            trend="up"
          />
          <StatCard
            icon="📦"
            iconBg="rgba(129, 199, 132, 0.2)"
            label="配送订单"
            value={dailyStats.deliveryOrders}
            unit="单"
            footerText="早市配送"
          />
          <StatCard
            icon="💰"
            iconBg="rgba(174, 213, 129, 0.3)"
            label="今日净利"
            value={dailyStats.netProfit}
            unit="元"
            footerText="预估收入"
            trend="up"
          />
        </View>
      </View>

      <View className={styles.quickEntrySection}>
        <Text className={styles.sectionTitle}>快捷入口</Text>
        <View className={styles.quickGrid}>
          {quickEntries.map((entry, index) => (
            <View
              key={index}
              className={styles.quickItem}
              onClick={() => handleQuickEntry(entry.page)}
            >
              <View
                className={styles.quickIcon}
                style={{ backgroundColor: entry.bg + '30' }}
              >
                <Text>{entry.icon}</Text>
              </View>
              <Text className={styles.quickText}>{entry.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.processSection}>
        <Text className={styles.sectionTitle}>生产进度</Text>
        <View className={styles.processList}>
          {inProgressSoaking.length > 0 && (
            <ProcessStep
              icon="🫘"
              iconBg="#64B5F6"
              title="黄豆浸泡"
              description={`${inProgressSoaking.length}批正在泡发`}
              status="in_progress"
              progress={65}
              stats={[
                { label: '用豆量', value: `${inProgressSoaking.reduce((sum, r) => sum + r.beanWeight, 0)}kg` },
                { label: '已泡', value: `${inProgressSoaking[0].expectedDuration * 0.65}h` }
              ]}
              startTime={inProgressSoaking[0].startTime.split(' ')[1]}
              endTime={`${inProgressSoaking[0].expectedDuration}h后完成`}
            />
          )}

          {inProgressGrinding.length > 0 && (
            <ProcessStep
              icon="⚙️"
              iconBg="#BA68C8"
              title="石磨磨浆"
              description="正在磨第二遍"
              status="in_progress"
              progress={45}
              stats={[
                { label: '豆水比', value: '1:8' },
                { label: '预计豆浆', value: '380斤' }
              ]}
            />
          )}

          {inProgressCoagulating.length > 0 && (
            <ProcessStep
              icon="🧊"
              iconBg="#81C784"
              title="点浆凝固"
              description="盐卤点浆，蹲脑中"
              status="in_progress"
              progress={80}
              stats={[
                { label: '豆浆量', value: `${inProgressCoagulating[0].soyMilkAmount}斤` },
                { label: '凝固剂', value: '盐卤' }
              ]}
            />
          )}

          {inProgressPressing.length > 0 && (
            <ProcessStep
              icon="📦"
              iconBg="#FFB74D"
              title="压制成型"
              description="豆干压制中"
              status="in_progress"
              progress={30}
              stats={[
                { label: '产品', value: '豆干' },
                { label: '压制重量', value: '30kg' }
              ]}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
