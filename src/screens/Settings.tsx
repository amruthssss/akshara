import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, LogOut, Moon, Bell, Globe, ArrowLeft, User, Shield } from 'lucide-react';

export function Settings({ onBack }: { onBack: () => void }) {
  const { logout, profile } = useAuth();

  const sections = [
    { 
      title: 'Account', 
      items: [
        { label: 'Profile Information', icon: User, desc: 'Manage your name, school, and district' },
        { label: 'Privacy & Security', icon: Shield, desc: 'Manage your data and parent access' }
      ]
    },
    { 
      title: 'Preferences', 
      items: [
        { label: 'Language', icon: Globe, desc: 'Switch between English and Kannada', value: profile?.language },
        { label: 'Dark Mode', icon: Moon, desc: 'Switch to a darker theme for night study', toggle: true },
        { label: 'Notifications', icon: Bell, desc: 'Daily study reminders and goal alerts', toggle: true }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <h1 className="text-3xl font-bold text-[#0F172A]">Settings</h1>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">{section.title}</h2>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               {section.items.map((item, i) => (
                 <div key={item.label} className={`p-6 flex items-center justify-between hover:bg-slate-50 transition-colors ${i !== section.items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                          <item.icon size={20} />
                       </div>
                       <div>
                          <p className="font-bold text-[#0F172A]">{item.label}</p>
                          <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                       </div>
                    </div>
                    {item.value && <span className="text-sm font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">{item.value}</span>}
                    {item.toggle && (
                      <div className="w-10 h-6 bg-slate-200 rounded-full p-1 relative">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        ))}

        <div className="pt-6">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 py-5 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all shadow-sm shadow-red-100"
          >
            <LogOut size={20} />
            <span>Sign Out from Akshara-Deepa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
