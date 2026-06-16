import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  icon: string;
  iconBg?: string;
  label: string;
  value: string | number;
  unit?: string;
  footerText?: string;
  trend?: 'up' | 'down';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg = '#F5A623',
  label,
  value,
  unit,
  footerText,
  trend,
  onClick
}) => {
  return (
    <View className={styles.statCard} onClick={onClick}>
      <View className={styles.cardHeader}>
        <View className={styles.cardIcon} style={{ backgroundColor: iconBg }}>
          <Text>{icon}</Text>
        </View>
        <Text className={styles.cardLabel}>{label}</Text>
      </View>
      <View className={styles.cardValue}>
        {value}
        {unit && <Text className={styles.cardUnit}>{unit}</Text>}
      </View>
      {footerText && (
        <View className={`${styles.cardFooter} ${trend === 'up' ? styles.trendUp : ''} ${trend === 'down' ? styles.trendDown : ''}`}>
          <Text>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''}</Text>
          <Text>{footerText}</Text>
        </View>
      )}
    </View>
  );
};

export default StatCard;
