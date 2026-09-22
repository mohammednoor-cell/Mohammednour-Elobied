import React, { useState, useRef, useEffect } from 'react';
import { WorkspaceView, Project, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  LayoutDashboard,
  Layers, 
  Kanban, 
  BarChart3, 
  FolderOpen, 
  FileText, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Command,
  ArrowRight
} from 'lucide-react';

interface NavigatorBarProps {
  currentView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  selectedProject?: Project | null;
  onClearSelectedProject?: () => void;
  lang: Language;
}

export const NavigatorBar: React.FC<NavigatorBarProps> = ({
  currentView,
  onSelectView,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  selectedProject,
  onClearSelectedProject,
  lang,
}) => {
  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(lang);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsJumpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewItems: { id: WorkspaceView; labelEn: string; labelAr: string; icon: React.ReactNode; descEn: string; descAr: string }[] = [
    {
      id: 'home',
      labelEn: 'Executive Home',
      labelAr: 'الرئيسية التنفيذية',
      icon: <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      descEn: 'Executive cockpit, today agenda & pipeline spotlight',
      descAr: 'المقر القيادي، أجندة اليوم وأبرز المشاريع'
    },
    {
      id: 'dashboard',
      labelEn: 'Operations Dashboard',
      labelAr: 'لوحة العمليات والمهام',
      icon: <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      descEn: 'Pipeline overview, metrics & urgent milestones',
      descAr: 'نظرة شاملة ومؤشرات أداء المشاريع'
    },
    {
      id: 'projects',
      labelEn: 'Projects Database',
      labelAr: 'قاعدة بيانات المشاريع',
      icon: <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      descEn: 'Full deliverables catalog & client accounts',
      descAr: 'جدول المشاريع والمهام التفصيلية'
    },
    {
      id: 'board',
      labelEn: 'Kanban Board',
      labelAr: 'لوحة كانبان',
      icon: <Kanban className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      descEn: 'Visual delivery stages & task pipeline',
      descAr: 'متابعة مراحل الإنتاج وسير العمل'
    },
    {
      id: 'analytics',
      labelEn: 'Power BI Infographics',
      labelAr: 'رسوم بيانية Power BI',
      icon: <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      descEn: 'Sector budgets, burnup & executive report builder',
      descAr: 'تحليلات الميزانيات وتوليد التقارير'
    },
    {
      id: 'files',
      labelEn: 'Files & Unlimited Storage',
      labelAr: 'الملفات والسعة اللامحدودة',
      icon: <FolderOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />,
      descEn: 'IndexedDB unlimited storage, batch upload & download',
      descAr: 'تخزين غير محدود وتنزيل الحزم'
    },
    {
      id: 'pages',
      labelEn: 'Playbooks & SOW Docs',
      labelAr: 'المستندات ونطاق العمل',
      icon: <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      descEn: 'Executive statements of work & operational guides',
      descAr: 'وثائق المشاريع والبروتوكولات'
    },
    {
      id: 'integrations',
      labelEn: 'Connected Google & ChatGPT',
      labelAr: 'أدوات جوجل وشات جي بي تي',
      icon: <ExternalLink className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      descEn: 'One-click launch for Slides, Sheets, Drive & AI',
      descAr: 'ربط مباشر مع مستندات جوجل ونماذج الذكاء'
    },
  ];

  const currentItem = viewItems.find(v => v.id === currentView) || viewItems[0];

  const handleSelectView = (view: WorkspaceView) => {
    if (selectedProject && onClearSelectedProject) {
      onClearSelectedProject();
    }
    onSelectView(view);
    setIsJumpOpen(false);
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 select-none" ref={dropdownRef}>
      {/* Back Button */}
      <button
        type="button"
        onClick={onGoBack}
        disabled={!canGoBack}
        aria-label="Go Back"
        className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${
          canGoBack
            ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-2xs cursor-pointer active:scale-95'
            : 'bg-zinc-100/60 dark:bg-zinc-800/30 border-transparent text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
        }`}
        title={lang === 'ar' ? 'الرجوع للصفحة السابقة (Alt + ←)' : 'Go Back (Alt + ←)'}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Forward Button */}
      <button
        type="button"
        onClick={onGoForward}
        disabled={!canGoForward}
        aria-label="Go Forward"
        className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${
          canGoForward
            ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-2xs cursor-pointer active:scale-95'
            : 'bg-zinc-100/60 dark:bg-zinc-800/30 border-transparent text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
        }`}
        title={lang === 'ar' ? 'التقدم للصفحة التالية (Alt + →)' : 'Go Forward (Alt + →)'}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Quick Jump & Breadcrumb Pill */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsJumpOpen(prev => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700 bg-zinc-50/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors shadow-2xs"
          title={lang === 'ar' ? 'التنقل السريع بين الصفحات' : 'Quick Page Navigator'}
        >
          <span className="shrink-0">{currentItem.icon}</span>
          <span className="truncate max-w-[120px] sm:max-w-[180px]">
            {lang === 'ar' ? currentItem.labelAr : currentItem.labelEn}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isJumpOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Navigator Dropdown Menu */}
        {isJumpOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 mb-1">
              <span>{lang === 'ar' ? 'الانتقال إلى' : 'Go To Workspace View'}</span>
              <span className="flex items-center gap-1 font-mono text-zinc-400">
                <Command className="w-3 h-3" /> Navigator
              </span>
            </div>

            <div className="space-y-1">
              {viewItems.map((item) => {
                const isActive = item.id === currentView;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectView(item.id)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-start transition-all ${
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">
                        {lang === 'ar' ? item.labelAr : item.labelEn}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {lang === 'ar' ? item.descAr : item.descEn}
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Breadcrumb Trail: if a project is selected */}
      {selectedProject && (
        <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 min-w-0">
          <span>/</span>
          <span 
            className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[160px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md"
            title={selectedProject.name}
          >
            {selectedProject.name}
          </span>
        </div>
      )}
    </div>
  );
};
