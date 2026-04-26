import React from 'react';
import { ArrowLeft, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface SimuladoViewProps {
  user: User;
  onBack: () => void;
}

const SimuladoView: React.FC<SimuladoViewProps> = ({ user, onBack }) => {
  // Configuración del Simulado
  const pdfUrl = "https://opszqrjbygrdmiwgbdyj.supabase.co/storage/v1/object/public/pdf/SIMULADO_new1904.pdf";
  const answersPdfUrl = "https://opszqrjbygrdmiwgbdyj.supabase.co/storage/v1/object/public/pdf/SIMULADO_COMENTADO_AP1.pdf";
  
  const now = new Date();
  const simuladoEndTime = new Date('2026-04-20T01:00:00Z'); // Fin del simulado: 21:00 hs UTC-4
  const showAnswers = true; // Liberated for everyone at any time

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simulado AnatoPlus 1er Parcial</h1>
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
                El SIMULADO ANATOPLUS 1ER PARCIAL es 100% online, compuesto por 25 preguntas de selección múltiple.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                Podes hacerla en el PDF o si preferís, podes imprimirlo y simular como el examen.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                El examen tendrá una duración máxima de 1 hora. Los participantes tendrán desde las 20:00 hs hasta las 21:00 hs para responder las preguntas y mandar las respuestas por medio del formulario electrónico.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                El formulario electrónico quedará disponible para enviar las respuestas durante toda la duración del examen (de 20:00 hs a 21:00 hs).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                ANATOPLUS subirá un PDF con las respuestas explicadas en esta misma plataforma (estará disponible al finalizar el examen).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                Es total responsabilidad del participante verificar previamente la integridad y conectividad de sus aparatos electrónicos.
              </li>
            </ul>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
            <h3 className="font-bold text-indigo-900 mb-2 dark:text-indigo-300">Formulario de Respuestas Cerrado</h3>
            <p className="text-sm text-indigo-700 mb-4 dark:text-indigo-400">
              El tiempo para enviar las respuestas ha finalizado. El formulario ya no acepta nuevas entregas.
            </p>
            <div 
              className="w-full bg-gray-400 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed shadow-md"
            >
              <AlertTriangle size={18} />
              Examen Finalizado
            </div>
          </div>

          {/* Tarjeta de respuestas */}
          <div className={`rounded-2xl p-6 border ${showAnswers ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'}`}>
            <h3 className={`font-bold mb-2 ${showAnswers ? 'text-amber-900 dark:text-amber-300' : 'text-gray-500 dark:text-gray-400'}`}>Respuestas Explicadas</h3>
            {showAnswers ? (
              <>
                <p className="text-sm text-amber-700 mb-4 dark:text-amber-400">
                  Ya puedes revisar las respuestas correctas y sus explicaciones.
                </p>
                <a 
                  href={answersPdfUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                  onClick={(e) => { if (!answersPdfUrl) { e.preventDefault(); alert("El PDF de respuestas aún no se ha subido. Por favor avísale al administrador."); } }}
                >
                  <FileText size={18} />
                  Ver Respuestas
                </a>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                El PDF con las explicaciones estará disponible aquí a las 21:00 hs al finalizar el examen.
              </p>
            )}
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

export default SimuladoView;
