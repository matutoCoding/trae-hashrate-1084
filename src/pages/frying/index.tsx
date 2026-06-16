import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import {
  marinatingService,
  fryingService,
  getNowTime
} from '@/services/dataService';
import type { MarinatingRecord, FryingRecord } from '@/types/production';

const statusTextMap: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成'
};

const productOptions = [
  { key: 'dried_tofu', label: '豆干' },
  { key: 'tofu_puff', label: '油豆腐' }
];

const marinadeOptions = ['五香卤水', '麻辣卤水', '香卤', '白卤'];

const FryingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marinating' | 'frying'>('marinating');
  const [marinatingRecords, setMarinatingRecords] = useState<MarinatingRecord[]>([]);
  const [fryingRecords, setFryingRecords] = useState<FryingRecord[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [marinatingForm, setMarinatingForm] = useState({
    productType: 'dried_tofu' as 'dried_tofu' | 'tofu_puff',
    amount: '',
    marinadeType: '五香卤水',
    startTime: '',
    duration: '60',
    temperature: '80',
    operator: '李师傅',
    note: ''
  });

  const [fryingForm, setFryingForm] = useState({
    productType: 'tofu_puff' as 'tofu_puff' | 'fried_dried_tofu',
    amount: '',
    oilType: '菜籽油',
    oilTemperature: '180',
    startTime: '',
    duration: '10',
    operator: '王师傅',
    note: ''
  });

  const loadData = useCallback(() => {
    setMarinatingRecords(marinatingService.getAll());
    setFryingRecords(fryingService.getAll());
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
    loadData();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  }, [loadData]);

  const handleAdd = () => {
    if (activeTab === 'marinating') {
      setMarinatingForm({
        productType: 'dried_tofu',
        amount: '',
        marinadeType: '五香卤水',
        startTime: getNowTime(),
        duration: '60',
        temperature: '80',
        operator: '李师傅',
        note: ''
      });
    } else {
      setFryingForm({
        productType: 'tofu_puff',
        amount: '',
        oilType: '菜籽油',
        oilTemperature: '180',
        startTime: getNowTime(),
        duration: '10',
        operator: '王师傅',
        note: ''
      });
    }
    setShowForm(true);
  };

  const handleSubmitMarinating = () => {
    if (!marinatingForm.amount) {
      Taro.showToast({ title: '请填写数量', icon: 'none' });
      return;
    }

    marinatingService.add({
      productType: marinatingForm.productType,
      amount: Number(marinatingForm.amount),
      marinadeType: marinatingForm.marinadeType,
      startTime: marinatingForm.startTime || getNowTime(),
      duration: Number(marinatingForm.duration),
      temperature: Number(marinatingForm.temperature),
      operator: marinatingForm.operator,
      note: marinatingForm.note
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleSubmitFrying = () => {
    if (!fryingForm.amount) {
      Taro.showToast({ title: '请填写数量', icon: 'none' });
      return;
    }

    fryingService.add({
      productType: fryingForm.productType,
      amount: Number(fryingForm.amount),
      oilType: fryingForm.oilType,
      oilTemperature: Number(fryingForm.oilTemperature),
      startTime: fryingForm.startTime || getNowTime(),
      duration: Number(fryingForm.duration),
      operator: fryingForm.operator,
      note: fryingForm.note
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleSubmit = () => {
    if (activeTab === 'marinating') {
      handleSubmitMarinating();
    } else {
      handleSubmitFrying();
    }
  };

  const handleStart = (type: string, id: string) => {
    if (type === 'marinating') {
      marinatingService.update(id, { status: 'in_progress' });
    } else {
      fryingService.update(id, { status: 'in_progress' });
    }
    loadData();
    Taro.showToast({ title: '已开始', icon: 'success' });
  };

  const handleComplete = (type: string, id: string) => {
    if (type === 'marinating') {
      marinatingService.update(id, { status: 'completed' });
    } else {
      fryingService.update(id, { status: 'completed' });
    }
    loadData();
    Taro.showToast({ title: '已完成', icon: 'success' });
  };

  const handleDelete = (type: string, id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          if (type === 'marinating') {
            marinatingService.remove(id);
          } else {
            fryingService.remove(id);
          }
          loadData();
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const marinatingStats = marinatingService.getTodayStats();
  const fryingStats = fryingService.getTodayStats();

  const productLabelMap: Record<string, string> = {
    dried_tofu: '豆干',
    tofu_puff: '油豆腐',
    fried_dried_tofu: '炸豆干'
  };

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>🍲 卤制油炸</Text>
        <Text className={styles.headerDesc}>卤水豆干、油豆腐制作</Text>
        <View className={styles.tabBar}>
          <Text
            className={`${styles.tabItem} ${activeTab === 'marinating' ? styles.active : ''}`}
            onClick={() => setActiveTab('marinating')}
          >
            🥘 卤制
          </Text>
          <Text
            className={`${styles.tabItem} ${activeTab === 'frying' ? styles.active : ''}`}
            onClick={() => setActiveTab('frying')}
          >
            🍤 油炸
          </Text>
        </View>
        <View className={styles.statsRow}>
          {activeTab === 'marinating' ? (
            <>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{marinatingStats.totalAmount}斤</Text>
                <Text className={styles.statLabel}>总产量</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{marinatingStats.inProgress}</Text>
                <Text className={styles.statLabel}>卤制中</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{marinatingStats.completed}</Text>
                <Text className={styles.statLabel}>已完成</Text>
              </View>
            </>
          ) : (
            <>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{fryingStats.totalAmount}斤</Text>
                <Text className={styles.statLabel}>总产量</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{fryingStats.inProgress}</Text>
                <Text className={styles.statLabel}>油炸中</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{fryingStats.completed}</Text>
                <Text className={styles.statLabel}>已完成</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {activeTab === 'marinating' ? '卤制记录' : '油炸记录'}
          </Text>
          <Text className={styles.addBtn} onClick={handleAdd}>+ 新增</Text>
        </View>

        {activeTab === 'marinating' ? (
          marinatingRecords.length === 0 ? (
            <View className={styles.emptyState}>暂无记录，点击右上角新增</View>
          ) : (
            <View className={styles.recordList}>
              {marinatingRecords.map(record => (
                <View key={record.id} className={styles.recordCard}>
                  <View className={styles.recordHeader}>
                    <Text className={styles.recordTitle}>
                      {record.marinadeType} - {record.amount}斤
                    </Text>
                    <Text className={`${styles.statusTag} ${styles[record.status]}`}>
                      {statusTextMap[record.status]}
                    </Text>
                  </View>

                  <View className={styles.recordInfo}>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>产品:</Text>
                      <Text className={styles.recordInfoValue}>{productLabelMap[record.productType]}</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>卤制时间:</Text>
                      <Text className={styles.recordInfoValue}>{record.duration}分钟</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>卤温:</Text>
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
                          onClick={() => handleStart('marinating', record.id)}
                        >
                          开始
                        </Text>
                      )}
                      {record.status === 'in_progress' && (
                        <Text
                          className={`${styles.actionBtn} ${styles.success}`}
                          onClick={() => handleComplete('marinating', record.id)}
                        >
                          完成
                        </Text>
                      )}
                      <Text
                        className={`${styles.actionBtn} ${styles.danger}`}
                        onClick={() => handleDelete('marinating', record.id)}
                      >
                        删除
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )
        ) : (
          fryingRecords.length === 0 ? (
            <View className={styles.emptyState}>暂无记录，点击右上角新增</View>
          ) : (
            <View className={styles.recordList}>
              {fryingRecords.map(record => (
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
                      <Text className={styles.recordInfoLabel}>食用油:</Text>
                      <Text className={styles.recordInfoValue}>{record.oilType}</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>油温:</Text>
                      <Text className={styles.recordInfoValue}>{record.oilTemperature}℃</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>油炸时间:</Text>
                      <Text className={styles.recordInfoValue}>{record.duration}分钟</Text>
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
                          onClick={() => handleStart('frying', record.id)}
                        >
                          开始
                        </Text>
                      )}
                      {record.status === 'in_progress' && (
                        <Text
                          className={`${styles.actionBtn} ${styles.success}`}
                          onClick={() => handleComplete('frying', record.id)}
                        >
                          完成
                        </Text>
                      )}
                      <Text
                        className={`${styles.actionBtn} ${styles.danger}`}
                        onClick={() => handleDelete('frying', record.id)}
                      >
                        删除
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )
        )}
      </View>

      {showForm && (
        <View className={styles.formOverlay} onClick={() => setShowForm(false)}>
          <View className={styles.formSheet} onClick={e => e.stopPropagation()}>
            <View className={styles.formHeader}>
              <Text className={styles.formTitle}>
                新增{activeTab === 'marinating' ? '卤制' : '油炸'}记录
              </Text>
              <Text className={styles.formClose} onClick={() => setShowForm(false)}>✕</Text>
            </View>

            <ScrollView scrollY className={styles.formBody}>
              {activeTab === 'marinating' ? (
                <>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>产品类型</Text>
                    <View className={styles.formRadioGroup}>
                      {productOptions.map(opt => (
                        <Text
                          key={opt.key}
                          className={`${styles.formRadioItem} ${marinatingForm.productType === opt.key ? styles.active : ''}`}
                          onClick={() => setMarinatingForm({ ...marinatingForm, productType: opt.key as any })}
                        >
                          {opt.label}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>卤水配方</Text>
                    <View className={styles.formRadioGroup}>
                      {marinadeOptions.map(opt => (
                        <Text
                          key={opt}
                          className={`${styles.formRadioItem} ${marinatingForm.marinadeType === opt ? styles.active : ''}`}
                          onClick={() => setMarinatingForm({ ...marinatingForm, marinadeType: opt })}
                        >
                          {opt}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View className={styles.formRow}>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>数量 (斤)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={marinatingForm.amount}
                          onInput={e => setMarinatingForm({ ...marinatingForm, amount: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>卤制时间 (分钟)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={marinatingForm.duration}
                          onInput={e => setMarinatingForm({ ...marinatingForm, duration: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                  </View>

                  <View className={styles.formRow}>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>卤温 (℃)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={marinatingForm.temperature}
                          onInput={e => setMarinatingForm({ ...marinatingForm, temperature: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>操作人</Text>
                        <Input
                          className={styles.formInput}
                          value={marinatingForm.operator}
                          onInput={e => setMarinatingForm({ ...marinatingForm, operator: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>开始时间</Text>
                    <Input
                      className={styles.formInput}
                      value={marinatingForm.startTime}
                      onInput={e => setMarinatingForm({ ...marinatingForm, startTime: e.detail.value })}
                      placeholder="YYYY-MM-DD HH:mm"
                    />
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>备注</Text>
                    <Textarea
                      className={styles.formTextarea}
                      value={marinatingForm.note}
                      onInput={e => setMarinatingForm({ ...marinatingForm, note: e.detail.value })}
                      placeholder="请输入备注信息"
                      maxlength={200}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>产品类型</Text>
                    <View className={styles.formRadioGroup}>
                      <Text
                        className={`${styles.formRadioItem} ${fryingForm.productType === 'tofu_puff' ? styles.active : ''}`}
                        onClick={() => setFryingForm({ ...fryingForm, productType: 'tofu_puff' })}
                      >
                        油豆腐
                      </Text>
                      <Text
                        className={`${styles.formRadioItem} ${fryingForm.productType === 'fried_dried_tofu' ? styles.active : ''}`}
                        onClick={() => setFryingForm({ ...fryingForm, productType: 'fried_dried_tofu' })}
                      >
                        炸豆干
                      </Text>
                    </View>
                  </View>

                  <View className={styles.formRow}>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>数量 (斤)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={fryingForm.amount}
                          onInput={e => setFryingForm({ ...fryingForm, amount: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>油炸时间 (分钟)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={fryingForm.duration}
                          onInput={e => setFryingForm({ ...fryingForm, duration: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                  </View>

                  <View className={styles.formRow}>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>食用油</Text>
                        <Input
                          className={styles.formInput}
                          value={fryingForm.oilType}
                          onInput={e => setFryingForm({ ...fryingForm, oilType: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>油温 (℃)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={fryingForm.oilTemperature}
                          onInput={e => setFryingForm({ ...fryingForm, oilTemperature: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>操作人</Text>
                    <Input
                      className={styles.formInput}
                      value={fryingForm.operator}
                      onInput={e => setFryingForm({ ...fryingForm, operator: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>开始时间</Text>
                    <Input
                      className={styles.formInput}
                      value={fryingForm.startTime}
                      onInput={e => setFryingForm({ ...fryingForm, startTime: e.detail.value })}
                      placeholder="YYYY-MM-DD HH:mm"
                    />
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>备注</Text>
                    <Textarea
                      className={styles.formTextarea}
                      value={fryingForm.note}
                      onInput={e => setFryingForm({ ...fryingForm, note: e.detail.value })}
                      placeholder="请输入备注信息"
                      maxlength={200}
                    />
                  </View>
                </>
              )}
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

export default FryingPage;
