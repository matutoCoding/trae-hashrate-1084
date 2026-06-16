import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatCard from '@/components/StatCard';
import ProcessStep from '@/components/ProcessStep';
import {
  soakingService,
  grindingService,
  coagulatingService,
  pressingService,
  deliveryService,
  accountingService
} from '@/services/dataService';

const quickEntries = [
  { icon: '🫘', text: '泡豆', bg: '#64B5F6', page: '/pages/soaking/index', isTab: false },
  { icon: '⚙️', text: '磨浆', bg: '#BA68C8', page: '/pages/grinding/index', isTab: false },
  { icon: '🧊', text: '点浆', bg: '#81C784', page: '/pages/coagulating/index', isTab: false },
  { icon: '📦', text: '压制', bg: '#FFB74D', page: '/pages/pressing/index', isTab: false },
  { icon: '🍲', text: '卤制', bg: '#FF8A65', page: '/pages/frying/index', isTab: true },
  { icon: '🍤', text: '油炸', bg: '#FFB74D', page: '/pages/frying/index', isTab: true },
  { icon: '🚚', text: '配送', bg: '#4FC3F7', page: '/pages/delivery/index', isTab: true },
  { icon: '💰', text: '记账', bg: '#AED581', page: '/pages/accounting/index', isTab: true }
];

const HomePage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [soakingData, setSoakingData] = useState<any[]>([]);
  const [grindingData, setGrindingData] = useState<any[]>([]);
  const [coagulatingData, setCoagulatingData] = useState<any[]>([]);
  const [pressingData, setPressingData] = useState<any[]>([]);
  const [accountingStats, setAccountingStats] = useState<any>(null);

  const loadData = useCallback(() => {
    setSoakingData(soakingService.getAll().filter(r => r.status === 'in_progress'));
    setGrindingData(grindingService.getAll().filter(r => r.status === 'in_progress'));
    setCoagulatingData(coagulatingService.getAll().filter(r => r.status === 'in_progress'));
    setPressingData(pressingService.getAll().filter(r => r.status === 'in_progress'));
    setAccountingStats(accountingService.getTodayStats());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadData();
    }, 3000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  }, [loadData]);

  const handleQuickEntry = (page: string, isTab: boolean) => {
    if (isTab) {
      Taro.switchTab({ url: page });
    } else {
      Taro.navigateTo({ url: page });
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekDays[now.getDay()]}`;
  };

  const deliveryStats = deliveryService.getTodayStats();
  const soakingStats = soakingService.getTodayStats();
  const pressingStats = pressingService.getTodayStats();

  const inProgressSoaking = soakingData;
  const inProgressGrinding = grindingData;
  const inProgressCoagulating = coagulatingData;
  const inProgressPressing = pressingData;

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
            value={soakingStats.totalWeight}
            unit="kg"
            footerText="今日泡豆"
            onClick={() => handleQuickEntry('/pages/soaking/index', false)}
          />
          <StatCard
            icon="🧈"
            iconBg="rgba(245, 166, 35, 0.2)"
            label="豆腐产量"
            value={pressingStats.tofuAmount}
            unit="斤"
            footerText="今日产出"
            onClick={() => handleQuickEntry('/pages/pressing/index', false)}
          />
          <StatCard
            icon="📦"
            iconBg="rgba(129, 199, 132, 0.2)"
            label="配送订单"
            value={deliveryStats.totalOrders}
            unit="单"
            footerText="早市配送"
            onClick={() => handleQuickEntry('/pages/delivery/index', true)}
          />
          <StatCard
            icon="💰"
            iconBg="rgba(174, 213, 129, 0.3)"
            label="今日净利"
            value={accountingStats?.netProfit || 0}
            unit="元"
            footerText="预估收入"
            onClick={() => handleQuickEntry('/pages/accounting/index', true)}
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
              onClick={() => handleQuickEntry(entry.page, entry.isTab)}
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
                { label: '用豆量', value: `${inProgressSoaking.reduce((sum: number, r: any) => sum + r.beanWeight, 0)}kg` },
                { label: '预计', value: `${inProgressSoaking[0]?.expectedDuration || 8}h` }
              ]}
              onClick={() => handleQuickEntry('/pages/soaking/index', false)}
            />
          )}

          {inProgressGrinding.length > 0 && (
            <ProcessStep
              icon="⚙️"
              iconBg="#BA68C8"
              title="石磨磨浆"
              description="正在磨浆中"
              status="in_progress"
              progress={45}
              stats={[
                { label: '豆水比', value: '1:8' },
                { label: '批次', value: `${inProgressGrinding.length}批` }
              ]}
              onClick={() => handleQuickEntry('/pages/grinding/index', false)}
            />
          )}

          {inProgressCoagulating.length > 0 && (
            <ProcessStep
              icon="🧊"
              iconBg="#81C784"
              title="点浆凝固"
              description="蹲脑凝固中"
              status="in_progress"
              progress={80}
              stats={[
                { label: '豆浆量', value: `${inProgressCoagulating[0]?.soyMilkAmount || 0}斤` },
                { label: '凝固剂', value: inProgressCoagulating[0]?.coagulantType === 'brine' ? '盐卤' : '石膏' }
              ]}
              onClick={() => handleQuickEntry('/pages/coagulating/index', false)}
            />
          )}

          {inProgressPressing.length > 0 && (
            <ProcessStep
              icon="📦"
              iconBg="#FFB74D"
              title="压制成型"
              description="压制中"
              status="in_progress"
              progress={30}
              stats={[
                { label: '产品', value: inProgressPressing[0]?.productType === 'dried_tofu' ? '豆干' : '豆腐' },
                { label: '压制重量', value: `${inProgressPressing[0]?.pressWeight || 0}kg` }
              ]}
              onClick={() => handleQuickEntry('/pages/pressing/index', false)}
            />
          )}

          {inProgressSoaking.length === 0 &&
           inProgressGrinding.length === 0 &&
           inProgressCoagulating.length === 0 &&
           inProgressPressing.length === 0 && (
            <View style={{ padding: '32rpx 0', textAlign: 'center', color: '#A1887F', fontSize: '28rpx' }}>
              暂无进行中的生产任务
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
