/**
 * TradingView 차트 위젯
 */

'use client';

import { useEffect, useRef } from 'react';
import { SupportedSymbol } from '@/types';

interface TradingViewChartProps {
  symbol: SupportedSymbol;
  height?: number;
}

declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

export function TradingViewChart({ symbol, height = 400 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TradingView 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        const symbolWithExchange =
          symbol === 'SOXL' || symbol === 'UPRO'
            ? `NYSEARCA:${symbol}`
            : `NASDAQ:${symbol}`;
        new window.TradingView.widget({
          autosize: false,
          width: '100%',
          height: height,
          symbol: symbolWithExchange,
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
          container_id: containerRef.current.id,
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
  }, [symbol, height]);

  return (
    <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          📊 {symbol} 차트
          <span className="text-sm text-text-muted font-normal">
            (일봉)
          </span>
        </h3>
      </div>
      <div
        id={`tradingview_${symbol}_${Date.now()}`}
        ref={containerRef}
        className="tradingview-widget-container"
      />
    </div>
  );
}
