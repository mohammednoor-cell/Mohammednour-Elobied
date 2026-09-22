import React, { useState } from 'react';
import { QuickNote, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import { X, Plus, Pin, Trash2, Sparkles, Check, Copy } from 'lucide-react';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: QuickNote[];
  onSaveNote: (note: QuickNote) => void;
  onDeleteNote: (id: string) => void;
  lang: Language;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
  isOpen,
  onClose,
  notes,
  onSaveNote,
  onDeleteNote,
  lang
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('blue');
  const [pinned, setPinned] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = getTranslation(lang);
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      title: title.trim() || `Quick Note (${new Date().toLocaleDateString()})`,
      content: content.trim(),
      color,
      pinned,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onSaveNote(newNote);
    setTitle('');
    setContent('');
    setPinned(false);
  };

  const handleCopy = (note: QuickNote) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-base font-bold text-zinc-900">{t.notesTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Form to add new note + list of existing notes */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Add Note Form */}
          <form onSubmit={handleSubmit} className="bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-200/70 space-y-3">
            <div>
              <input
                type="text"
                placeholder={t.noteTitlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <textarea
                rows={3}
                required
                placeholder={t.notePlaceholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPinned(prev => !prev)}
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    pinned ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-zinc-200 text-zinc-600'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                  <span>{pinned ? 'Pinned' : 'Pin'}</span>
                </button>

                <div className="flex items-center gap-1.5 pl-1">
                  {['blue', 'amber', 'emerald', 'rose'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-4 h-4 rounded-full border-2 transition-transform ${
                        c === 'blue' ? 'bg-blue-500' : c === 'amber' ? 'bg-amber-500' : c === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'
                      } ${color === c ? 'scale-125 border-zinc-800' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs shadow-xs"
              >
                {t.saveNote}
              </button>
            </div>
          </form>

          {/* Existing Notes Feed */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Saved Notes ({notes.length})
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 text-xs">
                No quick notes yet. Jot down meeting insights, urgent calls, or vendor updates.
              </div>
            ) : (
              notes.map((note) => {
                const isCopied = copiedId === note.id;
                return (
                  <div
                    key={note.id}
                    className={`p-3.5 rounded-xl border bg-white shadow-2xs space-y-1.5 transition-all ${
                      note.pinned ? 'border-amber-300 bg-amber-50/20' : 'border-zinc-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {note.pinned && <Pin className="w-3 h-3 text-amber-600 fill-amber-600 shrink-0" />}
                        <h3 className="font-bold text-zinc-900 text-xs">{note.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(note)}
                          className="p-1 text-zinc-400 hover:text-zinc-700 rounded"
                          title="Copy Note"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 text-zinc-400 hover:text-red-600 rounded"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>

                    <div className="text-[10px] text-zinc-400 pt-1 font-mono">
                      Recorded at {note.createdAt}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
