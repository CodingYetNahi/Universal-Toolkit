// High-precision conversion utilities for all standard everyday metrics

export type UnitType = 'length' | 'weight' | 'temperature' | 'speed' | 'storage' | 'area';

export interface UnitOption {
  id: string;
  name: string;
  symbol: string;
  ratioToBase: number; // relative to base unit (e.g. meter, gram, etc.)
}

export const UNIT_CATEGORIES: Record<UnitType, { name: string; base: string; units: UnitOption[] }> = {
  length: {
    name: 'Length & Distance',
    base: 'm',
    units: [
      { id: 'mm', name: 'Millimeter', symbol: 'mm', ratioToBase: 0.001 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', ratioToBase: 0.01 },
      { id: 'm', name: 'Meter', symbol: 'm', ratioToBase: 1 },
      { id: 'km', name: 'Kilometer', symbol: 'km', ratioToBase: 1000 },
      { id: 'in', name: 'Inch', symbol: 'in', ratioToBase: 0.0254 },
      { id: 'ft', name: 'Foot', symbol: 'ft', ratioToBase: 0.3048 },
      { id: 'yd', name: 'Yard', symbol: 'yd', ratioToBase: 0.9144 },
      { id: 'mi', name: 'Mile', symbol: 'mi', ratioToBase: 1609.344 },
      { id: 'nmi', name: 'Nautical Mile', symbol: 'nmi', ratioToBase: 1852 },
    ],
  },
  weight: {
    name: 'Mass & Weight',
    base: 'g',
    units: [
      { id: 'mg', name: 'Milligram', symbol: 'mg', ratioToBase: 0.001 },
      { id: 'g', name: 'Gram', symbol: 'g', ratioToBase: 1 },
      { id: 'kg', name: 'Kilogram', symbol: 'kg', ratioToBase: 1000 },
      { id: 't', name: 'Metric Ton', symbol: 't', ratioToBase: 1000000 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', ratioToBase: 28.349523125 },
      { id: 'lb', name: 'Pound', symbol: 'lb', ratioToBase: 453.59237 },
      { id: 'stone', name: 'Stone (UK)', symbol: 'st', ratioToBase: 6350.29318 },
    ],
  },
  temperature: {
    name: 'Temperature',
    base: 'C',
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', ratioToBase: 1 },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', ratioToBase: 1 },
      { id: 'k', name: 'Kelvin', symbol: 'K', ratioToBase: 1 },
    ],
  },
  speed: {
    name: 'Speed & Velocity',
    base: 'm/s',
    units: [
      { id: 'mps', name: 'Meters per second', symbol: 'm/s', ratioToBase: 1 },
      { id: 'kmh', name: 'Kilometers per hour', symbol: 'km/h', ratioToBase: 0.277778 },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph', ratioToBase: 0.44704 },
      { id: 'knot', name: 'Knot', symbol: 'kn', ratioToBase: 0.514444 },
      { id: 'fps', name: 'Feet per second', symbol: 'ft/s', ratioToBase: 0.3048 },
    ],
  },
  storage: {
    name: 'Digital Data Storage',
    base: 'B',
    units: [
      { id: 'b', name: 'Bit', symbol: 'b', ratioToBase: 0.125 },
      { id: 'B', name: 'Byte', symbol: 'B', ratioToBase: 1 },
      { id: 'KB', name: 'Kilobyte (KB)', symbol: 'KB', ratioToBase: 1024 },
      { id: 'MB', name: 'Megabyte (MB)', symbol: 'MB', ratioToBase: 1048576 },
      { id: 'GB', name: 'Gigabyte (GB)', symbol: 'GB', ratioToBase: 1073741824 },
      { id: 'TB', name: 'Terabyte (TB)', symbol: 'TB', ratioToBase: 1099511627776 },
      { id: 'PB', name: 'Petabyte (PB)', symbol: 'PB', ratioToBase: 1125899906842624 },
    ],
  },
  area: {
    name: 'Area & Land',
    base: 'sqm',
    units: [
      { id: 'sqm', name: 'Square Meter', symbol: 'm²', ratioToBase: 1 },
      { id: 'sqkm', name: 'Square Kilometer', symbol: 'km²', ratioToBase: 1000000 },
      { id: 'sqft', name: 'Square Foot', symbol: 'ft²', ratioToBase: 0.09290304 },
      { id: 'sqyd', name: 'Square Yard', symbol: 'yd²', ratioToBase: 0.83612736 },
      { id: 'acre', name: 'Acre', symbol: 'ac', ratioToBase: 4046.8564224 },
      { id: 'hectare', name: 'Hectare', symbol: 'ha', ratioToBase: 10000 },
      { id: 'guntha', name: 'Guntha', symbol: 'guntha', ratioToBase: 1089 * 0.09290304 },
      { id: 'cent', name: 'Cent', symbol: 'cent', ratioToBase: 435.6 * 0.09290304 },
      { id: 'kanal', name: 'Standard Kanal', symbol: 'kanal', ratioToBase: 5445 * 0.09290304 },
      { id: 'marla', name: 'Standard Marla', symbol: 'marla', ratioToBase: 272.25 * 0.09290304 },
    ],
  },
};

export function convertUnit(
  category: UnitType,
  fromUnitId: string,
  toUnitId: string,
  value: number
): number {
  if (isNaN(value)) return 0;
  if (fromUnitId === toUnitId) return value;

  if (category === 'temperature') {
    // Temperature special conversion
    let celsius = value;
    if (fromUnitId === 'f') celsius = ((value - 32) * 5) / 9;
    if (fromUnitId === 'k') celsius = value - 273.15;

    if (toUnitId === 'c') return celsius;
    if (toUnitId === 'f') return (celsius * 9) / 5 + 32;
    if (toUnitId === 'k') return celsius + 273.15;
    return value;
  }

  const categoryDef = UNIT_CATEGORIES[category];
  const fromUnit = categoryDef.units.find((u) => u.id === fromUnitId);
  const toUnit = categoryDef.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) return value;

  const baseValue = value * fromUnit.ratioToBase;
  return baseValue / toUnit.ratioToBase;
}
