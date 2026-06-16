import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { pressingService, batchService, getNowTime } from '@/services/dataService';
import type { PressingRecord, BatchRecord } from '@/types/production';

const statusTextMap: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成'
};

const productTypes = [
  { key: 'tofu', label: '嫩豆腐' },
  { key: 'tofu_pudding', label: '豆腐脑' },
  { key: 'dried_tofu', label: '豆干' },
  { key: 'tofu_skin', label: '千张' }
];

const PressingPage: React.FC = () => {
  const [records, setRecords] = useState<PressingRecord[]>([]);
  const [activeBatches, setActiveBatches] = useState<BatchRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productType: 'tofu' as 'tofu' | 'tofu_pudding' | 'dried_tofu' | 'tofu_skin',
    amount: '',
    startTime: '',
    pressDuration: '40',
    pressWeight: '20',
    operator: '王师傅',
    note: '',
    batchId: ''
  });

  const loadData = useCallback(() => {
    const data = pressingService.getAll();
    setRecords(data);
    const batches = batchService.getActive();
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
      productType: 'tofu',
      amount: '',
      startTime: getNowTime(),
      pressDuration: '40',
      pressWeight: '20',
      operator: '王师傅',
      note: '',
      batchId: ''
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.amount) {
      Taro.showToast({ title: '请填写产量', icon: 'none' });
      return;
    }

    pressingService.add({
      productType: formData.productType,
      amount: Number(formData.amount),
      startTime: formData.startTime || getNowTime(),
      pressDuration: Number(formData.pressDuration),
      pressWeight: Number(formData.pressWeight),
      operator: formData.operator,
      note: formData.note,
      batchId: formData.batchId || undefined
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleStart = (id: string) => {
    pressingService.update(id, { status: 'in_progress' });
    loadData();
    Taro.showToast({ title: '已开始', icon: 'success' });
  };

  const handleComplete = (id: string) => {
    pressingService.update(id, { status: 'completed' });
    loadData();
    Taro.showToast({ title: '已完成', icon: 'success' });
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          pressingService.remove(id);
          loadData();
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const stats = pressingService.getTodayStats();
  const productLabelMap: Record<string, string> = {};
  productTypes.forEach(p => { productLabelMap[p.key] = p.label; });

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>📦 压制成型</Text>
        <Text className={styles.headerDesc}>上箱压制、豆腐豆干豆皮成型</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.tofuAmount}斤</Text>
            <Text className={styles.statLabel}>豆腐</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.driedTofuAmount}斤</Text>
            <Text className={styles.statLabel}>豆干</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.tofuSkinAmount}斤</Text>
            <Text className={styles.statLabel}>千张</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>压制记录</Text>
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
                    {productLabelMap[record.productType]} - {record.amount}斤
                  </Text>
                  <Text className={`${styles.statusTag} ${styles[record.status]}`}>
                    {statusTextMap[record.status]}
                  </Text>
                </View>

                <View className={styles.recordInfo}>
                  <View className={styles.recordInfoItem}>
                    <Text className={styles.recordInfoLabel}>压制时间:</Text>
                    <Text className={styles.recordInfoValue}>{record.pressDuration}分钟</Text>
                  </View>
                  <View className={styles.recordInfoItem}>
                    <Text className={styles.recordInfoLabel}>压制重量:</Text>
                    <Text className={styles.recordInfoValue}>{record.pressWeight}kg</Text>
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
              <Text className={styles.formTitle}>新增压制记录</Text>
              <Text className={styles.formClose} onClick={() => setShowForm(false)}>✕</Text>
            </View>

            <ScrollView scrollY className={styles.formBody}>
              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>关联批次</Text>
                <View className={styles.formRadioGroup}>
                  <Text className={`${styles.formRadioItem} ${!formData.batchId ? styles.active : ''}`} onClick={() => setFormData({ ...formData, batchId: '' })}>不关联</Text>
                  {activeBatches.map(b => (
                    <Text key={b.id} className={`${styles.formRadioItem} ${formData.batchId === b.id ? styles.active : ''}`} onClick={() => setFormData({ ...formData, batchId: b.id })}>
                      {b.batchNo} ({b.beanWeight}kg)
                    </Text>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>产品类型</Text>
                <View className={styles.formRadioGroup}>
                  {productTypes.map(type => (
                    <Text
                      key={type.key}
                      className={`${styles.formRadioItem} ${formData.productType === type.key ? styles.active : ''}`}
                      onClick={() => setFormData({ ...formData, productType: type.key as any })}
                    >
                      {type.label}
                    </Text>
                  ))}
                </View>
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>产量 (斤)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.amount}
                      onInput={e => setFormData({ ...formData, amount: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>压制时间 (分钟)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.pressDuration}
                      onInput={e => setFormData({ ...formData, pressDuration: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>
                </View>
              </View>

              <View className={styles.formRow}>
                <View className={styles.formRowItem}>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>压制重量 (kg)</Text>
                    <Input
                      type="digit"
                      className={styles.formInput}
                      value={formData.pressWeight}
                      onInput={e => setFormData({ ...formData, pressWeight: e.detail.value })}
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

export default PressingPage;
