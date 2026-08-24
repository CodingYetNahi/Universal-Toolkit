/** India-specific, client-side formatting and finance helpers. */
export const parseSafeNumber = (value: string | number, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value.trim().replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const roundTo = (value: number, places = 2): number => {
  const factor = 10 ** Math.max(0, places);
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const formatIndianNumber = (value: number, maximumFractionDigits = 2): string =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits }).format(value);

export const formatINR = (value: number, maximumFractionDigits = 2): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits,
  }).format(value);

export const formatLakhCrore = (value: number): string => {
  const absolute = Math.abs(value);
  if (absolute >= 10_000_000) return `${formatIndianNumber(value / 10_000_000, 2)} crore`;
  if (absolute >= 100_000) return `${formatIndianNumber(value / 100_000, 2)} lakh`;
  return formatIndianNumber(value);
};

export const formatIndianDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

export const calculateGst = (amount: number, rate: number, inclusive: boolean) => {
  const taxable = inclusive ? amount / (1 + rate / 100) : amount;
  const gst = amount < 0 || rate < 0 ? 0 : taxable * rate / 100;
  return { taxable: roundTo(taxable), gst: roundTo(gst), total: roundTo(inclusive ? amount : amount + gst) };
};

export const calculateEmi = (principal: number, annualRate: number, months: number) => {
  if (principal < 0 || annualRate < 0 || months <= 0) return null;
  const monthlyRate = annualRate / 1200;
  const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
  const repayment = emi * months;
  return { emi, interest: Math.max(0, repayment - principal), repayment };
};

export const calculateSip = (monthly: number, annualRate: number, months: number) => {
  if (monthly < 0 || annualRate < 0 || months <= 0) return null;
  const rate = annualRate / 1200;
  const maturity = rate === 0 ? monthly * months : monthly * (((1 + rate) ** months - 1) / rate) * (1 + rate);
  const invested = monthly * months;
  return { invested, gain: maturity - invested, maturity };
};

export const calculateFd = (principal: number, annualRate: number, years: number, frequency: number) => {
  if (principal < 0 || annualRate < 0 || years <= 0 || frequency <= 0) return null;
  const maturity = principal * (1 + annualRate / 100 / frequency) ** (frequency * years);
  return { interest: maturity - principal, maturity };
};

export const calculateRd = (monthly: number, annualRate: number, months: number) => {
  if (monthly < 0 || annualRate < 0 || months <= 0) return null;
  const rate = annualRate / 1200;
  const maturity = rate === 0 ? monthly * months : monthly * (((1 + rate) ** months - 1) / rate) * (1 + rate);
  const deposits = monthly * months;
  return { deposits, interest: maturity - deposits, maturity };
};
