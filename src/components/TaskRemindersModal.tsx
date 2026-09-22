import React, { useState, useEffect } from 'react';
import { Project, TaskReminder, Language } from '../types';
import { 
  Bell, 
  X, 
  Plus, 
  Check, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Volume2, 
  Trash2, 
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { calculateCountdown, playReminderChime } from '../utils/clockUtils';
import { getTranslation } from '../utils/i18n';

interface TaskRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  reminders: TaskReminder[];
  onAddReminder: (reminder: TaskReminder) => void;
  onToggleCompleteReminder: (id: string) => void;
  onSnoozeReminder: (id: string, minutes: number) => void;
  onDeleteReminder: (id: string) => void;
  selectedProject?: Project;
  lang: Language;
}

export const TaskRemindersModal: React.FC<TaskRemindersModalProps> = ({
  isOpen,
  onClose,
  projects,
  reminders,
  onAddReminder,
  onToggleCompleteReminder,
  onSnoozeReminder,
  onDeleteReminder,
  selectedProject,
  lang,
}) => {
  const t = getTranslation(lang);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(selectedProject?.id || projects[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState(selectedProject ? `${selectedProject.name} deadline` : '');

  useEffect(() => {
    if (selectedProject) {
      setSelectedProjectId(selectedProject.id);
      setTaskTitle(`${selectedProject.name} milestone review`);
    }
  }, [selectedProject]);

  const [reminderDateTime, setReminderDateTime] = useState(() => {
    // Default to today + 2 hours formatted for datetime-local
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setMinutes(0);
    return d.toISOString().slice(0, 16);
  });
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');

  if (!isOpen) return null;

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !reminderDateTime) return;

    const project = projects.find(p => p.id === selectedProjectId);

    const newReminder: TaskReminder = {
      id: `rem-${Date.now()}`,
      projectId: selectedProjectId,
      projectName: project ? project.name : 'General Lead',
      taskTitle: taskTitle.trim(),
      dueDateTime: reminderDateTime,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      priority: project?.priority || 'High'
    };

    onAddReminder(newReminder);
    setTaskTitle('');
    playReminderChime();
  };

  const handleSetQuickPreset = (hoursFromNow: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursFromNow);
    d.setMinutes(0);
    setReminderDateTime(d.toISOString().slice(0, 16));
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'active') return !r.isCompleted;
    if (filter === 'completed') return r.isCompleted;
    return true;
  }).sort((a, b) => new Date(a.dueDateTime).getTime() - new Date(b.dueDateTime).getTime());

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{lang === 'ar' ? 'منبه وتذكير المهام والتسليمات' : 'Task Reminders & Priority Alarms'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold font-mono">
                  {reminders.filter(r => !r.isCompleted).length} {lang === 'ar' ? 'نشط' : 'Active'}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {lang === 'ar' 
                  ? 'ضبط مواعيد التنبيهات المباشرة للتسليمات والمتابعات الوزارية والتنفيذية'
                  : 'Configure real-time countdown alerts and scheduled follow-ups for Tartibat deliverables.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => playReminderChime()}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 transition-colors"
              title="Test notification sound chime"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create Reminder Form */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-amber-50/30 dark:bg-amber-950/10">
          <form onSubmit={handleCreateReminder} className="space-y-3">
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'ar' ? 'إضافة موعد تذكير جديد' : 'Schedule New Task Reminder'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
              <div className="sm:col-span-4">
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  {lang === 'ar' ? 'المشروع المرتبط' : 'Target Project'}
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.client})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  {lang === 'ar' ? 'عنوان المهمة / التذكير' : 'Reminder / Deliverable Subject'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'مثال: فحص شاشات LED قبل البروفة الرسمية' : 'e.g. Verify VIP registration fast-track kiosks'}
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  {lang === 'ar' ? 'تاريخ ووقت التنبيه' : 'Date & Time'}
                </label>
                <input
                  type="datetime-local"
                  required
                  value={reminderDateTime}
                  onChange={(e) => setReminderDateTime(e.target.value)}
                  className="w-full px-2.5 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Quick Presets & Submit */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-zinc-400">{lang === 'ar' ? 'توقيت سريع:' : 'Presets:'}</span>
                <button
                  type="button"
                  onClick={() => handleSetQuickPreset(1)}
                  className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
                >
                  +1h
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickPreset(3)}
                  className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
                >
                  +3h
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickPreset(24)}
                  className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
                >
                  {lang === 'ar' ? 'غداً' : 'Tomorrow'}
                </button>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'حفظ التذكير' : 'Set Reminder'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Reminders List & Filter Bar */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  filter === 'active' 
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {lang === 'ar' ? 'النشطة' : 'Active'} ({reminders.filter(r => !r.isCompleted).length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  filter === 'completed' 
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {lang === 'ar' ? 'المنجزة' : 'Completed'} ({reminders.filter(r => r.isCompleted).length})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  filter === 'all' 
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {lang === 'ar' ? 'الكل' : 'All'} ({reminders.length})
              </button>
            </div>
          </div>

          {filteredReminders.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              <Bell className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                {lang === 'ar' ? 'لا توجد تذكيرات في هذه القائمة' : 'No task reminders scheduled'}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {lang === 'ar' ? 'أضف تذكيراً جديداً للأعلى لتتبع مواعيد التسليم' : 'Schedule alerts above to keep critical deadlines in check'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReminders.map((reminder) => {
                const countdown = calculateCountdown(reminder.dueDateTime);
                return (
                  <div
                    key={reminder.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      reminder.isCompleted
                        ? 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200/70 dark:border-zinc-800 text-zinc-400 opacity-70'
                        : countdown?.isOverdue
                        ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 shadow-2xs'
                        : 'bg-white dark:bg-zinc-800/60 border-zinc-200/90 dark:border-zinc-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleCompleteReminder(reminder.id)}
                        className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          reminder.isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {reminder.isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <div className={`text-xs font-bold ${reminder.isCompleted ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {reminder.taskTitle}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{reminder.projectName}</span>
                          <span>•</span>
                          <span>{new Date(reminder.dueDateTime).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!reminder.isCompleted && countdown && (
                        <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-mono font-medium border ${countdown.badgeColor}`}>
                          {countdown.formatted}
                        </span>
                      )}

                      {/* Snooze Options */}
                      {!reminder.isCompleted && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onSnoozeReminder(reminder.id, 15)}
                            className="px-2 py-1 text-[10.5px] rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
                            title="Snooze +15 minutes"
                          >
                            +15m
                          </button>
                          <button
                            onClick={() => onSnoozeReminder(reminder.id, 60)}
                            className="px-2 py-1 text-[10.5px] rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
                            title="Snooze +1 hour"
                          >
                            +1h
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => onDeleteReminder(reminder.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-400 hover:text-red-600 transition-colors"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
