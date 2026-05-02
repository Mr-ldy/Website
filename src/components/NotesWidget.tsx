import React from 'react';
import { StickyNote, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NotesWidgetProps {
  size?: 'small' | 'medium' | 'large';
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({ size = 'medium' }) => {
  const { notes } = useApp();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isMinimized = size === 'small' && !isExpanded;

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white hover:bg-white/20 transition-all flex items-center gap-3 shadow-xl"
      >
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <StickyNote size={16} />
        </div>
        <span className="text-sm font-medium">便签</span>
      </button>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 text-white w-full h-full shadow-2xl flex flex-col group relative">
      {size === 'small' && (
        <button 
          onClick={() => setIsExpanded(false)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 z-10"
        >
          <ChevronUp size={14} className="rotate-180" />
        </button>
      )}
      <div className="flex items-center gap-2 mb-2 text-white/50">
        <StickyNote size={15} />
        <span className="text-[10px] font-bold tracking-wider uppercase">便签备忘</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pt-1">
        <p className="text-white/80 leading-snug whitespace-pre-wrap text-sm font-medium">
          {notes || "暂无内容..."}
        </p>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-white/20 flex justify-center">
        <span>最后更新于 本地浏览器</span>
      </div>
    </div>
  );
};
