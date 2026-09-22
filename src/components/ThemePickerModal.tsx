import React from 'react';
import { ThemeId, Language } from '../types';
import { THEMES } from '../utils/theme';
import { X, Check, Palette, Moon, Sun, Sparkles } from 'lucide-react';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  isDark?: boolean;
  onToggleDark?: () => void;
  lang: Language;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  isDark,
  onToggleDark,
  lang,
}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {lang === 'ar' ? 'خيارات وأنماط الثيمات والألوان' : 'Color Themes & Aesthetic Styling'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {lang === 'ar' 
                  ? 'اختر لوحة الألوان المناسبة لبيئة عملك التنفيذية'
                  : 'Customize your executive workspace palette, dark obsidian mode, and accent tones.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
            {lang === 'ar' ? 'سمات الألوان المتاحة' : 'Available Color Schemes'}
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-500'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Color Swatch Stack */}
                    <div className="flex items-center -space-x-1.5 shrink-0">
                      {theme.previewColors.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {lang === 'ar' ? theme.nameAr : theme.nameEn}
                        </span>
                        {theme.isDark && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium flex items-center gap-1">
                            <Moon className="w-2.5 h-2.5" />
                            <span>Dark</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {theme.primaryColor} • {theme.accentColor}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 hover:text-zinc-600 font-semibold px-2 py-1 rounded">
                      Select
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onToggleDark && (
              <button
                onClick={onToggleDark}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                <span>{isDark ? (lang === 'ar' ? 'الوضع النهاري' : 'Light Mode') : (lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode')}</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs shadow-xs"
          >
            {lang === 'ar' ? 'تم' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
