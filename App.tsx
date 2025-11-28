import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BarChart3, Bot, Plus, Trophy, X } from 'lucide-react';
import { HabitCard } from './components/HabitCard';
import { StatsView } from './components/StatsView';
import { AICoach } from './components/AICoach';
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

  // New Habit Form State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState(ICONS[0]);
  const [newHabitColor, setNewHabitColor] = useState(COLORS[0]);

  // Effects for persistence
  useEffect(() => { localStorage.setItem('habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('user', JSON.stringify(user)); }, [user]);

  // Derived Data
  const todayStr = new Date().toISOString().split('T')[0];

  const getStreak = (habitId: string) => {
    // Simplified streak calculation for demo
    // In a real app, this would iterate backwards from yesterday checking consecutive days
    const habitLogs = logs.filter(l => l.habitId === habitId).sort((a, b) => b.timestamp - a.timestamp);
    if (habitLogs.length === 0) return 0;
    
    let streak = 0;
    // Check if done today, if so start counting from today, else start from yesterday
    const doneToday = habitLogs.some(l => l.date === todayStr);
    
    // Very basic streak logic: count consecutive entries. 
    // Note: real calendar logic requires checking date gaps. 
    // Here we just count total active logs for simplicity of the prompt constraints on logic size,
    // but let's do a slightly better check.
    
    let currentCheckDate = new Date();
    if (!doneToday) {
        currentCheckDate.setDate(currentCheckDate.getDate() - 1); // Start checking from yesterday
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

  const handleToggleHabit = (id: string) => {
    const isDone = logs.some(l => l.habitId === id && l.date === todayStr);
    
    if (isDone) {
      // Undo
      setLogs(prev => prev.filter(l => !(l.habitId === id && l.date === todayStr)));
      // Deduct XP (optional, but fair)
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
      
      // Add XP & Check Level Up
      setUser(prev => {
        const newXP = prev.xp + 10;
        // Check next level threshold
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
      icon: newHabitIcon,
      color: newHabitColor,
      frequency: 'daily',
      createdAt: Date.now()
    };
    setHabits([...habits, newHabit]);
    setShowAddModal(false);
    setNewHabitName('');
  };

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
      
      {/* Header / User Profile */}
      <header className="sticky top-0 z-20 bg-white/80 px-6 py-4 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HabitFlow
            </h1>
            <p className="text-xs text-slate-500">
                今天是 {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
                <Trophy size={16} className="text-yellow-500" />
                <span className="font-bold text-slate-800">Lv. {user.level}</span>
            </div>
            <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <motion.div 
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                />
            </div>
            <span className="text-[10px] text-slate-400">{user.xp} XP</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pt-6 mx-auto w-full max-w-md">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
            >
              {habits.length === 0 ? (
                  <div className="text-center py-20 opacity-50">
                      <p>还没有习惯，点击 + 添加一个吧！</p>
                  </div>
              ) : (
                  habits.map(habit => (
                    <HabitCard 
                        key={habit.id}
                        habit={habit}
                        isCompleted={logs.some(l => l.habitId === habit.id && l.date === todayStr)}
                        streak={getStreak(habit.id)}
                        onToggle={() => handleToggleHabit(habit.id)}
                        onDelete={() => deleteHabit(habit.id)}
                    />
                  ))
              )}
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

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-indigo-300 shadow-xl"
      >
        <Plus size={28} />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-6 py-3 pb-safe">
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
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white p-6 shadow-2xl mx-auto max-w-md"
            >
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800">新习惯</h3>
                    <button onClick={() => setShowAddModal(false)} className="rounded-full bg-slate-100 p-2 text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-500">习惯名称</label>
                        <input 
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            placeholder="例如：每天喝水"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-500">选择图标</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {ICONS.map(icon => (
                                <button 
                                    key={icon}
                                    onClick={() => setNewHabitIcon(icon)}
                                    className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl text-2xl transition ${newHabitIcon === icon ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-slate-50 hover:bg-slate-100'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-500">选择颜色</label>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {COLORS.map(color => (
                                <button 
                                    key={color}
                                    onClick={() => setNewHabitColor(color)}
                                    className={`h-10 w-10 flex-none rounded-full ${color} transition ${newHabitColor === color ? 'ring-4 ring-slate-200 ring-offset-2' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={addNewHabit}
                        disabled={!newHabitName.trim()}
                        className="w-full rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition active:scale-95 disabled:opacity-50"
                    >
                        开始养成
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
        className={`flex flex-col items-center gap-1 p-2 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: active ? 2.5 : 2 })}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default App;