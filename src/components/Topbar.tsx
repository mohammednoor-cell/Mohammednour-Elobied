import React, { useState, useEffect } from 'react';
import { WorkspaceView, Language, Project } from '../types';
import { getTranslation } from '../utils/i18n';
import { NavigatorBar } from './NavigatorBar';
import { 
  Plus, 
  Sparkles, 
  Search, 
  Layers, 
  ShieldAlert, 
  Check, 
  Globe, 
  Zap, 
  Upload, 
  Menu, 
  Bell, 
  Palette, 
  Download, 
  Clock,
  MessageSquare,
  LogIn,
  LogOut,
  User as UserIcon,
  Moon,
  Sun
} from 'lucide-react';
import { User } from 'firebase/auth';

interface TopbarProps {
  currentView: WorkspaceView;
  activeCount: number;
  highPriorityCount: number;
  onOpenNewProject: () => void;
  onToggleAi: () => void;
  isAiOpen: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenQuickActions: () => void;
  onOpenMobileMenu?: () => void;
  onOpenReminders?: () => void;
  activeRemindersCount?: number;
  onOpenThemes?: () => void;
  isDark?: boolean;
  onToggleDark?: () => void;
  onOpenExport?: () => void;
  // Firebase Auth
  currentUser?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  // Navigator props
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void;
  onGoForward?: () => void;
  onSelectView?: (view: WorkspaceView) => void;
  selectedProject?: Project | null;
  onClearSelectedProject?: () => void;
  // WhatsApp props
  onOpenWhatsApp?: () => void;
  hasWhatsAppConfigured?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  activeCount,
  highPriorityCount,
  onOpenNewProject,
  onToggleAi,
  isAiOpen,
  searchQuery,
  onSearchChange,
  lang,
  onToggleLang,
  onOpenQuickActions,
  onOpenMobileMenu,
  onOpenReminders,
  activeRemindersCount = 0,
  onOpenThemes,
  isDark = true,
  onToggleDark,
  onOpenExport,
  currentUser,
  onSignIn,
  onSignOut,
  canGoBack = false,
  canGoForward = false,
  onGoBack = () => {},
  onGoForward = () => {},
  onSelectView = () => {},
  selectedProject,
  onClearSelectedProject,
  onOpenWhatsApp,
  hasWhatsAppConfigured,
}) => {
  const t = getTranslation(lang);
  const [liveTime, setLiveTime] = useState('');

  // Live ticking clock (Saudi Arabia Time AST UTC+3)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        timeZone: 'Asia/Riyadh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setLiveTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <header id="app-topbar" className="h-14 border-b border-[#ecece8] dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between sticky top-0 z-20 shrink-0 select-none gap-2">
      {/* Left: Mobile Hamburger + Brand + Navigator Bar (Back/Forward/Breadcrumb/Jump) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand identity for smaller screens */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-bold tracking-tight">
          <span className="text-zinc-900 dark:text-white font-extrabold">{t.brandName}</span>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
        </div>

        {/* Integrated Navigator Bar: Back, Forward, Quick Jump, Breadcrumbs */}
        <NavigatorBar
          currentView={currentView}
          onSelectView={onSelectView}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onGoBack={onGoBack}
          onGoForward={onGoForward}
          selectedProject={selectedProject}
          onClearSelectedProject={onClearSelectedProject}
          lang={lang}
        />
      </div>

      {/* Live Saudi Arabia Time Clock Ticker */}
      <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-zinc-400 text-[10px]">Riyadh AST</span>
        <span className="text-zinc-900 dark:text-white">{liveTime}</span>
      </div>

      {/* Center Search / Filter */}
      <div className="hidden md:flex items-center gap-2 max-w-xs lg:max-w-sm w-full mx-2">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="topbar-search-input"
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#f6f6f4] dark:bg-zinc-800/70 hover:bg-[#f1f1ee] dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 pl-8 pr-3 py-1.5 rounded-md border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-600 bg-zinc-200/80 rounded-full w-3.5 h-3.5 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* WhatsApp Dispatcher Button */}
        {onOpenWhatsApp && (
          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs min-h-[36px]"
            title={lang === 'ar' ? 'تحديثات الواتساب الفورية' : 'Instant WhatsApp Alerts & Updates'}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xl:inline text-[11px] font-bold">WhatsApp</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>
        )}

        {/* Task Reminders Bell */}
        {onOpenReminders && (
          <button
            onClick={onOpenReminders}
            className="relative p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs min-h-[36px]"
            title={lang === 'ar' ? 'تذكيرات وتنبيهات المهام' : 'Task Reminders & Priority Alarms'}
          >
            <Bell className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
            {activeRemindersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {activeRemindersCount}
              </span>
            )}
          </button>
        )}

        {/* Theme Palette Switcher */}
        {onOpenThemes && (
          <button
            onClick={onOpenThemes}
            className="p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs min-h-[36px]"
            title={lang === 'ar' ? 'أنماط وثيمات الألوان' : 'Color Themes'}
          >
            <Palette className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          </button>
        )}

        {/* Quick Dark / Light Toggle */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            className="p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs min-h-[36px]"
            title={isDark ? (lang === 'ar' ? 'التحويل للوضع النهاري' : 'Switch to Light Mode') : (lang === 'ar' ? 'التحويل للوضع الليلي' : 'Switch to Dark Mode')}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        )}

        {/* Universal Export */}
        {onOpenExport && (
          <button
            onClick={onOpenExport}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors shadow-2xs min-h-[36px]"
            title="Export to Excel, CSV, PDF, Markdown"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px]">{lang === 'ar' ? 'تصدير' : 'Export'}</span>
          </button>
        )}

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors shadow-2xs min-h-[36px]"
          title="Toggle Language / تبديل اللغة"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[11px] font-bold">{t.languageToggle}</span>
        </button>

        {/* AI Assistant Button */}
        <button
          id="topbar-ai-btn"
          onClick={onToggleAi}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[36px] ${
            isAiOpen 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 shadow-2xs'
          }`}
        >
          <span className="font-bold text-[11px]">✦</span>
          <span className="hidden md:inline">{t.aiCopilot}</span>
        </button>

        {/* New Project Button */}
        <button
          id="topbar-new-project-btn"
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white transition-colors shadow-xs min-h-[36px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.newProject}</span>
        </button>

        {/* Firebase Authentication Status */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-1 border-l border-zinc-200 dark:border-zinc-700">
            <div 
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 max-w-[130px] sm:max-w-[170px]"
              title={`Authenticated as ${currentUser.email || currentUser.displayName}`}
            >
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="avatar" 
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full" 
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {(currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="truncate">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Sign out of Firebase"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          onSignIn && (
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-all min-h-[36px]"
              title="Sign in with Google to sync Firestore"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Google Sign In</span>
            </button>
          )
        )}
      </div>
    </header>
  );
};
