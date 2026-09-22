import React from 'react';
import { WorkspaceView, Language } from '../types';
import { 
  Home,
  LayoutDashboard, 
  FolderKanban, 
  Columns3, 
  BarChart3, 
  Menu, 
  Bell,
  Palette
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';

interface MobileBottomNavProps {
  currentView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onOpenMobileMenu: () => void;
  onOpenReminders: () => void;
  activeRemindersCount: number;
  lang: Language;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenMobileMenu,
  onOpenReminders,
  activeRemindersCount,
  lang,
}) => {
  const t = getTranslation(lang);

  const tabs: { id: WorkspaceView; label: string; icon: any }[] = [
    { id: 'home', label: lang === 'ar' ? 'الرئيسية' : 'Home', icon: Home },
    { id: 'dashboard', label: lang === 'ar' ? 'العمليات' : 'Ops', icon: LayoutDashboard },
    { id: 'projects', label: lang === 'ar' ? 'المشاريع' : 'Projects', icon: FolderKanban },
    { id: 'board', label: lang === 'ar' ? 'الكانبان' : 'Board', icon: Columns3 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around shadow-lg select-none pb-[env(safe-area-inset-bottom,0.5rem)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectView(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] py-1 px-2 rounded-xl transition-all ${
              isActive 
                ? 'text-zinc-900 dark:text-white font-bold bg-zinc-100 dark:bg-zinc-800' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[60px]">{tab.label}</span>
          </button>
        );
      })}

      {/* Task Reminders quick icon with badge */}
      <button
        onClick={onOpenReminders}
        className="relative flex flex-col items-center justify-center min-w-[54px] min-h-[44px] py-1 px-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
      >
        <div className="relative">
          <Bell className="w-4 h-4" />
          {activeRemindersCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-amber-500 text-white rounded-full text-[8.5px] font-bold flex items-center justify-center animate-pulse">
              {activeRemindersCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[60px]">
          {lang === 'ar' ? 'تنبيهات' : 'Alarms'}
        </span>
      </button>

      {/* More / Menu Button */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center min-w-[54px] min-h-[44px] py-1 px-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
      >
        <Menu className="w-4 h-4" />
        <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[60px]">
          {lang === 'ar' ? 'المزيد' : 'Menu'}
        </span>
      </button>
    </div>
  );
};
