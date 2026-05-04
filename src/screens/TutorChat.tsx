import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, User, MessageSquare, Brain, ArrowLeft, RefreshCw, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../contexts/ThemeContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function TutorChat({ onBack }: { onBack: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: "Namaste! I'm Akshara, your AI SSLC specialist. Stressed about a concept? Stuck on a problem? Ask me anything about your syllabus!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are Akshara, a premium AI academic companion for Class 10 Karnataka SSLC students.
Personality: Warm, encouraging, clear.
Expertise: FULL Karnataka State Board SSLC 2025-26 syllabus.

Rules:
1. Respond in Kannada if asked in Kannada, or English if asked in English.
2. Use mnemonics and analogies.
3. Show step-by-step methods for Maths/Science.
4. Give 1 practice question after every major explanation.
5. Never cover topics outside the SSLC syllabus.
6. ELI15 style (Explain like I'm 15).`
        }
      });

      const result = await chat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', content: result.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I'm having a technical glitch. Could you try rephrasing that?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app-container flex flex-col h-full max-w-6xl`}>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-4">
          <h1 className={`app-heading ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>AI Tutor</h1>
          <p className="app-subheading max-w-lg">Get step-by-step help with complex SSLC concepts using Akshara's Board-aligned intelligence.</p>
        </div>
        <div className={`p-5 rounded-3xl flex items-center gap-4 border transition-colors ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
           <Info className={isDark ? 'text-[#D9FF00]' : 'text-blue-600'} size={24} />
           <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Instant academic assistance available 24/7.</p>
        </div>
      </header>

      <div className={`flex-1 flex flex-col min-h-0 rounded-[3.5rem] border shadow-2xl overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#121212] border-white/5 shadow-black/40' : 'bg-white border-slate-100 shadow-blue-900/10'
      }`}>
        {/* Messages */}
        <div 
          ref={scrollRef}
          className={`flex-1 overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar ${
            isDark ? 'bg-[#0A0A0A]/50' : 'bg-slate-50/30'
          }`}
        >
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  m.role === 'user' ? (isDark ? 'bg-white text-black' : 'bg-[#0F172A] text-white') : (isDark ? 'bg-[#D9FF00] text-black' : 'bg-blue-600 text-white')
                }`}>
                  {m.role === 'user' ? <User size={20} /> : <Brain size={20} />}
                </div>
                <div className={`p-6 rounded-[2rem] text-[15px] font-medium leading-relaxed prose prose-slate max-w-none ${
                  m.role === 'user' 
                    ? (isDark ? 'bg-[#D9FF00] text-black shadow-lime-500/10' : 'bg-blue-600 text-white shadow-blue-600/20')
                    : (isDark ? 'bg-white/5 text-slate-300 border border-white/5' : 'bg-white text-slate-800 shadow-sm border border-slate-100')
                }`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${isDark ? 'bg-[#D9FF00] text-black' : 'bg-blue-600 text-white'}`}>
                  <Brain size={20} />
                </div>
                <div className={`p-6 rounded-[2rem] shadow-sm border flex gap-1.5 transition-colors ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
                  {[0, 1, 2].map(idx => (
                    <motion.div 
                      key={idx}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                      transition={{ repeat: Infinity, duration: 1, delay: idx * 0.2 }} 
                      className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`p-8 border-t transition-colors ${isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="relative max-w-4xl mx-auto group">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a doubt... e.g. What is Pythagoras Theorem?"
              className={`w-full pl-8 pr-20 py-6 text-lg font-bold rounded-[2.5rem] outline-none border-4 border-transparent transition-all shadow-inner ${
                isDark 
                  ? 'bg-white/5 focus:border-[#D9FF00] text-white placeholder:text-slate-600' 
                  : 'bg-slate-50 focus:border-blue-600 text-slate-800'
              }`}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`absolute right-3 top-3 p-4 rounded-3xl shadow-xl transition-all active:scale-90 disabled:opacity-50 ${
                isDark ? 'bg-[#D9FF00] text-black hover:bg-[#c2e600]' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send size={24} />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-500 mt-5 font-black uppercase tracking-[0.2em] opacity-60">
            Akshara AI Companion • Karnataka Board SSLC Syllabus 2025-26
          </p>
        </div>
      </div>
    </div>
  );
}
