import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateQuiz } from '../lib/gemini';
import { QuizQuestion } from '../types';
import { SYLLABUS, CHAPTER_CONTENT } from '../constants';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, XCircle, Clock, Save, Brain, Info, Zap, BookOpen, Target, Award, Book, Play, FileText, ArrowLeft, MessageSquare } from 'lucide-react';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { MOCK_QUESTIONS } from '../mockData';

interface QuizEngineProps {
  params?: {
    subject: string;
    chapter: string;
    level: string;
    mode?: 'study' | 'quiz';
  };
  onBack: () => void;
}

export function QuizEngine({ params, onBack }: QuizEngineProps) {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'selection' | 'study' | 'quiz' | 'result'>(params?.mode === 'study' ? 'study' : 'selection');
  const [quizConfig, setQuizConfig] = useState(params || {
    subject: 'Mathematics',
    chapter: SYLLABUS.Mathematics[0],
    level: 'medium'
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(quizConfig.subject);

  const qConfigs: any = { easy: 300, medium: 600, hard: 900 };

  const startQuiz = async () => {
    setLoading(true);
    setView('quiz');
    try {
      let data;
      try {
        data = await generateQuiz({
          ...quizConfig,
          count: 10
        });
      } catch (err) {
        console.warn("AI generation failed, falling back to local questions", err);
        data = MOCK_QUESTIONS.filter(q => q.subject === quizConfig.subject).slice(0, 5);
        if (data.length === 0) data = MOCK_QUESTIONS.slice(0, 5);
      }
      setQuestions(data);
      setCurrentIdx(0);
      setAnswers({});
      setShowResult(false);
      setTimeLeft(qConfigs[quizConfig.level] || 600);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params && params.mode === 'quiz') startQuiz();
    if (params && params.mode === 'study') setView('study');
  }, [params]);

  useEffect(() => {
    if (questions.length > 0 && !showResult && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResult && questions.length > 0) {
      calculateScore();
    }
  }, [questions, showResult, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const calculateScore = async () => {
    let s = 0;
    questions.forEach(q => {
      if (q.type === 'MCQ' && answers[q.id] === q.correctAnswer) s += q.marks;
      if (q.type === 'FILL' && answers[q.id]?.toLowerCase() === q.fillAnswer?.toLowerCase()) s += q.marks;
    });
    setScore(s);
    setView('result');

    // Save to Firestore
    if (!auth.currentUser) return;
    const sessionId = `session_${Date.now()}`;
    const historyRef = doc(db, 'users', auth.currentUser.uid, 'quizHistory', sessionId);
    const progressId = `${quizConfig.subject}_${quizConfig.chapter}`.replace(/\//g, '_');
    const progressRef = doc(db, 'users', auth.currentUser.uid, 'progress', progressId);

    try {
      await setDoc(historyRef, {
        subject: quizConfig.subject,
        chapter: quizConfig.chapter,
        score: s,
        totalQ: questions.length,
        date: new Date().toISOString(),
        difficulty: quizConfig.level,
        wrongQuestions: questions.filter(q => {
           if (q.type === 'MCQ') return answers[q.id] !== q.correctAnswer;
           if (q.type === 'FILL') return answers[q.id]?.toLowerCase() !== q.fillAnswer?.toLowerCase();
           return false;
        }).map(q => q.id)
      });

      // Update progress
      await setDoc(progressRef, {
        subject: quizConfig.subject,
        chapter: quizConfig.chapter,
        lastAttempted: new Date().toISOString(),
        totalQuizzesTaken: increment(1),
        avgScore: s / questions.length * 100, // Roughly
        completionPercent: increment(10)
      }, { merge: true });

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, historyRef.path);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="mb-6">
        <Brain size={64} className="text-blue-600" />
      </motion.div>
      <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Generating Your Smart Quiz...</h2>
      <p className="text-slate-500 font-medium">Akshara-Deepa is curating questions based on SSLC 2024-25 syllabus.</p>
    </div>
  );

  if (view === 'result') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 transition-all duration-700">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 text-center border-b-8 border-green-500">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] mb-4 tracking-tighter">Mastery Achieved!</h1>
          <div className="flex justify-center gap-6 mb-10">
            <div className="px-10 py-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Score Accuracy</p>
              <p className="text-4xl font-black text-[#2563EB]">{Math.round((score / questions.reduce((a, b) => a + b.marks, 0)) * 100)}%</p>
            </div>
            <div className="px-10 py-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Points Won</p>
              <p className="text-4xl font-black text-green-600">+{score * 10}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setView('selection')}
              className="px-8 py-5 bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
              Study More
            </button>
            <button 
              onClick={startQuiz}
              className="px-8 py-5 bg-[#2563EB] text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Try Next Level
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#0F172A] px-4 tracking-tight">Answer Insights</h2>
          <div className="grid gap-4">
            {questions.map((q, i) => {
               const isCorrect = (q.type === 'MCQ' && answers[q.id] === q.correctAnswer) || (q.type === 'FILL' && answers[q.id]?.toLowerCase() === q.fillAnswer?.toLowerCase());
               return (
                 <motion.div 
                   key={q.id} 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className={`bg-white p-8 rounded-[2rem] border transition-all ${isCorrect ? 'border-green-100' : 'border-red-100 shadow-xl shadow-red-900/5'}`}
                 >
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {i + 1}</span>
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {isCorrect ? 'CORRECT' : 'MISSED'}
                           </span>
                        </div>
                        <p className="text-xl font-bold text-[#0F172A] leading-tight">{q.question}</p>
                      </div>
                      <div className={`p-3 rounded-2xl ${isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {isCorrect ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                      </div>
                    </div>
                    
                    <div className="grid gap-3 mb-6">
                      {q.type === 'MCQ' && q.options?.map((opt, optIdx) => (
                         <div 
                          key={optIdx} 
                          className={`p-4 rounded-xl text-sm font-bold border ${
                            optIdx === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-700' : 
                            (answers[q.id] === optIdx ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-transparent text-slate-500')
                          }`}
                         >
                            {opt}
                         </div>
                      ))}
                    </div>

                    <div className="bg-slate-50/80 p-6 rounded-2xl text-[13px] font-medium leading-relaxed border border-slate-100">
                      <p className="text-slate-400 mb-3 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                        <Brain size={14} className="text-blue-500" /> AI Deep Dive
                      </p>
                      <p className="text-[#0F172A] opacity-90">{q.explanation}</p>
                    </div>
                 </motion.div>
               );
            })}
          </div>
        </div>
      </div>
    )
  }

  if (view === 'study') {
    const content = CHAPTER_CONTENT[quizConfig.chapter];
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="flex items-center gap-6">
          <button onClick={() => setView('selection')} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all">
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter">{quizConfig.chapter}</h1>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">{quizConfig.subject} Mastery</p>
          </div>
        </div>

        {content ? (
          <div className="grid gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-900/5">
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10 italic">"{content.intro}"</p>
              
              <div className="space-y-8">
                <h3 className="text-2xl font-black text-[#0F172A] flex items-center gap-3">
                  <Book className="text-blue-600" /> Key Concepts
                </h3>
                <div className="grid gap-4">
                  {content.concepts.map((c: any, i: number) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="font-black text-[#0F172A] mb-1">{c.title}</p>
                      <p className="text-sm text-slate-500 font-medium">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-blue-900/5">
              <h3 className="text-2xl font-black text-[#0F172A] flex items-center gap-3 mb-8">
                <MessageSquare className="text-purple-600" /> Solved Board Questions
              </h3>
              <div className="space-y-6">
                {content.qa.map((item: any, i: number) => (
                  <div key={i} className="space-y-3 pb-6 border-b border-slate-50 last:border-0">
                    <p className="font-bold text-[#0F172A] text-lg">Q: {item.q}</p>
                    <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100">
                       <p className="text-green-800 font-medium leading-relaxed"><span className="font-black uppercase text-[10px] block mb-1">Answer</span> {item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={startQuiz}
              className="w-full bg-[#2563EB] text-white py-10 rounded-[3rem] font-black text-3xl shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-6"
            >
              <Zap size={40} /> Test Your Knowledge
            </button>
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[3rem] text-center space-y-6 border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                <BookOpen size={40} />
             </div>
             <div>
                <h3 className="text-2xl font-black text-[#0F172A]">Content Loading...</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">We're updating the key concepts for this chapter. You can still take the AI Quiz to practice!</p>
             </div>
             <button onClick={startQuiz} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black">Start AI Quiz Instead</button>
          </div>
        )}
      </div>
    );
  }

  if (questions.length > 0 && view === 'quiz') {
    const q = questions[currentIdx];
    return (
      <div className="max-w-4xl mx-auto space-y-8 h-full flex flex-col pb-10">
        <div className="flex items-center justify-between px-2">
          <button onClick={onBack} className="p-3 bg-white text-slate-500 font-bold rounded-2xl flex items-center gap-2 shadow-sm border border-slate-100 active:scale-90 transition-all">
            <ChevronLeft size={20} /> <span className="hidden sm:inline">Exit Quiz</span>
          </button>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quizConfig.subject}</p>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{quizConfig.chapter}</p>
             </div>
             <div className={`px-5 py-3 rounded-2xl font-mono font-bold text-lg flex items-center gap-3 shadow-md transition-all ${timeLeft < 60 ? 'bg-red-600 text-white animate-pulse' : 'bg-[#0F172A] text-white shadow-blue-900/10'}`}>
               <Clock size={20} /> {formatTime(timeLeft)}
             </div>
          </div>
        </div>

        <div className="px-2">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              className="h-full bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase mt-3 tracking-widest text-right">
            Question {currentIdx + 1} of {questions.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 bg-white p-8 md:p-14 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-slate-50 flex flex-col"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-10">
                <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                  {q.conceptTag || 'Concept'}
                </span>
                <div className="flex items-center gap-2 text-slate-500 font-bold border-2 border-slate-50 px-4 py-1.5 rounded-xl">
                   <Target size={16} />
                   <span className="text-sm">{q.marks} Marks</span>
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] leading-[1.1] mb-12 tracking-tight">
                {q.question}
              </h2>

              <div className="grid grid-cols-1 gap-5">
                {q.type === 'MCQ' && q.options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(q.id, i)}
                    className={`group p-6 rounded-[2rem] border-2 text-left font-bold transition-all flex items-center justify-between gap-5 cursor-pointer ${
                      answers[q.id] === i 
                        ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] shadow-lg shadow-blue-600/5' 
                        : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50/30 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                         answers[q.id] === i ? 'bg-[#2563EB] text-white shadow-md' : 'bg-white border text-slate-400 group-hover:border-slate-300'
                       }`}>
                         {String.fromCharCode(65 + i)}
                       </div>
                       <span className="text-lg md:text-xl tracking-tight leading-tight">{opt}</span>
                    </div>
                    {answers[q.id] === i && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#2563EB]">
                         <CheckCircle2 size={28} />
                      </motion.div>
                    )}
                  </button>
                ))}
                
                {q.type === 'FILL' && (
                  <div className="relative">
                    <input 
                      type="text"
                      autoFocus
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerSelect(q.id, e.target.value)}
                      className="w-full p-8 bg-slate-50/50 rounded-[2rem] font-bold text-2xl outline-none border-4 border-transparent focus:border-[#2563EB] focus:bg-white transition-all shadow-inner tracking-tight"
                      placeholder="Type your answer..."
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                       <Zap size={32} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-16 pt-10 border-t border-slate-50">
              <button 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold disabled:opacity-30 transition-all active:scale-95 text-lg"
              >
                Previous
              </button>
              {currentIdx === questions.length - 1 ? (
                <button 
                  onClick={calculateScore}
                  className="flex-1 py-5 bg-[#2563EB] text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Confirm & Submit
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="flex-1 py-5 bg-[#0F172A] text-white rounded-[1.5rem] font-black text-xl transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/20"
                >
                  Save & Next
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-3xl mb-4 shadow-inner">
           <Brain size={48} className="animate-pulse" />
        </div>
        <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter sm:text-6xl">Quiz Lab</h1>
        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">Master every chapter with AI-curated SSLC board questions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Hierarchy Selection Tree */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100/50">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                <BookOpen size={20} />
             </div>
             <h2 className="text-xl font-extrabold text-[#0F172A]">Syllabus Explorer</h2>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {Object.entries(SYLLABUS).map(([key, value]) => {
              const subjectName = key.replace('_', ' ');
              const isExpanded = expandedSubject === subjectName;
              return (
                <div key={key} className="space-y-2">
                   <button 
                    onClick={() => setExpandedSubject(isExpanded ? null : subjectName)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl font-black transition-all ${
                      isExpanded ? 'bg-[#0F172A] text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                   >
                    <span className="tracking-tight">{subjectName}</span>
                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                      <ChevronRight size={18} />
                    </motion.div>
                   </button>
                   
                   <AnimatePresence>
                     {isExpanded && (
                       <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-1 pl-4"
                       >
                         {(value as any).constructor === Array 
                           ? (value as any).map((c: string) => (
                             <button
                               key={c}
                               onClick={() => setQuizConfig({ ...quizConfig, subject: subjectName, chapter: c })}
                               className={`w-full text-left p-4 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${
                                 quizConfig.chapter === c && quizConfig.subject === subjectName ? 'bg-blue-50 text-blue-600 px-6 translate-x-2' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                               }`}
                             >
                                <div className={`w-1.5 h-1.5 rounded-full ${quizConfig.chapter === c && quizConfig.subject === subjectName ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                {c}
                             </button>
                           ))
                           : Object.entries(value).map(([cat, chapters]) => (
                              <div key={cat} className="space-y-1 mt-4 first:mt-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">{cat}</p>
                                {(chapters as string[]).map(c => (
                                  <button
                                    key={c}
                                    onClick={() => setQuizConfig({ ...quizConfig, subject: subjectName, chapter: c })}
                                    className={`w-full text-left p-4 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${
                                      quizConfig.chapter === c && quizConfig.subject === subjectName ? 'bg-blue-50 text-blue-600 px-6 translate-x-2' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full ${quizConfig.chapter === c && quizConfig.subject === subjectName ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                    {c}
                                  </button>
                                ))}
                              </div>
                           ))}
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col gap-10">
           <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Selection</p>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black text-[#0F172A] leading-tight">{quizConfig.chapter}</h3>
                <p className="font-bold text-blue-600">{quizConfig.subject} Board Syllabus</p>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Mastery Difficulty</label>
              <div className="grid grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map(l => (
                   <button 
                    key={l}
                    onClick={() => setQuizConfig({ ...quizConfig, level: l as any })}
                    className={`py-4 rounded-3xl border-2 font-black capitalize transition-all active:scale-95 ${
                      quizConfig.level === l 
                        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-xl shadow-orange-500/10' 
                        : 'border-slate-50 text-slate-500 hover:bg-slate-50'
                    }`}
                   >
                    {l}
                   </button>
                ))}
              </div>
           </div>

           <div className="bg-blue-50/40 p-6 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                 <Zap size={16} /> <span>Smart Adaptive Mode Enabled</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                 AI will focus on your weak areas within this chapter and simulate original SSLC 2024 board exam patterns.
              </p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setView('study')}
                className="group p-6 bg-white border-2 border-slate-100 rounded-[2rem] text-left hover:border-blue-600 transition-all active:scale-95 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                   <Book size={24} />
                </div>
                <div>
                   <p className="font-black text-[#0F172A]">Study Guide</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concepts & Q/A</p>
                </div>
              </button>

              <button 
                onClick={startQuiz}
                className="group p-6 bg-white border-2 border-slate-100 rounded-[2rem] text-left hover:border-orange-500 transition-all active:scale-95 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                   <Play size={24} />
                </div>
                <div>
                   <p className="font-black text-[#0F172A]">AI Practice</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timed Quiz</p>
                </div>
              </button>
           </div>
           
           <div className="flex items-center justify-center gap-8 text-slate-400 h-10 px-4">
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-tighter">
                 <Clock size={14} /> {formatTime(qConfigs[quizConfig.level])} Target
              </div>
              <div className="w-px h-full bg-slate-100" />
              <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-tighter">
                 <Award size={14} /> 10 High Yield Qs
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
