/**
 * 지원하는 심볼 정보
 */

import { SupportedSymbol, SymbolInfo } from '@/types';

export const SYMBOL_INFO: Record<SupportedSymbol, SymbolInfo> = {
  SOXL: {
    symbol: 'SOXL',
    name: 'SOXL',
    fullName: 'Direxion Daily Semiconductor Bull 3X Shares',
    description: '반도체 섹터 3배 레버리지 ETF',
    leverage: '3x',
    sector: '반도체',
    color: '#2563eb', // 파란색
  },
  TQQQ: {
    symbol: 'TQQQ',
    name: 'TQQQ',
    fullName: 'ProShares UltraPro QQQ',
    description: '나스닥100 3배 레버리지 ETF',
    leverage: '3x',
    sector: '나스닥',
    color: '#10b981', // 초록색
  },
  UPRO: {
    symbol: 'UPRO',
    name: 'UPRO',
    fullName: 'ProShares UltraPro S&P500',
    description: 'S&P500 3배 레버리지 ETF',
    leverage: '3x',
    sector: 'S&P500',
    color: '#f59e0b', // 노란색
  },
};

export const SUPPORTED_SYMBOLS: SupportedSymbol[] = ['SOXL', 'TQQQ', 'UPRO'];

export const DEFAULT_SYMBOL: SupportedSymbol = 'SOXL';
