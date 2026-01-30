import React, { useState, useEffect } from 'react';
import { Question, Topic } from '../types';
import { ArrowLeft, HelpCircle, CheckCircle, XCircle, AlertCircle, RefreshCcw, ArrowRight, Eye, EyeOff, Loader2, Save } from 'lucide-react';

interface QuizViewProps {
  topic: Topic;
  questions: Question[];
  onBack: () => void;
  // Updated signature to pass detailed answers
  onComplete: (
      score: number, 
      total: number, 
      answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[]
  ) => Promise<void>;
}

const QuizView: React.FC<QuizViewProps> = ({ topic, questions, onBack, onComplete }) => {
  const [viewState, setViewState] = useState<'QUIZ' | 'SAVING' | 'RESULTS' | 'REVIEW'>('QUIZ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  
  // Track eliminated/crossed-out options for the current question
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);

  // Track all user answers: map question index to selected option index
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  // Initialize answers array
  useEffect(() => {
    if (questions.length > 0 && userAnswers.length === 0) {
      setUserAnswers(new Array(questions.length).fill(null));
    }
  }, [questions]);

  useEffect(() => {
    // Reset local question state when index changes
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setEliminatedOptions([]); // Reset crossed-out options
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleOptionSelect = (index: number) => {
    if (isAnswerChecked) return;
    
    // If selecting an eliminated option, un-eliminate it automatically for better UX
    if (eliminatedOptions.includes(index)) {
        setEliminatedOptions(prev => prev.filter(i => i !== index));
    }
    
    setSelectedOption(index);
  };

  const toggleElimination = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Prevent triggering selection
    if (isAnswerChecked) return;

    setEliminatedOptions(prev => 
        prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const checkAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswerChecked(true);
    
    // Save answer
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = selectedOption;
    setUserAnswers(newAnswers);

    if (selectedOption === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // FINISH QUIZ
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
      setViewState('SAVING');
      
      const finalScore = score + (selectedOption === currentQuestion.correctAnswerIndex ? 1 : 0);
      
      // Prepare detailed history
      const history = questions.map((q, idx) => {
          // If it's the current question (last one), take from current state, else from userAnswers array
          const selectedIdx = idx === currentIndex ? selectedOption : userAnswers[idx];
          return {
              questionId: q.id,
              selectedIndex: selectedIdx !== null ? selectedIdx : -1,
              isCorrect: selectedIdx === q.correctAnswerIndex
          };
      });

      // Send to App/API
      await onComplete(finalScore, questions.length, history);
      
      setViewState('RESULTS');
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrentIndex(0);
    setViewState('QUIZ');
    setUserAnswers(new Array(questions.length).fill(null));
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setEliminatedOptions([]);
  };

  if (!currentQuestion) {
     return (
         <div className="text-center py-20">
             <h2 className="text-xl text-gray-600">No hay preguntas disponibles para este tema aún.</h2>
             <button onClick={onBack} className="mt-4 text-amber-600 font-medium hover:underline">Volver</button>
         </div>
     )
  }

  // Saving State
  if (viewState === 'SAVING') {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
            <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800">Guardando tu progreso...</h2>
            <p className="text-gray-500 mt-2">Registrando tus respuestas en la base de datos.</p>
        </div>
      );
  }

  if (viewState === 'RESULTS') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-amber-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Módulo Completado!</h2>
          <p className="text-gray-500 mb-8">Has finalizado las preguntas de <span className="font-semibold text-amber-600">{topic.name}</span></p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-gray-50 p-4 rounded-xl">
               <span className="block text-sm text-gray-500 uppercase">Puntaje</span>
               <span className="block text-3xl font-bold text-gray-900">{percentage}%</span>
             </div>
             <div className="bg-gray-50 p-4 rounded-xl">
               <span className="block text-sm text-gray-500 uppercase">Correctas</span>
               <span className="block text-3xl font-bold text-gray-900">{score}/{questions.length}</span>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button 
                onClick={() => setViewState('REVIEW')}
                className="px-6 py-3 border-2 border-amber-100 bg-amber-50 text-amber-700 rounded-lg font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
             >
               <Eye size={20} /> Revisar Respuestas
             </button>
             <button 
                onClick={restartQuiz}
                className="px-6 py-3 bg-amber-600 rounded-lg text-white font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 shadow-md"
             >
               <RefreshCcw size={20} /> Reintentar
             </button>
             <button 
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
             >
               Volver al Menú
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'REVIEW') {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in py-8">
        <div className="flex items-center justify-between mb-8">
           <button 
              onClick={() => setViewState('RESULTS')}
              className="flex items-center gap-2 text-gray-600 hover:text-amber-600 font-medium"
           >
              <ArrowLeft size={20} /> Volver a Resultados
           </button>
           <h2 className="text-xl font-bold text-gray-900">Revisión de Respuestas</h2>
        </div>

        <div className="space-y-8">
          {questions.map((q, idx) => {
            const userAnswer = userAnswers[idx];
            const isCorrect = userAnswer === q.correctAnswerIndex;
            // Decide which explanation to show based on correctness
            const explanationHtml = isCorrect ? q.explanationCorrect : q.explanationIncorrect;
            
            return (
              <div key={q.id} className={`bg-white rounded-xl shadow-sm border p-6 ${isCorrect ? 'border-gray-200' : 'border-red-200 bg-red-50/10'}`}>
                <div className="flex items-start gap-3 mb-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{q.text}</h3>
                  </div>
                </div>

                <div className="space-y-2 pl-11">
                  {q.options.map((opt, optIdx) => {
                     const isSelected = userAnswer === optIdx;
                     const isTheCorrectAnswer = q.correctAnswerIndex === optIdx;
                     
                     let optClass = "border-gray-200 bg-gray-50 text-gray-500";
                     if (isTheCorrectAnswer) {
                        optClass = "border-green-500 bg-green-50 text-green-800 font-medium";
                     } else if (isSelected && !isCorrect) {
                        optClass = "border-red-300 bg-red-50 text-red-800";
                     }

                     return (
                       <div key={optIdx} className={`p-3 rounded-lg border ${optClass} flex items-center justify-between`}>
                          <span>{opt}</span>
                          {isTheCorrectAnswer && <CheckCircle size={16} className="text-green-600" />}
                          {isSelected && !isTheCorrectAnswer && <XCircle size={16} className="text-red-500" />}
                       </div>
                     )
                  })}
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 text-sm">
                    <span className="font-semibold text-gray-700">Explicación:</span>
                    <div 
                      className="text-gray-600 mt-1 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: explanationHtml }}
                    />
                    {q.imageUrl && (
                       <div className="mt-3">
                          <img src={q.imageUrl} alt="Explicación visual" className="rounded-lg max-h-60 object-contain border border-gray-200" />
                       </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Logic to determine which explanation to show in LIVE quiz mode
  const currentExplanation = selectedOption === currentQuestion.correctAnswerIndex 
    ? currentQuestion.explanationCorrect 
    : currentQuestion.explanationIncorrect;

  // QUIZ VIEW
  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Salir
        </button>
        <span className="text-sm font-semibold text-amber-600 tracking-wider uppercase">
          {topic.code} - Pregunta {currentIndex + 1} de {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
        <div 
          className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-900 leading-relaxed mb-8">
            {currentQuestion.text}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isEliminated = eliminatedOptions.includes(idx);
              let optionClass = "border-gray-200 hover:border-amber-300 hover:bg-amber-50";
              let resultIcon = null;

              if (isAnswerChecked) {
                if (idx === currentQuestion.correctAnswerIndex) {
                  optionClass = "border-green-500 bg-green-50 text-green-800";
                  resultIcon = <CheckCircle size={20} className="text-green-600" />;
                } else if (idx === selectedOption) {
                  optionClass = "border-red-300 bg-red-50 text-red-800";
                  resultIcon = <XCircle size={20} className="text-red-500" />;
                } else {
                   optionClass = "border-gray-100 opacity-50";
                }
              } else {
                  if (selectedOption === idx) {
                    optionClass = "border-amber-500 bg-amber-50 ring-1 ring-amber-500";
                  } else if (isEliminated) {
                    optionClass = "border-gray-200 bg-gray-50 opacity-60";
                  }
              }

              return (
                <div 
                  key={idx}
                  onClick={() => !isAnswerChecked && handleOptionSelect(idx)}
                  className={`w-full relative text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group cursor-pointer ${optionClass}`}
                >
                  <span className={`flex items-center gap-3 ${isEliminated && !isAnswerChecked && selectedOption !== idx ? 'line-through decoration-gray-400 decoration-2 text-gray-400' : ''}`}>
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0 ${
                        isAnswerChecked && idx === currentQuestion.correctAnswerIndex ? 'bg-green-200 text-green-700' : 
                        selectedOption === idx ? 'bg-amber-200 text-amber-800' :
                        'bg-gray-100 text-gray-500 group-hover:bg-white'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium leading-snug">{option}</span>
                  </span>
                  
                  {/* Right side icons */}
                  <div className="flex items-center gap-2">
                      {!isAnswerChecked && (
                          <button
                            onClick={(e) => toggleElimination(e, idx)}
                            className={`p-2 rounded-full transition-colors z-10 ${
                                isEliminated 
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                                : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
                            }`}
                            title={isEliminated ? "Restaurar opción" : "Descartar opción"}
                          >
                             {isEliminated ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                      )}
                      {resultIcon}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500 hidden sm:block">
              {isAnswerChecked ? (
                 selectedOption === currentQuestion.correctAnswerIndex ? 
                 <span className="text-green-600 font-bold">¡Correcto!</span> : 
                 <span className="text-red-500 font-bold">Incorrecto</span>
              ) : (
                <span>Selecciona una opción</span>
              )}
            </div>

            {!isAnswerChecked ? (
              <button
                disabled={selectedOption === null}
                onClick={checkAnswer}
                className={`px-8 py-3 rounded-lg font-bold transition-all transform ${
                  selectedOption !== null 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Comprobar
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                {currentIndex === questions.length - 1 ? (
                    <>Finalizar <Save size={18} /></>
                ) : (
                    <>Siguiente <ArrowRight size={18}/></>
                )}
              </button>
            )}
        </div>

        {/* Explanation */}
        {isAnswerChecked && (
          <div className="bg-blue-50 p-6 border-t border-blue-100 animate-slide-up">
            <div className="flex gap-3">
               <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={24} />
               <div className="w-full">
                 <h4 className="font-bold text-blue-900 mb-1">Explicación</h4>
                 <div 
                   className="text-blue-800 text-sm leading-relaxed prose prose-sm max-w-none"
                   dangerouslySetInnerHTML={{ __html: currentExplanation }}
                 />
                 {currentQuestion.imageUrl && (
                    <div className="mt-3">
                        <img src={currentQuestion.imageUrl} alt="Explicación visual" className="rounded-lg max-h-60 object-contain border border-blue-200" />
                    </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;