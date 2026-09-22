import { ThemeConfig, ThemeId } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'emerald-gold',
    nameEn: 'Tartibat Emerald & Gold',
    nameAr: 'زمردي وذهبي (هوية ترتيبات)',
    isDark: false,
    primaryColor: '#047857', // emerald-700
    accentColor: '#d97706',  // amber-600
    previewColors: ['#065f46', '#047857', '#d97706', '#fef3c7']
  },
  {
    id: 'obsidian',
    nameEn: 'Executive Obsidian Dark',
    nameAr: 'الأسود الليلي الفاخر (Dark Mode)',
    isDark: true,
    primaryColor: '#10b981', // emerald-500
    accentColor: '#38bdf8',  // sky-400
    previewColors: ['#09090b', '#18181b', '#27272a', '#10b981']
  },
  {
    id: 'royal-indigo',
    nameEn: 'Royal Saudi Indigo & Violet',
    nameAr: 'البنفسجي الملكي والنيلي',
    isDark: false,
    primaryColor: '#4338ca', // indigo-700
    accentColor: '#7c3aed',  // violet-600
    previewColors: ['#312e81', '#4338ca', '#7c3aed', '#ede9fe']
  },
  {
    id: 'classic-slate',
    nameEn: 'Classic Minimal Slate',
    nameAr: 'الرمادي الهادئ الكلاسيكي',
    isDark: false,
    primaryColor: '#18181b', // zinc-900
    accentColor: '#475569',  // slate-600
    previewColors: ['#0f172a', '#334155', '#64748b', '#f1f5f9']
  },
  {
    id: 'warm-sand',
    nameEn: 'Desert Terracotta & Amber',
    nameAr: 'رمل الصحراء والتراكوتا',
    isDark: false,
    primaryColor: '#9a3412', // orange-800
    accentColor: '#b45309',  // amber-700
    previewColors: ['#7c2d12', '#9a3412', '#d97706', '#ffedd5']
  },
  {
    id: 'cyber-teal',
    nameEn: 'Interactive Cyber Cyan',
    nameAr: 'السايبر والتكنولوجيا التفاعلية',
    isDark: false,
    primaryColor: '#0e7490', // cyan-700
    accentColor: '#0284c7',  // sky-600
    previewColors: ['#164e63', '#0891b2', '#06b6d4', '#ecfeff']
  },
  {
    id: 'azure-blue',
    nameEn: 'Al-Bahr Azure Blue',
    nameAr: 'الأزرق البحري والياقوتي',
    isDark: false,
    primaryColor: '#1d4ed8', // blue-700
    accentColor: '#2563eb',  // blue-600
    previewColors: ['#1e3a8a', '#1d4ed8', '#3b82f6', '#dbeafe']
  }
];

export function applyThemeToDocument(themeId: ThemeId, overrideDark?: boolean) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;

  // Set data-theme attribute
  root.setAttribute('data-theme', theme.id);

  // Toggle dark class based on theme or explicit override
  const shouldBeDark = overrideDark !== undefined ? overrideDark : theme.isDark;
  if (shouldBeDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set custom CSS properties
  root.style.setProperty('--theme-primary', theme.primaryColor);
  root.style.setProperty('--theme-accent', theme.accentColor);
}

export const applyThemeToDOM = applyThemeToDocument;

