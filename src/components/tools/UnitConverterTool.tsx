import React, { useState } from 'react';
import { 
  Ruler, 
  Scale, 
  Thermometer, 
  Gauge, 
  HardDrive, 
  Square, 
  ArrowRightLeft, 
  Copy, 
  Check,
  Sparkles
} from 'lucide-react';
import { UnitType, UNIT_CATEGORIES, convertUnit } from '../../utils/converters';

export const UnitConverterTool: React.FC = () => {
  const [category, setCategory] = useState<UnitType>('length');
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categoryDef = UNIT_CATEGORIES[category];

  const handleCategoryChange = (newCat: UnitType) => {
    setCategory(newCat);
    const units = UNIT_CATEGORIES[newCat].units;
    setFromUnit(units[0].id);
    setToUnit(units[1] ? units[1].id : units[0].id);
  };

  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const directConvertedValue = convertUnit(category, fromUnit, toUnit, inputValue);

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return '0';
    if (Math.abs(num) < 0.0001 && num !== 0) {
      return num.toExponential(4);
    }
    return Number(num.toFixed(6)).toString();
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getCategoryIcon = (cat: UnitType) => {
    switch (cat) {
      case 'length': return <Ruler className="w-4 h-4" />;
      case 'weight': return <Scale className="w-4 h-4" />;
      case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'speed': return <Gauge className="w-4 h-4" />;
      case 'storage': return <HardDrive className="w-4 h-4" />;
      case 'area': return <Square className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {(Object.keys(UNIT_CATEGORIES) as UnitType[]).map((catKey) => {
          const cat = UNIT_CATEGORIES[catKey];
          const isActive = category === catKey;
          return (
            <button
              key={catKey}
              onClick={() => handleCategoryChange(catKey)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {getCategoryIcon(catKey)}
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Converter Box */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-slate-50/70 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        {/* From Input */}
        <div className="md:col-span-5 space-y-2">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
            From Value & Unit
          </label>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2.5 text-base font-semibold bg-transparent text-slate-900 dark:text-white focus:outline-none"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              {categoryDef.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center py-2">
          <button
            onClick={handleSwapUnits}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-xs"
            title="Swap Units"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To Result */}
        <div className="md:col-span-5 space-y-2">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
            To Converted Result
          </label>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <input
              type="text"
              readOnly
              value={formatNumber(directConvertedValue)}
              className="flex-1 px-3 py-2.5 text-base font-semibold bg-transparent text-indigo-600 dark:text-indigo-400 focus:outline-none select-all"
            />
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              {categoryDef.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Category Conversion Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Equivalent Values in All {categoryDef.name} Units
          </h3>
          <span className="text-[11px] text-slate-400">
            Based on: {inputValue} {categoryDef.units.find((u) => u.id === fromUnit)?.symbol}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryDef.units.map((unit, idx) => {
            const val = convertUnit(category, fromUnit, unit.id, inputValue);
            const isSource = unit.id === fromUnit;
            const formatted = formatNumber(val);

            return (
              <div
                key={unit.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isSource
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    {unit.name} ({unit.symbol})
                  </div>
                  <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5 select-all">
                    {formatted}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(formatted, idx)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Copy value"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
