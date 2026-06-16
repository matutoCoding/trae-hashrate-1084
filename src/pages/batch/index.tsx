import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { batchService } from '@/services/dataService';
import type {
  BatchRecord,
  SoakingRecord,
  GrindingRecord,
  CoagulatingRecord,
  PressingRecord,
  MarinatingRecord,
  FryingRecord
} from '@/types/production';

const coagulantTypeMap: Record<string, string> = {
  brine: '盐卤',
  gypsum: '石膏'
};

const productTypeMap: Record<string, string> = {
  tofu: '豆腐',
  tofu_pudding: '豆腐脑',
  dried_tofu: '豆腐干',
  tofu_skin: '豆腐皮',
  tofu_puff: '油豆腐',
  fried_dried_tofu: '炸豆腐干'
};

type StepStatus = 'completed' | 'active' | 'pending';

interface StepConfig {
  title: string;
  status: StepStatus;
  record: SoakingRecord | GrindingRecord | CoagulatingRecord | PressingRecord | MarinatingRecord | FryingRecord | undefined;
}

const BatchDetailPage: React.FC = () => {
  const [detail, setDetail] = useState<ReturnType<typeof batchService.getBatchDetail>>(null);

  const loadData = useCallback(() => {
    const instance = Taro.getCurrentInstance();
    const id = instance.router?.params?.id;
    if (!id) {
      Taro.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    const data = batchService.getBatchDetail(id);
    setDetail(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!detail) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.noRecord}>未找到批次信息</View>
      </View>
    );
  }

  const { batch, soaking, grinding, coagulating, pressing, marinating, frying, yieldRate } = detail;

  const getStepStatus = (record: SoakingRecord | GrindingRecord | CoagulatingRecord | PressingRecord | MarinatingRecord | FryingRecord | undefined): StepStatus => {
    if (!record) return 'pending';
    if (record.status === 'completed') return 'completed';
    if (record.status === 'in_progress') return 'active';
    return 'pending';
  };

  const steps: StepConfig[] = [
    { title: '黄豆浸泡', status: getStepStatus(soaking), record: soaking },
    { title: '磨浆', status: getStepStatus(grinding), record: grinding },
    { title: '点浆凝固', status: getStepStatus(coagulating), record: coagulating },
    { title: '压制成型', status: getStepStatus(pressing), record: pressing },
    { title: '卤制', status: getStepStatus(marinating), record: marinating },
    { title: '油炸', status: getStepStatus(frying), record: frying }
  ];

  const renderStepInfo = (step: StepConfig, index: number) => {
    const { record } = step;
    if (!record) return <Text className={styles.noRecord}>暂无记录</Text>;

    switch (index) {
      case 0: {
        const r = record as SoakingRecord;
        return (
          <View className={styles.stepInfo}>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>用豆量:</Text>
              <Text className={styles.stepValue}>{r.beanWeight}kg</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>预计时长:</Text>
              <Text className={styles.stepValue}>{r.expectedDuration}h</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>水温:</Text>
              <Text className={styles.stepValue}>{r.waterTemperature}℃</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>状态:</Text>
              <Text className={styles.stepValue}>{r.status === 'completed' ? '已完成' : r.status === 'in_progress' ? '进行中' : '待开始'}</Text>
            </View>
          </View>
        );
      }
      case 1: {
        const r = record as GrindingRecord;
        const soyMilkKg = r.soyMilkAmount ? (r.soyMilkAmount * 0.5).toFixed(1) : '-';
        const okaraKg = r.okaraAmount ? (r.okaraAmount * 0.5).toFixed(1) : '-';
        return (
          <View className={styles.stepInfo}>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>豆浆量:</Text>
              <Text className={styles.stepValue}>{soyMilkKg}kg</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>豆渣量:</Text>
              <Text className={styles.stepValue}>{okaraKg}kg</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>研磨次数:</Text>
              <Text className={styles.stepValue}>{r.grindCount}次</Text>
            </View>
          </View>
        );
      }
      case 2: {
        const r = record as CoagulatingRecord;
        return (
          <View className={styles.stepInfo}>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>凝固剂:</Text>
              <Text className={styles.stepValue}>{coagulantTypeMap[r.coagulantType] || r.coagulantType}</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>凝固剂量:</Text>
              <Text className={styles.stepValue}>{r.coagulantAmount}g</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>静置时长:</Text>
              <Text className={styles.stepValue}>{r.restingDuration}min</Text>
            </View>
          </View>
        );
      }
      case 3: {
        const r = record as PressingRecord;
        return (
          <View className={styles.stepInfo}>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>产品类型:</Text>
              <Text className={styles.stepValue}>{productTypeMap[r.productType] || r.productType}</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>压制重量:</Text>
              <Text className={styles.stepValue}>{r.pressWeight}kg</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>压制时长:</Text>
              <Text className={styles.stepValue}>{r.pressDuration}min</Text>
            </View>
          </View>
        );
      }
      case 4: {
        const r = record as MarinatingRecord;
        return (
          <View className={styles.stepInfo}>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>卤汁类型:</Text>
              <Text className={styles.stepValue}>{r.marinadeType}</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>温度:</Text>
              <Text className={styles.stepValue}>{r.temperature}℃</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>时长:</Text>
              <Text className={styles.stepValue}>{r.duration}min</Text>
            </View>
          </View>
        );
      }
      case 5: {
        const r = record as FryingRecord;
        return (
          <View className={styles.stepInfo}>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>油类:</Text>
              <Text className={styles.stepValue}>{r.oilType}</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>油温:</Text>
              <Text className={styles.stepValue}>{r.oilTemperature}℃</Text>
            </View>
            <View className={styles.stepInfoItem}>
              <Text className={styles.stepLabel}>时长:</Text>
              <Text className={styles.stepValue}>{r.duration}min</Text>
            </View>
          </View>
        );
      }
      default:
        return null;
    }
  };

  const yieldPercent = Math.min(yieldRate, 100);

  const handleArchive = () => {
    Taro.showModal({
      title: '确认归档',
      content: '归档后批次将标记为已完成，确定要归档吗？',
      success: (res) => {
        if (res.confirm) {
          batchService.completeBatch(batch.id);
          loadData();
          Taro.showToast({ title: '已归档', icon: 'success' });
        }
      }
    });
  };

  const weights = detail.weights || {};
  const hasWeights = weights.beanWeightKg > 0;

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.backBtn} onClick={() => Taro.navigateBack()}>← 返回</Text>
        <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
          <Text className={styles.headerTitle}>批次详情</Text>
          <Text className={`${styles.statusBadge} ${styles[batch.status]}`}>
            {batch.status === 'active' ? '进行中' : '已完成'}
          </Text>
        </View>
        <Text className={styles.batchNo}>{batch.batchNo}</Text>
        <View className={styles.headerInfo}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>豆类品种</Text>
            <Text className={styles.infoValue}>{batch.beanType}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>投豆量</Text>
            <Text className={styles.infoValue}>{batch.beanWeight}kg</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.timeline}>
          {steps.map((step, index) => (
            <View key={step.title} className={styles.timelineItem}>
              {index < steps.length - 1 && <View className={styles.timelineLine} />}
              <View className={`${styles.timelineDot} ${styles[step.status]}`} />
              <View className={styles.timelineContent}>
                <Text className={styles.stepTitle}>{step.title}</Text>
                <View className={styles.stepCard}>
                  {renderStepInfo(step, index)}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.yieldSection}>
          <Text className={styles.yieldTitle}>产出率</Text>
          <View className={styles.yieldBar}>
            <View className={styles.yieldFill} style={{ width: `${yieldPercent}%` }} />
          </View>
          <Text className={styles.yieldText}>{yieldRate.toFixed(1)}%</Text>
        </View>

        {hasWeights && (
          <View className={styles.trackSection}>
            <Text className={styles.sectionTitle}>📦 成品追踪</Text>
            <View className={styles.trackList}>
              <View className={styles.trackItem}>
                <Text className={styles.trackLabel}>投豆量</Text>
                <Text className={styles.trackValue}>{weights.beanWeightKg.toFixed(1)}kg</Text>
              </View>
              {weights.soyMilkKg > 0 && (
                <View className={styles.trackItem}>
                  <Text className={styles.trackLabel}>豆浆量</Text>
                  <Text className={styles.trackValue}>{weights.soyMilkKg.toFixed(1)}kg</Text>
                </View>
              )}
              {weights.okaraKg > 0 && (
                <View className={styles.trackItem}>
                  <Text className={styles.trackLabel}>豆渣量</Text>
                  <Text className={styles.trackValue}>{weights.okaraKg.toFixed(1)}kg</Text>
                </View>
              )}
              {weights.pressWeightKg > 0 && (
                <View className={styles.trackItem}>
                  <Text className={styles.trackLabel}>压制成品</Text>
                  <Text className={styles.trackValue}>{weights.pressWeightKg.toFixed(1)}kg</Text>
                </View>
              )}
              {weights.marinatingAmountKg > 0 && (
                <View className={styles.trackItem}>
                  <Text className={styles.trackLabel}>卤制成品</Text>
                  <Text className={styles.trackValue}>{weights.marinatingAmountKg.toFixed(1)}kg</Text>
                </View>
              )}
              {weights.fryingAmountKg > 0 && (
                <View className={styles.trackItem}>
                  <Text className={styles.trackLabel}>油炸成品</Text>
                  <Text className={styles.trackValue}>{weights.fryingAmountKg.toFixed(1)}kg</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {hasWeights && (weights.milkToPress > 0 || weights.pressToMarinade > 0 || weights.marinadeToFry > 0) && (
          <View className={styles.lossSection}>
            <Text className={styles.sectionTitle}>📉 损耗分析</Text>
            <View className={styles.lossList}>
              {weights.milkToPress > 0 && (
                <View className={styles.lossItem}>
                  <Text className={styles.lossLabel}>豆浆→压制</Text>
                  <Text className={styles.lossValue}>-{weights.milkToPress.toFixed(1)}kg</Text>
                </View>
              )}
              {weights.pressToMarinade > 0 && (
                <View className={styles.lossItem}>
                  <Text className={styles.lossLabel}>压制→卤制</Text>
                  <Text className={styles.lossValue}>-{weights.pressToMarinade.toFixed(1)}kg</Text>
                </View>
              )}
              {weights.marinadeToFry > 0 && (
                <View className={styles.lossItem}>
                  <Text className={styles.lossLabel}>卤制→油炸</Text>
                  <Text className={styles.lossValue}>-{weights.marinadeToFry.toFixed(1)}kg</Text>
                </View>
              )}
              {weights.finalProduct > 0 && (
                <View className={styles.lossItem}>
                  <Text className={styles.lossLabel}>最终成品</Text>
                  <Text className={styles.lossFinal}>{weights.finalProduct.toFixed(1)}kg</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {batch.status === 'active' && (
          <View className={styles.archiveSection}>
            <Text className={styles.archiveBtn} onClick={handleArchive}>
              归档批次
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default BatchDetailPage;
