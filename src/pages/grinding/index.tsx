import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { grindingService, boilingService, getNowTime } from '@/services/dataService';
import type { GrindingRecord, BoilingRecord } from '@/types/production';

const statusTextMap: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成'
};

const GrindingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grinding' | 'boiling'>('grinding');
  const [grindingRecords, setGrindingRecords] = useState<GrindingRecord[]>([]);
  const [boilingRecords, setBoilingRecords] = useState<BoilingRecord[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [grindingForm, setGrindingForm] = useState({
    beanWeight: '',
    waterAmount: '',
    startTime: '',
    grindCount: '2',
    filterType: '纱布过滤',
    soyMilkAmount: '',
    okaraAmount: '',
    operator: '王师傅',
    note: ''
  });

  const [boilingForm, setBoilingForm] = useState({
    soyMilkAmount: '',
    startTime: '',
    boilingDuration: '20',
    temperature: '100',
    antiFoamUsed: false,
    antiFoamAmount: '',
    operator: '王师傅',
    note: ''
  });

  const loadData = useCallback(() => {
    setGrindingRecords(grindingService.getAll());
    setBoilingRecords(boilingService.getAll());
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
    if (activeTab === 'grinding') {
      setGrindingForm({
        beanWeight: '',
        waterAmount: '',
        startTime: getNowTime(),
        grindCount: '2',
        filterType: '纱布过滤',
        soyMilkAmount: '',
        okaraAmount: '',
        operator: '王师傅',
        note: ''
      });
    } else {
      setBoilingForm({
        soyMilkAmount: '',
        startTime: getNowTime(),
        boilingDuration: '20',
        temperature: '100',
        antiFoamUsed: false,
        antiFoamAmount: '',
        operator: '王师傅',
        note: ''
      });
    }
    setShowForm(true);
  };

  const handleSubmitGrinding = () => {
    if (!grindingForm.beanWeight || !grindingForm.waterAmount) {
      Taro.showToast({ title: '请填写用豆量和加水量', icon: 'none' });
      return;
    }

    grindingService.add({
      beanWeight: Number(grindingForm.beanWeight),
      waterAmount: Number(grindingForm.waterAmount),
      startTime: grindingForm.startTime || getNowTime(),
      grindCount: Number(grindingForm.grindCount),
      filterType: grindingForm.filterType,
      soyMilkAmount: grindingForm.soyMilkAmount ? Number(grindingForm.soyMilkAmount) : undefined,
      okaraAmount: grindingForm.okaraAmount ? Number(grindingForm.okaraAmount) : undefined,
      operator: grindingForm.operator,
      note: grindingForm.note
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleSubmitBoiling = () => {
    if (!boilingForm.soyMilkAmount) {
      Taro.showToast({ title: '请填写豆浆量', icon: 'none' });
      return;
    }

    boilingService.add({
      soyMilkAmount: Number(boilingForm.soyMilkAmount),
      startTime: boilingForm.startTime || getNowTime(),
      boilingDuration: Number(boilingForm.boilingDuration),
      temperature: Number(boilingForm.temperature),
      antiFoamUsed: boilingForm.antiFoamUsed,
      antiFoamAmount: boilingForm.antiFoamAmount ? Number(boilingForm.antiFoamAmount) : undefined,
      operator: boilingForm.operator,
      note: boilingForm.note
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowForm(false);
    loadData();
  };

  const handleSubmit = () => {
    if (activeTab === 'grinding') {
      handleSubmitGrinding();
    } else {
      handleSubmitBoiling();
    }
  };

  const handleStart = (type: string, id: string) => {
    if (type === 'grinding') {
      grindingService.update(id, { status: 'in_progress' });
    } else {
      boilingService.update(id, { status: 'in_progress' });
    }
    loadData();
    Taro.showToast({ title: '已开始', icon: 'success' });
  };

  const handleComplete = (type: string, id: string) => {
    if (type === 'grinding') {
      grindingService.update(id, { status: 'completed' });
    } else {
      boilingService.update(id, { status: 'completed' });
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
          if (type === 'grinding') {
            grindingService.remove(id);
          } else {
            boilingService.remove(id);
          }
          loadData();
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const grindingStats = grindingService.getTodayStats();
  const boilingStats = boilingService.getTodayStats();

  return (
    <ScrollView
      scrollY
      className={styles.pageContainer}
      onPullDownRefresh={handleRefresh}
    >
      <View className={styles.headerSection}>
        <Text className={styles.headerTitle}>⚙️ 磨浆煮浆</Text>
        <Text className={styles.headerDesc}>石磨磨浆、滤渣、煮浆消泡</Text>
        <View className={styles.tabBar}>
          <Text
            className={`${styles.tabItem} ${activeTab === 'grinding' ? styles.active : ''}`}
            onClick={() => setActiveTab('grinding')}
          >
            磨浆记录
          </Text>
          <Text
            className={`${styles.tabItem} ${activeTab === 'boiling' ? styles.active : ''}`}
            onClick={() => setActiveTab('boiling')}
          >
            煮浆记录
          </Text>
        </View>
        <View className={styles.statsRow}>
          {activeTab === 'grinding' ? (
            <>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{grindingStats.totalBean}kg</Text>
                <Text className={styles.statLabel}>磨豆量</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{grindingStats.totalMilk}斤</Text>
                <Text className={styles.statLabel}>豆浆量</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{grindingStats.completed}</Text>
                <Text className={styles.statLabel}>已完成</Text>
              </View>
            </>
          ) : (
            <>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{boilingStats.totalMilk}斤</Text>
                <Text className={styles.statLabel}>煮浆量</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{boilingStats.total}</Text>
                <Text className={styles.statLabel}>批次</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{boilingStats.completed}</Text>
                <Text className={styles.statLabel}>已完成</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {activeTab === 'grinding' ? '磨浆记录' : '煮浆记录'}
          </Text>
          <Text className={styles.addBtn} onClick={handleAdd}>+ 新增</Text>
        </View>

        {activeTab === 'grinding' ? (
          grindingRecords.length === 0 ? (
            <View className={styles.emptyState}>暂无记录，点击右上角新增</View>
          ) : (
            <View className={styles.recordList}>
              {grindingRecords.map(record => (
                <View key={record.id} className={styles.recordCard}>
                  <View className={styles.recordHeader}>
                    <Text className={styles.recordTitle}>
                      磨浆 - {record.beanWeight}kg黄豆
                    </Text>
                    <Text className={`${styles.statusTag} ${styles[record.status]}`}>
                      {statusTextMap[record.status]}
                    </Text>
                  </View>

                  <View className={styles.recordInfo}>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>加水量:</Text>
                      <Text className={styles.recordInfoValue}>{record.waterAmount}斤</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>磨浆次数:</Text>
                      <Text className={styles.recordInfoValue}>{record.grindCount}遍</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>过滤方式:</Text>
                      <Text className={styles.recordInfoValue}>{record.filterType}</Text>
                    </View>
                    {record.soyMilkAmount && (
                      <View className={styles.recordInfoItem}>
                        <Text className={styles.recordInfoLabel}>豆浆量:</Text>
                        <Text className={styles.recordInfoValue}>{record.soyMilkAmount}斤</Text>
                      </View>
                    )}
                    {record.okaraAmount && (
                      <View className={styles.recordInfoItem}>
                        <Text className={styles.recordInfoLabel}>豆渣量:</Text>
                        <Text className={styles.recordInfoValue}>{record.okaraAmount}斤</Text>
                      </View>
                    )}
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
                          onClick={() => handleStart('grinding', record.id)}
                        >
                          开始
                        </Text>
                      )}
                      {record.status === 'in_progress' && (
                        <Text
                          className={`${styles.actionBtn} ${styles.success}`}
                          onClick={() => handleComplete('grinding', record.id)}
                        >
                          完成
                        </Text>
                      )}
                      <Text
                        className={`${styles.actionBtn} ${styles.danger}`}
                        onClick={() => handleDelete('grinding', record.id)}
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
          boilingRecords.length === 0 ? (
            <View className={styles.emptyState}>暂无记录，点击右上角新增</View>
          ) : (
            <View className={styles.recordList}>
              {boilingRecords.map(record => (
                <View key={record.id} className={styles.recordCard}>
                  <View className={styles.recordHeader}>
                    <Text className={styles.recordTitle}>
                      煮浆 - {record.soyMilkAmount}斤
                    </Text>
                    <Text className={`${styles.statusTag} ${styles[record.status]}`}>
                      {statusTextMap[record.status]}
                    </Text>
                  </View>

                  <View className={styles.recordInfo}>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>煮沸时间:</Text>
                      <Text className={styles.recordInfoValue}>{record.boilingDuration}分钟</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>温度:</Text>
                      <Text className={styles.recordInfoValue}>{record.temperature}℃</Text>
                    </View>
                    <View className={styles.recordInfoItem}>
                      <Text className={styles.recordInfoLabel}>消泡剂:</Text>
                      <Text className={styles.recordInfoValue}>
                        {record.antiFoamUsed ? `${record.antiFoamAmount || 0}g` : '未使用'}
                      </Text>
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
                          onClick={() => handleStart('boiling', record.id)}
                        >
                          开始
                        </Text>
                      )}
                      {record.status === 'in_progress' && (
                        <Text
                          className={`${styles.actionBtn} ${styles.success}`}
                          onClick={() => handleComplete('boiling', record.id)}
                        >
                          完成
                        </Text>
                      )}
                      <Text
                        className={`${styles.actionBtn} ${styles.danger}`}
                        onClick={() => handleDelete('boiling', record.id)}
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
                新增{activeTab === 'grinding' ? '磨浆' : '煮浆'}记录
              </Text>
              <Text className={styles.formClose} onClick={() => setShowForm(false)}>✕</Text>
            </View>

            <ScrollView scrollY className={styles.formBody}>
              {activeTab === 'grinding' ? (
                <>
                  <View className={styles.formRow}>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>用豆量 (kg)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={grindingForm.beanWeight}
                          onInput={e => setGrindingForm({ ...grindingForm, beanWeight: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>加水量 (斤)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={grindingForm.waterAmount}
                          onInput={e => setGrindingForm({ ...grindingForm, waterAmount: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                  </View>

                  <View className={styles.formRow}>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>磨浆次数</Text>
                        <Input
                          type="number"
                          className={styles.formInput}
                          value={grindingForm.grindCount}
                          onInput={e => setGrindingForm({ ...grindingForm, grindCount: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>过滤方式</Text>
                        <Input
                          className={styles.formInput}
                          value={grindingForm.filterType}
                          onInput={e => setGrindingForm({ ...grindingForm, filterType: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                  </View>

                  <View className={styles.formRow}>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>豆浆量 (斤)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={grindingForm.soyMilkAmount}
                          onInput={e => setGrindingForm({ ...grindingForm, soyMilkAmount: e.detail.value })}
                          placeholder="可选"
                        />
                      </View>
                    </View>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>豆渣量 (斤)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={grindingForm.okaraAmount}
                          onInput={e => setGrindingForm({ ...grindingForm, okaraAmount: e.detail.value })}
                          placeholder="可选"
                        />
                      </View>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>操作人</Text>
                    <Input
                      className={styles.formInput}
                      value={grindingForm.operator}
                      onInput={e => setGrindingForm({ ...grindingForm, operator: e.detail.value })}
                      placeholder="请输入"
                    />
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>开始时间</Text>
                    <Input
                      className={styles.formInput}
                      value={grindingForm.startTime}
                      onInput={e => setGrindingForm({ ...grindingForm, startTime: e.detail.value })}
                      placeholder="YYYY-MM-DD HH:mm"
                    />
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>备注</Text>
                    <Textarea
                      className={styles.formTextarea}
                      value={grindingForm.note}
                      onInput={e => setGrindingForm({ ...grindingForm, note: e.detail.value })}
                      placeholder="请输入备注信息"
                      maxlength={200}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View className={styles.formRow}>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>豆浆量 (斤)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={boilingForm.soyMilkAmount}
                          onInput={e => setBoilingForm({ ...boilingForm, soyMilkAmount: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>煮沸时间 (分钟)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={boilingForm.boilingDuration}
                          onInput={e => setBoilingForm({ ...boilingForm, boilingDuration: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                  </View>

                  <View className={styles.formRow}>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>温度 (℃)</Text>
                        <Input
                          type="digit"
                          className={styles.formInput}
                          value={boilingForm.temperature}
                          onInput={e => setBoilingForm({ ...boilingForm, temperature: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                    <View className={styles.formRowItem}>
                      <View className={styles.formGroup}>
                        <Text className={styles.formLabel}>操作人</Text>
                        <Input
                          className={styles.formInput}
                          value={boilingForm.operator}
                          onInput={e => setBoilingForm({ ...boilingForm, operator: e.detail.value })}
                          placeholder="请输入"
                        />
                      </View>
                    </View>
                  </View>

                  <View className={styles.formGroup}>
                    <View className={styles.formSwitch}>
                      <Text className={styles.switchLabel}>是否使用消泡剂</Text>
                      <View
                        className={`${styles.switchToggle} ${boilingForm.antiFoamUsed ? styles.active : ''}`}
                        onClick={() => setBoilingForm({ ...boilingForm, antiFoamUsed: !boilingForm.antiFoamUsed })}
                      />
                    </View>
                  </View>

                  {boilingForm.antiFoamUsed && (
                    <View className={styles.formGroup}>
                      <Text className={styles.formLabel}>消泡剂用量 (g)</Text>
                      <Input
                        type="digit"
                        className={styles.formInput}
                        value={boilingForm.antiFoamAmount}
                        onInput={e => setBoilingForm({ ...boilingForm, antiFoamAmount: e.detail.value })}
                        placeholder="请输入"
                      />
                    </View>
                  )}

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>开始时间</Text>
                    <Input
                      className={styles.formInput}
                      value={boilingForm.startTime}
                      onInput={e => setBoilingForm({ ...boilingForm, startTime: e.detail.value })}
                      placeholder="YYYY-MM-DD HH:mm"
                    />
                  </View>

                  <View className={styles.formGroup}>
                    <Text className={styles.formLabel}>备注</Text>
                    <Textarea
                      className={styles.formTextarea}
                      value={boilingForm.note}
                      onInput={e => setBoilingForm({ ...boilingForm, note: e.detail.value })}
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

export default GrindingPage;
