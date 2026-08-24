import React from 'react';
import { 
  FileText, 
  Code2, 
  Ruler, 
  Globe, 
  Timer, 
  Calculator, 
  QrCode, 
  Palette 
} from 'lucide-react';
import { ToolCategory, ToolDefinition } from '../types';

interface NavigationProps {
  activeTool: ToolCategory;
  onSelectTool: (id: ToolCategory) => void;
}

export const TOOLS: ToolDefinition[] = [
  { id: 'notes', name: 'Smart Notes', shortDesc: 'Markdown & Stats', icon: 'file' },
  { id: 'text-dev', name: 'Text & Dev', shortDesc: 'JSON, Regex & Diff', icon: 'code' },
  { id: 'converters', name: 'Unit Converter', shortDesc: 'Length, Weight, Data', icon: 'ruler' },
  { id: 'time', name: 'World Clock & Dates', shortDesc: 'Timezones & Age', icon: 'globe' },
  { id: 'focus', name: 'Focus & Soundscapes', shortDesc: 'Pomodoro & Audio', icon: 'timer', badge: 'Audio' },
  { id: 'calculator', name: 'Smart Calculators', shortDesc: 'Tip, Percent, Finance', icon: 'calc' },
  { id: 'qrcode', name: 'QR & Barcode', shortDesc: 'Custom Studio', icon: 'qr' },
  { id: 'color', name: 'Color Studio', shortDesc: 'WCAG & Palettes', icon: 'color' },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTool, onSelectTool }) => {
  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'file': return <FileText className="w-4 h-4" />;
      case 'code': return <Code2 className="w-4 h-4" />;
      case 'ruler': return <Ruler className="w-4 h-4" />;
      case 'globe': return <Globe className="w-4 h-4" />;
      case 'timer': return <Timer className="w-4 h-4" />;
      case 'calc': return <Calculator className="w-4 h-4" />;
      case 'qr': return <QrCode className="w-4 h-4" />;
      case 'color': return <Palette className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {TOOLS.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            id={`nav-tab-${tool.id}`}
            onClick={() => onSelectTool(tool.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 relative ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
              {renderIcon(tool.icon)}
            </span>
            <span>{tool.name}</span>
            {tool.badge && (
              <span
                className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                  isActive
                    ? 'bg-indigo-500 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {tool.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
