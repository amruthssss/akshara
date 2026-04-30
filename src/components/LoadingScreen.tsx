import React from 'react';
import { motion } from 'motion/react';

export function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] gap-6">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full"
      />
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0F172A]">Akshara-Deepa</h2>
        <p className="text-slate-500 font-medium animate-pulse">Lighting your path to SSLC success...</p>
      </div>
    </div>
  );
}
