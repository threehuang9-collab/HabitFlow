export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string; // Emoji or icon name
  color: string;
  frequency: 'daily' | 'weekly';
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
}

export interface UserProfile {
  name: string;
  xp: number;
  level: number;
}

export interface DayStats {
  date: string;
  completionRate: number;
  totalHabits: number;
  completedHabits: number;
}

export const INITIAL_HABITS: Habit[] = [
  { id: '1', name: '晨间饮水', description: '起床后喝一杯温水', icon: '💧', color: 'bg-blue-500', frequency: 'daily', createdAt: Date.now() },
  { id: '2', name: '阅读30分钟', description: '远离手机，专注阅读', icon: '📚', color: 'bg-indigo-500', frequency: 'daily', createdAt: Date.now() },
  { id: '3', name: '冥想', description: '保持正念，放松身心', icon: '🧘', color: 'bg-purple-500', frequency: 'daily', createdAt: Date.now() },
];

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000]; // XP needed for each level

export const ICONS = ['💧', '📚', '🧘', '🏃', '💪', '🥗', '💤', '🎸', '💻', '🎨', '🧹', '💰'];
export const COLORS = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];