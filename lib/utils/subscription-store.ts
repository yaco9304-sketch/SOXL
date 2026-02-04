/**
 * 푸시 알림 구독 정보 저장소
 * 
 * ⚠️ 주의: 현재는 메모리에 저장됩니다 (서버 재시작 시 사라짐)
 * 실제 프로덕션 환경에서는 데이터베이스에 저장해야 합니다.
 */

const subscriptions = new Map<string, PushSubscription>();

/**
 * 구독 정보 저장
 */
export function saveSubscription(userId: string, subscription: PushSubscription): void {
  subscriptions.set(userId, subscription);
}

/**
 * 구독 정보 삭제
 */
export function removeSubscription(userId: string): boolean {
  return subscriptions.delete(userId);
}

/**
 * 특정 사용자의 구독 정보 가져오기
 */
export function getSubscription(userId: string): PushSubscription | undefined {
  return subscriptions.get(userId);
}

/**
 * 모든 구독 정보 가져오기
 */
export function getAllSubscriptions(): Map<string, PushSubscription> {
  return subscriptions;
}

/**
 * 구독자 수 확인
 */
export function getSubscriptionCount(): number {
  return subscriptions.size;
}
