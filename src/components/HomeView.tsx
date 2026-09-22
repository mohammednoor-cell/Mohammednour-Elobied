import React, { useState, useMemo, useEffect } from 'react';
import { 
  Project, 
  WorkspaceView, 
  Language, 
  ProjectStatus,
  DeliverableItem 
} from '../types';
import { getTranslation } from '../utils/i18n';
import { 
  Sparkles, 
  FolderKanban, 
  Columns3, 
  BarChart3, 
  FileText, 
  Paperclip, 
  Share2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  ExternalLink, 
  Check, 
  ChevronRight, 
  AlertCircle, 
  FileSpreadsheet, 
  Layers, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  Zap, 
  Search,
  ShieldCheck,
  Send
} from 'lucide-react';

interface HomeViewProps {
  projects: Project[];
  notes?: { id: string; title: string; content: string; createdAt: string }[];
  onSaveNote?: (text: string, title?: string) => void;
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onOpenNewProject: () => void;
  onSwitchView: (view: WorkspaceView) => void;
  onAskAiPrompt: (prompt: string) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onToggleTaskComplete: (projectId: string, deliverableId: string) => void;
  onOpenReminders?: () => void;
  onOpenThemes?: () => void;
  onOpenFileUpload?: () => void;
  onToggleAi?: () => void;
  onOpenWhatsApp?: () => void;
  lang: Language;
}

export const HomeView: React.FC<HomeViewProps> = ({
  projects,
  notes = [],
  onSaveNote,
  onSelectProject,
  onEditProject,
  onOpenNewProject,
  onSwitchView,
  onAskAiPrompt,
  onUpdateStatus,
  onToggleTaskComplete,
  onOpenReminders,
  onOpenThemes,
  onOpenFileUpload,
  onToggleAi,
  onOpenWhatsApp,
  lang,
}) => {
  const t = getTranslation(lang);
  const isRtl = lang === 'ar';

  // Live Clock & Date for Riyadh AST
  const [currentDateTime, setCurrentDateTime] = useState({ time: '', date: '', greeting: '' });
  const [quickNoteText, setQuickNoteText] = useState('');
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      let greeting = 'Good day';
      if (hour >= 5 && hour < 12) {
        greeting = lang === 'ar' ? 'صباح الخير والإنتاجية' : 'Good morning';
      } else if (hour >= 12 && hour < 17) {
        greeting = lang === 'ar' ? 'مساء الخير والريادة' : 'Good afternoon';
      } else {
        greeting = lang === 'ar' ? 'مساء الخير' : 'Good evening';
      }

      const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        timeZone: 'Asia/Riyadh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        timeZone: 'Asia/Riyadh',
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      setCurrentDateTime({ time: timeStr, date: dateStr, greeting });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // Operational Calculations
  const activeProjects = useMemo(() => projects.filter(p => !p.archived && p.status !== 'Completed'), [projects]);
  const completedProjects = useMemo(() => projects.filter(p => p.status === 'Completed'), [projects]);
  const highPriorityProjects = useMemo(() => activeProjects.filter(p => p.priority === 'High'), [activeProjects]);

  // Aggregate Deliverables
  const { allTasks, pendingTasks, completedTasks, tasksWithDueToday } = useMemo(() => {
    const all: { task: DeliverableItem; project: Project }[] = [];
    const pending: { task: DeliverableItem; project: Project }[] = [];
    const completed: { task: DeliverableItem; project: Project }[] = [];
    const today = new Date().toISOString().split('T')[0];
    const dueToday: { task: DeliverableItem; project: Project }[] = [];

    projects.forEach(p => {
      if (p.archived) return;
      (p.deliverables || []).forEach(d => {
        const item = { task: d, project: p };
        all.push(item);
        if (d.completed) {
          completed.push(item);
        } else {
          pending.push(item);
          if (d.dueDate === today || p.date === today) {
            dueToday.push(item);
          }
        }
      });
    });

    return {
      allTasks: all,
      pendingTasks: pending,
      completedTasks: completed,
      tasksWithDueToday: dueToday
    };
  }, [projects]);

  const completionRate = useMemo(() => {
    if (allTasks.length === 0) return 100;
    return Math.round((completedTasks.length / allTasks.length) * 100);
  }, [allTasks, completedTasks]);

  // Priority Ranked Deliverables for Quick Agenda
  const urgentAgenda = useMemo(() => {
    return pendingTasks
      .sort((a, b) => {
        // High priority first
        if (a.project.priority === 'High' && b.project.priority !== 'High') return -1;
        if (b.project.priority === 'High' && a.project.priority !== 'High') return 1;
        // Then by due dates
        if (a.task.dueDate && b.task.dueDate) {
          return a.task.dueDate.localeCompare(b.task.dueDate);
        }
        if (a.task.dueDate) return -1;
        if (b.task.dueDate) return 1;
        return 0;
      })
      .slice(0, 5);
  }, [pendingTasks]);

  // Headline Projects to highlight
  const spotlightProjects = useMemo(() => {
    return activeProjects.slice(0, 4);
  }, [activeProjects]);

  const handleQuickNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim()) return;
    if (onSaveNote) {
      onSaveNote(quickNoteText.trim(), quickNoteTitle.trim() || undefined);
      setQuickNoteText('');
      setQuickNoteTitle('');
      setIsNoteSaved(true);
      setTimeout(() => setIsNoteSaved(false), 2500);
    }
  };

  const aiPrompts = [
    {
      label: lang === 'ar' ? 'ملخص العمليات التنفيذية لليوم' : "Today's Executive Operations Brief",
      prompt: "Provide a high-level executive briefing for Mohammed Noor on today's active pipeline, highlighting urgent deliverables, potential project bottlenecks, and immediate action items."
    },
    {
      label: lang === 'ar' ? 'تحليل المشاريع المعرضة للمخاطر' : "Identify Delivery Risk Bottlenecks",
      prompt: "Review all active projects, deliverables, and deadlines. List the top 3 projects most at risk of delay with concrete mitigation steps."
    },
    {
      label: lang === 'ar' ? 'صياغة رسالة واتساب للعملاء' : "Draft VIP Client WhatsApp Update",
      prompt: "Draft a concise, professional WhatsApp status update for a high-priority VIP event client outlining progress, next deliverables, and confirmation of schedule."
    },
    {
      label: lang === 'ar' ? 'توليد تقرير باور بي آي' : "Generate Power BI Strategic Insight",
      prompt: "Analyze budget allocation and completion velocity across experiential, tech, and VIP protocol sectors. Suggest where operational resources should be focused."
    }
  ];

  return (
    <div id="home-view-container" className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* =============================================================== */}
      {/* 1. EXECUTIVE COMMAND BANNER */}
      {/* =============================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-black text-white p-6 sm:p-8 border border-zinc-800 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{lang === 'ar' ? 'المقر القيادي • الرياض' : 'Executive Command • Riyadh AST'}</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {currentDateTime.date} • {currentDateTime.time}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {currentDateTime.greeting}, <span className="text-emerald-400">Mohammed Noor</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {lang === 'ar'
                ? 'مرحباً بك في مساحة القيادة التنفيذية لوكالة ترتيبات (Tartibat). متابعة فورية للمشاريع الكبرى، الفعاليات الاستثنائية، تسليمات البروتوكول والتقنيات التفاعلية.'
                : 'Welcome to your executive operational cockpit at Tartibat. Real-time oversight for flagship Saudi experiences, VIP protocol, and high-velocity deliverable pipelines.'}
            </p>
          </div>

          {/* Quick Command Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? '+ مشروع / مهمة جديدة' : '+ New Lead / Project'}</span>
            </button>

            {onToggleAi && (
              <button
                onClick={onToggleAi}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition-all shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ar' ? 'المساعد التنفيذي AI' : 'AI Copilot'}</span>
              </button>
            )}

            {onOpenWhatsApp && (
              <button
                onClick={onOpenWhatsApp}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-xs border border-emerald-800 transition-all"
                title="Send WhatsApp updates"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Pipeline Status Strip */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-0.5">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              {lang === 'ar' ? 'المشاريع الجارية' : 'Active Pipeline'}
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center gap-2">
              <span>{activeProjects.length}</span>
              <span className="text-xs font-normal text-zinc-400 font-sans">
                {lang === 'ar' ? 'مشاريع نشطة' : 'in motion'}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              {lang === 'ar' ? 'عالية الأولوية' : 'High Priority'}
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 flex items-center gap-2">
              <span>{highPriorityProjects.length}</span>
              <span className="text-xs font-normal text-rose-300/70 font-sans">
                {lang === 'ar' ? 'عاجلة' : 'urgent'}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              {lang === 'ar' ? 'جاهزية التسليمات' : 'Delivery Velocity'}
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 flex items-center gap-2">
              <span>{completionRate}%</span>
              <span className="text-xs font-normal text-emerald-300/70 font-sans">
                {completedTasks.length}/{allTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              {lang === 'ar' ? 'المشاريع المنجزة' : 'Delivered Works'}
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-sky-400 flex items-center gap-2">
              <span>{completedProjects.length}</span>
              <span className="text-xs font-normal text-sky-300/70 font-sans">
                {lang === 'ar' ? 'مكتملة' : 'completed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* 2. EXECUTIVE SHORTCUT HUB (CORE WORKSPACE SECTORS) */}
      {/* =============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onSwitchView('dashboard')}
          className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all text-left flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center justify-between">
              <span>{lang === 'ar' ? 'لوحة العمليات' : 'Operations'}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {lang === 'ar' ? 'التحليلات ومسار المهام' : 'Analytics & pipeline'}
            </div>
          </div>
        </button>

        <button
          onClick={() => onSwitchView('projects')}
          className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all text-left flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center justify-between">
              <span>{lang === 'ar' ? 'قاعدة المشاريع' : 'Projects DB'}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {projects.length} {lang === 'ar' ? 'مشروع مسجل' : 'total leads'}
            </div>
          </div>
        </button>

        <button
          onClick={() => onSwitchView('board')}
          className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all text-left flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
            <Columns3 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center justify-between">
              <span>{lang === 'ar' ? 'لوحة كانبان' : 'Kanban Board'}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-purple-500 transition-colors" />
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {lang === 'ar' ? 'المراحل وسير العمل' : 'Workflow phases'}
            </div>
          </div>
        </button>

        <button
          onClick={() => onSwitchView('analytics')}
          className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all text-left flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center justify-between">
              <span>{lang === 'ar' ? 'إنفوجرافيك BI' : 'Power BI'}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {lang === 'ar' ? 'الميزانيات والتقارير' : 'Sectors & budgets'}
            </div>
          </div>
        </button>

        <button
          onClick={() => onSwitchView('files')}
          className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all text-left flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
            <Paperclip className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center justify-between">
              <span>{lang === 'ar' ? 'الملفات والمرفقات' : 'Files & Vault'}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-teal-500 transition-colors" />
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {lang === 'ar' ? 'PPTX, عروض, جداول' : 'Assets & presentations'}
            </div>
          </div>
        </button>

        <button
          onClick={() => onSwitchView('integrations')}
          className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all text-left flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center justify-between">
              <span>{lang === 'ar' ? 'جوجل والأدوات' : 'Google & AI'}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {lang === 'ar' ? 'Slides, Sheets, Drive' : 'Live spreadsheets'}
            </div>
          </div>
        </button>
      </div>

      {/* =============================================================== */}
      {/* 3. TWO-COLUMN EXECUTIVE WORKSPACE: TODAY'S FOCUS & RECENT HEADLINES */}
      {/* =============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: TODAY'S OPERATIONAL AGENDA (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {lang === 'ar' ? 'أجندة الأولويات العاجلة' : "Today's Executive Priorities"}
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {lang === 'ar' ? 'المهام والتسليمات المرتبة تلقائياً وفق الاستحقاق والأهمية' : 'Key deliverables dynamically ordered by due date & priority'}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
                {pendingTasks.length} {lang === 'ar' ? 'مهمة متبقية' : 'pending'}
              </span>
            </div>

            {urgentAgenda.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {lang === 'ar' ? 'جميع التسليمات الرئيسية مكتملة!' : 'All executive deliverables are on track!'}
                </div>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                  {lang === 'ar' 
                    ? 'لا توجد مهام متأخرة أو حرجة في الوقت الحالي. يمكنك إنشاء مهام جديدة أو استعراض لوحة كانبان.'
                    : 'No pending urgent deliverables. You can create a new project or explore the full Kanban pipeline.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentAgenda.map(({ task, project }) => (
                  <div
                    key={`${project.id}-${task.id}`}
                    className="p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleTaskComplete(project.id, task.id)}
                        className="mt-0.5 w-4 h-4 rounded border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-transparent hover:text-emerald-600 flex items-center justify-center shrink-0 transition-colors"
                        title="Mark deliverable complete"
                      >
                        <Check className="w-3 h-3" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                            {task.text}
                          </span>
                          {project.priority === 'High' && (
                            <span className="shrink-0 text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              HIGH
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                            {project.name}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{project.client}</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-zinc-600 dark:text-zinc-400">{task.dueDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProject(project)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-700 transition-colors shrink-0"
                      title="View Project Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="pt-2 flex justify-between items-center text-xs">
                  <button
                    onClick={() => onSwitchView('dashboard')}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>{lang === 'ar' ? 'عرض كافة المهام في لوحة العمليات' : 'View all tasks in Smart Priority Engine'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {onOpenReminders && (
                    <button
                      onClick={onOpenReminders}
                      className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 font-medium"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'ضبط التنبيهات' : 'Alarms'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI OPERATIONS PROMPTS QUICK-LAUNCHER */}
          <div className="bg-gradient-to-br from-blue-900/10 via-indigo-900/10 to-purple-900/10 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200/60 dark:border-blue-900/50 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                    {lang === 'ar' ? 'التحليلات الذكية التلقائية (AI Operations)' : 'AI Strategic Operations Copilot'}
                  </h3>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400">
                    {lang === 'ar' ? 'نقرة واحدة لتوليد ملخصات تنفيذية ورسائل متابعة فورية' : 'One-click executive analysis & automated status drafts'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold">
                Gemini 3.8
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aiPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onAskAiPrompt(p.prompt)}
                  className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-all text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-between group shadow-2xs"
                >
                  <span className="line-clamp-1">{p.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 transition-colors shrink-0 ml-1.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE HEADLINE PROJECTS & SCRATCHPAD (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Projects Spotlight Cards */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {lang === 'ar' ? 'المشاريع الاستراتيجية النشطة' : 'Active Projects Spotlight'}
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {lang === 'ar' ? 'أبرز الحسابات والفعاليات الجارية' : 'Headline accounts & current deliverables'}
                </p>
              </div>

              <button
                onClick={() => onSwitchView('projects')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{lang === 'ar' ? 'عرض الكل' : 'View all'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {spotlightProjects.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <Briefcase className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
                <p className="text-xs text-zinc-500 font-medium">
                  {lang === 'ar' ? 'لا توجد مشاريع نشطة حالياً' : 'No active projects in pipeline'}
                </p>
                <button
                  onClick={onOpenNewProject}
                  className="mt-2.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold"
                >
                  + {lang === 'ar' ? 'إنشاء مشروع' : 'Create Project'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {spotlightProjects.map((p) => {
                  const delivDone = (p.deliverables || []).filter(d => d.completed).length;
                  const delivTotal = (p.deliverables || []).length;
                  const percent = delivTotal > 0 ? Math.round((delivDone / delivTotal) * 100) : 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProject(p)}
                      className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {p.name}
                          </h4>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{p.client}</span>
                            {p.category && (
                              <>
                                <span>•</span>
                                <span>{p.category}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          p.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          p.status === 'Review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10.5px] font-mono">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {delivDone}/{delivTotal} {lang === 'ar' ? 'منجز' : 'deliverables'}
                          </span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">{percent}%</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percent === 100 ? 'bg-emerald-500' :
                              percent >= 50 ? 'bg-blue-500' :
                              'bg-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Live Sheet or Notes preview */}
                      {p.sheetUrl && (
                        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                          <a
                            href={p.sheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-0.5 rounded font-semibold transition-colors"
                          >
                            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                            <span>{lang === 'ar' ? 'فتح جدول البيانات التفاعلي ↗' : 'Open Live Google Sheet ↗'}</span>
                          </a>
                          <span className="text-[10px] text-zinc-400 font-mono">{p.date || ''}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Executive Scratchpad / Notes */}
          {onSaveNote && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                      {lang === 'ar' ? 'مذكرة سريعة / فكرة تنفيذية' : 'Executive Scratchpad'}
                    </h3>
                    <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'حفظ سريع للأفكار وملاحظات الاجتماعات' : 'Instant notes & meeting takeaways'}
                    </p>
                  </div>
                </div>

                {isNoteSaved && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'تم الحفظ!' : 'Saved!'}</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleQuickNoteSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'عنوان الملاحظة (اختياري)...' : 'Note title (e.g. VIP Protocol review)...'}
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
                />
                <textarea
                  rows={2}
                  placeholder={lang === 'ar' ? 'اكتب ملاحظتك التنفيذية هنا...' : 'Type executive thoughts or action items...'}
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!quickNoteText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 disabled:opacity-40 transition-opacity"
                  >
                    <Send className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'حفظ في الملاحظات' : 'Save Note'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
