import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, Target, Award, ArrowRight, Zap, Clock, MessageSquare, Book, Microscope, Globe } from 'lucide-react';
import { SYLLABUS } from '../constants';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onStartQuiz: (params: any) => void;
}

export function Dashboard({ onNavigate, onStartQuiz }: DashboardProps) {
  const { profile } = useAuth();
  
  const subjects = [
    { name: 'Mathematics', icon: Book, color: 'bg-blue-600', count: SYLLABUS.Mathematics.length },
    { name: 'Science', icon: Microscope, color: 'bg-emerald-600', count: SYLLABUS.Science.length },
    { name: 'Social Science', icon: Globe, color: 'bg-orange-600', count: 32 }, // Sum of history, geography etc
    { name: 'Languages', icon: MessageSquare, color: 'bg-purple-600', count: 18 },
  ];

  const stats = [
    { label: 'Study Streak', value: '7 Days', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Accuracy', value: '88%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Questions', value: '450+', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Next Rank', value: 'Pro', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const quickActions = [
    { 
      title: 'Quick Revision', 
      desc: '10 min quiz on Real Numbers', 
      icon: Clock, 
      action: () => onStartQuiz({ subject: 'Mathematics', chapter: 'Real Numbers', level: 'medium', mode: 'quiz' }),
      color: 'bg-blue-600'
    },
    { 
      title: 'AI Doubts', 
      desc: 'Ask our tutor about difficult concepts', 
      icon: MessageSquare, 
      action: () => onNavigate('tutor'),
      color: 'bg-slate-900'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tighter">
          Namaskara, <span className="text-[#2563EB]">{profile?.name || 'Student'}</span>!
        </h1>
        <p className="text-slate-500 font-medium text-lg">Keep up the momentum. You're in the top 10% of {profile?.district || 'your district'}.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <motion.div 
            key={stat.label} 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-3"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-[1.25rem] flex items-center justify-center shadow-inner`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-[#0F172A] tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Master Your Subjects</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select to Revise</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {subjects.map((subject, i) => (
            <motion.button
              key={subject.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartQuiz({ subject: subject.name, mode: 'quiz' })}
              className="group relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-left overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${subject.color} opacity-[0.03] rounded-bl-[4rem] group-hover:opacity-[0.08] transition-opacity`} />
              <div className={`w-14 h-14 ${subject.color} text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:rotate-6 transition-transform`}>
                <subject.icon size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#0F172A] tracking-tight">{subject.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{subject.count} Chapters</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Active Learning</h2>
             <button className="text-sm font-bold text-blue-600 hover:underline">View Syllabus</button>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden">
            <div className="p-8 md:p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="w-24 h-24 bg-blue-100 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner">
                  <BookOpen size={40} className="text-blue-600" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">In Progress</p>
                    <h3 className="text-2xl font-black text-[#0F172A]">Science: Life Processes</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                       <span className="text-slate-500">6/15 Topics Mastered</span>
                       <span className="text-[#2563EB]">40%</span>
                    </div>
                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '40%' }}
                        className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onNavigate('quiz')}
                  className="flex-1 bg-[#2563EB] text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Continue Learning <ArrowRight size={20} />
                </button>
                <button className="p-5 bg-slate-50 text-slate-800 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-100 active:scale-95">
                  <Calendar size={20} />
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 px-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
                       AD
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-white">
                    +12
                  </div>
               </div>
               <p className="text-xs font-bold text-slate-500">12 others in <span className="text-[#0F172A]">{profile?.school || 'your school'}</span> are studying this</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight px-2">Turbo Actions</h2>
          <div className="grid gap-4">
            {quickActions.map((action) => (
              <button 
                key={action.title}
                onClick={action.action}
                className="group w-full bg-white p-6 rounded-[2.25rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all text-left flex items-center gap-5"
              >
                <div className={`w-14 h-14 ${action.color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                  <action.icon size={26} />
                </div>
                <div>
                   <p className="font-black text-lg text-[#0F172A] leading-tight">{action.title}</p>
                   <p className="text-xs text-slate-500 font-medium mt-0.5">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-blue-600/30">
            <div className="space-y-2">
               <h3 className="text-2xl font-black tracking-tight leading-tight">Board Exam Countdown</h3>
               <p className="text-blue-100 text-sm font-medium">SSLC Final Exam March 2025</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
               {[
                 { val: '142', label: 'Days' },
                 { val: '08', label: 'Hrs' },
                 { val: '22', label: 'Min' }
               ].map(d => (
                 <div key={d.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                    <p className="text-lg font-black">{d.val}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">{d.label}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
