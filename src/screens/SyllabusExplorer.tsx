import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SYLLABUS, CHAPTER_CONTENT } from '../constants';
import { BookOpen, ChevronRight, Zap, Book, CheckCircle2, Search, ArrowRight, Target } from 'lucide-react';

interface SyllabusExplorerProps {
  onStartChapter: (subject: string, chapter: string, mode: 'study' | 'quiz') => void;
  onBack: () => void;
}

export function SyllabusExplorer({ onStartChapter, onBack }: SyllabusExplorerProps) {
  const [activeSubject, setActiveSubject] = useState('Mathematics');
  const [searchTerm, setSearchTerm] = useState('');

  const subjects = [
    { id: 'Mathematics', label: 'Mathematics', icon: Book, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Science', label: 'Science', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Social Science', label: 'Social Science', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getChapters = (subjectId: string) => {
    const data = SYLLABUS[subjectId];
    if (Array.isArray(data)) return data;
    return Object.values(data).flat() as string[];
  };

  const filteredChapters = getChapters(activeSubject).filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-4">
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter">Syllabus Hub</h1>
        <p className="text-slate-500 font-medium text-lg">Every chapter, every concept, organized for your board exams.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Subject Nav */}
        <div className="lg:w-80 shrink-0 space-y-4">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSubject(s.id)}
              className={`w-full p-6 rounded-[2rem] border transition-all flex items-center gap-4 text-left ${
                activeSubject === s.id 
                  ? 'bg-[#0F172A] border-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-2' 
                  : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className={`w-12 h-12 ${activeSubject === s.id ? 'bg-white/10' : s.bg} ${activeSubject === s.id ? 'text-white' : s.color} rounded-2xl flex items-center justify-center`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="font-black text-lg leading-tight">{s.label}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${activeSubject === s.id ? 'text-slate-400' : 'text-slate-400'}`}>
                  {getChapters(s.id).length} Chapters
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Chapters List */}
        <div className="flex-1 space-y-8">
           <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <Search className="text-slate-400 ml-4" />
              <input 
                type="text" 
                placeholder={`Search ${activeSubject.toLowerCase().replace('_', ' ')} chapters...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-4 outline-none font-bold text-slate-700"
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredChapters.map((chapter, i) => {
                  const hasContent = !!CHAPTER_CONTENT[chapter];
                  return (
                    <motion.div
                      layout
                      key={chapter}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all flex flex-col justify-between overflow-hidden relative"
                    >
                      {hasContent && (
                        <div className="absolute top-0 right-0 p-2">
                           <div className="bg-blue-600 text-white text-[8px] font-black uppercase py-1 px-2 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={10} /> Full Content
                           </div>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Target size={16} className="text-slate-300" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SSLC 2024-25</span>
                        </div>
                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight group-hover:text-blue-600 transition-colors leading-tight">
                          {chapter}
                        </h3>
                      </div>

                      <div className="mt-10 flex gap-3">
                         <button 
                          onClick={() => onStartChapter(activeSubject, chapter, 'study')}
                          className="flex-1 bg-slate-900 text-white p-4 rounded-2xl font-black text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                         >
                            <Book size={16} /> Study
                         </button>
                         <button 
                          onClick={() => onStartChapter(activeSubject, chapter, 'quiz')}
                          className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-black text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                         >
                            <Zap size={16} /> Practice
                         </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
