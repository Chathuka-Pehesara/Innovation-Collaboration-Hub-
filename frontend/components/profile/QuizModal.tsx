import React, { useState, useEffect } from 'react';
import { generateQuiz, evaluateQuiz } from '@/lib/api/profileApi';
import Toast from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, BrainCircuit, Sparkles, AlertCircle } from 'lucide-react';

interface QuizModalProps {
  skillName: string;
  onClose: () => void;
  onSuccess: (skill: any, score: number) => void;
}

export default function QuizModal({ skillName, onClose, onSuccess }: QuizModalProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number; total: number } | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [skillName]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await generateQuiz(skillName);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(-1));
      } else {
        setToast({ message: 'No questions generated', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Failed to generate quiz', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQIndex] = optIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.includes(-1)) {
      setToast({ message: 'Please answer all questions', type: 'error' });
      return;
    }
    
    try {
      setEvaluating(true);
      const result = await evaluateQuiz(skillName, answers);
      setQuizResult(result);
      
      if (result.passed) {
        setTimeout(() => onSuccess(result.skill, result.score), 2500); // Wait for success animation
      } else {
        setTimeout(() => onClose(), 4000); // Close after 4s on fail
      }
    } catch (err) {
      setToast({ message: 'Failed to evaluate quiz', type: 'error' });
      setEvaluating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={evaluating || quizResult ? undefined : onClose}
        />
        
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-xl bg-orange-50/95 backdrop-blur-xl border border-orange-200 rounded-2xl shadow-2xl shadow-orange-900/20 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <BrainCircuit className="w-12 h-12 text-orange-500 mb-6" />
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.2 }}
                className="text-orange-900 text-lg font-bold tracking-wide"
              >
                Generating AI Assessment...
              </motion.p>
              <p className="text-sm text-orange-700/80 mt-2">Tailoring questions for {skillName}</p>
            </div>
          ) : quizResult ? (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1, rotate: quizResult.passed ? [0, 15, -15, 0] : 0 }}
                 transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                 className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                   quizResult.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                 }`}
               >
                 {quizResult.passed ? <CheckCircle className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
               </motion.div>
               <motion.h3 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-2xl font-bold text-orange-950 mb-2"
               >
                 {quizResult.passed ? 'Skill Validated!' : 'Assessment Failed'}
               </motion.h3>
               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="text-orange-900/80"
               >
                 You scored <span className={`font-bold ${quizResult.passed ? 'text-emerald-600' : 'text-red-600'}`}>{quizResult.score}/{quizResult.total}</span>.
                 {quizResult.passed 
                   ? ' Awesome job! The skill is being added to your profile.' 
                   : ' You need at least 3 correct answers to pass. Try again later.'}
               </motion.p>
               
               {quizResult.passed && (
                 <motion.div 
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ delay: 0.6, type: "spring" }}
                   className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 font-bold text-sm"
                 >
                   <Sparkles className="w-4 h-4" />
                   Earned {quizResult.score * 10} XP
                 </motion.div>
               )}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-5 border-b border-orange-200 flex justify-between items-center bg-white/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <BrainCircuit className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-orange-950 leading-tight">Skill Validation</h2>
                    <p className="text-xs text-orange-700/80 font-bold uppercase tracking-wider">{skillName}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="text-orange-900/50 hover:text-orange-900 transition-colors p-2 rounded-xl hover:bg-orange-500/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 w-full bg-orange-200/50 relative">
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQIndex) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-6 relative min-h-[250px] overflow-hidden">
                <AnimatePresence mode="wait">
                  {questions[currentQIndex] && (
                    <motion.div
                      key={currentQIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-bold text-orange-950 leading-relaxed">
                        <span className="text-orange-500 mr-2 text-sm font-extrabold">Q{currentQIndex + 1}.</span>
                        {questions[currentQIndex].question}
                      </h3>
                      <div className="space-y-3">
                        {questions[currentQIndex].options.map((opt: string, idx: number) => {
                          const isSelected = answers[currentQIndex] === idx;
                          return (
                            <motion.button
                              whileHover={{ scale: 1.01, x: 4 }}
                              whileTap={{ scale: 0.99 }}
                              key={idx}
                              onClick={() => handleSelectOption(idx)}
                              className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                                isSelected
                                  ? 'bg-orange-500/10 border-orange-500 text-orange-900 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                                  : 'bg-white border-orange-200/60 text-orange-950/80 hover:bg-orange-50/50 hover:border-orange-300'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-5 border-t border-orange-200 flex justify-between items-center bg-white/60 backdrop-blur-md">
                <button
                  onClick={handlePrev}
                  disabled={currentQIndex === 0 || evaluating}
                  className="px-4 py-2 text-sm font-bold text-orange-900/50 hover:text-orange-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                
                {currentQIndex === questions.length - 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={evaluating || answers.includes(-1)}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                  >
                    {evaluating ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {evaluating ? 'Evaluating...' : 'Submit Assessment'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-800 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                  >
                    Next Question
                  </motion.button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
