import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateQuiz, validateAnswer } from '../lib/gemini';
import { QuizQuestion } from '../types';
import { SYLLABUS, CHAPTER_CONTENT } from '../constants';
import { updateMastery } from '../lib/mastery';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, 
  Brain, Info, Zap, BookOpen, Target, Award, 
  Book, Play, FileText, ArrowLeft, MessageSquare, Sparkles 
} from 'lucide-react';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { MOCK_QUESTIONS } from '../mockData';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface QuizEngineProps {
  params?: {
    subject: string;
    chapter: string;
    level: string;
    mode?: 'study' | 'quiz';
    marks?: number;
    type?: 'MCQ' | 'SHORT' | 'LONG' | 'BOARD_PATTERN';
  };
  onBack: () => void;
}

export function QuizEngine({ params, onBack }: QuizEngineProps) {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [view, setView] = useState<'selection' | 'study' | 'quiz' | 'result'>(params?.mode === 'study' ? 'study' : 'selection');
  const [quizConfig, setQuizConfig] = useState(params || {
    subject: 'Mathematics',
    chapter: SYLLABUS.Mathematics[0] as string,
    level: 'medium',
    type: 'MCQ' as const,
    marks: undefined as number | undefined
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [evaluation, setEvaluation] = useState<Record<string, any>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
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
          subject: quizConfig.subject,
          chapter: quizConfig.chapter,
          level: quizConfig.level,
          type: quizConfig.type as any,
          marks: quizConfig.marks,
          count: quizConfig.type === 'BOARD_PATTERN' ? 12 : 10
        });
      } catch (err) {
        console.warn("AI generation failed, falling back to local questions", err);
        data = MOCK_QUESTIONS.filter(q => q.subject === quizConfig.subject).slice(0, 5);
        if (data.length === 0) data = MOCK_QUESTIONS.slice(0, 5);
      }
      setQuestions(data);
      setCurrentIdx(0);
      setAnswers({});
      setScore(0);
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
    if (questions.length > 0 && view !== 'result' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && view !== 'result' && questions.length > 0) {
      calculateScore();
    }
  }, [questions, view, timeLeft]);

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
    let totalMax = 0;
    questions.forEach(q => {
      totalMax += q.marks;
      if (q.type === 'MCQ' && answers[q.id] === q.correctAnswer) s += q.marks;
      if (q.type === 'FILL' && answers[q.id]?.toLowerCase() === q.fillAnswer?.toLowerCase()) s += q.marks;
      if ((q.type === 'SHORT' || q.type === 'LONG') && evaluation[q.id]) s += evaluation[q.id].score;
    });
    setScore(s);
    setView('result');

    // Update Local Mastery Map (Strength Map)
    updateMastery(quizConfig.subject, quizConfig.chapter, s, totalMax);

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

  const evaluateDescriptive = async (q: QuizQuestion) => {
    if (!answers[q.id] || answers[q.id].length < 10) return;
    setIsEvaluating(true);
    try {
      const result = await validateAnswer({
        subject: q.subject,
        chapter: q.chapter,
        question: q.question,
        marks: q.marks,
        studentAnswer: answers[q.id]
      });
      setEvaluation(prev => ({ ...prev, [q.id]: result }));
    } catch (err) {
      console.error("Evaluation failed", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading) return (
    <div className={`h-full flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-1000 ${
      isDark ? 'bg-[#050505]' : 'bg-[#F8FAFC]'
    }`}>
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }} 
        transition={{ 
          rotate: { repeat: Infinity, duration: 4, ease: "linear" },
          scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        }} 
        className={`mb-12 p-8 rounded-[2.5rem] shadow-2xl relative ${isDark ? 'bg-white/5' : 'bg-white'}`}
      >
        <div className={`absolute inset-0 blur-2xl opacity-20 rounded-full animate-pulse ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'}`} />
        <Brain size={100} className={isDark ? 'text-[#D9FF00]' : 'text-blue-600'} strokeWidth={1} />
      </motion.div>
      <div className="space-y-4">
        <h2 className={`text-5xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>Synthesizing Simulation...</h2>
        <p className="human-label text-xl max-w-sm mx-auto opacity-60">Neural adaptive engine is cross-referencing KSEEB priorities for the 2026 Batch.</p>
      </div>
      
      <div className="mt-16 w-64 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className={`h-full w-1/2 ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'}`}
        />
      </div>
    </div>
  );

  if (view === 'result') {
    return (
      <div className="app-container space-y-20 pb-40 animate-in fade-in slide-in-from-bottom-10 transition-all duration-1000">
        <header className="pt-10 flex flex-col items-center text-center space-y-6">
           <div className="flex items-center gap-3">
             <div className="h-px w-12 bg-black/10 dark:bg-white/10" />
             <span className="accent-label uppercase tracking-[0.4em]">Performance Diagnostics</span>
             <div className="h-px w-12 bg-black/10 dark:bg-white/10" />
           </div>
           <h1 className="app-heading !text-7xl">Mission Debrief</h1>
        </header>

        <div className={`app-card !p-16 !rounded-[4rem] text-center relative overflow-hidden group ${
          isDark ? 'border-b-[16px] border-[#D9FF00]' : 'border-b-[16px] border-blue-600 shadow-[0_50px_100px_-20px_rgba(37,99,235,0.15)]'
        }`}>
          <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] opacity-10 transition-all group-hover:scale-125 ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'}`} />
          
          <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-2xl transition-transform hover:rotate-12 ${
            isDark ? 'bg-white text-black' : 'bg-[#1A1A1A] text-white'
          }`}>
            <Award size={64} strokeWidth={1} />
          </div>

          <h2 className="text-5xl font-black mb-12 tracking-tighter leading-none">Assessment Complete</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-3xl mx-auto">
            <div className="app-card !p-10 !rounded-[2.5rem] border-2 border-dashed border-black/10 dark:border-white/10">
              <p className="accent-label !opacity-40 mb-4">Precision Accuracy</p>
              <div className="flex items-baseline justify-center gap-2">
                 <p className={`text-7xl font-black tracking-tighter ${isDark ? 'text-[#D9FF00]' : 'text-blue-600'}`}>
                   {Math.round((score / questions.reduce((a, b) => a + b.marks, 0)) * 100)}
                 </p>
                 <span className="text-2xl font-black opacity-20">%</span>
              </div>
            </div>
            <div className="app-card !p-10 !rounded-[2.5rem] border-2 border-dashed border-black/10 dark:border-white/10">
              <p className="accent-label !opacity-40 mb-4">Mastery Progression</p>
              <div className="flex items-baseline justify-center gap-2">
                 <span className="text-2xl font-black opacity-20">+</span>
                 <p className={`text-7xl font-black tracking-tighter ${isDark ? 'text-[#D9FF00]' : 'text-blue-600'}`}>{score * 10}</p>
                 <span className="text-sm font-black opacity-40 uppercase ml-2 tracking-tighter">XP Points</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => setView('selection')}
              className={`px-14 py-8 rounded-[2rem] font-black text-xl uppercase tracking-widest transition-all active:scale-95 ${
                isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 border border-black/5 text-slate-900 hover:bg-slate-100'
              }`}
            >
              Back to Inventory
            </button>
            <button 
              onClick={startQuiz}
              className={`px-14 py-8 rounded-[2rem] font-black text-xl uppercase tracking-widest transition-all shadow-3xl active:scale-95 ${
                isDark ? 'bg-[#D9FF00] text-black hover:bg-[#c2e600]' : 'bg-[#1A1A1A] text-white hover:bg-blue-600'
              }`}
            >
              Analyze Next Unit
            </button>
          </div>
        </div>

        <div className="space-y-12">
          <div className="flex items-center gap-3 px-8">
            <span className="accent-label">Neural Log Analysis</span>
            <div className="h-px w-20 bg-black/10 dark:bg-white/10" />
          </div>

          <div className="grid gap-8">
            {questions.map((q, i) => {
               const isCorrect = (q.type === 'MCQ' && answers[q.id] === q.correctAnswer) || (q.type === 'FILL' && answers[q.id]?.toLowerCase() === q.fillAnswer?.toLowerCase());
               return (
                 <motion.div 
                   key={q.id} 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="app-card !p-12 !rounded-[3rem] transition-all group overflow-hidden relative"
                 >
                    <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    
                    <div className="flex flex-col md:flex-row items-start justify-between gap-10">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] ${
                             isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                           }`}>
                             {isCorrect ? 'SUCCESSFUL_EXECUTION' : 'LOGICAL_ERROR'}
                           </div>
                           <span className="accent-label font-bold !opacity-30 tracking-tight">Sequence #{i + 1}</span>
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter leading-tight">{q.question}</h3>
                        
                        <div className="grid gap-4 max-w-2xl pt-4">
                          {q.type === 'MCQ' && q.options?.map((opt, optIdx) => (
                             <div 
                              key={optIdx} 
                              className={`p-6 rounded-[1.5rem] text-sm font-black transition-all flex items-center justify-between border-2 ${
                                optIdx === q.correctAnswer 
                                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 
                                (answers[q.id] === optIdx 
                                  ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' 
                                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent text-slate-500')
                              }`}
                             >
                                <span className="flex-1">{opt}</span>
                                {optIdx === q.correctAnswer && <CheckCircle2 size={18} className="shrink-0" />}
                                {answers[q.id] === optIdx && optIdx !== q.correctAnswer && <XCircle size={18} className="shrink-0" />}
                             </div>
                          ))}
                        </div>

                        <div className="app-card !bg-blue-600/5 !border-blue-600/10 !p-8 !rounded-[2rem] space-y-4">
                           <div className="flex items-center gap-3">
                              <Brain size={20} className="text-blue-500" />
                              <span className="accent-label !text-[9px] !text-blue-600 dark:!text-blue-400">Heuristic Explanation</span>
                           </div>
                           <p className="human-label !text-base leading-relaxed opacity-80">{q.explanation}</p>
                        </div>
                      </div>

                      <div className={`w-20 h-20 rounded-2xl shrink-0 flex items-center justify-center border-4 ${
                        isCorrect 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      }`}>
                         {isCorrect ? <Target size={32} strokeWidth={2.5} /> : <Info size={32} strokeWidth={2.5} />}
                      </div>
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
      <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-40 px-6">
        <div className="flex items-center gap-8 pt-10">
          <button 
            onClick={() => setView('selection')} 
            className={`p-5 rounded-[1.5rem] shadow-xl border transition-all active:scale-90 ${
              isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-black/5 text-slate-900'
            }`}
          >
            <ArrowLeft size={28} />
          </button>
          <div className="space-y-2">
            <span className="accent-label">Information guide</span>
            <h1 className="text-5xl font-black tracking-tighter leading-none">{quizConfig.chapter}</h1>
          </div>
        </div>

        {content ? (
          <div className="space-y-12">
            <div className="app-card !p-12 !rounded-[3.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl" />
              <p className="human-label !text-2xl leading-relaxed italic opacity-80 mb-12">"{content.intro}"</p>
              
              <div className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                    <Book size={20} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Essential Definitions</h3>
                </div>
                <div className="grid gap-6">
                  {content.concepts.map((c: any, i: number) => (
                    <div key={i} className={`p-8 rounded-[2rem] border transition-all hover:translate-x-2 ${
                      isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-black/5 hover:bg-white hover:shadow-xl'
                    }`}>
                      <p className="font-black text-xl mb-2 tracking-tight">{c.title}</p>
                      <p className="human-label !text-base opacity-60 leading-relaxed">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="app-card !p-12 !rounded-[3.5rem] border-2 border-dashed border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Solved Blueprint Cases</h3>
              </div>
              <div className="space-y-8">
                {content.qa.map((item: any, i: number) => (
                  <div key={i} className="space-y-5 pb-8 border-b border-black/5 dark:border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                       <span className="accent-label !opacity-30 mt-1">QUERY_</span>
                       <p className="font-black text-xl leading-tight tracking-tight">{item.q}</p>
                    </div>
                    <div className="app-card !bg-emerald-500/5 !border-emerald-500/10 !p-8 !rounded-[2rem]">
                       <div className="flex items-center gap-3 mb-3">
                          <span className="accent-label !text-[9px] !text-emerald-600 dark:!text-emerald-400 font-black">OFFICIAL_RESOLUTION</span>
                       </div>
                       <p className="human-label !text-base leading-relaxed opacity-80">{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={startQuiz}
              className={`w-full py-10 rounded-[3rem] font-black text-3xl uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-8 shadow-3xl ${
                isDark ? 'bg-[#D9FF00] text-black hover:bg-[#c2e600]' : 'bg-[#1A1A1A] text-white hover:bg-blue-600 shadow-blue-600/30'
              }`}
            >
              <Zap size={40} strokeWidth={2} /> 
              Engage Assessment
            </button>
          </div>
        ) : (
          <div className="app-card !p-20 !rounded-[4rem] text-center space-y-8 border-dashed border-4 border-black/10 dark:border-white/10">
             <div className="w-24 h-24 bg-black/5 dark:bg-white/5 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto animate-pulse">
                <BookOpen size={48} />
             </div>
             <div className="space-y-4">
                <h3 className="text-4xl font-black tracking-tighter">Content Decrypting...</h3>
                <p className="human-label !text-lg max-w-sm mx-auto opacity-40">System is currently indexing the latest KSEEB curriculum updates for this unit.</p>
             </div>
             <button 
              onClick={startQuiz} 
              className={`px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border-2 ${
                isDark ? 'bg-[#D9FF00] border-[#D9FF00] text-black' : 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20'
              }`}
             >
               Skip to AI Practice
              </button>
          </div>
        )}
      </div>
    );
  }

  if (questions.length > 0 && view === 'quiz') {
    const q = questions[currentIdx];
    return (
      <div className="app-container h-full flex flex-col space-y-12 pb-20 max-w-6xl mx-auto">
        <div className="flex items-center justify-between pt-6">
          <button 
            onClick={onBack} 
            className={`p-5 rounded-2xl font-black flex items-center gap-4 transition-all active:scale-90 border-2 ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5 text-slate-900 shadow-sm'
            }`}
          >
            <ChevronLeft size={24} /> <span className="hidden sm:inline text-xs uppercase tracking-widest">Terminate</span>
          </button>
          
          <div className="flex items-center gap-8">
             <div className="hidden md:flex flex-col items-end gap-1">
                <span className="accent-label !opacity-30">Active Simulation</span>
                <p className={`text-lg font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{quizConfig.chapter}</p>
             </div>
             <div className={`px-10 py-6 rounded-[2rem] font-mono font-black text-2xl flex items-center gap-6 shadow-2xl transition-all border-2 ${
               timeLeft < 60 
                 ? 'bg-rose-600 border-rose-500 text-white animate-pulse' 
                 : (isDark ? 'bg-[#D9FF00] border-[#D9FF00] text-black' : 'bg-[#1A1A1A] border-[#1A1A1A] text-white')
             }`}>
               <Clock size={28} /> {formatTime(timeLeft)}
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`h-2.5 rounded-full overflow-hidden shadow-inner ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              className={`h-full transition-all duration-1000 ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'}`}
            />
          </div>
          <p className="accent-label !text-[10px] !opacity-30 tracking-[0.4em] text-right">
            Progress Sector: {currentIdx + 1} / {questions.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={q.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex-1 app-card !p-16 !rounded-[4rem] flex flex-col justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-8 rounded-full ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'}`} />
                  <span className="accent-label !text-[10px] !opacity-60">{q.conceptTag || 'UNIDENTIFIED_UNIT'}</span>
                </div>
                <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border-2 ${
                  isDark ? 'border-white/5 bg-white/5 text-white' : 'border-black/5 bg-slate-50 text-slate-900'
                }`}>
                   <Target size={20} className={isDark ? 'text-[#D9FF00]' : 'text-blue-600'} />
                   <span className="text-sm font-black uppercase tracking-widest">{q.marks} Mark Weight</span>
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-20 tracking-tighter">
                {q.question}
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {q.type === 'MCQ' && q.options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(q.id, i)}
                    className={`p-10 rounded-[2.5rem] border-4 text-left font-black transition-all flex items-center justify-between gap-8 cursor-pointer group active:scale-95 ${
                      answers[q.id] === i 
                        ? (isDark ? 'border-[#D9FF00] bg-[#D9FF00]/5 text-[#D9FF00]' : 'border-blue-600 bg-blue-50 text-blue-600') 
                        : (isDark ? 'border-white/5 hover:border-white/10 hover:bg-white/5 text-slate-500' : 'border-black/5 hover:border-black/10 hover:bg-slate-50/50 text-slate-500')
                    }`}
                  >
                    <div className="flex items-center gap-8">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all ${
                         answers[q.id] === i 
                           ? (isDark ? 'bg-[#D9FF00] text-black' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/30') 
                           : (isDark ? 'bg-white/10 text-white' : 'bg-white border-2 border-black/5 text-slate-900 shadow-sm')
                       }`}>
                          {String.fromCharCode(64 + (i + 1))}
                       </div>
                       <span className="text-2xl tracking-tighter leading-tight">{opt}</span>
                    </div>
                    <div className={`transition-all duration-500 ${answers[q.id] === i ? 'scale-110 opacity-100' : 'scale-75 opacity-0'}`}>
                       <CheckCircle2 size={36} strokeWidth={2.5} />
                    </div>
                  </button>
                ))}
                
                {q.type === 'FILL' && (
                  <div className="relative group">
                    <input 
                      type="text"
                      autoFocus
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerSelect(q.id, e.target.value)}
                      className={`w-full p-12 rounded-[3rem] font-black text-4xl outline-none border-4 transition-all shadow-2xl tracking-tighter placeholder:opacity-10 ${
                        isDark ? 'bg-white/5 border-white/5 focus:border-[#D9FF00] text-white' : 'bg-slate-50 border-black/5 focus:border-blue-600 text-slate-900 shadow-inner'
                      }`}
                      placeholder="Input Solution..."
                    />
                    <Zap size={48} className="absolute right-12 top-1/2 -translate-y-1/2 opacity-10 group-focus-within:opacity-40 transition-opacity" />
                  </div>
                )}

                {(q.type === 'SHORT' || q.type === 'LONG') && (
                  <div className="space-y-10">
                    <div className="relative group">
                      <textarea 
                        rows={6}
                        autoFocus
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerSelect(q.id, e.target.value)}
                        className={`w-full p-12 rounded-[3.5rem] font-black text-2xl outline-none border-4 transition-all shadow-2xl tracking-tight resize-none leading-relaxed placeholder:opacity-10 ${
                          isDark ? 'bg-white/5 border-white/5 focus:border-[#D9FF00] text-white' : 'bg-slate-50 border-black/5 focus:border-blue-600 text-slate-900 shadow-inner'
                        }`}
                        placeholder="Draft exhaustive resolution..."
                      />
                      <FileText size={64} className="absolute right-12 bottom-12 opacity-5" />
                    </div>
                    
                    <div className="flex items-center justify-between px-10">
                       <div className="flex gap-4">
                         <div className="bg-black/5 dark:bg-white/5 px-4 py-2 rounded-lg">
                           <span className="accent-label !text-[9px] !opacity-40">{answers[q.id]?.length || 0} CHR</span>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="accent-label !text-[9px] !opacity-20 animate-pulse uppercase tracking-[0.3em]">AI Synthesis Ready</span>
                         <Sparkles size={14} className="text-blue-500" />
                       </div>
                    </div>

                    {!evaluation[q.id] ? (
                      <button 
                        onClick={() => evaluateDescriptive(q)}
                        disabled={isEvaluating || !answers[q.id] || answers[q.id].length < 10}
                        className={`w-full py-10 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-6 disabled:opacity-20 shadow-3xl ${
                          isDark ? 'bg-[#D9FF00] text-black hover:bg-[#c2e600]' : 'bg-[#1A1A1A] text-white hover:bg-blue-600 shadow-slate-900/40'
                        }`}
                      >
                         {isEvaluating ? (
                           <>
                             <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}><Brain size={32} /></motion.div>
                             Executing Evaluation...
                           </>
                         ) : (
                           <>
                             <MessageSquare size={32} strokeWidth={2.5} /> Verify via AI Analyst
                           </>
                         )}
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`app-card !p-12 !rounded-[3rem] space-y-8 relative overflow-hidden ${
                          isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-600/10 shadow-2xl shadow-blue-100'
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-2xl" />
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <span className="accent-label !text-[9px] !text-blue-600 dark:!text-blue-400">Heuristic Grade Summary</span>
                              <h4 className="text-2xl font-black tracking-tight leading-none">Diagnostic Result</h4>
                           </div>
                           <div className={`px-10 py-5 rounded-2xl text-2xl font-black shadow-xl ${
                             isDark ? 'bg-[#D9FF00] text-black' : 'bg-blue-600 text-white'
                           }`}>
                              {evaluation[q.id].score} / {q.marks}
                           </div>
                        </div>
                        <p className="human-label !text-xl leading-relaxed italic opacity-80 border-l-4 border-blue-500 truncate h-12" title={evaluation[q.id].feedback}>"{evaluation[q.id].feedback}"</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mt-20 pt-16 border-t border-black/5 dark:border-white/5">
              <button 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className={`px-12 py-8 rounded-[2.25rem] font-black uppercase text-xs tracking-widest disabled:opacity-5 transition-all active:scale-95 border-2 ${
                  isDark ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-slate-50 border-black/5 text-slate-400'
                }`}
              >
                Recall
              </button>
              {currentIdx === questions.length - 1 ? (
                <button 
                  onClick={calculateScore}
                  className={`flex-1 py-8 rounded-[2.25rem] font-black text-2xl uppercase tracking-[0.2em] shadow-3xl transition-all active:scale-95 ${
                    isDark ? 'bg-[#D9FF00] text-black hover:bg-[#c2e600] shadow-lime-500/20' : 'bg-[#1A1A1A] text-white hover:bg-blue-600 shadow-slate-900/40'
                  }`}
                >
                  Archive Mission
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className={`flex-1 py-8 rounded-[2.25rem] font-black text-2xl uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl ${
                    isDark ? 'bg-white text-black hover:bg-slate-100' : 'bg-[#0F172A] text-white shadow-slate-900/40 hover:bg-slate-800'
                  }`}
                >
                  Persist & Advance
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="app-container space-y-20 pb-40 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <header className="text-center space-y-8 pt-10">
        <div className={`inline-flex p-8 rounded-[3rem] mb-4 shadow-2xl relative ${isDark ? 'bg-white/5 border border-white/5' : 'bg-blue-50'}`}>
           <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full animate-ping ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'} opacity-20`} />
           <Brain size={64} className={`${isDark ? 'text-[#D9FF00]' : 'text-blue-600'}`} strokeWidth={1.5} />
        </div>
        <div className="space-y-4">
           <div className="flex items-center justify-center gap-3">
             <div className="h-px w-8 bg-black/10 dark:bg-white/10" />
             <span className="accent-label uppercase tracking-[0.4em]">Proprietary Assessment Lab</span>
             <div className="h-px w-8 bg-black/10 dark:bg-white/10" />
           </div>
           <h1 className="app-heading !text-7xl">Practice Matrix</h1>
           <p className="app-subheading max-w-2xl mx-auto">
             Engineered to simulate the specific rigour of the <span className={isDark ? 'text-[#D9FF00]' : 'text-blue-600 font-black'}>SSLC 2026</span> board exam through neural adaptive questioning.
           </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Hierarchy Selection Tree */}
        <div className="lg:col-span-5 app-card !p-12 !rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-none">
          <div className="flex items-center gap-6 mb-12">
             <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl ${
               isDark ? 'bg-white text-black' : 'bg-[#1A1A1A] text-white'
             }`}>
                <BookOpen size={32} strokeWidth={1.5} />
             </div>
             <div>
                <h2 className="text-3xl font-black tracking-tighter">Inventory</h2>
                <p className="accent-label !text-[9px] !opacity-40">Select Target Subject Content</p>
             </div>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
            {Object.entries(SYLLABUS).map(([key, value]) => {
              const subjectName = key.replace('_', ' ');
              const isExpanded = expandedSubject === subjectName;
              return (
                <div key={key} className="space-y-3">
                   <button 
                    onClick={() => setExpandedSubject(isExpanded ? null : subjectName)}
                    className={`w-full flex items-center justify-between p-6 rounded-3xl font-black text-lg transition-all border-2 ${
                      isExpanded 
                        ? (isDark ? 'bg-white border-white text-black scale-[1.02]' : 'bg-[#0F172A] border-[#0F172A] text-white scale-[1.02]') 
                        : (isDark ? 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10' : 'bg-[#F9F9F9] border-transparent text-slate-600 hover:bg-white hover:border-black/5 shadow-sm')
                    }`}
                   >
                    <span className="tracking-tighter">{subjectName}</span>
                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                      <ChevronRight size={20} strokeWidth={3} />
                    </motion.div>
                   </button>
                   
                   <AnimatePresence>
                     {isExpanded && (
                       <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-2 pl-4"
                       >
                         {(value as any).constructor === Array 
                           ? (value as any).map((c: string) => (
                             <button
                               key={c}
                               onClick={() => setQuizConfig({ ...quizConfig, subject: subjectName, chapter: c })}
                               className={`w-full text-left p-5 rounded-2xl text-sm font-black transition-all flex items-center gap-4 relative group ${
                                 quizConfig.chapter === c && quizConfig.subject === subjectName 
                                  ? (isDark ? 'text-[#D9FF00] bg-[#D9FF00]/5 px-8 translate-x-2' : 'text-blue-600 bg-blue-50/50 px-8 translate-x-2') 
                                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                               }`}
                             >
                                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                  quizConfig.chapter === c && quizConfig.subject === subjectName 
                                    ? (isDark ? 'bg-[#D9FF00] scale-125' : 'bg-blue-600 scale-125') 
                                    : 'bg-slate-300'
                                }`} />
                                <span className="flex-1 truncate">{c}</span>
                                {quizConfig.chapter === c && quizConfig.subject === subjectName && (
                                  <Sparkles size={14} className="shrink-0 animate-pulse" />
                                )}
                             </button>
                           ))
                           : Object.entries(value).map(([cat, chapters]) => (
                              <div key={cat} className="space-y-2 mt-6 first:mt-2">
                                <p className="accent-label !text-[8px] !opacity-30 tracking-[0.4em] px-5 mb-3">{cat}</p>
                                {(chapters as string[]).map(c => (
                                  <button
                                    key={c}
                                    onClick={() => setQuizConfig({ ...quizConfig, subject: subjectName, chapter: c })}
                                    className={`w-full text-left p-5 rounded-2xl text-sm font-black transition-all flex items-center gap-4 relative group ${
                                      quizConfig.chapter === c && quizConfig.subject === subjectName 
                                        ? (isDark ? 'text-[#D9FF00] bg-[#D9FF00]/5 px-8 translate-x-3' : 'text-blue-600 bg-blue-50/50 px-8 translate-x-3') 
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                                  >
                                    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                      quizConfig.chapter === c && quizConfig.subject === subjectName 
                                        ? (isDark ? 'bg-[#D9FF00] scale-125' : 'bg-blue-600 scale-125') 
                                        : 'bg-slate-300'
                                    }`} />
                                    <span className="flex-1 truncate">{c}</span>
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
        <div className="lg:col-span-7 space-y-10">
           <div className="app-card !p-12 !rounded-[3rem] relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${isDark ? 'bg-[#D9FF00]' : 'bg-blue-600'}`} />
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <span className="accent-label">Mission Context</span>
                  <div className="h-px w-10 bg-black/5 dark:bg-white/5" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-5xl font-black tracking-tighter leading-[0.9]">{quizConfig.chapter}</h3>
                  <p className="human-label !text-xl !opacity-60">{quizConfig.subject} Academic Syllabus</p>
                </div>
              </div>
           </div>

           <div className="space-y-6">
              <label className="accent-label px-4 flex items-center gap-3">
                <Target size={14} /> Question Classification
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'MCQ', label: 'MCQ (1M)', icon: Target, desc: 'Conceptual Accuracy' },
                  { id: 'SHORT', label: 'VSA (2-3M)', icon: FileText, desc: 'Precise Analysis' },
                  { id: 'LONG', label: 'LA (4-5M)', icon: Award, desc: 'Synthesized Depth' },
                  { id: 'BOARD_PATTERN', label: 'Full Paper', icon: BookOpen, desc: 'Exam Simulation' }
                ].map(t => (
                   <button 
                    key={t.id}
                    onClick={() => setQuizConfig({ ...quizConfig, type: t.id as any })}
                    className={`app-card !p-6 flex flex-col items-start gap-6 transition-all active:scale-95 border-2 ${
                      quizConfig.type === t.id 
                        ? (isDark ? 'border-[#D9FF00] bg-[#D9FF00]/5 ring-1 ring-[#D9FF00]' : 'border-blue-600 bg-blue-50') 
                        : 'border-transparent'
                    }`}
                   >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      quizConfig.type === t.id 
                        ? (isDark ? 'bg-[#D9FF00] text-black' : 'bg-blue-600 text-white') 
                        : (isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500')
                    }`}>
                      <t.icon size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-black text-xs uppercase tracking-widest">{t.label}</p>
                      <p className="text-[10px] font-medium opacity-40 mt-1">{t.desc}</p>
                    </div>
                   </button>
                ))}
              </div>
           </div>

           <div className="space-y-6">
              <label className="accent-label px-4 flex items-center gap-3">
                <Zap size={14} /> Cognitive Intensity
              </label>
              <div className="grid grid-cols-3 gap-6">
                {['easy', 'medium', 'hard'].map(l => (
                   <button 
                    key={l}
                    onClick={() => setQuizConfig({ ...quizConfig, level: l as any })}
                    className={`py-8 rounded-3xl border-2 font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 ${
                      quizConfig.level === l 
                        ? (isDark ? 'bg-[#D9FF00] border-[#D9FF00] text-black shadow-2xl -translate-y-1' : 'bg-[#0F172A] border-[#0F172A] text-white shadow-2xl shadow-slate-900/40 -translate-y-1') 
                        : (isDark ? 'bg-white/5 border-transparent text-slate-500' : 'bg-white border-black/5 text-slate-400 hover:border-black/20')
                    }`}
                   >
                    {l}
                   </button>
                ))}
              </div>
           </div>

           <div className={`app-card !p-8 !rounded-[2.5rem] flex items-center gap-6 overflow-hidden ${isDark ? 'bg-blue-600 border-blue-600' : 'bg-blue-600 shadow-2xl shadow-blue-600/30'} text-white`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                 <Zap size={32} className="text-white animate-pulse" />
              </div>
              <div className="space-y-1">
                 <p className="font-black text-sm uppercase tracking-widest">Smart Adaptive Engine Active</p>
                 <p className="text-xs opacity-80 font-medium leading-relaxed">
                    AI focuses strictly on verified board patterns to ensure maximum ROI for your study time.
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <button 
                onClick={() => setView('study')}
                className="app-card !p-8 group hover:border-[#D9FF00]/50 transition-all active:scale-95 flex items-center gap-6"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-900'}`}>
                   <Book size={28} />
                </div>
                <div>
                   <p className="font-black text-xl tracking-tighter">Study Guide</p>
                   <p className="accent-label !text-[8px] !opacity-40">Interactive Concepts</p>
                </div>
              </button>

              <button 
                onClick={startQuiz}
                className={`py-8 rounded-[2rem] font-black text-2xl uppercase tracking-[0.2em] transition-all active:scale-95 shadow-3xl text-center ${
                  isDark ? 'bg-[#D9FF00] text-black hover:bg-[#c2e600]' : 'bg-[#1A1A1A] text-white hover:bg-blue-600'
                }`}
              >
                Engage AI Quiz
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
