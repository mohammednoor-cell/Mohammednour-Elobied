import React, { useState, useMemo } from 'react';
import { Project, Language } from '../types';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  ExternalLink,
  Sparkles,
  Layers,
  Clock,
  Bell,
  Play,
  Pause,
  LayoutList,
  LayoutGrid,
  Archive,
  RotateCcw,
  Tag,
  FileSpreadsheet,
  Link2
} from 'lucide-react';
import { TaskClockBadge } from './TaskClockBadge';
import { getTranslation } from '../utils/i18n';
import { calculateProjectSmartPriority } from '../utils/smartPriorityEngine';

interface ProjectsTableViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenNewProject: () => void;
  onUpdateStatus: (projectId: string, status: Project['status']) => void;
  onToggleTimer?: (projectId: string) => void;
  onOpenReminderModal?: (project: Project) => void;
  onArchiveProject?: (projectId: string) => void;
  onRestoreProject?: (projectId: string) => void;
  initialSearchQuery?: string;
  lang?: Language;
}

export const ProjectsTableView: React.FC<ProjectsTableViewProps> = ({
  projects,
  onSelectProject,
  onEditProject,
  onDeleteProject,
  onOpenNewProject,
  onUpdateStatus,
  onToggleTimer,
  onOpenReminderModal,
  onArchiveProject,
  onRestoreProject,
  initialSearchQuery = '',
  lang = 'en',
}) => {
  const t = getTranslation(lang);
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [search, setSearch] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'priority' | 'status' | 'smart_priority'>('smart_priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Categories extracted from data
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }, [projects]);

  // Tags extracted from data
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      (p.tags || []).forEach(t => set.add(t));
    });
    return Array.from(set);
  }, [projects]);

  const activeProjectsCount = projects.filter(p => !p.archived).length;
  const archivedProjectsCount = projects.filter(p => p.archived).length;

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Tab filter (active vs archived)
      if (tab === 'active' && p.archived) return false;
      if (tab === 'archived' && !p.archived) return false;

      // Search term
      const term = search.toLowerCase().trim();
      const matchesSearch = !term || [
        p.name,
        p.client,
        p.notes,
        p.category,
        p.lead,
        ...(p.tags || []),
        ...(p.deliverables || []).map(d => d.text)
      ].some(val => String(val || '').toLowerCase().includes(term));

      // Status filter
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;

      // Category filter
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

      // Tag filter
      const matchesTag = tagFilter === 'All' || (p.tags && p.tags.includes(tagFilter));

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesTag;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'smart_priority') {
        const scoreA = calculateProjectSmartPriority(a).score;
        const scoreB = calculateProjectSmartPriority(b).score;
        comparison = scoreA - scoreB;
      } else if (sortBy === 'date') {
        comparison = (a.date || '9999').localeCompare(b.date || '9999');
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'priority') {
        const priorityRank: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
        comparison = (priorityRank[a.priority] || 9) - (priorityRank[b.priority] || 9);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [projects, tab, search, statusFilter, priorityFilter, categoryFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'date' | 'name' | 'priority' | 'status' | 'smart_priority') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {lang === 'ar' ? 'إدارة محفظة ترتيبات' : 'Tartibat Portfolio Management'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {lang === 'ar' ? 'قاعدة بيانات المشاريع والتسليمات' : 'Projects & Tasks Database'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5">
            {lang === 'ar' 
              ? 'تتبع حي لمواعيد التسليم مع ساعات عد تنازلي حية ومؤقتات مهام وتنبيهات مجدولة'
              : 'Live tracking with real-time countdown clocks, active work timers, and priority alarms.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Switcher (Table vs Mobile Cards) */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Card View (Optimized for iPad & Phone)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.newProject}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
        {/* Active vs Archived Tabs */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'active'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Active Projects ({activeProjectsCount})
            </button>
            <button
              onClick={() => setTab('archived')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === 'archived'
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived ({archivedProjectsCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              <option value="smart_priority">Smart Priority ✦</option>
              <option value="date">Deadline Date</option>
              <option value="priority">Client Priority</option>
              <option value="name">Project Name</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8f8f7] dark:bg-zinc-800/70 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 pl-9 pr-3 py-2 rounded-lg border border-zinc-200/70 dark:border-zinc-700 focus:outline-none focus:border-zinc-400 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 text-xs font-medium focus:outline-none"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {allTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 text-xs font-medium focus:outline-none"
              >
                <option value="All">All Labels & Tags</option>
                {allTags.map(t => (
                  <option key={t} value={t}>🏷️ {t}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Results summary pill */}
        <div className="flex items-center justify-between text-[11.5px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <span>
            {lang === 'ar' ? 'عرض' : 'Showing'} <strong className="text-zinc-800 dark:text-zinc-200">{filteredProjects.length}</strong> {lang === 'ar' ? `من أصل ${projects.length} مشاريع` : `of ${projects.length} projects`}
          </span>
          {(statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All' || tagFilter !== 'All' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setPriorityFilter('All');
                setCategoryFilter('All');
                setTagFilter('All');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* RENDER MODE: ADAPTIVE CARDS FOR IPAD / PHONES */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((p) => {
            const delivDone = (p.deliverables || []).filter(d => d.completed).length;
            const delivTotal = (p.deliverables || []).length;
            const percent = delivTotal > 0 ? Math.round((delivDone / delivTotal) * 100) : 0;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div 
                      onClick={() => onSelectProject(p)}
                      className="font-bold text-sm text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate"
                    >
                      {p.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {p.client} {p.category ? `• ${p.category}` : ''}
                    </div>

                    {/* Tags Pills */}
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.tags.map(tag => (
                          <span 
                            key={tag} 
                            className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider ${
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
                      <div className="mt-1.5">
                        <a
                          href={p.sheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10.5px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 font-semibold transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                          <span>Live Sheet ↗</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-semibold shrink-0 ${
                    p.priority === 'High'
                      ? 'bg-red-50 text-red-700 border border-red-200/70 dark:bg-red-950/40 dark:text-red-300'
                      : p.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}>
                    {p.priority}
                  </span>
                </div>

                {/* Live Clock & Timer Badge on Mobile Card */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-400">
                    {lang === 'ar' ? 'ساعة الموعد والمؤقت:' : 'Live Clock & Stopwatch:'}
                  </div>
                  <TaskClockBadge
                    targetDate={p.date}
                    targetTime={p.time}
                    isCompleted={p.status === 'Completed'}
                    timerSeconds={p.timerSeconds || 0}
                    isTimerRunning={p.isTimerRunning || false}
                    onToggleTimer={() => onToggleTimer && onToggleTimer(p.id)}
                  />
                </div>

                {/* Dynamic Deliverables Progress Bar */}
                <div className="space-y-1.5 p-2 bg-zinc-50/70 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                      {delivDone} / {delivTotal} {lang === 'ar' ? 'تسليمات منجزة' : 'deliverables done'}
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
                  <div className="w-full bg-zinc-200/70 dark:bg-zinc-700/60 rounded-full h-2 overflow-hidden p-0.5">
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
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 gap-2">
                  <select
                    value={p.status}
                    onChange={(e) => onUpdateStatus(p.id, e.target.value as Project['status'])}
                    className="text-xs font-semibold rounded-md px-2 py-1.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none min-h-[36px]"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>

                  <div className="flex items-center gap-1">
                    {onOpenReminderModal && (
                      <button
                        onClick={() => onOpenReminderModal(p)}
                        className="p-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Set Reminder for this Project"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectProject(p)}
                      className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Inspect"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditProject(p)}
                      className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(p.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* RENDER MODE: FULL DESKTOP & IPAD HORIZONTAL TABLE */
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f9f9f8] dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase text-[10.5px] tracking-wider select-none">
                  <th 
                    onClick={() => toggleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Project & Scope</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Client</th>
                  <th 
                    onClick={() => toggleSort('status')}
                    className="py-3 px-4 cursor-pointer hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Live Clocks & Timer</th>
                  <th 
                    onClick={() => toggleSort('priority')}
                    className="py-3 px-4 cursor-pointer hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Deliverables Progress</th>
                  <th 
                    onClick={() => toggleSort('date')}
                    className="py-3 px-4 cursor-pointer hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Deadline</span>
                      <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">No matching projects found.</p>
                        <button
                          onClick={onOpenNewProject}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Create a new project
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => {
                    const delivDone = (p.deliverables || []).filter(d => d.completed).length;
                    const delivTotal = (p.deliverables || []).length;
                    const percent = delivTotal > 0 ? Math.round((delivDone / delivTotal) * 100) : 0;

                    return (
                      <tr 
                        key={p.id} 
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                      >
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

                          {/* Tags in Table */}
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

                          {/* Live Sheet Link */}
                          {p.sheetUrl && (
                            <div className="mt-1">
                              <a
                                href={p.sheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-semibold"
                                title="Open Live Interactive Sheet"
                              >
                                <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Live Sheet ↗</span>
                              </a>
                            </div>
                          )}

                          {p.notes && (
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-sm mt-0.5">
                              {p.notes}
                            </div>
                          )}
                          {p.budget && (
                            <div className="text-[10.5px] text-zinc-400 font-mono mt-0.5">
                              Budget: {p.budget}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                          {p.client}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              p.status === 'In Progress' ? 'bg-blue-500 animate-pulse' :
                              p.status === 'Completed' ? 'bg-emerald-500' :
                              p.status === 'Review' ? 'bg-amber-500' : 'bg-zinc-400'
                            }`} />
                            <select
                              value={p.status}
                              onChange={(e) => onUpdateStatus(p.id, e.target.value as Project['status'])}
                              className="text-xs font-semibold rounded-md px-2 py-1 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-none"
                            >
                              <option value="Planning">Planning</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Review">Review</option>
                              <option value="Completed">Completed</option>
                              <option value="On Hold">On Hold</option>
                            </select>
                          </div>
                        </td>
                        {/* Live Clocks & Stopwatch Column */}
                        <td className="py-3.5 px-4">
                          <TaskClockBadge
                            targetDate={p.date}
                            targetTime={p.time}
                            isCompleted={p.status === 'Completed'}
                            timerSeconds={p.timerSeconds || 0}
                            isTimerRunning={p.isTimerRunning || false}
                            onToggleTimer={() => onToggleTimer && onToggleTimer(p.id)}
                          />
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
                        <td className="py-3.5 px-4 min-w-[150px]">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                                {delivDone}/{delivTotal} {lang === 'ar' ? 'منجز' : 'done'}
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
                                <span>{lang === 'ar' ? 'مكتمل بنسبة 100%' : '100% Complete'}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                          {p.date ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              <span>{p.date}</span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {p.archived && onRestoreProject ? (
                              <button
                                onClick={() => onRestoreProject(p.id)}
                                className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded transition-colors"
                                title="Restore Project"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : p.status === 'Completed' && onArchiveProject ? (
                              <button
                                onClick={() => onArchiveProject(p.id)}
                                className="p-1 text-zinc-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                                title="Move to Archive"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            {onOpenReminderModal && (
                              <button
                                onClick={() => onOpenReminderModal(p)}
                                className="p-1 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-colors"
                                title="Set Reminder"
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onSelectProject(p)}
                              className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                              title="Inspect Details"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditProject(p)}
                              className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                              title="Edit Project"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteProject(p.id)}
                              className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      )}
    </div>
  );
};

