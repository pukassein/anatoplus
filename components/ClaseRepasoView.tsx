import React from 'react';
import { ArrowLeft, PlayCircle, FileText, Download, Sparkles } from 'lucide-react';
import { User } from '../types';

interface ClaseRepasoViewProps {
  user: User;
  onBack: () => void;
}

const ClaseRepasoView: React.FC<ClaseRepasoViewProps> = ({ user, onBack }) => {
  const repaso3PdfUrl = 'https://opszqrjbygrdmiwgbdyj.supabase.co/storage/v1/object/public/pdf/REPASO%20ANATOPLUS%203p.pdf';

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Repasos</h1>
          <p className="text-gray-500 dark:text-gray-400">Material intensivo de Anatomía</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Destacado: Repaso 3 */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-px bg-emerald-200 flex-1 dark:bg-emerald-900/50"></div>
             <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm px-4 py-1 bg-emerald-50 rounded-full border border-emerald-200 shadow-sm dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">
               ¡Nuevo Repaso!
             </span>
             <div className="h-px bg-emerald-200 flex-1 dark:bg-emerald-900/50"></div>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 shadow-xl md:p-9">
            <div className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 shadow-md">NUEVO</div>
            <Sparkles className="absolute -bottom-8 -right-5 h-48 w-48 text-white/10" />
            <div className="relative max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur-sm"><FileText size={16} /> Material de repaso en PDF</span>
              <h2 className="mt-5 text-3xl font-black md:text-4xl">Repaso AnatoPlus 3</h2>
              <p className="mt-3 text-base leading-relaxed text-emerald-50 md:text-lg">Ya puedes consultar el nuevo material de repaso o descargarlo para estudiar sin conexión.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href={repaso3PdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-emerald-700 shadow-lg transition-colors hover:bg-emerald-50">
                  <FileText size={20} /> Ver PDF
                </a>
                <a href={repaso3PdfUrl} download="Repaso-AnatoPlus-3.pdf" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                  <Download size={20} /> Descargar PDF
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-black pt-[56.25%] shadow-lg">
              <iframe
                className="absolute left-0 top-0 h-full w-full"
                src="https://www.youtube.com/embed/QfBjp-QEKCQ"
                title="Repaso 3er Parcial - Parte 1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <PlayCircle className="text-emerald-500" size={24} />
                Repaso 3er Parcial - Parte 1
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Primera parte del repaso intensivo para el 3er Parcial de Anatomía.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-8">
           <div className="h-px bg-gray-200 flex-1 dark:bg-slate-700"></div>
           <span className="text-gray-500 font-bold uppercase tracking-wider text-sm px-4 dark:text-gray-400">
             Repasos anteriores
           </span>
           <div className="h-px bg-gray-200 flex-1 dark:bg-slate-700"></div>
        </div>

        {/* Repasos anteriores */}
        {videos.map((video, index) => (
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
                {index === 0 && (
                  <a
                    href="https://opszqrjbygrdmiwgbdyj.supabase.co/storage/v1/object/public/pdf/REPASO%20ANATOPLUS%202DO%20PARCIAL.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                  >
                    <FileText size={19} /> Ver / Descargar PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClaseRepasoView;
