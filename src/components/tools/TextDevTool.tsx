import React, { useState } from 'react';
import { 
  Code2, 
  Braces, 
  Binary, 
  CaseSensitive, 
  GitCompare, 
  KeyRound, 
  Copy, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';

type SubTab = 'json' | 'case' | 'base64' | 'diff' | 'generator' | 'regex';

export const TextDevTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('json');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. JSON State
  const [jsonInput, setJsonInput] = useState('{\n  "name": "Everyday Toolkit",\n  "version": 1.0,\n  "features": ["smart-notes", "converters", "focus-audio"],\n  "active": true\n}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleJsonFormat = (spaces = 2) => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, spaces));
      setJsonError(null);
    } catch (err: unknown) {
      setJsonError((err as Error).message);
      setJsonOutput('');
    }
  };

  const handleJsonMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
      setJsonError(null);
    } catch (err: unknown) {
      setJsonError((err as Error).message);
      setJsonOutput('');
    }
  };

  // 2. Case Converter State
  const [caseInput, setCaseInput] = useState('the quick brown fox jumps over the lazy dog');

  const toCamelCase = (str: string) =>
    str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
  const toPascalCase = (str: string) =>
    str.toLowerCase().replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (_, chr) => chr.toUpperCase());
  const toSnakeCase = (str: string) =>
    str.toLowerCase().trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const toKebabCase = (str: string) =>
    str.toLowerCase().trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const toConstantCase = (str: string) =>
    toSnakeCase(str).toUpperCase();
  const toTitleCase = (str: string) =>
    str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());

  // 3. Base64 & URL State
  const [b64Input, setB64Input] = useState('Hello, World! 🚀');
  const [b64Mode, setB64Mode] = useState<'encode' | 'decode'>('encode');
  const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');

  const getBase64Output = () => {
    try {
      if (b64Mode === 'encode') {
        return btoa(encodeURIComponent(b64Input).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
      } else {
        return decodeURIComponent(Array.prototype.map.call(atob(b64Input), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      }
    } catch {
      return 'Invalid Base64 string';
    }
  };

  const getUrlOutput = () => {
    try {
      return urlMode === 'encode' ? encodeURIComponent(b64Input) : decodeURIComponent(b64Input);
    } catch {
      return 'Invalid URL encoded string';
    }
  };

  // 4. Text Diff State
  const [diffOriginal, setDiffOriginal] = useState('Apples\nOranges\nBananas\nPineapples');
  const [diffModified, setDiffModified] = useState('Apples\nBlueberries\nBananas\nPears\nPineapples');

  const computeDiffLines = () => {
    const origLines = diffOriginal.split('\n');
    const modLines = diffModified.split('\n');
    const maxLen = Math.max(origLines.length, modLines.length);
    const results: { type: 'same' | 'added' | 'removed' | 'changed'; orig: string; mod: string }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const o = origLines[i] ?? '';
      const m = modLines[i] ?? '';
      if (o === m) {
        results.push({ type: 'same', orig: o, mod: m });
      } else if (origLines.includes(m) && !modLines.includes(o)) {
        results.push({ type: 'removed', orig: o, mod: '' });
      } else if (modLines.includes(o) && !origLines.includes(m)) {
        results.push({ type: 'added', orig: '', mod: m });
      } else {
        results.push({ type: 'changed', orig: o, mod: m });
      }
    }
    return results;
  };

  // 5. Hash & UUID Generator
  const [uuidCount, setUuidCount] = useState(3);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [slugInput, setSlugInput] = useState('Learn Web Development in 2026!');
  const [hashInput, setHashInput] = useState('SecurePass123');
  const [sha256Hash, setSha256Hash] = useState('');

  const generateUuids = () => {
    const arr = [];
    for (let i = 0; i < uuidCount; i++) {
      arr.push(crypto.randomUUID());
    }
    setGeneratedUuids(arr);
  };

  const calculateSha256 = async (str: string) => {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    setSha256Hash(hashHex);
  };

  React.useEffect(() => {
    if (generatedUuids.length === 0) generateUuids();
    calculateSha256(hashInput);
  }, []);

  // 6. Regex Tester
  const [regexPattern, setRegexPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestString, setRegexTestString] = useState('Contact us at support@example.com or sales@toolkit.io for quick assistance!');

  const testRegexMatches = () => {
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const matches = Array.from(regexTestString.matchAll(re));
      return { isValid: true, matches };
    } catch (err: unknown) {
      return { isValid: false, error: (err as Error).message, matches: [] };
    }
  };

  const regexResult = testRegexMatches();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      {/* Sub tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            activeTab === 'json'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Braces className="w-3.5 h-3.5" />
          JSON Studio
        </button>
        <button
          onClick={() => setActiveTab('case')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            activeTab === 'case'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CaseSensitive className="w-3.5 h-3.5" />
          Case Converter
        </button>
        <button
          onClick={() => setActiveTab('base64')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            activeTab === 'base64'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          Base64 & URL
        </button>
        <button
          onClick={() => setActiveTab('diff')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            activeTab === 'diff'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          Text Diff Checker
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            activeTab === 'generator'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          UUID, Slug & Hash
        </button>
        <button
          onClick={() => setActiveTab('regex')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            activeTab === 'regex'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Regex Tester
        </button>
      </div>

      {/* 1. JSON Tab */}
      {activeTab === 'json' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleJsonFormat(2)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                Format (2 Spaces)
              </button>
              <button
                onClick={() => handleJsonFormat(4)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Format (4 Spaces)
              </button>
              <button
                onClick={handleJsonMinify}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Minify (1 Line)
              </button>
            </div>
            {jsonOutput && (
              <button
                onClick={() => copyToClipboard(jsonOutput)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Result
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Input Raw JSON
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste JSON here..."
                rows={12}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Formatted Output / Validation
                </label>
                {jsonError ? (
                  <span className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                    <AlertCircle className="w-3 h-3" /> Invalid JSON
                  </span>
                ) : jsonOutput ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Valid JSON
                  </span>
                ) : null}
              </div>
              <textarea
                readOnly
                value={jsonError ? `Error: ${jsonError}` : jsonOutput}
                placeholder="Formatted JSON will appear here..."
                rows={12}
                className={`w-full p-3 font-mono text-xs border rounded-xl focus:outline-none resize-none leading-relaxed ${
                  jsonError
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Case Converter Tab */}
      {activeTab === 'case' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Enter any text to convert across all formats:
            </label>
            <input
              type="text"
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'camelCase', val: toCamelCase(caseInput) },
              { label: 'PascalCase', val: toPascalCase(caseInput) },
              { label: 'snake_case', val: toSnakeCase(caseInput) },
              { label: 'kebab-case', val: toKebabCase(caseInput) },
              { label: 'CONSTANT_CASE', val: toConstantCase(caseInput) },
              { label: 'Title Case', val: toTitleCase(caseInput) },
              { label: 'UPPERCASE', val: caseInput.toUpperCase() },
              { label: 'lowercase', val: caseInput.toLowerCase() },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                    {item.label}
                  </div>
                  <div className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate select-all">
                    {item.val || '—'}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(item.val)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Base64 & URL Tab */}
      {activeTab === 'base64' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Input String / Payload
            </label>
            <textarea
              value={b64Input}
              onChange={(e) => setB64Input(e.target.value)}
              rows={4}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base64 */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Base64</span>
                <div className="flex bg-slate-200/80 dark:bg-slate-700 p-0.5 rounded-lg text-[11px]">
                  <button
                    onClick={() => setB64Mode('encode')}
                    className={`px-2 py-0.5 rounded-md font-medium ${b64Mode === 'encode' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    Encode
                  </button>
                  <button
                    onClick={() => setB64Mode('decode')}
                    className={`px-2 py-0.5 rounded-md font-medium ${b64Mode === 'decode' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    Decode
                  </button>
                </div>
              </div>
              <div className="font-mono text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg break-all min-h-[70px] select-all">
                {getBase64Output()}
              </div>
              <button
                onClick={() => copyToClipboard(getBase64Output())}
                className="w-full py-1.5 text-xs font-medium bg-slate-200/70 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Base64
              </button>
            </div>

            {/* URL Encode/Decode */}
            <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">URL Encoding</span>
                <div className="flex bg-slate-200/80 dark:bg-slate-700 p-0.5 rounded-lg text-[11px]">
                  <button
                    onClick={() => setUrlMode('encode')}
                    className={`px-2 py-0.5 rounded-md font-medium ${urlMode === 'encode' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    Encode
                  </button>
                  <button
                    onClick={() => setUrlMode('decode')}
                    className={`px-2 py-0.5 rounded-md font-medium ${urlMode === 'decode' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    Decode
                  </button>
                </div>
              </div>
              <div className="font-mono text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg break-all min-h-[70px] select-all">
                {getUrlOutput()}
              </div>
              <button
                onClick={() => copyToClipboard(getUrlOutput())}
                className="w-full py-1.5 text-xs font-medium bg-slate-200/70 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy URL Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Text Diff Tab */}
      {activeTab === 'diff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Original Text
              </label>
              <textarea
                value={diffOriginal}
                onChange={(e) => setDiffOriginal(e.target.value)}
                rows={5}
                className="w-full p-2.5 font-mono text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Modified Text
              </label>
              <textarea
                value={diffModified}
                onChange={(e) => setDiffModified(e.target.value)}
                rows={5}
                className="w-full p-2.5 font-mono text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Diff Comparison Breakdown</span>
              <div className="flex items-center gap-3 text-[11px] font-normal">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Added
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Removed / Changed
                </span>
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-950/60 font-mono text-xs space-y-1 divide-y divide-slate-100 dark:divide-slate-800/40 max-h-64 overflow-y-auto">
              {computeDiffLines().map((d, i) => (
                <div
                  key={i}
                  className={`py-1 px-2 rounded flex items-center justify-between gap-4 ${
                    d.type === 'added'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                      : d.type === 'removed'
                      ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 line-through'
                      : d.type === 'changed'
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{d.orig || d.mod}</span>
                  <span className="text-[10px] font-sans font-medium uppercase shrink-0 opacity-70">
                    {d.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Generator Tab */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* UUID v4 */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Random UUID v4 Generator
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={uuidCount}
                  onChange={(e) => setUuidCount(Number(e.target.value))}
                  className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200"
                >
                  <option value={1}>1 UUID</option>
                  <option value={3}>3 UUIDs</option>
                  <option value={5}>5 UUIDs</option>
                  <option value={10}>10 UUIDs</option>
                </select>
                <button
                  onClick={generateUuids}
                  className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {generatedUuids.map((id, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-2"
                >
                  <span className="text-slate-800 dark:text-slate-200 select-all">{id}</span>
                  <button
                    onClick={() => copyToClipboard(id)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* URL Slug */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Clean URL Slug Generator
            </span>
            <input
              type="text"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
            />
            <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold select-all">
                {slugInput
                  .toLowerCase()
                  .trim()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/[\s_-]+/g, '-')
                  .replace(/^-+|-+$/g, '')}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    slugInput
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s_-]+/g, '-')
                      .replace(/^-+|-+$/g, '')
                  )
                }
                className="p-1 text-slate-400 hover:text-indigo-600 rounded"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* SHA-256 Hash */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              SHA-256 Hash Calculator
            </span>
            <input
              type="text"
              value={hashInput}
              onChange={(e) => {
                setHashInput(e.target.value);
                calculateSha256(e.target.value);
              }}
              placeholder="Enter text to hash..."
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
            />
            <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between font-mono text-[11px] break-all">
              <span className="text-slate-800 dark:text-slate-200">{sha256Hash}</span>
              <button
                onClick={() => copyToClipboard(sha256Hash)}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded shrink-0 ml-2"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Regex Tester */}
      {activeTab === 'regex' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Regular Expression Pattern
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
                <span className="px-2.5 text-slate-400">/</span>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  className="flex-1 py-2 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <span className="px-2.5 text-slate-400">/</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Flags (g, i, m, s)
              </label>
              <input
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                className="w-full px-3 py-2 font-mono text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Test String
            </label>
            <textarea
              value={regexTestString}
              onChange={(e) => setRegexTestString(e.target.value)}
              rows={4}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
            />
          </div>

          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Matches Found ({regexResult.matches.length})
              </span>
              {!regexResult.isValid && (
                <span className="text-xs text-rose-500 font-medium">Invalid Regular Expression</span>
              )}
            </div>

            {regexResult.matches.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {regexResult.matches.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-md font-mono text-xs border border-indigo-200 dark:border-indigo-800"
                  >
                    {m[0]}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-1">No matches found in the provided test string.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
