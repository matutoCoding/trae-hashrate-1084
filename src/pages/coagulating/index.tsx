import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { coagulatingService, batchService, getNowTime } from '@/services/dataService';
import type { CoagulatingRecord, BatchRecord } from '@/types/production';

const statusTextMap: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成'
};

const CoagulatingPage: React.FC = () => {
  const [records, setRecords] = useState<CoagulatingRecord[]>([]);
  const [activeBatches, setActiveBatches] = useState<BatchRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    soyMilkAmount: '',
    coagulantType: 'brine' as 'gypsum' | 'brine',
    coagulantAmount: '',
    startTime: '',
    restingDuration: '20',
    temperature: '85',
    operator: '王师傅',
    note: '',
    batchId: ''
  });

  const loadData = useCallback(() => {
    const data = coagulatingService.getAll();
    setRecords(data);
    const batches = batchService.getActiveWithProgress() as any;
    setActiveBatches(batches);
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
      soyMilkAmount: '',
      coagulantType: 'brine',
      coagulantAmount: '',
      startTime: getNowTime(),
      restingDuration: '20',
      temperature: '85',
      operator: '王师傅',
      note: '',
      batchId: ''
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.soyMilkAmount || !formData.coagulantAmount) {
      Taro.showToast({ title: '请填写豆浆量和凝固剂用量', icon: 'none' });
      return;
    }

    coagulatingService.add({
      soyMilkAmount: Number(formData.soyMilkAmount),
      coagulantType: formData.coagulantType,
      coagulantAmount: Number(formData.coagulantAmount),
      startTime: formData.startTime || getNowTime(),
      restingDuration: Number(formData.restingDuration),
      temperature: Number(formData.temperature),
      operator: formData.operator,
      note: formData.note,
      batchId: formData.batchId || undefined
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleStart = (id: string) => {
    coagulatingService.update(id, { status: 'in_progress' });
    loadData();
    Taro.showToast({ title: '已开始', icon: 'success' });
  };

  const handleComplete = (id: string) => {
    coagulatingService.update(id, { status: 'completed' });
    loadData();
    Taro.showToast({ title: '已完成', icon: 'success' });
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          coagulatingService.remove(id);
          loadData();
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const stats = coagulatingService.getTodayStats();

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>🧊 点浆凝固</Text>
        <Text className={styles.headerDesc}>石膏/卤水点浆、蹲脑凝固</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.totalMilk}斤</Text>
            <Text className={styles.statLabel}>总豆浆量</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.brineCount}</Text>
            <Text className={styles.statLabel}>盐卤点浆</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.gypsumCount}</Text>
            <Text className={styles.statLabel}>石膏点浆</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>点浆记录</Text>
          <Text className={styles.addBtn} onClick={handleAdd}>+ 新增</Text>
        </View>

        {records.length === 0 ? (
          <View className={styles.emptyState}>暂无记录，点击右上角新增</View>
        ) : (
          <View className={styles.recordList}>
            {records.map(record => (
              <View key={record.id} className={styles.recordCard}>
                <View className={styles.recordHeader}>
                  <Text className={styles.recordTitle}>
                    {record.coagulantType === 'brine' ? '盐卤' : '石膏'}点浆 - {record.soyMilkAmount}斤
                  </Text>
                  <Text className={`${styles.statusTag} ${styles[record.status]}`}>
                    {statusTextMap[record.status]}
                  </Text>
                </View>

                <View className={styles.recordInfo}>
                  <View className={styles.recordInfoItem}>
                    <Text className={styles.recordInfoLabel}>凝固剂用量:</Text>
                    <Text className={styles.recordInfoValue}>{record.coagulantAmount}g</Text>
                  </View>
                  <View className={styles.recordInfoItem}>
                    <Text className={styles.recordInfoLabel}>蹲脑时间:</Text>
                    <Text className={styles.recordInfoValue}>{record.restingDuration}分钟</Text>
                  </View>
                  <View className={styles.recordInfoItem}>
                    <Text className={styles.recordInfoLabel}>豆浆温度:</Text>
                    <Text className={styles.recordInfoValue}>{record.temperature}℃</Text>
                  </View>
                  <View className={styles.recordInfoItem}>
                    <Text className={styles.recordInfoLabel}>开始时间:</Text>
                    <Text className={styles.recordInfoValue}>{record.startTime}</Text>
                  </View>
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
                        onClick={() => handleStart(record.id)}
                      >
                        开始
                      </Text>
                    )}
                    {record.status === 'in_progress' && (
                      <Text
                        className={`${styles.actionBtn} ${styles.success}`}
                        onClick={() => handleComplete(record.id)}
                      >
                        完成
                      </Text>
                    )}
                    <Text
                      className={`${styles.actionBtn} ${styles.danger}`}
                      onClick={() => handleDelete(record.id)}
                    >
                      删除
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {showForm && (
        <View className={styles.formOverlay} onClick={() => setShowForm(false)}>
          <View className={styles.formSheet} onClick={e => e.stopPropagation()}>
            <View className={styles.formHeader}>
              <Text className={styles.formTitle}>新增点浆记录</Text>
              <Text className={styles.formClose} onClick={() => setShowForm(false)}>✕</Text>
            </View>

            <ScrollView scrollY className={styles.formBody}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>关联批次</Text>
                <View className={styles.batchSelectList}>
                  <View className={`${styles.batchSelectItem} ${!formData.batchId ? styles.active : ''}`} onClick={() => setFormData({ ...formData, batchId: '' })}>
                    <View className={styles.batchSelectHeader}>
                      <Text className={styles.batchNo}>不关联批次</Text>
                    </View>
                    <View className={styles.batchSelectBody}>
                      <Text className={styles.batchDesc}>独立记录，不参与批次追踪</Text>
                    </View>
                  </View>
                  {activeBatches.map(b => (
                    <View key={b.id} className={`${styles.batchSelectItem} ${formData.batchId === b.id ? styles.active : ''}`} onClick={() => setFormData({ ...formData, batchId: b.id })}>
                      <View className={styles.batchSelectHeader}>
                        <Text className={styles.batchNo}>{b.batchNo}</Text>
                        <Text className={styles.batchStep}>{(b as any).currentStep || '待开始'}</Text>
                      </View>
                      <View className={styles.batchSelectBody}>
                        <Text className={styles.batchDesc}>{b.beanType} · {b.beanWeight}kg</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>凝固剂类型</Text>
                <View className={styles.formRadioGroup}>
                  <Text
                    className={`${styles.formRadioItem} ${formData.coagulantType === 'brine' ? styles.active : ''}`}
                    onClick={() => setFormData({ ...formData, coagulantType: 'brine' })}
                  >
                    盐卤
                  </Text>
                  <Text
                    className={`${styles.formRadioItem} ${formData.coagulantType === 'gypsum' ? styles.active : ''}`}
                    onClick={() => setFormData({ ...formData, coagulantType: 'gypsum' })}
                  >
                    石膏
                  </Text>
                </View>
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>豆浆量 (斤)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.soyMilkAmount}
                      onInput={e => setFormData({ ...formData, soyMilkAmount: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>凝固剂用量 (g)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.coagulantAmount}
                      onInput={e => setFormData({ ...formData, coagulantAmount: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>蹲脑时间 (分钟)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.restingDuration}
                      onInput={e => setFormData({ ...formData, restingDuration: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>豆浆温度 (℃)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.temperature}
                      onInput={e => setFormData({ ...formData, temperature: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>操作人</Text>
                <Input
                  className={styles.formInput}
                  value={formData.operator}
                  onInput={e => setFormData({ ...formData, operator: e.detail.value })}
                  placeholder="请输入"
                />
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

export default CoagulatingPage;
