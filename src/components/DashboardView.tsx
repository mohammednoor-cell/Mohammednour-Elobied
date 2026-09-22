import React, { useState } from 'react';
import { Project, WorkspaceView, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  ChevronRight, 
  TrendingUp,
  Zap,
  Plus,
  FileText,
  Upload,
  BarChart3,
  ExternalLink,
  Flame,
  Archive,
  RotateCcw,
  SlidersHorizontal,
  Check,
  FileSpreadsheet,
  Tag
} from 'lucide-react';
import { reRankPendingTasks, calculateProjectSmartPriority, RankedTaskItem } from '../utils/smartPriorityEngine';

interface DashboardViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onOpenNewProject: () => void;
  onSwitchView: (view: WorkspaceView) => void;
  onAskAiPrompt: (prompt: string) => void;
  onUpdateStatus: (projectId: string, status: Project['status']) => void;
  onToggleTaskComplete?: (projectId: string, taskId: string) => void;
  onArchiveProject?: (projectId: string) => void;
  onRestoreProject?: (projectId: string) => void;
  onClearAllData?: () => void;
  lang: Language;
  onOpenNewNote: () => void;
  onOpenFileUpload: () => void;
  onToggleAi: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  'Planning': '#71717a',      // zinc-500
  'In Progress': '#2563eb',   // blue-600
  'Review': '#d97706',        // amber-600
  'Completed': '#059669',     // emerald-600
  'On Hold': '#9333ea',       // purple-600
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onSelectProject,
  onEditProject,
  onOpenNewProject,
  onSwitchView,
  onAskAiPrompt,
  onUpdateStatus,
  onToggleTaskComplete,
  onArchiveProject,
  onRestoreProject,
  onClearAllData,
  lang,
  onOpenNewNote,
  onOpenFileUpload,
  onToggleAi,
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  // Active vs Archived split
  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

  const displayedProjects = activeTab === 'active' ? activeProjects : archivedProjects;

  const total = activeProjects.length;
  const completed = activeProjects.filter(p => p.status === 'Completed').length;
  const inProgress = activeProjects.filter(p => p.status === 'In Progress').length;
  const review = activeProjects.filter(p => p.status === 'Review').length;
  const planning = activeProjects.filter(p => p.status === 'Planning').length;
  const onHold = activeProjects.filter(p => p.status === 'On Hold').length;
  const highPriority = activeProjects.filter(p => p.priority === 'High' && p.status !== 'Completed').length;

  // Calculate deliverable rates
  let totalDeliverables = 0;
  let doneDeliverables = 0;
  activeProjects.forEach(p => {
    (p.deliverables || []).forEach(d => {
      totalDeliverables++;
      if (d.completed) doneDeliverables++;
    });
  });
  const deliverableRate = totalDeliverables > 0 ? Math.round((doneDeliverables / totalDeliverables) * 100) : 0;

  // 1. RECHARTS: Project Status Distribution Data
  const statusDistributionData = [
    { name: 'Planning', value: planning, color: STATUS_COLORS['Planning'] },
    { name: 'In Progress', value: inProgress, color: STATUS_COLORS['In Progress'] },
    { name: 'Review', value: review, color: STATUS_COLORS['Review'] },
    { name: 'Completed', value: completed, color: STATUS_COLORS['Completed'] },
    { name: 'On Hold', value: onHold, color: STATUS_COLORS['On Hold'] },
  ].filter(item => item.value > 0);

  // 2. RECHARTS: Upcoming Task Density & Urgency Horizon Data
  // Group all pending deliverables by timeframe & priority
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const densityBuckets = [
    { horizon: 'Overdue', high: 0, medium: 0, low: 0, total: 0 },
    { horizon: 'Today', high: 0, medium: 0, low: 0, total: 0 },
    { horizon: '1-3 Days', high: 0, medium: 0, low: 0, total: 0 },
    { horizon: '4-7 Days', high: 0, medium: 0, low: 0, total: 0 },
    { horizon: '8-14 Days', high: 0, medium: 0, low: 0, total: 0 },
    { horizon: 'Backlog', high: 0, medium: 0, low: 0, total: 0 },
  ];

  activeProjects.forEach(proj => {
    (proj.deliverables || []).forEach(task => {
      if (!task.completed) {
        const targetDateStr = task.dueDate || proj.date;
        const prioKey = proj.priority === 'High' ? 'high' : proj.priority === 'Medium' ? 'medium' : 'low';

        if (!targetDateStr) {
          densityBuckets[5][prioKey]++;
          densityBuckets[5].total++;
        } else {
          const d = new Date(targetDateStr);
          d.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            densityBuckets[0][prioKey]++;
            densityBuckets[0].total++;
          } else if (diffDays === 0) {
            densityBuckets[1][prioKey]++;
            densityBuckets[1].total++;
          } else if (diffDays <= 3) {
            densityBuckets[2][prioKey]++;
            densityBuckets[2].total++;
          } else if (diffDays <= 7) {
            densityBuckets[3][prioKey]++;
            densityBuckets[3].total++;
          } else if (diffDays <= 14) {
            densityBuckets[4][prioKey]++;
            densityBuckets[4].total++;
          } else {
            densityBuckets[5][prioKey]++;
            densityBuckets[5].total++;
          }
        }
      }
    });
  });

  // 3. Smart Priority Engine: Top re-ranked pending tasks
  const rankedTasks = reRankPendingTasks(activeProjects);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          <span>{t.brandSub}</span>
          <span>•</span>
          <span className="text-blue-600">{t.leadTitle}</span>
          <span>•</span>
          <span className="text-zinc-500">Firebase Synchronized</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {lang === 'ar' ? 'أهلاً بك، محمد نور.' : 'Executive Operations'}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {lang === 'ar' 
                ? 'لوحة القيادة التفاعلية مع محرك الأولوية الذكية والرسوم البيانية الحية للمشاريع والمهام.'
                : 'Interactive workspace dashboard with real-time distribution graphs, Smart Priority task engine, and project templates.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onAskAiPrompt("Analyze my active projects, calculate critical bottlenecks, and suggest immediate priorities.")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-semibold transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{lang === 'ar' ? 'الموجز الذكي' : 'AI Lead Brief'}</span>
            </button>
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.newProject}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.quickActions}</span>
          </span>
          <div className="flex items-center gap-3">
            {completed > 0 && onArchiveProject && (
              <button
                onClick={() => {
                  activeProjects.filter(p => p.status === 'Completed').forEach(p => onArchiveProject(p.id));
                }}
                className="text-[11px] text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Archive className="w-3 h-3" />
                <span>Archive {completed} Completed</span>
              </button>
            )}
            {projects.length > 0 && onClearAllData && (
              <button
                onClick={onClearAllData}
                className="text-[10.5px] text-zinc-400 hover:text-red-600 font-medium transition-colors"
                title="Wipe all items to start completely clean"
              >
                Clear Workspace
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{t.floatingNewTask}</span>
          </button>

          <button
            onClick={onOpenNewNote}
            className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-semibold border border-amber-200/60 dark:border-amber-900/50 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{t.floatingNewNote}</span>
          </button>

          <button
            onClick={onOpenFileUpload}
            className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold border border-indigo-200/60 dark:border-indigo-900/50 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-indigo-200/80 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 flex items-center justify-center shrink-0">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{t.floatingUpload}</span>
          </button>

          <button
            onClick={() => onSwitchView('board')}
            className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-200/60 dark:border-emerald-900/50 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Kanban Board</span>
          </button>

          <button
            onClick={onToggleAi}
            className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-semibold border border-blue-200/70 dark:border-blue-900/50 transition-colors col-span-2 sm:col-span-1"
          >
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{t.aiCopilot}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>{t.kpiActive}</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{total - completed}</span>
            <span className="text-xs text-zinc-400">/ {total}</span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            {inProgress} active · {review} in review
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Urgent Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-400">{highPriority}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">High priority</span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Requires executive lead review
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Delivered & Archived</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{completed}</span>
            <span className="text-xs text-zinc-400 font-medium">
              (+{archivedProjects.length} archived)
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Completed milestones
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Milestone Rate</span>
            <CheckSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{deliverableRate}%</span>
            <span className="text-xs text-zinc-400 font-mono">({doneDeliverables}/{totalDeliverables})</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${deliverableRate}%` }} 
            />
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* INTERACTIVE GRAPHS: Status Distribution & Upcoming Task Density */}
      {/* =============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GRAPH 1: Project Status Distribution */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Visual Analytics
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Project Status Distribution</h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
              {total} Total Projects
            </span>
          </div>

          {statusDistributionData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <BarChart3 className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">No projects in pipeline</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
                Create a project using one of our predefined templates to visualize distribution.
              </p>
              <button
                onClick={onOpenNewProject}
                className="mt-3 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white rounded-lg text-xs font-semibold"
              >
                + Create Project
              </button>
            </div>
          ) : (
            <div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const percent = total > 0 ? Math.round(((Number(data.value) || 0) / total) * 100) : 0;
                          return (
                            <div className="bg-zinc-900 dark:bg-zinc-800 text-white p-2.5 rounded-lg shadow-lg text-xs border border-zinc-800 dark:border-zinc-700 space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
                                <span>{data.name}</span>
                              </div>
                              <div className="text-zinc-300">
                                Count: <span className="font-mono font-semibold text-white">{data.value}</span> ({percent}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={statusDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="#ffffff"
                          strokeWidth={hoveredPieIndex === index ? 3 : 1}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Legend Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {statusDistributionData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-md border border-zinc-100 dark:border-zinc-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="font-medium">{entry.name}:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GRAPH 2: Upcoming Task Density & Horizon Stacking */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Temporal Density
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Upcoming Task Density & Urgency</h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 font-semibold">
              {totalDeliverables - doneDeliverables} Pending Tasks
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={densityBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" opacity={0.3} />
                <XAxis 
                  dataKey="horizon" 
                  tick={{ fontSize: 10, fill: '#71717a' }} 
                  axisLine={{ stroke: '#e4e4e7' }} 
                  tickLine={false} 
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 10, fill: '#71717a' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const high = Number(payload.find(p => p.dataKey === 'high')?.value || 0);
                      const medium = Number(payload.find(p => p.dataKey === 'medium')?.value || 0);
                      const low = Number(payload.find(p => p.dataKey === 'low')?.value || 0);
                      const sum = high + medium + low;
                      return (
                        <div className="bg-zinc-900 dark:bg-zinc-800 text-white p-2.5 rounded-lg shadow-lg text-xs border border-zinc-800 dark:border-zinc-700 space-y-1">
                          <div className="font-bold text-zinc-100">{label} Horizon</div>
                          <div className="text-zinc-300 flex items-center justify-between gap-3">
                            <span>High Urgency:</span>
                            <span className="font-mono text-red-400 font-bold">{high}</span>
                          </div>
                          <div className="text-zinc-300 flex items-center justify-between gap-3">
                            <span>Medium Urgency:</span>
                            <span className="font-mono text-amber-400 font-bold">{medium}</span>
                          </div>
                          <div className="text-zinc-300 flex items-center justify-between gap-3">
                            <span>Low Urgency:</span>
                            <span className="font-mono text-emerald-400 font-bold">{low}</span>
                          </div>
                          <div className="border-t border-zinc-700 pt-1 flex items-center justify-between gap-3 font-semibold">
                            <span>Total Due:</span>
                            <span className="font-mono text-white">{sum}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="high" name="High Priority" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" name="Medium Priority" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="low" name="Low Priority" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Density Legend */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span>Standard</span>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* SMART PRIORITY ENGINE: Auto-Ranked Tasks Panel */}
      {/* =============================================================== */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Smart Priority Task Engine
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Auto-Calculated
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Tasks dynamically re-ranked by due dates, client priority, and project progress bottlenecks.
              </p>
            </div>
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            {rankedTasks.length} pending
          </div>
        </div>

        {rankedTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="font-semibold text-zinc-800 dark:text-zinc-200">All deliverables up to date!</div>
            <p className="text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
              No pending tasks detected. Create a project from a template to populate new operational deliverables.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-96 overflow-y-auto">
            {rankedTasks.slice(0, 6).map((task) => (
              <div 
                key={task.id}
                className="p-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTaskComplete && onToggleTaskComplete(task.projectId, task.id)}
                    className="mt-0.5 w-4 h-4 rounded border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-transparent hover:text-emerald-600 flex items-center justify-center shrink-0 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white truncate">
                        {task.text}
                      </span>
                      {task.tier === 'critical' ? (
                        <span className="shrink-0 text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                          CRITICAL
                        </span>
                      ) : task.tier === 'high' ? (
                        <span className="shrink-0 text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          HIGH
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{task.projectName}</span>
                      <span>•</span>
                      <span>{task.projectClient}</span>
                      <span>•</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium">{task.reason}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Priority Score</div>
                    <div className="font-mono font-bold text-zinc-900 dark:text-white">{task.score}</div>
                  </div>

                  {task.dueDate && (
                    <div className="text-right font-mono text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                      {task.dueDate}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const proj = projects.find(p => p.id === task.projectId);
                      if (proj) onSelectProject(proj);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects Portfolio Section with Active vs Archived Tab */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`text-sm font-bold pb-1 transition-all border-b-2 ${
                activeTab === 'active' 
                  ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              Active Projects ({activeProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`text-sm font-bold pb-1 transition-all border-b-2 ${
                activeTab === 'archived' 
                  ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              Archived ({archivedProjects.length})
            </button>
          </div>

          <button
            onClick={() => onSwitchView('projects')}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Database</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f9f9f8] dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase text-[10.5px] tracking-wider">
                  <th className="py-3 px-4">Project & Scope</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Deliverables Progress</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {displayedProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      {activeTab === 'archived' 
                        ? 'No projects in archive.' 
                        : 'No projects yet. Click "+ New Lead" or use a template to begin.'}
                    </td>
                  </tr>
                ) : (
                  displayedProjects.slice(0, 6).map((p) => {
                    const delivDone = (p.deliverables || []).filter(d => d.completed).length;
                    const delivTotal = (p.deliverables || []).length;
                    const percent = delivTotal > 0 ? Math.round((delivDone / delivTotal) * 100) : 0;

                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group">
                        <td className="py-3.5 px-4">
                          <div 
                            onClick={() => onSelectProject(p)}
                            className="font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{p.name}</span>
                            {p.category && (
                              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                {p.category}
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.tags.map(tag => (
                                <span 
                                  key={tag} 
                                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    tag === 'VIP' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                                    tag === 'Urgent' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                    tag === 'Internal' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                    'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  }`}
                                >
                                  🏷️ {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Live Interactive Sheet Link */}
                          {p.sheetUrl && (
                            <div className="mt-1">
                              <a
                                href={p.sheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-semibold transition-colors"
                                title="Open Live Interactive Sheet"
                              >
                                <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Live Sheet ↗</span>
                              </a>
                            </div>
                          )}

                          {p.notes && (
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-xs mt-0.5">
                              {p.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                          {p.client}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={p.status}
                            onChange={(e) => onUpdateStatus(p.id, e.target.value as Project['status'])}
                            className={`text-xs font-semibold rounded-md px-2 py-1 border cursor-pointer focus:outline-none transition-colors ${
                              p.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : p.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                : p.status === 'Review'
                                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                            p.priority === 'High'
                              ? 'bg-red-50 text-red-700 border border-red-200/70 dark:bg-red-950/40 dark:text-red-300'
                              : p.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}>
                            {p.priority}
                          </span>
                        </td>
                        {/* Dynamic Deliverables Progress Bar */}
                        <td className="py-3.5 px-4 min-w-[150px]">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                                {delivDone}/{delivTotal} done
                              </span>
                              <span className={`font-bold ${
                                percent === 100 ? 'text-emerald-600 dark:text-emerald-400' :
                                percent >= 50 ? 'text-blue-600 dark:text-blue-400' :
                                percent > 0 ? 'text-amber-600 dark:text-amber-400' :
                                'text-zinc-400'
                              }`}>
                                {percent}%
                              </span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden p-0.5 border border-zinc-200/50 dark:border-zinc-700/50">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  percent === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs' :
                                  percent >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xs' :
                                  percent > 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-xs' :
                                  'bg-transparent'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            {percent === 100 && (
                              <div className="flex items-center gap-1 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckSquare className="w-2.5 h-2.5" />
                                <span>100% Complete</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                          {p.date || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.archived && onRestoreProject ? (
                              <button
                                onClick={() => onRestoreProject(p.id)}
                                className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-medium text-[11px] flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                            ) : p.status === 'Completed' && onArchiveProject ? (
                              <button
                                onClick={() => onArchiveProject(p.id)}
                                className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-zinc-700 dark:text-zinc-300 hover:text-amber-800 font-medium text-[11px] flex items-center gap-1"
                                title="Move to Archive"
                              >
                                <Archive className="w-3 h-3" />
                                <span>Archive</span>
                              </button>
                            ) : null}

                            <button
                              onClick={() => onSelectProject(p)}
                              className="px-2 py-1 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-[11px]"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => onEditProject(p)}
                              className="px-2 py-1 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-[11px]"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
