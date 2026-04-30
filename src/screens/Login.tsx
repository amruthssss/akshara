import React from 'react';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8 text-center"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
          <LogIn size={40} />
        </div>
        
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2 leading-tight">Welcome to Akshara-Deepa</h1>
        <p className="text-slate-500 mb-10 font-medium">Your expert companion for Karnataka SSLC success.</p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 px-6 rounded-2xl font-semibold text-[#0F172A] hover:bg-slate-50 transition-all hover:border-slate-200 shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          <span>Continue with Google</span>
        </button>

        <p className="mt-8 text-xs text-slate-400 font-medium">
          By continuing, you agree to Akshara-Deepa's terms and privacy policy. 
          Built for Karnataka State Board SSLC students.
        </p>
      </motion.div>
    </div>
  );
}
