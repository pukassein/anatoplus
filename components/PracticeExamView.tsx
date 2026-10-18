import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, RefreshCcw, XCircle } from 'lucide-react';
import simulado3Source from '../anatojson.md?raw';

interface PracticeExamViewProps {
  onBack: () => void;
}

interface PracticeQuestion {
  externalId: string;
  order: number;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

const questions = (JSON.parse(simulado3Source).exam.questions as PracticeQuestion[])
  .sort((a, b) => a.order - b.order);

const PracticeExamView: React.FC<PracticeExamViewProps> = ({ onBack }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);

  const question = questions[index];
  const selected = answers[question.externalId];
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => questions.filter(item => answers[item.externalId] === item.correctOptionId).length,
    [answers]
  );

  const choose = (optionId: string) => {
    if (selected) return;
    setAnswers(current => ({ ...current, [question.externalId]: optionId }));
  };

  const reset = () => {
    setAnswers({});
    setIndex(0);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 sticky top-0 z-10 bg-gray-50 dark:bg-slate-900 py-3">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
          <ArrowLeft size={20} /> Cambiar modo
        </button>
        <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          Modo práctica · {correctCount} correctas de {answeredCount} respondidas
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px] gap-6">
        <main className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 md:p-7 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pregunta {index + 1} de {questions.length}</p>
          <h1 className="text-xl font-semibold my-5 text-gray-900 dark:text-white">{question.text}</h1>

          <div className="space-y-3">
            {question.options.map(option => {
              const isCorrect = option.id === question.correctOptionId;
              const isSelected = option.id === selected;
              let optionStyle = 'border-gray-200 hover:border-amber-400 dark:border-slate-600 dark:text-gray-200';

              if (selected && isCorrect) optionStyle = 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200';
              else if (selected && isSelected) optionStyle = 'border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200';
              else if (selected) optionStyle = 'border-gray-200 text-gray-400 dark:border-slate-700 dark:text-gray-500';

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={Boolean(selected)}
                  onClick={() => choose(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${optionStyle} disabled:cursor-default`}
                >
                  <span className="font-bold mr-3">{option.id}.</span>{option.text}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className={`mt-5 rounded-xl border p-4 ${selected === question.correctOptionId ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' : 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'}`}>
              <div className={`font-bold flex items-center gap-2 ${selected === question.correctOptionId ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {selected === question.correctOptionId ? <CheckCircle size={20} /> : <XCircle size={20} />}
                {selected === question.correctOptionId ? '¡Respuesta correcta!' : `Respuesta incorrecta. La correcta es ${question.correctOptionId}.`}
              </div>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{question.explanation}</p>
            </div>
          )}

          <div className="flex justify-between mt-7">
            <button
              disabled={index === 0}
              onClick={() => setIndex(value => value - 1)}
              className="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 disabled:opacity-30"
            >
              <ArrowLeft size={18} /> Anterior
            </button>
            <button
              disabled={index === questions.length - 1}
              onClick={() => setIndex(value => value + 1)}
              className="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-200 disabled:opacity-30"
            >
              Siguiente <ArrowRight size={18} />
            </button>
          </div>
        </main>

        <aside className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 h-fit shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Preguntas</h2>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((item, itemIndex) => {
              const answer = answers[item.externalId];
              const stateStyle = answer
                ? answer === item.correctOptionId
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300';

              return (
                <button
                  key={item.externalId}
                  onClick={() => setIndex(itemIndex)}
                  className={`h-9 rounded-lg text-sm ${stateStyle} ${itemIndex === index ? 'ring-2 ring-amber-500' : ''}`}
                >
                  {itemIndex + 1}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Verde: correcta · Rojo: incorrecta
          </p>

          {answeredCount === questions.length && (
            <div className="mt-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
              <p className="font-bold text-amber-900 dark:text-amber-200">Práctica completada</p>
              <p className="text-2xl font-black text-amber-600 my-2">{correctCount}/{questions.length}</p>
              <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg">
                <RefreshCcw size={16} /> Repetir práctica
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default PracticeExamView;
