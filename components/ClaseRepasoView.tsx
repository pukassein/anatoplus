import React from 'react';
import { ArrowLeft, PlayCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface ClaseRepasoViewProps {
  user: User;
  onBack: () => void;
}

const ClaseRepasoView: React.FC<ClaseRepasoViewProps> = ({ user, onBack }) => {
  const videos = [
    {
      title: "Clase de Repaso - Parte 1",
      videoUrl: "https://www.youtube.com/embed/VcZnRAnI1Po",
      originalLink: "https://youtu.be/VcZnRAnI1Po"
    },
    {
      title: "Clase de Repaso - Parte 2",
      videoUrl: "https://www.youtube.com/embed/GA0HN5Tc3Hk",
      originalLink: "https://youtu.be/GA0HN5Tc3Hk?si=z6Var5EDqaKBjhRg"
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
        {videos.map((video, index) => (
          <div key={index} className="space-y-4">
            {/* Video Player Container */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl relative pt-[56.25%]">
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
                    Repaso intensivo para el 1er Parcial de Anatomía.
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
