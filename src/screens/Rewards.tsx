import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, Star, Trophy, Target, BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Rewards({ onBack }: { onBack: () => void }) {
  const { profile } = useAuth();

  const badges = [
    { id: "first_quiz", name: "First Step", desc: "Complete your first quiz", earned: true, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: "week_streak", name: "7-Day Scholar", desc: "Maintain a 7-day streak", earned: false, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: "math_master", name: "Math Master", desc: "Score > 90% in Math", earned: true, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: "science_star", name: "Science Star", desc: "Complete all Science chapters", earned: false, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: "mock_warrior", name: "Mock Warrior", desc: "Complete 5 mock exams", earned: false, icon: Award, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <h1 className="text-3xl font-bold text-[#0F172A]">Your Achievements</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Streak Card */}
        <div className="bg-[#0F172A] text-white p-8 rounded-[2.5rem] relative overflow-hidden flex items-center justify-between">
           <div className="relative z-10">
              <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2">Consistency</p>
              <h2 className="text-4xl font-black mb-1">5 Day Streak</h2>
              <p className="text-slate-400 text-sm font-medium">You're on fire! 2 more days for a badge.</p>
           </div>
           <Zap className="text-yellow-400 animate-pulse" size={64} />
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
        </div>

        {/* Total Stars */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 flex items-center justify-between">
           <div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Total Stars</p>
              <h2 className="text-4xl font-black text-[#0F172A]">1,250</h2>
              <p className="text-blue-600 text-sm font-bold flex items-center gap-1 mt-1">
                <Star size={14} fill="currentColor" /> Top 5% of Students
              </p>
           </div>
           <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner">
             ✨
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">Badges Collector</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-3xl border-2 transition-all ${
                badge.earned ? 'bg-white border-slate-50 shadow-sm' : 'bg-slate-50 border-transparent opacity-60 grayscale'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl ${badge.earned ? badge.bg : 'bg-slate-200'} ${badge.earned ? badge.color : 'text-slate-400'} flex items-center justify-center mb-4`}>
                <badge.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{badge.name}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{badge.desc}</p>
              {badge.earned ? (
                 <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                   <Star size={10} fill="currentColor" /> Earned
                 </div>
              ) : (
                 <div className="mt-4 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                   <div className="w-1/3 h-full bg-slate-400" />
                 </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
