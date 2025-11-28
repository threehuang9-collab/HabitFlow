
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Trash2, Plus, Play, Clock } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  progress: number; // Current value completed today
  streak: number;
  isCompleted: boolean;
  completedDates: string[]; // List of ISO dates completed
  onIncrement: () => void; // For counter
  onStartTimer: () => void; // For timer
  onToggle: () => void; // For simple check
  onDelete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ 
    habit, 
    progress, 
    streak, 
    isCompleted, 
    completedDates, 
    onIncrement, 
    onStartTimer,
    onToggle, 
    onDelete 
}) => {
  
  const getWeekDays = () => {
    const now = new Date();
    const day = now.getDay(); 
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(new Date().setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date().toISOString().split('T')[0];

  // Logic to determine action button based on type
  const renderAction = () => {
      if (isCompleted) {
          return (
            <button
                onClick={onToggle} // Allows undoing check habits, logic for others handles decrement or ignore
                className={`group flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-white shadow-emerald-200 shadow-md scale-105 transition-all duration-300`}
            >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check size={24} strokeWidth={3} />
                </motion.div>
            </button>
          );
      }

      switch (habit.type) {
          case 'count':
              return (
                <button
                    onClick={(e) => { e.stopPropagation(); onIncrement(); }}
                    className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md transition-all duration-300"
                >
                    <Plus size={24} strokeWidth={2.5} />
                </button>
              );
          case 'timer':
              return (
                <button
                    onClick={(e) => { e.stopPropagation(); onStartTimer(); }}
                    className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md transition-all duration-300"
                >
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                </button>
              );
          case 'check':
          default:
              return (
                <button
                    onClick={onToggle}
                    className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-transparent hover:border-emerald-300 hover:shadow-md transition-all duration-300"
                >
                    <Check size={24} strokeWidth={3} className="text-emerald-300 opacity-0 group-hover:opacity-50" />
                </button>
              );
      }
  };

  const completionPercent = Math.min(100, (progress / habit.goal) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all duration-300 ${isCompleted ? 'bg-slate-50/80' : ''}`}
    >
      {/* Background Progress Bar for Count/Timer types */}
      {habit.type !== 'check' && !isCompleted && progress > 0 && (
          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-500" style={{ width: `${completionPercent}%` }} />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Icon Box */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm ${habit.color} text-white`}>
            {habit.icon}
          </div>
          
          {/* Text Info */}
          <div className="flex flex-col pt-0.5 min-w-[120px]">
            <h3 className={`font-bold text-slate-800 text-lg leading-tight ${isCompleted ? 'line-through text-slate-400' : ''}`}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
                 {habit.type !== 'check' && (
                     <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                         {progress} / {habit.goal} {habit.unit}
                     </span>
                 )}
                 {habit.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">{habit.description}</p>
                 )}
            </div>
            
            {/* Weekly Progress Dots */}
            <div className="mt-3 flex items-center gap-2">
                {weekDays.map((date, idx) => {
                    const isDone = completedDates.includes(date);
                    const isToday = date === today;
                    const isFuture = date > today;
                    
                    return (
                        <div key={date} className="flex flex-col items-center gap-1 group">
                            <motion.div 
                                initial={false}
                                animate={{ 
                                    scale: isDone ? 1.1 : 1,
                                    backgroundColor: isDone ? '#10b981' : (isFuture ? '#f1f5f9' : '#e2e8f0') 
                                }}
                                className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${isToday && !isDone ? 'ring-2 ring-indigo-200 bg-indigo-100' : ''}`}
                            />
                        </div>
                    );
                })}
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-end gap-3">
            {renderAction()}

            <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                <Flame size={12} className={streak > 0 ? "fill-orange-500 text-orange-500" : ""} />
                <span className={streak > 0 ? "text-orange-500" : ""}>{streak} 天</span>
            </div>
        </div>
      </div>
        
      {/* Delete Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute bottom-2 right-2 text-slate-200 opacity-0 hover:text-red-400 hover:opacity-100 transition-opacity p-2 group-hover:opacity-100"
        title="删除习惯"
      >
          <Trash2 size={16} />
      </button>
    </motion.div>
  );
};
