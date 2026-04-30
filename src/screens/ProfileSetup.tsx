import React, { useState } from 'react';
import { motion } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { DISTRICTS } from '../constants';
import { UserCheck } from 'lucide-react';

export function ProfileSetup() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    school: '',
    district: '',
    medium: 'English',
    language: 'English',
    examDate: '2025-03-25'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const profileData = {
        ...formData,
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8 md:p-12"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <UserCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Complete Your Profile</h1>
            <p className="text-slate-500 font-medium">Let's personalise your learning experience.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <input
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none transition-all"
              placeholder="e.g. Rahul Kumar"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">School Name</label>
            <input
              required
              value={formData.school}
              onChange={e => setFormData({ ...formData, school: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none transition-all"
              placeholder="e.g. St. Joseph High School"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">District</label>
            <select
              required
              value={formData.district}
              onChange={e => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none transition-all"
            >
              <option value="">Select District</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Medium of Instruction</label>
            <div className="flex gap-4">
              {['Kannada', 'English'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({ ...formData, medium: m as any })}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                    formData.medium === m ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Interface Language</label>
            <div className="flex gap-4">
              {['Kannada', 'English'].map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setFormData({ ...formData, language: l as any })}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                    formData.language === l ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Final Exam Date</label>
            <input
              type="date"
              required
              value={formData.examDate}
              onChange={e => setFormData({ ...formData, examDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'Saving Profile...' : 'Start Learning with Akshara-Deepa'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
