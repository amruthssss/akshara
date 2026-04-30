import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, BarChart2, Calendar, MessageSquare, Award, Settings, LogOut, Home, X, Menu, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeScreen, setActiveScreen, isOpen, onClose }: SidebarProps) {
  const { logout, profile, user } = useAuth();

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
    <div className="w-72 bg-[#0F172A] text-white flex flex-col h-full relative z-50">
      <div className="p-8 pt-10">
        <h1 className="text-3xl font-black text-[#2563EB] tracking-tight">Akshara-Deepa</h1>
        <p className="text-sm font-medium text-slate-400 mt-1 opacity-80">Your SSLC Companion</p>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveScreen(item.id);
              onClose();
            }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeScreen === item.id 
                ? 'bg-[#2563EB] text-white shadow-xl shadow-blue-600/20 scale-[1.02]' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <item.icon size={22} className={activeScreen === item.id ? 'text-white' : 'text-slate-500'} />
            <span className="font-bold text-[15px]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 bg-slate-900/30">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-xl font-black shadow-lg shadow-blue-600/30">
            {profile?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[15px] font-bold truncate tracking-tight">{profile?.name || 'Amruth S Sharma'}</p>
            <p className="text-xs text-slate-500 font-medium truncate lowercase opacity-60">
              {user?.email?.split('@')[0] || 'student'}
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 font-bold text-sm transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
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
