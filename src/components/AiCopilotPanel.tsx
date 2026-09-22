import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Project, WorkspaceView } from '../types';
import { 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  Download, 
  Check, 
  Bot, 
  User, 
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface AiCopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onExecuteAction: (action: any) => void;
  onSwitchView: (view: WorkspaceView) => void;
}

export const AiCopilotPanel: React.FC<AiCopilotPanelProps> = ({
  isOpen,
  onClose,
  projects,
  onExecuteAction,
  onSwitchView,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-initial',
      sender: 'ai',
      text: `Hello Mohammed. I am your executive AI Copilot for **mohammednoor lead** (Tartibat).\n\nI have full visibility into your live projects and milestones. I can:\n• **Search & filter** ("Find Tajrubah", "Show review projects")\n• **Modify status & priority** ("Mark Cyber Awareness as In Progress")\n• **Create projects** ("Add project Riyadh Art Festival for Royal Commission")\n• **Analyze pipeline** ("Which deadlines are within 14 days?")`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          workspaceContext: {
            projects,
            summary: {
              total: projects.length,
              active: projects.filter(p => p.status !== 'Completed').length,
              highPriority: projects.filter(p => p.priority === 'High').length
            }
          }
        })
      });

      const data = await res.json();
      const aiReply = data.reply || "I've processed your command.";

      // Execute workspace action if provided
      let actionExecutedText: string | undefined = undefined;
      if (data.action) {
        onExecuteAction(data.action);
        actionExecutedText = formatActionBadge(data.action);
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: actionExecutedText,
        actionPayload: data.action
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: "I couldn't reach the AI gateway. Please verify your connection or retry in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatActionBadge = (action: any) => {
    if (!action) return undefined;
    switch (action.action) {
      case 'CREATE_PROJECT':
        return `Created lead: "${action.payload?.name}"`;
      case 'UPDATE_STATUS':
        return `Updated status to "${action.payload?.status}"`;
      case 'UPDATE_PRIORITY':
        return `Updated priority to "${action.payload?.priority}"`;
      case 'DELETE_PROJECT':
        return `Removed project record`;
      case 'SWITCH_VIEW':
        return `Switched view to ${action.payload?.view}`;
      default:
        return 'Workspace action applied';
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `m-reset-${Date.now()}`,
        sender: 'ai',
        text: "Conversation cleared. Ready for your next advisory query or workspace command.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleExportChat = () => {
    const text = messages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n${m.actionExecuted ? `(Action: ${m.actionExecuted})\n` : ''}`).join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mohammednoor-copilot-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    "Summarize all active deadlines",
    "List high priority projects",
    "Add project Saudi Pavilion 2026",
    "Show kanban board",
    "What is in review status?"
  ];

  return (
    <aside 
      id="ai-copilot-panel"
      className="w-full sm:w-96 md:w-[410px] bg-white border-l border-zinc-200 h-full flex flex-col shrink-0 z-30 shadow-xl select-none"
    >
      {/* Copilot Header */}
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-[#fbfbfa]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            ✦
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
              <span>AI Lead Copilot</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                Gemini 3.8
              </span>
            </div>
            <div className="text-[10.5px] text-zinc-400 font-medium">
              Tartibat Executive Assistance
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportChat}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md"
            title="Export Transcript"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fcfcfb] text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-xs rounded-br-xs'
                  : 'bg-white text-zinc-800 border border-zinc-200/80 shadow-2xs rounded-bl-xs'
              }`}
            >
              {m.text}
            </div>

            {/* Action Feedback Badge */}
            {m.actionExecuted && (
              <div className="mt-1 flex items-center gap-1 text-[10.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                <Check className="w-3 h-3" />
                <span>{m.actionExecuted}</span>
              </div>
            )}

            <span className="text-[10px] text-zinc-400 mt-1 px-1">
              {m.timestamp}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-zinc-200/80 rounded-xl w-fit shadow-2xs text-xs text-zinc-500">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Analyzing workspace context with Gemini 3.8...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-3 py-2 border-t border-zinc-100 bg-[#f9f9f8] overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200/70 transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-zinc-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            rows={2}
            placeholder="Ask AI Copilot to analyze, update, create, or advise..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 resize-none p-2.5 text-xs text-zinc-800 placeholder-zinc-400 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 bg-zinc-50/50 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-[10px] text-zinc-400 text-center mt-1.5">
          Press Enter to send · Shift+Enter for newline
        </div>
      </div>
    </aside>
  );
};
