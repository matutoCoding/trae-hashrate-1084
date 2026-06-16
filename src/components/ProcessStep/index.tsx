import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProcessStepProps {
  icon: string;
  iconBg?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress?: number;
  stats?: { label: string; value: string }[];
  startTime?: string;
  endTime?: string;
  onClick?: () => void;
}

const statusTextMap = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成'
};

const ProcessStep: React.FC<ProcessStepProps> = ({
  icon,
  iconBg = '#F5A623',
  title,
  description,
  status,
  progress = 0,
  stats,
  startTime,
  endTime,
  onClick
}) => {
  const statusClass = status === 'in_progress' ? styles.inProgress : status === 'completed' ? styles.completed : styles.pending;

  return (
    <View className={styles.processStep} onClick={onClick}>
      <View className={styles.stepHeader}>
        <View className={styles.stepIcon} style={{ backgroundColor: iconBg }}>
          <Text>{icon}</Text>
        </View>
        <View className={styles.stepInfo}>
          <Text className={styles.stepTitle}>{title}</Text>
          {description && <Text className={styles.stepDesc}>{description}</Text>}
        </View>
        <View className={styles.stepStatus}>
          <Text className={`${styles.statusTag} ${statusClass}`}>
            {statusTextMap[status]}
          </Text>
        </View>
      </View>

      {(stats || progress > 0) && (
        <View className={styles.stepContent}>
          {stats && stats.length > 0 && (
            <View className={styles.stepStats}>
              {stats.map((stat, index) => (
                <View key={index} className={styles.statItem}>
                  <Text className={styles.statLabel}>{stat.label}</Text>
                  <Text className={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
          )}

          {progress > 0 && (
            <>
              <View className={styles.progressBar}>
                <View
                  className={styles.progressFill}
                  style={{
                    width: `${progress}%`,
                    backgroundColor: iconBg
                  }}
                />
              </View>
              <View className={styles.stepTime}>
                {startTime && <Text>开始: {startTime}</Text>}
                {endTime && <Text>预计: {endTime}</Text>}
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default ProcessStep;
