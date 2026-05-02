import { AppState } from "./types";

export const DEFAULT_STATE: AppState = {
  links: [
    { id: '1', title: 'GitHub', url: 'https://github.com', icon: 'Github', categoryId: '1' },
    { id: '2', title: 'Google', url: 'https://google.com', icon: 'Search', categoryId: '1' },
    { id: '3', title: 'AI Studio', url: 'https://aistudio.google.com', icon: 'Sparkles', categoryId: '2' },
    { id: '4', title: 'ChatGPT', url: 'https://chat.openai.com', icon: 'MessageSquare', categoryId: '2' },
  ],
  categories: [
    { id: '1', name: '常用', icon: 'Star' },
    { id: '2', name: 'AI工具', icon: 'Cpu' },
  ],
  settings: {
    wallpaper: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070',
    searchEngine: 'google',
    showClock: true,
    adminPassword: 'password', // Default password
    theme: 'glass',
    widgets: [
      { id: 'calendar', type: 'calendar', enabled: true, order: 0, size: 'small' },
      { id: 'notes', type: 'notes', enabled: true, order: 1, size: 'large' },
    ]
  },
  notes: '这是一条便签，你可以在后台修改它。'
};

export const SEARCH_ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  baidu: { name: 'Baidu', url: 'https://www.baidu.com/s?wd=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  github: { name: 'GitHub', url: 'https://github.com/search?q=' },
};
