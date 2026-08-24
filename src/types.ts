export type ToolCategory = 
  | 'text-dev'
  | 'converters'
  | 'time'
  | 'focus'
  | 'calculator'
  | 'qrcode'
  | 'color';

export interface ToolDefinition {
  id: ToolCategory;
  name: string;
  shortDesc: string;
  icon: string;
  badge?: string;
}

export interface WorldClockCity {
  id: string;
  name: string;
  timezone: string;
  country: string;
}

export interface AudioSoundscape {
  id: string;
  name: string;
  icon: string;
  description: string;
  volume: number;
  isPlaying: boolean;
}

export interface ChecklistTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}
