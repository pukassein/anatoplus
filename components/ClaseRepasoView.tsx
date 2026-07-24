import React from 'react';
import { ArrowLeft, PlayCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface ClaseRepasoViewProps {
  user: User;
  onBack: () => void;
}

const ClaseRepasoView: React.FC<ClaseRepasoViewProps> = ({ user, onBack }) => {
  const isRepasoNew = React.useMemo(() => {
    const publishDate = new Date('2026-07-24T00:00:00Z');
    const today = new Date();
    const diffTime = today.getTime() - publishDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 10 && diffDays >= -1;
  }, []);

  const videos = [
    {
      title: "Repaso 2do Parcial",
      videoUrl: "https://www.youtube.com/embed/jLfNpFSpx-4",
      originalLink: "https://youtu.be/jLfNpFSpx-4",
      description: "Repaso intensivo para el 2do Parcial de Anatomía."
    },
    {
      title: "Clase de Repaso - Parte 1",
      videoUrl: "https://www.youtube.com/embed/VcZnRAnI1Po",
      originalLink: "https://youtu.be/VcZnRAnI1Po",
      description: "Repaso intensivo para el 1er Parcial de Anatomía."
    },
    {
      title: "Clase de Repaso - Parte 2",
      videoUrl: "https://www.youtube.com/embed/GA0HN5Tc3Hk",
      originalLink: "https://youtu.be/GA0HN5Tc3Hk?si=z6Var5EDqaKBjhRg",
      description: "Repaso intensivo para el 1er Parcial de Anatomía."
    }
  ];

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

      <div className="space-y-12">
        {/* Destacado: Repaso 2do Parcial */}
        <div className="space-y-6">
          {isRepasoNew && (
            <div className="flex items-center gap-3">
               <div className="h-px bg-emerald-200 flex-1 dark:bg-emerald-900/50"></div>
               <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm px-4 py-1 bg-emerald-50 rounded-full border border-emerald-200 shadow-sm dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">
                 ¡Lo Nuevo!
               </span>
               <div className="h-px bg-emerald-200 flex-1 dark:bg-emerald-900/50"></div>
            </div>
          )}
          
          <div className="space-y-4 relative">
            {isRepasoNew && (
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-[32px] blur-xl z-0 pointer-events-none"></div>
            )}
            {/* Video Player Container */}
            <div className={`bg-black rounded-2xl overflow-hidden shadow-2xl relative pt-[56.25%] z-10 ${isRepasoNew ? 'ring-4 ring-emerald-400/50' : ''}`}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={videos[0].videoUrl}
                title={videos[0].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            {/* Info Card */}
            <div className={`bg-white rounded-2xl p-6 shadow-xl relative z-10 dark:bg-slate-800 ${isRepasoNew ? 'border-2 border-emerald-200 dark:border-emerald-700/50' : 'border border-gray-200 dark:border-slate-700'}`}>
              {isRepasoNew && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-red-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg animate-bounce">
                   NUEVO
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <PlayCircle className="text-emerald-500" size={28} />
                    {videos[0].title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                    {videos[0].description}
                  </p>
                </div>
                <a
                  href={videos[0].originalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={20} />
                  Ver en YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-8">
           <div className="h-px bg-gray-200 flex-1 dark:bg-slate-700"></div>
           <span className="text-gray-500 font-bold uppercase tracking-wider text-sm px-4 dark:text-gray-400">
             Clases Anteriores
           </span>
           <div className="h-px bg-gray-200 flex-1 dark:bg-slate-700"></div>
        </div>

        {/* Anteriores */}
        {videos.slice(1).map((video, index) => (
          <div key={index} className="space-y-4">
            {/* Video Player Container */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg relative pt-[56.25%]">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={video.videoUrl}
                title={video.title}
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
                    {video.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {video.description}
                  </p>
                </div>
                <a
                  href={video.originalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  <ExternalLink size={18} />
                  Ver en YouTube
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClaseRepasoView;
