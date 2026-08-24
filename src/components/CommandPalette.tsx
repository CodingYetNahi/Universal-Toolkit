import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Code2, 
  Ruler, 
  Globe, 
  Timer, 
  Calculator, 
  QrCode, 
  Palette, 
  ArrowRight,
  X
} from 'lucide-react';
import { ToolCategory } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (id: ToolCategory) => void;
}

interface CommandItem {
  id: ToolCategory;
  title: string;
  category: string;
  icon: React.ReactNode;
  keywords: string[];
}

const COMMANDS: CommandItem[] = [
  { id: 'notes', title: 'Notes & Markdown Scratchpad', category: 'Writing', icon: <FileText className="w-4 h-4" />, keywords: ['notes', 'scratchpad', 'markdown', 'write', 'editor', 'draft', 'India', 'budget template', 'kirana'] },
  { id: 'text-dev', title: 'JSON Formatter & Validator', category: 'Developer', icon: <Code2 className="w-4 h-4" />, keywords: ['json', 'format', 'lint', 'minify', 'pretty', 'validate'] },
  { id: 'text-dev', title: 'Case Converter (camelCase, snake_case, PascalCase)', category: 'Developer', icon: <Code2 className="w-4 h-4" />, keywords: ['case', 'camelcase', 'snakecase', 'kebab', 'title', 'upper'] },
  { id: 'text-dev', title: 'Base64 & URL Encoder / Decoder', category: 'Developer', icon: <Code2 className="w-4 h-4" />, keywords: ['base64', 'url', 'encode', 'decode', 'uri', 'btoa'] },
  { id: 'text-dev', title: 'UUID & Hash Generator', category: 'Developer', icon: <Code2 className="w-4 h-4" />, keywords: ['uuid', 'guid', 'sha256', 'hash', 'slug', 'random'] },
  { id: 'converters', title: 'Unit Converter (Length, Weight, Temp, Storage)', category: 'Conversions', icon: <Ruler className="w-4 h-4" />, keywords: ['convert', 'length', 'weight', 'temperature', 'speed', 'storage', 'byte', 'mb', 'gb', 'km', 'miles', 'lbs', 'kg', 'guntha', 'cent', 'kanal', 'marla'] },
  { id: 'time', title: 'World Clock & Meeting Planner', category: 'Time & Date', icon: <Globe className="w-4 h-4" />, keywords: ['world clock', 'timezone', 'time', 'slider', 'meeting', 'london', 'tokyo', 'new york', 'IST', 'Indian cities'] },
  { id: 'time', title: 'Date Difference & Age Calculator', category: 'Time & Date', icon: <Globe className="w-4 h-4" />, keywords: ['date', 'days between', 'age', 'birthday', 'duration', 'countdown'] },
  { id: 'focus', title: 'Pomodoro Focus Timer & Ambient Audio', category: 'Productivity', icon: <Timer className="w-4 h-4" />, keywords: ['pomodoro', 'timer', 'focus', 'rain', 'ocean', 'campfire', 'ambient', 'sound', 'noise', 'white noise', 'binaural', 'monsoon'] },
  { id: 'focus', title: 'Daily Focus Checklist', category: 'Productivity', icon: <Timer className="w-4 h-4" />, keywords: ['checklist', 'todo', 'task', 'priority'] },
  { id: 'calculator', title: 'Tip & Bill Splitter with Tax', category: 'Finance', icon: <Calculator className="w-4 h-4" />, keywords: ['tip', 'bill', 'split', 'restaurant', 'tax', 'calculator'] },
  { id: 'calculator', title: 'Percentage & Discount Calculator', category: 'Finance', icon: <Calculator className="w-4 h-4" />, keywords: ['percent', 'percentage', 'discount', 'sale', 'save', 'price'] },
  { id: 'calculator', title: 'Compound Interest & Savings Growth', category: 'Finance', icon: <Calculator className="w-4 h-4" />, keywords: ['compound', 'interest', 'savings', 'invest', 'principal', 'growth'] },
  { id: 'calculator', title: 'India Finance — GST, EMI, SIP, FD & RD', category: 'Finance', icon: <Calculator className="w-4 h-4" />, keywords: ['India', 'INR', 'rupee', 'lakh', 'crore', 'GST', 'EMI', 'SIP', 'FD', 'RD'] },
  { id: 'qrcode', title: 'QR Code Generator (WiFi, URL, vCard)', category: 'Utilities', icon: <QrCode className="w-4 h-4" />, keywords: ['qr', 'qrcode', 'wifi', 'vcard', 'barcode', 'scan'] },
  { id: 'qrcode', title: 'UPI Payment QR', category: 'Utilities', icon: <QrCode className="w-4 h-4" />, keywords: ['UPI', 'India', 'INR', 'payment'] },
  { id: 'color', title: 'Color Studio & WCAG Contrast Checker', category: 'Design', icon: <Palette className="w-4 h-4" />, keywords: ['color', 'contrast', 'hex', 'rgb', 'hsl', 'wcag', 'palette', 'picker', 'peacock palette'] },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectTool }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // handled in parent or toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCommands = COMMANDS.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search tools, conversions, timers, calculators... (Type anything)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.map((cmd, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectTool(cmd.id);
                onClose();
              }}
              className="p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-slate-600 dark:text-slate-300">
                  {cmd.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                    {cmd.title}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">{cmd.category}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching tools found. Try searching for "json", "convert", "wifi", or "timer".
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">Esc</kbd> to close</span>
          <span>Quick jump to any tool</span>
        </div>
      </div>
    </div>
  );
};
