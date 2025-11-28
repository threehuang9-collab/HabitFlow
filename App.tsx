import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BarChart3, Bot, Plus, Trophy, X, Quote as QuoteIcon, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HabitCard } from './components/HabitCard';
import { StatsView } from './components/StatsView';
import { AICoach } from './components/AICoach';
import { getDailyQuote } from './services/geminiService';
import { Habit, HabitLog, UserProfile, INITIAL_HABITS, LEVEL_THRESHOLDS, ICONS, COLORS } from './types';

function App() {
  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stats' | 'ai'>('dashboard');
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });
  const [logs, setLogs] = useState<HabitLog[]>(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: 'User', xp: 0, level: 1 };
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<string>('');

  // New Habit Form State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState(ICONS[0]);
  const [newHabitColor, setNewHabitColor] = useState(COLORS[0]);

  // Effects for persistence
  useEffect(() => { localStorage.setItem('habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('user', JSON.stringify(user)); }, [user]);

  // Fetch Daily Quote
  useEffect(() => {
    const loadQuote = async () => {
        const savedQuoteData = localStorage.getItem('dailyQuoteData');
        const today = new Date().toDateString();
        
        if (savedQuoteData) {
            const { date, quote } = JSON.parse(savedQuoteData);
            if (date === today) {
                setDailyQuote(quote);
                return;
            }
        }
        
        const newQuote = await getDailyQuote();
        setDailyQuote(newQuote);
        localStorage.setItem('dailyQuoteData', JSON.stringify({ date: today, quote: newQuote }));
    };
    loadQuote();
  }, []);

  // Derived Data
  const todayStr = new Date().toISOString().split('T')[0];

  const getStreak = (habitId: string) => {
    const habitLogs = logs.filter(l => l.habitId === habitId).sort((a, b) => b.timestamp - a.timestamp);
    if (habitLogs.length === 0) return 0;
    
    let streak = 0;
    const doneToday = habitLogs.some(l => l.date === todayStr);
    
    let currentCheckDate = new Date();
    if (!doneToday) {
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    }
    
    while (true) {
        const checkStr = currentCheckDate.toISOString().split('T')[0];
        const hasLog = habitLogs.some(l => l.date === checkStr);
        if (hasLog) {
            streak++;
            currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleToggleHabit = (id: string) => {
    const isDone = logs.some(l => l.habitId === id && l.date === todayStr);
    
    if (isDone) {
      // Undo
      setLogs(prev => prev.filter(l => !(l.habitId === id && l.date === todayStr)));
      setUser(prev => ({ ...prev, xp: Math.max(0, prev.xp - 10) }));
    } else {
      // Do
      const newLog: HabitLog = {
        id: Date.now().toString(),
        habitId: id,
        date: todayStr,
        timestamp: Date.now()
      };
      setLogs(prev => [...prev, newLog]);
      triggerConfetti();
      
      // Add XP & Check Level Up
      setUser(prev => {
        const newXP = prev.xp + 10;
        const nextLevelXP = LEVEL_THRESHOLDS[prev.level] || 99999;
        const newLevel = newXP >= nextLevelXP ? prev.level + 1 : prev.level;
        return { ...prev, xp: newXP, level: newLevel };
      });
    }
  };

  const deleteHabit = (id: string) => {
    if (window.confirm('确定要删除这个习惯吗？历史记录也会被清除。')) {
      setHabits(prev => prev.filter(h => h.id !== id));
      setLogs(prev => prev.filter(l => l.habitId !== id));
    }
  };

  const addNewHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      description: newHabitDesc,
      icon: newHabitIcon,
      color: newHabitColor,
      frequency: 'daily',
      createdAt: Date.now()
    };
    setHabits([...habits, newHabit]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewHabitName('');
    setNewHabitDesc('');
    setNewHabitIcon(ICONS[0]);
    setNewHabitColor(COLORS[0]);
  }

  const addSuggestedHabit = (suggested: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
        ...suggested,
        id: Date.now().toString(),
        createdAt: Date.now()
    };
    setHabits([...habits, newHabit]);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Progress to next level
  const currentLevelXP = LEVEL_THRESHOLDS[user.level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[user.level] || 10000;
  const levelProgress = Math.min(100, Math.max(0, ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 pb-24">
      
      {/* Header Area with Gradient */}
      <div className="bg-white pb-4 pt-safe sticky top-0 z-20 border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
          <div className="mx-auto flex max-w-md items-center justify-between px-6 pt-4">
            <div>
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    HabitFlow
                </h1>
                <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                    <Calendar size={12} />
                    <p className="text-xs font-medium">
                        {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
                    </p>
                </div>
            </div>
            
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                    <Trophy size={14} className="text-yellow-600" />
                    <span className="font-bold text-yellow-700 text-sm">Lv. {user.level}</span>
                </div>
                <div className="mt-2 w-28 h-1.5 overflow-hidden rounded-full bg-slate-100 relative">
                    <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress}%` }}
                    />
                </div>
            </div>
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-6 mx-auto w-full max-w-md space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
            >
              {/* Daily Quote Card */}
              {dailyQuote && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg shadow-indigo-200"
                >
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 text-white/10">
                        <QuoteIcon size={80} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">每日寄语</h2>
                        <p className="font-medium text-lg leading-relaxed text-shadow-sm">"{dailyQuote}"</p>
                    </div>
                </motion.div>
              )}

              {/* Habit List */}
              <div className="space-y-4">
                  {habits.length === 0 ? (
                      <div className="text-center py-12 rounded-3xl bg-white border border-dashed border-slate-200">
                          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4">
                              <Plus size={32} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-700 mb-2">开始你的第一个习惯</h3>
                          <p className="text-slate-400 text-sm mb-6">建立好习惯，成就更好的自己</p>
                          <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                          >
                              立即添加
                          </button>
                      </div>
                  ) : (
                      habits.map(habit => (
                        <HabitCard 
                            key={habit.id}
                            habit={habit}
                            isCompleted={logs.some(l => l.habitId === habit.id && l.date === todayStr)}
                            streak={getStreak(habit.id)}
                            completedDates={logs.filter(l => l.habitId === habit.id).map(l => l.date)}
                            onToggle={() => handleToggleHabit(habit.id)}
                            onDelete={() => deleteHabit(habit.id)}
                        />
                      ))
                  )}
                  
                  {/* Inline Add Button for visibility */}
                  {habits.length > 0 && (
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 group"
                      >
                          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                              <Plus size={14} className="text-slate-400 group-hover:text-indigo-600" />
                          </div>
                          添加新习惯
                      </button>
                  )}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StatsView logs={logs} totalHabitsCount={habits.length} />
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AICoach habits={habits} logs={logs} user={user} onAddSuggestedHabit={addSuggestedHabit} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Add Button (Mobile Standard) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl shadow-slate-300 ring-4 ring-white"
      >
        <Plus size={28} />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-3 pb-safe">
        <div className="mx-auto flex max-w-md items-center justify-around">
            <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="今日" />
            <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 />} label="统计" />
            <NavButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Bot />} label="AI 教练" />
        </div>
      </nav>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white p-6 shadow-2xl mx-auto max-w-md max-h-[90vh] overflow-y-auto"
            >
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">新建习惯</h3>
                        <p className="text-sm text-slate-400">积跬步以至千里</p>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">习惯名称</label>
                        <input 
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            placeholder="例如：每天喝水"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            autoFocus
                        />
                    </div>

                    <div>
                         <label className="mb-2 block text-sm font-bold text-slate-700">描述（可选）</label>
                         <input 
                             value={newHabitDesc}
                             onChange={(e) => setNewHabitDesc(e.target.value)}
                             placeholder="例如：起床后喝一杯温水"
                             className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                         />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">选择图标</label>
                        <div className="grid grid-cols-6 gap-2">
                            {ICONS.map(icon => (
                                <button 
                                    key={icon}
                                    onClick={() => setNewHabitIcon(icon)}
                                    className={`aspect-square flex items-center justify-center rounded-2xl text-2xl transition-all ${newHabitIcon === icon ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-slate-50 hover:bg-slate-100'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">主题颜色</label>
                        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 scrollbar-hide">
                            {COLORS.map(color => (
                                <button 
                                    key={color}
                                    onClick={() => setNewHabitColor(color)}
                                    className={`h-12 w-12 flex-none rounded-full ${color} transition-all shadow-sm ${newHabitColor === color ? 'ring-4 ring-slate-900 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={addNewHabit}
                        disabled={!newHabitName.trim()}
                        className="w-full rounded-2xl bg-slate-900 py-4 text-lg font-bold text-white shadow-xl shadow-slate-200 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        确认创建
                    </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`relative flex flex-col items-center gap-1 p-2 transition-colors duration-300 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
        <div className={`transition-transform duration-300 ${active ? '-translate-y-1' : ''}`}>
             {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: active ? 2.5 : 2 })}
        </div>
        <span className={`text-[10px] font-bold transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'} absolute -bottom-1`}>
            {label}
        </span>
    </button>
);

export default App;