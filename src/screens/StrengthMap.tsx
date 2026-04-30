import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowLeft, Target, TrendingUp, Award, Zap, AlertCircle } from 'lucide-react';

export function StrengthMap({ onBack }: { onBack: () => void }) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      const historyQuery = query(
        collection(db, 'users', user.uid, 'quizHistory'),
        orderBy('date', 'desc'),
        limit(20)
      );
      const snap = await getDocs(historyQuery);
      const history = snap.docs.map(doc => doc.data());

      // Mock processing for radar chart
      const radarData = [
        { subject: 'Math', A: 85, fullMark: 100 },
        { subject: 'Science', A: 78, fullMark: 100 },
        { subject: 'Social', A: 92, fullMark: 100 },
        { subject: 'English', A: 65, fullMark: 100 },
        { subject: 'Kannada', A: 88, fullMark: 100 },
      ];

      setData({ radarData, history });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/quizHistory`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }} 
        transition={{ repeat: Infinity, duration: 2 }} 
        className="mb-8 p-6 bg-blue-50 rounded-full"
      >
        <TrendingUp size={48} className="text-blue-600" />
      </motion.div>
      <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Computing Your Mastery...</h2>
      <p className="text-slate-500 font-medium mt-2">Aggregating SSLC performance data</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-4 bg-white hover:bg-slate-50 rounded-2xl transition-all shadow-sm border border-slate-100 active:scale-90">
          <ArrowLeft size={24} className="text-slate-900" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter">Performance Engine</h1>
          <p className="text-slate-500 font-medium">Real-time board readiness metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Radar Chart Card */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-slate-100 flex flex-col items-center">
            <h2 className="text-xl font-black text-[#0F172A] mb-10 text-left w-full tracking-tight">Subject Matrix</h2>
            <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
                        <PolarGrid stroke="#F1F5F9" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 900 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Mastery"
                            dataKey="A"
                            stroke="#2563EB"
                            strokeWidth={3}
                            fill="#2563EB"
                            fillOpacity={0.15}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full mt-8">
                <div className="p-6 bg-green-50/50 rounded-3xl text-center border border-green-100">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Primary Strength</p>
                    <p className="font-black text-slate-900 text-lg">Social Science</p>
                </div>
                <div className="p-6 bg-red-50/50 rounded-3xl text-center border border-red-100">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Growth Area</p>
                    <p className="font-black text-slate-900 text-lg">English</p>
                </div>
            </div>
        </div>

        {/* Prediction & Insights */}
        <div className="space-y-8">
            <div className="bg-[#0F172A] text-white p-10 rounded-[3rem] shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-600/20 transition-all duration-1000" />
                <div className="relative z-10">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Board Prediction v1.2</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-black tracking-tighter">74</span>
                        <span className="text-2xl font-black text-slate-500 tracking-tighter">/ 80</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-sm font-black mt-4">
                        <TrendingUp size={18} /> 
                        <span>Surpassing {profile?.district || 'State'} average by 12%</span>
                    </div>
                </div>
                <div className="absolute bottom-8 right-8 w-20 h-20 rounded-[2rem] border-4 border-blue-500/30 flex items-center justify-center text-3xl font-black bg-blue-500/10 rotate-12">
                    A+
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <Zap size={24} />
                    </div>
                    <h4 className="text-[#0F172A] font-black mb-2 text-lg tracking-tight">Momentum Key</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Solving speed is up by 14s per question. High board potential detected.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <AlertCircle size={24} />
                    </div>
                    <h4 className="text-[#0F172A] font-black mb-2 text-lg tracking-tight">Risk Mitigation</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">English Poetry recall is below 60%. Schedule a dedicated revision soon.</p>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-[#0F172A] text-xl tracking-tight">Board Readiness</h3>
                    <Award className="text-blue-600" size={24} />
                </div>
                <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden mb-6 border border-slate-100 shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    />
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <span>Novice</span>
                    <span className="text-[#0F172A] px-3 py-1 bg-blue-50 rounded-full">Level 82/100</span>
                    <span>Expert</span>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-slate-100">
        <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Mastery Trajectory</h2>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Accuracy</span>
                </div>
            </div>
        </div>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.history.map((h: any, i: number) => ({ name: i, score: (h.score/h.totalQ)*100 })).reverse()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                 contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                 labelStyle={{ display: 'none' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#2563EB" 
                strokeWidth={5} 
                dot={{ r: 6, fill: '#2563EB', strokeWidth: 3, stroke: '#fff' }} 
                activeDot={{ r: 10, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
