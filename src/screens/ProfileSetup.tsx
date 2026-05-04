import React, { useState } from 'react';
import { motion } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { DISTRICTS } from '../constants';
import { UserCheck, Sparkles, MapPin, GraduationCap, Calendar as CalendarIcon } from 'lucide-react';

export function ProfileSetup() {
  const { user, refreshProfile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    school: '',
    district: '',
    medium: 'English',
    language: 'English',
    examDate: '2026-03-25'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Capitalize first letter of each word in name
      const formattedName = formData.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      const profileData = {
        ...formData,
        name: formattedName,
        uid: user.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid, 'profile', 'data'), profileData);
      await refreshProfile();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/profile/data`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-700 ${isDark ? 'bg-[#050505]' : 'bg-[#F8FAFC]'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl w-full app-card !p-10 md:!p-20 shadow-2xl relative overflow-hidden"
      >
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 rounded-full ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'}`} />

        <header className="mb-16 space-y-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  isDark ? 'bg-[#D9FF00] text-black' : 'bg-blue-600 text-white'
                }`}>
                  <UserCheck size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight leading-none">Initialising</h1>
                  <p className="accent-label text-[10px] !opacity-40">Profile Synchronisation</p>
                </div>
              </div>
              <h2 className="text-5xl font-black tracking-tighter leading-none pt-4">Complete Your Identity</h2>
              <p className="human-label text-lg">Let's personalise your learning journey for the 2026 Board Exams.</p>
            </div>
            <Sparkles className={`hidden md:block animate-pulse ${isDark ? 'text-[#D9FF00]' : 'text-blue-500'}`} size={48} strokeWidth={1} />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          <div className="space-y-3">
             <label className="accent-label flex items-center gap-2">
               <GraduationCap size={14} /> Full Legal Name
             </label>
             <input
               required
               value={formData.name}
               onChange={e => setFormData({ ...formData, name: e.target.value })}
               className={`w-full px-0 py-4 border-b-2 bg-transparent outline-none transition-all font-bold text-xl placeholder:opacity-20 ${
                 isDark ? 'border-white/10 focus:border-[#D9FF00] text-white' : 'border-black/5 focus:border-blue-600'
               }`}
               placeholder="Student Name"
             />
          </div>

          <div className="space-y-3">
             <label className="accent-label flex items-center gap-2">
               <Sparkles size={14} /> School Authority
             </label>
             <input
               required
               value={formData.school}
               onChange={e => setFormData({ ...formData, school: e.target.value })}
               className={`w-full px-0 py-4 border-b-2 bg-transparent outline-none transition-all font-bold text-xl placeholder:opacity-20 ${
                 isDark ? 'border-white/10 focus:border-[#D9FF00] text-white' : 'border-black/5 focus:border-blue-600'
               }`}
               placeholder="e.g. St. Xaviers"
             />
          </div>

          <div className="space-y-3">
             <label className="accent-label flex items-center gap-2">
               <MapPin size={14} /> Regional District
             </label>
             <select
               required
               value={formData.district}
               onChange={e => setFormData({ ...formData, district: e.target.value })}
               className={`w-full px-0 py-4 border-b-2 bg-transparent outline-none transition-all font-bold text-xl appearance-none cursor-pointer ${
                 isDark ? 'border-white/10 focus:border-[#D9FF00] text-white' : 'border-black/5 focus:border-blue-600'
               }`}
             >
               <option value="" className="text-black">Location</option>
               {DISTRICTS.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
             </select>
          </div>

          <div className="space-y-3">
             <label className="accent-label flex items-center gap-2">
               <CalendarIcon size={14} /> Target Date
             </label>
             <input
               type="date"
               required
               value={formData.examDate}
               onChange={e => setFormData({ ...formData, examDate: e.target.value })}
               className={`w-full px-0 py-4 border-b-2 bg-transparent outline-none transition-all font-bold text-xl ${
                 isDark ? 'border-white/10 focus:border-[#D9FF00] text-white' : 'border-black/5 focus:border-blue-600'
               }`}
             />
          </div>

          <div className="space-y-6">
            <label className="accent-label">Medium of Instruction</label>
            <div className="grid grid-cols-2 gap-4">
              {['Kannada', 'English'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({ ...formData, medium: m as any })}
                  className={`py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 active:scale-95 ${
                    formData.medium === m 
                      ? (isDark ? 'bg-[#D9FF00] border-[#D9FF00] text-black shadow-lg' : 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20') 
                      : (isDark ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-white border-black/5 text-slate-400')
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <label className="accent-label">Interface Focus</label>
            <div className="grid grid-cols-2 gap-4">
              {['Kannada', 'English'].map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setFormData({ ...formData, language: l as any })}
                  className={`py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 active:scale-95 ${
                    formData.language === l 
                      ? (isDark ? 'bg-[#D9FF00] border-[#D9FF00] text-black shadow-lg' : 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20') 
                      : (isDark ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-white border-black/5 text-slate-400')
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 pt-12">
            <button
              disabled={loading}
              className={`w-full py-8 md:py-10 rounded-[2.5rem] font-black text-xl uppercase tracking-widest transition-all shadow-2xl active:scale-95 disabled:opacity-50 ${
                isDark ? 'bg-[#D9FF00] text-black hover:bg-[#c2e600] shadow-lime-500/20' : 'bg-[#1A1A1A] text-white hover:bg-blue-600'
              }`}
            >
              {loading ? 'Synchronising...' : 'Begin Academic Mission'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
