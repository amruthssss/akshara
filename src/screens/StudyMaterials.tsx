import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Search, ArrowLeft, BookOpen, Clock, ExternalLink, Library } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Resource {
  id: string;
  title: string;
  type: 'notes' | 'pyq';
  subject: string;
  url: string;
  size?: string;
  year?: string;
}

const STATIC_RESOURCES: Resource[] = [
  {
    id: 'ss-notes',
    title: 'Social Science Complete Solutions',
    type: 'notes',
    subject: 'Social Science',
    url: 'https://www.kseebsolutions.com/kseeb-sslc-class-10-social-science-solutions/'
  },
  {
    id: 'ss-pyq',
    title: 'Social Science Previous Year Papers',
    type: 'pyq',
    subject: 'Social Science',
    url: 'https://www.vedantu.com/karnataka-board/kseeb-previous-year-question-paper-class-10-social-science'
  },
  {
    id: 'sci-notes',
    title: 'Science Chapter-wise Solutions',
    type: 'notes',
    subject: 'Science',
    url: 'https://www.kseebsolutions.com/kseeb-sslc-class-10-science-solutions/'
  },
  {
    id: 'sci-pyq',
    title: 'Science Previous Question Papers',
    type: 'pyq',
    subject: 'Science',
    url: 'https://www.educationobserver.com/karnataka-sslc-previous-question-paper-collection/'
  },
  {
    id: 'maths-notes',
    title: 'Mathematics Step-by-Step Solutions',
    type: 'notes',
    subject: 'Mathematics',
    url: 'https://www.kseebsolutions.com/kseeb-sslc-class-10-maths-solutions/'
  },
  {
    id: 'maths-pyq',
    title: 'Mathematics SSLC Question Bank',
    type: 'pyq',
    subject: 'Mathematics',
    url: 'https://dietkumta.karnataka.gov.in/66/sslc-question-bank/en'
  }
];

export function StudyMaterials({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState<'all' | 'notes' | 'pyq'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = STATIC_RESOURCES.filter(r => {
    const matchType = filter === 'all' || r.type === filter;
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       r.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="app-container space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className={`app-heading ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Materials Lab</h1>
          <p className="app-subheading max-w-lg">Access curated SSLC Board resources, previous year question papers, and expert solutions.</p>
        </div>
        <div className={`flex items-center gap-4 p-3 rounded-[2rem] border transition-all ${
          isDark ? 'bg-white/5 border-white/5 shadow-inner' : 'bg-white border-slate-100 shadow-sm'
        } min-w-[320px] group focus-within:border-blue-500/50`}>
          <div className="pl-4 text-slate-400">
            <Search size={22} />
          </div>
          <input 
            type="text" 
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 p-3 outline-none font-black text-sm bg-transparent ${isDark ? 'text-white' : 'text-[#0F172A]'}`}
          />
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {(['all', 'notes', 'pyq'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border shrink-0 active:scale-95 ${
              filter === t 
                ? (isDark ? 'bg-[#D9FF00] text-black border-[#D9FF00] shadow-lime-500/20' : 'bg-[#2563EB] text-white border-blue-600 shadow-xl shadow-blue-600/20') 
                : (isDark ? 'bg-white/5 text-slate-400 border-white/5' : 'bg-white text-slate-500 border-slate-100')
            }`}
          >
            {t === 'pyq' ? 'Question Papers' : t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filtered.map((r, i) => (
            <motion.div
              layout
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className={`p-10 rounded-[3.5rem] border shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group h-full ${
                isDark ? 'bg-[#121212] border-white/5 shadow-black/40' : 'bg-white border-slate-100 shadow-blue-900/5'
              }`}
            >
              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div className={`p-5 rounded-2xl shadow-lg ${
                    r.type === 'notes' 
                      ? (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600') 
                      : (isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600')
                  }`}>
                    <FileText size={32} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Subject</span>
                    <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {r.subject}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-2xl font-black leading-tight tracking-tight group-hover:text-blue-500 transition-colors ${
                    isDark ? 'text-white' : 'text-[#0F172A]'
                  }`}>
                    {r.title}
                  </h3>
                  <div className="flex items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <Clock size={16} className="text-blue-500" /> Syllabus 2026
                    </div>
                    <div className="flex items-center gap-2">
                       <BookOpen size={16} className="text-emerald-500" /> Expert Verified
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <a 
                  href={r.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                    isDark ? 'bg-white text-black hover:bg-slate-200' : 'bg-[#0F172A] text-white hover:bg-blue-600'
                  }`}
                >
                  <ExternalLink size={20} /> Open Resource
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className={`p-24 rounded-[4rem] border text-center transition-all ${
          isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-slate-100 shadow-inner'
        }`}>
           <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-10 ${
             isDark ? 'bg-white/5 text-slate-700' : 'bg-slate-50 text-slate-300'
           }`}>
              <Library size={64} />
           </div>
           <h3 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Knowledge Core Empty</h3>
           <p className="text-slate-500 font-medium text-lg">Your search didn't match any board materials. Try broader terms.</p>
        </div>
      )}
    </div>
  );
}

