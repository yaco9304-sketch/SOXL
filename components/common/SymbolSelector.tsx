/**
 * 심볼 선택 컴포넌트
 */

'use client';

import { SupportedSymbol } from '@/types';
import { SYMBOL_INFO, SUPPORTED_SYMBOLS } from '@/lib/constants/symbols';
import { Check } from 'lucide-react';

interface SymbolSelectorProps {
  activeSymbol: SupportedSymbol;
  onChange: (symbol: SupportedSymbol) => void;
  className?: string;
}

export function SymbolSelector({ activeSymbol, onChange, className = '' }: SymbolSelectorProps) {
  return (
    <div className={`flex items-center gap-2 bg-bg-card p-1 rounded-lg ${className}`}>
      {SUPPORTED_SYMBOLS.map((symbol) => {
        const info = SYMBOL_INFO[symbol];
        const isActive = activeSymbol === symbol;

        return (
          <button
            key={symbol}
            onClick={() => onChange(symbol)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isActive
                ? 'bg-primary-500 text-white shadow-lg scale-105'
                : 'text-text-secondary hover:bg-bg-secondary hover:scale-105'
            }`}
            title={info.fullName}
          >
            {/* 심볼 아이콘 */}
            <div
              className={`w-3 h-3 rounded-full ${isActive ? 'bg-white' : ''}`}
              style={{
                backgroundColor: isActive ? 'white' : info.color,
              }}
            />
            
            {/* 심볼명 */}
            <span className="font-bold">{symbol}</span>

            {/* 레버리지 배지 */}
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              isActive ? 'bg-white/20' : 'bg-bg-primary'
            }`}>
              {info.leverage}
            </span>

            {/* 선택 체크 */}
            {isActive && (
              <Check className="w-4 h-4 animate-in zoom-in" strokeWidth={3} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 작은 버전 (모바일용)
 */
export function SymbolSelectorCompact({ activeSymbol, onChange }: SymbolSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-bg-card p-0.5 rounded-lg">
      {SUPPORTED_SYMBOLS.map((symbol) => {
        const info = SYMBOL_INFO[symbol];
        const isActive = activeSymbol === symbol;

        return (
          <button
            key={symbol}
            onClick={() => onChange(symbol)}
            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all duration-300 ${
              isActive
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-text-secondary hover:bg-bg-secondary'
            }`}
            title={info.fullName}
          >
            {symbol}
          </button>
        );
      })}
    </div>
  );
}
