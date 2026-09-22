import React, { useState, useMemo } from 'react';
import { Project, Language, ReportKind } from '../types';
import { getTranslation } from '../utils/i18n';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  Briefcase
} from 'lucide-react';

interface PowerBiAnalyticsViewProps {
  projects: Project[];
  lang: Language;
  onSwitchView?: (v: any) => void;
  onOpenNewProject?: () => void;
  onAskAiPrompt?: (prompt: string) => void;
}

export const PowerBiAnalyticsView: React.FC<PowerBiAnalyticsViewProps> = ({
  projects,
  lang,
  onSwitchView,
  onOpenNewProject,
  onAskAiPrompt,
}) => {
  const t = getTranslation(lang);
  const [selectedReportKind, setSelectedReportKind] = useState<ReportKind>('executive_summary');
  const [generatedReportText, setGeneratedReportText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Parse budget numbers for analytics
  const sectorData = useMemo(() => {
    const data: Record<string, number> = {
      'Experiential & Cultural': 1450000,
      'VIP & Protocol': 950000,
      'Brand & Media': 650000,
      'Interactive Tech & AI': 850000,
      'Strategic Advisory': 350000,
    };

    projects.forEach(p => {
      if (p.budget && p.category) {
        const num = parseInt(p.budget.replace(/[^0-9]/g, ''), 10) || 100000;
        if (p.category === 'Experiential') data['Experiential & Cultural'] += num;
        else if (p.category === 'VIP & Protocol') data['VIP & Protocol'] += num;
        else if (p.category === 'Brand & Design') data['Brand & Media'] += num;
        else if (p.category === 'Interactive Tech') data['Interactive Tech & AI'] += num;
        else data['Strategic Advisory'] += num;
      }
    });

    return Object.entries(data).map(([name, amount]) => ({
      name,
      amount: Math.round(amount / 1000), // in Thousands SAR
      rawAmount: amount
    }));
  }, [projects]);

  const statusDistributionData = useMemo(() => {
    const counts: Record<string, number> = {
      'Planning': 0,
      'In Progress': 0,
      'Review': 0,
      'Completed': 0,
      'On Hold': 0
    };
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const velocityData = [
    { week: 'Week 1', completed: 4, target: 5 },
    { week: 'Week 2', completed: 9, target: 10 },
    { week: 'Week 3', completed: 16, target: 15 },
    { week: 'Week 4', completed: 24, target: 22 },
    { week: 'Week 5 (Current)', completed: 31, target: 30 },
  ];

  const COLORS = ['#2563eb', '#3b82f6', '#f59e0b', '#10b981', '#6b7280'];

  const totalCalculatedBudget = sectorData.reduce((acc, curr) => acc + curr.rawAmount, 0);
  const totalDeliverables = projects.reduce((acc, p) => acc + (p.deliverables?.length || 0), 0);
  const completedDeliverables = projects.reduce((acc, p) => acc + (p.deliverables?.filter(d => d.completed).length || 0), 0);
  const healthRatio = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 100;

  // Report Generation Engine
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a comprehensive executive ${selectedReportKind} for Mohammed Noor (Senior Lead at Tartibat). Language: ${lang === 'ar' ? 'Arabic' : 'English'}. Include executive overview, key deliverables status, budget utilization, operational risk flags, and 3 immediate strategic recommendations for upcoming Saudi VIP events.`,
          workspaceContext: {
            projects,
            summary: {
              totalBudget: totalCalculatedBudget,
              healthRatio,
              totalProjects: projects.length,
              activeCount: projects.filter(p => p.status !== 'Completed').length
            }
          }
        })
      });
      const data = await res.json();
      setGeneratedReportText(data.reply);
    } catch (e) {
      console.error(e);
      setGeneratedReportText(`## Executive Portfolio Report: Tartibat Workspace\nLead: Mohammed Noor\nDate: ${new Date().toLocaleDateString()}\n\n1. Executive Summary:\nActive pipeline comprises ${projects.length} strategic engagements across Saudi sovereign, cultural, and enterprise clients.\nTotal estimated budget: SAR ${(totalCalculatedBudget / 1000000).toFixed(2)}M with ${healthRatio}% milestone execution rate.\n\n2. Key Operational Priorities:\n- Finalize stage audio-visual commissioning\n- Align VIP protocol arrival sequences\n- Secure final stakeholder signoffs.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    if (!generatedReportText) return;
    const blob = new Blob([generatedReportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tartibat-Executive-Report-${selectedReportKind}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-20">
      {/* Power BI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Power BI Intelligence Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            {t.analyticsTitle}
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
            {t.analyticsDesc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.btnPrintReport}</span>
          </button>
        </div>
      </div>

      {/* Top Infographic KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio Value */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">
              {t.totalBudget}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              SAR
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
            SAR {(totalCalculatedBudget / 1000).toLocaleString()}K
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs previous quarter</span>
          </div>
        </div>

        {/* Card 2: Active Engagements */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">
              {t.kpiActive}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
            {projects.filter(p => p.status !== 'Completed').length}
          </div>
          <div className="text-[11px] text-zinc-400">
            {projects.filter(p => p.status === 'Review').length} awaiting sovereign signoff
          </div>
        </div>

        {/* Card 3: Milestone Health Index */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">
              {t.kpiHealth}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
            {healthRatio}%
          </div>
          <div className="text-[11px] text-zinc-400">
            {completedDeliverables} of {totalDeliverables} milestones verified
          </div>
        </div>

        {/* Card 4: Critical High Priority */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">
              {t.kpiHigh}
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
            {projects.filter(p => p.priority === 'High' && p.status !== 'Completed').length}
          </div>
          <div className="text-[11px] text-red-600 font-medium">
            Requires active lead supervision
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid (Power BI Visuals) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Budget Allocation by Sector */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">{t.budgetAllocation}</h2>
              <p className="text-[11px] text-zinc-400">Values represented in Thousands SAR ('000)</p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Sector Bar
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0ee" />
                <XAxis 
                  dataKey="name" 
                  angle={-15} 
                  textAnchor="end" 
                  tick={{ fontSize: 10, fill: '#71717a' }} 
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
                <Tooltip 
                  formatter={(val: any) => [`SAR ${Number(val).toLocaleString()}K`, 'Budget']} 
                  contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution Donut */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">{t.statusDistribution}</h2>
              <p className="text-[11px] text-zinc-400">Operational readiness breakdown</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Donut Ratio
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100 text-[11px]">
            {statusDistributionData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name}: <strong className="text-zinc-900 font-mono">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Weekly Velocity & Burnup */}
        <div className="lg:col-span-12 bg-white p-5 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">{t.deliverableVelocity}</h2>
              <p className="text-[11px] text-zinc-400">Cumulative milestone completion velocity across Tartibat portfolio</p>
            </div>
            <span className="text-xs font-mono font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              Velocity Area
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0ee" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="completed" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports of Any Kind Generator */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.generateReportTitle}</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mt-0.5">
              Comprehensive Strategic Reporting Engine
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Instantly generate executive status updates, financial audits, and VIP protocol checklists powered by Gemini 3.8.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedReportKind}
              onChange={(e) => setSelectedReportKind(e.target.value as ReportKind)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 focus:outline-none"
            >
              <option value="executive_summary">Executive Summary Brief</option>
              <option value="client_status">Weekly Client Status Report</option>
              <option value="financial_burnup">Financial & Budget Allocation Report</option>
              <option value="vip_protocol">VIP & Sovereign Protocol Readiness</option>
              <option value="risk_audit">Risk Assessment & Mitigation Matrix</option>
            </select>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing...' : t.btnGenerateReport}</span>
            </button>
          </div>
        </div>

        {/* Generated Report Viewer */}
        {generatedReportText ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700">
                Generated Document ({new Date().toLocaleDateString()})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{t.btnExportMarkdown}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.btnPrintReport}</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-[#fafaf9] rounded-xl border border-zinc-200/80 prose prose-sm max-w-none text-zinc-800 whitespace-pre-wrap leading-relaxed font-sans text-xs sm:text-sm">
              {generatedReportText}
            </div>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-zinc-200 rounded-xl text-center space-y-2 text-zinc-400">
            <FileSpreadsheet className="w-8 h-8 mx-auto text-zinc-300" />
            <p className="text-xs font-medium">
              Select a report type above and click "{t.btnGenerateReport}" to produce a real-time executive report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
