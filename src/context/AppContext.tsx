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
  exportData: () => void;
  importData: (data: string) => boolean;
  syncToGithub: () => Promise<{success: boolean; message: string}>;
  pullFromGithub: () => Promise<{success: boolean; message: string}>;
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

  // Automatically fetch from GitHub or public data.json on startup
  useEffect(() => {
    const autoFetch = async () => {
      let latestData = null;

      // 1. Try fetching from GitHub API if we have a token (this gets the absolute latest commit without waiting for GH Pages)
      if (state.settings?.githubSync?.enabled && state.settings.githubSync.token && state.settings.githubSync.repo) {
        try {
          const { token, repo, branch, path } = state.settings.githubSync;
          const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Cache-Control': 'no-cache'
            }
          });
          if (getRes.ok) {
            const data = await getRes.json();
            const decodedContent = decodeURIComponent(escape(atob(data.content)));
            latestData = JSON.parse(decodedContent);
          }
        } catch (e) {
          console.warn('Auto fetch from GitHub API failed:', e);
        }
      }

      // 2. Fallback: fetch from /data.json (for public visitors without token)
      if (!latestData) {
        try {
          const res = await fetch(`/data.json?t=${Date.now()}`);
          if (res.ok) {
            latestData = await res.json();
          }
        } catch (e) {
          console.warn('Auto fetch from /data.json failed:', e);
        }
      }

      // 3. Merge data if we got something
      if (latestData && typeof latestData === 'object') {
        setState(s => ({
          ...DEFAULT_STATE,
          ...latestData,
          settings: {
            ...DEFAULT_STATE.settings,
            ...(latestData.settings || {}),
            githubSync: {
              ...(latestData.settings?.githubSync || {}),
              token: s.settings?.githubSync?.token || '' // Always keep local token
            }
          }
        }));
      }
    };

    autoFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run exactly once on startup

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

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'sun-panel-config.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch(e) {
      console.error('Export error:', e);
    }
  };

  const importData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') return false;
      setState({
        ...DEFAULT_STATE,
        ...parsed,
        settings: {
          ...DEFAULT_STATE.settings,
          ...(parsed.settings || {})
        }
      });
      return true;
    } catch(e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const syncToGithub = async () => {
    const config = state.settings.githubSync;
    if (!config || !config.enabled || !config.token || !config.repo) {
      return { success: false, message: 'GitHub Sync 配置不完整！' };
    }

    try {
      const { token, repo, branch, path } = config;
      const getUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
      let sha = '';
      
      const getRes = await fetch(getUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      } else if (getRes.status !== 404) {
        return { success: false, message: `获取文件失败: ${getRes.statusText}` };
      }

      // Hide token from exported config for security
      const exportState = { ...state };
      exportState.settings = { ...exportState.settings };
      if (exportState.settings.githubSync) {
        exportState.settings.githubSync = { ...exportState.settings.githubSync, token: '' };
      }

      const content = btoa(unescape(encodeURIComponent(JSON.stringify(exportState, null, 2))));

      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'chore: Sun-Panel data auto-sync',
          content: content,
          branch: branch,
          ...(sha ? { sha } : {})
        })
      });

      if (putRes.ok) {
        return { success: true, message: '同步到 GitHub 成功！' };
      } else {
        const errorData = await putRes.json();
        return { success: false, message: `同步失败: ${errorData.message || putRes.statusText}` };
      }
    } catch (e: any) {
      return { success: false, message: `同步异常: ${e.message}` };
    }
  };

  const pullFromGithub = async () => {
    const config = state.settings.githubSync;
    if (!config || !config.enabled || !config.token || !config.repo) {
      return { success: false, message: 'GitHub Sync 配置不完整！' };
    }
    
    try {
      const { token, repo, branch, path } = config;
      const getUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
      
      const getRes = await fetch(getUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          // Prevent caching
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!getRes.ok) {
         return { success: false, message: `获取远端配置失败: ${getRes.statusText}` };
      }
      
      const data = await getRes.json();
      const decodedContent = decodeURIComponent(escape(atob(data.content)));
      
      const parsed = JSON.parse(decodedContent);
      if (!parsed || typeof parsed !== 'object') return { success: false, message: '远端数据格式不正确' };

      // Keep token when pulling
      setState(s => ({
        ...DEFAULT_STATE,
        ...parsed,
        settings: {
          ...DEFAULT_STATE.settings,
          ...(parsed.settings || {}),
          githubSync: {
            ...(parsed.settings?.githubSync || {}),
            token: token // Restore the local token
          }
        }
      }));
      return { success: true, message: '从 GitHub 拉取数据成功！' };
      
    } catch (e: any) {
      return { success: false, message: `获取配置异常: ${e.message}` };
    }
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
      updateNotes,
      exportData,
      importData,
      syncToGithub,
      pullFromGithub
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
