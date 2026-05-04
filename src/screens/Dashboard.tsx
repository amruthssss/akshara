import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getMasteryData, getSubjectMastery } from '../lib/mastery';
import { BookOpen, Calendar, Target, Award, ArrowRight, Zap, Clock, MessageSquare, Book, Microscope, Globe, Activity } from 'lucide-react';
import { SYLLABUS } from '../constants';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onStartQuiz: (params: any) => void;
}

export function Dashboard({ onNavigate, onStartQuiz }: DashboardProps) {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const masteryMap = getMasteryData();
  
  const isDark = theme === 'dark';
  const subjects = [
    { name: 'Mathematics', icon: Book, color: isDark ? 'bg-[#D9FF00]' : 'bg-blue-600', textColor: isDark ? 'text-black' : 'text-white', count: SYLLABUS.Mathematics.length, mastery: getSubjectMastery('Mathematics') },
    { name: 'Science', icon: Microscope, color: isDark ? 'bg-white' : 'bg-emerald-600', textColor: isDark ? 'text-black' : 'text-white', count: SYLLABUS.Science.length, mastery: getSubjectMastery('Science') },
    { 
      name: 'Social Science', 
      icon: Globe, 
      color: isDark ? 'bg-white' : 'bg-orange-600',
      textColor: isDark ? 'text-black' : 'text-white',
      count: Object.values(SYLLABUS["Social Science"]).flat().length,
      mastery: getSubjectMastery('Social Science')
    },
    { name: 'Languages', icon: MessageSquare, color: isDark ? 'bg-white' : 'bg-purple-600', textColor: isDark ? 'text-black' : 'text-white', count: 18, mastery: getSubjectMastery('Languages') },
  ];

  const stats = [
    { label: 'Study Streak', value: '7 Days', icon: Zap, color: isDark ? 'text-[#D9FF00]' : 'text-orange-600', bg: isDark ? 'bg-[#D9FF00]/10' : 'bg-orange-50' },
    { label: 'Accuracy', value: '88%', icon: Target, color: isDark ? 'text-blue-400' : 'text-blue-600', bg: isDark ? 'bg-blue-400/10' : 'bg-blue-50' },
    { label: 'Questions', value: '450+', icon: BookOpen, color: isDark ? 'text-emerald-400' : 'text-green-600', bg: isDark ? 'bg-emerald-400/10' : 'bg-green-50' },
    { label: 'Next Rank', value: 'Pro', icon: Award, color: isDark ? 'text-purple-400' : 'text-purple-600', bg: isDark ? 'bg-purple-400/10' : 'bg-purple-50' },
  ];

  const quickActions = [
    { 
      title: 'Quick Revision', 
      desc: '10 min quiz on Real Numbers', 
      icon: Clock, 
      action: () => onStartQuiz({ subject: 'Mathematics', chapter: 'Real Numbers', level: 'medium', mode: 'quiz' }),
      color: isDark ? 'bg-[#D9FF00]' : 'bg-blue-600',
      iconColor: isDark ? 'text-black' : 'text-white'
    },
    { 
      title: 'AI Doubts', 
      desc: 'Ask our tutor about difficult concepts', 
      icon: MessageSquare, 
      action: () => onNavigate('tutor'),
      color: isDark ? 'bg-white' : 'bg-slate-900',
      iconColor: isDark ? 'text-black' : 'text-white'
    }
  ];

  return (
    <div className="app-container space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-10">
        <div className="space-y-4">

          <h1 className="app-heading">
            Namaskara, <br />
            <span className={`capitalize ${isDark ? 'text-[#D9FF00]' : 'text-[#2563EB]'}`}>{profile?.name || 'Scholar'}</span>.
          </h1>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">School Focus</p>
          <p className="font-serif italic text-lg opacity-80">{profile?.school || 'Karnataka SSLC Board'}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="app-card !p-8 flex flex-col gap-6 group hover:border-blue-500/20"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
              <stat.icon size={28} />
            </div>
            <div className="space-y-1">
              <p className="accent-label">{stat.label}</p>
              <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="space-y-10">
        <div className="flex items-end justify-between border-b border-black/5 dark:border-white/5 pb-8">
          <div className="space-y-1">
            <p className="accent-label">Academic Roadmap</p>
            <h2 className="text-4xl font-black tracking-tight">Master Your Subjects</h2>
          </div>
          <button className="accent-label hover:opacity-100 transition-opacity flex items-center gap-2">
            Details <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {subjects.map((subject, i) => (
            <motion.button
              key={subject.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartQuiz({ subject: subject.name, mode: 'quiz' })}
              className="app-card !p-10 text-left group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${subject.color} opacity-[0.02] rounded-bl-full transition-transform group-hover:scale-110`} />
              <div className={`w-16 h-16 ${subject.color} ${subject.textColor} rounded-[1.5rem] flex items-center justify-center shadow-xl mb-10 transition-transform group-hover:rotate-6`}>
                <subject.icon size={32} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight leading-none">{subject.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="accent-label opacity-60 text-[9px]">{subject.count} Chapters</span>
                  <span className={`text-[10px] font-black uppercase ${subject.mastery > 70 ? 'text-emerald-500' : 'text-orange-500'}`}>
                    {subject.mastery}% Strength
                  </span>
                </div>
                <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.mastery}%` }}
                    className={`h-full ${isDark ? 'bg-white' : subject.color}`}
                   />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-1 w-12 bg-blue-600 rounded-full" />
            <h2 className="text-3xl font-black tracking-tight leading-none">Learning Orbit</h2>
          </div>
          
          <div className="app-card !p-0 overflow-hidden group">
            <div className="p-10 md:p-16 space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                <div className={`w-28 h-28 rounded-[2.50rem] flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:scale-105 duration-700 ${
                  isDark ? 'bg-white/5 text-[#D9FF00]' : 'bg-blue-600 text-white'
                }`}>
                  <BookOpen size={48} strokeWidth={2.5} />
                </div>
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <p className="accent-label !text-blue-500 !opacity-100">Live Active Syllabus</p>
                    <h3 className="text-4xl font-black tracking-tighter leading-tight">Science: Life Processes</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                       <p className="human-label !text-base">6 of 15 Topics Mastered</p>
                       <span className="text-2xl font-black tracking-tighter">40%</span>
                    </div>
                    <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '40%' }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button 
                  onClick={() => onNavigate('quiz')}
                  className={`w-full sm:flex-1 py-8 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl ${
                    isDark ? 'bg-[#D9FF00] text-black hover:bg-[#c2e600]' : 'bg-[#1A1A1A] text-white hover:bg-blue-600'
                  }`}
                >
                  Continue Session <ArrowRight size={18} />
                </button>
                <button className="p-8 rounded-[2rem] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95">
                  <Calendar size={24} />
                </button>
              </div>
            </div>
            
            <div className="px-10 py-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
               <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-[#F9F9F9] dark:border-[#0D0D0D] bg-slate-200" />
                  ))}
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">12 Peers studying this now</p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <h3 className="accent-label">Turbo Actions</h3>
          <div className="grid gap-6">
            {quickActions.map((action) => (
              <button 
                key={action.title}
                onClick={action.action}
                className="app-card !p-8 group flex items-center gap-6 hover:bg-[#FFFFFF] dark:hover:bg-[#121212] hover:scale-[1.02] border-transparent hover:border-blue-500/10"
              >
                <div className={`w-14 h-14 ${action.color} ${action.iconColor || 'text-white'} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                  <action.icon size={26} />
                </div>
                <div className="space-y-1 text-left">
                   <p className="font-black text-xl tracking-tight leading-none">{action.title}</p>
                   <p className="text-xs text-slate-400 font-medium">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="app-card !p-10 !bg-[#1A1A1A] text-white space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-blue-600/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-black tracking-tight leading-none">Final Countdown</h3>
              <p className="human-label !text-blue-400">Board Exam starts March 2026</p>
              
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { v: '142', l: 'Days' },
                  { v: '08', l: 'Hrs' },
                  { v: '22', l: 'Min' }
                ].map(d => (
                  <div key={d.l} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="text-2xl font-black tracking-tight leading-none">{d.v}</p>
                    <p className="accent-label !text-[8px] !opacity-40">{d.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-12">
        <div className="flex items-center gap-6">
           <Activity size={32} className="text-blue-500" />
           <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight">Strength Map</h2>
             <p className="human-label">Real-time analytical mastery profile</p>
           </div>
        </div>
        
        <div className="app-card !p-12 md:!p-20">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="space-y-10">
                 <h3 className="text-xl font-black flex items-center gap-3">
                    <Target size={24} className="text-blue-500" /> Topic Mastery
                 </h3>
                 <div className="space-y-8 max-h-[400px] overflow-y-auto pr-6 custom-scrollbar">
                    {Object.entries(masteryMap).length > 0 ? (
                      Object.entries(masteryMap).map(([key, score]) => (
                        <div key={key} className="space-y-3 group">
                           <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                <p className="accent-label opacity-40 text-[9px] uppercase">{key.split(':')[0]}</p>
                                <p className="font-bold text-lg leading-none tracking-tight">{key.split(':')[1]}</p>
                              </div>
                              <span className="font-serif italic text-blue-500 text-xl">{score}%</span>
                           </div>
                           <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                className="h-full bg-blue-600 group-hover:bg-blue-500 transition-colors"
                              />
                           </div>
                        </div>
                      ))
                    ) : (
                      <p className="human-label text-lg">Knowledge map will populate as you complete learning missions.</p>
                    )}
                 </div>
              </div>
              
              <div className="space-y-10">
                 <h3 className="text-xl font-black flex items-center gap-3">
                    <Zap size={24} className="text-orange-500" /> Improvement Target
                 </h3>
                 <div className="space-y-6">
                    {Object.entries(masteryMap).filter(([_, s]) => s < 60).slice(0, 3).map(([key, score]) => (
                      <div key={key} className="app-card !p-8 !bg-white dark:!bg-white/5 flex items-center justify-between group">
                         <div className="space-y-2 text-left">
                            <p className="accent-label !text-orange-500 opacity-100">{key.split(':')[0]}</p>
                            <p className="font-black text-xl tracking-tight leading-none">{key.split(':')[1]}</p>
                         </div>
                         <button 
                          onClick={() => onStartQuiz({ subject: key.split(':')[0], chapter: key.split(':')[1], mode: 'quiz' })}
                          className="w-14 h-14 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center transition-all group-hover:bg-blue-600 scale-90 group-hover:scale-100"
                         >
                            <ArrowRight size={20} />
                         </button>
                      </div>
                    ))}
                    {Object.entries(masteryMap).filter(([_, s]) => s < 60).length === 0 && (
                      <div className="app-card !p-12 text-center space-y-6 border-dashed border-2">
                         <Award className="mx-auto text-emerald-500" size={56} />
                         <div className="space-y-2">
                           <h3 className="text-2xl font-black tracking-tight">Flawless Profile</h3>
                           <p className="human-label text-base">You have no critical weak points. Challenge yourself with a mock exam.</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
