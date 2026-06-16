import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import {
  soakingService,
  grindingService,
  coagulatingService,
  pressingService
} from '@/services/dataService';

const processList = [
  {
    key: 'soaking',
    icon: '🫘',
    title: '黄豆浸泡',
    desc: '记录黄豆泡发时长、水温',
    bg: 'linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%)',
    page: '/pages/soaking/index'
  },
  {
    key: 'grinding',
    icon: '⚙️',
    title: '磨浆煮浆',
    desc: '石磨磨浆、滤渣、煮浆消泡',
    bg: 'linear-gradient(135deg, #BA68C8 0%, #AB47BC 100%)',
    page: '/pages/grinding/index'
  },
  {
    key: 'coagulating',
    icon: '🧊',
    title: '点浆凝固',
    desc: '石膏/卤水点浆、蹲脑凝固',
    bg: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
    page: '/pages/coagulating/index'
  },
  {
    key: 'pressing',
    icon: '📦',
    title: '压制成型',
    desc: '上箱压制、豆腐豆干豆皮成型',
    bg: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)',
    page: '/pages/pressing/index'
  }
];

const ProductionPage: React.FC = () => {
  const [stats, setStats] = useState<any>({});

  const loadStats = useCallback(() => {
    setStats({
      soaking: soakingService.getTodayStats(),
      grinding: grindingService.getTodayStats(),
      coagulating: coagulatingService.getTodayStats(),
      pressing: pressingService.getTodayStats()
    });
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadStats();
    }, 5000);
    return () => clearInterval(timer);
  }, [loadStats]);

  const handleRefresh = useCallback(() => {
    loadStats();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  }, [loadStats]);

  const handleProcessClick = (page: string) => {
    Taro.navigateTo({ url: page });
  };

  const getStatText = (key: string) => {
    const s = stats[key];
    if (!s) return { main: '-', sub: '' };
    switch (key) {
      case 'soaking':
        return { main: `${s.totalWeight}kg`, sub: `${s.inProgress}批进行中` };
      case 'grinding':
        return { main: `${s.totalMilk}斤`, sub: `${s.inProgress}批进行中` };
      case 'coagulating':
        return { main: `${s.totalMilk}斤`, sub: `盐卤${s.brineCount} / 石膏${s.gypsumCount}` };
      case 'pressing':
        return { main: `${s.tofuAmount}斤`, sub: `豆腐${s.tofuAmount} / 豆干${s.driedTofuAmount}` };
      default:
        return { main: '-', sub: '' };
    }
  };

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <Text className={styles.headerTitle}>🏭 生产管理</Text>
        <Text className={styles.headerDesc}>四大生产环节，全程记录追溯</Text>
      </View>

      <View className={styles.processGrid}>
        {processList.map(item => {
          const stat = getStatText(item.key);
          return (
            <View
              key={item.key}
              className={styles.processCard}
              style={{ background: item.bg }}
              onClick={() => handleProcessClick(item.page)}
            >
              <View className={styles.cardIcon}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.cardTitle}>{item.title}</Text>
              <Text className={styles.cardDesc}>{item.desc}</Text>
              <View className={styles.cardStats}>
                <Text className={styles.cardMainStat}>{stat.main}</Text>
                <Text className={styles.cardSubStat}>{stat.sub}</Text>
              </View>
              <View className={styles.cardArrow}>
                <Text>进入 →</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View className={styles.tipSection}>
        <Text className={styles.tipTitle}>💡 生产流程</Text>
        <View className={styles.flowSteps}>
          <View className={styles.flowStep}>
            <Text className={styles.flowIcon}>🫘</Text>
            <Text className={styles.flowText}>泡豆</Text>
          </View>
          <Text className={styles.flowArrow}>→</Text>
          <View className={styles.flowStep}>
            <Text className={styles.flowIcon}>⚙️</Text>
            <Text className={styles.flowText}>磨浆</Text>
          </View>
          <Text className={styles.flowArrow}>→</Text>
          <View className={styles.flowStep}>
            <Text className={styles.flowIcon}>🧊</Text>
            <Text className={styles.flowText}>点浆</Text>
          </View>
          <Text className={styles.flowArrow}>→</Text>
          <View className={styles.flowStep}>
            <Text className={styles.flowIcon}>📦</Text>
            <Text className={styles.flowText}>压制</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductionPage;
