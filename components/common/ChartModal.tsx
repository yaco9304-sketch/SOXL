/**
 * 차트 모달
 */

'use client';

import { useEffect, useRef, useId } from 'react';
import { SupportedSymbol } from '@/types';
import { X } from 'lucide-react';

interface ChartModalProps {
  symbol: SupportedSymbol;
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

export function ChartModal({ symbol, isOpen, onClose }: ChartModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId();
  const containerId = `tradingview_modal_${symbol}_${uniqueId.replace(/:/g, '_')}`;

  useEffect(() => {
    if (!isOpen) return;

    // TradingView 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        // 심볼별 거래소 매핑 (TradingView 인식용: SOXL/UPRO=NYSEARCA, TQQQ=NASDAQ)
        const getSymbolWithExchange = (sym: string) => {
          switch (sym) {
            case 'SOXL':
            case 'UPRO':
              return `NYSEARCA:${sym}`;
            case 'TQQQ':
              return `NASDAQ:${sym}`;
            default:
              return `NASDAQ:${sym}`;
          }
        };

        new window.TradingView.widget({
          autosize: true,
          symbol: getSymbolWithExchange(symbol),
          interval: 'D',
          timezone: 'America/New_York',
          theme: 'dark',
          style: '1',
          locale: 'kr',
          toolbar_bg: '#0d1117',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          details: true,
          hotlist: false,
          calendar: false,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies',
          ],
          show_popup_button: false,
          popup_width: '1000',
          popup_height: '650',
          container_id: containerId,
          backgroundColor: '#0d1117',
          gridColor: '#1c2128',
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, isOpen, containerId]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl h-[80vh] bg-bg-card rounded-lg border border-border overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-bg-card/95 backdrop-blur border-b border-border">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            📊 {symbol} 차트
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* 차트 컨테이너 */}
        <div className="w-full h-full pt-16">
          <div
            id={containerId}
            ref={containerRef}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
