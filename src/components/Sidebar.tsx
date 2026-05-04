import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, BarChart2, Calendar, MessageSquare, Award, Settings, LogOut, Home, X, Menu, Zap, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeScreen, setActiveScreen, isOpen, onClose }: SidebarProps) {
  const { logout, profile, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'syllabus', icon: BookOpen, label: 'Syllabus Hub' },
    { id: 'quiz', icon: Zap, label: 'Quiz Lab' },
    { id: 'planner', icon: Calendar, label: 'Study Planner' },
    { id: 'analytics', icon: BarChart2, label: 'Strength Map' },
    { id: 'tutor', icon: MessageSquare, label: 'AI Tutor' },
    { id: 'library', icon: BookOpen, label: 'Library' },
    { id: 'rewards', icon: Award, label: 'Rewards' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const content = (
    <div className={`w-80 flex flex-col h-full relative z-50 transition-colors duration-500 border-r ${
      theme === 'dark' ? 'bg-[#050505] border-white/5 text-[#F5F5F5]' : 'bg-[#FDFDFD] text-[#1A1A1A] border-black/5'
    }`}>
      <div className="p-12 pb-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className={`text-4xl font-black tracking-tighter leading-none ${theme === 'dark' ? 'text-[#D9FF00]' : 'text-[#0F172A]'}`}>
              Akshara
            </h1>
            <p className="accent-label">Mission: SSLC 2026</p>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-4 rounded-[1.5rem] transition-all active:scale-95 border ${
              theme === 'dark' ? 'bg-white/5 text-[#D9FF00] border-white/5' : 'bg-black/5 text-[#0F172A] border-transparent'
            }`}
          >
            {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-8 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveScreen(item.id);
              onClose();
            }}
            className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-500 group relative ${
              activeScreen === item.id 
                ? (theme === 'dark' ? 'bg-white text-black shadow-2xl' : 'bg-[#0F172A] text-white shadow-2xl shadow-slate-900/40') 
                : 'text-slate-500 hover:text-blue-500'
            }`}
          >
            {activeScreen === item.id && (
              <motion.div 
                layoutId="nav-acc"
                className={`absolute left-0 w-1.5 h-6 rounded-r-full ${theme === 'dark' ? 'bg-lime-500' : 'bg-blue-600'}`}
              />
            )}
            <item.icon size={22} strokeWidth={activeScreen === item.id ? 2.5 : 2} />
            <span className={`text-sm tracking-tight ${activeScreen === item.id ? 'font-black' : 'font-bold'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={`p-10 border-t ${theme === 'dark' ? 'border-white/5' : 'border-black/5 bg-slate-50/50'}`}>
        <div className="flex items-center gap-5 mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl shrink-0 ${
            theme === 'dark' ? 'bg-white/5 text-[#D9FF00]' : 'bg-[#0F172A] text-white'
          }`}>
            {profile?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 overflow-hidden space-y-0.5">
            <p className="text-base font-black truncate tracking-tighter leading-none">{profile?.name || 'A. Scholar'}</p>
            <p className="accent-label !lowercase !tracking-normal !opacity-40 truncate">
              {profile?.district || 'Karnataka Board'}
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-2 py-4 text-slate-500 hover:text-red-500 font-black text-xs uppercase tracking-[0.2em] transition-all group"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
        {content}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 shadow-2xl"
            >
              <button 
                onClick={onClose}
                className="absolute top-6 -right-12 p-2 bg-white rounded-full text-slate-900 shadow-xl"
              >
                <X size={20} />
              </button>
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
