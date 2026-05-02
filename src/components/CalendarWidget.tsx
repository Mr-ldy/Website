import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';

interface CalendarWidgetProps {
  size?: 'small' | 'medium' | 'large';
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ size = 'medium' }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [isExpanded, setIsExpanded] = React.useState(false);
  const today = new Date();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 }),
  });

  const isMinimized = size === 'small' && !isExpanded;

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white hover:bg-white/20 transition-all flex items-center gap-3 shadow-xl"
      >
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <span className="text-xs font-bold">{format(today, 'd')}</span>
        </div>
        <span className="text-sm font-medium">日历</span>
      </button>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 text-white w-full h-full shadow-2xl relative">
      {size === 'small' && (
        <button 
          onClick={() => setIsExpanded(false)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 z-10"
        >
          <ChevronUp size={14} />
        </button>
      )}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          {format(currentMonth, 'yyyy年 MM月', { locale: zhCN })}
        </h3>
        <div className="flex gap-0.5">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-[9px] uppercase font-bold text-white/40 mb-1">{d}</div>
        ))}
        {days.map(day => {
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <div 
              key={day.toString()} 
              className={`
                aspect-square flex items-center justify-center text-[10px] sm:text-xs rounded-lg transition-all
                ${isToday ? 'bg-white text-black font-bold scale-105 shadow-lg' : ''}
                ${!isToday && isCurrentMonth ? 'text-white/80 hover:bg-white/5' : ''}
                ${!isCurrentMonth ? 'text-white/10' : ''}
              `}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
};
