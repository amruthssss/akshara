import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { generateStudyPlan } from '../lib/gemini';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Calendar, Zap, Target, BookOpen, Clock, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export function StudyPlanner({ onBack }: { onBack: () => void }) {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const fetchPlan = async () => {
    if (!user) return;
    const planRef = doc(db, 'users', user.uid, 'studyPlan', 'current');
    try {
      const snap = await getDoc(planRef);
      if (snap.exists()) {
        setPlan(snap.data());
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, planRef.path);
    }
  };

  const createPlan = async () => {
    if (!profile || !user) return;
    setLoading(true);
    try {
      const examDate = new Date(profile.examDate);
      const daysLeft = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      const newPlan = await generateStudyPlan({
        name: profile.name,
        school: profile.school,
        days: daysLeft,
        hours: 4, // Default
        completedList: [],
        weakList: ['Trigonometry', 'Electricity', 'Nationalism in India'],
        strongList: ['Real Numbers', 'Polynomials'],
        subjectScores: {}
      });

      const planRef = doc(db, 'users', user.uid, 'studyPlan', 'current');
      await setDoc(planRef, newPlan);
      setPlan(newPlan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [user]);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="mb-6">
        <Calendar size={64} className="text-blue-600" />
      </motion.div>
      <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Creating Your Success Strategy...</h2>
      <p className="text-slate-500 font-medium">Calculating daily targets based on your weak areas and exam date.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <h1 className="text-3xl font-bold text-[#0F172A]">Study Planner</h1>
        </div>
        <button 
          onClick={createPlan}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-bold border border-blue-50 shadow-sm hover:bg-blue-50 transition-all text-sm"
        >
          <RefreshCw size={16} /> Regenerate Plan
        </button>
      </div>

      {!plan ? (
        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-50 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target size={40} />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">No Active Study Plan</h2>
            <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
                Generate a personalised roadmap based on your current readiness and the days remaining for your SSLC boards.
            </p>
            <button 
                onClick={createPlan}
                className="bg-[#2563EB] text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all"
            >
                Generate Smart Plan
            </button>
        </div>
      ) : (
        <div className="space-y-8">
            <div className="bg-[#0F172A] text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2">Master Strategy</p>
                    <h2 className="text-3xl font-bold mb-4">{plan.planTitle}</h2>
                    <p className="text-slate-400 font-medium leading-relaxed max-w-2xl">{plan.strategy}</p>
                </div>
                <Zap className="absolute -right-8 -bottom-8 text-white/5" size={240} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plan.days.map((day: any, i: number) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={day.day}
                        className={`bg-white rounded-3xl border ${
                            day.priority === 'RED' ? 'border-red-100 shadow-red-500/5' : 
                            day.priority === 'AMBER' ? 'border-orange-100 shadow-orange-500/5' : 
                            'border-slate-100'
                        } shadow-lg p-6 flex flex-col`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <p className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${
                                    day.priority === 'RED' ? 'bg-red-100 text-red-600' : 
                                    day.priority === 'AMBER' ? 'bg-orange-100 text-orange-600' : 
                                    'bg-green-100 text-green-600'
                                }`}>DAY {day.day}</p>
                                <span className="text-xs font-bold text-slate-400">{day.date}</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                                day.priority === 'RED' ? 'bg-red-500' : 
                                day.priority === 'AMBER' ? 'bg-orange-500' : 
                                'bg-green-500'
                            }`} />
                        </div>

                        <h3 className="text-lg font-bold text-[#0F172A] mb-6 min-h-[56px] line-clamp-2">{day.theme}</h3>

                        <div className="space-y-4 flex-1">
                            {['morning', 'afternoon'].map(time => (
                                <div key={time} className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                        <Clock size={10} /> {time}
                                    </p>
                                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
                                        {day[time].subject}: {day[time].chapter}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Evening Task</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <BookOpen size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-blue-600">{day.evening.task}</p>
                                    <p className="text-[10px] font-medium text-slate-500">{day.evening.count} Questions</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-slate-50/50 rounded-2xl italic text-[11px] text-slate-500 font-medium">
                            "{day.motivationTip}"
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
