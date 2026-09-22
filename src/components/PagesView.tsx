import React, { useState } from 'react';
import { DocPage } from '../types';
import { 
  FileText, 
  Plus, 
  Sparkles, 
  Copy, 
  Check, 
  Calendar,
  Layers,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface PagesViewProps {
  docs: DocPage[];
  onAskAiPrompt: (prompt: string) => void;
  onAddDoc: (doc: DocPage) => void;
}

export const PagesView: React.FC<PagesViewProps> = ({
  docs,
  onAskAiPrompt,
  onAddDoc
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(docs[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Operational Playbook');
  const [newContent, setNewContent] = useState('');

  const activeDoc = docs.find(d => d.id === selectedDocId) || docs[0];

  const handleCopy = () => {
    if (!activeDoc) return;
    navigator.clipboard.writeText(activeDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const doc: DocPage = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      icon: '📄',
      category: newCategory,
      summary: newContent.slice(0, 120) + '...',
      content: newContent || `# ${newTitle}\n\nDocument notes created by Mohammed Noor Lead.`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onAddDoc(doc);
    setSelectedDocId(doc.id);
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Knowledge Hub
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Docs & Operational Playbooks
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
            Documented methodologies, VIP protocols, and technical frameworks for Tartibat client deliveries.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs self-start sm:self-auto transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Playbook Page</span>
        </button>
      </div>

      {/* Main Content Grid: Sidebar of pages + Active Page Reader */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Playbooks Index List */}
        <div className="md:col-span-4 bg-white rounded-xl border border-zinc-200/80 p-3 shadow-2xs space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
            Standard Playbooks ({docs.length})
          </div>
          <div className="space-y-1">
            {docs.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => { setSelectedDocId(doc.id); setIsCreating(false); }}
                  className={`w-full p-2.5 rounded-lg text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-zinc-100/90 text-zinc-900 border border-zinc-200/80 shadow-2xs'
                      : 'hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="text-base shrink-0 leading-none mt-0.5">{doc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-zinc-900 truncate">
                      {doc.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {doc.category}
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'text-zinc-800 translate-x-0.5' : 'text-zinc-300'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Page Reader / Editor */}
        <div className="md:col-span-8 bg-white rounded-xl border border-zinc-200/80 p-6 shadow-2xs">
          {isCreating ? (
            <form onSubmit={handleSaveNewPage} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h2 className="text-lg font-bold text-zinc-900">Create New Playbook Document</h2>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sovereign Media Production Protocol"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400"
                >
                  <option>Executive Protocol</option>
                  <option>Production & Tech</option>
                  <option>Brand Experience</option>
                  <option>Client Strategy</option>
                  <option>Operational Playbook</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Content (Markdown supported)</label>
                <textarea
                  rows={10}
                  placeholder="Write documentation guidelines, checklists, and key steps..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  Save Document
                </button>
              </div>
            </form>
          ) : activeDoc ? (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{activeDoc.icon}</span>
                    <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                      {activeDoc.category}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                    {activeDoc.title}
                  </h2>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>Last updated: {activeDoc.updatedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>

                  <button
                    onClick={() => onAskAiPrompt(`Please analyze our playbook "${activeDoc.title}" and provide 3 executive recommendations to upgrade it for upcoming Saudi high-level events.`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>AI Upgrade Review</span>
                  </button>
                </div>
              </div>

              {/* Document Body */}
              <div className="prose prose-sm max-w-none text-zinc-700 leading-relaxed space-y-4 font-sans text-xs sm:text-sm">
                <pre className="whitespace-pre-wrap font-sans bg-[#fcfcfb] p-4 rounded-lg border border-zinc-100 text-zinc-800">
                  {activeDoc.content}
                </pre>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
