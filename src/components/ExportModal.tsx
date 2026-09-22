import React, { useState } from 'react';
import { Project, UploadedFile, QuickNote, DocPage, Language, TaskReminder } from '../types';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Code, 
  Printer, 
  Copy, 
  Check, 
  Sparkles,
  Layers,
  Table
} from 'lucide-react';
import { 
  exportAsJson, 
  exportProjectsAsCsv, 
  exportDeliverablesAsCsv, 
  exportAsExcelTsv, 
  exportAsMarkdown, 
  exportAsPrintableHtml, 
  exportAsPlainText 
} from '../utils/exportUtils';
import { getTranslation } from '../utils/i18n';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  docs?: DocPage[];
  files?: UploadedFile[];
  notes?: QuickNote[];
  reminders?: TaskReminder[];
  lang: Language;
}

type ExportType = 'json' | 'csv-projects' | 'csv-tasks' | 'excel' | 'markdown' | 'html-print' | 'txt';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projects,
  docs = [],
  files = [],
  notes = [],
  reminders = [],
  lang,
}) => {

  const [selectedType, setSelectedType] = useState<ExportType>('csv-projects');
  const [copied, setCopied] = useState(false);
  const t = getTranslation(lang);

  if (!isOpen) return null;

  const exportOptions: {
    id: ExportType;
    title: string;
    ext: string;
    badge: string;
    icon: any;
    desc: string;
    iconColor: string;
    bgHover: string;
  }[] = [
    {
      id: 'csv-projects',
      title: lang === 'ar' ? 'ملف CSV للمشاريع (Excel متوافق)' : 'Projects Portfolio (CSV / Excel)',
      ext: '.csv',
      badge: 'CSV / Excel',
      icon: Table,
      desc: lang === 'ar' 
        ? 'تصدير جدول المشاريع بترميز UTF-8 المتوافق مع برامج إكسل العربية بدون أخطاء خطوط.'
        : 'Structured table of all projects, clients, budgets, deadlines, and delivery metrics.',
      iconColor: 'text-emerald-600',
      bgHover: 'hover:border-emerald-300 hover:bg-emerald-50/40'
    },
    {
      id: 'csv-tasks',
      title: lang === 'ar' ? 'ملف CSV للتسليمات والمهام الفردية' : 'All Deliverables & Tasks (CSV)',
      ext: '.csv',
      badge: 'Granular Tasks',
      icon: FileSpreadsheet,
      desc: lang === 'ar'
        ? 'تصدير تفصيلي لكل مهمة ومخرج مع حالة الإنجاز والمؤقت والتاريخ.'
        : 'Detailed export of every individual task item, completion status, and timers.',
      iconColor: 'text-teal-600',
      bgHover: 'hover:border-teal-300 hover:bg-teal-50/40'
    },
    {
      id: 'excel',
      title: lang === 'ar' ? 'جدول بيانات إكسل (TSV)' : 'Microsoft Excel Sheet (.tsv)',
      ext: '.tsv',
      badge: 'Excel Native',
      icon: FileSpreadsheet,
      desc: lang === 'ar'
        ? 'تصدير بصيغة Tab-Separated لفتح فوري وسلس في Microsoft Excel وGoogle Sheets.'
        : 'Tab-delimited format engineered for instant drag-and-drop into MS Excel & Sheets.',
      iconColor: 'text-green-700',
      bgHover: 'hover:border-green-300 hover:bg-green-50/40'
    },
    {
      id: 'html-print',
      title: lang === 'ar' ? 'تقرير تنفيذي مصمم للطباعة وPDF' : 'Executive Printable & PDF Report',
      ext: '.html',
      badge: 'HTML / PDF',
      icon: Printer,
      desc: lang === 'ar'
        ? 'صفحة HTML مستقلة مصممة بأناقة مع زر طباعة مباشر للحفظ كملف PDF رسمي.'
        : 'Standalone elegant executive report ready for direct printing or saving as PDF.',
      iconColor: 'text-indigo-600',
      bgHover: 'hover:border-indigo-300 hover:bg-indigo-50/40'
    },
    {
      id: 'markdown',
      title: lang === 'ar' ? 'تقرير بصيغة Markdown (.md)' : 'Executive Briefing (Markdown .md)',
      ext: '.md',
      badge: 'Markdown',
      icon: FileText,
      desc: lang === 'ar'
        ? 'تنسيق نصوص نظيف مع جداول وقوائم مهام للنشر في Notion أو GitHub أو Slack.'
        : 'Clean markdown documentation with tables and checkboxes for Notion or docs.',
      iconColor: 'text-blue-600',
      bgHover: 'hover:border-blue-300 hover:bg-blue-50/40'
    },
    {
      id: 'json',
      title: lang === 'ar' ? 'نسخة احتياطية كاملة (JSON)' : 'Complete Workspace Backup (JSON)',
      ext: '.json',
      badge: 'Full Backup',
      icon: Code,
      desc: lang === 'ar'
        ? 'تصدير كامل لكافة المشاريع والملاحظات وقواعد البيانات لاستعادتها في أي وقت.'
        : 'Complete schema containing all projects, deliverables, files, and note entries.',
      iconColor: 'text-amber-600',
      bgHover: 'hover:border-amber-300 hover:bg-amber-50/40'
    },
    {
      id: 'txt',
      title: lang === 'ar' ? 'ملخص نصي عادي (TXT)' : 'Plain Text Digest (.txt)',
      ext: '.txt',
      badge: 'Text / WhatsApp',
      icon: FileText,
      desc: lang === 'ar'
        ? 'ملف نصي منسق وبسيط يسهل نسخه وإرساله عبر الواتساب أو البريد الإلكتروني.'
        : 'Plain-text summary optimized for quick email dispatches or WhatsApp updates.',
      iconColor: 'text-zinc-600',
      bgHover: 'hover:border-zinc-300 hover:bg-zinc-50'
    }
  ];

  const handleExecuteExport = () => {
    const today = new Date().toISOString().split('T')[0];
    switch (selectedType) {
      case 'json':
        exportAsJson({ projects, docs, files, notes, lead: 'Mohammed Noor' }, `mohammednoor-workspace-${today}.json`);
        break;
      case 'csv-projects':
        exportProjectsAsCsv(projects, `tartibat-projects-${today}.csv`);
        break;
      case 'csv-tasks':
        exportDeliverablesAsCsv(projects, `tartibat-tasks-${today}.csv`);
        break;
      case 'excel':
        exportAsExcelTsv(projects, `tartibat-portfolio-${today}.tsv`);
        break;
      case 'markdown':
        exportAsMarkdown(projects, `mohammednoor-brief-${today}.md`);
        break;
      case 'html-print':
        exportAsPrintableHtml(projects, `tartibat-executive-report-${today}.html`);
        break;
      case 'txt':
        exportAsPlainText(projects, `tartibat-summary-${today}.txt`);
        break;
    }
    onClose();
  };

  const handleCopyClipboard = () => {
    let textToCopy = '';
    if (selectedType === 'csv-projects') {
      const headers = ['Project', 'Client', 'Status', 'Priority', 'Budget', 'Date'];
      const rows = projects.map(p => [p.name, p.client, p.status, p.priority, p.budget || '—', p.date || '—'].join('\t'));
      textToCopy = [headers.join('\t'), ...rows].join('\n');
    } else if (selectedType === 'json') {
      textToCopy = JSON.stringify({ projects, docs, notes }, null, 2);
    } else {
      textToCopy = `MOHAMMED NOOR LEAD - TARTIBAT PORTFOLIO\n` + 
        projects.map(p => `• ${p.name} (${p.client}) - ${p.status} - Due: ${p.date || 'TBD'}`).join('\n');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {lang === 'ar' ? 'تصدير البيانات بكافة الصيغ' : 'Export Workspace Data (Universal Format)'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {lang === 'ar' 
                  ? 'اختر الصيغة المناسبة لتصدير محفظة مشاريع محمد نور في شركة ترتيبات'
                  : 'Select your preferred format for Excel, CSV, PDF, Markdown, or JSON.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selection List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
            {lang === 'ar' ? 'صيغ التصدير المتاحة' : 'Available Export Formats'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {exportOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedType === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedType(opt.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/30 shadow-xs ring-1 ring-blue-500' 
                      : `border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 ${opt.bgHover}`
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${opt.iconColor}`} />
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {opt.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {opt.ext}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                      {opt.desc}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10.5px]">
                    <span className="text-zinc-400">
                      {projects.length} {lang === 'ar' ? 'مشروع مشمول' : 'projects included'}
                    </span>
                    {isSelected && (
                      <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Includes Arabic UTF-8 BOM encoding</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyClipboard}
              className="flex-1 sm:flex-initial px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'نسخ للحافظة' : 'Copy Content'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleExecuteExport}
              className="flex-1 sm:flex-initial px-5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تحميل الملف الآن' : 'Download File Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
