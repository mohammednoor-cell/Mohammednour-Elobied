import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../utils/i18n';
import { 
  Zap, 
  Plus, 
  FileText, 
  Sparkles, 
  Upload, 
  BarChart3, 
  X, 
  ChevronUp, 
  FileSpreadsheet, 
  Layers, 
  Bell, 
  Palette, 
  Download,
  MessageSquare
} from 'lucide-react';

interface QuickActionsFloatingMenuProps {
  lang: Language;
  onOpenNewTask: () => void;
  onOpenNewNote: () => void;
  onToggleAi: () => void;
  onOpenFileUpload: () => void;
  onOpenAnalytics: () => void;
  onOpenReminders?: () => void;
  onOpenThemes?: () => void;
  onOpenExport?: () => void;
  onOpenWhatsApp?: () => void;
  isAiOpen: boolean;
}

export const QuickActionsFloatingMenu: React.FC<QuickActionsFloatingMenuProps> = ({
  lang,
  onOpenNewTask,
  onOpenNewNote,
  onToggleAi,
  onOpenFileUpload,
  onOpenAnalytics,
  onOpenReminders,
  onOpenThemes,
  onOpenExport,
  onOpenWhatsApp,
  isAiOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = getTranslation(lang);
  const isRtl = lang === 'ar';

  const handleAction = (callback?: () => void) => {
    if (callback) callback();
    setIsOpen(false);
  };

  return (
    <div 
      id="quick-actions-floating-container"
      className={`fixed bottom-20 sm:bottom-6 ${isRtl ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-40 flex flex-col items-end gap-2.5 select-none`}
    >
      {/* Expanded Menu Options */}
      {isOpen && (
        <div 
          className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-zinc-200/90 dark:border-zinc-800 w-72 animate-in fade-in slide-in-from-bottom-3 duration-150 space-y-1 max-h-[80vh] overflow-y-auto"
        >
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.floatingMenuTitle}</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action 1: Add New Task / Lead */}
          <button
            onClick={() => handleAction(onOpenNewTask)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{t.floatingNewTask}</div>
              <div className="text-[10px] text-zinc-400 font-normal">New milestone / lead</div>
            </div>
          </button>

          {/* Action 2: Quick Note */}
          <button
            onClick={() => handleAction(onOpenNewNote)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{t.floatingNewNote}</div>
              <div className="text-[10px] text-zinc-400 font-normal">Fast executive scratchpad</div>
            </div>
          </button>

          {/* Action 3: Task Reminders & Clocks */}
          {onOpenReminders && (
            <button
              onClick={() => handleAction(onOpenReminders)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate">{lang === 'ar' ? 'تذكيرات وتنبيهات المهام' : 'Task Reminders & Alarms'}</div>
                <div className="text-[10px] text-zinc-400 font-normal">Schedule notification chime</div>
              </div>
            </button>
          )}

          {/* Action: WhatsApp Instant Alerts */}
          {onOpenWhatsApp && (
            <button
              onClick={() => handleAction(onOpenWhatsApp)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate">{lang === 'ar' ? 'إرسال تحديث عبر واتساب' : 'WhatsApp Project Alerts'}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Send executive status updates</div>
              </div>
            </button>
          )}

          {/* Action 4: Toggle AI Lead Copilot */}
          <button
            onClick={() => handleAction(onToggleAi)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{t.floatingToggleAi}</div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                {isAiOpen ? 'Close AI Assistant' : 'Gemini 3.8 Intelligence'}
              </div>
            </div>
          </button>

          {/* Action 5: Theme Colors */}
          {onOpenThemes && (
            <button
              onClick={() => handleAction(onOpenThemes)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Palette className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate">{lang === 'ar' ? 'أنماط وثيمات الألوان' : 'Color Themes & Palette'}</div>
                <div className="text-[10px] text-zinc-400 font-normal">7 executive themes & dark mode</div>
              </div>
            </button>
          )}

          {/* Action 6: Universal Export */}
          {onOpenExport && (
            <button
              onClick={() => handleAction(onOpenExport)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate">{lang === 'ar' ? 'تصدير شامل لأي صيغة' : 'Universal Export (All Formats)'}</div>
                <div className="text-[10px] text-zinc-400 font-normal">Excel, CSV, PDF, Markdown</div>
              </div>
            </button>
          )}

          {/* Action 7: Upload Any File */}
          <button
            onClick={() => handleAction(onOpenFileUpload)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{t.floatingUpload}</div>
              <div className="text-[10px] text-zinc-400 font-normal">PPTX, XLSX, PDF, Docs</div>
            </div>
          </button>

          {/* Action 8: Power BI Infographics */}
          <button
            onClick={() => handleAction(onOpenAnalytics)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{t.floatingReport}</div>
              <div className="text-[10px] text-zinc-400 font-normal">Power BI visuals & telemetry</div>
            </div>
          </button>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 text-xs font-medium shadow-lg backdrop-blur-xs pointer-events-none animate-in fade-in">
            <Zap className="w-3 h-3 text-amber-400 dark:text-amber-600" />
            <span>{t.quickActions}</span>
          </div>
        )}

        <button
          id="btn-quick-actions-fab"
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-13 h-13 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-200 ${
            isOpen
              ? 'bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 rotate-45 scale-95 ring-4 ring-zinc-200 dark:ring-zinc-700'
              : 'bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 hover:scale-105 ring-4 ring-zinc-100 dark:ring-zinc-800'
          }`}
          title={t.quickActions}
        >
          {isOpen ? <Plus className="w-6 h-6" /> : <Zap className="w-5 h-5 text-amber-400 dark:text-amber-600" />}
        </button>
      </div>
    </div>
  );
};

