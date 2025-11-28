import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { HabitLog, DayStats } from '../types';

interface StatsViewProps {
  logs: HabitLog[];
  totalHabitsCount: number; // Assuming constant for simplicity in this view
}

export const StatsView: React.FC<StatsViewProps> = ({ logs, totalHabitsCount }) => {
  // Generate last 7 days data
  const data: DayStats[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('zh-CN', { weekday: 'short' });

    const completedCount = logs.filter(l => l.date === dateStr).length;
    // Prevent division by zero if no habits exist, though unlikely in usage
    const rate = totalHabitsCount > 0 ? Math.round((completedCount / totalHabitsCount) * 100) : 0;

    data.push({
      date: dayLabel,
      completionRate: rate,
      totalHabits: totalHabitsCount,
      completedHabits: completedCount
    });
  }

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full space-y-6"
    >
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <h2 className="mb-6 text-xl font-bold text-slate-800">本周趋势</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              <Bar dataKey="completionRate" radius={[8, 8, 8, 8]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.completionRate >= 80 ? '#10b981' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <p className="text-indigo-600 text-sm font-medium mb-1">今日完成</p>
              <p className="text-3xl font-bold text-indigo-900">
                  {data[data.length - 1].completedHabits} <span className="text-sm font-normal text-indigo-400">/ {totalHabitsCount}</span>
              </p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
              <p className="text-emerald-600 text-sm font-medium mb-1">完成率</p>
              <p className="text-3xl font-bold text-emerald-900">{data[data.length - 1].completionRate}%</p>
          </div>
      </div>
    </motion.div>
  );
};