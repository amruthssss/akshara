/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './screens/Login';
import { ProfileSetup } from './screens/ProfileSetup';
import { Dashboard } from './screens/Dashboard';
import { QuizEngine } from './screens/QuizEngine';
import { StudyPlanner } from './screens/StudyPlanner';
import { StrengthMap } from './screens/StrengthMap';
import { TutorChat } from './screens/TutorChat';
import { Sidebar } from './components/Sidebar';
import { LoadingScreen } from './components/LoadingScreen';
import { Menu } from 'lucide-react';

import { Rewards } from './screens/Rewards';
import { Settings } from './screens/Settings';
import { StudyMaterials } from './screens/StudyMaterials';
import { SyllabusExplorer } from './screens/SyllabusExplorer';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [quizParams, setQuizParams] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <LoadingScreen />;

  if (!user) return <Login />;

  if (!profile) return <ProfileSetup />;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveScreen} onStartQuiz={(params) => { setQuizParams(params); setActiveScreen('quiz'); }} />;
      case 'quiz':
        return <QuizEngine params={quizParams} onBack={() => setActiveScreen('dashboard')} />;
      case 'planner':
        return <StudyPlanner onBack={() => setActiveScreen('dashboard')} />;
      case 'analytics':
        return <StrengthMap onBack={() => setActiveScreen('dashboard')} />;
      case 'tutor':
        return <TutorChat onBack={() => setActiveScreen('dashboard')} />;
      case 'rewards':
        return <Rewards onBack={() => setActiveScreen('dashboard')} />;
      case 'library':
        return <StudyMaterials onBack={() => setActiveScreen('dashboard')} />;
      case 'syllabus':
        return <SyllabusExplorer 
          onBack={() => setActiveScreen('dashboard')} 
          onStartChapter={(subject, chapter, mode) => {
            setQuizParams({ subject, chapter, level: 'medium', mode });
            setActiveScreen('quiz');
          }}
        />;
      case 'settings':
        return <Settings onBack={() => setActiveScreen('dashboard')} />;
      default:
        return <Dashboard onNavigate={setActiveScreen} onStartQuiz={(params) => { setQuizParams(params); setActiveScreen('quiz'); }} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <Sidebar 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-slate-50 text-slate-800 rounded-xl active:scale-95 transition-all"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-black text-[#2563EB]">Akshara-Deepa</h1>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-600/20">
            {profile?.name?.[0]}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-10">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

