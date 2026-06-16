import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface InfoItem {
  label: string;
  value: string;
}

interface RecordItemProps {
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  infoItems?: InfoItem[];
  note?: string;
  operator?: string;
  onClick?: () => void;
}

const statusTextMap = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成'
};

const RecordItem: React.FC<RecordItemProps> = ({
  title,
  status,
  infoItems,
  note,
  operator,
  onClick
}) => {
  const statusClass = status === 'in_progress' ? styles.inProgress : status === 'completed' ? styles.completed : styles.pending;

  return (
    <View className={styles.recordItem} onClick={onClick}>
      <View className={styles.recordHeader}>
        <Text className={styles.recordTitle}>{title}</Text>
        <Text className={`${styles.recordStatus} ${statusClass}`}>
          {statusTextMap[status]}
        </Text>
      </View>

      {infoItems && infoItems.length > 0 && (
        <View className={styles.recordInfo}>
          {infoItems.map((item, index) => (
            <View key={index} className={styles.infoItem}>
              <Text className={styles.infoLabel}>{item.label}:</Text>
              <Text className={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}

      {note && <Text className={styles.recordNote}>备注: {note}</Text>}

      {operator && (
        <Text className={styles.recordOperator}>操作人: {operator}</Text>
      )}
    </View>
  );
};

export default RecordItem;
