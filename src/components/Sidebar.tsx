import React from 'react';
import { 
  Home,
  LayoutDashboard, 
  FolderKanban, 
  Columns3, 
  FileText, 
  Sparkles, 
  Plus, 
  Download, 
  Upload, 
  Briefcase,
  Layers,
  ChevronRight,
  BarChart3,
  Paperclip,
  Share2,
  Globe,
  Bell,
  Palette,
  X,
  Clock
} from 'lucide-react';
import { WorkspaceView, Language } from '../types';
import { getTranslation } from '../utils/i18n';

interface SidebarProps {
  currentView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  isAiOpen: boolean;
  onToggleAi: () => void;
  onOpenNewProject: () => void;
  onOpenExportModal: () => void;
  onImportJson: (file: File) => void;
  onOpenReminders: () => void;
  onOpenThemes: () => void;
  projectCount: number;
  activeCount: number;
  fileCount: number;
  activeRemindersCount?: number;
  lang: Language;
  onToggleLang: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isAiOpen,
  onToggleAi,
  onOpenNewProject,
  onOpenExportModal,
  onImportJson,
  onOpenReminders,
  onOpenThemes,
  projectCount,
  activeCount,
  fileCount,
  activeRemindersCount = 0,
  lang,
  onToggleLang,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const t = getTranslation(lang);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  interface NavItem {
    id: WorkspaceView;
    label: string;
    icon: any;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard, badge: activeCount ? `${activeCount}` : undefined },
    { id: 'projects', label: t.navProjects, icon: FolderKanban, badge: `${projectCount}` },
    { id: 'board', label: t.navBoard, icon: Columns3 },
    { id: 'analytics', label: t.navAnalytics, icon: BarChart3, badge: 'Power BI' },
    { id: 'pages', label: t.navDocs, icon: FileText, badge: '3' },
    { id: 'files', label: t.navFiles, icon: Paperclip, badge: `${fileCount}` },
    { id: 'integrations', label: t.navIntegrations, icon: Share2 },
  ];

  const handleNavClick = (viewId: WorkspaceView) => {
    onSelectView(viewId);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <aside 
      id="app-sidebar" 
      className="w-64 bg-[#fbfbfa] dark:bg-zinc-900 border-r border-[#ecece8] dark:border-zinc-800 flex flex-col justify-between shrink-0 select-none text-[13px] font-sans h-full overflow-y-auto"
    >
      {/* Brand Header */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#f0f0ed] dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
              MN
            </div>
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white leading-tight flex items-center gap-1.5 text-[13px]">
                {t.brandName}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
                {t.brandSub}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform" title="System Active" />
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Utilities Row */}
        <div className="grid grid-cols-2 gap-1.5 px-1">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center justify-between px-2 py-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px]">{lang === 'en' ? 'العربية' : 'EN'}</span>
            </div>
          </button>

          {/* Theme Palette Switcher */}
          <button
            onClick={onOpenThemes}
            className="flex items-center justify-between px-2 py-1.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors shadow-2xs"
            title="Themes & Colors"
          >
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px]">{lang === 'ar' ? 'الثيمات' : 'Themes'}</span>
            </div>
          </button>
        </div>

        {/* Task Reminders Navigation Button */}
        <div className="px-1">
          <button
            onClick={() => {
              onOpenReminders();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 hover:bg-amber-100/60 text-xs font-semibold transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{lang === 'ar' ? 'تذكيرات وتنبيهات المهام' : 'Task Reminders'}</span>
            </div>
            {activeRemindersCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold font-mono">
                {activeRemindersCount}
              </span>
            )}
          </button>
        </div>

        <div className="px-2 pt-1 pb-0.5 flex items-center justify-between text-[10.5px] font-semibold tracking-wider text-zinc-400 uppercase">
          <span>{lang === 'ar' ? 'التنقل الرئيسي' : 'Navigation'}</span>
          <span className="text-zinc-400 text-[10px] font-mono">{activeCount} {lang === 'ar' ? 'نشط' : 'active'}</span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors min-h-[38px] ${
                  isActive 
                    ? 'bg-[#ecece8] dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-2xs' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-[#f2f2ef] dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                    isActive ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Assistant Special Nav Button */}
        <div className="pt-2">
          <button
            id="nav-ai-toggle"
            onClick={() => {
              onToggleAi();
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left transition-all border min-h-[42px] ${
              isAiOpen
                ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 font-semibold shadow-2xs'
                : 'bg-white dark:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                ✦
              </div>
              <span className="text-[12.5px] font-medium">{t.aiCopilot}</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
              isAiOpen ? 'bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-300' : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
            }`}>
              Gemini 3.8
            </span>
          </button>
        </div>
      </div>

      {/* Sidebar Footer & Utilities */}
      <div className="p-3 border-t border-[#ecece8] dark:border-zinc-800 bg-[#f7f7f4] dark:bg-zinc-900/90 space-y-1">
        <button
          id="btn-sidebar-new-project"
          onClick={() => {
            onOpenNewProject();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-[#ecece8] dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium text-left min-h-[40px]"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-500" />
          <span>{t.newProject}</span>
        </button>

        <div className="grid grid-cols-2 gap-1 pt-1">
          <button
            id="btn-export-json"
            onClick={() => {
              onOpenExportModal();
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] rounded text-zinc-600 dark:text-zinc-300 hover:bg-[#ecece8] dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors border border-zinc-200/60 dark:border-zinc-700 min-h-[36px]"
            title="Export in any format (Excel, CSV, PDF, Markdown)"
          >
            <Download className="w-3 h-3 text-zinc-400" />
            <span>{lang === 'ar' ? 'تصدير شامل' : 'Export'}</span>
          </button>

          <label 
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] rounded text-zinc-600 dark:text-zinc-300 hover:bg-[#ecece8] dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors border border-zinc-200/60 dark:border-zinc-700 cursor-pointer min-h-[36px]"
            title="Restore workspace data"
          >
            <Upload className="w-3 h-3 text-zinc-400" />
            <span>{lang === 'ar' ? 'استيراد' : 'Import'}</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className="pt-2 text-[10px] text-zinc-400 text-center flex items-center justify-center gap-1">
          <span>Saudi Experiential Command</span>
          <span>•</span>
          <span>Tartibat</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop & iPad Landscape Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        {sidebarContent}
      </div>

      {/* Mobile & iPad Portrait Slide-over Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile} 
          />
          {/* Slide-over Drawer */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

