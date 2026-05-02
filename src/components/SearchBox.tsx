import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SEARCH_ENGINES } from '../constants';
import { cn } from '../lib/utils';
import { SearchEngine } from '../types';

export const SearchBox: React.FC = () => {
  const { settings, setSettings } = useApp();
  const [query, setQuery] = useState('');
  const [showEngines, setShowEngines] = useState(false);

  const activeEngine = SEARCH_ENGINES[settings.searchEngine as SearchEngine] || SEARCH_ENGINES.google;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.open(`${activeEngine.url}${encodeURIComponent(query)}`, '_blank');
  };

  const selectEngine = (key: SearchEngine) => {
    setSettings({ ...settings, searchEngine: key });
    setShowEngines(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 relative px-4">
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 shadow-2xl transition-all focus-within:bg-white/15 focus-within:border-white/30"
      >
        <button
          type="button"
          onClick={() => setShowEngines(!showEngines)}
          className="flex items-center gap-1.5 px-4 py-2 hover:bg-white/10 rounded-xl transition-colors text-white/80"
        >
          <span className="text-sm font-medium">{activeEngine.name}</span>
          <ChevronDown size={14} className={cn("transition-transform", showEngines && "rotate-180")} />
        </button>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索一下..."
          className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-white placeholder:text-white/40 font-medium"
        />

        <button
          type="submit"
          className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white/80"
        >
          <Search size={20} />
        </button>
      </form>

      {showEngines && (
        <div className="absolute top-full left-4 mt-2 w-40 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
          {(Object.entries(SEARCH_ENGINES) as [SearchEngine, any][]).map(([key, engine]) => (
            <button
              key={key}
              onClick={() => selectEngine(key)}
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors",
                settings.searchEngine === key ? "text-white font-semibold flex items-center gap-2" : "text-white/60"
              )}
            >
              {engine.name}
              {settings.searchEngine === key && <div className="w-1 h-1 rounded-full bg-white" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
