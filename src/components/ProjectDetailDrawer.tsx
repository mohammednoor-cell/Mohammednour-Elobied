import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { 
  X, 
  Calendar, 
  Sparkles, 
  CheckSquare, 
  Edit3, 
  Copy, 
  Check, 
  Layers, 
  AlertCircle,
  Briefcase,
  MessageSquare
} from 'lucide-react';

interface ProjectDetailDrawerProps {
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onToggleDeliverable: (projectId: string, deliverableId: string) => void;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => void;
  onSendToWhatsApp?: (project: Project) => void;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  project,
  onClose,
  onEdit,
  onToggleDeliverable,
  onUpdateStatus,
  onSendToWhatsApp,
}) => {
  const [brief, setBrief] = useState<string | null>(null);
  const [isLoadingBrief, setIsLoadingBrief] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  if (!project) return null;

  const handleGenerateBrief = async () => {
    setIsLoadingBrief(true);
    try {
      const res = await fetch('/api/ai/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.name,
          client: project.client,
          notes: project.notes,
          context: `Category: ${project.category || 'Experiential'}, Priority: ${project.priority}, Deadline: ${project.date || 'TBD'}`
        })
      });
      const data = await res.json();
      if (data.brief) {
        setBrief(data.brief);
      }
    } catch (e) {
      console.error(e);
      setBrief(`Executive Brief for ${project.name}: Deliver high-caliber execution for ${project.client}. Key focus is stakeholder alignment, timely vendor commissioning, and rehearsal oversight.`);
    } finally {
      setIsLoadingBrief(false);
    }
  };

  const handleCopyBrief = () => {
    if (!brief) return;
    navigator.clipboard.writeText(brief);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const delivDone = (project.deliverables || []).filter(d => d.completed).length;
  const delivTotal = (project.deliverables || []).length;
  const percent = delivTotal > 0 ? Math.round((delivDone / delivTotal) * 100) : 0;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-zinc-900/30 backdrop-blur-2xs">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col animate-in slide-in-from-right duration-250"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                {project.category || 'Experiential'}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {project.client}
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 leading-snug">
              {project.name}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
              title="Edit Project"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#fbfbfa] rounded-xl border border-zinc-200/60">
            <div>
              <span className="text-zinc-400 block text-[10.5px] uppercase font-semibold">Status</span>
              <select
                value={project.status}
                onChange={(e) => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
                className="mt-1 font-semibold text-xs bg-white px-2 py-1 border border-zinc-200 rounded-md"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <span className="text-zinc-400 block text-[10.5px] uppercase font-semibold">Priority</span>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded font-semibold text-[11px] ${
                project.priority === 'High'
                  ? 'bg-red-50 text-red-700 border border-red-200/70'
                  : project.priority === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
              }`}>
                {project.priority} Priority
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[10.5px] uppercase font-semibold">Deadline</span>
              <span className="mt-1 flex items-center gap-1 font-medium text-zinc-800">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {project.date || 'Not scheduled'}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block text-[10.5px] uppercase font-semibold">Budget / Scope</span>
              <span className="mt-1 font-mono font-medium text-zinc-800">
                {project.budget || 'Custom Deliverables'}
              </span>
            </div>
          </div>

          {/* Notes & Scope */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Scope & Executive Notes
            </h3>
            <div className="p-3 bg-white border border-zinc-200/80 rounded-lg text-zinc-700 leading-relaxed">
              {project.notes || 'No specific notes recorded for this lead yet.'}
            </div>
          </div>

          {/* Deliverables Checklist with Direct Interactive Completion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Deliverables & Milestones
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">
                {delivDone} of {delivTotal} ({percent}%)
              </span>
            </div>

            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="space-y-1.5 pt-1">
              {(project.deliverables || []).map((d) => (
                <label 
                  key={d.id}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={d.completed}
                    onChange={() => onToggleDeliverable(project.id, d.id)}
                    className="w-4 h-4 rounded mt-0.5 text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span className={`flex-1 text-xs ${d.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                    {d.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Executive Brief Section */}
          <div className="space-y-2.5 pt-3 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Strategic Brief</span>
              </div>
              <button
                onClick={handleGenerateBrief}
                disabled={isLoadingBrief}
                className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                {isLoadingBrief ? 'Drafting...' : brief ? 'Regenerate Brief' : 'Generate Brief'}
              </button>
            </div>

            {brief ? (
              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200/60 space-y-2 text-xs">
                <div className="flex justify-end">
                  <button
                    onClick={handleCopyBrief}
                    className="flex items-center gap-1 text-[10.5px] text-blue-700 hover:text-blue-900 font-medium"
                  >
                    {copiedBrief ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedBrief ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-zinc-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {brief}
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-zinc-200 rounded-xl text-center text-zinc-400">
                <p className="text-[11px]">
                  Generate a structured executive brief with operational pillars, risk factors, and milestone timelines powered by Gemini 3.8.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-[#fcfcfb] dark:bg-zinc-900 flex items-center justify-between gap-2">
          {onSendToWhatsApp ? (
            <button
              onClick={() => onSendToWhatsApp(project)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send to WhatsApp</span>
            </button>
          ) : (
            <span className="text-[11px] text-zinc-400">
              Lead: Mohammed Noor (Tartibat)
            </span>
          )}
          <button
            onClick={() => onEdit(project)}
            className="px-4 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
          >
            Edit Lead
          </button>
        </div>
      </div>
    </div>
  );
};
