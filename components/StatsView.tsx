
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { HabitLog, DayStats } from '../types';

interface StatsViewProps {
  logs: HabitLog[];
  totalHabitsCount: number;
}

export const StatsView: React.FC<StatsViewProps> = ({ logs, totalHabitsCount }) => {
  // Generate last 7 days data for Bar Chart
  const weekData: DayStats[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('zh-CN', { weekday: 'short' });

    // Count unique completed habits for the day
    const completedHabitIds = new Set(logs.filter(l => l.date === dateStr && l.value > 0).map(l => l.habitId));
    const completedCount = completedHabitIds.size;
    
    const rate = totalHabitsCount > 0 ? Math.round((completedCount / totalHabitsCount) * 100) : 0;

    weekData.push({
      date: dayLabel,
      completionRate: rate,
      totalHabits: totalHabitsCount,
      completedHabits: completedCount
    });
  }

  // Generate Heatmap Data (Last 3 months approx)
  const getHeatmapData = () => {
      const days = [];
      // Start 14 weeks ago to fill a grid
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (14 * 7) + 1); // rough approx
      
      const endDate = new Date();

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          // Determine intensity based on number of logs
          const dayLogs = logs.filter(l => l.date === dateStr);
          const intensity = Math.min(4, dayLogs.length); // 0-4 scale
          days.push({ date: dateStr, intensity });
      }
      return days;
  };
  const heatmapData = getHeatmapData();

  const getIntensityColor = (intensity: number) => {
      switch(intensity) {
          case 0: return 'bg-slate-100';
          case 1: return 'bg-emerald-200';
          case 2: return 'bg-emerald-300';
          case 3: return 'bg-emerald-400';
          case 4: return 'bg-emerald-500';
          default: return 'bg-slate-100';
      }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-6"
    >
      {/* Weekly Trend */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <h2 className="mb-6 text-xl font-bold text-slate-800">本周趋势</h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f1f5f9', radius: 8 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="completionRate" radius={[6, 6, 6, 6]} barSize={24}>
                {weekData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.completionRate >= 80 ? '#10b981' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contribution Graph (Heatmap) */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <h2 className="mb-4 text-xl font-bold text-slate-800">坚持足迹</h2>
        <div className="flex flex-wrap gap-1.5 justify-center">
            {heatmapData.map((day) => (
                <div 
                    key={day.date} 
                    title={`${day.date}: ${day.intensity} habits`}
                    className={`h-3 w-3 rounded-sm ${getIntensityColor(day.intensity)} transition-colors hover:scale-125`}
                />
            ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-400">
            <span>少</span>
            <div className="h-3 w-3 rounded-sm bg-slate-100" />
            <div className="h-3 w-3 rounded-sm bg-emerald-200" />
            <div className="h-3 w-3 rounded-sm bg-emerald-400" />
            <div className="h-3 w-3 rounded-sm bg-emerald-500" />
            <span>多</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <p className="text-indigo-600 text-sm font-medium mb-1">今日完成</p>
              <p className="text-3xl font-bold text-indigo-900">
                  {weekData[weekData.length - 1].completedHabits} <span className="text-sm font-normal text-indigo-400">/ {totalHabitsCount}</span>
              </p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
              <p className="text-emerald-600 text-sm font-medium mb-1">完成率</p>
              <p className="text-3xl font-bold text-emerald-900">{weekData[weekData.length - 1].completionRate}%</p>
          </div>
      </div>
    </motion.div>
  );
};
