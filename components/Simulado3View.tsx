import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, ExternalLink, FileText, Info } from 'lucide-react';
import ExamView from './ExamView';
import PracticeExamView from './PracticeExamView';

interface Simulado3ViewProps {
  onBack: () => void;
}

const PDF_URL = 'https://opszqrjbygrdmiwgbdyj.supabase.co/storage/v1/object/public/pdf/SIMULADO%20AP3%20COMENTADO.pdf';

const Simulado3View: React.FC<Simulado3ViewProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'choose' | 'exam' | 'practice' | null>(null);

  if (mode === 'exam') {
    return <ExamView slug="simulado-anatoplus-3" onBack={() => setMode('choose')} />;
  }

  if (mode === 'practice') {
    return <PracticeExamView onBack={() => setMode('choose')} />;
  }

  if (mode === 'choose') {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
        <button onClick={() => setMode(null)} className="flex items-center gap-2 text-gray-500 dark:text-gray-300 mb-6">
          <ArrowLeft size={20} /> Volver al documento
        </button>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">¿Cómo quieres resolver el Simulado 3?</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Elige el modo que prefieras antes de comenzar.</p>

          <div className="grid md:grid-cols-2 gap-5 mt-8">
            <button
              type="button"
              onClick={() => setMode('exam')}
              className="text-left rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 p-6 transition-colors"
            >
              <Clock className="text-indigo-600 dark:text-indigo-400 mb-4" size={34} />
              <h2 className="text-xl font-bold text-indigo-950 dark:text-indigo-200">Modo examen</h2>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 mt-2">
                Responde las 30 preguntas con un límite de 90 minutos. No verás las respuestas correctas durante el intento.
              </p>
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mt-4">Este modo utiliza tu intento oficial.</p>
            </button>

            <button
              type="button"
              onClick={() => setMode('practice')}
              className="text-left rounded-2xl border-2 border-green-200 hover:border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-6 transition-colors"
            >
              <CheckCircle className="text-green-600 dark:text-green-400 mb-4" size={34} />
              <h2 className="text-xl font-bold text-green-950 dark:text-green-200">Práctica con corrección inmediata</h2>
              <p className="text-sm text-green-800 dark:text-green-300 mt-2">
                Elige una respuesta y sabrás al instante si es correcta, junto con la explicación completa.
              </p>
              <p className="text-xs font-bold text-green-700 dark:text-green-400 mt-4">Sin límite de tiempo y sin consumir intentos.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-slate-800 dark:text-gray-300"
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simulado AnatoPlus 3</h1>
          <p className="text-gray-500 dark:text-gray-400">Simulado comentado y formulario de respuestas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
              <Info className="text-amber-500" size={20} />
              Instrucciones
            </h2>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                Revisa el Simulado AnatoPlus 3 comentado en el documento.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                Puedes verlo aquí o descargarlo para estudiar sin conexión.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                Abre el formulario para responder el simulado directamente en AnatoPlus.
              </li>
            </ul>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
            <h3 className="font-bold text-indigo-900 mb-2 dark:text-indigo-300">Formulario de Respuestas</h3>
            <p className="text-sm text-indigo-700 mb-4 dark:text-indigo-400">
              Responde el examen completo y envía tus respuestas desde AnatoPlus.
            </p>
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <ExternalLink size={18} />
              Abrir Formulario de Respuestas
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[800px] dark:bg-slate-800 dark:border-slate-700">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center dark:bg-slate-800/50 dark:border-slate-700">
            <h2 className="font-bold text-gray-700 flex items-center gap-2 dark:text-gray-300">
              <FileText size={18} />
              Simulado 3 Comentado
            </h2>
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Descargar PDF
            </a>
          </div>
          <div className="flex-1 bg-gray-200 dark:bg-slate-900 relative">
            <iframe
              src={`${PDF_URL}#toolbar=0`}
              className="w-full h-full border-none"
              title="Simulado AnatoPlus 3 comentado"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
              <p className="bg-white p-4 rounded shadow">Si no puedes ver el PDF, descárgalo usando el botón de arriba.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulado3View;
