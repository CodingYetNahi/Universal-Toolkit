import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { CommandPalette } from './components/CommandPalette';
import { NotesTool } from './components/tools/NotesTool';
import { TextDevTool } from './components/tools/TextDevTool';
import { UnitConverterTool } from './components/tools/UnitConverterTool';
import { TimezoneTool } from './components/tools/TimezoneTool';
import { FocusAudioTool } from './components/tools/FocusAudioTool';
import { CalculatorTool } from './components/tools/CalculatorTool';
import { QRCodeTool } from './components/tools/QRCodeTool';
import { ColorStudioTool } from './components/tools/ColorStudioTool';
import { ToolCategory } from './types';
import { Sparkles, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolCategory>(() => {
    const saved = localStorage.getItem('omni_active_tool');
    return (saved as ToolCategory) || 'notes';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('omni_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('omni_active_tool', activeTool);
  }, [activeTool]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('omni_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('omni_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'notes':
        return <NotesTool />;
      case 'text-dev':
        return <TextDevTool />;
      case 'converters':
        return <UnitConverterTool />;
      case 'time':
        return <TimezoneTool />;
      case 'focus':
        return <FocusAudioTool />;
      case 'calculator':
        return <CalculatorTool />;
      case 'qrcode':
        return <QRCodeTool />;
      case 'color':
        return <ColorStudioTool />;
      default:
        return <NotesTool />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        activeTool={activeTool}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenCommandPalette={() => setIsCommandOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tab Bar */}
        <Navigation activeTool={activeTool} onSelectTool={setActiveTool} />

        {/* Active Tool Workspace */}
        <section className="min-h-[500px]">
          {renderActiveTool()}
        </section>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTool={(toolId) => {
          setActiveTool(toolId);
          setIsCommandOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Client-Side &amp; Private
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Zero Latency Instant Web Tools
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>Built for everyone with modern web standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
