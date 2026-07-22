import React from 'react';
import { ArrowLeft, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface Simulado2ViewProps {
  user: User;
  onBack: () => void;
}

const Simulado2View: React.FC<Simulado2ViewProps> = ({ user, onBack }) => {
  // Configuración del Simulado 2
  const pdfUrl = "https://opszqrjbygrdmiwgbdyj.supabase.co/storage/v1/object/public/pdf/SIMULADO%20ANATOPLUS%202DO%20PARCIAL.pdf";
  const answersPdfUrl = "https://opszqrjbygrdmiwgbdyj.supabase.co/storage/v1/object/public/pdf/SIMULADO%20COMENTADO%20AP2.pdf";
  const formsUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfyWmHB3Dx5pvka3QWBlxJEr0vQTFomqwpPb2TWNJ20Kfhylw/viewform?usp=send_form";

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-slate-800 dark:text-gray-300"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simulado AnatoPlus 2do Parcial</h1>
          <p className="text-gray-500 dark:text-gray-400">Evaluación Cronometrada</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de Instrucciones */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
              <AlertTriangle className="text-amber-500" size={20} />
              Instrucciones Importantes
            </h2>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                El SIMULADO ANATOPLUS 2DO PARCIAL es 100% online, compuesto por preguntas de selección múltiple.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                Podes hacerla en el PDF o si preferís, podes imprimirlo y simular como el examen.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                Abre el formulario de abajo para enviar tus respuestas.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                ANATOPLUS subirá un PDF con las respuestas explicadas en esta misma plataforma luego del examen.
              </li>
            </ul>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
            <h3 className="font-bold text-indigo-900 mb-2 dark:text-indigo-300">Formulario de Respuestas</h3>
            <p className="text-sm text-indigo-700 mb-4 dark:text-indigo-400">
              Usa este formulario de Google para enviar tus respuestas.
            </p>
            <a 
              href={formsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <ExternalLink size={18} />
              Abrir Formulario
            </a>
          </div>

          {/* Tarjeta de respuestas */}
          <div className="rounded-2xl p-6 border bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <h3 className="font-bold mb-2 text-amber-900 dark:text-amber-300">Respuestas Explicadas</h3>
            <p className="text-sm text-amber-700 mb-4 dark:text-amber-400">
              Ya puedes revisar las respuestas correctas y sus explicaciones.
            </p>
            <a 
              href={answersPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <FileText size={18} />
              Ver Respuestas
            </a>
          </div>

        </div>

        {/* Columna del PDF */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[800px] dark:bg-slate-800 dark:border-slate-700">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center dark:bg-slate-800/50 dark:border-slate-700">
            <h2 className="font-bold text-gray-700 flex items-center gap-2 dark:text-gray-300">
              <FileText size={18} />
              Documento del Examen
            </h2>
            <a 
              href={pdfUrl} 
              download 
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Descargar PDF
            </a>
          </div>
          <div className="flex-1 bg-gray-200 dark:bg-slate-900 relative">
            <iframe 
              src={`${pdfUrl}#toolbar=0`} 
              className="w-full h-full border-none"
              title="Simulado PDF"
            />
            {/* Fallback for browsers that don't support iframe PDF rendering well */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
               <p className="bg-white p-4 rounded shadow">Si no puedes ver el PDF, descárgalo usando el botón de arriba.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulado2View;
