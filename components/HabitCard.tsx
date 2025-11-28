import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Trash2 } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  streak: number;
  completedDates: string[]; // List of ISO dates completed
  onToggle: () => void;
  onDelete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompleted, streak, completedDates, onToggle, onDelete }) => {
  
  // Calculate current week days (Mon-Sun)
  const getWeekDays = () => {
    const now = new Date();
    const day = now.getDay(); // 0 is Sun
    // Calculate Monday of current week
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all duration-300 ${isCompleted ? 'bg-slate-50/80' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Icon Box */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm ${habit.color} text-white`}>
            {habit.icon}
          </div>
          
          {/* Text Info */}
          <div className="flex flex-col pt-0.5">
            <h3 className={`font-bold text-slate-800 text-lg leading-tight ${isCompleted ? 'line-through text-slate-400' : ''}`}>
              {habit.name}
            </h3>
            {habit.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{habit.description}</p>
            )}
            
            {/* Weekly Progress Dots */}
            <div className="mt-3 flex items-center gap-2">
                {weekDays.map((date, idx) => {
                    const isDone = completedDates.includes(date);
                    const isToday = date === today;
                    const dateObj = new Date(date);
                    // Simple check if date is in future
                    const isFuture = date > today;
                    const dayLabel = ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()];

                    return (
                        <div key={date} className="flex flex-col items-center gap-1 group">
                            <motion.div 
                                initial={false}
                                animate={{ 
                                    scale: isDone ? 1.1 : 1,
                                    backgroundColor: isDone ? 'var(--dot-color)' : (isFuture ? '#f1f5f9' : '#e2e8f0') 
                                }}
                                style={{ '--dot-color': isDone ? '#10b981' : '' } as any} // Using emerald for done
                                className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${isDone ? '' : ''} ${isToday && !isDone ? 'ring-2 ring-indigo-200 bg-indigo-100' : ''}`}
                            />
                        </div>
                    );
                })}
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-end gap-3">
            {/* Checkbox Button */}
            <button
                onClick={onToggle}
                className={`group flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm
                ${isCompleted 
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-200 shadow-md scale-105' 
                    : 'border-slate-200 bg-white text-transparent hover:border-emerald-300 hover:shadow-md'
                }`}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: isCompleted ? 1 : 0 }}
                >
                    <Check size={24} strokeWidth={3} />
                </motion.div>
            </button>

            {/* Streak Counter (Moved to be less intrusive) */}
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