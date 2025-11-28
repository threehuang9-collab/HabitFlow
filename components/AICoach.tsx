import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, PlusCircle, Quote } from 'lucide-react';
import { generateHabitAdvice, suggestNewHabits } from '../services/geminiService';
import { Habit, HabitLog, UserProfile } from '../types';

interface AICoachProps {
  habits: Habit[];
  logs: HabitLog[];
  user: UserProfile;
  onAddSuggestedHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
}

export const AICoach: React.FC<AICoachProps> = ({ habits, logs, user, onAddSuggestedHabit }) => {
  const [advice, setAdvice] = useState<string>('');
  const [suggestions, setSuggestions] = useState<{name: string, description: string, icon: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await generateHabitAdvice(habits, logs, user);
    setAdvice(result);
    setLoading(false);
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    const result = await suggestNewHabits(habits);
    setSuggestions(result);
    setLoadingSuggestions(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Coach Message Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-black/10 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-300" size={20} />
                <h3 className="font-bold text-lg">AI 智能教练</h3>
            </div>
            <button 
                onClick={fetchAdvice} 
                disabled={loading}
                className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition disabled:opacity-50"
            >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          
          <div className="min-h-[80px]">
            {loading ? (
                <div className="flex items-center gap-2 text-indigo-100">
                    <span className="animate-pulse">正在分析你的表现...</span>
                </div>
            ) : (
                <div className="relative">
                    <Quote size={24} className="absolute -top-2 -left-2 text-white/20" />
                    <p className="pl-6 text-indigo-50 leading-relaxed text-lg font-medium">
                        {advice}
                    </p>
                </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Suggestions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
             <h3 className="text-lg font-bold text-slate-800">推荐习惯</h3>
             <button 
                onClick={fetchSuggestions}
                disabled={loadingSuggestions}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-800 disabled:opacity-50"
             >
                 {suggestions.length === 0 ? '获取推荐' : '换一批'}
             </button>
        </div>

        {loadingSuggestions && (
            <div className="flex justify-center p-8">
                <RefreshCw className="animate-spin text-indigo-500" />
            </div>
        )}

        <div className="grid gap-3">
            {suggestions.map((suggestion, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{suggestion.icon}</span>
                        <div>
                            <h4 className="font-bold text-slate-800">{suggestion.name}</h4>
                            <p className="text-xs text-slate-500">{suggestion.description}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onAddSuggestedHabit({
                            name: suggestion.name,
                            description: suggestion.description,
                            icon: suggestion.icon,
                            color: 'bg-indigo-500', // Default color
                            frequency: 'daily'
                        })}
                        className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full"
                    >
                        <PlusCircle />
                    </button>
                </motion.div>
            ))}
            
            {!loadingSuggestions && suggestions.length === 0 && (
                <div className="text-center p-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p>点击上方“获取推荐”让AI为你定制习惯。</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};