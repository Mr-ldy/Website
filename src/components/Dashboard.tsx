import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock } from './Clock';
import { SearchBox } from './SearchBox';
import { IconRenderer } from './IconRenderer';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

import { CalendarWidget } from './CalendarWidget';
import { NotesWidget } from './NotesWidget';

export const Dashboard: React.FC = () => {
  const { links, categories, settings } = useApp();

  const enabledWidgets = settings.widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-12 pb-32 relative">
      <Clock />
      <SearchBox />

      {/* Widgets Section - Now left aligned and using updated widths */}
      {enabledWidgets.length > 0 && (
        <div className="w-full max-w-7xl flex flex-wrap justify-start items-start gap-4 mb-16 pl-12 pr-4 sm:pl-16">
          {enabledWidgets.map(w => {
            // New widths as requested by user
            const widthClass = w.size === 'small' ? 'w-auto' : 
                              w.size === 'medium' ? 'w-[220px]' : 
                              'w-[340px]';
            
            return (
              <motion.div 
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`${widthClass} max-w-full h-full`}
              >
                {w.type === 'calendar' && <CalendarWidget size={w.size} />}
                {w.type === 'notes' && <NotesWidget size={w.size} />}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="w-full max-w-7xl space-y-16 pl-12 pr-4 sm:pl-16">
        {categories.map((cat, idx) => {
          const catLinks = links.filter(l => l.categoryId === cat.id);

          return (
            <motion.section
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 group">
                {cat.icon && <IconRenderer name={cat.icon} className="w-5 h-5 text-white/50" />}
                <h2 className="text-lg font-semibold text-white/80 group-hover:text-white transition-colors">
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {catLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/15 hover:border-white/20 hover:-translate-y-1 transition-all group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-xl group-hover:scale-110 transition-transform overflow-hidden">
                      <IconRenderer 
                        name={link.icon} 
                        targetUrl={link.url} 
                        className={(link.icon.startsWith('http') || link.icon === link.url) ? 'w-full h-full' : 'w-6 h-6 text-white'} 
                      />
                    </div>
                    <span className="text-sm font-medium text-white/90 truncate w-full text-center">
                      {link.title}
                    </span>
                  </a>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      <Link
        to="/admin"
        className="fixed bottom-6 right-6 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all shadow-xl z-50 hover:scale-110 active:scale-95"
      >
        <Settings size={20} />
      </Link>
    </div>
  );
};
