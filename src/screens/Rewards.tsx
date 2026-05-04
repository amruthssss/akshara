import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, Star, Trophy, Target, BookOpen, Clock, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function Rewards({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const badges = [
    { id: "first_quiz", name: "First Step", desc: "Complete your first quiz", earned: true, icon: Star, color: 'text-yellow-500', bg: (isDark ? 'bg-yellow-500/10' : 'bg-yellow-50') },
    { id: "week_streak", name: "7-Day Scholar", desc: "Maintain a 7-day streak", earned: false, icon: Zap, color: 'text-orange-500', bg: (isDark ? 'bg-orange-500/10' : 'bg-orange-50') },
    { id: "math_master", name: "Math Master", desc: "Score > 90% in Math", earned: true, icon: Target, color: 'text-blue-500', bg: (isDark ? 'bg-blue-500/10' : 'bg-blue-50') },
    { id: "science_star", name: "Science Star", desc: "Complete all Science chapters", earned: false, icon: Trophy, color: 'text-purple-500', bg: (isDark ? 'bg-purple-500/10' : 'bg-purple-50') },
    { id: "mock_warrior", name: "Mock Warrior", desc: "Complete 5 mock exams", earned: false, icon: Award, color: 'text-green-500', bg: (isDark ? 'bg-green-500/10' : 'bg-green-50') },
  ];

  return (
    <div className="app-container space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className={`app-heading ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Hall of Fame</h1>
          <p className="app-subheading max-w-lg">Track your milestones and unlock elite badges as you master the SSLC syllabus.</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl border transition-all flex items-center gap-3 ${
          isDark ? 'bg-white/5 border-white/5 text-[#D9FF00]' : 'bg-blue-50 border-blue-100 text-blue-600'
        }`}>
          <Crown size={20} className="animate-bounce" />
          <span className="text-xs font-black uppercase tracking-widest leading-none">Rank: #14 in School</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Streak Card */}
        <div className={`p-10 md:p-14 rounded-[3.5rem] relative overflow-hidden flex items-center justify-between shadow-2xl group transition-all duration-700 ${
          isDark ? 'bg-[#D9FF00] text-black' : 'bg-[#0F172A] text-white shadow-slate-900/40'
        }`}>
           <div className="relative z-10">
              <p className={`font-black uppercase tracking-[0.2em] text-[10px] mb-6 opacity-60`}>Sustain Consistency</p>
              <h2 className="text-5xl font-black mb-4 tracking-tighter">5 Day Streak</h2>
              <p className="text-lg font-medium opacity-90 max-w-[240px] leading-tight">You're making history! 2 more days for the 'Scholar' badge.</p>
           </div>
           <Zap className={`animate-pulse ${isDark ? 'text-black/20' : 'text-yellow-400'}`} size={120} strokeWidth={3} />
           <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full transition-opacity duration-1000 ${
             isDark ? 'bg-black/10 opacity-50' : 'bg-blue-500/20 opacity-30'
           }`} />
        </div>

        {/* Total Stars */}
        <div className={`p-10 md:p-14 rounded-[3.5rem] flex items-center justify-between shadow-xl border transition-all group ${
          isDark ? 'bg-[#121212] border-white/5 shadow-black/40' : 'bg-white border-slate-50 shadow-blue-900/5'
        }`}>
           <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Scholastic Points</p>
                <h2 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>1,250</h2>
              </div>
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl font-black text-xs transition-all ${
                isDark ? 'bg-white/5 text-[#D9FF00]' : 'bg-blue-50 text-blue-600'
              }`}>
                <Star size={16} fill="currentColor" className="animate-spin-slow" /> Top 5% Globally
              </div>
           </div>
           <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center font-bold text-6xl shadow-inner transition-transform duration-700 group-hover:rotate-12 ${
             isDark ? 'bg-white/5' : 'bg-yellow-50/50'
           }`}>
             🌟
           </div>
        </div>
      </div>

      <div className="space-y-10 pt-8">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-1 px-0.5 rounded-full ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'}`} />
           <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Achievement Vault</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`p-10 rounded-[3rem] border transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden group ${
                badge.earned 
                  ? (isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-slate-100') 
                  : (isDark ? 'bg-white/2 border-transparent opacity-30 grayscale' : 'bg-slate-50 border-transparent opacity-60 grayscale')
              }`}
            >
              <div className={`w-16 h-16 rounded-[1.5rem] mb-10 transition-transform group-hover:rotate-12 ${badge.bg} ${badge.earned ? badge.color : 'text-slate-400'} flex items-center justify-center shadow-lg`}>
                <badge.icon size={32} />
              </div>
              <h3 className={`text-2xl font-black tracking-tight mb-3 transition-colors ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>{badge.name}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">{badge.desc}</p>
              
              <div className="relative z-10">
                {badge.earned ? (
                   <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl w-fit ${
                     isDark ? 'bg-[#D9FF00]/10 text-[#D9FF00]' : 'bg-emerald-50 text-emerald-600'
                   }`}>
                     <Star size={12} fill="currentColor" /> Verified Achievement
                   </div>
                ) : (
                   <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                     <div className="w-1/3 h-full bg-slate-400" />
                   </div>
                )}
              </div>

              {badge.earned && (
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
