
export type HabitType = 'check' | 'count' | 'timer';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly';
  type: HabitType;
  goal: number; // 1 for check, N for count/timer
  unit: string; // '次', '杯', '分钟'
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
  value: number; // Amount completed
}

export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  coins: number; // Currency for future shop
}

export interface DayStats {
  date: string;
  completionRate: number;
  totalHabits: number;
  completedHabits: number;
}

export const INITIAL_HABITS: Habit[] = [
  { 
    id: '1', 
    name: '晨间饮水', 
    description: '补充水分，唤醒身体', 
    icon: '💧', 
    color: 'bg-blue-500', 
    frequency: 'daily', 
    type: 'count', 
    goal: 4, 
    unit: '杯', 
    createdAt: Date.now() 
  },
  { 
    id: '2', 
    name: '深度阅读', 
    description: '专注阅读，远离干扰', 
    icon: '📚', 
    color: 'bg-indigo-500', 
    frequency: 'daily', 
    type: 'timer', 
    goal: 30, 
    unit: '分钟', 
    createdAt: Date.now() 
  },
  { 
    id: '3', 
    name: '冥想', 
    description: '保持正念', 
    icon: '🧘', 
    color: 'bg-purple-500', 
    frequency: 'daily', 
    type: 'check', 
    goal: 1, 
    unit: '次', 
    createdAt: Date.now() 
  },
];

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000];

export const ICONS = ['💧', '📚', '🧘', '🏃', '💪', '🥗', '💤', '🎸', '💻', '🎨', '🧹', '💰', '💊', '🌞', '📝'];
export const COLORS = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500', 'bg-slate-500'];
