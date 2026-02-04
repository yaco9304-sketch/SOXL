'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import type { UserConfig } from '@/types';
import { getUserConfig, setUserConfig } from '@/lib/storage';
import { formatKRW } from '@/lib/utils/format';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getNotificationPermission,
  sendTestNotification,
} from '@/lib/utils/notification';

export default function SettingsPage() {
  const [config, setConfig] = useState<UserConfig>({
    totalBudget: 40000000,
    usedBudget: 0,
    buyRatioNormal: 0.04,
    buyRatioOver: 0.10,
    sellRatioBounce: 0.30,
    sellRatioTarget: 0.40,
    averageCost: undefined,
    totalShares: undefined,
  });
  const [saved, setSaved] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    const loadedConfig = getUserConfig();
    setConfig(loadedConfig);
    
    // 알림 권한 상태 확인
    const permission = getNotificationPermission();
    setNotificationsEnabled(permission === 'granted');
  }, []);

  const handleSave = () => {
    setUserConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (field: keyof UserConfig, value: number | undefined) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleNotifications = async () => {
    setNotificationLoading(true);
    try {
      if (notificationsEnabled) {
        // 알림 비활성화
        await unsubscribeFromPushNotifications();
        await fetch('/api/notifications/subscribe', { method: 'DELETE' });
        setNotificationsEnabled(false);
      } else {
        // 알림 활성화
        const subscription = await subscribeToPushNotifications();
        if (subscription) {
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription }),
          });
          setNotificationsEnabled(true);
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      alert('알림 설정 중 오류가 발생했습니다.');
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('테스트 알림 전송 중 오류가 발생했습니다.');
    }
  };

  const handleResetData = () => {
    const confirmReset = window.confirm(
      '⚠️ 정말로 모든 데이터를 초기화하시겠습니까?\n\n다음 데이터가 모두 삭제됩니다:\n- 거래 내역\n- 연속 하락 추적 데이터\n- 급락 추적 데이터\n- 사용자 설정\n\n이 작업은 되돌릴 수 없습니다.'
    );

    if (confirmReset) {
      const doubleConfirm = window.confirm(
        '🚨 마지막 확인:\n정말로 삭제하시겠습니까?'
      );

      if (doubleConfirm) {
        try {
          // LocalStorage 전체 삭제
          localStorage.clear();
          
          alert('✅ 모든 데이터가 초기화되었습니다.\n페이지를 새로고침합니다.');
          
          // 페이지 새로고침
          window.location.reload();
        } catch (error) {
          console.error('Error resetting data:', error);
          alert('❌ 데이터 초기화 중 오류가 발생했습니다.');
        }
      }
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>대시보드로 돌아가기</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-text-primary">
            ⚙️ 설정
          </h1>
          <p className="text-text-secondary">
            투자 전략 파라미터를 설정하세요
          </p>
        </header>

        <div className="space-y-6">
          {/* 예산 설정 */}
          <section className="bg-bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              💰 예산 설정
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  총 예산 (KRW)
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={config.totalBudget}
                  onChange={(e) =>
                    handleChange('totalBudget', parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-3 rounded-lg number-font text-lg"
                  placeholder="40000000"
                />
                <p className="text-xs text-text-muted mt-1">
                  현재: {formatKRW(config.totalBudget)}
                </p>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  이미 사용한 예산 (KRW)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={config.usedBudget}
                  onChange={(e) =>
                    handleChange('usedBudget', parseFloat(e.target.value))
                  }
                  className="w-full px-4 py-3 rounded-lg number-font text-lg"
                  placeholder="0"
                />
                <p className="text-xs text-text-muted mt-1">
                  현재: {formatKRW(config.usedBudget)}
                </p>
              </div>
            </div>
          </section>

          {/* 매수 비율 설정 */}
          <section className="bg-bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              🛒 매수 비율 설정
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  정규 매수 비율 (총 예산의 %)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.buyRatioNormal}
                    onChange={(e) =>
                      handleChange('buyRatioNormal', parseFloat(e.target.value))
                    }
                    className="flex-1 px-4 py-3 rounded-lg number-font text-lg"
                    placeholder="0.04"
                  />
                  <span className="text-2xl font-bold number-font text-text-primary">
                    {(config.buyRatioNormal * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  전일 대비 -7~-8% 하락 시 적용 (권장: 3~4%)
                </p>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  과매수 비율 (총 예산의 %)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.buyRatioOver}
                    onChange={(e) =>
                      handleChange('buyRatioOver', parseFloat(e.target.value))
                    }
                    className="flex-1 px-4 py-3 rounded-lg number-font text-lg"
                    placeholder="0.10"
                  />
                  <span className="text-2xl font-bold number-font text-text-primary">
                    {(config.buyRatioOver * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  전일 대비 -16% 이상 급락 시 적용 (권장: 8~10%)
                </p>
              </div>
            </div>
          </section>

          {/* 매도 비율 설정 */}
          <section className="bg-bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              💸 매도 비율 설정
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  반등 매도 비율 (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.sellRatioBounce}
                    onChange={(e) =>
                      handleChange('sellRatioBounce', parseFloat(e.target.value))
                    }
                    className="flex-1 px-4 py-3 rounded-lg number-font text-lg"
                    placeholder="0.30"
                  />
                  <span className="text-2xl font-bold number-font text-text-primary">
                    {(config.sellRatioBounce * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  급락 후 +8~12% 반등 시 적용 (권장: 30~50%)
                </p>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  목표가 매도 비율 (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.sellRatioTarget}
                    onChange={(e) =>
                      handleChange('sellRatioTarget', parseFloat(e.target.value))
                    }
                    className="flex-1 px-4 py-3 rounded-lg number-font text-lg"
                    placeholder="0.40"
                  />
                  <span className="text-2xl font-bold number-font text-text-primary">
                    {(config.sellRatioTarget * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  평균 단가 대비 +15~25% 도달 시 적용 (권장: 40~50%)
                </p>
              </div>
            </div>
          </section>

          {/* 보유 정보 (선택 사항) */}
          <section className="bg-bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              📊 보유 정보 (선택)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  평균 단가 (USD)
                </label>
                <input
                  type="number"
                  value={config.averageCost || ''}
                  onChange={(e) =>
                    handleChange(
                      'averageCost',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg number-font text-lg"
                  placeholder="비워두면 매도 판정 미사용"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  보유 주식 수
                </label>
                <input
                  type="number"
                  value={config.totalShares || ''}
                  onChange={(e) =>
                    handleChange(
                      'totalShares',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-3 rounded-lg number-font text-lg"
                  placeholder="비워두면 매도 주 수 미표시"
                />
              </div>
            </div>
          </section>

          {/* 알림 설정 */}
          <section className="bg-bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              🔔 알림 설정
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                <div>
                  <p className="font-semibold text-text-primary">푸시 알림</p>
                  <p className="text-sm text-text-secondary mt-1">
                    매수/매도 신호 발생 시 브라우저 알림을 받습니다
                  </p>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  disabled={notificationLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    notificationsEnabled
                      ? 'bg-accent text-bg-primary hover:bg-accent-hover'
                      : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
                  } ${notificationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {notificationLoading ? (
                    <>로딩...</>
                  ) : notificationsEnabled ? (
                    <>
                      <Bell className="w-4 h-4" />
                      켜짐
                    </>
                  ) : (
                    <>
                      <BellOff className="w-4 h-4" />
                      꺼짐
                    </>
                  )}
                </button>
              </div>

              {notificationsEnabled && (
                <div className="p-4 bg-bg-hover rounded-lg border border-border">
                  <p className="text-sm text-text-secondary mb-3">
                    ✅ 알림이 활성화되었습니다. 매수/매도 신호가 발생하면 자동으로 알림을 받게 됩니다.
                  </p>
                  <button
                    onClick={handleTestNotification}
                    className="text-sm px-4 py-2 bg-accent/20 text-accent hover:bg-accent/30 rounded-lg transition-colors"
                  >
                    테스트 알림 보내기
                  </button>
                </div>
              )}

              {!notificationsEnabled && (
                <div className="p-4 bg-bg-hover rounded-lg border border-border">
                  <p className="text-sm text-text-muted">
                    ℹ️ 알림을 켜면 중요한 매수/매도 타이밍을 놓치지 않을 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 위험 구역 - 데이터 초기화 */}
          <section className="bg-danger/10 p-6 rounded-lg border-2 border-danger/30">
            <h2 className="text-xl font-semibold mb-4 text-danger flex items-center gap-2">
              ⚠️ 위험 구역
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-3">
                  모든 거래 내역, 추적 데이터, 설정을 초기화합니다. <strong className="text-danger">이 작업은 되돌릴 수 없습니다.</strong>
                </p>
                <button
                  onClick={handleResetData}
                  className="w-full px-4 py-3 bg-danger/20 text-danger border-2 border-danger/50 rounded-lg hover:bg-danger hover:text-white transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                >
                  🗑️ 모든 데이터 초기화
                </button>
              </div>
            </div>
          </section>

          {/* 저장 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-accent text-bg-primary rounded-lg hover:bg-accent-hover transition-colors font-semibold text-lg"
            >
              <Save className={`w-5 h-5 ${saved ? 'animate-bounce' : ''}`} />
              {saved ? '✅ 저장됨' : '💾 저장하기'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
