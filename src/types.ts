export interface NavLink {
  id: string;
  title: string;
  url: string;
  icon: string; // Lucide icon name or URL
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export type SearchEngine = 'google' | 'baidu' | 'bing' | 'github';

export interface WidgetConfig {
  id: string;
  type: 'calendar' | 'notes';
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
}

export interface AppSettings {
  wallpaper: string;
  searchEngine: SearchEngine;
  showClock: boolean;
  adminPassword: string;
  theme: 'light' | 'dark' | 'glass';
  widgets: WidgetConfig[];
}

export interface AppState {
  links: NavLink[];
  categories: Category[];
  settings: AppSettings;
  notes: string;
}
