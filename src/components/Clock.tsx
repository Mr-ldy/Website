import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-7xl px-4 text-center text-white drop-shadow-md mb-12 select-none">
      <div className="flex flex-col items-center">
        <div className="flex items-baseline font-light tracking-tight tabular-nums">
          <span className="text-7xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            {format(time, 'HH:mm')}
          </span>
          <div className="flex items-center ml-4">
            <span className="text-4xl md:text-5xl opacity-80 font-extralight mr-1">:</span>
            <span className="text-4xl md:text-5xl opacity-80 font-extralight min-w-[2ch]">{format(time, 'ss')}</span>
          </div>
        </div>
        <div className="text-lg md:text-xl font-medium mt-2 text-white/60">
          {format(time, 'MM月dd日 EEEE', { locale: zhCN })}
        </div>
      </div>
    </div>
  );
};
