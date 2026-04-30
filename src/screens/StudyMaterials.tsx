import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Search, ArrowLeft, BookOpen, Clock, ExternalLink } from 'lucide-react';

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
  const [filter, setFilter] = useState<'all' | 'notes' | 'pyq'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = STATIC_RESOURCES.filter(r => {
    const matchType = filter === 'all' || r.type === filter;
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       r.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white hover:bg-slate-50 rounded-2xl transition-all shadow-sm border border-slate-100 active:scale-90">
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter">Library</h1>
            <p className="text-slate-500 font-medium">Curated SSLC Study Links</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-2.5xl shadow-sm border border-slate-100 min-w-[300px]">
          <div className="pl-3 text-slate-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search subjects or papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 outline-none font-bold text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {(['all', 'notes', 'pyq'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-8 py-4 rounded-2xl font-black text-sm capitalize transition-all border shrink-0 ${
              filter === t 
                ? 'bg-[#2563EB] text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
            }`}
          >
            {t === 'pyq' ? 'Question Papers' : t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((r, i) => (
            <motion.div
              layout
              key={r.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 transition-all flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className={`p-4 rounded-2xl ${r.type === 'notes' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    <FileText size={28} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Type</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded bg-slate-50 ${r.type === 'notes' ? 'text-blue-600' : 'text-purple-600'}`}>
                      {r.type === 'notes' ? 'Notes' : 'Exam Paper'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{r.subject}</p>
                  <h3 className="text-xl font-black text-[#0F172A] leading-tight group-hover:text-blue-600 transition-colors">
                    {r.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5 border-r border-slate-100 pr-4">
                     <Clock size={14} /> 2024-25
                  </div>
                  <div className="flex items-center gap-1.5">
                     <BookOpen size={14} /> Official Guide
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <a 
                  href={r.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95"
                >
                  <ExternalLink size={16} /> Open Resource
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
           <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} />
           </div>
           <h3 className="text-2xl font-black text-[#0F172A]">No materials found</h3>
           <p className="text-slate-500 font-medium">Try searching for other subjects</p>
        </div>
      )}
    </div>
  );
}

