import React, { useState, useEffect } from 'react';
import { Project, TaskReminder, Language, WhatsAppConfig } from '../types';
import { getTranslation } from '../utils/i18n';
import { 
  generateWhatsAppUrl, 
  saveWhatsAppConfig 
} from '../utils/storageEngine';
import { 
  X, 
  Send, 
  Phone, 
  Check, 
  Copy, 
  Bell, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Sparkles, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WhatsAppConfig;
  onSaveConfig: (cfg: WhatsAppConfig) => void;
  projects: Project[];
  reminders: TaskReminder[];
  targetProject?: Project;
  lang: Language;
  onShowToast: (msg: string) => void;
}

const COUNTRY_CODES = [
  { code: '+966', name: 'Saudi Arabia (المملكة العربية السعودية)', flag: '🇸🇦' },
  { code: '+971', name: 'United Arab Emirates (الإمارات)', flag: '🇦🇪' },
  { code: '+965', name: 'Kuwait (الكويت)', flag: '🇰🇼' },
  { code: '+974', name: 'Qatar (قطر)', flag: '🇶🇦' },
  { code: '+973', name: 'Bahrain (البحرين)', flag: '🇧🇭' },
  { code: '+968', name: 'Oman (عُمان)', flag: '🇴🇲' },
  { code: '+20', name: 'Egypt (مصر)', flag: '🇪🇬' },
  { code: '+44', name: 'United Kingdom (بريطانيا)', flag: '🇬🇧' },
  { code: '+1', name: 'United States & Canada', flag: '🇺🇸' },
];

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  projects,
  reminders,
  targetProject,
  lang,
  onShowToast,
}) => {
  const [phone, setPhone] = useState(config.phoneNumber || '');
  const [countryCode, setCountryCode] = useState(config.countryCode || '+966');
  const [name, setName] = useState(config.recipientName || 'Mohammed Noor');
  const [autoAlerts, setAutoAlerts] = useState(config.autoAlertsEnabled ?? true);
  const [notifyDeadlines, setNotifyDeadlines] = useState(config.notifyOnDeadlines ?? true);
  const [notifyHighPriority, setNotifyHighPriority] = useState(config.notifyOnHighPriority ?? true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(targetProject?.id || projects[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [customNotes, setCustomNotes] = useState('');

  useEffect(() => {
    if (targetProject) {
      setSelectedProjectId(targetProject.id);
    }
  }, [targetProject]);

  if (!isOpen) return null;

  const t = getTranslation(lang);
  const activeProjects = projects.filter(p => p.status !== 'Completed');
  const urgentReminders = reminders.filter(r => !r.isCompleted);
  const currentSelectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Compose Executive Portfolio Brief
  const composeExecutiveBrief = (): string => {
    const dateStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      timeZone: 'Asia/Riyadh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const highPriorityList = activeProjects.filter(p => p.priority === 'High');

    return `*🇸🇦 TARTIBAT EXECUTIVE PORTFOLIO BRIEFING*
━━━━━━━━━━━━━━━━━━━━
📅 *Date:* ${dateStr} (${timeStr} Riyadh AST)
👤 *Lead Officer:* ${name}

📊 *PORTFOLIO SUMMARY:*
• Active Projects in Flight: *${activeProjects.length}*
• High-Priority Deliverables: *${highPriorityList.length}*
• Pending Alarms & Reminders: *${urgentReminders.length}*

🎯 *CRITICAL MILESTONES & LEADS:*
${activeProjects.slice(0, 4).map((p, idx) => `${idx + 1}. *${p.name}* (${p.client})
   ↳ Status: ${p.status} | Priority: ${p.priority} | Budget: ${p.budget || 'Confidential'}`).join('\n')}

${urgentReminders.length > 0 ? `⏰ *URGENT SCHEDULED REMINDERS:*
${urgentReminders.slice(0, 3).map(r => `• *${r.taskTitle}* (${r.projectName}) - Due: ${new Date(r.dueDateTime).toLocaleString()}`).join('\n')}` : '✅ All scheduled milestones are up to date.'}

${customNotes ? `📝 *EXECUTIVE DIRECTIVE:*
${customNotes}\n` : ''}
🔗 *Live Workspace:* https://ais-pre-ptj7dcxxfd2mjp3kqddl7i-747659717051.europe-west2.run.app
━━━━━━━━━━━━━━━━━━━━
_Sent securely via Tartibat Executive Dispatcher_`;
  };

  // Compose Specific Project Alert
  const composeProjectAlert = (project: Project): string => {
    const deliverablesSummary = project.deliverables 
      ? `\n*Deliverables:* (${project.deliverables.filter(d => d.completed).length}/${project.deliverables.length} done)\n` +
        project.deliverables.map(d => ` [${d.completed ? '✓' : ' '}] ${d.text}`).join('\n')
      : '';

    return `*🚨 TARTIBAT PROJECT ALERT: ${project.name.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━
🏢 *Client:* ${project.client}
🚦 *Status:* ${project.status}
⚡ *Priority:* ${project.priority}
💰 *Budget:* ${project.budget || 'N/A'}
👤 *Lead:* ${project.lead || name}
${project.notes ? `\n📋 *Operational Notes:* ${project.notes}` : ''}
${deliverablesSummary}
${customNotes ? `\n📝 *Custom Update:* ${customNotes}` : ''}

🔗 *Review Live:* https://ais-pre-ptj7dcxxfd2mjp3kqddl7i-747659717051.europe-west2.run.app
_Tartibat Senior Production Team_`;
  };

  const handleSavePreferences = () => {
    const updated: WhatsAppConfig = {
      phoneNumber: phone,
      countryCode,
      recipientName: name,
      autoAlertsEnabled: autoAlerts,
      notifyOnDeadlines: notifyDeadlines,
      notifyOnHighPriority: notifyHighPriority,
      notifyOnStatusChange: true,
      dailyBriefEnabled: true,
      lastSentAt: new Date().toISOString(),
    };
    onSaveConfig(updated);
    saveWhatsAppConfig(updated);
    onShowToast(lang === 'ar' ? 'تم حفظ إعدادات واتساب بنجاح' : 'WhatsApp alert settings saved');
  };

  const handleDispatchBrief = () => {
    handleSavePreferences();
    const msg = composeExecutiveBrief();
    const url = generateWhatsAppUrl(countryCode, phone, msg);
    window.open(url, '_blank');
    onShowToast(lang === 'ar' ? 'جارٍ فتح واتساب لإرسال التقرير' : 'Opening WhatsApp to dispatch briefing');
  };

  const handleDispatchProject = () => {
    if (!currentSelectedProject) return;
    handleSavePreferences();
    const msg = composeProjectAlert(currentSelectedProject);
    const url = generateWhatsAppUrl(countryCode, phone, msg);
    window.open(url, '_blank');
    onShowToast(lang === 'ar' ? `جارٍ إرسال تحديث ${currentSelectedProject.name}` : `Opening WhatsApp for ${currentSelectedProject.name}`);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast(lang === 'ar' ? 'تم نسخ نص الرسالة للحافظة' : 'Message text copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>WhatsApp Notification Center</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {lang === 'ar' ? 'إرسال تحديثات وتنبيهات المشاريع عبر واتساب' : 'Dispatch Project Updates & Alerts to WhatsApp'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Phone Number & Identity Setup */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl p-4 border border-zinc-200/70 dark:border-zinc-700/70 space-y-3">
            <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'ar' ? 'رقم الهاتف لاستلام التحديثات' : 'Mobile Number for Instant Updates'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Country Code */}
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  {lang === 'ar' ? 'رمز الدولة' : 'Country Code'}
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {c.name.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Input */}
              <div className="sm:col-span-7">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  {lang === 'ar' ? 'رقم الواتساب (مثال: 501234567)' : 'WhatsApp Number (e.g. 501234567)'}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="50 123 4567"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Recipient Name */}
              <div className="sm:col-span-12">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  {lang === 'ar' ? 'اسم المستلم / المسؤول' : 'Lead Officer / Recipient Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mohammed Noor - Senior Lead"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Notification Checkboxes */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex flex-wrap items-center gap-4 text-[11px] text-zinc-600 dark:text-zinc-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyHighPriority}
                  onChange={(e) => setNotifyHighPriority(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{lang === 'ar' ? 'تنبيهات المشاريع العاجلة' : 'High-Priority Alerts'}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDeadlines}
                  onChange={(e) => setNotifyDeadlines(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{lang === 'ar' ? 'تذكيرات المواعيد النهائية' : 'Deadline Reminders'}</span>
              </label>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Action 1: Full Executive Brief */}
            <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'ar' ? 'موجز المحفظة الشامل' : 'Full Executive Portfolio Brief'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                    Live Status
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {lang === 'ar'
                    ? 'إرسال ملخص فوري لجميع المشاريع النشطة والمواعيد الحرجة في تقرير منسق لواتساب.'
                    : 'Dispatch a formatted snapshot of all active projects, budgets, and urgent deadlines.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDispatchBrief}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إرسال الموجز للواتساب' : 'Send Brief to WhatsApp'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(composeExecutiveBrief())}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100"
                  title="Copy formatted brief text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action 2: Selected Project Status Alert */}
            <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>{lang === 'ar' ? 'تحديث مشروع محدد' : 'Individual Project Alert'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    Lead Specific
                  </span>
                </div>

                <div className="mt-2">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.client}) - {p.priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDispatchProject}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إرسال تحديث المشروع' : 'Send Project Alert'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => currentSelectedProject && handleCopyMessage(composeProjectAlert(currentSelectedProject))}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100"
                  title="Copy project alert text"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Optional Direct Note */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
              {lang === 'ar' ? 'ملاحظة إضافية أو توجيه خاص بالرسالة (اختياري)' : 'Custom Executive Directive / Note to Append (Optional)'}
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g., Please review staging mockups before 4 PM meeting."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Security & Protocol Notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 text-[11px] text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {lang === 'ar'
                ? 'يتم إرسال الرسائل عبر بروتوكول واتساب المباشر الرسمي (WhatsApp Web / Mobile App) مباشرة دون وسيط خارجي لضمان الخصوصية وسرعة التسليم.'
                : 'Alerts are dispatched via official direct WhatsApp protocols (WhatsApp Web / Native App) with zero third-party data interception.'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {lang === 'ar' ? 'حفظ كرقم مفضل' : 'Save as Default Contact'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
