import React, { useState } from 'react';
import { 
  Palette, 
  Copy, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Shuffle
} from 'lucide-react';

export const ColorStudioTool: React.FC = () => {
  const [hexColor, setHexColor] = useState('#4f46e5');
  const [textColor, setTextColor] = useState('#ffffff');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Convert Hex to RGB
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6 && cleanHex.length !== 3) return { r: 0, g: 0, b: 0 };
    const fullHex = cleanHex.length === 3
      ? cleanHex.split('').map((c) => c + c).join('')
      : cleanHex;
    const num = parseInt(fullHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgb = hexToRgb(hexColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Luminance & Contrast
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const textRgb = hexToRgb(textColor);
  const lum1 = getLuminance(rgb.r, rgb.g, rgb.b);
  const lum2 = getLuminance(textRgb.r, textRgb.g, textRgb.b);
  const contrastRatio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

  const passesAaNormal = contrastRatio >= 4.5;
  const passesAaLarge = contrastRatio >= 3.0;
  const passesAaa = contrastRatio >= 7.0;

  // Generate Shades & Tints
  const generateTintsShades = () => {
    const shades = [];
    for (let i = 10; i <= 90; i += 15) {
      shades.push(`hsl(${hsl.h}, ${hsl.s}%, ${i}%)`);
    }
    return shades;
  };

  // Harmonies
  const complementaryHex = `hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`;
  const triadic1 = `hsl(${(hsl.h + 120) % 360}, ${hsl.s}%, ${hsl.l}%)`;
  const triadic2 = `hsl(${(hsl.h + 240) % 360}, ${hsl.s}%, ${hsl.l}%)`;

  const randomizeColor = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setHexColor(randomHex);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
      {/* Top Header & Color Picker */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 flex items-center gap-4">
          <div className="relative">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              className="w-16 h-16 rounded-2xl cursor-pointer border-0 p-0 shadow-sm"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
                className="font-mono text-xl font-bold bg-transparent text-slate-900 dark:text-white uppercase focus:outline-none w-28"
              />
              <button
                onClick={randomizeColor}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                title="Random Color"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Click swatch or type HEX code</p>
          </div>
        </div>

        {/* Color Values Formats */}
        <div className="md:col-span-6 grid grid-cols-2 gap-2">
          {[
            { label: 'HEX', val: hexColor.toUpperCase() },
            { label: 'RGB', val: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
            { label: 'HSL', val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
            { label: 'CSS Variable', val: `--color: ${hexColor};` },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 uppercase font-medium">{item.label}</div>
                <div className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">{item.val}</div>
              </div>
              <button
                onClick={() => copyToClipboard(item.val, item.label)}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded"
              >
                {copiedKey === item.label ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* WCAG Contrast Ratio Checker */}
      <div className="p-5 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            WCAG 2.1 Contrast Checker
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Text color:</span>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-6 h-6 rounded border-0 cursor-pointer p-0"
            />
            <span className="font-mono text-slate-700 dark:text-slate-300 uppercase">{textColor}</span>
          </div>
        </div>

        {/* Live Preview Banner */}
        <div
          className="p-6 rounded-xl text-center space-y-1 transition-all shadow-xs"
          style={{ backgroundColor: hexColor, color: textColor }}
        >
          <div className="text-lg font-bold">The quick brown fox jumps over the lazy dog.</div>
          <div className="text-xs opacity-90">
            Preview text rendered directly on your background color choice.
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <div className="font-mono text-xl font-bold text-slate-900 dark:text-white">
              {contrastRatio.toFixed(2)}:1
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Contrast Ratio</div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">AA Normal</div>
              <div className="text-[10px] text-slate-400">&ge; 4.5:1</div>
            </div>
            {passesAaNormal ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500" />
            )}
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">AA Large</div>
              <div className="text-[10px] text-slate-400">&ge; 3.0:1</div>
            </div>
            {passesAaLarge ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500" />
            )}
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">AAA Enhanced</div>
              <div className="text-[10px] text-slate-400">&ge; 7.0:1</div>
            </div>
            {passesAaa ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500" />
            )}
          </div>
        </div>
      </div>

      {/* Harmony & Shades Palette */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Luminance Range & Tints
          </h4>
          <div className="flex h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800">
            {generateTintsShades().map((color, idx) => (
              <div
                key={idx}
                onClick={() => copyToClipboard(color, `tint-${idx}`)}
                className="flex-1 h-full cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: color }}
                title={`Click to copy: ${color}`}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Harmonious Pairings (Complementary & Triad)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Complementary', color: complementaryHex },
              { label: 'Triadic 1', color: triadic1 },
              { label: 'Triadic 2', color: triadic2 },
            ].map((h, idx) => (
              <div
                key={idx}
                onClick={() => copyToClipboard(h.color, h.label)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-xs transition-all flex items-center gap-3 bg-white dark:bg-slate-900"
              >
                <div
                  className="w-8 h-8 rounded-lg shrink-0 shadow-inner"
                  style={{ backgroundColor: h.color }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                    {h.label}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 truncate">{h.color}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
