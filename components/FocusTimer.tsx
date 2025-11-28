
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, CheckCircle2 } from 'lucide-react';
import { Habit } from '../types';

interface FocusTimerProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (minutes: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ habit, isOpen, onClose, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(habit.goal * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(habit.goal * 60);

  useEffect(() => {
    if (isOpen) {
        setTimeLeft(habit.goal * 60);
        setTotalTime(habit.goal * 60);
        setIsActive(false);
    }
  }, [isOpen, habit.goal]);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onComplete(habit.goal);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete, habit.goal]);

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm"
      >
        <div className="relative flex w-full max-w-md flex-col items-center px-6">
          {/* Header */}
          <div className="absolute top-0 right-6">
             <button onClick={onClose} className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20">
                <X size={24} />
             </button>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12 text-center"
          >
             <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">
                {habit.icon}
             </div>
             <h2 className="text-2xl font-bold text-white">{habit.name}</h2>
             <p className="text-indigo-200">保持专注，成就更好的自己</p>
          </motion.div>

          {/* Timer Ring */}
          <div className="relative mb-12 flex h-64 w-64 items-center justify-center">
             {/* Background Ring */}
             <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/10"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-indigo-500"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                  transition={{ duration: 1, ease: "linear" }}
                />
             </svg>
             
             <div className="text-center">
                <div className="text-6xl font-black text-white tabular-nums tracking-tighter">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-sm font-medium text-indigo-300 mt-2">
                    {isActive ? '专注中...' : '已暂停'}
                </div>
             </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
             <button 
                onClick={() => setIsActive(!isActive)}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-indigo-600 shadow-xl shadow-indigo-500/30 transition-transform active:scale-95 hover:bg-indigo-50"
             >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
             </button>
             
             {timeLeft < totalTime && !isActive && (
                 <button 
                    onClick={() => {
                        onComplete(Math.floor((totalTime - timeLeft) / 60));
                    }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
                    title="提前结束并记录"
                 >
                    <CheckCircle2 size={24} />
                 </button>
             )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
