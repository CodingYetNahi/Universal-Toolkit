import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Waves, 
  Flame, 
  Sparkles, 
  Radio, 
  Activity, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2,
  Coffee,
  Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ambientAudio } from '../../utils/audioSynthesizer';
import { ChecklistTask } from '../../types';

interface SoundItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  desc: string;
  volume: number;
  active: boolean;
}

export const FocusAudioTool: React.FC = () => {
  // Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Soundscapes State
  const [sounds, setSounds] = useState<SoundItem[]>([
    { id: 'rain', name: 'Gentle Rain', icon: <CloudRain className="w-4 h-4" />, desc: 'Calming soft rainfall', volume: 0.5, active: false },
    { id: 'ocean', name: 'Ocean Waves', icon: <Waves className="w-4 h-4" />, desc: 'Rhythmic sea swell', volume: 0.5, active: false },
    { id: 'campfire', name: 'Campfire', icon: <Flame className="w-4 h-4" />, desc: 'Cozy hearth & crackle', volume: 0.5, active: false },
    { id: 'pink_noise', name: 'Pink Noise', icon: <Radio className="w-4 h-4" />, desc: 'Deep focus acoustic balance', volume: 0.4, active: false },
    { id: 'white_noise', name: 'White Noise', icon: <Activity className="w-4 h-4" />, desc: 'Blocks distracting chatter', volume: 0.3, active: false },
    { id: 'alpha_wave', name: '10Hz Alpha Tone', icon: <Brain className="w-4 h-4" />, desc: 'Binaural flow-state beat', volume: 0.3, active: false },
    { id: 'indian_monsoon', name: 'Indian Monsoon', icon: <CloudRain className="w-4 h-4" />, desc: 'Soft, steady monsoon rain', volume: 0.35, active: false },
    { id: 'courtyard', name: 'Quiet Courtyard Morning', icon: <Sparkles className="w-4 h-4" />, desc: 'Gentle airy morning ambience', volume: 0.25, active: false },
    { id: 'train', name: 'Gentle Train Journey', icon: <Activity className="w-4 h-4" />, desc: 'Low, even travelling rhythm', volume: 0.25, active: false },
  ]);

  // Tasks State
  const [tasks, setTasks] = useState<ChecklistTask[]>(() => {
    const saved = localStorage.getItem('omni_tasks');
    return saved
      ? JSON.parse(saved)
      : [
          { id: '1', text: 'Review today’s key priorities', completed: true, createdAt: Date.now() - 100000 },
          { id: '2', text: 'Complete uninterrupted 25-minute focus session', completed: false, createdAt: Date.now() },
        ];
  });
  const [newTaskInput, setNewTaskInput] = useState('');

  useEffect(() => {
    localStorage.setItem('omni_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // fallback
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      ambientAudio.stopAll();
    };
  }, []);

  const handleModeChange = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === 'focus') setTimeLeft(25 * 60);
    if (mode === 'shortBreak') setTimeLeft(5 * 60);
    if (mode === 'longBreak') setTimeLeft(15 * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'focus') setTimeLeft(25 * 60);
    if (timerMode === 'shortBreak') setTimeLeft(5 * 60);
    if (timerMode === 'longBreak') setTimeLeft(15 * 60);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Sound Toggles
  const toggleSound = (id: string) => {
    setSounds((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextActive = !s.active;
          if (nextActive) {
            ambientAudio.startSound(s.id, s.volume);
          } else {
            ambientAudio.stopSound(s.id);
          }
          return { ...s, active: nextActive };
        }
        return s;
      })
    );
  };

  const setSoundVolume = (id: string, vol: number) => {
    setSounds((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          ambientAudio.setVolume(id, vol);
          return { ...s, volume: vol };
        }
        return s;
      })
    );
  };

  const stopAllSounds = () => {
    ambientAudio.stopAll();
    setSounds((prev) => prev.map((s) => ({ ...s, active: false })));
  };

  // Task Actions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: ChecklistTask = {
      id: Date.now().toString(),
      text: newTaskInput.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskInput('');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            try {
              confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.7 },
              });
            } catch {
              // ignore
            }
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const totalTimeForMode = timerMode === 'focus' ? 25 * 60 : timerMode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalTimeForMode - timeLeft) / totalTimeForMode) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Pomodoro Timer & Tasks */}
      <div className="lg:col-span-6 space-y-6">
        {/* Timer Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
          {/* Mode Switchers */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
            <button
              onClick={() => handleModeChange('focus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                timerMode === 'focus'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Brain className="w-3.5 h-3.5" /> Focus (25m)
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                timerMode === 'shortBreak'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" /> Short Break (5m)
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                timerMode === 'longBreak'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" /> Long Break (15m)
            </button>
          </div>

          {/* Clock Dial Display */}
          <div className="relative my-2">
            <div className="font-mono text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formatTimer(timeLeft)}
            </div>
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
              {isRunning ? 'Session Active' : 'Ready to begin'}
            </div>
          </div>

          {/* Progress Line */}
          <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full my-6 overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-1000 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-timer"
              onClick={toggleTimer}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-xs"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button
              onClick={resetTimer}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Checklist */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Focus Checklist
            </h3>
            <span className="text-xs text-slate-400">
              {tasks.filter((t) => t.completed).length}/{tasks.length} Done
            </span>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a task to accomplish..."
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold transition-colors"
            >
              Add
            </button>
          </form>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  task.completed
                    ? 'bg-slate-50/50 dark:bg-slate-950/30 border-transparent text-slate-400 line-through'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                  <span className="text-xs truncate">{task.text}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-400">All clear! Add a task above.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Ambient Soundscapes Studio */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Ambient Soundscapes
              </h3>
              <p className="text-[11px] text-slate-400">
                Synthesized live in your browser — zero downloads, pure focus.
              </p>
            </div>
            {sounds.some((s) => s.active) && (
              <button
                onClick={stopAllSounds}
                className="flex items-center gap-1 text-xs text-rose-500 font-medium hover:underline"
              >
                <VolumeX className="w-3.5 h-3.5" /> Mute All
              </button>
            )}
          </div>

          {/* Sound Controls List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {sounds.map((sound) => {
              return (
                <div
                  key={sound.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    sound.active
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          sound.active
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {sound.icon}
                      </div>
                      <div>
                        <div className="font-medium text-xs text-slate-900 dark:text-white">
                          {sound.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {sound.desc}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSound(sound.id)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        sound.active
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {sound.active ? 'Playing' : 'Play'}
                    </button>
                  </div>

                  {/* Volume Slider when active */}
                  {sound.active && (
                    <div className="mt-3 flex items-center gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={sound.volume}
                        onChange={(e) => setSoundVolume(sound.id, parseFloat(e.target.value))}
                        className="flex-1 h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 w-6 text-right">
                        {Math.round(sound.volume * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ambient Info Box */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          💡 <strong>Tip:</strong> Mix <em>Gentle Rain</em> with <em>Campfire</em> and <em>10Hz Alpha Tone</em> for an ultra-immersive deep concentration environment.
        </div>
      </div>
    </div>
  );
};
