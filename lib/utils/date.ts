/**
 * 날짜 관련 유틸리티
 */

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayString(): string {
  const today = new Date();
  return formatDateString(today);
}

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 문자열을 Date 객체로 변환
 */
export function parseDateString(dateString: string): Date {
  return new Date(dateString);
}

/**
 * 두 날짜 사이의 일수 계산
 */
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = parseDateString(date1);
  const d2 = parseDateString(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * 특정 날짜가 오늘인지 확인
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayString();
}

/**
 * 날짜를 한국어 형식으로 포맷
 * @example formatDateKorean("2026-02-01") // "2026년 2월 1일"
 */
export function formatDateKorean(dateString: string): string {
  const date = parseDateString(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 날짜를 간단한 형식으로 포맷
 * @example formatDateShort("2026-02-01") // "02/01"
 */
export function formatDateShort(dateString: string): string {
  const date = parseDateString(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * 상대 시간 포맷 (몇 분 전, 몇 시간 전 등)
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date().getTime();
  const past = new Date(timestamp).getTime();
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDateKorean(formatDateString(new Date(timestamp)));
}
