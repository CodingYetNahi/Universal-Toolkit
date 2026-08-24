import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Plus, 
  Eye, 
  Edit3, 
  Sparkles,
  Search,
  BookOpen,
  Pin,
  Clock
} from 'lucide-react';
import { NoteItem } from '../../types';

export const NotesTool: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('omni_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: '1',
        title: 'Welcome to Smart Notes',
        content: `# Welcome to your Markdown Scratchpad ✍️\n\nThis is a distraction-free space for your thoughts, lists, code snippets, or documentation.\n\n### Key Features:\n- **Instant Auto-Save**: Your notes stay securely in your browser.\n- **Real-Time Word & Reading Stats**: Live analytics as you type.\n- **Quick Transforms**: Clean spaces, title case, uppercase, or lowercase.\n- **One-Click Export**: Save as Markdown (\`.md\`) or Plain Text (\`.txt\`).\n\n\`\`\`typescript\n// Code blocks are cleanly formatted\nconst isProductive = true;\nconsole.log("Ready to build something great!");\n\`\`\`\n\n> "Simplicity is the soul of efficiency." — Austin Freeman`,
        updatedAt: Date.now(),
        pinned: true,
      },
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '1');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('omni_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const updateActiveContent = (content: string) => {
    if (!activeNote) return;
    // Auto derive title from first non-empty line or keep custom
    const firstLine = content.trim().split('\n')[0]?.replace(/^[#\s]+/, '').trim();
    const updatedTitle = firstLine ? (firstLine.length > 35 ? firstLine.slice(0, 35) + '...' : firstLine) : 'Untitled Note';

    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? { ...n, content, title: updatedTitle, updatedAt: Date.now() }
          : n
      )
    );
  };

  const createNewNote = () => {
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '# New Note\n\nStart typing here...',
      updatedAt: Date.now(),
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (id: string) => {
    if (notes.length <= 1) {
      // Clear current note instead of deleting the last one
      updateActiveContent('# New Scratchpad\n\n');
      return;
    }
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) {
      setActiveNoteId(remaining[0].id);
    }
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Text Stats
  const rawText = activeNote?.content || '';
  const charCount = rawText.length;
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const lineCount = rawText ? rawText.split('\n').length : 0;
  const readingTimeMin = Math.ceil(wordCount / 200) || 1;

  // Text Transforms
  const applyTransform = (type: 'upper' | 'lower' | 'title' | 'clean' | 'bullet') => {
    if (!activeNote) return;
    let text = activeNote.content;
    if (type === 'upper') text = text.toUpperCase();
    if (type === 'lower') text = text.toLowerCase();
    if (type === 'title') {
      text = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    if (type === 'clean') {
      text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    }
    if (type === 'bullet') {
      text = text
        .split('\n')
        .map((line) => (line.trim().startsWith('- ') ? line : `- ${line}`))
        .join('\n');
    }
    updateActiveContent(text);
  };

  const handleCopy = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: 'md' | 'txt') => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'note'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render basic markdown safely with nice typography
  const renderMarkdownPreview = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="prose max-w-none text-slate-800 dark:text-slate-200 space-y-3 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white pt-2">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-lg font-medium tracking-tight text-slate-900 dark:text-white pt-1">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-4 border-amber-500/80 bg-amber-50/50 dark:bg-amber-950/20 pl-4 py-2 italic text-slate-700 dark:text-slate-300 rounded-r-md">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-5 list-disc text-slate-700 dark:text-slate-300">
                {line.replace(/^[-*]\s+/, '')}
              </li>
            );
          }
          if (line.startsWith('```')) {
            return (
              <div key={idx} className="text-xs font-mono bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto shadow-inner">
                {line.replace(/```[a-z]*/i, '')}
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }
          return (
            <p key={idx} className="text-slate-700 dark:text-slate-300">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[680px]">
      {/* Sidebar List */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-slate-900 dark:text-white text-base">Notes & Scratchpad</h2>
          </div>
          <button
            id="btn-new-note"
            onClick={createNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-notes"
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[500px]">
          {filteredNotes.map((note) => {
            const isActive = note.id === activeNote?.id;
            return (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border text-left group ${
                  isActive
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate flex-1 flex items-center gap-1.5">
                    {note.pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                    {note.title || 'Untitled Note'}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(note.id);
                      }}
                      className="p-1 text-slate-400 hover:text-amber-500 rounded"
                      title={note.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span>{note.content.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            );
          })}
          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">No notes found</div>
          )}
        </div>
      </div>

      {/* Editor & Preview Pane */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-xs">
        {/* Editor Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          {/* View Mode Switches */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Split
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Write
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          {/* Quick Transformations & Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="relative group">
              <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Format
              </button>
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 hidden group-hover:block z-20">
                <button onClick={() => applyTransform('clean')} className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  Clean Spaces & Gaps
                </button>
                <button onClick={() => applyTransform('title')} className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  Capitalize Words
                </button>
                <button onClick={() => applyTransform('upper')} className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  ALL UPPERCASE
                </button>
                <button onClick={() => applyTransform('lower')} className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  all lowercase
                </button>
                <button onClick={() => applyTransform('bullet')} className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
                  Convert to Bullet List
                </button>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={() => handleExport('md')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              title="Download as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              .md
            </button>
          </div>
        </div>

        {/* Work Area */}
        <div className="flex-1 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[380px]">
          {(viewMode === 'split' || viewMode === 'edit') && (
            <div className={`flex flex-col h-full ${viewMode === 'edit' ? 'col-span-2' : ''}`}>
              <textarea
                id="textarea-note-editor"
                value={activeNote?.content || ''}
                onChange={(e) => updateActiveContent(e.target.value)}
                placeholder="Type your notes or markdown here..."
                className="w-full h-full p-4 text-sm font-mono bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
              />
            </div>
          )}

          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className={`h-full overflow-y-auto p-4 bg-slate-50/40 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800 rounded-xl ${viewMode === 'preview' ? 'col-span-2' : ''}`}>
              {renderMarkdownPreview(activeNote?.content || '')}
            </div>
          )}
        </div>

        {/* Live Text Analytics Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              <strong className="text-slate-700 dark:text-slate-300">{wordCount}</strong> words
            </span>
            <span>
              <strong className="text-slate-700 dark:text-slate-300">{charCount}</strong> characters
            </span>
            <span>
              <strong className="text-slate-700 dark:text-slate-300">{lineCount}</strong> lines
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>~{readingTimeMin} min read</span>
          </div>
        </div>
      </div>
    </div>
  );
};
