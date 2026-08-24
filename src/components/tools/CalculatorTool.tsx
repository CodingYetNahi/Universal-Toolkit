import React, { useState } from 'react';
import { 
  Calculator, 
  Receipt, 
  Percent, 
  Tag, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ArrowRight,
  PieChart
} from 'lucide-react';
import { calculateEmi, calculateFd, calculateGst, calculateRd, calculateSip, formatINR, parseSafeNumber } from '../../utils/india';

type CalcMode = 'tip' | 'percentage' | 'discount' | 'compound' | 'india';

export const CalculatorTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalcMode>('india');

  // 1. Tip & Bill Split State
  const [billAmount, setBillAmount] = useState<number>(85);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [taxPercent, setTaxPercent] = useState<number>(8.5);
  const [splitCount, setSplitCount] = useState<number>(2);

  const calculateTipBreakdown = () => {
    const bill = Math.max(0, billAmount);
    const tax = (bill * Math.max(0, taxPercent)) / 100;
    const tip = (bill * Math.max(0, tipPercent)) / 100;
    const total = bill + tax + tip;
    const people = Math.max(1, splitCount);
    const perPerson = total / people;
    const tipPerPerson = tip / people;
    return { tax, tip, total, perPerson, tipPerPerson };
  };

  // 2. Percentage Calculator State
  const [p1X, setP1X] = useState<number>(15);
  const [p1Y, setP1Y] = useState<number>(200);

  const [p2X, setP2X] = useState<number>(45);
  const [p2Y, setP2Y] = useState<number>(150);

  const [p3From, setP3From] = useState<number>(80);
  const [p3To, setP3To] = useState<number>(120);

  // 3. Discount Calculator State
  const [originalPrice, setOriginalPrice] = useState<number>(120);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [salesTax, setSalesTax] = useState<number>(7);

  const calculateDiscount = () => {
    const orig = Math.max(0, originalPrice);
    const savings = (orig * Math.max(0, discountPercent)) / 100;
    const discounted = orig - savings;
    const tax = (discounted * Math.max(0, salesTax)) / 100;
    const finalPrice = discounted + tax;
    return { savings, discounted, tax, finalPrice };
  };

  // 4. Compound Interest State
  const [principal, setPrincipal] = useState<number>(5000);
  const [monthlyAddition, setMonthlyAddition] = useState<number>(200);
  const [annualRate, setAnnualRate] = useState<number>(7);
  const [years, setYears] = useState<number>(10);

  const calculateCompoundInterest = () => {
    const p = Math.max(0, principal);
    const pmt = Math.max(0, monthlyAddition);
    const r = Math.max(0, annualRate) / 100 / 12;
    const n = Math.max(1, years) * 12;

    let balance = p;
    let totalInvested = p;

    for (let i = 0; i < n; i++) {
      balance = balance * (1 + r) + pmt;
      totalInvested += pmt;
    }

    const totalInterest = Math.max(0, balance - totalInvested);
    return { totalInvested, totalInterest, finalBalance: balance };
  };

  const tipData = calculateTipBreakdown();
  const discData = calculateDiscount();
  const compoundData = calculateCompoundInterest();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('india')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${activeTab === 'india' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
        >
          <Calculator className="w-3.5 h-3.5" /> India Finance
        </button>
        <button
          onClick={() => setActiveTab('tip')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === 'tip'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Tip & Bill Splitter
        </button>
        <button
          onClick={() => setActiveTab('percentage')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === 'percentage'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          Percentage Solver
        </button>
        <button
          onClick={() => setActiveTab('discount')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === 'discount'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Discount & Sale Price
        </button>
        <button
          onClick={() => setActiveTab('compound')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === 'compound'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Compound Growth
        </button>
      </div>

      {/* 1. Tip & Bill Splitter */}
      {activeTab === 'tip' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Bill Subtotal ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 text-base font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Tip Percentage ({tipPercent}%)
              </label>
              <div className="flex gap-2 flex-wrap mb-2">
                {[10, 15, 18, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTipPercent(pct)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      tipPercent === pct
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={tipPercent}
                onChange={(e) => setTipPercent(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Tax (%)
                </label>
                <input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Split Among (People)
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  <input
                    type="number"
                    min={1}
                    value={splitCount}
                    onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full py-1.5 text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Breakdown & Totals
            </h3>

            <div className="p-4 bg-indigo-600 text-white rounded-xl text-center space-y-1 shadow-sm">
              <div className="text-xs text-indigo-200 font-medium">Per Person Total</div>
              <div className="text-3xl font-extrabold tracking-tight">
                ${tipData.perPerson.toFixed(2)}
              </div>
              <div className="text-[11px] text-indigo-200">
                (includes ${(tipData.tipPerPerson).toFixed(2)} tip)
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-200 dark:divide-slate-800">
              <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">${billAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                <span>Estimated Tax ({taxPercent}%):</span>
                <span className="font-semibold text-slate-900 dark:text-white">${tipData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                <span>Tip Amount ({tipPercent}%):</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">+${tipData.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Bill:</span>
                <span>${tipData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Percentage Solver */}
      {activeTab === 'percentage' && (
        <div className="space-y-5">
          {/* Formula 1: What is X% of Y? */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">What is</span>
            <input
              type="number"
              value={p1X}
              onChange={(e) => setP1X(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">% of</span>
            <input
              type="number"
              value={p1Y}
              onChange={(e) => setP1Y(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            />
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
              {((p1X / 100) * p1Y).toFixed(2)}
            </span>
          </div>

          {/* Formula 2: X is what % of Y? */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={p2X}
              onChange={(e) => setP2X(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">is what % of</span>
            <input
              type="number"
              value={p2Y}
              onChange={(e) => setP2Y(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            />
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
              {p2Y !== 0 ? `${((p2X / p2Y) * 100).toFixed(2)}%` : '0%'}
            </span>
          </div>

          {/* Formula 3: % Increase / Decrease */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Percentage change from</span>
            <input
              type="number"
              value={p3From}
              onChange={(e) => setP3From(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">to</span>
            <input
              type="number"
              value={p3To}
              onChange={(e) => setP3To(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
            />
            <ArrowRight className="w-4 h-4 text-slate-400" />
            {p3From !== 0 ? (
              <span
                className={`font-mono text-base font-bold ${
                  p3To >= p3From
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {p3To >= p3From ? '+' : ''}
                {(((p3To - p3From) / p3From) * 100).toFixed(2)}%
                {p3To >= p3From ? ' (Increase)' : ' (Decrease)'}
              </span>
            ) : (
              <span className="font-mono text-base font-bold text-slate-400">0%</span>
            )}
          </div>
        </div>
      )}

      {/* 3. Discount Calculator */}
      {activeTab === 'discount' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Original Item Price ($)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-base font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Discount ({discountPercent}%)
              </label>
              <input
                type="range"
                min={0}
                max={90}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Sales Tax (%)
              </label>
              <input
                type="number"
                value={salesTax}
                onChange={(e) => setSalesTax(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Final Price You Pay</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              ${discData.finalPrice.toFixed(2)}
            </div>
            <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-full">
              You Save: ${discData.savings.toFixed(2)} ({discountPercent}%)
            </div>
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
              Tax included: ${discData.tax.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* 4. Compound Growth Calculator */}
      {activeTab === 'compound' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Initial Principal ($)
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Monthly Contribution ($)
              </label>
              <input
                type="number"
                value={monthlyAddition}
                onChange={(e) => setMonthlyAddition(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Annual Return ({annualRate}%)
                </label>
                <input
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Time Period ({years} Yrs)
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase font-semibold">Future Estimated Balance</div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                ${Math.round(compoundData.finalBalance).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Principal & Deposits:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${Math.round(compoundData.totalInvested).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Compound Interest Earned:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  +${Math.round(compoundData.totalInterest).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'india' && <IndiaFinance />}
    </div>
  );
};

type FinanceMode = 'gst' | 'emi' | 'sip' | 'fd' | 'rd';
const fieldClass = 'w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white';
const Result = ({ label, value }: { label: string; value: number }) => <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3"><div className="text-[11px] text-slate-500">{label}</div><div className="font-bold text-indigo-700 dark:text-indigo-300 break-words">{formatINR(value)}</div></div>;

const IndiaFinance = () => {
  const [mode, setMode] = useState<FinanceMode>('gst');
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState('18');
  const [gstInclusive, setGstInclusive] = useState(false);
  const [tenure, setTenure] = useState('5');
  const [tenureUnit, setTenureUnit] = useState<'months' | 'years'>('years');
  const [frequency, setFrequency] = useState('4');
  const numericAmount = parseSafeNumber(amount, NaN);
  const numericRate = parseSafeNumber(rate, NaN);
  const numericTenure = parseSafeNumber(tenure, NaN);
  const months = tenureUnit === 'years' ? numericTenure * 12 : numericTenure;
  const commonInvalid = !Number.isFinite(numericAmount) || numericAmount < 0 || !Number.isFinite(numericRate) || numericRate < 0;
  const tenureInvalid = !Number.isFinite(months) || months <= 0;
  const gst = !commonInvalid && numericRate <= 100 ? calculateGst(numericAmount, numericRate, gstInclusive) : null;
  const emi = !commonInvalid && !tenureInvalid ? calculateEmi(numericAmount, numericRate, months) : null;
  const sip = !commonInvalid && !tenureInvalid ? calculateSip(numericAmount, numericRate, months) : null;
  const fd = !commonInvalid && !tenureInvalid ? calculateFd(numericAmount, numericRate, months / 12, parseSafeNumber(frequency)) : null;
  const rd = !commonInvalid && !tenureInvalid ? calculateRd(numericAmount, numericRate, months) : null;
  const data = mode === 'gst' ? gst : mode === 'emi' ? emi : mode === 'sip' ? sip : mode === 'fd' ? fd : rd;

  return <section className="space-y-5" aria-labelledby="india-finance-heading">
    <div><h2 id="india-finance-heading" className="text-lg font-bold">India Finance</h2><p className="text-xs text-slate-500">Private, client-side estimates with Indian number formatting.</p></div>
    <div className="flex gap-2 overflow-x-auto pb-1">{(['gst', 'emi', 'sip', 'fd', 'rd'] as FinanceMode[]).map((item) => <button key={item} onClick={() => setMode(item)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${mode === item ? 'bg-teal-700 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{item.toUpperCase()} Calculator</button>)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="space-y-4">
        <label className="block text-xs font-medium">{mode === 'gst' ? (gstInclusive ? 'Invoice value (inclusive of GST)' : 'Taxable value') : mode === 'emi' ? 'Loan amount' : mode === 'sip' ? 'Monthly investment' : mode === 'fd' ? 'Deposit amount' : 'Monthly deposit'} (₹)<input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={`mt-1 ${fieldClass}`} /></label>
        {!Number.isFinite(numericAmount) || numericAmount < 0 ? <p className="text-xs text-rose-600">Enter a valid non-negative amount.</p> : null}
        <label className="block text-xs font-medium">{mode === 'gst' ? 'GST rate' : mode === 'sip' ? 'Expected annual return' : 'Annual interest rate'} (%)<input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className={`mt-1 ${fieldClass}`} /></label>
        {!Number.isFinite(numericRate) || numericRate < 0 || (mode === 'gst' && numericRate > 100) ? <p className="text-xs text-rose-600">Enter a valid rate{mode === 'gst' ? ' from 0% to 100%' : ''}.</p> : null}
        {mode === 'gst' && <><div className="flex flex-wrap gap-2">{[0, 5, 12, 18, 28].map((preset) => <button key={preset} onClick={() => setRate(String(preset))} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs">{preset}%</button>)}</div><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={gstInclusive} onChange={(e) => setGstInclusive(e.target.checked)} /> Invoice amount includes GST</label></>}
        {mode !== 'gst' && <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Tenure<input type="number" min="0" step="1" value={tenure} onChange={(e) => setTenure(e.target.value)} className={`mt-1 ${fieldClass}`} /></label><label className="text-xs font-medium">Unit<select value={tenureUnit} onChange={(e) => setTenureUnit(e.target.value as 'months' | 'years')} className={`mt-1 ${fieldClass}`}><option value="months">Months</option><option value="years">Years</option></select></label></div>}
        {mode !== 'gst' && tenureInvalid && <p className="text-xs text-rose-600">Tenure must be greater than zero.</p>}
        {mode === 'fd' && <label className="block text-xs font-medium">Compounding frequency<select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={`mt-1 ${fieldClass}`}><option value="1">Annually</option><option value="2">Half-yearly</option><option value="4">Quarterly</option><option value="12">Monthly</option></select></label>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start" aria-live="polite">
        {!data ? <p className="text-sm text-slate-500 sm:col-span-2">Complete valid inputs to see an estimate.</p> : mode === 'gst' && gst ? <><Result label="Taxable value" value={gst.taxable} /><Result label="GST amount" value={gst.gst} /><Result label="Final invoice value" value={gst.total} /><Result label="CGST (intra-state illustration)" value={gst.gst / 2} /><Result label="SGST (intra-state illustration)" value={gst.gst / 2} /><Result label="IGST (inter-state illustration)" value={gst.gst} /></> : mode === 'emi' && emi ? <><Result label="Monthly EMI" value={emi.emi} /><Result label="Total interest" value={emi.interest} /><Result label="Total repayment" value={emi.repayment} /><Result label="Principal" value={numericAmount} /></> : mode === 'sip' && sip ? <><Result label="Total invested" value={sip.invested} /><Result label="Estimated gain" value={sip.gain} /><Result label="Estimated maturity value" value={sip.maturity} /></> : mode === 'fd' && fd ? <><Result label="Interest earned" value={fd.interest} /><Result label="Maturity amount" value={fd.maturity} /></> : rd ? <><Result label="Total deposits" value={rd.deposits} /><Result label="Estimated interest" value={rd.interest} /><Result label="Estimated maturity value" value={rd.maturity} /></> : null}
      </div>
    </div>
    <p className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-slate-600 dark:text-slate-300">{mode === 'gst' ? 'GST results are estimates; confirm tax treatment for actual transactions.' : mode === 'sip' || mode === 'rd' ? 'Returns are illustrative and not guaranteed.' : mode === 'fd' ? 'Estimate excludes tax and TDS.' : 'EMI is an estimate; lender schedules and charges may differ.'}</p>
  </section>;
};
