import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory, ProjectPriority, ProjectStatus, DeliverableItem, ProjectTemplateId } from '../types';
import { PROJECT_TEMPLATES } from '../data/projectTemplates';
import { X, Plus, Trash2, Sparkles, Check, LayoutTemplate, Layers, Tag, Link2, FileSpreadsheet } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  projectToEdit: Project | null;
}

const PRESET_TAGS = ['VIP', 'Urgent', 'Internal', 'Confidential', 'Government', 'Production', 'Creative'];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<ProjectTemplateId | 'blank' | null>(null);
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Experiential');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [priority, setPriority] = useState<ProjectPriority>('Medium');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [newDeliverableText, setNewDeliverableText] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setSelectedTemplateId(null);
      setName(projectToEdit.name || '');
      setClient(projectToEdit.client || '');
      setCategory(projectToEdit.category || 'Experiential');
      setStatus(projectToEdit.status || 'Planning');
      setPriority(projectToEdit.priority || 'Medium');
      setDate(projectToEdit.date || '');
      setBudget(projectToEdit.budget || '');
      setNotes(projectToEdit.notes || '');
      setTags(projectToEdit.tags ? [...projectToEdit.tags] : []);
      setSheetUrl(projectToEdit.sheetUrl || '');
      setDeliverables(projectToEdit.deliverables ? [...projectToEdit.deliverables] : []);
    } else {
      setSelectedTemplateId(null);
      setName('');
      setClient('');
      setCategory('Experiential');
      setStatus('Planning');
      setPriority('Medium');
      setDate('');
      setBudget('');
      setNotes('');
      setTags([]);
      setSheetUrl('');
      setDeliverables([]);
    }
  }, [projectToEdit, isOpen]);

  const handleTogglePresetTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newTagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags(prev => [...prev, clean]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSelectTemplate = (templateId: ProjectTemplateId | 'blank') => {
    setSelectedTemplateId(templateId);
    if (templateId === 'blank') {
      setDeliverables([]);
      return;
    }

    const tpl = PROJECT_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    setCategory(tpl.category);
    setPriority(tpl.defaultPriority);
    if (!notes) {
      setNotes(tpl.description);
    }
    const populatedDeliverables: DeliverableItem[] = tpl.deliverables.map((d, idx) => ({
      id: `d-${Date.now()}-${idx}`,
      text: d.text,
      completed: false,
      dueDate: date || undefined
    }));
    setDeliverables(populatedDeliverables);
  };

  if (!isOpen) return null;

  const handleAddDeliverable = () => {
    if (!newDeliverableText.trim()) return;
    setDeliverables(prev => [
      ...prev,
      { id: `d-${Date.now()}`, text: newDeliverableText.trim(), completed: false }
    ]);
    setNewDeliverableText('');
  };

  const handleRemoveDeliverable = (id: string) => {
    setDeliverables(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleDeliverable = (id: string) => {
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, completed: !d.completed } : d));
  };

  const handleAiSuggestDeliverables = () => {
    const suggestions: string[] = [
      `VIP arrival protocol & bilingual guest experience for ${client || 'Partner'}`,
      `Interactive touchscreen installation & stage AV narrative`,
      `Security compliance & live event operational plan`,
      `Final rehearsal, executive walk-through, and client handover`
    ];

    const newItems: DeliverableItem[] = suggestions.map((text, i) => ({
      id: `d-ai-${Date.now()}-${i}`,
      text,
      completed: false
    }));

    setDeliverables(prev => [...prev, ...newItems]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !client.trim()) return;

    const project: Project = {
      id: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
      name: name.trim(),
      client: client.trim(),
      category,
      status,
      priority,
      date: date || undefined,
      budget: budget.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      sheetUrl: sheetUrl.trim() || undefined,
      deliverables,
      lead: 'Mohammed Noor',
      createdAt: projectToEdit?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSave(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Tartibat Workspace
            </div>
            <h2 className="text-lg font-bold text-zinc-900">
              {projectToEdit ? 'Edit Project / Lead' : 'Create New Lead'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Project Templates Selector (when creating new project) */}
          {!projectToEdit && (
            <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
                  <span>Predefined Project Templates</span>
                </span>
                <span className="text-[10px] text-zinc-400">Auto-populates deliverables & categories</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROJECT_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`text-left p-2 rounded-lg border transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-blue-50/90 border-blue-500 shadow-2xs ring-1 ring-blue-500' 
                          : 'bg-white hover:bg-zinc-50 border-zinc-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-base">{tpl.icon}</span>
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                          {tpl.deliverables.length} tasks
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className="font-bold text-zinc-900 leading-tight text-[11px]">
                          {tpl.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                          {tpl.category}
                        </div>
                      </div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('blank')}
                  className={`text-left p-2 rounded-lg border transition-all flex flex-col justify-between ${
                    selectedTemplateId === 'blank'
                      ? 'bg-blue-50/90 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                      : 'bg-white hover:bg-zinc-50 border-dashed border-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-base">📝</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-500 font-medium">
                      Custom
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="font-bold text-zinc-900 leading-tight text-[11px]">
                      Blank Project
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Start with clean slate
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Project Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. VIP Sovereign Summit Launch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-zinc-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Client / Entity *</label>
              <input
                type="text"
                required
                placeholder="e.g. Saudi Ministry of Culture"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-zinc-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-zinc-50/50"
              >
                <option value="Experiential">Experiential</option>
                <option value="Brand & Design">Brand & Design</option>
                <option value="VIP & Protocol">VIP & Protocol</option>
                <option value="Interactive Tech">Interactive Tech</option>
                <option value="Strategy">Strategy</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-zinc-50/50"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-zinc-50/50"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Deadline Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-zinc-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Budget / Value (Optional)</label>
              <input
                type="text"
                placeholder="e.g. SAR 550,000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-zinc-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Notes & Scope Context</label>
            <textarea
              rows={3}
              placeholder="Describe experience deliverables, key stakeholders, venue, or technical scope..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-zinc-50/50 focus:bg-white"
            />
          </div>

          {/* Project Tags & Custom Labels */}
          <div className="space-y-2 p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/70">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                <span>Custom Labels & Tags</span>
              </label>
              <span className="text-[10px] text-zinc-400">e.g. VIP, Urgent, Internal</span>
            </div>

            {/* Preset Tag Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map(preset => {
                const isSelected = tags.includes(preset);
                return (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleTogglePresetTag(preset)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type a custom tag and hit Enter..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddCustomTag()}
                className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg text-xs font-semibold"
              >
                Add Tag
              </button>
            </div>

            {/* Active Tags list */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-600 text-zinc-400 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Live Interactive Project Sheet Link */}
          <div className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/70 space-y-1.5">
            <label className="font-semibold text-zinc-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Interactive Sheet Link</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-normal">Google Sheets / Excel Web / CSV URL</span>
            </label>
            <div className="relative">
              <Link2 className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/... or OneDrive Excel link"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 bg-white"
              />
            </div>
            {sheetUrl && (
              <div className="flex items-center gap-2 pt-0.5">
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Test Link in new tab ↗</span>
                </a>
              </div>
            )}
          </div>

          {/* Deliverables Checklist Section */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-800">
                Key Deliverables & Milestones ({deliverables.filter(d => d.completed).length}/{deliverables.length})
              </label>
              <button
                type="button"
                onClick={handleAiSuggestDeliverables}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Suggest Milestones</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {deliverables.map((d) => (
                <div 
                  key={d.id} 
                  className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200/60"
                >
                  <input
                    type="checkbox"
                    checked={d.completed}
                    onChange={() => handleToggleDeliverable(d.id)}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span className={`flex-1 text-xs ${d.completed ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                    {d.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(d.id)}
                    className="text-zinc-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add another deliverable item..."
                value={newDeliverableText}
                onChange={(e) => setNewDeliverableText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDeliverable(); } }}
                className="flex-1 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium rounded-lg text-xs"
              >
                Add Item
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              {projectToEdit ? 'Update Project' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
