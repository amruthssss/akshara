import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, User, MessageSquare, Brain, ArrowLeft, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function TutorChat({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: "Namaste! I'm Akshara-Deepa, your AI SSLC specialist. Stressed about a concept? Stuck on a problem? Ask me anything about your syllabus!" }
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
          systemInstruction: `You are Akshara-Deepa, a premium AI academic companion for Class 10 Karnataka SSLC students.
Personality: Warm, encouraging, clear.
Expertise: FULL Karnataka State Board SSLC 2024-25 syllabus.

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
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">AI Tutor Chat</h2>
            <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest tracking-tighter">Powered by Akshara-Deepa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Live Specialist</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30"
      >
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                m.role === 'user' ? 'bg-[#0F172A] text-white' : 'bg-blue-600 text-white'
              }`}>
                {m.role === 'user' ? <User size={16} /> : <Brain size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed prose prose-slate max-w-none ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                  : 'bg-white text-slate-800 shadow-sm border border-slate-100'
              }`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Brain size={16} />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="relative max-w-4xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a doubt... e.g. What is Pythagoras Theorem?"
            className="w-full pl-6 pr-16 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-medium outline-none transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-90"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest">
          AI generated response • Double check with your textbook
        </p>
      </div>
    </div>
  );
}
