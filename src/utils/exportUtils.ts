import { Project, UploadedFile, QuickNote, DocPage } from '../types';

interface ExportBundle {
  projects: Project[];
  docs?: DocPage[];
  files?: UploadedFile[];
  notes?: QuickNote[];
  lead?: string;
  lang?: string;
}

// Helper to trigger browser download
export function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. JSON Export
export function exportAsJson(bundle: ExportBundle, filename = 'mohammednoor-lead-workspace.json') {
  const data = {
    workspace: 'Mohammed Noor Lead - Tartibat Experiential Management',
    version: '2.5.0',
    exportedAt: new Date().toISOString(),
    lead: bundle.lead || 'Mohammed Noor',
    ...bundle
  };
  triggerDownload(JSON.stringify(data, null, 2), filename, 'application/json');
}

// 2. CSV - Projects Portfolio
export function exportProjectsAsCsv(projects: Project[], filename = 'tartibat-projects-portfolio.csv') {
  const headers = ['ID', 'Project Name', 'Client', 'Category', 'Status', 'Priority', 'Deadline', 'Budget', 'Total Tasks', 'Completed Tasks', 'Completion %', 'Notes'];
  
  const rows = projects.map(p => {
    const total = p.deliverables?.length || 0;
    const completed = p.deliverables?.filter(d => d.completed).length || 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return [
      `"${p.id}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.client || '').replace(/"/g, '""')}"`,
      `"${(p.category || 'General').replace(/"/g, '""')}"`,
      `"${p.status}"`,
      `"${p.priority}"`,
      `"${p.date || 'N/A'}"`,
      `"${(p.budget || 'N/A').replace(/"/g, '""')}"`,
      total,
      completed,
      `"${pct}%"`,
      `"${(p.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ].join(',');
  });

  // Include UTF-8 BOM so Excel opens Arabic properly without mojibake
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

// 3. CSV - Granular Deliverables & Tasks
export function exportDeliverablesAsCsv(projects: Project[], filename = 'tartibat-tasks-deliverables.csv') {
  const headers = ['Project Name', 'Client', 'Task ID', 'Deliverable / Task Text', 'Status', 'Completed', 'Due Date', 'Timer (Sec)', 'Project Status', 'Priority'];
  
  const rows: string[] = [];
  projects.forEach(p => {
    (p.deliverables || []).forEach(d => {
      rows.push([
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.client || '').replace(/"/g, '""')}"`,
        `"${d.id}"`,
        `"${(d.text || '').replace(/"/g, '""')}"`,
        `"${d.completed ? 'Completed' : 'Pending'}"`,
        `"${d.completed ? 'YES' : 'NO'}"`,
        `"${d.dueDate || p.date || 'N/A'}"`,
        d.timerSeconds || 0,
        `"${p.status}"`,
        `"${p.priority}"`
      ].join(','));
    });
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

// 4. TSV / Excel Spreadsheet
export function exportAsExcelTsv(projects: Project[], filename = 'tartibat-portfolio-excel.tsv') {
  const headers = ['Project Name', 'Client', 'Category', 'Status', 'Priority', 'Target Date', 'Budget (SAR)', 'Tasks Done', 'Total Tasks', 'Notes'];
  const rows = projects.map(p => {
    const total = p.deliverables?.length || 0;
    const completed = p.deliverables?.filter(d => d.completed).length || 0;
    return [
      p.name,
      p.client,
      p.category || 'Experiential',
      p.status,
      p.priority,
      p.date || 'TBD',
      p.budget || 'TBD',
      completed,
      total,
      (p.notes || '').replace(/[\t\r\n]/g, ' ')
    ].join('\t');
  });

  const content = '\uFEFF' + [headers.join('\t'), ...rows].join('\r\n');
  triggerDownload(content, filename, 'text/tab-separated-values;charset=utf-8;');
}

// 5. Markdown Summary Report
export function exportAsMarkdown(projects: Project[], filename = 'mohammednoor-lead-portfolio.md') {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const total = projects.length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const highPriority = projects.filter(p => p.priority === 'High').length;

  let md = `# Mohammed Noor | Lead Portfolio Executive Summary
**Organization:** Tartibat Experiential Management  
**Date of Report:** ${dateStr}  
**Lead:** Mohammed Noor  

---

## Executive Portfolio KPIs
- **Total Portfolio Engagements:** ${total}
- **Active / In Progress:** ${inProgress}
- **Successfully Completed:** ${completed}
- **High Priority / Critical:** ${highPriority}

---

## Projects Breakdown

| Project Name | Client | Status | Priority | Due Date | Budget | Deliverables |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

  projects.forEach(p => {
    const delivTotal = p.deliverables?.length || 0;
    const delivDone = p.deliverables?.filter(d => d.completed).length || 0;
    md += `| **${p.name}** | ${p.client} | \`${p.status}\` | **${p.priority}** | ${p.date || 'TBD'} | ${p.budget || 'TBD'} | ${delivDone}/${delivTotal} |\n`;
  });

  md += `\n---\n\n## Action Items & Deliverables Checklist\n\n`;

  projects.forEach(p => {
    md += `### ${p.name} (${p.client})\n`;
    if (p.notes) md += `> *${p.notes}*\n\n`;
    if (p.deliverables && p.deliverables.length > 0) {
      p.deliverables.forEach(d => {
        md += `- [${d.completed ? 'x' : ' '}] ${d.text}\n`;
      });
    } else {
      md += `*No deliverables specified.*\n`;
    }
    md += `\n`;
  });

  md += `\n*Generated by Mohammed Noor Lead Executive System • Tartibat*\n`;
  triggerDownload(md, filename, 'text/markdown;charset=utf-8;');
}

// 6. Styled HTML / PDF-Ready Report
export function exportAsPrintableHtml(projects: Project[], filename = 'tartibat-executive-report.html') {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const total = projects.length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const inProgress = projects.filter(p => p.status === 'In Progress').length;
  const high = projects.filter(p => p.priority === 'High').length;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tartibat Executive Report - Mohammed Noor</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 40px auto;
      max-width: 960px;
      color: #18181b;
      line-height: 1.5;
      background: #ffffff;
      padding: 0 20px;
    }
    .header {
      border-bottom: 2px solid #e4e4e7;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      background: #047857;
      color: #fff;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .kpi-card {
      border: 1px solid #e4e4e7;
      border-radius: 10px;
      padding: 16px;
      background: #fafafa;
    }
    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      color: #09090b;
      margin-top: 5px;
    }
    .kpi-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #71717a;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 35px;
      font-size: 13px;
    }
    th {
      background: #f4f4f5;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #d4d4d8;
      font-weight: 700;
      color: #3f3f46;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e4e4e7;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
    }
    .task-list {
      list-style: none;
      padding-left: 0;
      margin: 10px 0;
    }
    .task-list li {
      padding: 4px 0;
      font-size: 13px;
    }
    .task-list li.done {
      color: #71717a;
      text-decoration: line-through;
    }
    .print-btn {
      background: #18181b;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    @media print {
      .no-print { display: none; }
      body { margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 20px;">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="header">
    <div>
      <span class="badge">Tartibat Experiential</span>
      <h1 style="margin: 8px 0 4px; font-size: 26px;">Mohammed Noor | Portfolio Executive Report</h1>
      <p style="margin: 0; color: #71717a; font-size: 13px;">High-stakes national events, VIP protocol, and brand experiences.</p>
    </div>
    <div style="text-align: right; color: #71717a; font-size: 12px;">
      <div><strong>Date:</strong> ${dateStr}</div>
      <div><strong>Lead:</strong> Mohammed Noor</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Active Engagements</div>
      <div class="kpi-value">${total - completed}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">In Progress</div>
      <div class="kpi-value">${inProgress}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">High Priority</div>
      <div class="kpi-value" style="color: #b91c1c;">${high}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Completed Works</div>
      <div class="kpi-value" style="color: #047857;">${completed}</div>
    </div>
  </div>

  <h2>Engagements & Portfolio Table</h2>
  <table>
    <thead>
      <tr>
        <th>Project Name</th>
        <th>Client</th>
        <th>Status</th>
        <th>Priority</th>
        <th>Deadline</th>
        <th>Budget (SAR)</th>
        <th>Tasks</th>
      </tr>
    </thead>
    <tbody>
      ${projects.map(p => {
        const totalTasks = p.deliverables?.length || 0;
        const doneTasks = p.deliverables?.filter(d => d.completed).length || 0;
        return `<tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.client}</td>
          <td><span class="status-badge">${p.status}</span></td>
          <td>${p.priority}</td>
          <td>${p.date || 'N/A'}</td>
          <td>${p.budget || 'N/A'}</td>
          <td>${doneTasks}/${totalTasks}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <h2>Project Deliverables & Milestones</h2>
  ${projects.map(p => `
    <div style="margin-bottom: 24px; border-left: 3px solid #047857; padding-left: 14px;">
      <h3 style="margin: 0 0 4px; font-size: 16px;">${p.name} <span style="font-weight: normal; color: #71717a; font-size: 13px;">(${p.client})</span></h3>
      <p style="margin: 0 0 8px; color: #52525b; font-size: 12px;">${p.notes || ''}</p>
      <ul class="task-list">
        ${(p.deliverables || []).map(d => `
          <li class="${d.completed ? 'done' : ''}">
            ${d.completed ? '&#9989;' : '&#9744;'} ${d.text}
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('')}

  <div style="margin-top: 50px; border-top: 1px solid #e4e4e7; padding-top: 15px; font-size: 11px; color: #a1a1aa; text-align: center;">
    Confidential Tartibat Internal Report • Mohammed Noor Executive Leadership • Generated on ${dateStr}
  </div>
</body>
</html>`;

  triggerDownload(html, filename, 'text/html;charset=utf-8;');
}

// 7. Plain Text Export
export function exportAsPlainText(projects: Project[], filename = 'tartibat-portfolio.txt') {
  let txt = `========================================================\nMOHAMMED NOOR LEAD - TARTIBAT EXPERIENTIAL PORTFOLIO\nExport Date: ${new Date().toISOString()}\n========================================================\n\n`;

  projects.forEach((p, idx) => {
    const total = p.deliverables?.length || 0;
    const done = p.deliverables?.filter(d => d.completed).length || 0;
    txt += `[${idx + 1}] ${p.name.toUpperCase()}\n`;
    txt += `Client: ${p.client}\n`;
    txt += `Status: ${p.status} | Priority: ${p.priority} | Date: ${p.date || 'TBD'} | Budget: ${p.budget || 'TBD'}\n`;
    if (p.notes) txt += `Notes: ${p.notes}\n`;
    txt += `Deliverables (${done}/${total}):\n`;
    (p.deliverables || []).forEach(d => {
      txt += `  - [${d.completed ? 'DONE' : 'OPEN'}] ${d.text}\n`;
    });
    txt += `\n--------------------------------------------------------\n\n`;
  });

  triggerDownload(txt, filename, 'text/plain;charset=utf-8;');
}
