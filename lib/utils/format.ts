/**
 * 숫자 포맷팅 유틸리티
 */

/**
 * USD 통화 포맷
 * @example formatUSD(1234.56) // "$1,234.56"
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * KRW 통화 포맷
 * @example formatKRW(1234567) // "₩1,234,567"
 */
export function formatKRW(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * 퍼센트 포맷 (부호 포함)
 * @example formatPercent(8.5) // "+8.50%"
 * @example formatPercent(-7.2) // "-7.20%"
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * 퍼센트 포맷 (부호 제외)
 * @example formatPercentSimple(8.5) // "8.50%"
 */
export function formatPercentSimple(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * 숫자를 천 단위 콤마로 포맷
 * @example formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * 주식 수 포맷 (소수점 제거)
 * @example formatShares(38.5) // "38 주"
 */
export function formatShares(value: number): string {
  return `${Math.floor(value)} 주`;
}

/**
 * 변동률에 따른 색상 클래스 반환 (한국식 - 상승 빨강, 하락 파랑)
 * @example getChangeColor(-7.5) // "text-down"
 */
export function getChangeColor(changePct: number): string {
  if (changePct > 0) return 'text-up';
  if (changePct < 0) return 'text-down';
  return 'text-neutral';
}

/**
 * 변동률에 따른 배경 색상 클래스 반환
 * @example getChangeBgColor(-7.5) // "bg-danger"
 */
export function getChangeBgColor(changePct: number): string {
  if (changePct > 0) return 'bg-success';
  if (changePct < 0) return 'bg-danger';
  return 'bg-neutral';
}
