import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { soakingService, getNowTime, batchService } from '@/services/dataService';
import type { SoakingRecord, BatchRecord } from '@/types/production';

const statusTextMap: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成'
};

const SoakingPage: React.FC = () => {
  const [records, setRecords] = useState<SoakingRecord[]>([]);
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    beanType: '东北大豆',
    beanWeight: '',
    startTime: '',
    expectedDuration: '8',
    waterTemperature: '20',
    operator: '王师傅',
    note: ''
  });

  const loadData = useCallback(() => {
    const data = soakingService.getAll();
    setRecords(data);
    const batchesData = batchService.getAll();
    setBatches(batchesData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  }, [loadData]);

  const handleAdd = () => {
    setFormData({
      beanType: '东北大豆',
      beanWeight: '',
      startTime: getNowTime(),
      expectedDuration: '8',
      waterTemperature: '20',
      operator: '王师傅',
      note: ''
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.beanWeight) {
      Taro.showToast({ title: '请填写用豆量', icon: 'none' });
      return;
    }

    const { batch } = soakingService.addWithBatch({
      beanType: formData.beanType,
      beanWeight: Number(formData.beanWeight),
      startTime: formData.startTime || getNowTime(),
      expectedDuration: Number(formData.expectedDuration),
      waterTemperature: Number(formData.waterTemperature),
      operator: formData.operator,
      note: formData.note
    });

    Taro.showToast({ title: `批次 ${batch.batchNo} 创建成功`, icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleStart = (id: string) => {
    soakingService.update(id, { status: 'in_progress' });
    loadData();
    Taro.showToast({ title: '已开始', icon: 'success' });
  };

  const handleComplete = (id: string) => {
    const record = records.find(r => r.id === id);
    soakingService.update(id, {
      status: 'completed',
      actualDuration: record?.expectedDuration || 8
    });
    loadData();
    Taro.showToast({ title: '已完成', icon: 'success' });
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          soakingService.remove(id);
          loadData();
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const handleCardClick = (record: SoakingRecord) => {
    if (record.batchId) {
      Taro.navigateTo({ url: `/pages/batch/index?id=${record.batchId}` });
    }
  };

  const stats = soakingService.getTodayStats();

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>🫘 黄豆浸泡</Text>
        <Text className={styles.headerDesc}>记录每批黄豆的泡发情况</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.totalWeight}kg</Text>
            <Text className={styles.statLabel}>今日用豆</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.inProgress}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>浸泡记录</Text>
          <Text className={styles.addBtn} onClick={handleAdd}>+ 新增批次</Text>
        </View>

        {records.length === 0 ? (
          <View className={styles.emptyState}>暂无记录，点击右上角新增</View>
        ) : (
          <View className={styles.recordList}>
            {records.map(record => {
              const batchNo = record.batchId ? batches.find(b => b.id === record.batchId)?.batchNo : undefined;
              return (
                <View key={record.id} className={styles.recordCard} onClick={() => handleCardClick(record)}>
                  <View className={styles.recordHeader}>
                    <Text className={styles.recordTitle}>
                      {batchNo ? `${batchNo} · ` : ''}{record.beanType} - {record.beanWeight}kg
                    </Text>
                    <Text className={`${styles.statusTag} ${styles[record.status]}`}>
                      {statusTextMap[record.status]}
                    </Text>
                  </View>

                  <View className={styles.recordInfo}>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>开始时间:</Text>
                      <Text className={styles.recordInfoValue}>{record.startTime}</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>预计时长:</Text>
                      <Text className={styles.recordInfoValue}>{record.expectedDuration}h</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>水温:</Text>
                      <Text className={styles.recordInfoValue}>{record.waterTemperature}℃</Text>
                    </View>
                    {record.actualDuration && (
                      <View className={styles.recordInfoItem}>
                        <Text className={styles.recordInfoLabel}>实际时长:</Text>
                        <Text className={styles.recordInfoValue}>{record.actualDuration}h</Text>
                      </View>
                    )}
                  </View>

                  {record.note && (
                    <Text className={styles.recordNote}>备注: {record.note}</Text>
                  )}

                  <View className={styles.recordFooter}>
                    <Text className={styles.recordOperator}>操作人: {record.operator}</Text>
                    <View className={styles.recordActions}>
                      {record.status === 'pending' && (
                        <Text
                          className={`${styles.actionBtn} ${styles.primary}`}
                          onClick={(e) => { e.stopPropagation(); handleStart(record.id); }}
                        >
                          开始
                        </Text>
                      )}
                      {record.status === 'in_progress' && (
                        <Text
                          className={`${styles.actionBtn} ${styles.success}`}
                          onClick={(e) => { e.stopPropagation(); handleComplete(record.id); }}
                        >
                          完成
                        </Text>
                      )}
                      <Text
                        className={`${styles.actionBtn} ${styles.danger}`}
                        onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                      >
                        删除
                      </Text>
                    </View>
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
              <Text className={styles.formTitle}>新增泡豆记录</Text>
              <Text className={styles.formClose} onClick={() => setShowForm(false)}>✕</Text>
            </View>

            <ScrollView scrollY className={styles.formBody}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>黄豆品种</Text>
                <Input
                  className={styles.formInput}
                  value={formData.beanType}
                  onInput={e => setFormData({ ...formData, beanType: e.detail.value })}
                  placeholder="请输入黄豆品种"
                />
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>用豆量 (kg)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.beanWeight}
                      onInput={e => setFormData({ ...formData, beanWeight: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>预计时长 (h)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.expectedDuration}
                      onInput={e => setFormData({ ...formData, expectedDuration: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>水温 (℃)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.waterTemperature}
                      onInput={e => setFormData({ ...formData, waterTemperature: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>操作人</Text>
                    <Input
                      className={styles.formInput}
                      value={formData.operator}
                      onInput={e => setFormData({ ...formData, operator: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>开始时间</Text>
                <Input
                  className={styles.formInput}
                  value={formData.startTime}
                  onInput={e => setFormData({ ...formData, startTime: e.detail.value })}
                  placeholder="YYYY-MM-DD HH:mm"
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>备注</Text>
                <Textarea
                  className={styles.formTextarea}
                  value={formData.note}
                  onInput={e => setFormData({ ...formData, note: e.detail.value })}
                  placeholder="请输入备注信息"
                  maxlength={200}
                />
              </View>
            </ScrollView>

            <View className={styles.formFooter}>
              <Text className={`${styles.formBtn} ${styles.btnCancel}`} onClick={() => setShowForm(false)}>
                取消
              </Text>
              <Text className={`${styles.formBtn} ${styles.btnSubmit}`} onClick={handleSubmit}>
                保存
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default SoakingPage;
