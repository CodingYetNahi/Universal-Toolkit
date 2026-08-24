export type ToolCategory = 
  | 'notes'
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

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  pinned?: boolean;
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
