import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, NavLink, Category, AppSettings } from '../types';
import { DEFAULT_STATE } from '../constants';

interface AppContextType extends AppState {
  setLinks: (links: NavLink[]) => void;
  setCategories: (categories: Category[]) => void;
  setSettings: (settings: AppSettings) => void;
  addLink: (link: Omit<NavLink, 'id'>) => void;
  updateLink: (id: string, link: Partial<NavLink>) => void;
  deleteLink: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  resetToDefault: () => void;
  updateNotes: (notes: string) => void;
}

const STORAGE_KEY = 'sun_panel_state';
const AUTH_KEY = 'sun_panel_auth';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_STATE;
      
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        settings: {
          ...DEFAULT_STATE.settings,
          ...(parsed.settings || {})
        }
      };
    } catch (e) {
      console.error('LocalStorage load error:', e);
      return DEFAULT_STATE;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [state]);

  const setLinks = (links: NavLink[]) => setState(s => ({ ...s, links }));
  const setCategories = (categories: Category[]) => setState(s => ({ ...s, categories }));
  const setSettings = (settings: AppSettings) => setState(s => ({ ...s, settings }));

  const generateId = () => {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  };

  const addLink = (link: Omit<NavLink, 'id'>) => {
    const newLink = { ...link, id: generateId() };
    setState(s => ({ ...s, links: [...s.links, newLink] }));
  };

  const updateLink = (id: string, link: Partial<NavLink>) => {
    setState(s => ({
      ...s,
      links: s.links.map(l => l.id === id ? { ...l, ...link } : l)
    }));
  };

  const deleteLink = (id: string) => {
    setState(s => ({ ...s, links: s.links.filter(l => l.id !== id) }));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCat = { ...category, id: generateId() };
    setState(s => ({ ...s, categories: [...s.categories, newCat] }));
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setState(s => ({
      ...s,
      categories: s.categories.map(c => c.id === id ? { ...c, ...category } : c)
    }));
  };

  const deleteCategory = (id: string) => {
    setState(s => ({
      ...s,
      categories: s.categories.filter(c => c.id !== id),
      links: s.links.filter(l => l.categoryId !== id)
    }));
  };

  const login = (password: string) => {
    if (password === state.settings.adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const resetToDefault = () => {
    setState(DEFAULT_STATE);
  };

  const updateNotes = (notes: string) => {
    setState(s => ({ ...s, notes }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setLinks,
      setCategories,
      setSettings,
      addLink,
      updateLink,
      deleteLink,
      addCategory,
      updateCategory,
      deleteCategory,
      isAuthenticated,
      login,
      logout,
      resetToDefault,
      updateNotes
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
