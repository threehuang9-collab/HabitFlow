import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Trash2 } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  streak: number;
  onToggle: () => void;
  onDelete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompleted, streak, onToggle, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-slate-100 transition-all duration-300 ${isCompleted ? 'bg-slate-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon Box */}
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm ${habit.color} text-white`}>
            {habit.icon}
          </div>
          
          {/* Text Info */}
          <div className="flex flex-col">
            <h3 className={`font-bold text-slate-800 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
              {habit.name}
            </h3>
            <p className="text-xs text-slate-500">{habit.description}</p>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1 text-orange-500 font-semibold text-sm bg-orange-50 px-2 py-1 rounded-full">
                <Flame size={14} className={streak > 0 ? "fill-orange-500" : ""} />
                <span>{streak}</span>
            </div>

            {/* Checkbox Button */}
            <button
                onClick={onToggle}
                className={`group flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 
                ${isCompleted 
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-200 shadow-lg scale-110' 
                    : 'border-slate-200 bg-transparent text-transparent hover:border-emerald-300'
                }`}
            >
                <motion.div
                    initial={false}
                    animate={{ scale: isCompleted ? 1 : 0 }}
                >
                    <Check size={20} strokeWidth={3} />
                </motion.div>
            </button>
        </div>
      </div>
        
      {/* Delete Button (Hover only usually, but visible for simplicity/accessibility on mobile) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 text-slate-200 opacity-0 hover:text-red-400 hover:opacity-100 transition-opacity p-1 group-hover:opacity-100"
        title="删除习惯"
      >
          <Trash2 size={14} />
      </button>

      {/* Progress Bar Background (Optional Visual Flair) */}
       {isCompleted && (
          <motion.div 
            layoutId={`progress-${habit.id}`}
            className="absolute bottom-0 left-0 h-1 bg-emerald-500/20" 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
          />
       )}
    </motion.div>
  );
};