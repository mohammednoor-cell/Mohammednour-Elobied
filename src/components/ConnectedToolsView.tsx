import React, { useState } from 'react';
import { Project, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import { 
  Presentation, 
  FileSpreadsheet, 
  FileText, 
  HardDrive, 
  Bot, 
  ExternalLink, 
  Plus, 
  Check, 
  Link2, 
  Sparkles,
  Layers,
  Copy
} from 'lucide-react';

interface ConnectedToolsViewProps {
  projects: Project[];
  onUpdateProjectNotes: (projectId: string, notes: string) => void;
  lang: Language;
}

interface ExternalToolLink {
  id: string;
  name: string;
  category: 'google' | 'ai';
  service: 'slides' | 'docs' | 'sheets' | 'drive' | 'chatgpt';
  url: string;
  description: string;
  badge: string;
  iconBg: string;
  templateUrl?: string;
  templateLabel?: string;
}

export const ConnectedToolsView: React.FC<ConnectedToolsViewProps> = ({
  projects,
  onUpdateProjectNotes,
  lang,
}) => {
  const t = getTranslation(lang);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [customDocUrl, setCustomDocUrl] = useState('');
  const [linkedSuccess, setLinkedSuccess] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const tools: ExternalToolLink[] = [
    {
      id: 'g-slides',
      name: t.googlePpt,
      category: 'google',
      service: 'slides',
      url: 'https://slides.google.com/create',
      description: lang === 'ar' 
        ? 'إنشاء عروض تقديمية تفاعلية للفعاليات، منصات كبار الشخصيات، ومخططات الإنتاج البصري.'
        : 'Create and collaborate on Saudi experiential pitch decks, keynote master slides, and stage visual walkthroughs.',
      badge: 'Google Slides / PPT',
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
      templateLabel: lang === 'ar' ? 'فتح عرض تقديمي جديد' : 'New Presentation'
    },
    {
      id: 'g-sheets',
      name: t.googleExcel,
      category: 'google',
      service: 'sheets',
      url: 'https://sheets.google.com/create',
      description: lang === 'ar'
        ? 'نمذجة ميزانيات الفعاليات التفصيلية، تكاليف المقاولين ومعدات الإضاءة والصوتيات وجداول المواعيد.'
        : 'Model itemized event budgets, contractor pricing, AV equipment matrices, and timeline Gantt schedules.',
      badge: 'Google Sheets / Excel',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      templateLabel: lang === 'ar' ? 'فتح جدول ميزانية جديد' : 'New Budget Sheet'
    },
    {
      id: 'g-docs',
      name: t.googleWord,
      category: 'google',
      service: 'docs',
      url: 'https://docs.google.com/create',
      description: lang === 'ar'
        ? 'صياغة نطاق العمل (SOW)، خطابات القيادات، عقود التوريد وبروتوكولات استقبال كبار الشخصيات.'
        : 'Draft client Statements of Work (SOW), executive speeches, vendor contracts, and VIP protocol agendas.',
      badge: 'Google Docs / Word',
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
      templateLabel: lang === 'ar' ? 'فتح مستند رسمي جديد' : 'New Document'
    },
    {
      id: 'g-drive',
      name: t.googleDrive,
      category: 'google',
      service: 'drive',
      url: 'https://drive.google.com',
      description: lang === 'ar'
        ? 'المستودع السحابي الموحد للتصاميم ثلاثية الأبعاد (3D Renders)، ملفات الفيديو والموافقات الرسمية.'
        : 'Unified cloud repository for high-resolution 3D renders, video master files, and confidential government approvals.',
      badge: 'Google Drive',
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
      templateLabel: lang === 'ar' ? 'فتح مجلد السحابة' : 'Open Drive'
    },
    {
      id: 'ai-chatgpt',
      name: t.chatGptLink,
      category: 'ai',
      service: 'chatgpt',
      url: 'https://chatgpt.com',
      description: lang === 'ar'
        ? 'بدء جلسة عمل فورية مع ChatGPT لتوليد الأفكار الاستراتيجية أو مراجعة متطلبات الفعالية.'
        : 'Launch ChatGPT session with pre-configured Tartibat strategic prompts or cross-verify AI outputs.',
      badge: 'ChatGPT / OpenAI',
      iconBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      templateLabel: lang === 'ar' ? 'فتح شات جي بي تي' : 'Open ChatGPT'
    },
  ];

  const executivePrompts = [
    {
      id: 'prompt-1',
      title: lang === 'ar' ? 'مراجعة الميزانية ومخاطر الموردين' : 'Event Budget & Vendor Risk Audit',
      prompt: `Act as a senior Saudi event production director. Review an experiential event budget of SAR 1,450,000 in Riyadh. Identify the top 5 cost-overrun risks for custom sensory fabrication, AV LED screen rigging, and VIP protocol security, and recommend mitigation strategies.`
    },
    {
      id: 'prompt-2',
      title: lang === 'ar' ? 'صياغة بروتوكول كبار الشخصيات' : 'VIP Protocol & Escort Run-of-Show',
      prompt: `Create a minute-by-minute Run of Show (ROS) for a Royal and Ministerial VIP delegation arriving at a high-level technology summit in Riyadh Front. Include accreditation checkpoints, sensory entrance walkthrough, opening keynote timing, and media staging.`
    }
  ];

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const handleLinkDocToProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !customDocUrl.trim()) return;

    const targetProject = projects.find(p => p.id === selectedProjectId);
    if (!targetProject) return;

    const title = customDocTitle.trim() || 'Connected Cloud Document';
    const linkNote = `\n\n[Connected Asset]: ${title} -> ${customDocUrl.trim()}`;
    const newNotes = (targetProject.notes || '') + linkNote;

    onUpdateProjectNotes(selectedProjectId, newNotes);
    setLinkedSuccess(true);
    setCustomDocTitle('');
    setCustomDocUrl('');
    setTimeout(() => setLinkedSuccess(false), 2500);
  };

  const getServiceIcon = (service: ExternalToolLink['service']) => {
    switch (service) {
      case 'slides':
        return <Presentation className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'sheets':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'docs':
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'drive':
        return <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'chatgpt':
        return <Bot className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Connected Ecosystem
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {t.integrationsTitle}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5">
            {t.integrationsDesc}
          </p>
        </div>
      </div>

      {/* Primary Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700 flex items-center justify-center">
                  {getServiceIcon(tool.service)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {tool.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{tool.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                  {tool.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{t.connected}</span>
              </span>

              <a
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-colors"
              >
                <span>{tool.templateLabel || t.launchApp}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ChatGPT Executive Prompt Bridge */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              <span>ChatGPT Tartibat Strategy Prompts</span>
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
              {lang === 'ar' ? 'نماذج استفسارات احترافية جاهزة للنسخ إلى ChatGPT' : 'Pre-Engineered Prompts for ChatGPT & AI Workflows'}
            </h2>
          </div>
          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>chatgpt.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {executivePrompts.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                  {item.title}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-3 font-mono bg-white/60 dark:bg-zinc-900/60 p-2 rounded-lg border border-zinc-200/40 dark:border-zinc-700/40">
                  {item.prompt}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(item.id, item.prompt)}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  {copiedPromptId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'نسخ الاستفسار' : 'Copy Prompt'}</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://chatgpt.com/?q=${encodeURIComponent(item.prompt)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Launch with Prompt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link External Document or Spreadsheet Directly to a Tartibat Project */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs space-y-4">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            <span>Document Link Bridge</span>
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
            {lang === 'ar' ? 'ربط مستند جوجل أو شات جي بي تي مباشرة بمشروع محدد' : 'Attach Google Sheet, Slide, or ChatGPT Workspace to a Project'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {lang === 'ar'
              ? 'احفظ روابط مستندات جوجل أو جلسات ChatGPT مباشرة داخل سجل المشروع للوصول السريع إليها بنقرة واحدة.'
              : 'Save live Google URLs or ChatGPT thread URLs directly onto project records for your team to open with one click.'}
          </p>
        </div>

        <form onSubmit={handleLinkDocToProject} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-4">
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {lang === 'ar' ? 'المشروع المستهدف' : 'Target Project'}
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-zinc-900">
                  {p.name} ({p.client})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {lang === 'ar' ? 'اسم المستند' : 'Document Label'}
            </label>
            <input
              type="text"
              placeholder="e.g. Master Financial Sheet"
              value={customDocTitle}
              onChange={(e) => setCustomDocTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {lang === 'ar' ? 'رابط جوجل أو شات جي بي تي' : 'Google / ChatGPT URL'}
            </label>
            <input
              type="url"
              required
              placeholder="https://docs.google.com/..."
              value={customDocUrl}
              onChange={(e) => setCustomDocUrl(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs"
            >
              {linkedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>{lang === 'ar' ? 'تم الربط!' : 'Linked!'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إرفاق الرابط' : 'Attach Link'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

