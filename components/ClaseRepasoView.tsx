import React from 'react';
import { ArrowLeft, PlayCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface ClaseRepasoViewProps {
  user: User;
  onBack: () => void;
}

const ClaseRepasoView: React.FC<ClaseRepasoViewProps> = ({ user, onBack }) => {
  // Update this link later
  const videoUrl = "https://www.youtube.com/embed/5c3Pp-b7uwc";
  const originalLink = "https://www.youtube.com/watch?v=5c3Pp-b7uwc";

  // Extra security check (though handled by Dashboard)
  if (user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 dark:bg-red-900/20 dark:border-red-900">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2 dark:text-red-400">Acceso Restringido</h2>
          <p className="text-red-700 dark:text-red-300">
            Esta sección solo está disponible actualmente para administradores.
          </p>
          <button
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver al Dashboard
          </button>
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
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clase de Repaso</h1>
          <p className="text-gray-500 dark:text-gray-400">Sesión Intensiva de Anatomía</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Video Player Container */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl relative pt-[56.25%]">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={videoUrl}
            title="Clase de Repaso"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PlayCircle className="text-emerald-500" size={24} />
                Repaso 1er Parcial
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visualización exclusiva para administradores (Fase de Pruebas).
              </p>
            </div>
            <a
              href={originalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 dark:bg-emerald-900/30 dark:text-emerald-400"
            >
              <ExternalLink size={18} />
              Ver en YouTube
            </a>
          </div>
        </div>

        {/* Admin Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 dark:bg-amber-900/10 dark:border-amber-800">
          <h3 className="font-bold text-amber-900 dark:text-amber-400 mb-2 flex items-center gap-2">
            <AlertCircle size={20} />
            Nota para el Administrador
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Este reproductor está configurado con un video de ejemplo. Próximamente habilitaremos la opción para que los estudiantes premium también puedan acceder a las sesiones en vivo y grabadas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaseRepasoView;
