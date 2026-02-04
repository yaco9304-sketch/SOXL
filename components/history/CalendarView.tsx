/**
 * 히스토리 달력 뷰 컴포넌트
 */

'use client';

import { useState } from 'react';
import { TradeEvent, ActionType } from '@/types';
import { formatDateShort } from '@/lib/utils/date';
import { formatUSD, formatPercent } from '@/lib/utils/format';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  events: TradeEvent[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 이번 달 1일의 요일 (0 = 일요일)
  const firstDay = new Date(year, month, 1).getDay();
  
  // 이번 달의 마지막 날
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 달력 데이터 생성
  const calendarDays: (number | null)[] = [];
  
  // 첫 주 빈 칸 채우기
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // 날짜 채우기
  for (let i = 1; i <= lastDate; i++) {
    calendarDays.push(i);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (day: number): TradeEvent[] => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateString);
  };

  const getEventDot = (action: ActionType): string => {
    switch (action) {
      case 'BUY':
        return 'bg-warning';
      case 'OVERBUY':
        return 'bg-orange-500';
      case 'SELL_BOUNCE':
      case 'SELL_TARGET':
        return 'bg-success';
      case 'STOP':
        return 'bg-danger';
      default:
        return 'bg-neutral';
    }
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="space-y-6">
      {/* 달력 헤더 */}
      <div className="bg-bg-card p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">
            {year}년 {monthNames[month]}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm font-semibold p-2 ${
                index === 0 ? 'text-danger' : index === 6 ? 'text-primary-500' : 'text-text-secondary'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayEvents = getEventsForDate(day);
            const hasEvents = dayEvents.length > 0;
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`aspect-square p-2 rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isToday
                    ? 'border-primary-500 bg-primary-500/10'
                    : hasEvents
                    ? 'border-bg-secondary bg-bg-secondary hover:bg-bg-primary'
                    : 'border-transparent hover:border-bg-secondary'
                }`}
              >
                <div className="h-full flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      isToday ? 'text-primary-500 font-bold' : 'text-text-primary'
                    }`}
                  >
                    {day}
                  </span>
                  
                  {/* 이벤트 점 */}
                  {hasEvents && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${getEventDot(event.action)}`}
                          title={event.note}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-xs text-text-muted">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="bg-bg-card p-6 rounded-xl">
        <h3 className="text-lg font-bold mb-4">이벤트 범례</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-text-secondary">정규 매수</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm text-text-secondary">과매수</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-text-secondary">매도</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-sm text-text-secondary">중단</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-primary-500" />
            <span className="text-sm text-text-secondary">오늘</span>
          </div>
        </div>
      </div>

      {/* 이번 달 요약 */}
      <div className="bg-gradient-to-br from-primary-500/10 to-bg-card p-6 rounded-xl border border-primary-500/30">
        <h3 className="text-lg font-bold mb-4">{monthNames[month]} 요약</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-text-muted mb-1">매수</p>
            <p className="text-2xl font-bold number-font text-warning">
              {events.filter((e) => {
                const eventDate = new Date(e.date);
                return (
                  eventDate.getMonth() === month &&
                  eventDate.getFullYear() === year &&
                  (e.action === 'BUY' || e.action === 'OVERBUY')
                );
              }).length}
              <span className="text-sm text-text-muted ml-1">회</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">매도</p>
            <p className="text-2xl font-bold number-font text-success">
              {events.filter((e) => {
                const eventDate = new Date(e.date);
                return (
                  eventDate.getMonth() === month &&
                  eventDate.getFullYear() === year &&
                  (e.action === 'SELL_BOUNCE' || e.action === 'SELL_TARGET')
                );
              }).length}
              <span className="text-sm text-text-muted ml-1">회</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">중단</p>
            <p className="text-2xl font-bold number-font text-danger">
              {events.filter((e) => {
                const eventDate = new Date(e.date);
                return (
                  eventDate.getMonth() === month &&
                  eventDate.getFullYear() === year &&
                  e.action === 'STOP'
                );
              }).length}
              <span className="text-sm text-text-muted ml-1">회</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">총 이벤트</p>
            <p className="text-2xl font-bold number-font text-primary-500">
              {events.filter((e) => {
                const eventDate = new Date(e.date);
                return (
                  eventDate.getMonth() === month &&
                  eventDate.getFullYear() === year
                );
              }).length}
              <span className="text-sm text-text-muted ml-1">건</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
