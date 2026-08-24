import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Sliders, 
  Sun, 
  Moon, 
  Hourglass,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { WorldClockCity } from '../../types';
import { formatIndianDate } from '../../utils/india';

const INITIAL_CITIES: WorldClockCity[] = [
  ...['New Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Shivamogga'].map((name, index) => ({ id: `in-${index}`, name, timezone: 'Asia/Kolkata', country: 'India' })),
  { id: 'world-1', name: 'London', timezone: 'Europe/London', country: 'United Kingdom' },
  { id: 'world-2', name: 'New York', timezone: 'America/New_York', country: 'United States' },
  { id: 'world-3', name: 'Dubai', timezone: 'Asia/Dubai', country: 'United Arab Emirates' },
  { id: 'world-4', name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
  { id: 'world-5', name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' },
  { id: 'world-6', name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
];

const AVAILABLE_ADD_CITIES = [
  { name: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany' },
  { name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'Hong Kong' },
  { name: 'Toronto', timezone: 'America/Toronto', country: 'Canada' },
  { name: 'Cairo', timezone: 'Africa/Cairo', country: 'Egypt' },
  { name: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea' },
];

export const TimezoneTool: React.FC = () => {
  const [cities, setCities] = useState<WorldClockCity[]>(() => {
    const saved = localStorage.getItem('omni_cities');
    return saved ? JSON.parse(saved) : INITIAL_CITIES;
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [sliderHourOffset, setSliderHourOffset] = useState<number>(0);
  const [useSlider, setUseSlider] = useState(false);

  // Date duration calculator state
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [birthDate, setBirthDate] = useState('2000-01-01');

  useEffect(() => {
    localStorage.setItem('omni_cities', JSON.stringify(cities));
  }, [cities]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!useSlider) {
        setCurrentTime(new Date());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [useSlider]);

  const effectiveTime = useSlider
    ? new Date(Date.now() + sliderHourOffset * 60 * 60 * 1000)
    : currentTime;

  const removeCity = (id: string) => {
    if (cities.length <= 1) return;
    setCities((prev) => prev.filter((c) => c.id !== id));
  };

  const addCity = (city: { name: string; timezone: string; country: string }) => {
    if (cities.some((c) => c.name === city.name)) return;
    setCities((prev) => [...prev, { id: Date.now().toString(), ...city }]);
  };

  const getCityTime = (tz: string) => {
    try {
      const timeStr = effectiveTime.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: useSlider ? undefined : '2-digit',
        hour12: true,
      });
      const zonedDateParts = effectiveTime.toLocaleDateString('en-CA', { timeZone: tz }).split('-').map(Number);
      const dateStr = formatIndianDate(new Date(zonedDateParts[0], zonedDateParts[1] - 1, zonedDateParts[2]));
      const hour24 = parseInt(
        effectiveTime.toLocaleTimeString('en-US', {
          timeZone: tz,
          hour: 'numeric',
          hour12: false,
        }),
        10
      );
      const isDaytime = hour24 >= 7 && hour24 <= 19;
      return { timeStr, dateStr, hour24, isDaytime };
    } catch {
      return { timeStr: '--:--', dateStr: 'Invalid TZ', hour24: 12, isDaytime: true };
    }
  };

  // Date difference calculation
  const calculateDaysDiff = () => {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const remDays = diffDays % 7;
    return { diffDays, weeks, remDays };
  };

  // Age calculator
  const calculateExactAge = () => {
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return { years, months, days, totalDays };
  };

  const diffResult = calculateDaysDiff();
  const ageResult = calculateExactAge();

  return (
    <div className="space-y-6">
      {/* World Clock & Timezone Planner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-base">
                World Clock & Meeting Planner
              </h2>
              <p className="text-[11px] text-slate-400">
                Compare global timezones and slide across hours to coordinate meetings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setUseSlider(!useSlider);
                setSliderHourOffset(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                useSlider
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              {useSlider ? 'Reset to Live Time' : 'Time Slider Mode'}
            </button>
          </div>
        </div>
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">IST — Indian Standard Time (UTC+5:30)</p>

        {/* Time Slider Bar */}
        {useSlider && (
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-indigo-900 dark:text-indigo-300">
                Offset: {sliderHourOffset >= 0 ? `+${sliderHourOffset}` : sliderHourOffset} Hours from Now
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Simulated Time: {effectiveTime.toLocaleTimeString()}
              </span>
            </div>
            <input
              type="range"
              min={-12}
              max={24}
              step={0.5}
              value={sliderHourOffset}
              onChange={(e) => setSliderHourOffset(parseFloat(e.target.value))}
              className="w-full h-2 bg-indigo-200 dark:bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-12 hrs</span>
              <span>Now (0h)</span>
              <span>+12 hrs</span>
              <span>+24 hrs</span>
            </div>
          </div>
        )}

        {/* Cities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {cities.map((city) => {
            const { timeStr, dateStr, isDaytime } = getCityTime(city.timezone);
            return (
              <div
                key={city.id}
                className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl relative group hover:border-slate-300 transition-all"
              >
                <button
                  onClick={() => removeCity(city.id)}
                  className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove city"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {isDaytime ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span className="font-medium truncate">{city.country}</span>
                </div>

                <div className="font-bold text-slate-900 dark:text-white text-base truncate">
                  {city.name}
                </div>

                <div className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {timeStr}
                </div>

                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add More Cities */}
        <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Quick Add:</span>
          {AVAILABLE_ADD_CITIES.filter((ac) => !cities.some((c) => c.name === ac.name)).map(
            (ac, idx) => (
              <button
                key={idx}
                onClick={() => addCity(ac)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" /> {ac.name}
              </button>
            )
          )}
        </div>
      </div>

      {/* Date & Age Duration Calculators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Days Between Dates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Date Duration & Days Calculator
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-around text-center">
            <div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {diffResult.diffDays}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Total Days</div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {diffResult.weeks} w {diffResult.remDays} d
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Weeks & Days</div>
            </div>
          </div>
        </div>

        {/* Exact Age & Milestone Calculator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Exact Age & Lifetime Analytics
            </h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-around text-center">
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {ageResult.years} <span className="text-xs font-normal text-slate-400">yrs</span>{' '}
                {ageResult.months} <span className="text-xs font-normal text-slate-400">mos</span>{' '}
                {ageResult.days} <span className="text-xs font-normal text-slate-400">d</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Exact Age Today</div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {ageResult.totalDays.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Days on Earth</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
