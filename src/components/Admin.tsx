import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Link as LinkIcon,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ArrowLeft,
  Menu,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { toast } from 'sonner';
import { Category, NavLink } from '../types';
import { Reorder } from 'motion/react';

export const Admin: React.FC = () => {
  const {
    links, setLinks, categories, setCategories, settings, setSettings,
    addLink, updateLink, deleteLink,
    addCategory, updateCategory, deleteCategory,
    logout, resetToDefault, isAuthenticated,
    notes, updateNotes, exportData, importData, syncToGithub, pullFromGithub
  } = useApp();
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const [activeTab, setActiveTab] = useState<'links' | 'categories' | 'settings' | 'widgets'>('links');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Link form state
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [linkForm, setLinkForm] = useState<Omit<NavLink, 'id'>>({
    title: '', url: '', icon: 'Globe', categoryId: ''
  });

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    setLinkForm(prev => ({ ...prev, categoryId: selectedCategoryId || categories[0]?.id || '' }));
  }, [selectedCategoryId, categories]);

  // Category form state
  const [categoryForm, setCategoryForm] = useState<Omit<Category, 'id'>>({
    name: '', icon: 'Star'
  });

  // Settings state
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });

  if (!isAuthenticated) return null;

  const handleAddLink = () => {
    if (!linkForm.title || !linkForm.url || !linkForm.categoryId) {
      toast.error('请填写完整信息');
      return;
    }
    addLink(linkForm);
    setLinkForm({ title: '', url: '', icon: 'Globe', categoryId: categories[0]?.id || '' });
    toast.success('添加成功');
  };

  const handleUpdateLink = (id: string) => {
    updateLink(id, linkForm);
    setEditingLink(null);
    toast.success('更新成功');
  };

  const handleAddCategory = () => {
    if (!categoryForm.name) {
      toast.error('请填写分类名称');
      return;
    }
    addCategory(categoryForm);
    setCategoryForm({ name: '', icon: 'Star' });
    toast.success('添加成功');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.old !== settings.adminPassword) {
      toast.error('原密码错误');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('两次输入的新密码不一致');
      return;
    }
    if (passwordForm.new.length < 4) {
      toast.error('密码长度至少4位');
      return;
    }
    setSettings({ ...settings, adminPassword: passwordForm.new });
    toast.success('密码修改成功');
    setPasswordForm({ old: '', new: '', confirm: '' });
  };

  const toggleWidget = (id: string) => {
    setSettings({
      ...settings,
      widgets: settings.widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    });
  };

  const moveWidget = (id: string, dir: 'up' | 'down') => {
    const idx = settings.widgets.findIndex(w => w.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === settings.widgets.length - 1) return;

    const newWidgets = [...settings.widgets];
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    [newWidgets[idx], newWidgets[targetIdx]] = [newWidgets[targetIdx], newWidgets[idx]];
    
    setSettings({ ...settings, widgets: newWidgets });
  };

  const NavItems = () => (
    <>
      <button
        onClick={() => { setActiveTab('links'); setIsSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${activeTab === 'links' ? 'bg-white text-black font-bold shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
      >
        <LinkIcon size={20} /> 链接管理
      </button>
      <button
        onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${activeTab === 'categories' ? 'bg-white text-black font-bold shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
      >
        <LayoutGrid size={20} /> 分类管理
      </button>
      <button
        onClick={() => { setActiveTab('widgets'); setIsSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${activeTab === 'widgets' ? 'bg-white text-black font-bold shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
      >
        <Plus size={20} className="rotate-45" /> 小组管理
      </button>
      <button
        onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] ${activeTab === 'settings' ? 'bg-white text-black font-bold shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
      >
        <SettingsIcon size={20} /> 全局设置
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-black/40 backdrop-blur-3xl flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-bold italic text-sm">S</div>
          <h1 className="text-lg font-bold text-white">管理后台</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white/60">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-0 z-[100] md:static md:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        {/* Backdrop for mobile */}
        {isSidebarOpen && <div className="absolute inset-0 bg-black/60 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
        
        {/* Real Sidebar */}
        <div className="relative w-64 h-full border-r border-white/10 flex flex-col p-6 bg-zinc-900 md:bg-black/20 z-50 overflow-y-auto">
          <div className="hidden md:flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-xl font-bold italic">S</div>
            <h1 className="text-xl font-bold text-white">管理后台</h1>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItems />
          </nav>

          <div className="mt-8 space-y-2">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white transition-all bg-white/5"
            >
              <ArrowLeft size={20} /> 返回首页
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all font-medium"
            >
              <LogOut size={20} /> 退出登录
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-12 overflow-y-auto w-full">
        {activeTab === 'links' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">链接管理</h2>

            {/* Quick Add */}
            <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
              <h3 className="text-lg font-semibold text-white/80">添加新链接</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="网站名称"
                  value={linkForm.title}
                  onChange={e => setLinkForm({ ...linkForm, title: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                <input
                  type="text"
                  placeholder="链接地址 (http://...)"
                  value={linkForm.url}
                  onChange={e => setLinkForm({ ...linkForm, url: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                <input
                  type="text"
                  placeholder="图标 (填网站链接则自动抓取网站图标)"
                  value={linkForm.icon}
                  onChange={e => setLinkForm({ ...linkForm, icon: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                <select
                  value={linkForm.categoryId}
                  onChange={e => setLinkForm({ ...linkForm, categoryId: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                >
                  <option value="" disabled className="bg-zinc-900">选择分类</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddLink}
                className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.99] transition-all"
              >
                <Plus size={20} /> 添加链接
              </button>
            </div>

            {/* Links List */}
            <div className="space-y-6">
              {/* Category selector for links */}
              <div className="flex flex-wrap gap-2 pb-4 overflow-x-auto custom-scrollbar no-scrollbar-on-mobile">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 whitespace-nowrap ${selectedCategoryId === cat.id ? 'bg-white text-black font-bold shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                  >
                    <IconRenderer name={cat.icon || 'Star'} className="w-4 h-4" />
                    {cat.name}
                    <span className={`text-[10px] px-1.5 rounded-full ${selectedCategoryId === cat.id ? 'bg-black/10' : 'bg-white/10'}`}>
                      {links.filter(l => l.categoryId === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>

              <Reorder.Group 
                axis="y" 
                values={links.filter(l => l.categoryId === selectedCategoryId)} 
                onReorder={(newFilteredLinks) => {
                  const otherLinks = links.filter(l => l.categoryId !== selectedCategoryId);
                  setLinks([...otherLinks, ...newFilteredLinks]);
                }}
                className="space-y-3"
              >
                {links.filter(l => l.categoryId === selectedCategoryId).map(link => (
                  <Reorder.Item 
                    key={link.id} 
                    value={link}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between group cursor-grab active:cursor-grabbing hover:bg-white-[0.07] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-white/20">
                        <GripVertical size={18} />
                      </div>
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        <IconRenderer 
                          name={link.icon} 
                          targetUrl={link.url} 
                          className={(link.icon.startsWith('http') || link.icon === link.url) ? 'w-full h-full' : 'w-5 h-5 text-white'} 
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-medium truncate">{link.title}</h4>
                        <p className="text-white/40 text-xs truncate max-w-[150px] sm:max-w-sm">{link.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <button
                        onClick={() => {
                          setEditingLink(link.id);
                          setLinkForm({ title: link.title, url: link.url, icon: link.icon, categoryId: link.categoryId });
                        }}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定删除吗？')) deleteLink(link.id);
                        }}
                        className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
                {links.filter(l => l.categoryId === selectedCategoryId).length === 0 && (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center text-white/20">
                    该分类下暂无链接
                  </div>
                )}
              </Reorder.Group>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">分类管理</h2>

            <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
              <h3 className="text-lg font-semibold text-white/80">添加新分类</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="分类名称"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                <input
                  type="text"
                  placeholder="分类图标 (Lucide名称)"
                  value={categoryForm.icon}
                  onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
              <button
                onClick={handleAddCategory}
                className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
              >
                <Plus size={20} /> 添加分类
              </button>
            </div>

            <Reorder.Group 
              axis="y" 
              values={categories} 
              onReorder={setCategories}
              className="space-y-4"
            >
              {categories.map(cat => (
                <Reorder.Item 
                  key={cat.id} 
                  value={cat}
                  className="bg-zinc-800/50 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 flex items-center justify-between group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-white/20">
                      <GripVertical size={20} />
                    </div>
                    <IconRenderer name={cat.icon || 'Star'} className="w-6 h-6 text-white/50" />
                    <span className="text-white font-semibold text-lg">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('确定删除分类吗？该分类下的所有链接也将被删除。')) deleteCategory(cat.id);
                    }}
                    className="p-2 text-red-400/60 md:text-red-400/0 md:group-hover:text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        {activeTab === 'widgets' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">小组组件管理</h2>

            {/* Widget Toggles */}
            <div className="space-y-4">
              {settings.widgets.map((widget, idx) => (
                <div key={widget.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      {widget.type === 'calendar' ? <LayoutGrid className="text-blue-400" /> : <Save className="text-yellow-400" />}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{widget.type === 'calendar' ? '日历组件' : '便签组件'}</h4>
                      <p className="text-white/40 text-sm">在首页展示内容模块</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                      {(['small', 'medium', 'large'] as const).map(size => (
                        <button
                          key={size}
                          onClick={() => {
                            setSettings({
                              ...settings,
                              widgets: settings.widgets.map(w => w.id === widget.id ? { ...w, size } : w)
                            });
                          }}
                          className={`px-3 py-1 text-xs rounded-md transition-all ${widget.size === size ? 'bg-white text-black font-bold' : 'text-white/40 hover:text-white'}`}
                        >
                          {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => moveWidget(widget.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-10"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button 
                        onClick={() => moveWidget(widget.id, 'down')}
                        disabled={idx === settings.widgets.length - 1}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-10"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      className={`w-14 h-7 rounded-full transition-all relative ${widget.enabled ? 'bg-white' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full transition-all ${widget.enabled ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes Editor */}
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 space-y-6">
              <h3 className="text-lg font-semibold text-white/80">便签内容编辑</h3>
              <textarea
                value={notes}
                onChange={e => updateNotes(e.target.value)}
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-lg leading-relaxed placeholder:text-white/20"
                placeholder="在此输入便签内容，会自动保存并同步到首页组件..."
              />
              <div className="flex justify-between items-center text-white/30 text-xs">
                <span>支持多行文本输入</span>
                <span>自动实时保存</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">全局设置</h2>

            {/* General */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-white/80 border-b border-white/10 pb-2">偏好设置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/40 text-sm mb-2">背景壁纸 URL</label>
                  <input
                    type="text"
                    value={settings.wallpaper}
                    onChange={e => setSettings({ ...settings, wallpaper: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white font-medium">首页展示时钟组件</span>
                  <button
                    onClick={() => setSettings({ ...settings, showClock: !settings.showClock })}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.showClock ? 'bg-white' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.showClock ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Password */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-white/80 border-b border-white/10 pb-2">账号安全</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="当前管理密码"
                      value={passwordForm.old}
                      onChange={e => setPasswordForm({ ...passwordForm, old: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                  </div>
                  <div className="h-px bg-white/5 my-2" />
                  <input
                    type="password"
                    placeholder="新管理密码"
                    value={passwordForm.new}
                    onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                  <input
                    type="password"
                    placeholder="确认新密码"
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-all font-bold"
                >
                  确认修改密码
                </button>
              </form>
            </section>

            {/* Data Sync */}
            <section className="space-y-6 flex flex-col gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/80 border-b border-white/10 pb-2">本地数据导入/导出</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      exportData();
                      toast.success('已导出配置');
                    }}
                    className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-xl hover:bg-white/20 transition-all font-medium"
                  >
                    导出配置 (JSON)
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept=".json"
                      id="import-data"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const success = importData(event.target?.result as string);
                          if (success) {
                            toast.success('配置导入成功！');
                          } else {
                            toast.error('导入失败，JSON 格式不正确');
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = ''; // Reset
                      }}
                    />
                    <label
                      htmlFor="import-data"
                      className="block w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl hover:bg-white/20 transition-all font-medium text-center cursor-pointer"
                    >
                      导入配置 (JSON)
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white/80 shrink-0">GitHub 仓库云同步</h3>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      githubSync: {
                        ...(settings.githubSync || { token: '', repo: '', branch: 'main', path: 'public/data.json' }),
                        enabled: !settings.githubSync?.enabled
                      }
                    })}
                    className={`shrink-0 w-12 h-6 rounded-full transition-all relative ${settings.githubSync?.enabled ? 'bg-white' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.githubSync?.enabled ? 'right-1 bg-black' : 'left-1 bg-white/40'}`} />
                  </button>
                </div>
                <p className="text-white/40 text-sm">
                  配置 GitHub 令牌后，可直接在网页后台推拉本应用数据，不再需要手动提交 JSON 及重启。
                </p>

                {settings.githubSync?.enabled && (
                  <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 mt-2">
                    <div className="space-y-1">
                      <label className="text-xs text-white/40 ml-1">GitHub Personal Access Token (需有 repo 权限)</label>
                      <input
                        type="password"
                        value={settings.githubSync.token}
                        onChange={e => setSettings({ ...settings, githubSync: { ...settings.githubSync!, token: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                        placeholder="ghp_xxxxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/40 ml-1">仓库名称 (格式: User/Repo)</label>
                      <input
                        type="text"
                        value={settings.githubSync.repo}
                        onChange={e => setSettings({ ...settings, githubSync: { ...settings.githubSync!, repo: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                        placeholder="username/website-repo-name"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="space-y-1 flex-1">
                        <label className="text-xs text-white/40 ml-1">分支 (默认 main)</label>
                        <input
                          type="text"
                          value={settings.githubSync.branch}
                          onChange={e => setSettings({ ...settings, githubSync: { ...settings.githubSync!, branch: e.target.value } })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <label className="text-xs text-white/40 ml-1">保存路径 (如 public/data.json)</label>
                        <input
                          type="text"
                          value={settings.githubSync.path}
                          onChange={e => setSettings({ ...settings, githubSync: { ...settings.githubSync!, path: e.target.value } })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                      </div>
                    </div>
                    
                    <div className="flex pt-2">
                      <button
                        onClick={async () => {
                          setIsSyncing(true);
                          const toastId = toast.loading('正在推送到 GitHub...');
                          const res = await syncToGithub();
                          setIsSyncing(false);
                          if (res.success) toast.success(res.message, { id: toastId });
                          else toast.error(res.message, { id: toastId });
                        }}
                        disabled={isSyncing || isPulling}
                        className="flex-1 bg-white text-black py-3 rounded-xl disabled:opacity-50 hover:bg-white/90 transition-all font-bold"
                      >
                        {isSyncing ? '推送中...' : '将当前配置推送到 GitHub'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-red-400 border-b border-red-400/10 pb-2">危险区域</h3>
              <button
                onClick={() => {
                  if (confirm('确定要恢复出厂设置吗？所有自定义数据将丢失。')) {
                    resetToDefault();
                    toast.success('已恢复默认状态');
                  }
                }}
                className="w-full border border-red-400/20 text-red-400 py-3 rounded-xl hover:bg-red-400/10 transition-all font-medium"
              >
                重置系统所有配置
              </button>
            </section>
          </div>
        )}
      </div>

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl md:text-2xl font-bold text-white">编辑链接</h3>
              <button onClick={() => setEditingLink(null)} className="text-white/40 hover:text-white"><X /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white/40 ml-1">链接标题</label>
                <input
                  type="text"
                  value={linkForm.title}
                  onChange={e => setLinkForm({ ...linkForm, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  placeholder="名称"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40 ml-1">URL 路径</label>
                <input
                  type="text"
                  value={linkForm.url}
                  onChange={e => setLinkForm({ ...linkForm, url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  placeholder="URL"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40 ml-1">自定义图标</label>
                <input
                  type="text"
                  value={linkForm.icon}
                  onChange={e => setLinkForm({ ...linkForm, icon: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  placeholder="图标 (填网站链接则自动抓取网站图标)"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40 ml-1">所属分类</label>
                <select
                  value={linkForm.categoryId}
                  onChange={e => setLinkForm({ ...linkForm, categoryId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
               <button
                onClick={() => setEditingLink(null)}
                className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold"
              >
                取消
              </button>
              <button
                onClick={() => handleUpdateLink(editingLink)}
                className="flex-[2] bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Save size={20} /> 完成编辑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
