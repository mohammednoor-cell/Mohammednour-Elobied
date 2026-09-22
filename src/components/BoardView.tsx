import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, Language } from '../types';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Edit3,
  ExternalLink,
  ChevronRight,
  GripVertical,
  Archive,
  RotateCcw,
  Sparkles,
  Tag,
  FileSpreadsheet
} from 'lucide-react';
import { TaskClockBadge } from './TaskClockBadge';
import { getTranslation } from '../utils/i18n';
import { calculateProjectSmartPriority } from '../utils/smartPriorityEngine';

interface BoardViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => void;
  onOpenNewProject: () => void;
  onToggleTimer?: (projectId: string) => void;
  onArchiveProject?: (projectId: string) => void;
  onRestoreProject?: (projectId: string) => void;
  lang?: Language;
}

export const BoardView: React.FC<BoardViewProps> = ({
  projects,
  onSelectProject,
  onEditProject,
  onUpdateStatus,
  onOpenNewProject,
  onToggleTimer,
  onArchiveProject,
  onRestoreProject,
  lang = 'en',
}) => {
  const t = getTranslation(lang);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');

  // Extract all distinct tags from projects
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      (p.tags || []).forEach(t => set.add(t));
    });
    return Array.from(set);
  }, [projects]);

  const columns: { status: ProjectStatus; title: string; color: string; border: string; accent: string }[] = [
    { status: 'Planning', title: lang === 'ar' ? 'التخطيط' : 'Planning', color: 'bg-zinc-100/70 dark:bg-zinc-800/40', border: 'border-zinc-200 dark:border-zinc-800', accent: 'bg-zinc-500' },
    { status: 'In Progress', title: lang === 'ar' ? 'قيد التنفيذ' : 'In Progress', color: 'bg-blue-50/50 dark:bg-blue-950/20', border: 'border-blue-200/80 dark:border-blue-900/40', accent: 'bg-blue-500' },
    { status: 'Review', title: lang === 'ar' ? 'المراجعة والجودة' : 'Review / QA', color: 'bg-amber-50/50 dark:bg-amber-950/20', border: 'border-amber-200/80 dark:border-amber-900/40', accent: 'bg-amber-500' },
    { status: 'Completed', title: lang === 'ar' ? 'مكتمل' : 'Completed', color: 'bg-emerald-50/50 dark:bg-emerald-950/20', border: 'border-emerald-200/80 dark:border-emerald-900/40', accent: 'bg-emerald-500' },
  ];

  const getNextStatus = (current: ProjectStatus): ProjectStatus | null => {
    if (current === 'Planning') return 'In Progress';
    if (current === 'In Progress') return 'Review';
    if (current === 'Review') return 'Completed';
    return null;
  };

  const getPrevStatus = (current: ProjectStatus): ProjectStatus | null => {
    if (current === 'Completed') return 'Review';
    if (current === 'Review') return 'In Progress';
    if (current === 'In Progress') return 'Planning';
    return null;
  };

  // Filter active and archived projects with tag filter
  const activeProjects = useMemo(() => {
    return projects.filter(p => {
      if (p.archived) return false;
      if (selectedTagFilter !== 'All') {
        return p.tags && p.tags.includes(selectedTagFilter);
      }
      return true;
    });
  }, [projects, selectedTagFilter]);

  const archivedProjects = projects.filter(p => p.archived);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('text/plain', projectId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProjectId(projectId);
  };

  const handleDragEnd = () => {
    setDraggedProjectId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: ProjectStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colStatus) {
      setDragOverColumn(colStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column element itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ProjectStatus) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain') || draggedProjectId;
    if (projectId) {
      onUpdateStatus(projectId, targetStatus);
    }
    setDragOverColumn(null);
    setDraggedProjectId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>{lang === 'ar' ? 'سير العمل والمراحل' : 'Pipeline Progression'}</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">Native Drag-and-Drop Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {lang === 'ar' ? 'لوحة كانبان الحية' : 'Kanban Board'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5">
            {lang === 'ar' 
              ? 'اسحب بطاقات المشاريع وأسقطها بين الأعمدة لتحديث حالتها الفورية'
              : 'Drag and drop project cards freely across columns to transition phases with instant state updates.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {archivedProjects.length > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                showArchived
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'ar' ? 'الأرشيف' : 'Archive'} ({archivedProjects.length})</span>
            </button>
          )}

          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors min-h-[38px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.newProject}</span>
          </button>
        </div>
      </div>

      {/* Tag Filtering Bar for Board */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white/70 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Tag className="w-3 h-3 text-zinc-400" />
            <span>{lang === 'ar' ? 'تصفية حسب الوسم:' : 'Filter Label:'}</span>
          </span>
          <button
            onClick={() => setSelectedTagFilter('All')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
              selectedTagFilter === 'All'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            All ({projects.filter(p => !p.archived).length})
          </button>
          {allTags.map(tag => {
            const count = projects.filter(p => !p.archived && p.tags && p.tags.includes(tag)).length;
            const isSelected = selectedTagFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(isSelected ? 'All' : tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                🏷️ {tag} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Archived Projects Banner (if toggled) */}
      {showArchived && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              <Archive className="w-4 h-4 text-amber-600" />
              <span>Archived Projects ({archivedProjects.length})</span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-300">
              Completed projects kept safely in secondary storage
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {archivedProjects.map((p) => (
              <div 
                key={p.id} 
                className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-amber-200/80 dark:border-amber-800/40 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-white">{p.name}</div>
                  <div className="text-[11px] text-zinc-500">{p.client} · Archived {p.archivedAt ? new Date(p.archivedAt).toLocaleDateString() : ''}</div>
                </div>
                {onRestoreProject && (
                  <button
                    onClick={() => onRestoreProject(p.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Board Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colProjects = activeProjects.filter(p => p.status === col.status);
          const isOver = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`rounded-xl border transition-all duration-150 p-3 min-h-[520px] flex flex-col ${
                isOver 
                  ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-50/80 dark:bg-blue-950/40 shadow-md scale-[1.01]' 
                  : `${col.border} ${col.color}`
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.accent}`} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    {col.title}
                  </h2>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-white/90 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold">
                    {colProjects.length}
                  </span>
                </div>

                <div className="text-[10px] text-zinc-400 font-medium">
                  Drop target
                </div>
              </div>

              {/* Card List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colProjects.length === 0 ? (
                  <div className={`h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${
                    isOver 
                      ? 'border-blue-400 bg-blue-100/50 text-blue-700 font-bold' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 font-medium'
                  }`}>
                    {isOver ? (
                      <span>Drop to set {col.title}</span>
                    ) : (
                      <span>{lang === 'ar' ? 'لا توجد مشاريع في هذه المرحلة' : 'No projects · Drag card here'}</span>
                    )}
                  </div>
                ) : (
                  colProjects.map((p) => {
                    const nextSt = getNextStatus(p.status);
                    const prevSt = getPrevStatus(p.status);
                    const delivDone = (p.deliverables || []).filter(d => d.completed).length;
                    const delivTotal = (p.deliverables || []).length;
                    const isDraggingThis = draggedProjectId === p.id;
                    const priorityAnalysis = calculateProjectSmartPriority(p);

                    return (
                      <div
                        key={p.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, p.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-3.5 shadow-2xs hover:shadow-sm hover:border-blue-400/80 dark:hover:border-zinc-700 transition-all space-y-2.5 group cursor-grab active:cursor-grabbing ${
                          isDraggingThis ? 'opacity-40 scale-95 border-dashed border-blue-500' : ''
                        }`}
                      >
                        {/* Drag Handle & Priority */}
                        <div className="flex items-center justify-between text-[10.5px]">
                          <div className="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                            <GripVertical className="w-3.5 h-3.5" />
                            <span className="font-semibold uppercase tracking-tight truncate max-w-[110px]">
                              {p.client}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {priorityAnalysis.tier === 'critical' && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-red-100 text-red-800 border border-red-300">
                                <Sparkles className="w-2.5 h-2.5 text-red-600" />
                                <span>Urgent</span>
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded font-semibold ${
                              p.priority === 'High'
                                ? 'bg-red-50 text-red-700 border border-red-200/70 dark:bg-red-950/40 dark:text-red-300'
                                : p.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300'
                            }`}>
                              {p.priority}
                            </span>
                          </div>
                        </div>

                        {/* Project Name & Tags */}
                        <div>
                          <div 
                            onClick={() => onSelectProject(p)}
                            className="font-bold text-zinc-900 dark:text-white text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          >
                            {p.name}
                          </div>
                          {p.notes && (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                              {p.notes}
                            </p>
                          )}

                          {/* Card Tags */}
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
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
                            <div className="mt-1.5">
                              <a
                                href={p.sheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 font-semibold"
                                title="Open Live Interactive Sheet"
                              >
                                <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Live Sheet ↗</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Live Task Clock & Timer */}
                        <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
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
                        {delivTotal > 0 && (
                          <div className="space-y-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                            {(() => {
                              const pct = Math.round((delivDone / delivTotal) * 100);
                              return (
                                <>
                                  <div className="flex items-center justify-between text-[10.5px] font-mono">
                                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                                      {delivDone}/{delivTotal} {lang === 'ar' ? 'منجز' : 'done'}
                                    </span>
                                    <span className={`font-bold ${
                                      pct === 100 ? 'text-emerald-600 dark:text-emerald-400' :
                                      pct >= 50 ? 'text-blue-600 dark:text-blue-400' :
                                      pct > 0 ? 'text-amber-600 dark:text-amber-400' :
                                      'text-zinc-400'
                                    }`}>
                                      {pct}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        pct === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                        pct >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                                        pct > 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                        'bg-transparent'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}

                        {/* Footer: Date, Archive & Navigation Controls */}
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-[10.5px] text-zinc-400 font-mono">
                            {p.date ? p.date : '—'}
                          </span>

                          <div className="flex items-center gap-1">
                            {p.status === 'Completed' && onArchiveProject && (
                              <button
                                onClick={() => onArchiveProject(p.id)}
                                title="Move to Archive"
                                className="p-1 rounded text-zinc-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {prevSt && (
                              <button
                                onClick={() => onUpdateStatus(p.id, prevSt)}
                                title={`Move back to ${prevSt}`}
                                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              onClick={() => onEditProject(p)}
                              title="Edit Project"
                              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            {nextSt && (
                              <button
                                onClick={() => onUpdateStatus(p.id, nextSt)}
                                title={`Advance to ${nextSt}`}
                                className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors font-medium flex items-center gap-0.5 text-[10.5px] px-1.5"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
